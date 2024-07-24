"""Transaction API endpoints."""

from typing import Annotated, List

from fastapi import APIRouter, Depends, Security
from mkdi_backend.api.deps import check_authorization, get_db, AsyncDBSessionDep
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transaction_item import TransactionItem
from mkdi_backend.repositories.transactions import TransactionRepository
from mkdi_backend.models.transactions.transactions import TransactionWithDetails
from mkdi_shared.schemas import protocol
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Session

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
    "/agent/{initials}/transactions",
    response_model=List[protocol.TransactionResponse],
    status_code=200,
)
def get_agent_transactions(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    initials: str,
    db: Session = Depends(get_db),
) -> list[protocol.TransactionResponse]:
    """get all transactions for an agent"""
    return TransactionRepository(db).get_agent_transactions(user, initials)


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
