"""PAID State"""

from loguru import logger
from mkdi_backend.repositories.wallet_state.trade_state import TradeState


class PaidState(TradeState):
    """Trade Init State"""

    def create(self):
        logger.info("Initializing Trade with data")
