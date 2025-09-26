from app.services.ingest import IngestService
from app.api.deps import get_ingest_service
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/ingest", tags=["ingest"])

@router.post("/")
def retrieve(title: str, abstract: str, amount: int, ingest_service: IngestService = Depends(get_ingest_service)):
    return ingest_service.ingest(title, abstract, amount)