


from typing import List

from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Deposit, Internal
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas.protocol import TransactionRequest, TransactionResponse
from pydantic import ValidationError
from sqlmodel import Session, or_

from .transaction_repos import deposit, internal
from .transaction_repos.AbstractTransaction import AbstractTransaction


class TransactionRepository:
    def __init__(self,db:Session):
        self.db = db

    def request_for_approval(self,user:KcUser,input:TransactionRequest):
        match input.data.type:
            case "INTERNAL":
                return internal.InternalTransaction(self.db,user,input).request()
            case "DEPOSIT":
                return deposit.DepositTransaction(self.db,user,input).request()

    def get_agent_transactions(self,user,initials:str)->List[TransactionResponse]:

        internals = (
            self.db.query(Internal)
            .join(Account, or_(Internal.sender_account_id == Account.id, Internal.receiver_account_id == Account.id))
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials)
            .order_by(Internal.created_at.desc())
            .all()
        )

        deposits =(
            self.db.query(Deposit)
            .join(Account,Deposit.account_id == Account.id)
            .join(Agent, Agent.id == Account.owner_id)
            .filter(Agent.initials == initials)
            .order_by(Deposit.created_at.desc())
            .all()
        )
        # merge the two lists
        transactions = internals + deposits

        return [transaction.to_response() for transaction in transactions]
