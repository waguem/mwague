"""Wallet API endpoints."""

from fastapi import APIRouter, Depends, Security
from mkdi_backend.api.deps import check_authorization, get_db, KcUser
from sqlmodel import Session
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.repositories.wallet import WalletRepository
from typing import List

router = APIRouter()


@router.post(
    "/wallet",
    response_model=pr.WalletTradingResponse,
    status_code=201,
)
def trade_wallet(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    trade: pr.WalletTradingRequest,
    db: Session = Depends(get_db),
) -> pr.WalletTradingResponse:
    """Trade wallet"""

    return WalletRepository(db, user).trade_wallet(trade)


@router.get(
    "/wallet/{walletID}/tradings",
    response_model=List[pr.WalletTradingResponse],
    status_code=200,
)
def get_wallet_tradings(
    *,
    user: KcUser = Security(check_authorization, scopes=[]),
    walletID: str,
    db: Session = Depends(get_db),
) -> List[pr.WalletTradingResponse]:
    """Get wallet tradings"""
    return WalletRepository(db, user).get_wallet_tradings(walletID)


@router.post("/wallet/trade/{tradeID}/pay", response_model=pr.PaymentResponse, status_code=201)
def pay_trade(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    trade_code: str,
    payment_request: pr.PaymentRequest,
    db: Session = Depends(get_db),
) -> pr.PaymentResponse:
    """
    Pay trade
    """
    return WalletRepository(db, user).pay(trade_code, payment_request)


@router.get(
    "office/agent/{initials}/tradings",
    response_model=List[pr.WalletTradingResponse],
    status_code=200,
)
def get_agent_tradings(
    *,
    user: KcUser = Security(check_authorization, scopes=[]),
    initials: str,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
) -> List[pr.WalletTradingResponse]:
    """Get agent tradings"""
    return WalletRepository(db, user).get_agent_tradings(initials, start_date, end_date)


@router.post(
    "/wallet/trade/{trade_code}/commit",
    response_model=pr.WalletTradingResponse,
)
def commit_trade(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    commit: pr.CommitTradeRequest,
    trade_code: str,
    db: Session = Depends(get_db),
) -> pr.WalletTradingResponse:
    """Commit trade"""
    return WalletRepository(db, user).commit_trade(trade_code, commit)


@router.post("/trade/review", response_model=pr.WalletTradingResponse, status_code=201)
def review_trade(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    review: pr.TradeReviewReq,
    db: Session = Depends(get_db),
) -> pr.WalletTradingResponse:
    """Review Trade"""
    return WalletRepository(db, user).review_trade(review)


@router.post("/trade/rollback", response_model=pr.WalletTradingResponse, status_code=201)
def rollback(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    cancellation: pr.CancelTransaction,
    db: Session = Depends(get_db),
) -> pr.WalletTradingResponse:
    return WalletRepository(db, user).rollback(cancellation)


@router.patch("/trade/update", response_model=pr.WalletTradingResponse, status_code=200)
def update_trade(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    trade_request: pr.WalletTradingResponse,
    db: Session = Depends(get_db),
) -> pr.WalletTradingResponse:
    return WalletRepository(db, user).update(trade_request)


@router.post("/trade/{trade_code}/partner_paid")
def partner_paid(
    *,
    user: KcUser = Security(check_authorization, scopes=["office_admin"]),
    trade_code: str,
    db: Session = Depends(get_db),
) -> pr.WalletTradingResponse:
    return WalletRepository(db, user).partner_paid(trade_code)
