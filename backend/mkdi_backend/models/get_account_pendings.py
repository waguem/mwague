from decimal import Decimal


from mkdi_backend.models.transactions.transactions import (
    External,
    Internal,
    Sending,
    ForEx,
    Deposit,
    WalletTrading,
)
from sqlmodel import select, func, Session, or_
from mkdi_backend.utils.database import engine
from mkdi_shared.schemas import protocol as pr


def get_account_pendings(initials: str) -> Decimal:
    # get External transactions where state is pending and sum them
    with Session(engine) as session:

        external = session.execute(
            select(func.sum(External.amount))
            .where(External.state == pr.TransactionState.PENDING)
            .where(External.sender_initials == initials)
        ).scalar()
        sendings = session.execute(
            select(func.sum(Sending.amount))
            .where(Sending.state == pr.TransactionState.PENDING)
            .where(Sending.receiver_initials == initials)
        ).scalar()
        forexs = session.execute(
            select(func.sum(ForEx.selling_amount))
            .where(ForEx.state == pr.TransactionState.PENDING)
            .where(ForEx.customer_account == initials)
        ).scalar()

        return (external or 0) + (forexs or 0) - (sendings or 0)


def get_account_pendings_in(cls) -> Decimal:
    with Session(engine) as session:
        deposits = session.scalar(
            select(func.sum(Deposit.amount))
            .where(Deposit.state == pr.TransactionState.PENDING)
            .where(Deposit.owner_initials == cls.initials)
        )

        internals = session.scalar(
            select(func.sum(Internal.amount))
            .where(Internal.state == pr.TransactionState.PENDING)
            .where(Internal.receiver_initials == cls.initials)
        )

        sendings = session.scalar(
            select(func.sum(Sending.amount))
            .where(Sending.state == pr.TransactionState.PENDING)
            .where(Sending.receiver_initials == cls.initials)
        )

        ins = (deposits or 0) + (sendings or 0) + (internals or 0)
        return Decimal(ins)


def get_accounts_pendings_out(cls) -> Decimal:
    with Session(engine) as session:
        external = session.scalar(
            select(func.sum(External.amount))
            .where(External.state == pr.TransactionState.PENDING)
            .where(External.sender_initials == cls.initials)
        )

        internals = session.scalar(
            select(func.sum(Internal.amount))
            .where(Internal.state == pr.TransactionState.PENDING)
            .where(Internal.sender_initials == cls.initials)
        )

        forexs = session.scalar(
            select(func.sum(ForEx.selling_amount))
            .where(ForEx.state == pr.TransactionState.PENDING)
            .where(ForEx.customer_account == cls.initials)
        )

        # get simple sell pendings where the account match
        simple_sells = session.scalars(
            select(WalletTrading)
            .where(
                or_(
                    WalletTrading.trading_type == pr.TradingType.SIMPLE_SELL,
                    WalletTrading.trading_type == pr.TradingType.SELL,
                )
            )
            .where(WalletTrading.state == pr.TransactionState.PENDING)
            .where(WalletTrading.account == cls.initials)
        ).all()

        simple_sell_totals = 0
        if simple_sells:
            for sell in simple_sells:
                simple_sell_totals += sell.trading_amount

        out = (external or 0) + (forexs or 0) + (internals or 0) + simple_sell_totals
        return Decimal(out)
