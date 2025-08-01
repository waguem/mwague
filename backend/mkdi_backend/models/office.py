"""Office model."""

from datetime import datetime
from typing import Optional, List, ClassVar
from uuid import UUID, uuid4

import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableList
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.ext.hybrid import hybrid_property
from mkdi_shared.schemas.protocol import OfficeBase, CryptoWalletBase
from sqlmodel import Field, Relationship, Session, select, and_, or_
from decimal import Decimal
from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.database import engine
from functools import reduce


def in_reducer(acc: Decimal, tr: WalletTrading):
    amount = tr.amount
    if tr.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
        amount = tr.amount * (tr.exchange_rate / tr.trading_rate) if tr.trading_rate else 0

    return acc + Decimal(amount)


def out_reducer(acc: Decimal, tr: WalletTrading):
    amount = tr.amount

    return acc + Decimal(amount)


def get_pending_in(self) -> Decimal:
    """Get the pending in amount"""
    with Session(engine) as db:
        condition = None
        if self.wallet_type == pr.WalletType.SIMPLE:
            condition = or_(
                and_(
                    WalletTrading.walletID == self.walletID,
                    WalletTrading.trading_type == pr.TradingType.DEPOSIT,
                ),
                and_(
                    WalletTrading.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET,
                    WalletTrading.exchange_walletID == self.walletID,
                ),
            )
        else:
            condition = or_(
                and_(
                    WalletTrading.walletID == self.walletID,
                    WalletTrading.trading_type == pr.TradingType.BUY,
                ),
                and_(
                    WalletTrading.walletID == self.walletID,
                    WalletTrading.trading_type == pr.TradingType.DEPOSIT,
                ),
                # or the trading type is Exchange with crypto and the exchange wallet ID maches the current wallet
                and_(
                    WalletTrading.trading_type == pr.TradingType.EXCHANGE,
                    WalletTrading.exchange_walletID == self.walletID,
                ),
            )

        results = db.scalars(
            select(WalletTrading).where(
                and_(condition, WalletTrading.state == pr.TransactionState.PENDING)
            )
        ).all()
        return reduce(in_reducer, results, Decimal(0))


def get_pending_payment(self) -> Decimal:
    with Session(engine) as db:
        results = db.scalars(
            select(WalletTrading)
            .where(
                and_(
                    WalletTrading.partner_paid == False,
                    WalletTrading.walletID == self.walletID,
                )
            )
            .where(
                and_(
                    WalletTrading.state != pr.TransactionState.CANCELLED,
                    WalletTrading.state != pr.TransactionState.REVIEW,
                )
            )
        ).all()
        reduced = reduce(out_reducer, results, Decimal(0))
        return reduced


def get_pending_out(self) -> Decimal:
    """Get the pending out amount"""
    condition = None
    if self.wallet_type == pr.WalletType.SIMPLE:
        condition = or_(
            and_(
                WalletTrading.walletID == self.walletID,
                WalletTrading.trading_type == pr.TradingType.SIMPLE_SELL,
            )
        )
    else:
        condition = or_(
            and_(
                WalletTrading.walletID == self.walletID,
                WalletTrading.trading_type == pr.TradingType.SELL,
            ),
            # crypto exchange
            and_(
                WalletTrading.walletID == self.walletID,
                WalletTrading.trading_type == pr.TradingType.EXCHANGE,
            ),
            # simple exchange
            and_(
                WalletTrading.walletID == self.walletID,
                WalletTrading.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET,
            ),
        )

    with Session(engine) as db:
        results = db.scalars(
            select(WalletTrading).where(
                and_(
                    condition,
                    WalletTrading.state == pr.TransactionState.PENDING,
                ),
            )
        ).all()

        reduced = reduce(out_reducer, results, Decimal(0))
        return reduced


class Office(OfficeBase, table=True):
    """Office class"""

    __tablename__ = "offices"

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    # an office is part of an organization
    organization_id: UUID = Field(foreign_key="organizations.id")
    organization: "Organization" = Relationship(back_populates="offices")  # type: ignore

    # employees: list["Employee"] = Relationship(back_populates="office")  # type: ignore
    currencies: List[dict] = Field(
        default=[], sa_column=sa.Column(MutableList.as_mutable(pg.JSONB))
    )
    # lazy loaded wallets
    wallets: List["OfficeWallet"] = Relationship(back_populates="office")  # type: ignore


class OfficeWallet(CryptoWalletBase, table=True):
    """Table Office Wallet"""

    __tablename__ = "wallets"
    walletID: str = Field(nullable=False, max_length=64, primary_key=True)
    # how much crypto the office has bought
    crypto_balance: Decimal = Field(max_digits=19, decimal_places=4, default=0, ge=0)
    # how much balance if was able to get in the trading currency
    trading_balance: Decimal = Field(max_digits=19, decimal_places=4, default=0, ge=0)
    # how much this wallet is worth in the main currency of the office
    balance_tracking_enabled: bool = Field(default=False, nullable=True)
    partner_balance: Decimal = Field(
        default=0, nullable=True, max_digits=19, decimal_places=4, ge=0
    )
    value: Decimal = Field(max_digits=19, decimal_places=4, default=0, ge=0)

    initials: str = Field(nullable=True, max_length=16)

    pending_in: ClassVar[Decimal] = hybrid_property(get_pending_in)
    pending_out: ClassVar[Decimal] = hybrid_property(get_pending_out)
    pending_payment: ClassVar[Decimal] = hybrid_property(get_pending_payment)

    counter: int = Field(nullable=True, default=0)

    office_id: UUID = Field(foreign_key="offices.id")
    office: Office = Relationship(back_populates="wallets")  # type: ignore

    def generate_code(self) -> str:
        """generate a unique code for the internal transaction"""
        now = datetime.now()
        month = now.strftime("%m")
        self.counter = self.counter + 1 if self.counter else 1

        return f"{self.initials}{month}{self.counter:03}"


class WalletRates:
    crypto_rate: Decimal
    trading_rate: Decimal
    cost_rate: Decimal

    def __init__(self, wallet: OfficeWallet, quotient: Decimal):
        if quotient == 0:
            return
        self.crypto_rate = wallet.crypto_balance / quotient if quotient else 0
        self.trading_rate = wallet.trading_balance / quotient if quotient else 0
        self.cost_rate = wallet.value / quotient if quotient else 0
