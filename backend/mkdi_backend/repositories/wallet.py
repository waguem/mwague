"""wallet trading repository"""

from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_backend.models.office import OfficeWallet
from sqlmodel import Session, select
from mkdi_shared.schemas import protocol as pr
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_backend.utils.database import managed_tx_method, CommitMode
from typing import List


class WalletRepository:
    """Wallet repository."""

    def __init__(self, db: Session):
        self.db = db

    def trade_wallet(
        self, user: KcUser, request: pr.WalletTradingRequest
    ) -> pr.WalletTradingResponse:
        """Trade wallet."""
        match request.trading_type:
            case pr.TradingType.BUY:
                return self.buy(user, request)
            case pr.TradingType.SELL:
                return self.sell(user, request)
            case pr.TradingType.EXCHANGE:
                return self.exchange(user, request)
            case _:
                raise ValueError("Invalid trading type")

    def get_wallet(self, walletID: str) -> OfficeWallet:
        """Get wallet by ID."""
        return self.db.scalar(select(OfficeWallet).where(OfficeWallet.walletID == walletID))

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def buy(self, user: KcUser, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Buy currency for the wallet."""
        wallet = self.get_wallet(request.walletID)

        if not wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=user.user_db_id,
            state=pr.TransactionState.PENDING,
        )

        trade.initial_balance = (wallet.crypto_balance + wallet.pending_in) - wallet.pending_out
        self.db.add(trade)
        return trade

    def sell(self, user: KcUser, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Sell currency from the wallet."""

    def exchange(self, user: KcUser, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Exchange currency from the wallet to another currency, using a other wallet"""

    def get_wallet_tradings(self, user: KcUser, walletID: str) -> List[pr.WalletTradingResponse]:
        """Get wallet tradings."""
        return self.db.scalars(
            select(WalletTrading).where(WalletTrading.walletID == walletID)
        ).all()
