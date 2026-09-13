from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_predict_full():
    payload = {
        "model_type": "full",
        "features": {
            "MonthlyIncome": 4200,
            "OverTime": "Yes",
            "JobSatisfaction": 1,
            "YearsAtCompany": 2,
            "YearsSinceLastPromotion": 3,
            "DistanceFromHome": 25,
            "WorkLifeBalance": 2
        }
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_band" in data
    assert data["risk_band"] in ["high", "medium", "low"]
    assert len(data["feature_importances"]) > 0

def test_predict_reduced():
    payload = {
        "model_type": "reduced",
        "features": {
            "MonthlyIncome": 9500,
            "OverTime": "No",
            "YearsAtCompany": 6,
            "Department": "Engineering",
            "DistanceFromHome": 5
        }
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] < 60
