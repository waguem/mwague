"""Transaction API endpoints."""

from typing import Annotated, List

from sqlmodel import Session
from fastapi import APIRouter, Depends, Security

from mkdi_backend.api.deps import check_authorization, get_db, AsyncDBSessionDep, DBSessionDep
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transaction_item import TransactionItem, AllTransactions
from mkdi_backend.repositories.transactions import TransactionRepository
from mkdi_backend.models.transactions.transactions import TransactionWithDetails
from mkdi_shared.schemas import protocol


router = APIRouter()


@router.get(
    "/office/transactions",
    response_model=List[TransactionItem],
    status_code=200,
)
async def get_office_transactions(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    db: AsyncDBSessionDep,
) -> List[TransactionItem]:
    """get all transactions for an office"""
    return await TransactionRepository(db).get_offcie_transactions_items(user)


@router.get(
    "/office/transactions/interval",
    response_model=List[AllTransactions],
    status_code=200,
)
def get_office_transactions_by_interval(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    start_date: str | None = None,
    end_date: str | None = None,
    db: DBSessionDep,
) -> List[AllTransactions]:
    """get all transactions for an office"""
    return TransactionRepository(db).get_offcie_transactions(user, start_date, end_date)


@router.get(
    "/agent/{initials}/transactions",
    response_model=List[AllTransactions],
    status_code=200,
)
def get_agent_transactions(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    initials: str,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
) -> list[AllTransactions]:
    """get all transactions for an agent"""
    return TransactionRepository(db).get_agent_transactions(
        user.office_id, initials, start_date, end_date
    )


@router.post("/transaction", response_model=protocol.TransactionResponse, status_code=201)
def request_transaction(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    usr_input: protocol.TransactionRequest,
    db: Session = Depends(get_db),
) -> protocol.TransactionResponse:
    """request a transaction for approval, this will just created the transaction in the db"""
    repo = TransactionRepository(db)
    return repo.request_for_approval(user, usr_input)


@router.post(
    "/transaction/{transaction_code}/review",
    response_model=protocol.TransactionResponse,
    status_code=200,
)
def review_transaction(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    transaction_code: str,
    usr_input: protocol.TransactionReviewReq,
    db: Session = Depends(get_db),
) -> protocol.TransactionResponse:
    """review a transaction request"""
    reviewed = TransactionRepository(db).review_transaction(transaction_code, user, usr_input)

    return reviewed


@router.put("/transaction/{code}")
def update_transaction(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    code: str,
    usr_input: protocol.TransactionRequest,
    db: Session = Depends(get_db),
) -> protocol.TransactionResponse:
    """update a transaction"""
    return TransactionRepository(db).update_transaction(user, code, usr_input)


@router.post(
    "/transaction/{code}/pay",
    response_model=protocol.PaymentResponse,
    status_code=200,
)
async def add_payment(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    code: str,
    usr_input: protocol.PaymentRequest,
    db: AsyncDBSessionDep,
) -> protocol.PaymentResponse:
    """add payment to a transaction"""
    return await TransactionRepository(db).add_payment(user, code, usr_input)


@router.delete(
    "/transaction/{code}/cancel", response_model=protocol.TransactionResponse, status_code=200
)
def cancel_transaction(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    code: str,
    usr_input: protocol.CancelTransaction,
    db: DBSessionDep,
) -> protocol.TransactionResponse:
    return TransactionRepository(db).cancel_transaction(user, code, usr_input)


@router.get(
    "/transaction/{code}",
    response_model=TransactionWithDetails,
    status_code=200,
)
async def get_office_transactions_with_details(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    code: str,
    tr_type: protocol.TransactionType,
    db: AsyncDBSessionDep,
) -> TransactionWithDetails:
    """get all transactions for an office with details"""
    return await TransactionRepository(db).get_office_transactions_with_details(
        user, tr_code=code, tr_type=tr_type
    )


@router.post("/payment/{id}/cancel", response_model=protocol.PaymentResponse, status_code=200)
def cancel_payment(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    id: str,
    request: protocol.CancelTransaction,
    db: DBSessionDep,
) -> protocol.PaymentResponse:
    return TransactionRepository(db).cancel_payment(user, id, request)


@router.post("/groupPay/forex", response_model=protocol.GroupPayResponse, status_code=201)
async def group_pay(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    request: protocol.GroupPayRequest,
    db: AsyncDBSessionDep,
) -> protocol.GroupPayResponse:
    return await TransactionRepository(db).group_pay(user, request)
