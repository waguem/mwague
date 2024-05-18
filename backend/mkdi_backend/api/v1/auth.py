from typing import Annotated, Union

from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from loguru import logger
from mkdi_backend.api import deps
from mkdi_backend.auth.auth import authenticate_user, create_access_token, get_user
from mkdi_backend.config import settings
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

# oauth2_scheme =APIKeyCookie(name=settings.AUTH_COOKIE_NAME)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()
# get token header


class Token(BaseModel):
    """_summary_

    Args:
        BaseModel (_type_): _description_
    """

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Token data
    """

    username: str | None = None
    email: Union[EmailStr, None] = None


class CreateApiClientRequest(BaseModel):
    description: str
    frontend_type: str
    trusted: bool | None = False
    admin_email: EmailStr | None = None


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: Session = Depends(deps.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[settings.AUTH_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# END PONTS
@router.post("/api_client", response_model=str)
async def create_api_client(
    request: CreateApiClientRequest,
    # root_token : str = Depends(deps.get_root_token),
    session: deps.Session = Depends(deps.get_db),
) -> str:
    """_summary_

    Args:
        request (CreateApiClientRequest): _description_
        session (deps.Session, optional): _description_. Defaults to Depends(deps.get_db).

    Returns:
        str: _description_
    """
    logger.info(f"Creating new api client with {request=}")
    api_client = deps.create_api_client(
        session=session,
        description=request.description,
        frontend_type=request.frontend_type,
        trusted=request.trusted,
        admin_email=request.admin_email,
    )
    logger.info(f"Created api_client with key {api_client.api_key}")
    return api_client.api_key


@router.post("/token", response_model=Token)
async def login_for_access_token(
    # form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(deps.get_db),
) -> Token:
    """_summary_

    Args:
        form_data (OAuth2PasswordRequestForm, optional): _description_. Defaults to Depends().
        session (Session, optional): _description_. Defaults to Depends(deps.get_db).

    Raises:
        HTTPException: _description_

    Returns:
        Token: _description_
    """
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise MkdiError(
            error_code=MkdiErrorCode.INVALID_AUTHENTICATION,
            message="Incorrect username or password",
            http_status_code=status.HTTP_401_UNAUTHORIZED,
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/check", response_model=str)
async def auth_check(token_data: TokenData = Depends(get_current_user)) -> str:
    """
    Check if user is authenticated
    """
    return token_data.email
