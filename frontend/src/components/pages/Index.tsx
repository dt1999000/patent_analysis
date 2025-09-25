import { useState } from "react";
import { Landing } from "@/components/Landing";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "results">(
    "landing"
  );
  const [analysisData, setAnalysisData] = useState<string>("");

  const handleAnalyze = (abstract: string) => {
    setAnalysisData(abstract);
    setCurrentView("results");
  };

  const handleBack = () => {
    setCurrentView("landing");
  };

  return (
    <>
      {currentView === "landing" && <Landing onAnalyze={handleAnalyze} />}
      {currentView === "results" && (
        <ResultsWorkspace abstract={analysisData} onBack={handleBack} />
      )}
    </>
  );
};

export default Index;
