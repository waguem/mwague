from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode
from pydantic import BaseModel


class User(BaseModel):
    id: str
    display_name: str
    username: str
    email: str
    auth_method: Literal["local", "google", "system"]


class CreateFrontendUserRequest(User):
    enabled: bool = True
    notes: Optional[str] = None
    password: Optional[str] = None


class FrontEndUser(User):
    user_id: UUID
    enabled: bool
    deleted: bool
    notes: str
    created_date: Optional[datetime] = None


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str
