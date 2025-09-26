from collections.abc import Generator
from typing import Annotated

from app.services.retrieval import Retrieval, BaseRetrieval
from app.services.scraping import ScrapingService
from app.services.llm import BaseLLMService
from app.services.analyze.analyze import BaseAnalyzeService, AnalyzeService
from app.services.ingest import IngestService
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import TokenPayload, User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_retrieval_service() -> Retrieval:
    return BaseRetrieval()

def get_scraping_service() -> ScrapingService:
    return ScrapingService()


def get_llm_service() -> BaseLLMService:
    return BaseLLMService()

def get_analyze_service(llm_service: BaseLLMService = Depends(get_llm_service)) -> AnalyzeService:
    return BaseAnalyzeService(llm_service) 

def get_ingest_service(retrieval_service: Retrieval = Depends(get_retrieval_service), scraping_service: ScrapingService = Depends(get_scraping_service)) -> IngestService:
    return IngestService(retrieval_service, scraping_service)