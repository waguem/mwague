"""Trade State Manager"""

from typing import Dict, Callable
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.repositories.wallet_state import (
    InitState,
    CancelledState,
    PendingState,
    ReviewState,
    PaidState,
    TradeState,
)
from mkdi_backend.utils.database import managed_tx_method, CommitMode
from mkdi_backend.api.deps import UserDBSession


class TradeStateManager:
    """Trade State Manager"""

    def __init__(self, db):
        self.state = pr.TransactionState.INIT
        self.db = db
        self.transitions: Dict[pr.TransactionState, Callable[[], None]] = {
            pr.TransactionState.INIT: InitState,
            pr.TransactionState.REVIEW: ReviewState,
            pr.TransactionState.PENDING: PendingState,
            pr.TransactionState.PAID: PaidState,
            pr.TransactionState.CANCELLED: CancelledState,
        }

    def get_state(self, session: UserDBSession) -> TradeState:
        """Get currency state object"""
        return self.transitions[self.state](session, self.state)

    def start_review(self, session: UserDBSession, review: pr.TradeReviewReq):
        """Start Review"""
        self.state = pr.TransactionState.INIT
        init_state: TradeState = self.get_state(session)
        trade = init_state.get_trade(review.code)

        assert trade.state == pr.TransactionState.REVIEW
        self.state = pr.TransactionState.REVIEW
        t_state: TradeState = self.get_state(session)
        t_state.set_request(review)
        t_state.set_trade(trade)

        return t_state

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(self, session: UserDBSession, trade_request: pr.WalletTradingRequest):
        """Create a trade"""
        t_state: TradeState = self.get_state(session)
        t_state.set_request(trade_request)
        trade = t_state.create()
        return trade

    def approve(self, session: UserDBSession, review: pr.TradeReviewReq):
        """Approve action"""
        t_state = self.start_review(session, review)
        return t_state.approve()

    def cancel(self, session: UserDBSession, review: pr.TradeReviewReq):
        """Cancel action"""
        t_state = self.start_review(session, review)
        return t_state.cancel()

    def reject(self, session: UserDBSession, review: pr.TradeReviewReq):
        """Reject action"""
        t_state = self.start_review(session, review)
        return t_state.reject()

    def pay_trade(
        self, session: UserDBSession, trade_code: str, payment_request: pr.PaymentRequest
    ) -> pr.PaymentResponse:
        """Pay a trade request"""
        self.state = pr.TransactionState.INIT
        init_state = self.get_state(session)
        trade = init_state.get_trade(trade_code)
        # make sure the trade is payable
        assert trade.trading_type in [pr.TradingType.DEPOSIT, pr.TradingType.BUY]
        assert trade.state == pr.TransactionState.PENDING
        self.state = pr.TransactionState.PENDING
        t_state = self.get_state(session)

        t_state.set_request(payment_request)
        t_state.set_trade(trade)

        return t_state.pay()

    def commit(
        self, session: UserDBSession, trade_code: str, commit_request: pr.CommitTradeRequest
    ):
        """Commit a pending Trade"""
        self.state = pr.TransactionState.INIT
        init_state = self.get_state(session)
        trade = init_state.get_trade(trade_code)
        # make sure the trade is payable
        assert trade.trading_type not in [pr.TradingType.DEPOSIT, pr.TradingType.BUY]
        assert trade.state == pr.TransactionState.PENDING
        self.state = pr.TransactionState.PENDING
        t_state = self.get_state(session)

        t_state.set_request(commit_request)
        t_state.set_trade(trade)

        return t_state.commit()

    def rollback(
        self, session: UserDBSession, cancellation: pr.CancelTransaction
    ) -> pr.WalletTradingResponse:
        self.state = pr.TransactionState.INIT
        init_state = self.get_state(session)
        trade = init_state.get_trade(cancellation.code)
        self.state = trade.state

        t_state = self.get_state(session)
        t_state.set_request(cancellation)
        t_state.set_trade(trade)

        return t_state.rollback()

    def update(
        self, session: UserDBSession, trade_request: pr.WalletTradingResponse
    ) -> pr.WalletTradingResponse:
        self.state = pr.TransactionState.INIT
        init_state = self.get_state(session)
        trade = init_state.get_trade(trade_request.code)
        assert trade.state == pr.TransactionState.REVIEW
        self.state = trade.state

        t_state = self.get_state(session)
        t_state.set_request(trade_request)
        t_state.set_trade(trade)

        return t_state.update()

    def partner_paid(self, session: UserDBSession, trade_code: str) -> pr.WalletTradingResponse:
        self.state = pr.TransactionState.INIT
        init_state = self.get_state(session)
        # query the trade
        trade = init_state.get_trade(trade_code)
        self.state = trade.state

        # get it state manager
        t_state = self.get_state(session)
        t_state.set_trade(trade)
        # call the partner paid method
        return t_state.partner_paid()
