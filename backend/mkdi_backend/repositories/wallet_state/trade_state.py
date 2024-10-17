""" This is the interface for wallet Trade state. """

from typing import Protocol, Union
from sqlmodel import select
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.api.deps import UserDBSession
from mkdi_backend.repositories.wallet_state.state_exception import StateException
from mkdi_backend.models.transactions.transactions import WalletTrading


class ITradeState(Protocol):
    """Trade State Class"""

    def create(self):
        """Transition from INIT to REVIEW."""

    def approve(self):
        """Transition from REVIEW to PENDING or PAID."""

    def reject(self):
        """Transition from REVIEW to REVIEW or from PENDING to REVIEW."""

    def cancel(self):
        """Transition from REVIEW to CANCELLED."""

    def cancel_payment(self):
        """Transition from PAID to REVIEW."""

    def pay(self):
        """Transition from PENDING to PAID"""

    def commit(self):
        """Transition from PENDING to PAID"""

    def update(self):
        """Update Trade when it is under review"""

    def get_state(self) -> pr.TransactionState:
        """Get the current state of the machine."""


TradeRequest = Union[
    pr.TradeReviewReq,
    pr.PaymentRequest,
    pr.CommitTradeRequest,
    pr.WalletTradingRequest,
    pr.CancelTransaction,
    pr.WalletTradingResponse,
]


class TradeState(ITradeState):
    """Trade Base State."""

    def __init__(self, db: UserDBSession, state):
        self.state: pr.TransactionState = state
        self.db_session: UserDBSession = db
        self.trade = None

        self.request: TradeRequest = None

    def set_request(self, request: TradeRequest):
        """Start Transition"""
        self.request = request

    def set_trade(self, trade: WalletTrading):
        self.trade = trade

    def create(self) -> WalletTrading:
        """Transition from INIT to REVIEW."""
        raise StateException("Invalid action 'create' for state", self.state)

    def approve(self) -> WalletTrading:
        """Transition from REVIEW to PENDING or PAID."""
        raise StateException("Invalid action 'approve' for state", self.state)

    def reject(self) -> WalletTrading:
        """Transition from REVIEW to REVIEW or from PENDING to REVIEW."""
        raise StateException("Invalid action 'reject' for state", self.state)

    def cancel(self) -> WalletTrading:
        """Transition from REVIEW to CANCELLED."""
        raise StateException("Invalid action 'cancel' for state", self.state)

    def pay(self) -> WalletTrading:
        """Transition from PENDING to PAID"""
        raise StateException("Invalid action 'pay' for state", self.state)

    def commit(self) -> WalletTrading:
        """Transition from PENDING to PAID"""
        raise StateException("Invalid action 'commit' for state", self.state)

    def rollback(self) -> WalletTrading:
        """Transition from PAID to REVIEW."""
        raise StateException("Invalid action 'cancel payment' for state", self.state)

    def update(self):
        """Update Trade when it is under review"""
        raise StateException("Invalid action 'update' for state", self.state)

    def get_request(self) -> TradeRequest:
        """Get Payload"""
        return self.request

    def get_trade(self, code) -> WalletTrading:
        return self.db_session.get_db().scalar(
            select(WalletTrading).where(WalletTrading.code == code)
        )

    def get_state(self) -> pr.TransactionState:
        """Get the current state of the machine."""
        return self.state
