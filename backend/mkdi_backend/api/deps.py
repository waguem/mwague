from typing import Generator
from uuid import UUID

from fastapi import Security
from fastapi.security import HTTPBearer
from fastapi.security.api_key import APIKeyHeader, APIKeyQuery
from mkdi_backend.database import engine
from sqlmodel import Session

api_key_query = APIKeyQuery(name="api_key", scheme_name="api-key", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", scheme_name="api-key", auto_error=False)
oasst_user_query = APIKeyQuery(name="oasst_user", scheme_name="oasst-user", auto_error=False)
oasst_user_header = APIKeyHeader(name="x-oasst-user", scheme_name="oasst-user", auto_error=False)

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
