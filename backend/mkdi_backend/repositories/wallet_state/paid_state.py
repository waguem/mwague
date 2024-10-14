"""PAID State"""

from mkdi_backend.repositories.trades.trade_builder import TradeBuilder
from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_backend.repositories.wallet_state.trade_state import TradeState


class PaidState(TradeState):
    """Trade Init State"""

    def rollback(self) -> WalletTrading:
        return TradeBuilder(self.db_session).rollback(self.request, self.trade)
