"""AI module API routes for FertiSmart."""
from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.route("/health", methods=["GET"])
def ai_health():
    return jsonify({
        "status": "ok",
        "modules": [
            "disease_detection",
            "crop_recommendation",
            "fertilizer_recommendation",
            "yield_prediction",
            "chatbot",
        ],
    })


@ai_bp.route("/disease/detect", methods=["POST"])
def detect_disease():
    """Detect crop disease from uploaded leaf image."""
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400

        model_name = request.form.get("model", "mobilenetv2")
        image_bytes = file.read()

        from services.disease_detection import detect_disease as run_detection
        from services.groq_client import explain_disease

        result = run_detection(image_bytes, model_name)
        result["ai_explanation"] = explain_disease(
            result["disease"],
            result["confidence"],
            result["affected_area_percent"],
            model_name,
        )

        return jsonify({"message": "Disease detection complete", "data": result}), 200
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/disease/models", methods=["GET"])
def disease_models():
    from services.disease_detection import AVAILABLE_MODELS, DISEASE_CLASSES
    return jsonify({
        "models": AVAILABLE_MODELS,
        "diseases": DISEASE_CLASSES,
    })


@ai_bp.route("/crop/recommend", methods=["POST"])
def crop_recommend():
    """Recommend best crops based on environmental conditions."""
    try:
        data = request.get_json()
        required = ["soil_type", "temperature", "rainfall", "humidity", "season"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        from services.crop_recommendation import recommend_crops
        result = recommend_crops(
            data["soil_type"],
            float(data["temperature"]),
            float(data["rainfall"]),
            float(data["humidity"]),
            data["season"],
        )
        return jsonify({"message": "Crop recommendations generated", "data": result}), 200
    except Exception as e:
        logger.error(f"Crop recommendation error: {e}")
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/fertilizer/recommend", methods=["POST"])
def fertilizer_recommend():
    """Generate fertilizer recommendations with disease-aware logic."""
    try:
        data = request.get_json()
        required = ["nitrogen", "phosphorus", "potassium", "ph"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        from services.fertilizer_recommendation import recommend_fertilizer
        result = recommend_fertilizer(
            float(data["nitrogen"]),
            float(data["phosphorus"]),
            float(data["potassium"]),
            float(data["ph"]),
            data.get("crop_type", "wheat"),
            data.get("disease"),
        )
        return jsonify({"message": "Fertilizer recommendations generated", "data": result}), 200
    except Exception as e:
        logger.error(f"Fertilizer recommendation error: {e}")
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/yield/predict", methods=["POST"])
def yield_predict():
    """Predict crop yield based on conditions."""
    try:
        data = request.get_json()
        required = ["crop_type", "temperature", "rainfall", "humidity", "soil_type", "season"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        from services.yield_prediction import predict_yield
        result = predict_yield(
            data["crop_type"],
            float(data["temperature"]),
            float(data["rainfall"]),
            float(data["humidity"]),
            data["soil_type"],
            data["season"],
            float(data.get("nitrogen", 250)),
            float(data.get("phosphorus", 50)),
            float(data.get("potassium", 180)),
            float(data.get("ph", 6.5)),
        )
        return jsonify({"message": "Yield prediction complete", "data": result}), 200
    except Exception as e:
        logger.error(f"Yield prediction error: {e}")
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/chat", methods=["POST"])
def chat():
    """AI Farmer Assistant chatbot."""
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Message is required"}), 400

        from services.groq_client import chat_with_farmer
        result = chat_with_farmer(data["message"], data.get("history", []))
        return jsonify({"message": "Chat response generated", "data": result}), 200
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500
