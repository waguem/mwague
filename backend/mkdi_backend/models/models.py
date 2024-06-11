from pydantic import BaseModel


class KcUser(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    roles: list = []
    organization_id: str = None
    office_id: str = None
