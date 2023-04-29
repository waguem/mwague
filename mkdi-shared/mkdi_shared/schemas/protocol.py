from typing import Literal

from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode
from pydantic import BaseModel


class User(BaseModel):
    id: str
    diplay_name: str
    auth_method: Literal["local", "google", "system"]


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str
