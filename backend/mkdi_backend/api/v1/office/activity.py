from typing import Annotated

from mkdi_shared.schemas import protocol
from fastapi import APIRouter, Depends, Security
from mkdi_backend.api.deps import check_authorization, get_db
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.activity import ActivityRepo
from sqlmodel import Session

router = APIRouter()


@router.get("/office/activity", response_model=protocol.ActivityResponse | None, status_code=200)
def get_activity(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    db: Session = Depends(get_db),
) -> protocol.ActivityResponse:
    return ActivityRepo(db).get_current_activity(office_id=user.office_id)


@router.post("/office/activity", response_model=protocol.ActivityResponse, status_code=200)
def start_activity(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    input: protocol.CreateActivityRequest,
    db: Session = Depends(get_db),
) -> protocol.ActivityResponse:
    return ActivityRepo(db).start_activity(auth_user=user, input=input)
