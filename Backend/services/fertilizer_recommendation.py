"""AI Fertilizer Recommendation using Decision Tree and NLP-based suggestions."""
import pickle
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent.parent / "models"

FERTILIZER_MAP = {
    0: {
        "type": "Nitrogen Fertilizer",
        "product": "Urea (46-0-0)",
        "dosage": "Apply 100-150 kg/ha in split doses",
        "timing": "50% basal, 25% tillering, 25% flowering",
        "priority": "high",
    },
    1: {
        "type": "Phosphorus Fertilizer",
        "product": "Single Super Phosphate (0-16-0)",
        "dosage": "Apply 80-120 kg/ha",
        "timing": "Full dose at basal before sowing",
        "priority": "high",
    },
    2: {
        "type": "Potassium Fertilizer",
        "product": "Muriate of Potash (0-0-60)",
        "dosage": "Apply 60-100 kg/ha",
        "timing": "50% basal, 50% at active growth",
        "priority": "medium",
    },
    3: {
        "type": "pH Correction - Lime",
        "product": "Agricultural Lime (CaCO3)",
        "dosage": "Apply 2-4 tonnes/ha based on pH",
        "timing": "Apply 3-4 weeks before sowing",
        "priority": "high",
    },
    4: {
        "type": "pH Correction - Sulfur",
        "product": "Elemental Sulfur",
        "dosage": "Apply 500-1000 kg/ha",
        "timing": "Apply during land preparation",
        "priority": "high",
    },
    5: {
        "type": "Disease Control + Balanced Fertilizer",
        "product": "NPK 19-19-19 + Copper Oxychloride",
        "dosage": "NPK: 100 kg/ha + Fungicide spray 0.3%",
        "timing": "Immediate foliar spray + soil application",
        "priority": "critical",
    },
    6: {
        "type": "Maintenance Fertilizer",
        "product": "NPK 15-15-15",
        "dosage": "Apply 50-75 kg/ha",
        "timing": "Split application during growth stages",
        "priority": "low",
    },
}

DISEASE_TREATMENTS = {
    "bacterial_spot": {"fungicide": "Copper Oxychloride 0.3%", "fertilizer": "Reduce nitrogen, increase potassium"},
    "early_blight": {"fungicide": "Mancozeb 2g/L", "fertilizer": "Balanced NPK with extra potassium"},
    "late_blight": {"fungicide": "Metalaxyl + Mancozeb", "fertilizer": "Avoid excess nitrogen immediately"},
    "leaf_mold": {"fungicide": "Chlorothalonil", "fertilizer": "Reduce humidity, light NPK application"},
    "leaf_blast": {"fungicide": "Tricyclazole 0.1%", "fertilizer": "Silicon fertilizer + balanced NPK"},
    "brown_spot": {"fungicide": "Propiconazole", "fertilizer": "Potassium-rich fertilizer"},
    "bacterial_blight": {"fungicide": "Streptomycin sulfate", "fertilizer": "Moderate nitrogen, high potassium"},
    "healthy": {"fungicide": "None needed", "fertilizer": "Regular NPK based on soil test"},
}


def _load_model():
    with open(MODELS_DIR / "fertilizer_dt.pkl", "rb") as f:
        return pickle.load(f)


def recommend_fertilizer(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    crop_type: str = "wheat",
    disease: str = None,
) -> dict:
    """Generate fertilizer recommendations using Decision Tree + disease-aware logic."""
    from services.model_trainer import ensure_models_exist
    from services.groq_client import explain_disease

    ensure_models_exist()
    data = _load_model()
    crops = data["crops"]

    crop_idx = crops.index(crop_type) if crop_type in crops else 0
    disease_severity = 0
    if disease and disease != "healthy":
        disease_severity = 3 if disease in ("late_blight", "leaf_blast", "bacterial_blight", "yellow_leaf_curl") else 2

    X = [[float(nitrogen), float(phosphorus), float(potassium), float(ph), crop_idx, disease_severity]]
    pred_class = int(data["model"].predict(X)[0])
    primary = FERTILIZER_MAP.get(pred_class, FERTILIZER_MAP[6])

    recommendations = [primary]

    # Add additional recommendations based on deficiencies
    if nitrogen < 150 and pred_class != 0:
        recommendations.append(FERTILIZER_MAP[0])
    if phosphorus < 30 and pred_class != 1:
        recommendations.append(FERTILIZER_MAP[1])
    if potassium < 120 and pred_class != 2:
        recommendations.append(FERTILIZER_MAP[2])
    if ph < 5.5 and pred_class != 3:
        recommendations.append(FERTILIZER_MAP[3])
    if ph > 7.5 and pred_class != 4:
        recommendations.append(FERTILIZER_MAP[4])

    # Disease-specific treatment
    disease_treatment = None
    precautions = []
    if disease and disease in DISEASE_TREATMENTS:
        disease_treatment = DISEASE_TREATMENTS[disease]
        precautions = [
            "Remove and destroy all infected plant debris from the field",
            "Avoid overhead irrigation to prevent disease spread",
            "Maintain proper plant spacing for air circulation",
            "Apply preventive fungicide spray every 10-14 days during humid weather",
            "Use disease-resistant seed varieties for next season",
        ]
        if disease != "healthy":
            recommendations.insert(0, {
                "type": "Disease Treatment",
                "product": disease_treatment["fungicide"],
                "dosage": "Spray as per label instructions",
                "timing": "Immediate application, repeat after 7 days",
                "priority": "critical",
            })

    # NLP-based suggestion via Groq (or fallback)
    nlp_suggestion = None
    if disease:
        nlp_suggestion = explain_disease(disease, 85.0, 20.0, "Decision Tree + NLP")

    return {
        "model": "Decision Tree Classifier + Recommendation Logic",
        "primary_recommendation": primary,
        "all_recommendations": recommendations[:4],
        "disease_treatment": disease_treatment,
        "precautions": precautions if disease and disease != "healthy" else [
            "Conduct soil test before each cropping season",
            "Apply fertilizers in split doses for better uptake",
            "Add organic matter to improve soil health",
            "Monitor crop growth and adjust application accordingly",
        ],
        "nlp_suggestion": nlp_suggestion,
        "soil_analysis": {
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "ph": ph,
            "crop_type": crop_type,
            "disease": disease,
        },
    }
