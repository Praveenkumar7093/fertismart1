import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import SoilTestForm from "@/components/SoilTestForm";
import RecommendationResults from "@/components/RecommendationResults";

interface SoilTestData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  cropType: string;
}

const SoilTestPage = () => {
  const [results, setResults] = useState<SoilTestData | null>(null);

  if (results) {
    return (
      <AppLayout>
        <RecommendationResults data={results} onReset={() => setResults(null)} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SoilTestForm onSubmit={setResults} onBack={() => window.history.back()} />
    </AppLayout>
  );
};

export default SoilTestPage;
