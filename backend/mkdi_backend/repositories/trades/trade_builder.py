from typing import Callable
from mkdi_shared.schemas import protocol as pr

from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_backend.api.deps import UserDBSession
from mkdi_backend.repositories.trades import (
    BuyTrade,
    DepositTrade,
    ExchangeTrade,
    SellTrade,
    ITrade
)

class TradeBuilder:

    """Trade builder class"""
    def __init__(self,session: UserDBSession) -> None:
        self.session = session

    def get_builder(self,trade_type:pr.TradingType):
        """get concrete trade"""
        match trade_type:
            case pr.TradingType.BUY:
                return BuyTrade
            case pr.TradingType.DEPOSIT:
                return DepositTrade
            case pr.TradingType.EXCHANGE | pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
                return ExchangeTrade
            case pr.TradingType.SELL | pr.TradingType.SIMPLE_SELL:
                return SellTrade

    def get_instance(self,trade:WalletTrading):
        creator: Callable = self.get_builder(trade.trading_type)
        instance:ITrade = creator(self.session)
        instance.set_trade(trade)
        return instance
    
    def make_trade(self,request: pr.WalletTradingRequest ):
        """trade method builder"""
        creator: Callable = self.get_builder(request.trading_type)

        instance:ITrade = creator(self.session)
        trade = instance.create(request)
        instance.add_note(trade,user_id=self.session.get_user().user_db_id,msg=request.message, msg_type=request.trading_type.value)
        return trade

    def approve(self,trade,review: pr.TradeReviewReq):
        """Approve trade"""
        return self.get_instance(trade).approve(review,trade)

    def reject(self,trade,review: pr.TradeReviewReq):
        """Reject Trade"""
        return self.get_instance(trade).reject(review,trade)

    def cancel(self,trade,review: pr.TradeReviewReq):
        """Cancel Trade"""
        return self.get_instance(trade).cancel(review,trade)

    def pay(self,payment:pr.PaymentRequest, trade: WalletTrading)->pr.PaymentResponse:
        """Pay Trade"""
        return self.get_instance(trade).pay(trade=trade,request=payment)

    def commit(self,commit:pr.CommitTradeRequest, trade:WalletTrading)-> WalletTrading:
        return self.get_instance(trade).commit(commit,trade)