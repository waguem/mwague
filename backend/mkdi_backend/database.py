from mkdi_backend.config import settings
from mkdi_shared.exceptions.mkdi_api_error import OasstError, OasstErrorCode
from sqlmodel import Session, SQLModel, create_engine

if settings.DATABASE_URI is None:
    raise OasstError("DATABASE_URI is not set", error_code=OasstErrorCode.DATABASE_URI_NOT_SET)

engine = create_engine(
    settings.DATABASE_URI,
    echo=settings.DEBUG_DATABASE_ECHO,
    isolation_level="REPEATABLE READ",
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
