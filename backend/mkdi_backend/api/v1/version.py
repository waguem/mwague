from fastapi import APIRouter
from loguru import logger

router = APIRouter()


@router.get("/ping")
def ping():
    return {"ping": "pong"}


@router.get("/version")
def get_version():
    logger.info("Getting version")
    return {"version": "0.0.1"}
