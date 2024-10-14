"""Sell Trade"""

from mkdi_shared.schemas import protocol as pr
from mkdi_backend.models.transactions.transactions import WalletTrading

from mkdi_backend.repositories.trades.trade import ITrade
from mkdi_backend.models.office import WalletRates, OfficeWallet
from mkdi_backend.repositories.transaction_repos.invariant import (
    managed_invariant_tx_method,
    CommitMode,
)


class SellTrade(ITrade):
    """Buy Trade Class"""

    def create(self, request: pr.WalletTradingRequest) -> WalletTrading:
        """create a trade from the user request"""
        br: pr.SellRequest = request.request

        wallet = self.get_wallet(request.walletID)
        account = self.get_account(br.customer)

        code = wallet.generate_code()

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.session.get_user().user_db_id,
            account=account.initials,
            selling_currency=request.selling_currency,
            trading_currency=wallet.trading_currency.value,
            code=code,
            notes=[],
        )

        self.update_trade(trade, wallet)
        self.session.get_db().add(wallet)

        return trade

    def accounts(self):
        """Get accounts involved in selling"""
        return [self.get_account(self.trade.account), self.get_office()]

    def selling_amount(self, trade: WalletTrading, wallet: OfficeWallet):
        """
        Determine how much the trade has been sold
        this is based on the wallet_type
        For Crypto Wallet:
            if the selling currency is the wallet trading currency:
                then
        For Simple Wallet
        """
        rate = 0

        match wallet.wallet_type:
            case pr.WalletType.CRYPTO:
                # crypto selling
                if trade.selling_currency == wallet.trading_currency.value:
                    rate = 1 / trade.trading_rate
                elif trade.selling_currency == wallet.crypto_currency.value:
                    rate = trade.trading_rate / trade.daily_rate
            case pr.WalletType.SIMPLE:
                # simple wallet selling using %
                rate = 1 + trade.trading_rate / 100

        return trade.amount * rate

    def selling_cost(self, trade: WalletTrading, wallet: OfficeWallet):
        tradings_rates = WalletRates(wallet, wallet.trading_balance)
        crypto_rates = WalletRates(wallet, wallet.crypto_balance)
        rates = WalletRates(wallet, 0)

        if trade.selling_currency == wallet.trading_currency.value:
            rates = tradings_rates
        elif trade.selling_currency == wallet.crypto_currency.value:
            rates = crypto_rates

        return trade.amount * rates.cost_rate

    def trading_amount(self, trade: WalletTrading, wallet: OfficeWallet):
        if trade.selling_currency == wallet.trading_currency.value:
            return trade.amount
        elif trade.selling_currency == wallet.crypto_currency.value:
            return trade.amount * wallet.trading_balance / wallet.crypto_balance

    def selling_crypto(self, trade: WalletTrading, wallet: OfficeWallet):
        if trade.selling_currency == wallet.crypto_currency.value:
            return trade.amount
        elif trade.selling_currency == wallet.trading_currency.value:
            trading_rates = WalletRates(wallet, wallet.trading_balance)
            return trade.amount * trading_rates.crypto_rate

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:

        wallet = self.get_wallet(trade.walletID)
        avaiable_fund = (
            wallet.trading_balance
            if trade.selling_currency == wallet.trading_currency.value
            else wallet.crypto_balance
        )

        self.update_trade(trade, wallet)

        # if the available fund in the wallet is not suffissiant, then put it on hold.
        if trade.amount > avaiable_fund:
            trade.state = pr.TransactionState.PENDING
            return trade

        office = self.get_office()
        account = self.get_account(trade.account)

        sold = self.selling_amount(trade, wallet)
        cost = self.selling_cost(trade, wallet)
        crypto = self.selling_crypto(trade, wallet)
        trading_amount = self.trading_amount(trade, wallet)

        delta = sold - cost

        wallet.crypto_balance -= crypto
        wallet.trading_balance -= trading_amount
        wallet.value -= cost

        account.debit(sold)
        if delta:
            office.credit(delta)

        trade.state = pr.TransactionState.PAID
        self.session.db.add(trade)
        self.session.db.add(office)
        self.session.db.add(account)
        self.session.db.add(wallet)

        return trade

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def commit(self, commit: pr.CommitTradeRequest, trade: WalletTrading) -> WalletTrading:
        wallet = self.get_wallet(trade.walletID)
        account = self.get_account(trade.account)
        office = self.get_office()

        self.update_trade(trade, wallet)
        trade.amount = commit.amount
        trade.trading_rate = commit.trading_rate

        account.debit(commit.sold_amount)

        wallet.trading_balance -= commit.amount
        wallet.value -= commit.trading_cost
        wallet.crypto_balance -= commit.crypto_amount

        if commit.trading_result:
            office.credit(commit.trading_result)

        trade.state = pr.TransactionState.PAID

        self.session.db.add(wallet)
        self.session.db.add(account)
        self.session.db.add(trade)

        return trade
