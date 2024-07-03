"""API Router for ping."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/ping")
def ping():
    return {"health": "UP"}
