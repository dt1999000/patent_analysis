import { useState } from "react";
import { Landing } from "@/components/Landing";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";
import { DataResponse } from "@/api/types";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "results">(
    "landing"
  );
  const [analysisData, setAnalysisData] = useState<DataResponse | null>(null);
  const [abstract, setAbstract] = useState<string>("");

  const handleAnalyze = (abstract: string, res: DataResponse) => {
    setAbstract(abstract);
    setAnalysisData(res);
    setCurrentView("results");
  };

  const handleBack = () => {
    setCurrentView("landing");
  };

  return (
    <>
      {currentView === "landing" && <Landing onAnalyze={handleAnalyze} />}
      {currentView === "results" && (
        <ResultsWorkspace
          abstract={abstract}
          res={analysisData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default Index;
