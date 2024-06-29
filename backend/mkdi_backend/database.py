from mkdi_backend.config import settings
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from psycopg2.extras import register_default_jsonb
from sqlmodel import create_engine

if settings.DATABASE_URI is None:
    raise MkdiError("DATABASE_URI is not set", error_code=MkdiErrorCode.DATABASE_URI_NOT_SET)

engine = create_engine(
    settings.DATABASE_URI,
    echo=settings.DEBUG_DATABASE_ECHO,
    isolation_level="REPEATABLE READ",
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
)
