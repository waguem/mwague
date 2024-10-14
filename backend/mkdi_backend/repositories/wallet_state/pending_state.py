"""Pending State"""

from mkdi_backend.repositories.wallet_state.trade_state import TradeState
from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_backend.repositories.trades.trade_builder import TradeBuilder


class PendingState(TradeState):
    """Trade Init State"""

    def pay(self) -> WalletTrading:
        return TradeBuilder(self.db_session).pay(self.request, self.trade)

    def commit(self) -> WalletTrading:
        return TradeBuilder(self.db_session).commit(self.request, self.trade)

    def rollback(self) -> WalletTrading:
        return TradeBuilder(self.db_session).put_under_review(self.request, self.trade)
