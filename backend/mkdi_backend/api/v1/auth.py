from fastapi import APIRouter, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from mkdi_backend.api.deps import KcUser, get_user_info
from mkdi_backend.config import settings

# This is used for fastapi docs authentification
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.KC_AUTHORIZATION_URL,
    tokenUrl=settings.KC_TOKEN_URL,
)

router = APIRouter()
# get token header


@router.get("/secure")
async def root(user: KcUser = Depends(get_user_info)):
    return {"message": f"Hello {user.username} you have the following service: {user.realm_roles}"}
