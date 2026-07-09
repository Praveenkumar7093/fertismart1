const API_BASE = import.meta.env.VITE_API_URL || "";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export interface DiseaseResult {
  disease: string;
  disease_label: string;
  confidence: number;
  affected_area_percent: number;
  severity: string;
  crop_type: string;
  description: string;
  model_used: string;
  all_predictions: { disease: string; confidence: number }[];
  gradcam_image: string;
  original_image: string;
  is_healthy: boolean;
  ai_explanation: string;
  comparison: { healthy: string; detected: string };
}

export interface CropRecommendation {
  best_crop: string;
  best_crop_name: string;
  ensemble_confidence: number;
  random_forest: { model: string; recommendations: CropRec[] };
  xgboost: { model: string; recommendations: CropRec[] };
}

interface CropRec {
  crop: string;
  crop_name: string;
  confidence: number;
  details: Record<string, string>;
}

export interface YieldPrediction {
  predicted_yield: number;
  unit: string;
  quality: string;
  message: string;
  benchmark: number;
  models: Record<string, { model: string; prediction: number }>;
  recommendations: string[];
}

export interface FertilizerResult {
  model: string;
  primary_recommendation: Record<string, string>;
  all_recommendations: Record<string, string>[];
  precautions: string[];
  nlp_suggestion: string;
}

export const api = {
  detectDisease: async (file: File, model = "mobilenetv2") => {
    const form = new FormData();
    form.append("image", file);
    form.append("model", model);
    const res = await fetch(`${API_BASE}/api/ai/disease/detect`, { method: "POST", body: form });
    const data = await handleResponse<{ data: DiseaseResult }>(res);
    return data.data;
  },

  recommendCrop: async (input: {
    soil_type: string;
    temperature: number;
    rainfall: number;
    humidity: number;
    season: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/ai/crop/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await handleResponse<{ data: CropRecommendation }>(res);
    return data.data;
  },

  predictYield: async (input: Record<string, string | number>) => {
    const res = await fetch(`${API_BASE}/api/ai/yield/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await handleResponse<{ data: YieldPrediction }>(res);
    return data.data;
  },

  recommendFertilizer: async (input: Record<string, string | number>) => {
    const res = await fetch(`${API_BASE}/api/ai/fertilizer/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await handleResponse<{ data: FertilizerResult }>(res);
    return data.data;
  },

  chat: async (message: string, history: { role: string; content: string }[] = []) => {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    const data = await handleResponse<{ data: { reply: string; source: string; model: string } }>(res);
    return data.data;
  },

  getRecommendations: async (input: Record<string, number>) => {
    const res = await fetch(`${API_BASE}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse(res);
  },
};
