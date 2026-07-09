import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DiseaseDetection from "./pages/DiseaseDetection";
import CropRecommendation from "./pages/CropRecommendation";
import YieldPrediction from "./pages/YieldPrediction";
import FertilizerAI from "./pages/FertilizerAI";
import Chatbot from "./pages/Chatbot";
import SoilTestPage from "./pages/SoilTestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/disease" element={<DiseaseDetection />} />
          <Route path="/crop" element={<CropRecommendation />} />
          <Route path="/yield" element={<YieldPrediction />} />
          <Route path="/fertilizer" element={<FertilizerAI />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/soil-test" element={<SoilTestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
