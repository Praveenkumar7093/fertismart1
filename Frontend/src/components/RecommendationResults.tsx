import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface RecommendationResultsProps {
  data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    cropType: string;
  };
  onReset: () => void;
}

// Optimal ranges for different crops
const cropRequirements: Record<string, { n: number; p: number; k: number; phMin: number; phMax: number }> = {
  rice: { n: 300, p: 50, k: 200, phMin: 5.5, phMax: 6.5 },
  wheat: { n: 280, p: 60, k: 180, phMin: 6.0, phMax: 7.5 },
  corn: { n: 350, p: 70, k: 220, phMin: 5.8, phMax: 7.0 },
  cotton: { n: 300, p: 55, k: 200, phMin: 5.5, phMax: 6.5 },
  sugarcane: { n: 400, p: 80, k: 250, phMin: 6.0, phMax: 7.5 },
  soybean: { n: 150, p: 60, k: 180, phMin: 6.0, phMax: 7.0 },
  potato: { n: 320, p: 75, k: 240, phMin: 5.2, phMax: 6.5 },
  tomato: { n: 280, p: 65, k: 210, phMin: 6.0, phMax: 6.8 },
};

const RecommendationResults = ({ data, onReset }: RecommendationResultsProps) => {
  const requirements = cropRequirements[data.cropType] || cropRequirements.wheat;
  
  const nDeficiency = Math.max(0, requirements.n - data.nitrogen);
  const pDeficiency = Math.max(0, requirements.p - data.phosphorus);
  const kDeficiency = Math.max(0, requirements.k - data.potassium);
  
  const phOptimal = data.ph >= requirements.phMin && data.ph <= requirements.phMax;
  const phStatus = data.ph < requirements.phMin ? "low" : data.ph > requirements.phMax ? "high" : "optimal";

  const getNutrientStatus = (current: number, required: number) => {
    const percentage = (current / required) * 100;
    if (percentage >= 90) return { status: "optimal", color: "bg-accent" };
    if (percentage >= 70) return { status: "adequate", color: "bg-primary" };
    if (percentage >= 50) return { status: "low", color: "bg-amber-500" };
    return { status: "deficient", color: "bg-destructive" };
  };

  const nStatus = getNutrientStatus(data.nitrogen, requirements.n);
  const pStatus = getNutrientStatus(data.phosphorus, requirements.p);
  const kStatus = getNutrientStatus(data.potassium, requirements.k);

  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="ghost"
          onClick={onReset}
          className="mb-6 hover:bg-primary/10 transition-smooth"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Analysis
        </Button>

        <div className="space-y-6 animate-slide-up">
          {/* Header Card */}
          <Card className="p-8 gradient-card shadow-medium border-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
                <p className="text-muted-foreground text-lg capitalize">
                  For {data.cropType} cultivation
                </p>
              </div>
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </Card>

          {/* Soil Test Results */}
          <Card className="p-8 gradient-card shadow-soft border-0">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Your Soil Test Results
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-background/50">
                <p className="text-sm text-muted-foreground mb-1">Nitrogen (N)</p>
                <p className="text-3xl font-bold">{data.nitrogen}</p>
                <p className="text-xs text-muted-foreground">kg/ha</p>
                <Badge className={`mt-2 ${nStatus.color} text-white`}>{nStatus.status}</Badge>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50">
                <p className="text-sm text-muted-foreground mb-1">Phosphorus (P)</p>
                <p className="text-3xl font-bold">{data.phosphorus}</p>
                <p className="text-xs text-muted-foreground">kg/ha</p>
                <Badge className={`mt-2 ${pStatus.color} text-white`}>{pStatus.status}</Badge>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50">
                <p className="text-sm text-muted-foreground mb-1">Potassium (K)</p>
                <p className="text-3xl font-bold">{data.potassium}</p>
                <p className="text-xs text-muted-foreground">kg/ha</p>
                <Badge className={`mt-2 ${kStatus.color} text-white`}>{kStatus.status}</Badge>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50">
                <p className="text-sm text-muted-foreground mb-1">pH Level</p>
                <p className="text-3xl font-bold">{data.ph}</p>
                <p className="text-xs text-muted-foreground">scale</p>
                <Badge className={`mt-2 ${phOptimal ? "bg-accent" : "bg-amber-500"} text-white`}>
                  {phStatus}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Deficiency Analysis */}
          <Card className="p-8 gradient-card shadow-soft border-0">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Deficiency Analysis
            </h2>
            <div className="space-y-4">
              {nDeficiency > 0 ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="font-semibold text-lg mb-1">Nitrogen Deficiency</p>
                  <p className="text-muted-foreground">
                    Your soil needs an additional <span className="font-bold text-destructive">{nDeficiency.toFixed(1)} kg/ha</span> of Nitrogen
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="font-semibold text-lg mb-1">Nitrogen - Adequate</p>
                  <p className="text-muted-foreground">Your nitrogen levels are sufficient</p>
                </div>
              )}

              {pDeficiency > 0 ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="font-semibold text-lg mb-1">Phosphorus Deficiency</p>
                  <p className="text-muted-foreground">
                    Your soil needs an additional <span className="font-bold text-destructive">{pDeficiency.toFixed(1)} kg/ha</span> of Phosphorus
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="font-semibold text-lg mb-1">Phosphorus - Adequate</p>
                  <p className="text-muted-foreground">Your phosphorus levels are sufficient</p>
                </div>
              )}

              {kDeficiency > 0 ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="font-semibold text-lg mb-1">Potassium Deficiency</p>
                  <p className="text-muted-foreground">
                    Your soil needs an additional <span className="font-bold text-destructive">{kDeficiency.toFixed(1)} kg/ha</span> of Potassium
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="font-semibold text-lg mb-1">Potassium - Adequate</p>
                  <p className="text-muted-foreground">Your potassium levels are sufficient</p>
                </div>
              )}

              {!phOptimal && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="font-semibold text-lg mb-1">pH Adjustment Needed</p>
                  <p className="text-muted-foreground">
                    {phStatus === "low" 
                      ? "Your soil is too acidic. Consider adding lime to raise pH."
                      : "Your soil is too alkaline. Consider adding sulfur or organic matter to lower pH."}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Fertilizer Recommendations */}
          <Card className="p-8 gradient-primary text-white shadow-strong border-0">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Recommended Fertilizers
            </h2>
            <div className="space-y-4">
              {nDeficiency > 0 && (
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <p className="font-semibold text-lg mb-2">Urea (46-0-0)</p>
                  <p className="text-white/90">
                    Apply <span className="font-bold">{(nDeficiency / 0.46).toFixed(1)} kg/ha</span>
                  </p>
                  <p className="text-sm text-white/70 mt-1">Split application recommended: 50% at basal, 25% at tillering, 25% at flowering</p>
                </div>
              )}

              {pDeficiency > 0 && (
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <p className="font-semibold text-lg mb-2">Single Super Phosphate (0-16-0)</p>
                  <p className="text-white/90">
                    Apply <span className="font-bold">{(pDeficiency / 0.16).toFixed(1)} kg/ha</span>
                  </p>
                  <p className="text-sm text-white/70 mt-1">Apply as basal dose before sowing</p>
                </div>
              )}

              {kDeficiency > 0 && (
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <p className="font-semibold text-lg mb-2">Muriate of Potash (0-0-60)</p>
                  <p className="text-white/90">
                    Apply <span className="font-bold">{(kDeficiency / 0.60).toFixed(1)} kg/ha</span>
                  </p>
                  <p className="text-sm text-white/70 mt-1">Split application: 50% at basal, 50% at active growth stage</p>
                </div>
              )}

              {nDeficiency === 0 && pDeficiency === 0 && kDeficiency === 0 && (
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <p className="font-semibold text-lg mb-2">All Nutrients Adequate</p>
                  <p className="text-white/90">
                    Your soil has sufficient NPK levels. Consider maintenance fertilization only.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Tips */}
          <Card className="p-8 gradient-card shadow-soft border-0">
            <h3 className="text-xl font-bold mb-4">Important Tips</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Always conduct a soil test before each cropping season for best results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Apply fertilizers at the right time and in split doses for better nutrient uptake</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Consider adding organic matter to improve soil structure and water retention</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Monitor crop growth and adjust fertilizer application based on field observations</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResults;
