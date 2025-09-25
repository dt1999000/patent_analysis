from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_scraping_service
from app.schemas import Patent, PublicationFull
from app.services.scraping import ScrapingService


router = APIRouter(prefix="/scraping", tags=["scraping"])


@router.get("/patent/{patent_id}", response_model=Patent)
def get_patent(patent_id: str, scraping_service: ScrapingService = Depends(get_scraping_service)):
    data = scraping_service.get_patent(patent_id)
    return Patent(**data)


@router.get("/publication/{publication_id}", response_model=PublicationFull)
def get_publication(publication_id: str, scraping_service: ScrapingService = Depends(get_scraping_service)):
    # Placeholder for now
    return scraping_service.get_publication(publication_id)


