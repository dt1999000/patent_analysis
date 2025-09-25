from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_llm_service
from app.services.llm import BaseLLMService


class CompleteRequest(BaseModel):
    prompt: str


router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/complete")
def complete(req: CompleteRequest, llm_service: BaseLLMService = Depends(get_llm_service)) -> str:
    return llm_service.complete(req.prompt)







