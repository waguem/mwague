from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Security, status
from mkdi_backend.api.deps import check_authorization, get_db
from mkdi_backend.models.models import KcUser
from mkdi_shared.schemas import protocol
from sqlmodel import Session

from mkdi_backend.repositories.report_repo import ReportRepository

router = APIRouter()


@router.get("/office/monthly-report", response_model=protocol.ReportResponse, status_code=200)
def get_monthly_report(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["org_admin"])],
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
) -> protocol.ReportResponse:
    return ReportRepository(db).get_monthly_report(user.office_id, start_date, end_date)
