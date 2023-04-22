from fastapi import APIRouter

router = APIRouter()


@router.get("/version")
def get_version():
    return {"version": "0.0.1"}
