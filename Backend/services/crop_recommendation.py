"""AI Crop Recommendation using Random Forest and XGBoost."""
import pickle
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent.parent / "models"

CROP_DETAILS = {
    "rice": {"name": "Rice", "season": "Kharif", "duration": "120-150 days", "water": "High", "profit": "High"},
    "wheat": {"name": "Wheat", "season": "Rabi", "duration": "120-140 days", "water": "Moderate", "profit": "High"},
    "corn": {"name": "Corn (Maize)", "season": "Kharif/Summer", "duration": "90-110 days", "water": "Moderate", "profit": "Medium"},
    "cotton": {"name": "Cotton", "season": "Kharif", "duration": "150-180 days", "water": "Moderate", "profit": "Very High"},
    "sugarcane": {"name": "Sugarcane", "season": "Year-round", "duration": "300-365 days", "water": "Very High", "profit": "High"},
    "soybean": {"name": "Soybean", "season": "Kharif", "duration": "90-120 days", "water": "Moderate", "profit": "Medium"},
    "potato": {"name": "Potato", "season": "Rabi", "duration": "90-120 days", "water": "Moderate", "profit": "High"},
    "tomato": {"name": "Tomato", "season": "Year-round", "duration": "90-120 days", "water": "Moderate", "profit": "Very High"},
}


def _load_model(filename):
    with open(MODELS_DIR / filename, "rb") as f:
        return pickle.load(f)


def _encode_input(soil_type, temperature, rainfall, humidity, season, data):
    soil_types = data["soil_types"]
    seasons = data["seasons"]
    soil_idx = soil_types.index(soil_type) if soil_type in soil_types else 2
    season_idx = seasons.index(season) if season in seasons else 0
    return np.array([[soil_idx, float(temperature), float(rainfall), float(humidity), season_idx]])


def recommend_crops(soil_type: str, temperature: float, rainfall: float, humidity: float, season: str) -> dict:
    """Get crop recommendations from both Random Forest and XGBoost models."""
    from services.model_trainer import ensure_models_exist
    ensure_models_exist()

    rf_data = _load_model("crop_rf.pkl")
    xgb_data = _load_model("crop_xgb.pkl")

    X = _encode_input(soil_type, temperature, rainfall, humidity, season, rf_data)

    # Random Forest predictions with probabilities
    rf_probs = rf_data["model"].predict_proba(X)[0]
    rf_top = np.argsort(rf_probs)[::-1][:3]
    rf_recommendations = [
        {
            "crop": rf_data["crops"][i],
            "crop_name": CROP_DETAILS.get(rf_data["crops"][i], {}).get("name", rf_data["crops"][i]),
            "confidence": round(float(rf_probs[i]) * 100, 2),
            "details": CROP_DETAILS.get(rf_data["crops"][i], {}),
        }
        for i in rf_top
    ]

    # XGBoost predictions
    xgb_probs = xgb_data["model"].predict_proba(X)[0]
    xgb_top = np.argsort(xgb_probs)[::-1][:3]
    xgb_recommendations = [
        {
            "crop": xgb_data["crops"][i],
            "crop_name": CROP_DETAILS.get(xgb_data["crops"][i], {}).get("name", xgb_data["crops"][i]),
            "confidence": round(float(xgb_probs[i]) * 100, 2),
            "details": CROP_DETAILS.get(xgb_data["crops"][i], {}),
        }
        for i in xgb_top
    ]

    # Combined best recommendation (ensemble)
    combined_scores = {}
    for rec in rf_recommendations:
        combined_scores[rec["crop"]] = combined_scores.get(rec["crop"], 0) + rec["confidence"] * 0.5
    for rec in xgb_recommendations:
        combined_scores[rec["crop"]] = combined_scores.get(rec["crop"], 0) + rec["confidence"] * 0.5

    best_crop = max(combined_scores, key=combined_scores.get)

    return {
        "best_crop": best_crop,
        "best_crop_name": CROP_DETAILS.get(best_crop, {}).get("name", best_crop),
        "ensemble_confidence": round(combined_scores[best_crop], 2),
        "random_forest": {
            "model": "Random Forest Classifier",
            "recommendations": rf_recommendations,
        },
        "xgboost": {
            "model": "XGBoost Classifier",
            "recommendations": xgb_recommendations,
        },
        "input": {
            "soil_type": soil_type,
            "temperature": temperature,
            "rainfall": rainfall,
            "humidity": humidity,
            "season": season,
        },
    }
