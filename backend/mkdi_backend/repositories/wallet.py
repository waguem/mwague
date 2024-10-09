"""wallet trading repository"""

from mkdi_backend.api.deps import KcUser
from mkdi_backend.models.transactions.transactions import WalletTrading, Payment
from mkdi_backend.models.office import OfficeWallet
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import FundCommit, Activity
from mkdi_backend.models.Agent import Agent
from sqlmodel import Session, select, or_
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.repositories.account import AccountRepository
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_backend.utils.database import managed_tx_method, CommitMode
from mkdi_backend.repositories.transaction_repos.invariant import managed_invariant_tx_method
from mkdi_backend.utils.dateutils import get_month_range
from typing import List
from datetime import datetime


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
            case pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
                return self.exchange_with_simple_wallet(request)
            case pr.TradingType.DEPOSIT:
                return self.simple_wallet_deposit(request)
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
            trading_currency=wallet.crypto_currency.value,
            notes=[],
        )
        trade.code = self.generate_code(wallet.initials, office.counter if office.counter else 0)
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
            selling_currency=request.request.currency.value,
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
        # if the requested amount is greater than the trading balance then the trade will be in pending state and no movement is maid
        self.sell_to_customer(trade, customer, wallet, request)

        self.db.add(trade)
        self.db.add(wallet)
        self.db.add(customer)
        self.db.add(office)

        return trade

    def sell_to_customer(
        self,
        trade: WalletTrading,
        customer: Account,
        wallet: OfficeWallet,
        request: pr.WalletTradingRequest,
    ):
        benefit_or_lost = 0
        office = self._get_office(self.user.office_id)

        if request.request.currency == wallet.trading_currency:

            # let's say we have 1000 RMB in the wallet
            # and the request is to sell 2000 RMB
            # we can't sell more than what we have in the wallet so we must put the trade in pending and wait until the wallet is funded
            # hovever the customer account during report generation will show the amount as sold
            if not wallet.trading_balance >= request.amount:
                trade.state = pr.TransactionState.PENDING
                return

            wallet_rate = wallet.crypto_balance / wallet.trading_balance
            cost_rate = wallet.value / wallet.trading_balance

            value = request.amount / request.trading_rate  # amount in account currency (USD)
            selling_value = request.amount * cost_rate
            benefit_or_lost = value - selling_value

            amount_in_crypto = (
                request.amount * wallet_rate
            )  # amount in the trading_currency (RMB 35,400 e.g)

            # charge the customer account by the value
            customer.debit(value)

            wallet.crypto_balance -= amount_in_crypto
            wallet.value -= selling_value
            wallet.trading_balance -= request.amount

            # charge this lost to the office

        elif request.request.currency == wallet.crypto_currency:
            # this is the case were we are selling the crypto currency,
            # the amount is in the crypto currency
            if not wallet.crypto_balance >= request.amount:
                trade.state = pr.TransactionState.PENDING
                return
            # let's say the wallet is 10000 USDT with valuation 10019.08 USD and 36770 AED
            # we are trying to sell 5000 USDT at the rate of 1USDT = 3.678 AED
            # how much 5000 USDT cost at buying time ?
            # the wallet rate is 10019.08 / 10000 = 1.001908
            # the cost rate is 36770 / 10000 = 3.677

            # at buying time
            # the amount in the wallet currency is 5000 * 1.001908 = 5009.54 USD
            # the amount in the trading currency is 5000 * 3.677 = 18385 AED

            # at selling time
            # selling rate is 3.678 and USD AED rate is 3.67 so the rate USDT USD is 1.0019
            wallet_rate = wallet.value / wallet.crypto_balance
            cost_rate = wallet.trading_balance / wallet.crypto_balance

            amount_in_trading = request.amount * cost_rate
            selling_value = request.amount * wallet_rate
            selling_rate = request.trading_rate / request.daily_rate
            sold = request.amount * selling_rate

            benefit_or_lost = sold - selling_value

            # charge the customer account by the value
            customer.debit(sold)
            wallet.crypto_balance -= request.amount
            wallet.value -= selling_value
            wallet.trading_balance -= amount_in_trading

        if benefit_or_lost != 0:
            office.credit(benefit_or_lost)
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
            exchange_currency=wallet.trading_currency.value,
            trading_currency=wallet.exchange_currency.value,
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
        self.exchange_wallets(wallet, exchange_wallet, office, request)

        office.counter = office.counter + 1 if office.counter else 1
        self.db.add(trade)
        self.db.add(wallet)
        self.db.add(exchange_wallet)
        self.db.add(office)
        return trade

    def exchange_wallets(
        self,
        source: OfficeWallet,
        destination: OfficeWallet,
        office: Account,
        request: pr.WalletTradingRequest,
    ):
        assert source.crypto_currency == destination.crypto_currency
        assert source.crypto_balance >= request.amount
        assert request.request.exchange_rate > 0

        source_tr = source.trading_balance / source.crypto_balance
        source_rate = source.value / source.crypto_balance

        value = request.amount * source_rate
        source.value -= value

        source.crypto_balance -= request.amount
        source.trading_balance -= request.amount * source_tr

        destination.crypto_balance += request.amount

        exchange_value = request.amount * (request.trading_rate / request.daily_rate)

        delta = exchange_value - value

        office.credit(delta)

        destination.value += exchange_value

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

        if trade.trading_type == pr.TradingType.DEPOSIT:
            fund_out = trade.amount * (1 + trade.trading_rate / 100)

        # move funds from fund to the wallet account
        # the wallet currency is in crypto currency, but
        # it holds the equivalent amount in the fund account

        activity = self.db.scalar(
            select(Activity).where(
                Activity.office_id == self.user.office_id, Activity.state == pr.ActivityState.OPEN
            )
        )

        fund.debit(fund_out)
        wallet.crypto_balance += trade.amount if trade.trading_type == pr.TradingType.BUY else 0
        wallet.value += fund_out
        wallet.trading_balance += (
            trade.amount * trade.trading_rate
            if trade.trading_type == pr.TradingType.BUY
            else trade.amount
        )

        fund_history = FundCommit(
            v_from=(fund.balance),
            variation=fund_out,
            account=wallet.wallet_name,
            activity_id=activity.id,
            description=f"Wallet Trade {wallet.wallet_name} {trade.code}",
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
        return f"{initial}{month}{counter+1:03}"

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
    def commit_trade(self, commit: pr.CommitTradeRequest) -> pr.WalletTradingResponse:
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

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def exchange_with_simple_wallet(self, request) -> pr.WalletTradingResponse:
        # get crypto wallet from request
        source_wallet = self.get_wallet(request.walletID)
        destination_wallet = self.get_wallet(request.request.walletID)

        if not source_wallet or not destination_wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )
        office = self._get_office(self.user.office_id)

        trade = WalletTrading(
            walletID=source_wallet.walletID,
            exchange_walletID=destination_wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            state=pr.TransactionState.PAID,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            exchange_rate=request.request.exchange_rate,
            selling_rate=request.request.selling_rate,
            notes=[],
            exchange_currency=destination_wallet.trading_currency.value,
            trading_currency=source_wallet.crytpo_currency.value,
            created_by=self.user.user_db_id,
        )

        trade.code = self.generate_code(
            source_wallet.initials, office.counter if office.counter else 0
        )
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = request.message
        message["type"] = str(request.trading_type)
        message["user"] = self.user.user_db_id
        trade.notes.append(message)

        trade.pendings = source_wallet.pending_in - source_wallet.pending_out
        trade.wallet_trading = source_wallet.trading_balance
        trade.wallet_value = source_wallet.value
        trade.wallet_crypto = source_wallet.crypto_balance

        # move funds from source wallet to destination wallet
        self.exchange_wallets_simple(source_wallet, destination_wallet, request, office)

        office.counter = office.counter + 1 if office.counter else 1

        self.db.add(source_wallet)
        self.db.add(destination_wallet)
        self.db.add(office)

        return trade

    def exchange_wallets_simple(self, source, destination, request, office):
        assert source.crypto_balance >= request.amount
        assert request.request.exchange_rate > 0
        assert request.trading_rate > 0
        assert source.wallet_type == pr.WalletType.CRYPTO
        assert destination.wallet_type == pr.WalletType.SIMPLE

        # source 10,000USDT valued at 10,019.50 USD with tr 70,000 RMB
        #
        # the rate is  70,000 RMB / 10,000 USDT = 7RMB/USDT

        source_tr = source.trading_balance / source.crypto_balance

        source_vr = source.value / source.crypto_balance

        value = request.amount * source_vr

        exchange_value = request.amount * (request.request.selling_rate / request.daily_rate)
        trading_value = request.amount * (request.request.exchange_rate / request.trading_rate)

        delta = exchange_value - value

        source.value -= value
        source.crypto_balance -= request.amount
        source.trading_balance -= request.amount * source_tr

        office.credit(delta)
        # destination.crypto_balance = 0 because the destination is a simple wallet

        destination.value += exchange_value
        destination.trading_balance += trading_value

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def simple_wallet_deposit(self, request: pr.WalletDepositRequest):
        wallet = self.get_wallet(request.walletID)

        if not wallet:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message="Wallet not found",
            )

        assert isinstance(request.request, pr.WalletDepositRequest)
        deposit: pr.WalletDeposit = request.request
        office = self._get_office(self.user.office_id)

        provider = self.db.scalar(
            select(Account).where(
                Account.initials == deposit.provider, Account.office_id == self.user.office_id
            )
        )

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.user.user_db_id,
            state=pr.TransactionState.PENDING,
            account=provider.initials,
            exchange_currency=wallet.trading_currency.value,
            notes=[],
        )

        trade.code = self.generate_code(wallet.initials, office.counter if office.counter else 0)
        trade.notes.append(self.get_message(request.message, str(request.trading_type)))

        office.counter = office.counter + 1 if office.counter else 1

        trade.pendings = wallet.pending_in - wallet.pending_out
        trade.wallet_trading = wallet.trading_balance
        trade.wallet_value = wallet.value
        trade.wallet_crypto = wallet.crypto_balance

        self.db.add(trade)
        self.db.add(office)

        return trade

    def get_message(self, msg: str, msg_type: str):
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = msg
        message["type"] = msg_type
        message["user"] = self.user.user_db_id
        return message
