from fastapi import APIRouter
from mkdi_backend.api.v1 import auth, version

api_router = APIRouter()
api_router.include_router(version.router, tags=["version"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication","autorization"])
