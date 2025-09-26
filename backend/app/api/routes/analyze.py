from typing import List

from fastapi import APIRouter, Depends
from app.api.deps import get_analyze_service
from app.services.analyze.analyze import (
    AnalyzeService,
    DocumentTopics,
    GraphAnalysisResult,
)

from app.services.ingest import IngestedDocument
from app.services.ingest import IngestService
from app.api.deps import get_ingest_service



router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/topic")
def analyze_topic(document_text: str, analyze_service: AnalyzeService = Depends(get_analyze_service)) -> DocumentTopics:
    return analyze_service.analyze_topic(document_text)

@router.post("/topics")
def analyze_topics(title: str, abstract: str, ingest_service: IngestService = Depends(get_ingest_service), analyze_service: AnalyzeService = Depends(get_analyze_service)) -> List[IngestedDocument]:
    documents = ingest_service.ingest(title, abstract, 10)
    return analyze_service.analyze_topics(documents)

@router.post("/refine/topics")
def refine_topics(title: str, abstract: str, ingest_service: IngestService = Depends(get_ingest_service), analyze_service: AnalyzeService = Depends(get_analyze_service)) -> List[IngestedDocument]:
    documents = ingest_service.ingest(title, abstract, 10)
    return analyze_service.refine_topics(documents)

@router.post("/refine/all")
def refine_all(title: str, abstract: str, amount: int, ingest_service: IngestService = Depends(get_ingest_service), analyze_service: AnalyzeService = Depends(get_analyze_service)) -> List[IngestedDocument]:
    documents = ingest_service.ingest(title, abstract, amount)
    return analyze_service.refine_documents(documents)    


@router.post("/network", response_model=GraphAnalysisResult)
def analyze_network(
    documents: List[IngestedDocument],
    analyze_service: AnalyzeService = Depends(get_analyze_service),
) -> GraphAnalysisResult:
    return analyze_service.aggregate_rank_analyze(documents)