import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sprout, TrendingUp, Shield, ArrowRight, Brain, Leaf, MessageCircle,
  BarChart3, FlaskConical, Zap, Eye,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

const features = [
  {
    icon: Brain,
    color: "gradient-primary",
    title: "AI Disease Detection",
    description: "Transfer learning with MobileNetV2, ResNet50 & EfficientNetB0. Grad-CAM visualization highlights affected leaf areas with confidence scores.",
    link: "/disease",
    badge: "Grad-CAM",
  },
  {
    icon: Sprout,
    color: "bg-accent",
    title: "Crop Recommendation",
    description: "Random Forest & XGBoost models analyze soil type, temperature, rainfall, humidity and season to recommend the best crops.",
    link: "/crop",
    badge: "ML Ensemble",
  },
  {
    icon: FlaskConical,
    color: "bg-secondary",
    title: "Fertilizer AI",
    description: "Decision Tree classifier with NLP-powered suggestions. Disease-aware treatment plans, precautions, and fertilizer dosages.",
    link: "/fertilizer",
    badge: "NLP + DT",
  },
  {
    icon: BarChart3,
    color: "gradient-primary",
    title: "Yield Prediction",
    description: "Linear Regression, Random Forest & XGBoost ensemble predicts expected crop yield from weather, soil and nutrient data.",
    link: "/yield",
    badge: "3 Models",
  },
  {
    icon: MessageCircle,
    color: "bg-accent",
    title: "AI Farmer Assistant",
    description: "Ask anything — leaf problems, best crops, fungus prevention. Powered by Groq LLM with intelligent fallback.",
    link: "/chat",
    badge: "Groq LLM",
  },
  {
    icon: Shield,
    color: "bg-secondary",
    title: "Soil Analysis",
    description: "Enter NPK and pH values for precise deficiency detection and crop-specific fertilizer recommendations.",
    link: "/soil-test",
    badge: "NPK Analysis",
  },
];

const steps = [
  { num: 1, title: "Upload or Enter Data", desc: "Upload a leaf photo for disease detection, or enter soil/climate parameters.", color: "gradient-primary" },
  { num: 2, title: "AI Model Analysis", desc: "Transfer learning CNNs, Random Forest, XGBoost, and Decision Trees process your data.", color: "bg-accent" },
  { num: 3, title: "Get Smart Recommendations", desc: "Receive disease diagnosis with Grad-CAM, crop suggestions, yield forecasts, and treatment plans.", color: "bg-secondary" },
  { num: 4, title: "Ask AI Assistant", desc: "Chat with the AI Farmer Assistant for personalized guidance on any farming question.", color: "gradient-primary" },
];

const Index = () => (
  <div className="min-h-screen">
    <AppHeader />

    {/* Hero */}
    <section className="relative overflow-hidden gradient-hero">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(28_80%_52%/0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(205_85%_55%/0.2),transparent_60%)]" />
      </div>
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            AI-Powered Smart Agriculture Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Intelligent Farming
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Powered by AI & Machine Learning
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Disease detection with Grad-CAM, crop recommendations, yield prediction,
            fertilizer AI, and a smart farmer chatbot — all in one platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/disease">
              <Button size="lg" className="gradient-primary text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-medium hover:shadow-strong transition-smooth hover:scale-105">
                <Leaf className="mr-2 h-5 w-5" />
                Detect Disease
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-lg rounded-xl border-primary/30 hover:bg-primary/5 transition-smooth hover:scale-105">
                <MessageCircle className="mr-2 h-5 w-5" />
                AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* AI Modules Grid */}
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">AI Modules</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Six intelligent modules using state-of-the-art ML and deep learning
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link key={f.title} to={f.link}>
              <Card
                className="p-7 gradient-card shadow-soft hover:shadow-medium transition-smooth hover:scale-[1.02] border-0 h-full cursor-pointer animate-fade-in group"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center shadow-soft`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{f.badge}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-smooth">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-smooth">
                  Open module <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Tech Stack Banner */}
    <section className="py-12 px-4 bg-primary/5">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Technologies Used</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "MobileNetV2", "ResNet50", "EfficientNetB0", "Grad-CAM",
            "Random Forest", "XGBoost", "Decision Tree", "Linear Regression",
            "Transfer Learning", "Groq LLM", "NLP", "Flask API",
          ].map((tech) => (
            <span key={tech} className="px-3 py-1.5 rounded-full bg-white border border-border/60 text-sm font-medium shadow-soft">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section id="how-it-works" className="py-20 px-4 gradient-hero">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="space-y-5">
          {steps.map((step) => (
            <Card key={step.num} className="p-6 gradient-card shadow-soft border-0 hover:shadow-medium transition-smooth">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-soft`}>
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 flex flex-wrap gap-4 justify-center">
          <Link to="/disease">
            <Button size="lg" className="gradient-primary text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-medium hover:shadow-strong transition-smooth hover:scale-105">
              <Eye className="mr-2 h-5 w-5" />
              Try Disease Detection
            </Button>
          </Link>
          <Link to="/soil-test">
            <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-lg rounded-xl">
              <TrendingUp className="mr-2 h-5 w-5" />
              Soil Analysis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default Index;
