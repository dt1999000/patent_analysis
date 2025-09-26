import type { DataRequest, DataResponse, OverviewResponse, SimilarWorkResponse, RetrievedDocument } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeResearch(
  payload: DataRequest
): Promise<DataResponse> {
  // Compose the DataResponse by calling existing backend endpoints
  const [noveltyRes, retrievalRes] = await Promise.all([
    fetch(`${API_BASE}/api/v1/analyze/novelty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: payload.query }),
    }),
    fetch(`${API_BASE}/api/v1/retrieval/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        abstract: payload.query,
        amount: 25,
        model: "patspecter",
      }),
    }),
  ]);

  if (!noveltyRes.ok) {
    throw new Error(`Novelty HTTP ${noveltyRes.status}`);
  }
  if (!retrievalRes.ok) {
    throw new Error(`Retrieval HTTP ${retrievalRes.status}`);
  }

  const noveltyJson: {
    novelty_assesment: string;
    highest_similarity_score: number;
    average_similarity_score: number;
    document_count: number;
  } = await noveltyRes.json();

  const retrievalJson: {
    response: Array<{
      id: string;
      score: number;
      index: string; // "patents" | "publications"
      document: { title: string; url: string };
    }>;
  } = await retrievalRes.json();

  const overview: OverviewResponse = mapNoveltyToOverview(noveltyJson);
  const similarWork: SimilarWorkResponse = {
    documents: (retrievalJson?.response || []).map((item): RetrievedDocument => ({
      id: item.id,
      type: item.index === "patents" ? "patent" : "publication",
      title: item.document?.title || "Untitled",
      abstract: "",
      institution: [],
      author: [],
      similarityScore: item.score ?? 0,
    })),
  };

  return {
    overview,
    similarWork,
    keyPlayers: null,
    licensingMap: null,
    attorneyBrief: null,
  };
}

function mapNoveltyToOverview(n: {
  novelty_assesment: string;
  highest_similarity_score: number;
  average_similarity_score: number;
  document_count: number;
}): OverviewResponse {
  const noveltyScore = Math.max(
    0,
    Math.min(100, Math.round((1 - (n.average_similarity_score ?? 0)) * 100))
  );

  const level =
    noveltyScore >= 70 ? "High" : noveltyScore >= 40 ? "Medium" : "Low";

  return {
    noveltyScore,
    novelAspects: [
      `Assessment: ${n.novelty_assesment}`,
      "Distinct topic mixture vs. nearest neighbors",
    ],
    priorArtConcerns: [
      `Highest similarity observed: ${Math.round(
        (n.highest_similarity_score ?? 0) * 100
      )}%`,
    ],
    supportingEvidence: {
      numberDocumentsAnalyzed: n.document_count ?? 0,
      avgSemanticSimilarity: Number((n.average_similarity_score ?? 0).toFixed(3)),
    },
    keyTakeaways: {
      noveltyLevel: level as any,
      noveltyReasoning:
        "Computed from average semantic similarity to retrieved prior art.",
      competitiveLandscapeLevel: level as any,
      competitiveLandscapeReasoning:
        "Higher similarity indicates denser landscape; lower implies sparser competition.",
      licensingOpportunityLevel: level as any,
      licensingOpportunityReasoning:
        "Proxy from novelty score; refine with market signals when available.",
    },
  };
}
