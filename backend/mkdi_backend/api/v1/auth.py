"""oauth2_scheme is used for fastapi authentification"""

from fastapi.security import OAuth2AuthorizationCodeBearer
from mkdi_backend.config import settings

# This is used for fastapi docs authentification
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.KC_AUTHORIZATION_URL,
    tokenUrl=settings.KC_TOKEN_URL,
)
