from mkdi_shared.schemas import protocol
from sqlmodel import Session
from typing import List
from mkdi_backend.models.transactions.transactions import (
    Internal,
    External,
    Sending,
    ForEx,
    WalletTrading,
)
from mkdi_backend.models.office import OfficeWallet
from sqlmodel.sql.expression import select
from datetime import timedelta, datetime
from loguru import logger


class ReportRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_monthly_report(
        self, office_id: str, start_date_str: str, end_date_str: str
    ) -> protocol.ReportResponse:
        # This is a dummy implementation
        report = protocol.ReportResponse(results=[])

        today = datetime.now()

        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"

        if not start_date_str:
            start_date = self._first_day_of_month(today)
        else:
            start_date = self._start_of_day(datetime.strptime(start_date_str, date_format))

        if not end_date_str:
            end_date = self._last_day_of_month(today)
        else:
            end_date = self._end_of_day(datetime.strptime(end_date_str, date_format))

        internals = self._get_model_result(Internal, office_id, start_date, end_date)
        externals = self._get_model_result(External, office_id, start_date, end_date)
        sending = self._get_model_result(Sending, office_id, start_date, end_date)
        forex = self._get_forex_result(office_id, start_date, end_date)
        tradings = self._get_wallet_trading_result(office_id, start_date, end_date)
        report.results.extend(internals)
        report.results.extend(externals)
        report.results.extend(sending)
        report.results.extend(forex)
        report.results.extend(tradings)

        return report

    def _start_of_day(self, date):
        return date.replace(hour=0, minute=0, second=0, microsecond=0)

    def _end_of_day(self, date):
        return date.replace(hour=23, minute=59, second=59)

    def _first_day_of_month(self, date):
        return date.replace(day=1)

    def _last_day_of_month(self, date):
        return date.replace(day=28) + timedelta(days=4)

    def _get_model_result(self, model, office_id: str, start_date: datetime, end_date: datetime):
        transactions = self.db.scalars(
            select(model)
            .where(model.charges > 0)
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

    def _get_forex_result(self, office_id: str, start_date: datetime, end_date: datetime):
        resulst = self.db.scalars(
            select(ForEx)
            .where((ForEx.selling_amount - ForEx.buying_amount) > 0)
            .where(ForEx.created_at >= start_date)
            .where(ForEx.created_at <= end_date)
            .where(ForEx.office_id == office_id)
            .order_by(ForEx.created_at)
        ).all()

        return list(
            map(
                lambda transaction: protocol.OfficeResult(
                    result_source=transaction.type,
                    result_type=protocol.ResultType.BENEFIT,
                    amount=transaction.forex_result,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                ),
                resulst,
            )
        )

    def _get_wallet_trading_result(self, office_id: str, start_date: datetime, end_date: datetime):
        results = self.db.scalars(
            select(WalletTrading)
            .join(OfficeWallet, WalletTrading.walletID == OfficeWallet.walletID)
            .where(OfficeWallet.office_id == office_id)
            .where(WalletTrading.created_at >= start_date)
            .where(WalletTrading.created_at <= end_date)
            .order_by(WalletTrading.created_at)
        ).all()
        # filter the results to keep only those with trading_result != 0
        results = list(filter(lambda transaction: transaction.trading_result != 0, results))
        return list(
            map(
                lambda transaction: protocol.OfficeResult(
                    result_source=protocol.TransactionType.TRADING,
                    result_type=protocol.ResultType.BENEFIT,
                    amount=transaction.trading_result,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                ),
                results,
            )
        )
