from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, retrieval, scraping, llm, analyze, ingest
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(retrieval.router)
api_router.include_router(scraping.router)
api_router.include_router(llm.router)
api_router.include_router(analyze.router)
api_router.include_router(ingest.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
