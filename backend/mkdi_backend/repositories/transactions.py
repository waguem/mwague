from typing import List

from sqlalchemy import union_all
from sqlalchemy.ext.asyncio.session import AsyncSession
from asyncio import TaskGroup
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.models.office import OfficeWallet
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transaction_item import TransactionItem
from mkdi_backend.dbmanager import sessionmanager
import json
from mkdi_backend.models.transactions.transactions import (
    Deposit,
    Internal,
    External,
    Sending,
    ForEx,
    TransactionWithDetails,
    WalletTrading,
)
from mkdi_backend.repositories.transaction_repos import (
    deposit,
    internal,
    external,
    payable,
    sending,
    forex,
)
from mkdi_backend.repositories.transaction_repos.abstract_transaction import AbstractTransaction
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from pydantic import ValidationError
from sqlmodel import Session, or_, select
from datetime import datetime, timedelta


class TransactionRepository:
    """transaction repository"""

    def __init__(self, db: Session):
        self.db = db

    def request_for_approval(self, user: KcUser, user_input: pr.TransactionRequest):
        """Request a transaction for approval, this will just created the transaction in the db"""
        try:
            requester = self.get_concrete_type(user_input.data.type)(self.db, user, user_input)
        except ValidationError as e:
            raise e

        response = requester.request()

        return response

    def _get_month_range(self, start: str | None, end: str | None):
        today = datetime.now()
        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        if not start:
            # get the first day of the month
            start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = datetime.strptime(start, date_format).replace(day=1)

        if not end:
            end_date = today.replace(day=28) + timedelta(days=4)
        else:
            end_date = datetime.strptime(end, date_format).replace(day=28) + timedelta(days=4)

        return start_date, end_date

    def get_agent_transactions(
        self, office_id: str, initials: str, start_date_str: str, end_date_str: None
    ) -> List[TransactionItem]:
        """get all transactions for an agent"""

        start_date, end_date = self._get_month_range(start_date_str, end_date_str)

        accounts = self.db.scalars(
            select(Account, Agent)
            .join(Agent, Agent.id == Account.owner_id)
            .where(Account.office_id == office_id)
            .where(Agent.initials == initials)
        ).all()

        initials_str = list(map(lambda x: x.initials, accounts))

        deposits = self.db.scalars(
            select(Deposit)
            .where(Deposit.office_id == office_id)
            .where(Deposit.owner_initials.in_(initials_str))
            .where(Deposit.created_at >= start_date)
            .where(Deposit.created_at <= end_date)
            .order_by(Deposit.created_at.desc())
        ).all()
        externals = self.db.scalars(
            select(External)
            .where(External.office_id == office_id)
            .where(External.sender_initials.in_(initials_str))
            .where(External.created_at >= start_date)
            .where(External.created_at <= end_date)
            .order_by(External.created_at.desc())
        ).all()
        sendings = self.db.scalars(
            select(Sending)
            .where(Sending.office_id == office_id)
            .where(Sending.receiver_initials.in_(initials_str))
            .where(Sending.created_at >= start_date)
            .where(Sending.created_at <= end_date)
            .order_by(Sending.created_at.desc())
        ).all()

        forexs = self.db.scalars(
            select(ForEx)
            .where(ForEx.office_id == office_id)
            .where(ForEx.customer_account.in_(initials_str))
            .where(ForEx.created_at >= start_date)
            .where(ForEx.created_at <= end_date)
            .order_by(ForEx.created_at.desc())
        ).all()

        internals = self.db.scalars(
            select(Internal)
            .where(Internal.office_id == office_id)
            .where(Internal.sender_initials.in_(initials_str))
            .where(Internal.created_at >= start_date)
            .where(Internal.created_at <= end_date)
            .where(
                or_(
                    Internal.sender_initials.in_(initials_str),
                    Internal.receiver_initials.in_(initials_str),
                )
            )
        ).all()

        result = []

        for collection in [internals, deposits, externals, sendings, forexs]:
            for item in collection:
                notes = json.loads(item.notes) if len(item.notes) > 0 else []
                result.append(TransactionItem(item=item, notes=notes))

        return result

    def get_concrete_type(self, transaction_type: str) -> AbstractTransaction:
        """return the concrete type for the transaction"""
        # Mapping of transaction types to their concrete classes
        type_map = {
            pr.TransactionType.INTERNAL: internal.InternalTransaction,
            pr.TransactionType.DEPOSIT: deposit.DepositTransaction,
            pr.TransactionType.EXTERNAL: external.ExternalTransaction,
            pr.TransactionType.SENDING: sending.SendingTransaction,
            pr.TransactionType.FOREX: forex.ForExTransaction,
        }

        try:
            # Convert string to TransactionType enum and get the concrete class from the map
            return type_map[pr.TransactionType(transaction_type)]
        except KeyError as e:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE,
                message=f"Invalid transaction type {transaction_type}",
            ) from e

    def review_transaction(
        self, code: str, user: KcUser, user_input: pr.TransactionReviewReq
    ) -> pr.TransactionResponse:
        """Review a transaction"""

        reviewer: AbstractTransaction = None
        try:
            reviewer = self.get_concrete_type(user_input.type)(self.db, user, user_input)
        except ValidationError as e:
            raise e

        transaction = reviewer.review(code)
        return transaction

    def get_transaction(self, user: KcUser, code: str) -> pr.TransactionResponse:
        """get a transaction"""
        # use select and join to get the transaction by code from Internal Deposit and ...
        fields = list(pr.TransactionDB.__fields__.keys())

        deposit_query = self.db.query(*list(map(lambda x: getattr(Deposit, x), fields))).filter(
            Deposit.code == code, Deposit.office_id == user.office_id
        )
        internal_query = self.db.query(*list(map(lambda x: getattr(Internal, x), fields))).filter(
            Internal.code == code, Internal.office_id == user.office_id
        )
        external_query = self.db.query(*list(map(lambda x: getattr(External, x), fields))).filter(
            External.code == code, External.office_id == user.office_id
        )
        sending_query = self.db.query(*list(map(lambda x: getattr(Sending, x), fields))).filter(
            Sending.code == code, Sending.office_id == user.office_id
        )

        # combine queries using union_all
        combined_query = union_all(deposit_query, internal_query, external_query, sending_query)
        result = self.db.exec(combined_query).fetchall()
        if len(result) > 1:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE,
                message=f"Transaction code {code} is not unique",
            )

        record = result[0]
        adjusted_record = {}
        for key, value in dict(record._mapping).items():
            # remove the prefix from the key
            # however desposits_create_at will be changed to created_at
            _, col = key.split("_", 1)
            adjusted_record[col] = value
        response = pr.TransactionResponse(**adjusted_record)

        return response

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def update_transaction(
        self, user: KcUser, code: str, usr_input: pr.TransactionRequest
    ) -> pr.TransactionResponse:
        """update a transaction"""
        transactionImpl: AbstractTransaction = None
        if not usr_input.data and not usr_input.transaction_type:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_INPUT,
                message="You should provide a transaction type",
            )
        tr_type = usr_input.data.type if usr_input.data else usr_input.transaction_type
        try:
            transactionImpl = self.get_concrete_type(tr_type)(self.db, user, usr_input)
        except ValidationError as e:
            raise e

        transaction: pr.TransactionDB = transactionImpl.get_transaction(code)
        if not transaction:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message=f"Transaction code {code} not found",
            )

        transaction.update(usr_input)
        self.db.add(transaction)
        return transaction

    async def add_payment(
        self, user: KcUser, code: str, usr_input: pr.PaymentRequest
    ) -> pr.PaymentResponse:
        """add a payment to a transaction"""
        transactionImpl: AbstractTransaction = None
        try:
            transactionImpl = self.get_concrete_type(usr_input.payment_type)(
                self.db, user, usr_input
            )
        except ValidationError as e:
            raise e
        if not isinstance(transactionImpl, payable.PayableTransaction):
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE,
                message="Transaction is not payable",
            )
        tr = await transactionImpl.get_a_transaction(tr_type=usr_input.payment_type, code=code)
        transactionImpl.set_transaction(tr)
        payment = await transactionImpl.add_payment(payment=usr_input, code=code)
        return payment

    def _collect_transactions(self, *items) -> List[TransactionItem]:
        result = []
        for collection in items:
            for item in collection.scalars().all():
                notes = json.loads(item.notes) if len(item.notes) > 0 else []
                result.append(TransactionItem(item=item, notes=notes))

        return result

    async def get_offcie_transactions_items(self, user: KcUser) -> List[TransactionItem]:

        async with (
            sessionmanager.session() as session1,
            sessionmanager.session() as session2,
            sessionmanager.session() as session3,
            sessionmanager.session() as session4,
            sessionmanager.session() as session5,
        ):
            office_id = user.office_id
            deposit_stm = (
                select(Deposit)
                .where(Deposit.office_id == office_id)
                .order_by(Deposit.created_at.desc())
            )
            external_stm = (
                select(External)
                .where(External.office_id == office_id)
                .order_by(External.created_at.desc())
            )
            sending_stm = (
                select(Sending)
                .where(Sending.office_id == office_id)
                .order_by(Sending.created_at.desc())
            )
            internal_stm = (
                select(Internal)
                .where(Internal.office_id == office_id)
                .order_by(Internal.created_at.desc())
            )
            forex_stm = (
                select(ForEx).where(ForEx.office_id == office_id).order_by(ForEx.created_at.desc())
            )

            async with TaskGroup() as tg:
                deposit_task = tg.create_task(session1.execute(deposit_stm))
                external_task = tg.create_task(session2.execute(external_stm))
                sending_task = tg.create_task(session3.execute(sending_stm))
                internal_task = tg.create_task(session4.execute(internal_stm))
                forex_task = tg.create_task(session5.execute(forex_stm))
                deposits, externals, sendings, internals, forexs = (
                    await deposit_task,
                    await external_task,
                    await sending_task,
                    await internal_task,
                    await forex_task,
                )

                return self._collect_transactions(deposits, externals, sendings, forexs, internals)

    async def get_office_transactions(self, user: KcUser) -> List[pr.TransactionResponse]:
        fields = list(pr.TransactionDB.__fields__.keys())

        def select_fields(model):
            return list(map(lambda x: getattr(model, x), fields))

        session: AsyncSession = self.db
        deposit_query = (
            select(*select_fields(Deposit))
            .where(Deposit.office_id == user.office_id)
            .order_by(Deposit.created_at.desc())
        )

        external_query = (
            select(*select_fields(External))
            .where(External.office_id == user.office_id)
            .order_by(External.created_at.desc())
        )

        sending_query = (
            select(*select_fields(Sending))
            .where(Sending.office_id == user.office_id)
            .order_by(Sending.created_at.desc())
        )

        internal_query = (
            select(*select_fields(Internal))
            .where(Internal.office_id == user.office_id)
            .order_by(Internal.created_at.desc())
        )

        combined_query = union_all(deposit_query, external_query, sending_query, internal_query)

        records = (await session.execute(combined_query)).all()
        resp = [pr.TransactionResponse(**dict(record._mapping)) for record in records]
        return resp

    async def get_office_transactions_with_details(
        self, user: KcUser, tr_code: str, tr_type: pr.TransactionType
    ) -> TransactionWithDetails:
        transactionImpl: AbstractTransaction = None
        try:
            transactionImpl = self.get_concrete_type(tr_type)(self.db, user, None)
        except ValidationError as e:
            raise e

        tr = await transactionImpl.get_a_transaction(tr_type, tr_code, include_payments=True)
        return tr

    def get_account_report(
        self, account: Account, start_date: datetime, end_date: datetime
    ) -> dict:
        office_id: str = account.office_id
        acc_report = list()

        deposit_stm = (
            select(Deposit)
            .where(Deposit.office_id == office_id)
            .where(Deposit.owner_initials == account.initials)
            .where(Deposit.created_at >= start_date)
            .where(Deposit.created_at <= end_date)
            .order_by(Deposit.created_at.desc())
        )

        external_stm = (
            select(External)
            .where(External.office_id == office_id)
            .where(External.sender_initials == account.initials)
            .where(External.created_at >= start_date)
            .where(External.created_at <= end_date)
            .order_by(External.created_at.desc())
        )

        sending_stm = (
            select(Sending)
            .where(Sending.office_id == office_id)
            .where(Sending.receiver_initials == account.initials)
            .where(Sending.created_at >= start_date)
            .where(Sending.created_at <= end_date)
            .order_by(Sending.created_at.desc())
        )

        internal_stm = (
            select(Internal)
            .where(Internal.office_id == office_id)
            .where(
                or_(
                    Internal.sender_initials == account.initials,
                    Internal.receiver_initials == account.initials,
                )
            )
            .where(Internal.created_at >= start_date)
            .where(Internal.created_at <= end_date)
            .order_by(Internal.created_at.desc())
        )

        forex_stm = (
            select(ForEx)
            .where(ForEx.office_id == office_id)
            .where(ForEx.customer_account == account.initials)
            .where(ForEx.created_at >= start_date)
            .where(ForEx.created_at <= end_date)
            .order_by(ForEx.created_at.desc())
        )
        queries = [deposit_stm, external_stm, sending_stm, internal_stm, forex_stm]

        for query in queries:
            items = self.db.scalars(query).all()
            for item in items:
                notes = json.loads(item.notes) if len(item.notes) > 0 else []
                is_out = item.type in [pr.TransactionType.EXTERNAL, pr.TransactionType.FOREX]

                if not is_out and item.type == pr.TransactionType.INTERNAL:
                    is_out = item.sender_initials == account.initials

                acc_report.append(TransactionItem(item=item, notes=notes).to_report_item(is_out))

        # get tradings transactions
        tradings = self.db.scalars(
            select(WalletTrading)
            .join(OfficeWallet, WalletTrading.walletID == OfficeWallet.walletID)
            .where(OfficeWallet.office_id == office_id)
            .where(WalletTrading.account == account.initials)
            .where(WalletTrading.created_at >= start_date)
            .where(WalletTrading.created_at <= end_date)
            .order_by(WalletTrading.created_at.desc())
        ).all()

        for trading in tradings:
            acc_report.append(trading.to_report_item())

        # sort the report by created_at
        acc_report.sort(key=lambda x: "created_at")
        # transform the created_at to string
        for item in acc_report:
            item["created_at"] = item["created_at"].isoformat()
        return acc_report

    def cancel_transaction(
        self, user: KcUser, code: str, usr_input: pr.CancelTransaction
    ) -> pr.TransactionResponse:
        """Cancel a transaction"""

        reviewer: AbstractTransaction = None
        try:
            reviewer = self.get_concrete_type(usr_input.type)(self.db, user, usr_input)
        except ValidationError as e:
            raise e

        transaction = reviewer.get_transaction(code)
        reviewer.transaction = transaction

        transaction = reviewer.rollback(transaction)

        notes = json.loads(transaction.notes)
        reviewer.update_notes(notes, "CANCEL", usr_input.description, tags=usr_input.reason)
        transaction.notes = json.dumps(notes)

        transaction = reviewer.cancel(transaction)

        return transaction

    def cancel_payment(self, user: KcUser, id: str, request) -> pr.PaymentResponse:

        reviewer: AbstractTransaction = None
        try:
            reviewer = self.get_concrete_type(request.type)(self.db, user, request)
        except ValidationError as e:
            raise e

        transaction = reviewer.get_transaction(request.code)
        reviewer.transaction = transaction

        payment = reviewer.cancel_payment(id)
        return payment
