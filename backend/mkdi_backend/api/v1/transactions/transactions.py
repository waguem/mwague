from typing import Annotated, List

from fastapi import APIRouter, Depends, Security
from mkdi_backend.api.deps import check_authorization, get_db
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.transactions import TransactionRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()

@router.get("/agent/{initials}/transactions",response_model=List[protocol.TransactionResponse], status_code=200)
def get_agent_transactions(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    initials: str,
    db: Session = Depends(get_db),
)-> list[protocol.TransactionResponse]:
    return TransactionRepository(db).get_agent_transactions(user,initials)

@router.post("/transaction",response_model=protocol.TransactionResponse, status_code=201)
def request_transaction(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    input: protocol.TransactionRequest,
    db: Session = Depends(get_db),
)-> protocol.TransactionResponse:

    repo = TransactionRepository(db)
    return repo.request_for_approval(user,input)
