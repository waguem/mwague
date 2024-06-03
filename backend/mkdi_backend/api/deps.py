from http import HTTPStatus
from secrets import token_hex
from typing import Generator, Optional
from uuid import UUID

import mkdi_shared.exceptions.mkdi_api_error as mkdi_api_error
from fastapi import Depends, HTTPException, Request, Response, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2AuthorizationCodeBearer
from fastapi.security.api_key import APIKey, APIKeyHeader, APIKeyQuery
from fastapi_limiter.depends import RateLimiter
from loguru import logger
from mkdi_backend.authproviders import keycloak_openid
from mkdi_backend.config import Settings, settings
from mkdi_backend.database import engine

# from mkdi_backend.models import ApiClient
from pydantic import BaseModel, conint
from sqlmodel import Session

api_key_query = APIKeyQuery(name="api_key", scheme_name="api-key", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", scheme_name="api-key", auto_error=False)
mkdi_user_query = APIKeyQuery(name="mkdi_user", scheme_name="mkdi-user", auto_error=False)
mkdi_user_header = APIKeyHeader(name="x-mkdi-user", scheme_name="mkdi-user", auto_error=False)

bearer_token = HTTPBearer(auto_error=False)

# This is used for fastapi docs authentification
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.KC_AUTHORIZATION_URL,
    tokenUrl=settings.KC_TOKEN_URL,
)


def get_db() -> Generator:
    with Session(engine) as db:
        yield db


def get_api_key(
    api_key_query: str = Security(api_key_query),
    api_key_header: str = Security(api_key_header),
) -> str:
    if api_key_query:
        return api_key_query
    else:
        return api_key_header


def get_root_token(bearer_token: HTTPAuthorizationCredentials = Security(bearer_token)) -> str:
    if bearer_token:
        token = bearer_token.credentials
        if token and token in Settings.ROOT_TOKENS:
            return token
    raise mkdi_api_error.MkdiError(
        "Could not validate credentials",
        error_code=mkdi_api_error.MkdiErrorCode.ROOT_TOKEN_NOT_AUTHORIZED,
        http_status_code=mkdi_api_error.HTTPStatus.FORBIDDEN,
    )


# def create_api_client(
#     session: Session,
#     frontend_type: str,
#     description: str,
#     trusted: bool | None = False,
#     admin_email: str | None = None,
#     api_key: str | None = None,
# ) -> ApiClient:
#     # creates a new api client, and returns it
#     # if api_key is None, generates a new random key
#     # if admin_email is None, the user is not an admin
#     # if trusted is None, the user is not trusted
#     # session is a sqlalchemy session
#     # frontend_type is the type of frontend, e.g. "web"
#     # description is a short description of the client
#     # api_key is the key that the client uses to authenticate
#     # the client is created and returned
#     # the client is also added to the session and committed
#     # the session is refreshed and returned
#     if api_key is None:
#         # create the key
#         api_key = token_hex(32)
#     logger.info(f"Creating new api client with {api_key=}")
#     api_client = ApiClient(
#         api_key=api_key,
#         description=description,
#         trusted=trusted,
#         admin_email=admin_email,
#         frontend_type=frontend_type,
#     )
#     session.add(api_client)
#     session.commit()
#     session.refresh(api_client)
#     return api_client


# def api_auth(
#     api_key: APIKey,
#     db: Session,
# ) -> ApiClient:
#     if api_key:
#         api_client = db.query(ApiClient).filter(ApiClient.api_key == api_key).first()
#         if api_client is not None and api_client.enabled:
#             return api_client

#     raise mkdi_api_error.MkdiError(
#         "Could not validate credentials",
#         error_code=mkdi_api_error.MkdiErrorCode.API_CLIENT_NOT_AUTHORIZED,
#         http_status_code=HTTPStatus.FORBIDDEN,
#     )


async def user_identifier(request: Request) -> str:
    """Identify a request by user based on api_key and user header"""
    api_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")
    user = request.headers.get("x-mkdi-user")
    if not user:
        payload = await request.json()
        auth_method = payload.get("user").get("auth_method")
        user_id = payload.get("user").get("id")
        user = f"{auth_method}:{user_id}"
    return f"{api_key}:{user}"


class UserRateLimiter(RateLimiter):
    def __init__(
        self,
        times: int = 100,
        milliseconds: int = 0,
        seconds: int = 0,
        minutes: int = 1,
        hours: int = 0,
    ) -> None:
        super().__init__(times, milliseconds, seconds, minutes, hours, user_identifier)

    async def __call__(
        self, request: Request, response: Response, api_key: str = Depends(get_api_key)
    ) -> None:
        # Skip if rate limiting is disabled
        if not settings.RATE_LIMIT:
            return

        # Attempt to retrieve api_key and user information
        user = (await request.json()).get("user")

        # Skip when api_key and user information are not available
        # (such that it will be handled by `APIClientRateLimiter`)
        if not api_key or not user or not user.get("id"):
            return

        return await super().__call__(request, response)


class APIClientRateLimiter(RateLimiter):
    def __init__(
        self,
        times: int = 10_000,
        milliseconds: int = 0,
        seconds: int = 0,
        minutes: int = 0,
        hours: int = 0,
    ) -> None:
        async def identifier(request: Request) -> Optional[str]:
            """Identify a request based on api_key and user.id"""
            api_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")
            return f"{api_key}"

        super().__init__(times, milliseconds, seconds, minutes, hours, identifier)

    async def __call__(
        self, request: Request, response: Response, api_key: str = Depends(get_api_key)
    ) -> None:
        if not settings.RATE_LIMIT:
            return
        user = (await request.json()).get("user")
        if not api_key or user:
            return
        await super().__call__(request, response)


class KcUser(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    roles: list = []
    organization_id: str = None
    office_id: str = None


# Get the payload/token from keycloak
async def get_payload(token: str = Security(oauth2_scheme)) -> dict:
    introspect = keycloak_openid.introspect(token)
    # make sure the token is active
    if not introspect["active"]:
        logger.info(f"Introspect result: {introspect}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        # introspect user token
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
            roles=payload.get("realm_access", {}).get("roles", []),
            office_id=payload.get("officeId"),
            organization_id=payload.get("organizationId"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
