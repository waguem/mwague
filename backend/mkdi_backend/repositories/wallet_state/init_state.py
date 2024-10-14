"""Init State"""

from loguru import logger
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.repositories.trades.trade_builder import TradeBuilder
from mkdi_backend.repositories.wallet_state.trade_state import TradeState


class InitState(TradeState):
    """Trade Init State"""

    def create(self):
        logger.info(f"Initializing Trade with data {self.get_request()}")
        builder: TradeBuilder = TradeBuilder(self.db_session)
        trade = builder.make_trade(self.get_request())
        trade.state = pr.TransactionState.REVIEW
        self.db_session.get_db().add(trade)
        return trade
