"""Buying Trade"""

from mkdi_shared.schemas import protocol as pr
from mkdi_backend.models.transactions.transactions import WalletTrading

from mkdi_backend.repositories.trades.trade import ITrade
from mkdi_backend.repositories.transaction_repos.invariant import (
    managed_invariant_tx_method,
    CommitMode,
)
from mkdi_backend.models.office import OfficeWallet, WalletRates


class ExchangeTrade(ITrade):
    """Buy Trade Class"""

    def create(self, request: pr.WalletTradingRequest) -> WalletTrading:
        """create a trade from the user request"""
        er: pr.ExchangeRequest = request.request

        wallet = self.get_wallet(request.walletID)
        exchange_wallet = self.get_wallet(er.walletID)

        code = wallet.generate_code()

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.session.get_user().user_db_id,
            exchange_walletID=exchange_wallet.walletID,
            exchange_rate=er.exchange_rate,
            exchange_currency=request.exchange_currency,
            trading_currency=wallet.crypto_currency.value,
            code=code,
            notes=[],
        )

        if request.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
            trade.exchange_currency = exchange_wallet.trading_currency.value
            trade.selling_rate = request.request.selling_rate
            trade.selling_currency = request.selling_currency

        self.update_trade(trade, wallet)
        self.session.get_db().add(wallet)

        return trade

    def accounts(self):
        """Get accounts involved in trading"""
        return [self.get_office()]

    def selling_amount(self, trade: WalletTrading, wallet_type: pr.WalletType):
        if wallet_type == pr.WalletType.CRYPTO:
            return trade.amount * trade.trading_rate / trade.daily_rate
        else:
            return trade.amount * (trade.selling_rate / trade.daily_rate)

    def selling_cost(self, trade: WalletTrading, wallet: OfficeWallet):
        return trade.amount * WalletRates(wallet, wallet.crypto_balance).cost_rate

    def selling_crypto(self, trade: WalletTrading):
        return trade.amount

    def trading_amount(self, trade: WalletTrading, wallet: OfficeWallet):
        return trade.amount * WalletRates(wallet, wallet.crypto_balance).trading_rate

    def exchange_amount(self, trade: WalletTrading, wallet_type: pr.WalletType):
        if wallet_type == pr.WalletType.SIMPLE:
            return trade.amount * (trade.exchange_rate / trade.trading_rate)
        else:
            return trade.amount * trade.exchange_rate

    def exchange_value(self, trade: WalletTrading, wallet_type: pr.WalletType):
        if wallet_type == pr.WalletType.SIMPLE:
            return trade.amount * (trade.selling_rate / trade.daily_rate)
        else:
            return trade.amount * (trade.trading_rate / trade.daily_rate)

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:
        """Approve trade"""
        wallet = self.get_wallet(trade.walletID)
        exchange_wallet = self.get_wallet(trade.exchange_walletID)

        self.update_trade(trade, wallet)

        if trade.amount > wallet.crypto_balance:
            trade.state = pr.TransactionState.PENDING
            return trade

        office = self.get_office()

        sold = self.selling_amount(trade, exchange_wallet.wallet_type)
        cost = self.selling_cost(trade, wallet)
        crypto = self.selling_crypto(trade)
        trading_amount = self.trading_amount(trade, wallet)

        delta = sold - cost

        wallet.crypto_balance -= crypto
        wallet.trading_balance -= trading_amount
        wallet.value -= cost

        exchange_wallet.crypto_balance += (
            crypto if exchange_wallet.wallet_type == pr.WalletType.CRYPTO else 0
        )
        exchange_wallet.trading_balance += self.exchange_amount(trade, exchange_wallet.wallet_type)
        exchange_wallet.value += self.exchange_value(trade, exchange_wallet.wallet_type)

        if delta:
            office.credit(delta)

        trade.state = pr.TransactionState.PAID

        self.session.db.add(trade)
        self.session.db.add(wallet)
        self.session.db.add(exchange_wallet)
        self.session.db.add(office)

        return trade
