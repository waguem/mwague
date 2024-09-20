from typing import Annotated


from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol

from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.account import AccountRepository
from mkdi_backend.repositories.agent import AgentRepository
from sqlmodel import Session
from mkdi_backend.api.deps import check_authorization, get_db

from fastapi import APIRouter, Depends, Security

router = APIRouter()


@router.post("/account", response_model=protocol.AccountResponse, status_code=201)
def open_account(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    user_input: protocol.CreateAccountRequest,
    db: Session = Depends(get_db),
) -> protocol.AccountResponse:
    account = AccountRepository(db).open_account(auth_user=user, input=user_input)

    return account


@router.get(
    "/office/myOffice/account", status_code=200, response_model=list[protocol.AccountResponse]
)
def get_office_accounts(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
) -> list[protocol.AccountResponse]:
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
