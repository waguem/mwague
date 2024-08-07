# pylint: disable=import-error
from mkdi_backend.config import settings
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from psycopg2.extras import register_default_jsonb
from sqlmodel import create_engine
from sqlalchemy.ext.asyncio import create_async_engine


def get_engine():
    """create engine object"""
    if settings.DATABASE_URI is None:
        raise MkdiError("DATABASE_URI is not set", error_code=MkdiErrorCode.DATABASE_URI_NOT_SET)
    e = create_engine(
        settings.DATABASE_URI,
        echo=settings.DEBUG_DATABASE_ECHO,
        isolation_level="REPEATABLE READ",
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
    )

    with e.connect() as connection:
        dbapi_conn = connection.connection
        register_default_jsonb(conn_or_curs=dbapi_conn, globally=True)

    return e


async def get_async_engine():
    """"""
    e = create_async_engine(
        settings.DATABASE_ASYNC_URI,
        echo=settings.DEBUG_DATABASE_ECHO,
        isolation_level="REPEATABLE READ",
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
    )
    yield e

    async with e.connect() as conn:
        register_default_jsonb(conn_or_curs=conn.connection, globally=True)


engine = get_engine()
