from mkdi_shared.schemas import protocol
from sqlmodel import Session
from typing import List
from mkdi_backend.models.transactions.transactions import (
    Internal,
    External,
    Sending,
    ForEx,
    WalletTrading,
    Deposit,
)
from mkdi_backend.models.models import KcUser

from mkdi_backend.models.office import OfficeWallet, Office
from mkdi_backend.models.Account import Account, AccountType, AccountMonthlyReport
from mkdi_backend.models.Agent import Agent

from sqlmodel.sql.expression import select, or_

from datetime import timedelta, datetime
from loguru import logger
from mkdi_backend.repositories.transactions import TransactionRepository
import json


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

        office_deposits = self._get_office_deposits(office_id, start_date, end_date)
        office_internals = self._get_office_internals(office_id, start_date, end_date)
        office_externals = self._get_office_externals(office_id, start_date, end_date)

        report.results.extend(internals)
        report.results.extend(externals)
        report.results.extend(sending)
        report.results.extend(forex)
        report.results.extend(tradings)
        report.results.extend(office_deposits)
        report.results.extend(office_internals)
        report.results.extend(office_externals)

        return report

    def _get_office_account(self, office_id: str):
        return self.db.scalar(
            select(Account)
            .where(Account.type == protocol.AccountType.OFFICE)
            .where(Account.office_id == office_id)
        )

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
            .where(ForEx.forex_result != 0)
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
                    tag=transaction.tag,
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
                    result_type=(
                        protocol.ResultType.BENEFIT
                        if transaction.trading_result > 0
                        else protocol.ResultType.LOSS
                    ),
                    amount=transaction.trading_result,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                ),
                results,
            )
        )

    def start_reports(self):
        """
        this function will check in the database
        for every account
          check if there is an open account report in the db
          if there is then no action
          if not create the account report that should start now
        """
        from loguru import logger

        logger.info("Starting report cron job")

        # get current month date
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0)
        # for every office get all accounts
        offices = self.db.scalars(select(Office)).all()

        for office in offices:
            #

            accounts = self.db.scalars(
                select(Account)
                .where(Account.office_id == office.id)
                .where(Account.type.in_([AccountType.AGENT, AccountType.SUPPLIER]))
            ).all()

            for account in accounts:

                self.start_report(account, current_month)

    def start_report(self, account: Account, current_month: datetime):
        # Get the first day of the next month
        next_month = (current_month + timedelta(days=32)).replace(day=1, hour=0, minute=0, second=0)
        try:

            has_report = self.db.scalar(
                select(AccountMonthlyReport)
                .where(AccountMonthlyReport.account_id == account.id)
                .where(AccountMonthlyReport.start_date <= (current_month + timedelta(hours=3)))
                .where(AccountMonthlyReport.end_date < next_month)
            )

            if not has_report:
                # Create a new report if one doesn't exist for the current month
                logger.info(
                    f"Creating report for month {current_month.month} for account {account.initials}"
                )
                new_report = AccountMonthlyReport(
                    account_id=account.id,
                    start_date=current_month,
                    end_date=next_month - timedelta(days=1),
                    account=account.initials,
                    is_open=True,
                    start_balance=account.balance,
                    end_balance=account.balance,
                    report_json={},
                    # Add other necessary fields
                )
                self.db.add(new_report)
                self.db.commit()
        except Exception as e:
            logger.info(f"Error creating report for account {e}")

    def get_agent_yearly_reports(
        self, user: KcUser, initials: str, year: int
    ) -> List[AccountMonthlyReport]:
        # find the agent accounts
        accounts = self.db.scalars(
            select(Account)
            .join(Agent, Account.owner_id == Agent.id)
            .where(Agent.initials == initials)
            .where(Account.office_id == user.office_id)
            # .where(Account.type == AccountType.AGENT)
        ).all()
        initials_list = [account.id for account in accounts]

        reports = self.db.scalars(
            select(AccountMonthlyReport)
            .where(AccountMonthlyReport.account_id.in_(initials_list))  # py-line: disable
            .where(AccountMonthlyReport.start_date >= datetime(year, 1, 1, 0, 0, 0))
            .where(AccountMonthlyReport.end_date <= datetime(year, 12, 31, 23, 59, 59))
        ).all()
        return reports

    def update_reports(self):
        offices = self.db.scalars(select(Office)).all()

        for office in offices:
            #
            accounts = self.db.scalars(
                select(Account)
                .where(Account.office_id == office.id)
                .where(Account.type.in_([AccountType.AGENT, AccountType.SUPPLIER]))
            ).all()

            for account in accounts:
                try:
                    self.update_report(account)
                except Exception as e:
                    logger.info(f"Error updating report for account {e}")

    # @managed_tx_method()
    def update_report(self, account: Account):
        # Get the first day of the next month
        repo = TransactionRepository(self.db)
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0)
        end_of_month = (current_month + timedelta(days=32)).replace(
            day=1, hour=0, minute=0, second=0
        )

        report = repo.get_account_report(account, current_month, end_of_month)

        account_report = self.db.scalar(
            select(AccountMonthlyReport)
            .where(AccountMonthlyReport.account_id == account.id)
            .add_columns(AccountMonthlyReport.is_open == True)
        )

        if account_report:
            account_report.end_balance = account.balance
            account_report.report_json = report
            account_report.updated_at = datetime.now()
            self.db.add(account_report)
            self.db.commit()
        else:
            logger.info(f"Report for account {account.initials} not found")

    def _get_tag(self, transaction):
        if isinstance(transaction.notes, str):
            notes = json.loads(transaction.notes if hasattr(transaction, "notes") else "[]")

            for note in notes:
                if "tags" in note:
                    return ",".join(note["tags"])

    def _get_office_deposits(self, office_id: str, start_date: datetime, end_date: datetime):
        office_account = self._get_office_account(office_id)
        results = self.db.scalars(
            select(Deposit)
            .where(Deposit.owner_initials == office_account.initials)
            .where(Deposit.office_id == office_id)
            .where(Deposit.created_at >= start_date)
            .where(Deposit.created_at <= end_date)
            .order_by(Deposit.created_at)
        ).all()

        return list(
            map(
                lambda transaction: protocol.OfficeResult(
                    result_source=transaction.type,
                    result_type=protocol.ResultType.BENEFIT,
                    amount=transaction.amount,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                    tag=self._get_tag(transaction),
                ),
                results,
            )
        )

    def _get_office_internals(self, office_id: str, start_date: datetime, end_date: datetime):
        office_account = self._get_office_account(office_id)
        results = self.db.scalars(
            select(Internal)
            .where(
                or_(
                    Internal.sender_initials == office_account.initials,
                    Internal.receiver_initials == office_account.initials,
                )
            )
            .where(Internal.office_id == office_id)
            .where(Internal.created_at >= start_date)
            .where(Internal.created_at <= end_date)
            .order_by(Internal.created_at)
        ).all()

        return list(
            map(
                lambda transaction: protocol.OfficeResult(
                    result_source=transaction.type,
                    result_type=(
                        protocol.ResultType.EXPENSE
                        if transaction.sender_initials == office_account.initials
                        else protocol.ResultType.BENEFIT
                    ),
                    amount=transaction.amount,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                    tag=self._get_tag(transaction),
                ),
                results,
            )
        )

    def _get_office_externals(self, office_id: str, start_date: datetime, end_date: datetime):
        office_account = self._get_office_account(office_id)
        results = self.db.scalars(
            select(External)
            .where(External.sender_initials == office_account.initials)
            .where(External.office_id == office_id)
            .where(External.created_at >= start_date)
            .where(External.created_at <= end_date)
            .order_by(External.created_at)
        ).all()

        return list(
            map(
                lambda transaction: protocol.OfficeResult(
                    result_source=transaction.type,
                    result_type=protocol.ResultType.EXPENSE,
                    amount=transaction.amount,
                    code=transaction.code,
                    transaction_id=transaction.id,
                    date=transaction.created_at,
                    state=transaction.state,
                    tag=self._get_tag(transaction),
                ),
                results,
            )
        )
