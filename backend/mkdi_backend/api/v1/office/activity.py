from fastapi import APIRouter

router = APIRouter()


@router.get("/office/activity")
def get_activity():
    return {"activity": "activity"}


@router.post("/office/activity")
def start_activity():
    return {"activity": "activity"}
