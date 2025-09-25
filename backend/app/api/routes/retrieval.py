from app.services.retrieval import BaseRetrieval
from app.api.deps import get_retrieval_service
from fastapi import APIRouter, Depends
from app.schemas import LogicMillQuery

router = APIRouter(prefix="/retrieval", tags=["retrieval"])

@router.post("/")
def retrieve(query: LogicMillQuery, base_retrieval: BaseRetrieval = Depends(get_retrieval_service)):
    return base_retrieval.retrieve(query)