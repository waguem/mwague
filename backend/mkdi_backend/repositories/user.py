from typing import Optional
from uuid import UUID

from mkdi_backend.api import deps
from mkdi_backend.auth import auth
from mkdi_backend.models import ApiClient, User
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session


class UserRepository:
    # def __init__(self, db: Session, api_client: ApiClient):
    def __init__(self, db: Session):
        self.db = db
        # self.api_client = api_client

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create_local_user(self, request: protocol.CreateFrontendUserRequest):
        user: User = self.db.query(User).filter(User.username == request.username).first()
        if user:
            raise MkdiError(f"Username {request.username} already exists", error_code=MkdiErrorCode.USER_EXISTS)
        api_client: ApiClient = deps.create_api_client(self.db, "", request.notes, False, request.email)
        user = User(
            username=request.username,
            display_name=request.display_name,
            auth_method="local",
            email=request.email,
            api_client_id=api_client.id,
            hashed_password=auth.get_password_hash(request.password),
            notes=request.notes,
        )
        self.db.add(user)
        return user

    # def get_user_by_name(self, username: str) -> Optional[User]:
    #     return self.query(User).filter(User.username == username).first()

    # def get_user_by_email(self, email: str) -> Optional[User]:
    #     return self.query(User).filter(User.email == email).first()

    # def get_user_by_id(self, id: UUID):
    #     return self.query(User).filter(User.id == id).first()
