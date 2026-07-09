import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2, BarChart3, LineChart, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, YieldPrediction as YieldResult } from "@/services/api";

const qualityColors: Record<string, string> = {
  excellent: "bg-accent",
  good: "bg-primary",
  moderate: "bg-amber-500",
  poor: "bg-destructive",
};

const YieldPrediction = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResult | null>(null);
  const [form, setForm] = useState({
    crop_type: "", soil_type: "", season: "",
    temperature: "25", rainfall: "150", humidity: "65",
    nitrogen: "250", phosphorus: "50", potassium: "180", ph: "6.5",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop_type || !form.soil_type || !form.season) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await api.predictYield(form);
      setResult(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Prediction failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl py-10 px-4">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Linear Regression · Random Forest · XGBoost
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Yield Prediction</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Predict expected crop yield based on weather, soil, and nutrient conditions using ensemble ML models.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 gradient-card shadow-medium border-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Crop Type</Label>
                <Select value={form.crop_type} onValueChange={(v) => setForm({ ...form, crop_type: v })}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>
                    {["rice", "wheat", "corn", "cotton", "sugarcane", "soybean", "potato", "tomato"].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Soil Type</Label>
                  <Select value={form.soil_type} onValueChange={(v) => setForm({ ...form, soil_type: v })}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Soil" /></SelectTrigger>
                    <SelectContent>
                      {["clay", "sandy", "loamy", "silt", "peaty", "chalky"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Season" /></SelectTrigger>
                    <SelectContent>
                      {["kharif", "rabi", "zaid", "summer", "winter"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "temperature", label: "Temp (°C)" },
                  { key: "rainfall", label: "Rain (mm)" },
                  { key: "humidity", label: "Humidity (%)" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-10" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: "nitrogen", label: "N" },
                  { key: "phosphorus", label: "P" },
                  { key: "potassium", label: "K" },
                  { key: "ph", label: "pH" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-10" />
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white h-12 text-lg">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Predicting...</> : "Predict Yield"}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            {result ? (
              <>
                <Card className="p-8 gradient-primary text-white border-0 shadow-strong text-center animate-slide-up">
                  <p className="text-white/80 mb-2">Predicted Yield</p>
                  <p className="text-5xl font-bold">{result.predicted_yield}</p>
                  <p className="text-white/80 mt-1">{result.unit}</p>
                  <Badge className={`mt-4 ${qualityColors[result.quality]} text-white capitalize`}>
                    {result.quality} yield potential
                  </Badge>
                  <p className="text-white/90 text-sm mt-4">{result.message}</p>
                </Card>

                <Card className="p-6 gradient-card border-0 shadow-soft">
                  <h3 className="font-bold mb-4">Model Predictions</h3>
                  <div className="space-y-3">
                    {[
                      { key: "linear_regression", icon: LineChart, color: "text-blue-500" },
                      { key: "random_forest", icon: BarChart3, color: "text-green-500" },
                      { key: "xgboost", icon: Zap, color: "text-orange-500" },
                    ].map(({ key, icon: Icon, color }) => {
                      const m = result.models[key];
                      return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="text-sm">{m.model}</span>
                          </div>
                          <span className="font-bold">{m.prediction} {result.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{result.ensemble_method}</p>
                  <p className="text-xs text-muted-foreground">Benchmark: {result.benchmark} {result.unit}</p>
                </Card>

                <Card className="p-6 gradient-card border-0 shadow-soft">
                  <h3 className="font-bold mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <Card className="p-8 gradient-card border-0 h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">Fill in conditions to predict crop yield</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default YieldPrediction;
