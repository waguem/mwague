from typing import Annotated

from fastapi import APIRouter, Depends, Security
from loguru import logger
from mkdi_backend.api.deps import check_authorization, get_db
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.account import AccountRepository
from mkdi_backend.repositories.agent import AgentRepository
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()


@router.post("/account", response_model=protocol.AccountResponse, status_code=201)
def open_account(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    input: protocol.CreateAccountRequest,
    db: Session = Depends(get_db),
) -> protocol.AccountResponse:
    account = AccountRepository(db).open_account(auth_user=user, input=input)

    return account


@router.get("/account")
def get_office_accounts(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
):
    return AccountRepository(db).get_office_accounts(user.office_id)


@router.get("/agent/{agent_initial}/account", response_model=list[protocol.AccountResponse])
def get_agent_accounts(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    agent_initial: str,
) -> list[protocol.AccountResponse]:
    # find the agent
    agent = AgentRepository(db).get_agent(agent_initial, user.office_id)
    if not agent:
        raise MkdiError(
            f"Agent with initials {agent_initial} not found",
            error_code=MkdiErrorCode.USER_NOT_FOUND,
        )

    return AccountRepository(db).get_owner_accounts(agent.id)
