from app.services.scraping import AlexScraper
from app.api.deps import get_scraping_service
from fastapi import APIRouter, Depends
from app.schemas import Inventor, Publication

router = APIRouter(prefix="/scraping", tags=["scraping"])

@router.get("/scraping/{work_id}", response_model=Publication)
def get_publication(work_id: str, scraping_service: AlexScraper = Depends(get_scraping_service)):
    """
    Get publication details by work ID
    """
    return scraping_service.get_publication(work_id)