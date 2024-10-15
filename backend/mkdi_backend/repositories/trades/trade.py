"""Trade Base Class"""

from abc import abstractmethod
from typing import List
from datetime import datetime
from sqlmodel import select
from decimal import Decimal

from mkdi_shared.schemas import protocol as pr
from mkdi_backend.api.deps import UserDBSession
from mkdi_backend.models.transactions.transactions import WalletTrading, Payment
from mkdi_backend.models.office import OfficeWallet
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import Activity, FundCommit
from mkdi_backend.utils.database import managed_tx_method, CommitMode
from mkdi_backend.repositories.transaction_repos.invariant import managed_invariant_tx_method


class ITrade:
    """Base Class for all trades type"""

    def __init__(self, session: UserDBSession):
        self.session = session
        self.trade = None

    def set_trade(self, trade: WalletTrading):
        self.trade = trade

    @abstractmethod
    def create(self, request: pr.WalletTradingRequest) -> WalletTrading:
        """create a trade from the user request"""

    @abstractmethod
    def approve(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:
        """approve a trading"""

    @abstractmethod
    def rollback_paid(self, trade: WalletTrading) -> WalletTrading:
        """rollback a trading"""

    def commit(self, commit: pr.CommitTradeRequest, trade: WalletTrading) -> WalletTrading:
        """approve a trading"""

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def reject(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:
        """approve a trading"""
        trade.state = pr.TransactionState.REJECTED
        self.add_note(trade, review.review.value, review.tags, self.session.user.user_db_id)
        self.session.db.add(trade)
        return trade

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def cancel(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:
        """approve a trading"""
        trade.state = pr.TransactionState.CANCELLED
        self.add_note(trade, review.review.value, review.tags, self.session.user.user_db_id)
        self.session.db.add(trade)
        return trade

    def rollback(self, cancellation: pr.CancelTransaction, trade: WalletTrading) -> WalletTrading:
        """Rollback a trade"""
        assert trade.state in [pr.TransactionState.PENDING, pr.TransactionState.PAID]
        transitions = {
            pr.TransactionState.PENDING: self.rollback_pending,
            pr.TransactionState.PAID: self.rollback_paid,
        }

        self.add_note(trade, "Rollback", cancellation.reason, self.session.user.user_db_id)
        return transitions[trade.state](trade)

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def rollback_pending(self, trade: WalletTrading) -> WalletTrading:
        """Rollback pending State"""
        assert trade.state == pr.TransactionState.PENDING
        trade.state = pr.TransactionState.REVIEW
        self.session.db.add(trade)
        return trade

    def get_trade(self, code: str) -> WalletTrading:
        """get single Trade"""
        return self.session.get_db().scalar(select(WalletTrading).where(WalletTrading.code == code))

    def get_wallet(self, wallet_id: str) -> OfficeWallet:
        """get single wallet"""
        return self.session.get_db().scalar(
            select(OfficeWallet).where(OfficeWallet.walletID == wallet_id)
        )

    def get_account(self, initials: str) -> Account:
        """get Account"""
        return self.session.get_db().exec(select(Account).where(Account.initials == initials)).one()

    def get_fund(self):
        """get office fund"""
        return self.session.db.scalar(
            select(Account).where(
                Account.type == pr.AccountType.FUND,
                Account.office_id == self.session.user.office_id,
            )
        )

    def get_office(self):
        """get office account"""
        return self.session.db.scalar(
            select(Account).where(
                Account.type == pr.AccountType.OFFICE,
                Account.office_id == self.session.user.office_id,
            )
        )

    def get_activity(self):
        return self.session.db.scalar(
            select(Activity).where(
                Activity.office_id == self.session.user.office_id,
                Activity.state == pr.ActivityState.OPEN,
            )
        )

    def update_trade(self, trade: WalletTrading, wallet: OfficeWallet):
        """update trade infos from wallet"""
        trade.pendings = wallet.pending_in - wallet.pending_out
        trade.wallet_trading = wallet.trading_balance
        trade.wallet_value = wallet.value
        trade.wallet_crypto = wallet.crypto_balance

    def add_note(
        self, trade: WalletTrading, msg_type: str, msg: str | List[str], user_id: str
    ) -> None:
        """Add message to trade notes"""
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = msg
        message["type"] = msg_type
        message["user"] = user_id
        trade.notes.append(message)


class IPayableTrade(ITrade):
    """Payable Trades Interface."""

    @abstractmethod
    def apply_payment(
        self,
        *,
        trade: WalletTrading,
        request: pr.PaymentRequest,
        wallet: OfficeWallet,
        fund: Account,
    ) -> WalletTrading:
        """create a trade from the user request"""

    @abstractmethod
    def rollback_payment(
        self,
        *,
        trade: WalletTrading,
        wallet: OfficeWallet,
        fund: Account,
    ) -> WalletTrading:
        """create a trade from the user request"""

    def accounts(self):
        """return office accounts (fund and office)"""
        return [self.get_office(), self.get_fund()]

    @abstractmethod
    def get_payment_amount(self, trade: WalletTrading) -> Decimal:
        """Get the amount to be paid"""

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:
        """APPROVE Payable Trade, it will go to pending and wait for payment."""
        assert trade.state == pr.TransactionState.REVIEW
        wallet = self.get_wallet(trade.walletID)
        self.update_trade(trade, wallet)
        # go to pending and wait for payment
        trade.state = pr.TransactionState.PENDING
        self.add_note(trade, review.review.value, review.tags, self.session.user.user_db_id)
        self.session.db.add(trade)
        return trade

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def pay(self, trade: WalletTrading, request: pr.PaymentRequest):
        """pay trade"""
        assert trade.state == pr.TransactionState.PENDING
        wallet = self.get_wallet(trade.walletID)
        fund = self.get_fund()
        activity = self.get_activity()

        self.apply_payment(trade=trade, request=request, wallet=wallet, fund=fund)

        fund_history = FundCommit(
            v_from=fund.balance,
            variation=self.get_payment_amount(trade),
            account=wallet.wallet_name,
            activity_id=activity.id,
            description=f"Wallet Trade {wallet.wallet_name} {trade.code}",
            is_out=True,  # out
            date=datetime.now(),
        )

        payment = Payment(
            amount=self.get_payment_amount(trade),
            transaction_id=trade.id,
            transaction_type=pr.TransactionType.FOREX,
            state=pr.PaymentState.PAID,
            notes={"notes": []},
            paid_by=self.session.user.user_db_id,
            payment_date=datetime.now(),
        )

        trade.state = pr.TransactionState.PAID
        self.session.db.add(trade)
        self.session.db.add(fund_history)

        return payment

    def rollback(self, cancellation: pr.CancelTransaction, trade: WalletTrading) -> WalletTrading:
        assert trade.state in [pr.TransactionState.PENDING, pr.TransactionState.PAID]
        transitions = {
            pr.TransactionState.PENDING: self.rollback_pending,
            pr.TransactionState.PAID: self.rollback_paid,
        }

        self.add_note(trade, "Rollback", cancellation.reason, self.session.user.user_db_id)
        return transitions[trade.state](trade)

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def rollback_paid(self, trade: WalletTrading) -> WalletTrading:
        """Rollback a trade"""
        assert trade.state == pr.TransactionState.PAID
        wallet = self.get_wallet(trade.walletID)
        fund = self.get_fund()
        activity = self.get_activity()

        self.rollback_payment(trade=trade, wallet=wallet, fund=fund)

        fund_history = FundCommit(
            v_from=fund.balance,
            variation=self.get_payment_amount(trade),
            account=wallet.wallet_name,
            activity_id=activity.id,
            description=f"Rollback Wallet Trade Payment {wallet.wallet_name} {trade.code}",
            is_out=False,  # out
            date=datetime.now(),
        )

        # cancel previous payments
        for payment in trade.payments:
            if payment.state == pr.PaymentState.PAID:
                payment.state = pr.PaymentState.CANCELLED
                self.session.db.add(payment)

        trade.state = pr.TransactionState.PENDING
        self.session.db.add(trade)
        self.session.db.add(fund_history)

        return trade
