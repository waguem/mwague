"""wallet trading repository"""

from datetime import datetime
from typing import List
from sqlmodel import Session, select, or_
from mkdi_shared.schemas import protocol as pr

from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_backend.models.office import OfficeWallet
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent

from mkdi_backend.utils.dateutils import get_month_range
from mkdi_backend.api.deps import UserDBSession
from mkdi_backend.repositories.wallet_state import TradeStateManager
from mkdi_backend.utils.database import managed_tx_method, CommitMode


class WalletRepository:
    """Wallet repository."""

    def __init__(self, db: Session, user: KcUser):
        self.db = db
        self.user = user
        self.trade_manager = TradeStateManager(db)

    def trade_wallet(self, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Trade wallet."""
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        return self.trade_manager.create(db_session, request)

    def review_trade(self, review: pr.TradeReviewReq) -> pr.WalletTradingResponse:
        """Review Trade"""
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        match review.review:
            case pr.ValidationState.APPROVED:
                return self.trade_manager.approve(db_session, review)
            case pr.ValidationState.REJECTED:
                return self.trade_manager.reject(db_session, review)
            case pr.ValidationState.CANCELLED:
                return self.trade_manager.cancel(db_session, review)

    def pay(self, trade_code: str, payment_request: pr.PaymentRequest) -> pr.WalletTradingResponse:
        """Pay Trade"""
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        return self.trade_manager.pay_trade(db_session, trade_code, payment_request)

    def commit_trade(
        self, trade_code: str, commit: pr.CommitTradeRequest
    ) -> pr.WalletTradingResponse:
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        return self.trade_manager.commit(db_session, trade_code, commit)

    def rollback(self, cancellation: pr.CancelTransaction) -> pr.WalletTradingResponse:
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        return self.trade_manager.rollback(db_session, cancellation)

    def update(self, trade_request: pr.WalletTradingResponse) -> pr.WalletTradingResponse:
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        return self.trade_manager.update(db_session, trade_request)

    def partner_paid(self, trade_code: str) -> pr.WalletTradingResponse:
        db_session: UserDBSession = UserDBSession(user=self.user, db=self.db)
        return self.trade_manager.partner_paid(db_session, trade_code)

    def accounts(self) -> List[Account]:
        """Get user accounts."""
        return self.db.scalars(
            select(Account).where(Account.owner_id == self.user.user_db_id)
        ).all()

    def get_wallet(self, walletID: str) -> OfficeWallet:
        """Get wallet by ID."""
        return self.db.scalar(select(OfficeWallet).where(OfficeWallet.walletID == walletID))

    def _get_office(self, office_id: str) -> Account:
        """Get office account."""
        return self.db.scalar(
            select(Account).where(
                Account.type == pr.AccountType.OFFICE, Account.office_id == office_id
            )
        )

    def get_wallet_tradings(self, walletID: str) -> List[pr.WalletTradingResponse]:
        """Get wallet tradings."""
        return self.db.scalars(
            select(WalletTrading)
            .where(
                or_(WalletTrading.walletID == walletID, WalletTrading.exchange_walletID == walletID)
            )
            .order_by(WalletTrading.created_at.desc())
        ).all()

    def get_agent_tradings(self, initials, start_date_str: str | None, end_date_str: str | None):
        accounts = self.db.scalars(
            select(Account)
            .join(Agent, Account.owner_id == Agent.id)
            .where(Agent.initials == initials)
        ).all()

        initials_list = [account.initials for account in accounts]

        start, end = get_month_range(start_date_str, end_date_str)

        tradings = self.db.scalars(
            select(WalletTrading)
            .where(
                WalletTrading.account.in_(initials_list),
                WalletTrading.created_at >= start,
                WalletTrading.created_at <= end,
                WalletTrading.trading_type.in_([pr.TradingType.SELL, pr.TradingType.SIMPLE_SELL]),
            )
            .order_by(WalletTrading.created_at.desc())
        ).all()

        return tradings

    def get_message(self, msg: str, msg_type: str):
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = msg
        message["type"] = msg_type
        message["user"] = self.user.user_db_id
        return message

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def set_balance_tracking_enabled(self, walletID: str, enabled: bool) -> OfficeWallet:
        """Set balance tracking enabled for a wallet."""
        wallet = self.get_wallet(walletID)
        if wallet and (wallet.partner_balance is None or wallet.partner_balance == 0):
            wallet.balance_tracking_enabled = enabled
            wallet.partner_balance = 0
            return wallet
        else:
            raise ValueError(f"Wallet with ID {walletID} not found.")
