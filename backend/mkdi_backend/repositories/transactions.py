from typing import List

from sqlalchemy import union_all
from sqlalchemy.ext.asyncio.session import AsyncSession
from asyncio import TaskGroup
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transaction_item import TransactionItem
from mkdi_backend.dbmanager import sessionmanager
from mkdi_backend.models.transactions.transactions import (
    Deposit,
    Internal,
    External,
    Sending,
    ForEx,
    TransactionWithDetails,
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

    def get_agent_transactions(self, user: KcUser, initials: str) -> List[pr.TransactionResponse]:
        """get all transactions for an agent"""
        fields = list(pr.TransactionDB.__fields__.keys())

        deposit_query = (
            self.db.query(*list(map(lambda x: getattr(Deposit, x), fields)))
            .join(Account, Deposit.owner_initials == Account.initials)
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials)
            .order_by(Deposit.created_at.desc())
        )

        internal_query = (
            self.db.query(*list(map(lambda x: getattr(Internal, x), fields)))
            .join(
                Account,
                or_(
                    Internal.sender_initials == Account.initials,
                    Internal.receiver_initials == Account.initials,
                ),
            )
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials, Agent.office_id == user.office_id)
            .order_by(Internal.created_at.desc())
        )

        external_query = (
            self.db.query(*list(map(lambda x: getattr(External, x), fields)))
            .join(Account, External.sender_initials == Account.initials)
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials)
            .order_by(External.created_at.desc())
        )

        sending_query = (
            self.db.query(*list(map(lambda x: getattr(Sending, x), fields)))
            .join(Account, Sending.receiver_initials == Account.initials)
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials)
            .order_by(Sending.created_at.desc())
        )

        combined_query = union_all(deposit_query, internal_query, external_query, sending_query)
        records = self.db.execute(combined_query).fetchall()
        # merge the two lists
        resp = []
        for record in records:
            adjusted_record = {}
            for key, value in dict(record._mapping).items():
                # remove the prefix from the key
                # however desposits_create_at will be changed to created_at
                _, col = key.split("_", 1)
                adjusted_record[col] = value
            resp.append(pr.TransactionResponse(**adjusted_record))

        return resp

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
                result.append(TransactionItem(item=item))

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

                return self._collect_transactions(deposits, externals, sendings, internals, forexs)

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
