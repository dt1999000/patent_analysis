// types.ts
export interface DataRequest {
  query: string;
}

export interface OverviewResponse {
  noveltyScore: number;
  novelAspects: string[];
  priorArtConcerns: string[];
  supportingEvidence: {
    numberDocumentsAnalyzed: number;
    avgSemanticSimilarity: number;
  };
  keyTakeaways: {
    noveltyLevel: "Low" | "Medium" | "High";
    noveltyReasoning: string;
    competitiveLandscapeLevel: "Low" | "Medium" | "High";
    competitiveLandscapeReasoning: string;
    licensingOpportunityLevel: "Low" | "Medium" | "High";
    licensingOpportunityReasoning: string;
  };
}

export interface RetrievedDocument {
  id: string;
  type: string;
  title: string;
  abstract: string;
  institution: string[];
  author: string[];
  similarityScore: number;
}

export interface SimilarWorkResponse {
  documents: RetrievedDocument[];
}

export interface DataResponse {
  overview: OverviewResponse;
  similarWork: SimilarWorkResponse;
  // TODO: add types and interfaces for these later
  keyPlayers: any;
  licensingMap: any;
  attorneyBrief: any;
}
