from typing import Annotated

from fastapi import APIRouter, Depends, Security
from mkdi_backend.api.deps import check_authorization, get_db
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.account import AccountRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()


@router.post("/account")
def open_account(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    input: protocol.CreateAccountRequest,
    db: Session = Depends(get_db),
):
    return AccountRepository(db).open_account(auth_user=user, input=input)


@router.get("/account")
def get_office_accounts(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
):
    return AccountRepository(db).get_office_accounts(user.office_id)


@router.get("/agent/{agent_id}/account")
def get_agent_accounts(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
):
    return AccountRepository(db).get_agent_accounts(user.id)
