import { useState, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Leaf, Brain, Eye, AlertTriangle, CheckCircle2, Loader2, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, DiseaseResult } from "@/services/api";
import { Link } from "react-router-dom";

const DiseaseDetection = () => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [model, setModel] = useState("mobilenetv2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await api.detectDisease(file, model);
      setResult(data);
    } catch (err) {
      toast({
        title: "Detection Failed",
        description: err instanceof Error ? err.message : "Could not analyze image. Is the backend running?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s: string) =>
    s === "high" || s === "critical" ? "bg-destructive" : s === "moderate" ? "bg-amber-500" : "bg-accent";

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl py-10 px-4">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Transfer Learning · Grad-CAM · Multi-Model AI
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Crop Disease Detection</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a leaf photo for AI-powered disease diagnosis using MobileNetV2, ResNet50, or EfficientNetB0
            with Grad-CAM visualization showing affected areas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-8 gradient-card shadow-medium border-0 animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Leaf Image
            </h2>

            <div
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-smooth mb-6"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f?.type.startsWith("image/")) handleFile(f);
              }}
            >
              {preview ? (
                <img src={preview} alt="Leaf preview" className="max-h-64 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="py-8">
                  <Leaf className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                  <p className="font-medium">Drag & drop or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG — crop leaf photo</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">AI Model (Transfer Learning)</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobilenetv2">MobileNetV2 (Recommended)</SelectItem>
                    <SelectItem value="resnet50">ResNet50</SelectItem>
                    <SelectItem value="efficientnetb0">EfficientNetB0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleDetect}
                disabled={!file || loading}
                className="w-full gradient-primary text-white h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Detect Disease
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-6 animate-fade-in">
            {!result && !loading && (
              <Card className="p-8 gradient-card shadow-soft border-0 h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p>Upload a leaf image and run detection to see AI results with Grad-CAM visualization</p>
                </div>
              </Card>
            )}

            {result && (
              <>
                <Card className="p-6 gradient-card shadow-medium border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className={`mb-2 ${result.is_healthy ? "bg-accent" : severityColor(result.severity)} text-white`}>
                        {result.is_healthy ? "Healthy" : result.severity.toUpperCase() + " Severity"}
                      </Badge>
                      <h3 className="text-2xl font-bold">{result.disease_label}</h3>
                      <p className="text-muted-foreground">{result.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{result.confidence}%</p>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Affected Leaf Area</span>
                      <span className="font-semibold">{result.affected_area_percent}%</span>
                    </div>
                    <Progress value={result.affected_area_percent} className="h-2" />
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Model: {result.model_used} · Crop: {result.crop_type}
                  </p>
                </Card>

                <Tabs defaultValue="gradcam">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="gradcam">Grad-CAM</TabsTrigger>
                    <TabsTrigger value="compare">Compare</TabsTrigger>
                    <TabsTrigger value="all">All Predictions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="gradcam">
                    <Card className="p-4 gradient-card border-0">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        Grad-CAM Heatmap — Affected Area Highlighted
                      </p>
                      {result.gradcam_image && (
                        <img
                          src={`data:image/jpeg;base64,${result.gradcam_image}`}
                          alt="Grad-CAM visualization"
                          className="w-full rounded-lg"
                        />
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="compare">
                    <Card className="p-6 gradient-card border-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-sm">Healthy Leaf</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.comparison.healthy}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="font-semibold text-sm">Detected Pattern</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.comparison.detected}</p>
                        </div>
                      </div>
                      {result.original_image && (
                        <img
                          src={`data:image/jpeg;base64,${result.original_image}`}
                          alt="Original leaf"
                          className="w-full max-h-48 object-contain rounded-lg"
                        />
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="all">
                    <Card className="p-6 gradient-card border-0 space-y-3">
                      {result.all_predictions.map((p) => (
                        <div key={p.disease} className="flex items-center justify-between">
                          <span className="capitalize text-sm">{p.disease.replace(/_/g, " ")}</span>
                          <div className="flex items-center gap-3 flex-1 mx-4">
                            <Progress value={p.confidence} className="h-2" />
                          </div>
                          <span className="text-sm font-semibold w-14 text-right">{p.confidence}%</span>
                        </div>
                      ))}
                    </Card>
                  </TabsContent>
                </Tabs>

                <Card className="p-6 gradient-primary text-white border-0 shadow-strong">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Explanation
                  </h3>
                  <p className="text-white/90 text-sm whitespace-pre-line leading-relaxed">
                    {result.ai_explanation}
                  </p>
                  {!result.is_healthy && (
                    <Link to={`/fertilizer?disease=${result.disease}`}>
                      <Button variant="secondary" className="mt-4">
                        Get Fertilizer & Treatment Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DiseaseDetection;
