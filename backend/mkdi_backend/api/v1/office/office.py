from typing import Annotated, List

from fastapi import APIRouter, Body, Depends
from mkdi_backend.api.deps import KcUser, get_db, get_user_info
from mkdi_backend.repositories.office import OfficeRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()


@router.post("/", response_model=protocol.OfficeResponse, status_code=201)
async def create_office(
    *,
    user: KcUser = Depends(get_user_info),
    create_office: Annotated[protocol.CreateOfficeRequest, Body(embed=True)],
    db: Session = Depends(get_db),
) -> protocol.OfficeResponse:
    office_repo = OfficeRepository(db)
    office = await office_repo.create(create_office)
    return office


@router.get("/", status_code=200, response_model=List[protocol.OfficeResponse])
async def get_org_offices(
    *,
    user: KcUser = Depends(get_user_info),
    db: Session = Depends(get_db),
) -> List[protocol.OfficeResponse]:
    office_repo = OfficeRepository(db)
    offices = office_repo.get_all()
    return offices
