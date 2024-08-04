"""Office model."""

from typing import Optional, List, ClassVar
from uuid import UUID, uuid4

import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableList
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.ext.hybrid import hybrid_property
from mkdi_shared.schemas.protocol import OfficeBase, CryptoWalletBase
from sqlmodel import Field, Relationship, Session, select, func, and_
from decimal import Decimal
from mkdi_backend.models.transactions.transactions import WalletTrading
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.database import engine


def get_pending_in(self) -> Decimal:
    """Get the pending in amount"""
    with Session(engine) as db:
        result = db.execute(
            select(
                func.sum(WalletTrading.amount).filter(
                    WalletTrading.walletID == self.walletID,
                    and_(
                        WalletTrading.trading_type == pr.TradingType.BUY,
                        WalletTrading.state == pr.TransactionState.PENDING,
                    ),
                )
            )
        ).scalar()

        return result or Decimal(0)


def get_pending_out(self) -> Decimal:
    """Get the pending out amount"""
    with Session(engine) as db:
        result = db.execute(
            select(
                func.sum(WalletTrading.amount).filter(
                    WalletTrading.walletID == self.walletID,
                    WalletTrading.trading_type != pr.TradingType.BUY,
                    WalletTrading.state == pr.TransactionState.PENDING,
                )
            )
        ).scalar()

        return result or Decimal(0)


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

    pending_in: ClassVar[Decimal] = hybrid_property(get_pending_in)
    pending_out: ClassVar[Decimal] = hybrid_property(get_pending_out)

    office_id: UUID = Field(foreign_key="offices.id")
    office: Office = Relationship(back_populates="wallets")  # type: ignore
