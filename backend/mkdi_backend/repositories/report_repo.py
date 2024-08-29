from mkdi_shared.schemas import protocol
from sqlmodel import Session
from typing import List
from mkdi_backend.models.transactions.transactions import Internal, External, Sending, ForEx
from sqlmodel.sql.expression import select
from datetime import timedelta, datetime
from loguru import logger


class ReportRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_monthly_report(self, office_id: str) -> protocol.ReportResponse:
        # This is a dummy implementation
        report = protocol.ReportResponse(results=[])

        today = datetime.now()
        start_date = self._first_day_of_month(today)
        end_date = self._last_day_of_month(today)

        internals = self._get_model_result(Internal, office_id, start_date, end_date)
        externals = self._get_model_result(External, office_id, start_date, end_date)
        sending = self._get_model_result(Sending, office_id, start_date, end_date)
        # forex = self._get_model_result(ForEx,office_id,start_date,end_date)

        report.results.extend(internals)
        report.results.extend(externals)
        report.results.extend(sending)
        # report.results.extend(forex)

        return report

    def _first_day_of_month(self, date):
        return date.replace(day=1)

    def _last_day_of_month(self, date):
        return date.replace(day=28) + timedelta(days=4)

    def _get_model_result(self, model, office_id: str, start_date: datetime, end_date: datetime):
        transactions = self.db.scalars(
            select(model)
            .where(model.charges > 0)
            .where(model.state == protocol.TransactionState.PAID)
            .where(model.office_id == office_id)
            .where(model.created_at >= start_date)
            .where(model.created_at <= end_date)
            .order_by(model.created_at)
        ).all()

        return list(
            map(
                lambda transaction: protocol.OfficeResult(
                    result_source=transaction.type,
                    result_type=protocol.ResultType.BENEFIT,
                    amount=transaction.charges,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                ),
                transactions,
            )
        )
