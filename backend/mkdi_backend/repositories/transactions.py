from typing import List

from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Deposit, Internal
from mkdi_backend.repositories.transaction_repos import deposit, internal
from mkdi_backend.repositories.transaction_repos.abstract_transaction import AbstractTransaction
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from pydantic import ValidationError
from sqlmodel import Session, or_


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

        internals = (
            self.db.query(Internal)
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
            .all()
        )

        deposits = (
            self.db.query(Deposit)
            .join(Account, Deposit.owner_initials == Account.initials)
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials)
            .order_by(Deposit.created_at.desc())
            .all()
        )
        # merge the two lists
        transactions = internals + deposits

        return [transaction.to_response() for transaction in transactions]

    def get_concrete_type(self, transaction_type: str) -> AbstractTransaction:
        """return the concrete type for the transaction"""
        from loguru import logger

        logger.debug(
            f"Getting concrete type for {transaction_type} {type(transaction_type)} and {pr.TransactionType(transaction_type)== pr.TransactionType.DEPOSIT}"
        )
        match pr.TransactionType(transaction_type):
            case pr.TransactionType.INTERNAL:
                return internal.InternalTransaction
            case pr.TransactionType.DEPOSIT:
                return deposit.DepositTransaction
            case _:
                raise MkdiError(
                    error_code=MkdiErrorCode.INVALID_STATE,
                    message=f"Invalid transaction type {transaction_type}",
                )

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
