from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import SecurityScopes
from loguru import logger
from mkdi_backend.api.deps import KcUser, get_user_info


def check_authorization(
    *, scopes: SecurityScopes, user: Annotated[KcUser, Depends(get_user_info)]
) -> KcUser:
    """Check if the user has the required scopes.

    Args:
        scopes (SecurityScopes): The required scopes for authorization.
        user (KcUser): The user object.

    Raises:
        HTTPException: If the user does not have enough permissions.

    Returns:
        KcUser: The user object.
    """
    authenticate_value = f'Bearer scope="{scopes.scope_str}"' if scopes.scopes else "Bearer"

    for scope in scopes.scopes:
        if scope not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )

    return user
