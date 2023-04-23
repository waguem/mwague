from fastapi import APIRouter
from mkdi_backend.api.v1 import version

api_router = APIRouter()
api_router.include_router(version.router, tags=["version"])
