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

    return WalletRepository(db).trade_wallet(user, trade)


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
    return WalletRepository(db).get_wallet_tradings(user, walletID)
