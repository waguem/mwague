from enum import IntEnum
from functools import wraps
from http import HTTPStatus
from typing import Callable

from loguru import logger
from mkdi_backend.config import settings
from mkdi_backend.database import engine
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from psycopg2.errors import DeadlockDetected, ExclusionViolation, SerializationFailure, UniqueViolation
from sqlalchemy.exc import OperationalError, PendingRollbackError,NoResultFound
from sqlmodel import Session, SQLModel


class CommitMode(IntEnum):
    """
    Commit modes for the managed tx methods
    """

    NONE = 0
    FLUSH = 1
    COMMIT = 2
    ROLLBACK = 3


"""
* managed_tx_method and async_managed_tx_method methods are decorators functions
* to be used on class functions. It expects the Class to have a 'db' Session object
* initialised
"""


def managed_tx_method(
    auto_commit: CommitMode = CommitMode.COMMIT, num_retries=settings.DATABASE_MAX_TX_RETRY_COUNT
):
    def decorator(f):
        @wraps(f)
        def wrapped_f(self, *args, **kwargs):
            session = self.db if hasattr(self,"db") else None
            if not session and hasattr(self,"session"):
                session = self.session.db

            try:
                result = None
                if auto_commit == CommitMode.COMMIT:
                    retry_exhausted = True
                    for i in range(num_retries):
                        try:
                            result = f(self, *args, **kwargs)
                            session.commit()
                            if isinstance(result, SQLModel):
                                session.refresh(result)
                            retry_exhausted = False
                            break
                        except PendingRollbackError as error:
                            logger.info(str(error))
                            session.rollback()
                        except OperationalError as error:
                            if error.orig is not None and isinstance(
                                error.orig,
                                (
                                    SerializationFailure,
                                    DeadlockDetected,
                                    UniqueViolation,
                                    ExclusionViolation,
                                ),
                            ):
                                logger.info(
                                    f"{type(error.orig)} Inner {error.orig.pgcode} {type(error.orig.pgcode)}"
                                )
                                session.rollback()
                            else:
                                raise error
                        logger.info(f"Retry {i+1}/{num_retries}")
                    if retry_exhausted:
                        raise MkdiError(
                            "DATABASE_MAX_RETIRES_EXHAUSTED",
                            error_code=MkdiErrorCode.DATABASE_MAX_RETRIES_EXHAUSTED,
                            http_status_code=HTTPStatus.SERVICE_UNAVAILABLE,
                        )
                else:
                    result = f(self, *args, **kwargs)
                    if auto_commit == CommitMode.FLUSH:
                        session.flush()
                        if isinstance(result, SQLModel):
                            session.refresh(result)
                    elif auto_commit == CommitMode.ROLLBACK:
                        session.rollback()
                return result
            except NoResultFound as error:
                raise MkdiError(
                    error_code=MkdiErrorCode.NOT_FOUND,
                    message="Resource not found",
                    http_status_code=HTTPStatus.NOT_FOUND,
                ) from error
            except Exception as error:
                logger.info(str(error))
                raise error

        return wrapped_f

    return decorator


def async_managed_tx_method(
    auto_commit: CommitMode = CommitMode.COMMIT, num_retries=settings.DATABASE_MAX_TX_RETRY_COUNT
):
    def decorator(f):
        @wraps(f)
        async def wrapped_f(self, *args, **kwargs):
            try:
                result = None
                if auto_commit == CommitMode.COMMIT:
                    retry_exhausted = True
                    for i in range(num_retries):
                        try:
                            result = await f(self, *args, **kwargs)
                            await self.db.commit()
                            if isinstance(result, SQLModel):
                                await self.db.refresh(result)
                            elif isinstance(result, list):
                                for item in result:
                                    if isinstance(item, SQLModel):
                                        await self.db.refresh(item)
                            retry_exhausted = False
                            break
                        except PendingRollbackError as e:
                            logger.info(str(e))
                            await self.db.rollback()
                        except OperationalError as e:
                            if e.orig is not None and isinstance(
                                e.orig,
                                (
                                    SerializationFailure,
                                    DeadlockDetected,
                                    UniqueViolation,
                                    ExclusionViolation,
                                ),
                            ):
                                logger.info(
                                    f"{type(e.orig)} Inner {e.orig.pgcode} {type(e.orig.pgcode)}"
                                )
                                await self.db.rollback()
                            else:
                                raise e
                        logger.info(f"Retry {i+1}/{num_retries}")
                    if retry_exhausted:
                        raise MkdiError(
                            "DATABASE_MAX_RETIRES_EXHAUSTED",
                            error_code=MkdiErrorCode.DATABASE_MAX_RETRIES_EXHAUSTED,
                            http_status_code=HTTPStatus.SERVICE_UNAVAILABLE,
                        )
                else:
                    result = await f(self, *args, **kwargs)
                    if auto_commit == CommitMode.FLUSH:
                        await self.db.flush()
                        if isinstance(result, SQLModel):
                            self.db.refresh(result)
                    elif auto_commit == CommitMode.ROLLBACK:
                        await self.db.rollback()
                return result
            except Exception as e:
                logger.info("Something went wrong")
                logger.info(str(e))
                raise e

        return wrapped_f

    return decorator


def default_session_factory() -> Session:
    return Session(engine)


def managed_tx_function(
    auto_commit: CommitMode = CommitMode.COMMIT,
    num_retries=settings.DATABASE_MAX_TX_RETRY_COUNT,
    session_factory: Callable[..., Session] = default_session_factory,
):
    """Passes Session object as first argument to wrapped function."""

    def decorator(f):
        @wraps(f)
        def wrapped_f(*args, **kwargs):
            try:
                result = None
                if auto_commit == CommitMode.COMMIT:
                    retry_exhausted = True
                    for i in range(num_retries):
                        with session_factory() as session:
                            try:
                                result = f(session, *args, **kwargs)
                                session.commit()
                                if isinstance(result, SQLModel):
                                    session.refresh(result)
                                retry_exhausted = False
                                break
                            except PendingRollbackError as e:
                                logger.info(str(e))
                                session.rollback()
                            except OperationalError as e:
                                if e.orig is not None and isinstance(
                                    e.orig,
                                    (
                                        SerializationFailure,
                                        DeadlockDetected,
                                        UniqueViolation,
                                        ExclusionViolation,
                                    ),
                                ):
                                    logger.info(
                                        f"{type(e.orig)} Inner {e.orig.pgcode} {type(e.orig.pgcode)}"
                                    )
                                    session.rollback()
                                else:
                                    raise e
                        logger.info(f"Retry {i+1}/{num_retries}")
                    if retry_exhausted:
                        raise MkdiError(
                            "DATABASE_MAX_RETIRES_EXHAUSTED",
                            error_code=MkdiErrorCode.DATABASE_MAX_RETRIES_EXHAUSTED,
                            http_status_code=HTTPStatus.SERVICE_UNAVAILABLE,
                        )
                else:
                    with session_factory() as session:
                        result = f(session, *args, **kwargs)
                    if auto_commit == CommitMode.FLUSH:
                        session.flush()
                        if isinstance(result, SQLModel):
                            session.refresh(result)
                    elif auto_commit == CommitMode.ROLLBACK:
                        session.rollback()
                return result
            except Exception as e:
                logger.info(str(e))
                raise e

        return wrapped_f

    return decorator


def async_managed_tx_function(
    auto_commit: CommitMode = CommitMode.COMMIT,
    num_retries=settings.DATABASE_MAX_TX_RETRY_COUNT,
    session_factory: Callable[..., Session] = default_session_factory,
):
    """Passes Session object as first argument to wrapped function."""

    def decorator(f):
        @wraps(f)
        async def wrapped_f(*args, **kwargs):
            try:
                result = None
                if auto_commit == CommitMode.COMMIT:
                    retry_exhausted = True
                    for i in range(num_retries):
                        with session_factory() as session:
                            try:
                                result = await f(session, *args, **kwargs)
                                session.commit()
                                if isinstance(result, SQLModel):
                                    session.refresh(result)
                                retry_exhausted = False
                                break
                            except PendingRollbackError as error:
                                logger.info(str(error))
                                session.rollback()
                            except OperationalError as error:
                                if error.orig is not None and isinstance(
                                    error.orig,
                                    (
                                        SerializationFailure,
                                        DeadlockDetected,
                                        UniqueViolation,
                                        ExclusionViolation,
                                    ),
                                ):
                                    logger.info(
                                        f"{type(error.orig)} Inner {error.orig.pgcode} {type(error.orig.pgcode)}"
                                    )
                                    session.rollback()
                                else:
                                    raise error
                        logger.info(f"Retry {i+1}/{num_retries}")
                    if retry_exhausted:
                        raise MkdiError(
                            "DATABASE_MAX_RETIRES_EXHAUSTED",
                            error_code=MkdiErrorCode.DATABASE_MAX_RETRIES_EXHAUSTED,
                            http_status_code=HTTPStatus.SERVICE_UNAVAILABLE,
                        )
                else:
                    with session_factory() as session:
                        result = await f(session, *args, **kwargs)
                    if auto_commit == CommitMode.FLUSH:
                        session.flush()
                        if isinstance(result, SQLModel):
                            session.refresh(result)
                    elif auto_commit == CommitMode.ROLLBACK:
                        session.rollback()
                return result
            except Exception as error:
                logger.info(str(error))
                raise error

        return wrapped_f

    return decorator
