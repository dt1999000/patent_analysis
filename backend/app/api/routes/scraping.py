from app.services.scraping import ScrapingService
from app.api.deps import get_scraping_service
from fastapi import APIRouter, Depends
from app.schemas import PublicationFull, PublicationSimple

router = APIRouter(prefix="/scraping", tags=["scraping"])

@router.get("/scraping/{work_id}", response_model=PublicationFull)
def get_publication(work_id: str, scraping_service: ScrapingService = Depends(get_scraping_service)):
    """
    Get publication details by work ID
    """
    return scraping_service.get_publication(work_id)