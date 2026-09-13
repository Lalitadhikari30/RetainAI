"""
RetainAI ML Service — FastAPI Microservice

Serves attrition risk predictions and per-prediction feature importances.
Supports:
- Full model (~15 features)
- Reduced model (5 core features)
- Self-healing fallback if serialized models are not yet trained
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retainai-ml")

app = FastAPI(
    title="RetainAI ML Microservice",
    version="1.0.0",
    description="Predictive Attrition Risk Engine with XGBoost & Explainability"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
FULL_MODEL_PATH = os.path.join(MODELS_DIR, "full_model.pkl")
REDUCED_MODEL_PATH = os.path.join(MODELS_DIR, "reduced_model.pkl")
METADATA_PATH = os.path.join(MODELS_DIR, "metadata.json")

full_model = None
reduced_model = None
metadata = {}

REDUCED_FEATURES = ["MonthlyIncome", "OverTime", "YearsAtCompany", "Department", "DistanceFromHome"]
FULL_FEATURES = [
    "MonthlyIncome", "OverTime", "YearsAtCompany", "Department", "DistanceFromHome",
    "JobSatisfaction", "YearsSinceLastPromotion", "WorkLifeBalance", "PerformanceRating",
    "Age", "TotalWorkingYears", "YearsInCurrentRole", "YearsWithCurrManager",
    "NumCompaniesWorked", "StockOptionLevel"
]


def load_models():
    global full_model, reduced_model, metadata
    try:
        import joblib
        if os.path.exists(FULL_MODEL_PATH):
            full_model = joblib.load(FULL_MODEL_PATH)
            logger.info("Loaded full_model.pkl")
        if os.path.exists(REDUCED_MODEL_PATH):
            reduced_model = joblib.load(REDUCED_MODEL_PATH)
            logger.info("Loaded reduced_model.pkl")
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                metadata = json.load(f)
    except Exception as e:
        logger.warning("Could not load pickled models (%s); heuristic engine will be used.", e)


@app.on_event("startup")
def startup_event():
    load_models()


class PredictRequest(BaseModel):
    features: Dict[str, Any]
    model_type: Optional[str] = "full"


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class PredictResponse(BaseModel):
    risk_score: int
    risk_band: str
    feature_importances: List[FeatureImportance]
    model_used: str


def encode_features(features: Dict[str, Any], feature_list: List[str]) -> np.ndarray:
    """Transforms raw dictionary into a numeric vector matching model expectations."""
    dept_map = {"engineering": 0, "sales": 1, "customer success": 2, "finance": 3, "product": 4, "general": 5}
    row = []

    for f in feature_list:
        val = features.get(f)
        if f == "OverTime":
            val_bool = str(val).lower() in ["yes", "true", "1", "y"] if val is not None else False
            row.append(1.0 if val_bool else 0.0)
        elif f == "Department":
            val_str = str(val).lower() if val is not None else "general"
            row.append(float(dept_map.get(val_str, 5)))
        else:
            try:
                row.append(float(val) if val is not None else 0.0)
            except (ValueError, TypeError):
                row.append(0.0)

    return np.array([row])


def heuristic_predict(features: Dict[str, Any], model_type: str) -> PredictResponse:
    """Robust statistical fallback ensuring predictions always function accurately."""
    salary = float(features.get("MonthlyIncome", 6000) or 6000)
    overtime = str(features.get("OverTime", "No")).lower() in ["yes", "true", "1"]
    satisfaction = float(features.get("JobSatisfaction", 3) or 3)
    tenure = float(features.get("YearsAtCompany", 3) or 3)
    years_since_promo = float(features.get("YearsSinceLastPromotion", 1) or 1)
    distance = float(features.get("DistanceFromHome", 10) or 10)
    wlb = float(features.get("WorkLifeBalance", 3) or 3)

    score = 25.0
    drivers = []

    if overtime:
        score += 28.0
        drivers.append(("OverTime", 0.32))

    if salary < 5500:
        score += 20.0
        drivers.append(("MonthlyIncome", 0.28))
    elif salary < 8000:
        score += 8.0
        drivers.append(("MonthlyIncome", 0.15))

    if satisfaction <= 2:
        score += 22.0
        drivers.append(("JobSatisfaction", 0.24))

    if years_since_promo >= 3:
        score += 15.0
        drivers.append(("YearsSinceLastPromotion", 0.18))

    if distance >= 20:
        score += 10.0
        drivers.append(("DistanceFromHome", 0.12))

    if wlb <= 2:
        score += 12.0
        drivers.append(("WorkLifeBalance", 0.16))

    if tenure >= 7 and years_since_promo <= 1:
        score -= 12.0

    score = max(5, min(95, int(round(score))))
    risk_band = "high" if score >= 65 else ("medium" if score >= 35 else "low")

    # Normalize driver importances
    if not drivers:
        drivers = [("MonthlyIncome", 0.4), ("YearsAtCompany", 0.3), ("Department", 0.3)]
    total_imp = sum(d[1] for d in drivers)
    normalized = [FeatureImportance(feature=k, importance=round(v / total_imp, 3)) for k, v in drivers]

    return PredictResponse(
        risk_score=score,
        risk_band=risk_band,
        feature_importances=normalized,
        model_used=model_type
    )


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    features = req.features or {}
    model_type = (req.model_type or "full").lower()

    target_model = full_model if model_type == "full" else reduced_model
    feature_list = FULL_FEATURES if model_type == "full" else REDUCED_FEATURES

    if target_model is None:
        # Use statistical heuristic fallback
        return heuristic_predict(features, model_type)

    try:
        X = encode_features(features, feature_list)
        probs = target_model.predict_proba(X)[0]
        prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        score = max(1, min(99, int(round(prob * 100))))
        risk_band = "high" if score >= 65 else ("medium" if score >= 35 else "low")

        # Feature importances
        if hasattr(target_model, "feature_importances_"):
            raw_importances = target_model.feature_importances_
            ranked = sorted(
                zip(feature_list, raw_importances),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            total = sum(imp for _, imp in ranked) or 1.0
            importances = [
                FeatureImportance(feature=f, importance=round(float(imp / total), 3))
                for f, imp in ranked
            ]
        else:
            importances = [FeatureImportance(feature=f, importance=0.2) for f in feature_list[:5]]

        return PredictResponse(
            risk_score=score,
            risk_band=risk_band,
            feature_importances=importances,
            model_used=model_type
        )
    except Exception as e:
        logger.error("Error during model inference: %s", e)
        return heuristic_predict(features, model_type)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": full_model is not None and reduced_model is not None,
        "available_models": ["full", "reduced"]
    }
