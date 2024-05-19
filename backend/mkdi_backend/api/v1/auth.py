from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from mkdi_backend.authproviders import keycloak_openid
from mkdi_backend.config import settings
from pydantic import BaseModel

# This is used for fastapi docs authentification
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.KC_AUTHORIZATION_URL,
    tokenUrl=settings.KC_TOKEN_URL,
)

router = APIRouter()
# get token header


class KcUser(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    realm_roles: list
    client_roles: list


async def get_idp_public_key():
    return (
        "-----BEGIN PUBLIC KEY-----\n"
        f"{keycloak_openid.public_key()}"
        "\n-----END PUBLIC KEY-----"
    )


# Get the payload/token from keycloak
async def get_payload(token: str = Security(oauth2_scheme)) -> dict:
    try:
        return keycloak_openid.decode_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Get user infos from the payload
async def get_user_info(payload: dict = Depends(get_payload)) -> KcUser:
    try:
        return KcUser(
            id=payload.get("sub"),
            username=payload.get("preferred_username"),
            email=payload.get("email"),
            first_name=payload.get("given_name"),
            last_name=payload.get("family_name"),
            realm_roles=payload.get("realm_access", {}).get("roles", []),
            client_roles=payload.get("realm_access", {}).get("roles", []),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/secure")
async def root(user: KcUser = Depends(get_user_info)):
    return {"message": f"Hello {user.username} you have the following service: {user.realm_roles}"}
