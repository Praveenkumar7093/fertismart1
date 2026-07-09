"""Groq API client for AI Farmer Assistant and NLP explanations."""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

FARMER_SYSTEM_PROMPT = """You are FertiSmart AI Farmer Assistant — an expert agricultural advisor for Indian farmers.
Provide clear, practical advice about:
- Crop diseases and treatments
- Fertilizer recommendations
- Crop selection by season and soil
- Yield improvement and pest prevention
- Soil health and irrigation

Keep answers concise (2-4 paragraphs), use simple language, and include actionable steps.
When discussing diseases, mention symptoms, causes, and organic/chemical treatment options."""

DISEASE_EXPLAIN_PROMPT = """You are an agricultural AI expert. A crop disease detection system identified:
- Disease: {disease}
- Confidence: {confidence}%
- Affected area: {affected_area}% of leaf
- Model used: {model}

Explain in 3-4 sentences WHY this disease was likely detected (visual symptoms, patterns).
Then give 2-3 treatment recommendations and 2 precautions. Be specific and practical."""


def _get_client():
    if not GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        return Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logger.warning(f"Groq client init failed: {e}")
        return None


def chat_with_farmer(message: str, history: Optional[list] = None) -> dict:
    """Chat with the AI Farmer Assistant."""
    client = _get_client()
    history = history or []

    if client:
        try:
            messages = [{"role": "system", "content": FARMER_SYSTEM_PROMPT}]
            for msg in history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": message})

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                max_tokens=800,
                temperature=0.7,
            )
            reply = response.choices[0].message.content
            return {"reply": reply, "source": "groq", "model": GROQ_MODEL}
        except Exception as e:
            logger.error(f"Groq chat error: {e}")

    return {"reply": _fallback_chat(message), "source": "fallback", "model": "rule-based"}


def explain_disease(disease: str, confidence: float, affected_area: float, model: str) -> str:
    """Generate AI explanation for disease detection."""
    client = _get_client()
    prompt = DISEASE_EXPLAIN_PROMPT.format(
        disease=disease.replace("_", " ").title(),
        confidence=round(confidence, 1),
        affected_area=round(affected_area, 1),
        model=model,
    )

    if client:
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an agricultural disease expert."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=400,
                temperature=0.5,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq explain error: {e}")

    return _fallback_disease_explain(disease, confidence, affected_area)


def _fallback_chat(message: str) -> str:
    """Rule-based fallback when Groq API is unavailable."""
    msg = message.lower()

    if any(w in msg for w in ["yellow", "leaves turning", "chlorosis"]):
        return (
            "**Yellow Leaves — Common Causes:**\n\n"
            "1. **Nitrogen deficiency** — Apply urea (46-0-0) at 50-100 kg/ha in split doses.\n"
            "2. **Over-watering** — Reduce irrigation frequency; ensure proper drainage.\n"
            "3. **Pest attack** — Check underside of leaves for aphids or mites.\n\n"
            "Test soil NPK levels and inspect leaves under sunlight for spots or insects."
        )
    if any(w in msg for w in ["summer", "hot", "best crop"]):
        return (
            "**Best Crops for Summer:**\n\n"
            "- **Rice** (Kharif season) — needs 25-35°C, high humidity\n"
            "- **Cotton** — thrives at 21-30°C with moderate rainfall\n"
            "- **Maize/Corn** — grows well at 18-27°C\n"
            "- **Sugarcane** — ideal for tropical summer climates\n\n"
            "Use our Crop Recommendation module with your soil type and rainfall data for precise suggestions."
        )
    if any(w in msg for w in ["fungus", "fungal", "mold", "blight"]):
        return (
            "**Preventing Fungal Diseases:**\n\n"
            "1. Avoid overhead irrigation — water at soil level.\n"
            "2. Ensure 30-45 cm plant spacing for air circulation.\n"
            "3. Apply neem oil spray (5ml/L) weekly as preventive measure.\n"
            "4. Remove and destroy infected plant parts immediately.\n"
            "5. Use copper-based fungicides (Bordeaux mixture) at first sign of infection.\n\n"
            "Upload a leaf photo to our Disease Detection module for AI-powered diagnosis."
        )
    if any(w in msg for w in ["fertilizer", "npk", "nutrient"]):
        return (
            "**Fertilizer Guidance:**\n\n"
            "Always base fertilizer application on soil test results:\n"
            "- **Nitrogen (N)**: Urea for vegetative growth\n"
            "- **Phosphorus (P)**: SSP/DAP for root development\n"
            "- **Potassium (K)**: MOP for disease resistance and yield\n\n"
            "Use our Soil Analysis module to get crop-specific NPK recommendations with exact dosages."
        )
    if any(w in msg for w in ["yield", "production", "harvest"]):
        return (
            "**Improving Crop Yield:**\n\n"
            "1. Test soil before each season and apply balanced NPK.\n"
            "2. Use certified seeds and proper sowing depth.\n"
            "3. Monitor weather and adjust irrigation accordingly.\n"
            "4. Detect diseases early with leaf image analysis.\n"
            "5. Use our Yield Prediction module to estimate expected output.\n\n"
            "Integrated pest management (IPM) can increase yield by 15-25%."
        )

    return (
        "Hello! I'm FertiSmart AI Farmer Assistant. I can help with:\n\n"
        "• **Disease diagnosis** — Upload leaf photos for AI detection\n"
        "• **Crop selection** — Best crops for your soil and climate\n"
        "• **Fertilizer advice** — NPK recommendations from soil tests\n"
        "• **Yield prediction** — Estimate harvest based on conditions\n"
        "• **General farming** — Pest control, irrigation, seasonal tips\n\n"
        "Ask me anything like: *Why are leaves turning yellow?* or *Best crop for summer?*"
    )


def _fallback_disease_explain(disease: str, confidence: float, affected_area: float) -> str:
    """Fallback disease explanation without Groq."""
    disease_info = {
        "healthy": "The leaf appears green and uniform without spots, lesions, or discoloration — indicating healthy plant tissue.",
        "bacterial_spot": "Small dark spots with yellow halos detected — characteristic of bacterial spot infection on leaf surface.",
        "early_blight": "Concentric ring patterns (target spots) identified — typical early blight symptom on older leaves.",
        "late_blight": "Large irregular brown patches with fuzzy margins detected — signs of late blight fungal infection.",
        "leaf_mold": "Yellow patches on upper surface with mold-like texture detected — indicating leaf mold fungus.",
        "septoria_leaf_spot": "Numerous small circular spots with gray centers found — classic septoria leaf spot pattern.",
        "spider_mites": "Fine stippling and bronzing pattern detected — indicative of spider mite feeding damage.",
        "target_spot": "Brown spots with concentric rings detected — target spot fungal disease pattern.",
        "yellow_leaf_curl": "Upward curling and yellowing of leaf margins detected — viral yellow leaf curl symptoms.",
        "mosaic_virus": "Mosaic pattern of light and dark green patches detected — viral mosaic infection.",
        "leaf_blast": "Diamond-shaped lesions with gray centers detected — rice blast fungus characteristic pattern.",
        "brown_spot": "Small brown circular spots detected — brown spot disease on rice leaves.",
        "bacterial_blight": "Water-soaked lesions turning brown detected — bacterial blight infection signs.",
    }

    explanation = disease_info.get(
        disease,
        f"Visual analysis detected patterns consistent with {disease.replace('_', ' ')}.",
    )

    treatment = {
        "healthy": "Continue regular monitoring. Maintain balanced NPK fertilization and proper irrigation.",
        "bacterial_spot": "Apply copper oxychloride (0.3%). Remove infected leaves. Avoid overhead irrigation.",
        "early_blight": "Spray Mancozeb (2g/L). Apply mulch. Rotate crops annually.",
        "late_blight": "Apply Metalaxyl + Mancozeb immediately. Destroy infected plants. Improve drainage.",
        "leaf_mold": "Apply Chlorothalonil fungicide. Increase spacing. Reduce humidity in greenhouse.",
        "leaf_blast": "Apply Tricyclazole (0.1%). Use resistant varieties. Avoid excess nitrogen.",
        "brown_spot": "Apply Propiconazole. Maintain proper plant spacing. Balanced fertilization.",
        "bacterial_blight": "Apply Streptomycin sulfate. Use disease-free seeds. Field sanitation.",
    }.get(disease, "Consult local agricultural extension officer. Apply broad-spectrum fungicide as preventive measure.")

    return (
        f"**AI Analysis ({confidence:.1f}% confidence):**\n\n"
        f"{explanation} Approximately {affected_area:.1f}% of the leaf area shows affected patterns "
        f"based on Grad-CAM heatmap analysis.\n\n"
        f"**Recommended Treatment:** {treatment}\n\n"
        f"**Precautions:** Remove infected plant debris, avoid working in wet fields, "
        f"and rotate crops to prevent recurrence."
    )
