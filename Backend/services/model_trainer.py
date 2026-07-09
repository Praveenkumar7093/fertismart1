"""Train and persist sklearn ML models for crop, fertilizer, and yield prediction."""
import os
import pickle
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

CROPS = ["rice", "wheat", "corn", "cotton", "sugarcane", "soybean", "potato", "tomato"]
SOIL_TYPES = ["clay", "sandy", "loamy", "silt", "peaty", "chalky"]
SEASONS = ["kharif", "rabi", "zaid", "summer", "winter"]


def _generate_crop_data(n_samples=2000):
    """Generate synthetic crop recommendation training data."""
    np.random.seed(42)
    X, y = [], []

    crop_profiles = {
        "rice": {"temp": (25, 35), "rain": (150, 300), "hum": (70, 90), "soil": [0, 3, 4]},
        "wheat": {"temp": (15, 25), "rain": (50, 100), "hum": (40, 60), "soil": [2, 3, 5]},
        "corn": {"temp": (20, 30), "rain": (80, 150), "hum": (50, 70), "soil": [1, 2, 3]},
        "cotton": {"temp": (21, 35), "rain": (60, 120), "hum": (50, 70), "soil": [1, 2, 3]},
        "sugarcane": {"temp": (26, 35), "rain": (150, 250), "hum": (60, 80), "soil": [0, 2, 3]},
        "soybean": {"temp": (20, 30), "rain": (60, 100), "hum": (50, 70), "soil": [2, 3, 4]},
        "potato": {"temp": (15, 25), "rain": (50, 100), "hum": (60, 80), "soil": [2, 3, 4]},
        "tomato": {"temp": (20, 30), "rain": (60, 120), "hum": (50, 70), "soil": [1, 2, 3]},
    }

    for crop, profile in crop_profiles.items():
        for _ in range(n_samples // len(CROPS)):
            temp = np.random.uniform(*profile["temp"])
            rain = np.random.uniform(*profile["rain"])
            hum = np.random.uniform(*profile["hum"])
            soil = np.random.choice(len(SOIL_TYPES), p=[0.15, 0.15, 0.3, 0.15, 0.1, 0.15])
            season = np.random.randint(0, len(SEASONS))

            X.append([soil, temp, rain, hum, season])
            y.append(crop)

    return np.array(X), np.array(y)


def _generate_yield_data(n_samples=2000):
    """Generate synthetic yield prediction training data."""
    np.random.seed(123)
    X, y = [], []

    base_yields = {
        "rice": 4.5, "wheat": 3.5, "corn": 5.0, "cotton": 2.5,
        "sugarcane": 70.0, "soybean": 2.0, "potato": 25.0, "tomato": 35.0,
    }

    for crop_idx, crop in enumerate(CROPS):
        base = base_yields[crop]
        for _ in range(n_samples // len(CROPS)):
            temp = np.random.uniform(15, 35)
            rain = np.random.uniform(40, 300)
            hum = np.random.uniform(40, 90)
            soil = np.random.randint(0, len(SOIL_TYPES))
            season = np.random.randint(0, len(SEASONS))
            nitrogen = np.random.uniform(100, 400)
            phosphorus = np.random.uniform(20, 80)
            potassium = np.random.uniform(100, 300)
            ph = np.random.uniform(5.0, 8.0)

            temp_factor = 1 - abs(temp - 25) / 30
            rain_factor = 1 - abs(rain - 150) / 300
            n_factor = min(nitrogen / 300, 1.2)
            yield_val = base * max(0.3, temp_factor) * max(0.3, rain_factor) * n_factor
            yield_val += np.random.normal(0, base * 0.1)

            X.append([crop_idx, temp, rain, hum, soil, season, nitrogen, phosphorus, potassium, ph])
            y.append(max(0.5, yield_val))

    return np.array(X), np.array(y)


def _generate_fertilizer_data(n_samples=1500):
    """Generate synthetic fertilizer recommendation data."""
    np.random.seed(456)
    X, y = [], []

    for _ in range(n_samples):
        n = np.random.uniform(50, 400)
        p = np.random.uniform(10, 80)
        k = np.random.uniform(50, 300)
        ph = np.random.uniform(4.5, 8.5)
        crop = np.random.randint(0, len(CROPS))
        disease = np.random.randint(0, 5)  # 0=none, 1-4=disease severity

        X.append([n, p, k, ph, crop, disease])

        if n < 150:
            fert = 0  # high nitrogen needed
        elif p < 30:
            fert = 1  # phosphorus needed
        elif k < 120:
            fert = 2  # potassium needed
        elif ph < 5.5:
            fert = 3  # lime needed
        elif ph > 7.5:
            fert = 4  # sulfur needed
        elif disease > 2:
            fert = 5  # fungicide + balanced
        else:
            fert = 6  # maintenance
        y.append(fert)

    return np.array(X), np.array(y)


def train_all_models():
    """Train all sklearn models and save to disk."""
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    from sklearn.tree import DecisionTreeClassifier
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import LabelEncoder
    import xgboost as xgb

    logger.info("Training ML models...")

    # Crop Recommendation - Random Forest
    X_crop, y_crop = _generate_crop_data()
    le_crop = LabelEncoder()
    le_crop.fit(CROPS)
    rf_crop = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    rf_crop.fit(X_crop, y_crop)
    with open(MODELS_DIR / "crop_rf.pkl", "wb") as f:
        pickle.dump({"model": rf_crop, "encoder": le_crop, "crops": CROPS, "soil_types": SOIL_TYPES, "seasons": SEASONS}, f)

    # Crop Recommendation - XGBoost
    xgb_crop = xgb.XGBClassifier(n_estimators=100, random_state=42, max_depth=6)
    y_crop_encoded = le_crop.transform(y_crop)
    xgb_crop.fit(X_crop, y_crop_encoded)
    with open(MODELS_DIR / "crop_xgb.pkl", "wb") as f:
        pickle.dump({"model": xgb_crop, "encoder": le_crop, "crops": CROPS, "soil_types": SOIL_TYPES, "seasons": SEASONS}, f)

    # Yield Prediction - Linear Regression
    X_yield, y_yield = _generate_yield_data()
    lr_yield = LinearRegression()
    lr_yield.fit(X_yield, y_yield)
    with open(MODELS_DIR / "yield_lr.pkl", "wb") as f:
        pickle.dump({"model": lr_yield, "crops": CROPS, "soil_types": SOIL_TYPES, "seasons": SEASONS}, f)

    # Yield Prediction - Random Forest
    rf_yield = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=12)
    rf_yield.fit(X_yield, y_yield)
    with open(MODELS_DIR / "yield_rf.pkl", "wb") as f:
        pickle.dump({"model": rf_yield, "crops": CROPS, "soil_types": SOIL_TYPES, "seasons": SEASONS}, f)

    # Yield Prediction - XGBoost
    xgb_yield = xgb.XGBRegressor(n_estimators=100, random_state=42, max_depth=8)
    xgb_yield.fit(X_yield, y_yield)
    with open(MODELS_DIR / "yield_xgb.pkl", "wb") as f:
        pickle.dump({"model": xgb_yield, "crops": CROPS, "soil_types": SOIL_TYPES, "seasons": SEASONS}, f)

    # Fertilizer - Decision Tree
    X_fert, y_fert = _generate_fertilizer_data()
    dt_fert = DecisionTreeClassifier(max_depth=8, random_state=42)
    dt_fert.fit(X_fert, y_fert)
    with open(MODELS_DIR / "fertilizer_dt.pkl", "wb") as f:
        pickle.dump({"model": dt_fert, "crops": CROPS}, f)

    logger.info("All ML models trained and saved successfully.")
    return True


def ensure_models_exist():
    """Train models if they don't exist yet."""
    required = [
        "crop_rf.pkl", "crop_xgb.pkl",
        "yield_lr.pkl", "yield_rf.pkl", "yield_xgb.pkl",
        "fertilizer_dt.pkl",
    ]
    if not all((MODELS_DIR / f).exists() for f in required):
        logger.info("Models not found. Training new models...")
        train_all_models()
    else:
        logger.info("ML models loaded from cache.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_all_models()
    print("Models saved to:", MODELS_DIR)
