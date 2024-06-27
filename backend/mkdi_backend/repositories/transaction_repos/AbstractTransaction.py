from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Tuple

from loguru import logger
from mkdi_backend.models.Account import Account, AccountType
from mkdi_backend.models.Activity import Activity
from mkdi_backend.models.models import KcUser
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.schemas.protocol import ActivityState, TransactionRequest
from sqlmodel import Session, any_

from .invariant import managed_invariant_tx_method


class AbstractTransaction(ABC):
    """
    """


    def __init__(self,db:Session,user:KcUser,input:TransactionRequest):
        self.db = db
        self.user = user
        self.input = input
        self._accounts = []
        self.activity = None


    def get_rate(self):
        return self.input.amount.rate

    def get_charges(self):
        return self.input.charges.amount
    def get_amount(self):
        return self.input.amount.amount

    def get_inputs(self):
        return self.input.data

    def get_db(self):
        return self.db

    def has_started_activity(self):
        if not self.activity:
            self.activity = self.db.query(Activity).filter(Activity.office_id==self.user.office_id,Activity.state==ActivityState.OPEN).one()
        return self.activity

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def commit(self)->None:
        # apply steps to commit a transaction
        return self.commit_transaction()

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def request(self):
        # apply steps to request a transaction
        return self.do_transaction()

    def set_activity(self,activity:Activity):
        self.activity = activity

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def rollback(self)->None:
        return self.cancel_transaction()


    def use_office_accounts(self)->Tuple[Account,Account]:
        # select account from db
        accounts = self.db.query(Account).filter(Account.owner_id == self.user.office_id ).order_by(Account.type).all() # must be exactly 2 accounts
        if len(accounts) != 2:
            raise Exception("Office must have exactly 2 accounts")
        return accounts[0],accounts[1]

    def use_account(self,initials:str,account_type:AccountType=AccountType.AGENT)->Account | None:
        # select account from db
        return self.db.query(Account).filter(Account.initials == initials and Account.type==account_type and Account.office_id == self.user.office_id).one()

    def use_accounts(self,initials:list[str])->List[Account]:
        # select accounts from db
        return self.db.query(Account).filter(any_()).all()

    @abstractmethod
    def do_transaction(self)->None:
        pass

    @abstractmethod
    def commit_transaction(self)->None:
        pass

    @abstractmethod
    def cancel_transaction(self)->None:
        pass

    @abstractmethod
    def accounts(self)-> List[Account]:
        pass
