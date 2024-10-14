"""Deposit Trade"""

from mkdi_shared.schemas import protocol as pr
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import Activity
from mkdi_backend.models.office import OfficeWallet
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
            trading_currency=wallet.crypto_currency.value,
            notes=[],
        )

        self.update_trade(trade, wallet)
        self.session.get_db().add(wallet)

        return trade

    def approve(self, review: pr.TradeReviewReq, trade: WalletTrading) -> WalletTrading:
        return self.approve_payable(review, trade)

    def get_payment_amount(self, trade: WalletTrading) -> pr.Decimal:
        return trade.amount * (1 + trade.trading_rate / 100)

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
        assert wallet.wallet_type == pr.WalletType.SIMPLE
        fund.debit(fund_out)
        wallet.crypto_balance = 0
        wallet.value += fund_out
        wallet.trading_balance += trade.amount

    def rollback_payment(self, request: pr.WalletTradingRequest) -> WalletTrading:
        return super().rollback_payment(request)
