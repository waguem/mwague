from datetime import datetime
from typing import List

from mkdi_backend.models.Account import Account
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Internal
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas.protocol import InternalRequest, TransactionRequest, TransactionState, TransactionType

from .AbstractTransaction import AbstractTransaction


class InternalTransaction(AbstractTransaction):
    """
    """

    def generate_code(self,initial):
        return f"{initial}{self.get_inputs().receiver}{datetime.now().strftime('H%M%S')}"

    def accounts(self) -> List[Account]:
        """_summary_

        Returns:
            List[Account]: _description_
        """
        accounts= [
            self.use_account(self.get_inputs().sender),
            self.use_account(self.get_inputs().receiver)
        ]

        # if there are charges, add the office account
        if self.get_charges() > 0:
            office_account,_ = self.use_office_accounts()
            accounts.append(office_account)

        return accounts

    def enter(self):
        office = None
        accounts = self.accounts()
        receiver,sender = accounts.pop(),accounts.pop()
        if len(accounts) == 3:
            office = accounts.pop()

        if not sender or not receiver:
            raise MkdiError(
                f"Unable to find sender or receiver account",
                error_code=MkdiErrorCode.INVALID_INPUT,
            )
        # debit the sender account
        sender.balance -= self.get_amount()
        receiver.balance += self.get_amount()

        if office and self.get_charges() > 0:

            office.balance += self.get_charges()
            sender.balance -= self.get_charges()

        return [sender,receiver,office]

    def do_transaction(self) -> None:
        user:KcUser = self.user
        input:InternalRequest = self.get_inputs()

        assert isinstance(input,InternalRequest)
        assert input.receiver is not None
        assert input.sender is not None
        assert input.sender != input.receiver

        sender,receiver,office = self.enter()
        self.db.add(sender)
        self.db.add(receiver)

        if office:
            self.db.add(office)

        internal= Internal(
            amount=self.get_amount(),
            code=self.generate_code(sender.initials),
            office_id=user.office_id,
            org_id=user.organization_id,
            type=TransactionType.INTERNAL,
            state=TransactionState.PENDING,
            rate=self.get_rate(),
            sender_account_id=sender.id,
            receiver_account_id=receiver.id,
            created_by=user.user_db_id
        )

        return internal

    def cancel_transaction(self, user: KcUser, input: TransactionRequest) -> None:
        return Internal(
            amount=0,
            code="Internal Code",
            id="#0000",
            office_id=user.office_id,
            org_id=user.organization_id,
            type=TransactionType.INTERNAL,
            state=TransactionState.CANCELLED,
            receiver_account_id=input.receiver,
            url="http://localhost:8000/transactions/internal/0000",
            rate=1,
            sender_account_id=input.sender,
            created_by=user.user_db_id,
            created_at=datetime.now(),
        )
