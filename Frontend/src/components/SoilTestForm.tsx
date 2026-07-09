import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SoilTestFormProps {
  onSubmit: (data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    cropType: string;
  }) => void;
  onBack: () => void;
}

const SoilTestForm = ({ onSubmit, onBack }: SoilTestFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    cropType: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium || !formData.ph || !formData.cropType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    const nitrogen = parseFloat(formData.nitrogen);
    const phosphorus = parseFloat(formData.phosphorus);
    const potassium = parseFloat(formData.potassium);
    const ph = parseFloat(formData.ph);

    if (isNaN(nitrogen) || isNaN(phosphorus) || isNaN(potassium) || isNaN(ph)) {
      toast({
        title: "Invalid Values",
        description: "Please enter valid numbers for all fields.",
        variant: "destructive",
      });
      return;
    }

    if (ph < 0 || ph > 14) {
      toast({
        title: "Invalid pH",
        description: "pH value must be between 0 and 14.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      nitrogen,
      phosphorus,
      potassium,
      ph,
      cropType: formData.cropType,
    });
  };

  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-primary/10 transition-smooth"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8 md:p-12 shadow-medium border-0 gradient-card animate-slide-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Soil Test Analysis</h1>
              <p className="text-muted-foreground">Enter your laboratory test results</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nitrogen" className="text-base font-semibold">
                  Nitrogen (N) <span className="text-muted-foreground font-normal">kg/ha</span>
                </Label>
                <Input
                  id="nitrogen"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 250"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                  className="h-12 border-border/50 focus:border-primary transition-smooth"
                />
                <p className="text-sm text-muted-foreground">Available nitrogen in soil</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phosphorus" className="text-base font-semibold">
                  Phosphorus (P) <span className="text-muted-foreground font-normal">kg/ha</span>
                </Label>
                <Input
                  id="phosphorus"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 35"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                  className="h-12 border-border/50 focus:border-primary transition-smooth"
                />
                <p className="text-sm text-muted-foreground">Available phosphorus in soil</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="potassium" className="text-base font-semibold">
                  Potassium (K) <span className="text-muted-foreground font-normal">kg/ha</span>
                </Label>
                <Input
                  id="potassium"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 180"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                  className="h-12 border-border/50 focus:border-primary transition-smooth"
                />
                <p className="text-sm text-muted-foreground">Available potassium in soil</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ph" className="text-base font-semibold">
                  pH Level
                </Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 6.5"
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                  className="h-12 border-border/50 focus:border-primary transition-smooth"
                />
                <p className="text-sm text-muted-foreground">Soil pH (0-14 scale)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cropType" className="text-base font-semibold">
                Crop Type
              </Label>
              <Select value={formData.cropType} onValueChange={(value) => setFormData({ ...formData, cropType: value })}>
                <SelectTrigger id="cropType" className="h-12 border-border/50 focus:border-primary transition-smooth">
                  <SelectValue placeholder="Select your crop" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="corn">Corn (Maize)</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane</SelectItem>
                  <SelectItem value="soybean">Soybean</SelectItem>
                  <SelectItem value="potato">Potato</SelectItem>
                  <SelectItem value="tomato">Tomato</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Select the crop you plan to grow</p>
            </div>

            <div className="pt-6 space-y-4">
              <Button
                type="submit"
                size="lg"
                className="w-full gradient-primary text-white font-semibold h-14 text-lg rounded-xl shadow-medium hover:shadow-strong transition-smooth hover:scale-105"
              >
                Analyze & Get Recommendations
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Your data will be analyzed to provide tailored fertilizer recommendations
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SoilTestForm;
