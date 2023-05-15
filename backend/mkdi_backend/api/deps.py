from http import HTTPStatus
from secrets import token_hex
from typing import Generator
from uuid import UUID

import mkdi_shared.exceptions.mkdi_api_error as mkdi_api_error
from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.security.api_key import APIKey, APIKeyHeader, APIKeyQuery
from loguru import logger
from mkdi_backend.config import Settings
from mkdi_backend.database import engine
from mkdi_backend.models import ApiClient
from sqlmodel import Session

api_key_query = APIKeyQuery(name="api_key", scheme_name="api-key", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", scheme_name="api-key", auto_error=False)
mkdi_user_query = APIKeyQuery(name="mkdi_user", scheme_name="mkdi-user", auto_error=False)
mkdi_user_header = APIKeyHeader(name="x-mkdi-user", scheme_name="mkdi-user", auto_error=False)

bearer_token = HTTPBearer(auto_error=False)


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


def create_api_client(
    session: Session,
    frontend_type: str,
    description: str,
    trusted: bool | None = False,
    admin_email: str | None = None,
    api_key: str | None = None,
) -> ApiClient:
    # creates a new api client, and returns it
    # if api_key is None, generates a new random key
    # if admin_email is None, the user is not an admin
    # if trusted is None, the user is not trusted
    # session is a sqlalchemy session
    # frontend_type is the type of frontend, e.g. "web"
    # description is a short description of the client
    # api_key is the key that the client uses to authenticate
    # the client is created and returned
    # the client is also added to the session and committed
    # the session is refreshed and returned
    if api_key is None:
        # create the key
        api_key = token_hex(32)
    logger.info(f"Creating new api client with {api_key=}")
    api_client = ApiClient(
        api_key=api_key,
        description=description,
        trusted=trusted,
        admin_email=admin_email,
        frontend_type=frontend_type,
    )
    session.add(api_client)
    session.commit()
    session.refresh(api_client)
    return api_client


def api_auth(
    api_key: APIKey,
    db: Session,
) -> ApiClient:
    if api_key:
        api_client = db.query(ApiClient).filter(ApiClient.api_key == api_key).first()
        if api_client is not None and api_client.enabled:
            return api_client

    raise mkdi_api_error.MkdiError(
        "Could not validate credentials",
        error_code=mkdi_api_error.MkdiErrorCode.API_CLIENT_NOT_AUTHORIZED,
        http_status_code=HTTPStatus.FORBIDDEN,
    )
