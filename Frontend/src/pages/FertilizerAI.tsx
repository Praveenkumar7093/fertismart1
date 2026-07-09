import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, FertilizerResult } from "@/services/api";

const FertilizerAI = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerResult | null>(null);
  const [form, setForm] = useState({
    nitrogen: "200", phosphorus: "35", potassium: "150", ph: "6.5",
    crop_type: "wheat", disease: "none",
  });

  useEffect(() => {
    const disease = searchParams.get("disease");
    if (disease) setForm((f) => ({ ...f, disease }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.recommendFertilizer({
        ...form,
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        ph: parseFloat(form.ph),
        disease: form.disease === "none" ? undefined : form.disease,
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

  const priorityColor = (p: string) =>
    p === "critical" ? "bg-destructive" : p === "high" ? "bg-amber-500" : p === "medium" ? "bg-primary" : "bg-accent";

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl py-10 px-4">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FlaskConical className="h-4 w-4" />
            Decision Tree · NLP · Disease-Aware Logic
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Fertilizer Recommendation</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get intelligent fertilizer, treatment, and precaution recommendations based on soil analysis and detected diseases.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 gradient-card shadow-medium border-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "nitrogen", label: "Nitrogen (N) kg/ha" },
                  { key: "phosphorus", label: "Phosphorus (P) kg/ha" },
                  { key: "potassium", label: "Potassium (K) kg/ha" },
                  { key: "ph", label: "pH Level" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-12" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Crop Type</Label>
                <Select value={form.crop_type} onValueChange={(v) => setForm({ ...form, crop_type: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["rice", "wheat", "corn", "cotton", "sugarcane", "soybean", "potato", "tomato"].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Detected Disease (optional)</Label>
                <Select value={form.disease} onValueChange={(v) => setForm({ ...form, disease: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Healthy</SelectItem>
                    {["bacterial_spot", "early_blight", "late_blight", "leaf_mold", "leaf_blast",
                      "brown_spot", "bacterial_blight", "mosaic_virus"].map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">{d.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white h-12 text-lg">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</> : "Get AI Recommendations"}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            {result ? (
              <>
                {result.all_recommendations.map((rec, i) => (
                  <Card key={i} className="p-6 gradient-card border-0 shadow-soft animate-fade-in">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className={`${priorityColor(rec.priority)} text-white mb-2 capitalize`}>
                          {rec.priority} priority
                        </Badge>
                        <h3 className="font-bold text-lg">{rec.type}</h3>
                        <p className="text-primary font-semibold">{rec.product}</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1"><strong>Dosage:</strong> {rec.dosage}</p>
                    <p className="text-sm text-muted-foreground"><strong>Timing:</strong> {rec.timing}</p>
                  </Card>
                ))}

                <Card className="p-6 gradient-card border-0 shadow-soft">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Precautions
                  </h3>
                  <ul className="space-y-2">
                    {result.precautions.map((p, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Card>

                {result.nlp_suggestion && (
                  <Card className="p-6 gradient-primary text-white border-0 shadow-strong">
                    <h3 className="font-bold mb-3">AI NLP Analysis</h3>
                    <p className="text-white/90 text-sm whitespace-pre-line">{result.nlp_suggestion}</p>
                    <p className="text-xs text-white/60 mt-3">Model: {result.model}</p>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-8 gradient-card border-0 h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">Enter soil data to get AI fertilizer recommendations</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FertilizerAI;
