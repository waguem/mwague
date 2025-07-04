"""Deposit Trade"""

from mkdi_shared.schemas import protocol as pr
from mkdi_backend.models.transactions.transactions import WalletTrading

from mkdi_backend.repositories.trades.trade import IPayableTrade


class DepositTrade(IPayableTrade):
    """Buy Trade Class"""

    def create(self, request: pr.WalletTradingRequest) -> WalletTrading:
        """create a trade from the user request"""
        dr: pr.WalletDepositRequest = request.request

        wallet = self.get_wallet(request.walletID)
        provider = self.get_account(dr.provider)

        code = wallet.generate_code()

        trade = WalletTrading(
            walletID=wallet.walletID,
            trading_type=request.trading_type,
            amount=request.amount,
            daily_rate=request.daily_rate,
            trading_rate=request.trading_rate,
            created_by=self.session.get_user().user_db_id,
            account=provider.initials,
            code=code,
            trading_currency=(
                wallet.crypto_currency.value
                if wallet.wallet_type == pr.WalletType.SIMPLE
                else wallet.trading_currency.value
            ),
            notes=[],
        )

        self.update_trade(trade, wallet)
        self.session.get_db().add(wallet)

        return trade

    def get_payment_amount(self, trade: WalletTrading) -> pr.Decimal:
        if trade.trading_currency == pr.CryptoCurrency.NA:
            return trade.amount * (1 + trade.trading_rate / 100)
        return trade.amount

    def apply_payment(
        self,
        *,
        trade: WalletTrading,
        request: pr.PaymentRequest,
        wallet,
        fund,
    ) -> WalletTrading:
        """Apply payment for deposit trade"""
        fund_out = self.get_payment_amount(trade)
        assert abs(request.amount - fund_out) < 0.05
        fund.debit(fund_out)
        wallet.value += fund_out
        if wallet.wallet_type == pr.WalletType.SIMPLE:
            wallet.crypto_balance = 0
            wallet.trading_balance += trade.amount
        else:
            wallet.crypto_balance += trade.amount
            wallet.trading_balance += trade.amount * trade.trading_rate

    def rollback_payment(
        self,
        *,
        trade: WalletTrading,
        wallet,
        fund,
    ) -> WalletTrading:
        """Apply payment for deposit trade"""
        fund_out = self.get_payment_amount(trade)
        fund.credit(fund_out)
        wallet.value -= fund_out
        if wallet.wallet_type == pr.WalletType.SIMPLE:
            wallet.crypto_balance = 0
            wallet.trading_balance -= trade.amount
        else:
            wallet.crypto_balance -= trade.amount
            wallet.trading_balance -= trade.amount * trade.trading_rate
