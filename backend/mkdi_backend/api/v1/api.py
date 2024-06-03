from fastapi import APIRouter
from mkdi_backend.api.v1 import auth, organization, version
from mkdi_backend.api.v1.office import office

api_router = APIRouter()
api_router.include_router(version.router, tags=["version"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(organization.router, prefix="/org", tags=["organization"])
api_router.include_router(office.router, prefix="/org", tags=["office"])
