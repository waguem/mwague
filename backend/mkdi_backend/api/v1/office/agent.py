from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Security, status
from mkdi_backend.api.deps import check_authorization, get_db
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.agent import AgentRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()


@router.post("/office/agent", response_model=protocol.AgentResponse, status_code=201)
def create_agent(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    usr_input: protocol.CreateAgentRequest,
    db: Session = Depends(get_db),
) -> protocol.AgentResponse:
    # make sure when office_id is passed then the user must be org_admin

    return AgentRepository(db).create(auth_user=user, usr_input=usr_input)


@router.get("/office/agent", response_model=List[protocol.AgentReponseWithAccounts])
def get_agents(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
) -> List[protocol.AgentReponseWithAccounts]:
    return AgentRepository(db).get_office_agents(user.office_id, user.organization_id)


@router.get("/office/{office_id}/agent")
def get_office_agents(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=["org_admin"])],
    office_id: str,
):
    return AgentRepository(db).get_office_agents(office_id, user.organization_id)


@router.get("/office/agent/{agent_initials}", response_model=protocol.AgentResponse)
def get_agent(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    agent_initials: str,
):
    return AgentRepository(db).get_agent(agent_initials, user.office_id)
