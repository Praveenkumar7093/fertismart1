import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Sprout, Loader2, TreePine, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, CropRecommendation as CropResult } from "@/services/api";

const CropRecommendation = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [form, setForm] = useState({
    soil_type: "",
    temperature: "",
    rainfall: "",
    humidity: "",
    season: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) {
      toast({ title: "Missing fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await api.recommendCrop({
        soil_type: form.soil_type,
        temperature: parseFloat(form.temperature),
        rainfall: parseFloat(form.rainfall),
        humidity: parseFloat(form.humidity),
        season: form.season,
      });
      setResult(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to get recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const RecList = ({ recs, icon: Icon, color }: { recs: CropResult["random_forest"]; icon: typeof Sprout; color: string }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-bold">{recs.model}</h3>
      </div>
      {recs.recommendations.map((rec, i) => (
        <div key={rec.crop} className="p-4 rounded-xl bg-background/50 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={i === 0 ? "default" : "secondary"}>#{i + 1}</Badge>
              <span className="font-semibold">{rec.crop_name}</span>
            </div>
            <span className="font-bold text-primary">{rec.confidence}%</span>
          </div>
          <Progress value={rec.confidence} className="h-2 mb-2" />
          {rec.details && (
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Season: {rec.details.season}</span>
              <span>Duration: {rec.details.duration}</span>
              <span>Water: {rec.details.water}</span>
              <span>Profit: {rec.details.profit}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl py-10 px-4">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sprout className="h-4 w-4" />
            Random Forest + XGBoost ML Models
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Crop Recommendation</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your soil and climate conditions to get the best crop recommendations powered by ensemble ML models.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 gradient-card shadow-medium border-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Soil Type</Label>
                <Select value={form.soil_type} onValueChange={(v) => setForm({ ...form, soil_type: v })}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select soil type" /></SelectTrigger>
                  <SelectContent>
                    {["clay", "sandy", "loamy", "silt", "peaty", "chalky"].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input type="number" placeholder="25" value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Rainfall (mm)</Label>
                  <Input type="number" placeholder="150" value={form.rainfall}
                    onChange={(e) => setForm({ ...form, rainfall: e.target.value })} className="h-12" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Humidity (%)</Label>
                  <Input type="number" placeholder="70" value={form.humidity}
                    onChange={(e) => setForm({ ...form, humidity: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select season" /></SelectTrigger>
                    <SelectContent>
                      {["kharif", "rabi", "zaid", "summer", "winter"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white h-12 text-lg">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</> : "Get Crop Recommendations"}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            {result && (
              <Card className="p-6 gradient-primary text-white border-0 shadow-strong animate-slide-up">
                <p className="text-white/80 text-sm mb-1">Best Recommended Crop (Ensemble)</p>
                <h2 className="text-3xl font-bold capitalize mb-1">{result.best_crop_name}</h2>
                <p className="text-white/90">Combined confidence: {result.ensemble_confidence}%</p>
              </Card>
            )}

            {result ? (
              <>
                <Card className="p-6 gradient-card border-0 shadow-soft">
                  <RecList recs={result.random_forest} icon={TreePine} color="text-green-600" />
                </Card>
                <Card className="p-6 gradient-card border-0 shadow-soft">
                  <RecList recs={result.xgboost} icon={Zap} color="text-blue-600" />
                </Card>
              </>
            ) : (
              <Card className="p-8 gradient-card border-0 h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">Enter conditions to see ML-powered crop recommendations</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CropRecommendation;
