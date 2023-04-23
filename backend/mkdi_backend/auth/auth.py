from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from mkdi_backend.config import Settings
from mkdi_backend.models import Account
from sqlmodel import Session


def create_access_token(data: dict) -> str:
    """
    Create an encoded JSON Web Token (JWT) using the given data.
    """

    expires_delta = timedelta(minutes=Settings.AUTH_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Settings.AUTH_SECRET, algorithm=Settings.AUTH_ALGORITHM)
    return encoded_jwt
