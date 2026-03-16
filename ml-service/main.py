from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import joblib
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ClinKit ML Demand Prediction Service",
    description="Machine learning microservice for specimen kit demand forecasting",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PHASE_MAP = {
    "Phase I": 0,
    "Phase II": 1,
    "Phase III": 2,
    "Phase IV": 3,
}

PHASE_MULTIPLIERS = {
    "Phase I": 0.6,
    "Phase II": 0.8,
    "Phase III": 1.0,
    "Phase IV": 0.9,
}

MODEL_PATH = os.getenv("MODEL_PATH", "model.pkl")


class ForecastRequest(BaseModel):
    site_id: str
    enrolled_patients: int
    patient_capacity: int
    samples_per_patient: int
    historical_usage: List[float] = []
    trial_phase: str = "Phase III"
    months_ahead: int = 3


class ForecastResponse(BaseModel):
    predicted_demand: int
    safety_stock: int
    recommended_qty: int
    confidence_score: float
    method: str


class TrainingSample(BaseModel):
    base_demand: float
    avg_usage: float
    trend: float
    enrollment_rate: float
    phase: int
    months_ahead: int
    actual_usage: float


class TrainRequest(BaseModel):
    samples: List[TrainingSample]


def formula_predict(req: ForecastRequest) -> ForecastResponse:
    """Rule-based fallback prediction."""
    phase_mult = PHASE_MULTIPLIERS.get(req.trial_phase, 1.0)
    formula_demand = req.enrolled_patients * req.samples_per_patient * phase_mult * req.months_ahead

    if len(req.historical_usage) >= 3:
        recent = req.historical_usage[-6:]
        avg = sum(recent) / len(recent)
        predicted_base = (avg * 0.6 + formula_demand * 0.4)
        confidence = min(0.85, 0.6 + (len(recent) / 6) * 0.35)
        method = "weighted_hybrid"
    else:
        predicted_base = formula_demand
        confidence = 0.60
        method = "formula_based"

    # Trend adjustment
    if len(req.historical_usage) >= 2:
        last = req.historical_usage[-1]
        prev = req.historical_usage[-2]
        trend = (last - prev) / prev if prev > 0 else 0.0
        trend = max(-0.3, min(0.3, trend))
        predicted_base *= (1 + trend)

    predicted_demand = max(0, int(round(predicted_base)))
    safety_stock = int(round(predicted_demand * 0.20))

    return ForecastResponse(
        predicted_demand=predicted_demand,
        safety_stock=safety_stock,
        recommended_qty=predicted_demand + safety_stock,
        confidence_score=round(confidence, 2),
        method=method,
    )


def build_features(req: ForecastRequest) -> List[float]:
    """Build feature vector for ML model."""
    history = req.historical_usage[-6:] if req.historical_usage else []
    avg_usage = float(np.mean(history)) if history else 0.0
    std_usage = float(np.std(history)) if len(history) > 1 else avg_usage * 0.1
    trend = (history[-1] - history[0]) / len(history) if len(history) > 1 else 0.0
    base_demand = req.enrolled_patients * req.samples_per_patient
    enrollment_rate = req.enrolled_patients / max(req.patient_capacity, 1)
    phase_encoded = PHASE_MAP.get(req.trial_phase, 2)

    return [
        base_demand,
        avg_usage,
        trend,
        enrollment_rate,
        float(phase_encoded),
        float(req.months_ahead),
        std_usage,
    ]


@app.get("/health")
def health_check():
    model_loaded = os.path.exists(MODEL_PATH)
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "version": "1.0.0",
    }


@app.post("/predict", response_model=ForecastResponse)
def predict(req: ForecastRequest):
    logger.info(f"Predict request for site={req.site_id}, patients={req.enrolled_patients}")

    if not os.path.exists(MODEL_PATH):
        logger.info("Model not found, using formula fallback")
        return formula_predict(req)

    try:
        model, scaler = joblib.load(MODEL_PATH)
        features = np.array([build_features(req)])
        features_scaled = scaler.transform(features)
        predicted = float(model.predict(features_scaled)[0])

        predicted_demand = max(0, int(round(predicted)))
        safety_stock = int(round(predicted_demand * 0.20))

        return ForecastResponse(
            predicted_demand=predicted_demand,
            safety_stock=safety_stock,
            recommended_qty=predicted_demand + safety_stock,
            confidence_score=0.87,
            method="ridge_regression",
        )
    except Exception as e:
        logger.error(f"ML prediction failed: {e}, falling back to formula")
        return formula_predict(req)


@app.post("/train")
def train(req: TrainRequest):
    if len(req.samples) < 5:
        raise HTTPException(status_code=400, detail="Need at least 5 training samples")

    try:
        from sklearn.linear_model import Ridge
        from sklearn.preprocessing import StandardScaler

        X = [[
            s.base_demand, s.avg_usage, s.trend,
            s.enrollment_rate, s.phase, s.months_ahead, 0.0
        ] for s in req.samples]
        y = [s.actual_usage for s in req.samples]

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = Ridge(alpha=1.0)
        model.fit(X_scaled, y)

        joblib.dump((model, scaler), MODEL_PATH)
        logger.info(f"Model trained with {len(req.samples)} samples")

        return {
            "status": "success",
            "samples_trained": len(req.samples),
            "model_path": MODEL_PATH,
        }
    except ImportError:
        raise HTTPException(status_code=500, detail="scikit-learn not installed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
def predict_batch(requests: List[ForecastRequest]):
    return [predict(req) for req in requests]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
