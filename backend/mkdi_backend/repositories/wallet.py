"""wallet trading repository"""

from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.transactions.transactions import WalletTrading, Payment
from mkdi_backend.models.office import OfficeWallet
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import FundCommit, Activity
from mkdi_backend.models.Agent import Agent
from sqlmodel import Session, select, or_
from mkdi_shared.schemas import protocol as pr
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_backend.utils.database import managed_tx_method, CommitMode
from mkdi_backend.repositories.transaction_repos.invariant import managed_invariant_tx_method
from mkdi_backend.utils.dateutils import get_month_range
from typing import List
from datetime import datetime
from mkdi_backend.repositories.wallet_state import TradeStateManager
from mkdi_backend.api.deps import UserDBSession


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
            )
            .order_by(WalletTrading.created_at.desc())
        ).all()

        return tradings

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def commit_trade_rem(self, commit: pr.CommitTradeRequest) -> pr.WalletTradingResponse:
        # find the trade
        trade = self.db.scalar(
            select(WalletTrading).where(
                WalletTrading.id == commit.tradeID,
                WalletTrading.state == pr.TransactionState.PENDING,
            )
        )
        if not trade:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Trade not found",
            )
        # the trade should be in pending state
        # find wallet
        wallet = self.get_wallet(trade.walletID)
        if not wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )
        # get the customer_account

        customer = self.db.scalar(
            select(Account).where(
                Account.initials == trade.account, Account.office_id == self.user.office_id
            )
        )
        if not customer:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Customer not found",
            )

        office = self._get_office(self.user.office_id)

        trade.wallet_trading = wallet.trading_balance
        trade.wallet_value = wallet.value
        trade.wallet_crypto = wallet.crypto_balance
        trade.pendings = wallet.pending_in - wallet.pending_out

        wallet.trading_balance -= commit.amount
        wallet.value -= commit.trading_cost
        wallet.crypto_balance -= commit.crypto_amount

        trade.trading_rate = commit.trading_rate
        trade.amount = commit.amount

        customer.debit(commit.sold_amount)

        office.credit(commit.trading_result)

        trade.state = pr.TransactionState.PAID
        self.db.add(wallet)
        self.db.add(trade)
        self.db.add(customer)

        return trade

    def get_message(self, msg: str, msg_type: str):
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = msg
        message["type"] = msg_type
        message["user"] = self.user.user_db_id
        return message
