from typing import List

from fastapi import APIRouter, Depends
from app.api.deps import get_analyze_service
from app.services.analyze.analyze import (
    AnalyzeService,
    DocumentTopics,
    GraphAnalysisResult,
)

from app.services.ingest import IngestedDocument



router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/topic")
def analyze_topic(document_text: str, analyze_service: AnalyzeService = Depends(get_analyze_service)) -> DocumentTopics:
    return analyze_service.analyze_topic(document_text)


@router.post("/network", response_model=GraphAnalysisResult)
def analyze_network(
    documents: List[IngestedDocument],
    analyze_service: AnalyzeService = Depends(get_analyze_service),
) -> GraphAnalysisResult:
    return analyze_service.aggregate_rank_analyze(documents)