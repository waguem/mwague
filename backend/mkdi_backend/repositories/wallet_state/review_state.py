"""review State"""

from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_backend.repositories.wallet_state.trade_state import TradeState
from mkdi_backend.repositories.trades.trade_builder import TradeBuilder


class ReviewState(TradeState):
    """Trade Init State"""

    def approve(self) -> WalletTrading:
        """Approved Review"""
        builder: TradeBuilder = TradeBuilder(self.db_session)
        trade = builder.approve(trade=self.trade, review=self.get_request())
        return trade

    def reject(self) -> WalletTrading:
        """Rejected Review"""
        builder: TradeBuilder = TradeBuilder(self.db_session)
        trade = builder.reject(trade=self.trade, review=self.get_request())
        return trade

    def cancel(self) -> WalletTrading:
        """Cancelled Review"""
        builder: TradeBuilder = TradeBuilder(self.db_session)
        trade = builder.cancel(trade=self.trade, review=self.get_request())
        return trade
