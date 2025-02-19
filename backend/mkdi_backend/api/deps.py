from typing import Annotated, Generator

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2AuthorizationCodeBearer, SecurityScopes
from loguru import logger
from mkdi_backend.authproviders import RoleProvider, keycloak_openid
from mkdi_backend.config import settings
from mkdi_backend.database import engine
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.roles import Role
from mkdi_backend.repositories.employee import EmployeeRepository
from mkdi_backend.dbmanager import get_db_session
from sqlalchemy.ext.asyncio import AsyncSession

# from mkdi_backend.models import ApiClient
from sqlmodel import Session

# This is used for fastapi docs authentification
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.KC_AUTHORIZATION_URL,
    tokenUrl=settings.KC_TOKEN_URL,
)

AsyncDBSessionDep = Annotated[AsyncSession, Depends(get_db_session)]


def get_db() -> Generator:
    with Session(engine) as db:
        yield db


DBSessionDep = Annotated[Session, Depends(get_db)]


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
        ) from e


# Get user infos from the payload
async def get_user_info(
    payload: dict = Depends(get_payload), db: Session = Depends(get_db)
) -> KcUser:
    try:
        userdb = EmployeeRepository(db).get_employee(
            username=payload.get("preferred_username"),
            email=payload.get("email"),
            organization_id=payload.get("organizationId"),
        )

        if not userdb:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return KcUser(
            id=payload.get("sub"),
            username=payload.get("preferred_username"),
            email=payload.get("email"),
            first_name=payload.get("given_name"),
            last_name=payload.get("family_name"),
            roles=payload.get("realm_access", {}).get("roles", []),
            office_id=payload.get("officeId"),
            organization_id=payload.get("organizationId"),
            user_db_id=str(userdb.id),
        )
    except Exception as e:
        from loguru import logger

        logger.error(f"Error getting user info {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),  # "Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def get_roles_deps(role, roles_deps: list[str] = RoleProvider().get_roles()):
    import re

    # transform realm_roles to remove _0,_1,_2 at then end
    # ["sofware_admin_0","office_admin_2","org_admin_1"] -> ["sofware_admin","office_admin","org_admin"]
    pattern = re.compile(r"^\w+_\w+_\d+$")
    for r in roles_deps:
        if not pattern.match(r):
            raise ValueError(f"Role {r} does not follow the pattern tok_tok_number")

    transformed_roles = [r.rsplit("_", 1)[0] for r in roles_deps]
    # Find the index of the role in the transformed list
    role_index = transformed_roles.index(role)

    return roles_deps[: role_index + 1]


def hasSufficientPermissions(user_roles, required_roles: list = []) -> bool:
    """Check if the user has the required roles.

    Args:
        user (KcUser): The user object.
        required_roles (list): The required roles for authorization.

    Returns:
        bool: True if the user has the required roles, False otherwise.
        user_roles -> ["org_admin"] and required_roles -> ["org_admin", "office_admin"] == True
        user_roles -> ["org_admin"] and required_roles -> ["office_admin"] == True
        user_roles -> ["org_admin"] and required_roles -> ["office_admin", "org_admin"] == True
        user_roles -> ["office_admin"] and required_roles -> ["org_admin"] == False
        user_roles -> ["office_admin"] and required_roles -> ["office_admin"] == True
    """

    # check tha the required_role has all user_roles has children from roles_deps
    if len(required_roles) == 0:
        return True

    for r in user_roles:
        if Role.is_valid(r) and Role.from_str(r).can_access(Role.from_str(required_roles[0])):
            return True

    return False


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

    if not hasSufficientPermissions(user.roles, scopes.scopes):
        logger.info(f"User has insufficient permissions {scopes.scopes} in {user.roles}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not enough permissions",
            headers={"WWW-Authenticate": authenticate_value},
        )

    return user


class UserDBSession:

    def __init__(self, user: KcUser, db: Session):
        self.user = user
        self.db = db

    def get_user(self):
        return self.user

    def get_db(self):
        return self.db
