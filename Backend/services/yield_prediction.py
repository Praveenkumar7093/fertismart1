"""AI Yield Prediction using Linear Regression, Random Forest, and XGBoost."""
import pickle
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent.parent / "models"

YIELD_UNITS = {
    "rice": "tonnes/ha", "wheat": "tonnes/ha", "corn": "tonnes/ha",
    "cotton": "bales/ha", "sugarcane": "tonnes/ha", "soybean": "tonnes/ha",
    "potato": "tonnes/ha", "tomato": "tonnes/ha",
}


def _load_model(filename):
    with open(MODELS_DIR / filename, "rb") as f:
        return pickle.load(f)


def _encode_input(crop_type, temperature, rainfall, humidity, soil_type, season,
                  nitrogen, phosphorus, potassium, ph, data):
    crops = data["crops"]
    soil_types = data["soil_types"]
    seasons = data["seasons"]
    crop_idx = crops.index(crop_type) if crop_type in crops else 0
    soil_idx = soil_types.index(soil_type) if soil_type in soil_types else 2
    season_idx = seasons.index(season) if season in seasons else 0
    return np.array([[
        crop_idx, float(temperature), float(rainfall), float(humidity),
        soil_idx, season_idx, float(nitrogen), float(phosphorus), float(potassium), float(ph),
    ]])


def predict_yield(
    crop_type: str,
    temperature: float,
    rainfall: float,
    humidity: float,
    soil_type: str,
    season: str,
    nitrogen: float = 250,
    phosphorus: float = 50,
    potassium: float = 180,
    ph: float = 6.5,
) -> dict:
    """Predict crop yield using ensemble of LR, RF, and XGBoost."""
    from services.model_trainer import ensure_models_exist
    ensure_models_exist()

    lr_data = _load_model("yield_lr.pkl")
    rf_data = _load_model("yield_rf.pkl")
    xgb_data = _load_model("yield_xgb.pkl")

    X = _encode_input(
        crop_type, temperature, rainfall, humidity, soil_type, season,
        nitrogen, phosphorus, potassium, ph, lr_data,
    )

    lr_pred = float(lr_data["model"].predict(X)[0])
    rf_pred = float(rf_data["model"].predict(X)[0])
    xgb_pred = float(xgb_data["model"].predict(X)[0])

    # Ensemble average
    ensemble_yield = (lr_pred * 0.25 + rf_pred * 0.35 + xgb_pred * 0.40)
    unit = YIELD_UNITS.get(crop_type, "tonnes/ha")

    # Yield quality assessment
    if ensemble_yield > _get_benchmark(crop_type) * 1.1:
        quality = "excellent"
        message = "Conditions are highly favorable for above-average yield."
    elif ensemble_yield > _get_benchmark(crop_type) * 0.85:
        quality = "good"
        message = "Expected yield is within normal range for this crop and conditions."
    elif ensemble_yield > _get_benchmark(crop_type) * 0.6:
        quality = "moderate"
        message = "Yield may be below average. Consider improving soil nutrition and irrigation."
    else:
        quality = "poor"
        message = "Conditions are unfavorable. Significant intervention needed for acceptable yield."

    return {
        "predicted_yield": round(ensemble_yield, 2),
        "unit": unit,
        "quality": quality,
        "message": message,
        "benchmark": _get_benchmark(crop_type),
        "models": {
            "linear_regression": {"model": "Linear Regression", "prediction": round(lr_pred, 2)},
            "random_forest": {"model": "Random Forest Regressor", "prediction": round(rf_pred, 2)},
            "xgboost": {"model": "XGBoost Regressor", "prediction": round(xgb_pred, 2)},
        },
        "ensemble_method": "Weighted Average (LR: 25%, RF: 35%, XGB: 40%)",
        "input": {
            "crop_type": crop_type,
            "temperature": temperature,
            "rainfall": rainfall,
            "humidity": humidity,
            "soil_type": soil_type,
            "season": season,
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "ph": ph,
        },
        "recommendations": _get_yield_tips(crop_type, quality, nitrogen, rainfall),
    }


def _get_benchmark(crop_type: str) -> float:
    benchmarks = {
        "rice": 4.5, "wheat": 3.5, "corn": 5.0, "cotton": 2.5,
        "sugarcane": 70.0, "soybean": 2.0, "potato": 25.0, "tomato": 35.0,
    }
    return benchmarks.get(crop_type, 3.0)


def _get_yield_tips(crop_type, quality, nitrogen, rainfall):
    tips = []
    if quality in ("moderate", "poor"):
        if nitrogen < 200:
            tips.append("Increase nitrogen application — current levels may limit yield potential")
        if rainfall < 80:
            tips.append("Ensure adequate irrigation — rainfall appears insufficient for optimal growth")
        tips.append(f"Consider using high-yielding varieties of {crop_type} suited to your region")
    tips.append("Monitor crop at critical growth stages (flowering, grain filling)")
    tips.append("Implement integrated pest management to prevent yield losses")
    if quality == "excellent":
        tips.append("Maintain current practices — conditions are optimal for high yield")
    return tips
