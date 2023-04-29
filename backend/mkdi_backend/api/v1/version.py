from fastapi import APIRouter

router = APIRouter()


@router.get("/ping")
def ping():
    return {"ping": "pong"}


@router.get("/version")
def get_version():
    return {"version": "0.0.1"}
