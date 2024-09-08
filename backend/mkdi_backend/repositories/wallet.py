"""wallet trading repository"""

from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.transactions.transactions import WalletTrading, Payment
from mkdi_backend.models.office import OfficeWallet
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import FundCommit, Activity
from sqlmodel import Session, select, or_
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.repositories.account import AccountRepository
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_backend.utils.database import managed_tx_method, CommitMode
from mkdi_backend.repositories.transaction_repos.invariant import managed_invariant_tx_method
from typing import List
from datetime import datetime
from functools import wraps


class WalletRepository:
    """Wallet repository."""

    def __init__(self, db: Session, user: KcUser):
        self.db = db
        self.user = user

    def trade_wallet(self, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Trade wallet."""
        match request.trading_type:
            case pr.TradingType.BUY:
                return self.buy(request)
            case pr.TradingType.SELL:
                return self.sell(request)
            case pr.TradingType.EXCHANGE:
                return self.exchange(request)
            case _:
                raise ValueError("Invalid trading type")

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

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def buy(self, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Buy currency for the wallet."""
        wallet = self.get_wallet(request.walletID)

        if not wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )

        assert isinstance(request.request, pr.BuyRequest)
        buy_request: pr.BuyRequest = request.request
        provider = self.db.scalar(
            select(Account).where(
                Account.initials == buy_request.provider, Account.office_id == self.user.office_id
            )
        )
        office = self._get_office(self.user.office_id)

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.user.user_db_id,
            state=pr.TransactionState.PENDING,
            account=provider.initials,
            notes=[],
        )
        trade.code = self.generate_code(office.initials, office.counter if office.counter else 0)
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = request.message
        message["type"] = "BUY"
        message["user"] = self.user.user_db_id
        trade.notes.append(message)

        office.counter = office.counter + 1 if office.counter else 1

        trade.pendings = wallet.pending_in - wallet.pending_out
        trade.wallet_trading = wallet.trading_balance
        trade.wallet_value = wallet.value
        trade.wallet_crypto = wallet.crypto_balance

        self.db.add(trade)
        self.db.add(office)
        return trade

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def sell(self, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Sell currency from the wallet."""
        wallet = self.get_wallet(request.walletID)

        if not wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )
        sell_request: pr.SellRequest = request.request
        assert isinstance(sell_request, pr.SellRequest)

        customer = self.db.scalar(
            select(Account).where(
                Account.initials == sell_request.customer, Account.office_id == self.user.office_id
            )
        )

        office = self._get_office(self.user.office_id)

        if not customer:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Customer not found",
            )

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.user.user_db_id,
            state=pr.TransactionState.PAID,
            account=customer.initials,
            notes=[],
        )

        trade.code = self.generate_code(office.initials, office.counter if office.counter else 0)

        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = request.message
        message["type"] = "SELL"
        message["user"] = self.user.user_db_id

        trade.notes.append(message)

        trade.pendings = wallet.pending_in - wallet.pending_out
        trade.wallet_trading = wallet.trading_balance
        trade.wallet_value = wallet.value
        trade.wallet_crypto = wallet.crypto_balance

        office.counter = office.counter + 1 if office.counter else 1
        # move funds from wallet to customer
        self.sell_to_customer(customer, wallet, request)

        self.db.add(trade)
        self.db.add(wallet)
        self.db.add(customer)
        self.db.add(office)

        return trade

    def sell_to_customer(
        self, customer: Account, wallet: OfficeWallet, request: pr.WalletTradingRequest
    ):
        assert request.trading_rate > 0
        assert wallet.crypto_balance > 0
        value = request.amount / request.trading_rate  # amount in account currency (USD)

        if request.request.currency == wallet.trading_currency:
            assert wallet.trading_balance >= request.amount

            wallet_rate = wallet.crypto_balance / wallet.trading_balance
            cost_rate = wallet.value / wallet.trading_balance

            amount_in_crypto = (
                request.amount * wallet_rate
            )  # amount in the trading_currency (RMB 35,400 e.g)

            selling_value = request.amount * cost_rate

            # charge the customer account by the value
            customer.debit(value)

            wallet.crypto_balance -= amount_in_crypto
            wallet.value -= selling_value
            wallet.trading_balance -= request.amount

            benefit_or_lost = value - selling_value
            # charge this lost to the office

            if benefit_or_lost != 0:
                office = self.db.scalar(
                    select(Account).where(
                        Account.type == pr.AccountType.OFFICE,
                        Account.office_id == self.user.office_id,
                    )
                )
                if benefit_or_lost > 0:
                    office.credit(benefit_or_lost)
                else:
                    office.debit(benefit_or_lost)

                self.db.add(office)

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def exchange(self, request: pr.WalletTradingRequest) -> pr.WalletTradingResponse:
        """Exchange currency from the wallet to another currency, using a other wallet"""
        exchange_request: pr.ExchangeRequest = request.request
        assert isinstance(exchange_request, pr.ExchangeRequest)
        wallet = self.get_wallet(request.walletID)
        exchange_wallet = self.get_wallet(exchange_request.walletID)

        if not wallet or not exchange_wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )
        # use office account to generate the code
        office = self._get_office(self.user.office_id)

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.user.user_db_id,
            state=pr.TransactionState.PAID,
            exchange_walletID=exchange_wallet.walletID,
            exchange_rate=exchange_request.exchange_rate,
            notes=[],
        )

        trade.code = self.generate_code(office.initials, office.counter if office.counter else 0)
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = request.message
        message["type"] = "EXCHANGE"
        message["user"] = self.user.user_db_id
        trade.notes.append(message)

        trade.pendings = wallet.pending_in - wallet.pending_out
        trade.wallet_trading = wallet.trading_balance
        trade.wallet_value = wallet.value
        trade.wallet_crypto = wallet.crypto_balance

        # move funds from wallet to exchange_wallet
        self.exchange_wallets(wallet, exchange_wallet, request)

        office.counter = office.counter + 1 if office.counter else 1
        self.db.add(trade)
        self.db.add(wallet)
        self.db.add(exchange_wallet)
        self.db.add(office)
        return trade

    def exchange_wallets(
        self, source: OfficeWallet, destination: OfficeWallet, request: pr.WalletTradingRequest
    ):
        assert source.crypto_currency == destination.crypto_currency
        assert source.crypto_balance >= request.amount
        assert request.request.exchange_rate > 0

        source_tr = source.trading_balance / source.crypto_balance
        source_rate = source.value / source.crypto_balance

        value = request.amount * source_rate
        source.crypto_balance -= request.amount
        source.value -= value
        source.trading_balance -= request.amount * source_tr

        destination.crypto_balance += request.amount
        destination.value += value
        destination.trading_balance += request.amount * request.request.exchange_rate

    def get_wallet_tradings(self, walletID: str) -> List[pr.WalletTradingResponse]:
        """Get wallet tradings."""
        return self.db.scalars(
            select(WalletTrading)
            .where(
                or_(WalletTrading.walletID == walletID, WalletTrading.exchange_walletID == walletID)
            )
            .order_by(WalletTrading.created_at.desc())
        ).all()

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def pay_trade(self, tradeID: str) -> pr.WalletTradingResponse:
        """Pay Trade"""
        trade = self.db.scalar(
            select(WalletTrading).where(
                WalletTrading.id == tradeID, WalletTrading.state == pr.TransactionState.PENDING
            )
        )
        if not trade:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Trade not found",
            )
        # find wallet
        wallet = self.get_wallet(trade.walletID)
        if not wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )
        # get fund account
        fund = self.db.scalar(
            select(Account).where(
                Account.type == pr.AccountType.FUND, Account.office_id == self.user.office_id
            )
        )

        if not fund:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Fund account not found",
            )
        fund_out = trade.amount * (trade.trading_rate / trade.daily_rate)
        # move funds from fund to the wallet account
        # the wallet currency is in crypto currency, but
        # it holds the equivalent amount in the fund account
        activity = self.db.scalar(
            select(Activity).where(
                Activity.office_id == self.user.office_id, Activity.state == pr.ActivityState.OPEN
            )
        )
        fund.debit(fund_out)
        wallet.crypto_balance += trade.amount
        wallet.value += fund_out
        wallet.trading_balance += trade.amount * trade.trading_rate
        fund_history = FundCommit(
            v_from=(fund.balance),
            variation=fund_out,
            activity_id=activity.id,
            description=f"Wallet Trade {trade.walletID} {trade.code}",
            is_out=True,  # out
            date=datetime.now(),
        )

        payment = Payment(
            amount=fund_out,
            transaction_id=trade.id,
            transaction_type=pr.TransactionType.FOREX,
            state=pr.PaymentState.PAID,
            notes={"notes": []},
            paid_by=self.user.user_db_id,
        )

        trade.state = pr.TransactionState.PAID
        payment.payment_date = datetime.now()
        self.db.add(fund_history)
        self.db.add(trade)

        return payment

    def generate_code(self, initial, counter) -> str:
        """generate a unique code for the internal transaction"""
        now = datetime.now()
        month = now.strftime("%m")
        day = now.strftime("%d")
        year = now.strftime("%y")
        return f"{initial}{month}{day}{year}{counter+1:03}"
