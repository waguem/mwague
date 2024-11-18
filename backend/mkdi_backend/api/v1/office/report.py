"""Report API for office users."""

from typing import Annotated, List

from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from mkdi_shared.schemas import protocol

from mkdi_backend.api.deps import check_authorization, get_db, DBSessionDep
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.Account import AccountMonthlyReport
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


@router.get(
    "/office/agent/{initials}/monthly-report",
    response_model=List[AccountMonthlyReport],
    status_code=200,
)
def get_agent_yearly_reports(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    initials: str,
    year: int | None = None,
    db: Session = Depends(get_db),
) -> List[AccountMonthlyReport]:
    return ReportRepository(db).get_agent_yearly_reports(user, initials, year)


@router.get(
    "/office/agent/fullReport/{report_id}",
    response_model=protocol.AccountMonthlyReportResponse,
    status_code=200,
)
def get_agent_full_report(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    report_id: str,
    db: DBSessionDep,
) -> protocol.AccountMonthlyReportResponse:
    return ReportRepository(db).get_agent_full_report(user, report_id)
