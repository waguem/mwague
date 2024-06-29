"""Kc User model"""

from pydantic import BaseModel


class KcUser(BaseModel):
    """Kc user model"""

    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    roles: list = []
    organization_id: str = None
    office_id: str = None
    user_db_id: str = None
