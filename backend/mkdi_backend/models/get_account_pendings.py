from decimal import Decimal


from mkdi_backend.models.transactions.transactions import External, Sending, ForEx
from sqlmodel import select, func, Session
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
