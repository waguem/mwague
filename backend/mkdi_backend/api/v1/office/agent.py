from typing import Annotated

from fastapi import APIRouter, Depends, Security
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
    input: protocol.CreateAgentRequest,
    db: Session = Depends(get_db),
) -> protocol.AgentResponse:
    return AgentRepository(db).create(
        auth_user=user,
        input=input,
    )


@router.get("/office/agent")
def get_agents(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
):
    return AgentRepository(db).get_office_agents(user.office_id, user.organization_id)


@router.get("/office/{office_id}/agent")
def get_office_agents(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=["org_admin"])],
    office_id: str,
):
    return AgentRepository(db).get_office_agents(office_id, user.organization_id)
