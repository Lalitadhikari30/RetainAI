"""
RetainAI ML Service — Model Training Script

Trains two models on HR attrition data (IBM HR Analytics dataset schema):
1. Full Model (~15+ features): Used when full HRIS data is available
2. Reduced Model (5 core features): Used when minimal CSV export is uploaded

Saves serialized models and feature metadata into models/ directory.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

# Core features for reduced model
REDUCED_FEATURES = [
    "MonthlyIncome",
    "OverTime",
    "YearsAtCompany",
    "Department",
    "DistanceFromHome"
]

# Features for full model
FULL_FEATURES = [
    "MonthlyIncome",
    "OverTime",
    "YearsAtCompany",
    "Department",
    "DistanceFromHome",
    "JobSatisfaction",
    "YearsSinceLastPromotion",
    "WorkLifeBalance",
    "PerformanceRating",
    "Age",
    "TotalWorkingYears",
    "YearsInCurrentRole",
    "YearsWithCurrManager",
    "NumCompaniesWorked",
    "StockOptionLevel"
]


def generate_synthetic_ibm_hr_dataset(n_samples=2500, random_state=42):
    """
    Generates synthetic HR dataset closely reflecting IBM HR Analytics Attrition distributions.
    """
    np.random.seed(random_state)

    departments = np.random.choice(["Engineering", "Sales", "Customer Success", "Finance", "Product", "General"], size=n_samples, p=[0.35, 0.25, 0.15, 0.1, 0.1, 0.05])
    over_time = np.random.choice(["Yes", "No"], size=n_samples, p=[0.30, 0.70])
    monthly_income = np.random.lognormal(mean=8.7, sigma=0.55, size=n_samples).astype(int)
    monthly_income = np.clip(monthly_income, 2500, 25000)

    years_at_company = np.random.exponential(scale=5.0, size=n_samples).astype(int)
    distance_from_home = np.random.gamma(shape=2, scale=5, size=n_samples).astype(int) + 1
    distance_from_home = np.clip(distance_from_home, 1, 60)

    job_satisfaction = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.15, 0.25, 0.35, 0.25])
    work_life_balance = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.12, 0.28, 0.45, 0.15])
    performance_rating = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.05, 0.15, 0.60, 0.20])
    years_since_last_promotion = np.random.exponential(scale=2.5, size=n_samples).astype(int)

    age = np.random.normal(loc=36, scale=8, size=n_samples).astype(int)
    age = np.clip(age, 20, 65)

    total_working_years = (years_at_company + np.random.exponential(scale=4, size=n_samples)).astype(int)
    years_in_current_role = np.minimum(years_at_company, np.random.exponential(scale=3, size=n_samples).astype(int))
    years_with_curr_manager = np.minimum(years_at_company, np.random.exponential(scale=2.8, size=n_samples).astype(int))
    num_companies_worked = np.random.poisson(lam=2.5, size=n_samples)
    stock_option_level = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.4, 0.35, 0.15, 0.1])

    # Calculate realistic attrition probability (ground truth formula)
    log_odds = -2.0 \
        + 1.3 * (over_time == "Yes") \
        - 0.00015 * (monthly_income - 6000) \
        - 0.5 * (job_satisfaction - 2.5) \
        - 0.4 * (work_life_balance - 2.5) \
        + 0.03 * distance_from_home \
        + 0.12 * (years_since_last_promotion - 2) \
        - 0.08 * (years_at_company - 4) \
        - 0.3 * (stock_option_level - 1)

    prob = 1.0 / (1.0 + np.exp(-log_odds))
    attrition = (np.random.rand(n_samples) < prob).astype(int)

    df = pd.DataFrame({
        "Department": departments,
        "OverTime": over_time,
        "MonthlyIncome": monthly_income,
        "YearsAtCompany": years_at_company,
        "DistanceFromHome": distance_from_home,
        "JobSatisfaction": job_satisfaction,
        "YearsSinceLastPromotion": years_since_last_promotion,
        "WorkLifeBalance": work_life_balance,
        "PerformanceRating": performance_rating,
        "Age": age,
        "TotalWorkingYears": total_working_years,
        "YearsInCurrentRole": years_in_current_role,
        "YearsWithCurrManager": years_with_curr_manager,
        "NumCompaniesWorked": num_companies_worked,
        "StockOptionLevel": stock_option_level,
        "Attrition": attrition
    })

    return df


def preprocess_features(df, feature_cols):
    """Encodes categorical variables into numeric format for model training."""
    X = df[feature_cols].copy()
    if "OverTime" in X.columns:
        X["OverTime"] = (X["OverTime"].str.lower().isin(["yes", "true", "1"])).astype(int)

    if "Department" in X.columns:
        dept_map = {"engineering": 0, "sales": 1, "customer success": 2, "finance": 3, "product": 4, "general": 5}
        X["Department"] = X["Department"].astype(str).str.lower().map(dept_map).fillna(5).astype(int)

    return X.fillna(0)


def train():
    os.makedirs("models", exist_ok=True)
    print("Generating dataset...")
    df = generate_synthetic_ibm_hr_dataset()

    try:
        from xgboost import XGBClassifier
        model_cls = lambda: XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.08, eval_metric="logloss", random_state=42)
        model_flavor = "XGBoost"
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier
        model_cls = lambda: GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
        model_flavor = "GradientBoosting (scikit-learn)"

    print(f"Training using {model_flavor}...")

    # 1. Full Model
    X_full = preprocess_features(df, FULL_FEATURES)
    y = df["Attrition"]
    full_model = model_cls()
    full_model.fit(X_full, y)
    joblib.dump(full_model, "models/full_model.pkl")
    print(f"Saved full model to models/full_model.pkl")

    # 2. Reduced Model
    X_reduced = preprocess_features(df, REDUCED_FEATURES)
    reduced_model = model_cls()
    reduced_model.fit(X_reduced, y)
    joblib.dump(reduced_model, "models/reduced_model.pkl")
    print(f"Saved reduced model to models/reduced_model.pkl")

    # Metadata
    metadata = {
        "full_features": FULL_FEATURES,
        "reduced_features": REDUCED_FEATURES,
        "model_flavor": model_flavor,
        "full_feature_importances": {
            feat: float(imp) for feat, imp in zip(FULL_FEATURES, full_model.feature_importances_)
        },
        "reduced_feature_importances": {
            feat: float(imp) for feat, imp in zip(REDUCED_FEATURES, reduced_model.feature_importances_)
        }
    }
    with open("models/metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("Model training complete!")


if __name__ == "__main__":
    train()
