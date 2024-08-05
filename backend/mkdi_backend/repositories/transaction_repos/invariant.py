"""Invariant checker for the transaction repository"""

from functools import wraps
from http import HTTPStatus
from typing import List
import asyncio
from loguru import logger
from mkdi_backend.models.Account import Account
from mkdi_backend.repositories.account import AccountRepository
from mkdi_backend.repositories.activity import ActivityRepo
from mkdi_backend.utils.database import CommitMode
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from psycopg2.errors import (
    DeadlockDetected,
    ExclusionViolation,
    SerializationFailure,
    UniqueViolation,
)
from sqlalchemy.exc import OperationalError, PendingRollbackError, NoResultFound
from sqlmodel import SQLModel


def async_managed_invariant_tx_method(
    auto_commit: CommitMode = CommitMode.COMMIT, num_retries: int = 3
):
    """Invariant checker decorator for async methods"""

    async def check_invariant(self):
        """Check system invariant before calling a function asynchronously"""
        # This is a placeholder for the actual invariant check implementation
        # It should be an async function that checks system invariants
        # For example, checking if the account status is active, etc.
        # This function should return True if the invariant check passes, False otherwise
        acc_repo = AccountRepository(self.db)
        cor = [
            self.a_has_started_activity(),
            acc_repo.a_check_invariant(self.user.organization_id, self.user.office_id),
        ]

        return all(await asyncio.gather(*cor))

    def decorator(f):
        @wraps(f)
        async def wrapped_f(self, *args, **kwargs):
            logger.info(f"Checking Sys Invariant for {f.__name__}")
            logger.info(f"Auto Commit Mode: {auto_commit}")
            invariant_exception = MkdiError(
                "UNHEALTHY_INVARIANT",
                error_code=MkdiErrorCode.UNHEALTHY_INVARIANT,
                http_status_code=HTTPStatus.NOT_ACCEPTABLE,
            )
            result: SQLModel | List[SQLModel] = None
            retry_exhausted = True
            healthy = True
            for attempt in range(num_retries):
                try:
                    # Assuming check_invariant is an async function
                    healthy = await check_invariant(self)
                    if not healthy:
                        raise MkdiError(
                            "UNHEALTHY_INVARIANT",
                            error_code=MkdiErrorCode.UNHEALTHY_INVARIANT,
                            http_status_code=HTTPStatus.NOT_ACCEPTABLE,
                        )

                    logger.info(f"Sys Invariant is Healthy before {f.__name__}")
                    start_accounts: List[Account] = await self.a_accounts()
                    # increment accounts versions
                    for account in start_accounts:
                        if account:
                            account.version += 1
                            self.db.add(account)

                    result = await f(self, *args, **kwargs)

                    end_accounts: List[Account] = await self.a_accounts()
                    mismatch = False
                    for index, account in enumerate(end_accounts):
                        if not account:
                            continue
                        logger.info(f"Checking Account {account}")
                        if account.version != start_accounts[index].version:
                            logger.info("Version Mismatch Detected")
                            logger.info(f"Before version : {start_accounts[index].version}")
                            logger.info(f"After version : {account.version}")
                            mismatch = True
                            break
                    if mismatch:
                        await self.db.rollback()
                        retry_exhausted = False

                    if isinstance(result, List):
                        for item in result:
                            self.db.add(item)
                    elif isinstance(result, SQLModel):
                        self.db.add(result)

                    healthy = await check_invariant(self)
                    if not healthy:
                        logger.info(f"Sys Invariant is Unhealthy after {f.__name__}")
                        await self.db.rollback()
                        continue

                    if isinstance(result, SQLModel):
                        logger.info("Refreshing DB")
                        await self.db.refresh(result)
                    retry_exhausted = False
                    logger.info(f"Sys Invariant is Healthy after {f.__name__}")

                    break
                except (
                    DeadlockDetected,
                    ExclusionViolation,
                    SerializationFailure,
                    UniqueViolation,
                    OperationalError,
                    PendingRollbackError,
                ) as e:
                    logger.error(f"Transaction error: {e}. Retrying...")
                    if auto_commit == CommitMode.ROLLBACK:
                        # Assuming self.db.rollback() is an async operation
                        await self.db.rollback()
                    await asyncio.sleep(
                        0.1 * attempt
                    )  # Exponential back-off could be a better strategy
                except MkdiError as e:
                    if auto_commit == CommitMode.ROLLBACK:
                        await self.db.rollback()
                    raise e

            if retry_exhausted and not healthy:
                raise invariant_exception
            elif retry_exhausted:
                logger.error("Retry attempts exhausted.")
                raise MkdiError(
                    "ACCOUNT_VERSION_MISMATCH",
                    error_code=MkdiErrorCode.ACCOUNT_VERSION_MISMATCH,
                    http_status_code=HTTPStatus.NOT_ACCEPTABLE,
                )
            await self.db.commit()
            return result

        return wrapped_f

    return decorator


def managed_invariant_tx_method(
    auto_commit: CommitMode = CommitMode.COMMIT,
    num_retries: int = 3,
):
    """Invariant checker decorator"""

    def check_invariant(self):
        """check sys invariant before calling a function"""
        # check system invariant and make sure it is healthy
        acc_repo = AccountRepository(self.db)
        activity_repo = ActivityRepo(self.db)
        return activity_repo.has_started(self.user.office_id) and acc_repo.check_invariant(
            self.user.organization_id, self.user.office_id
        )

    def decorator(f):
        @wraps(f)
        def wrapped_f(self, *args, **kwargs):
            logger.info(f"Checking Sys Invariant for {f.__name__}")
            logger.info(f"Auto Commit Mode: {auto_commit}")

            try:
                result: SQLModel | List[SQLModel] = None
                retry_exhausted = True
                healthy = True

                invariant_exception = MkdiError(
                    "UNHEALTHY_INVARIANT",
                    error_code=MkdiErrorCode.UNHEALTHY_INVARIANT,
                    http_status_code=HTTPStatus.NOT_ACCEPTABLE,
                )

                for _ in range(num_retries):
                    try:
                        healthy = check_invariant(self)
                        if not healthy:
                            continue

                        start_accounts: List[Account] = self.accounts()

                        # increment accounts versions
                        for account in start_accounts:
                            if account:
                                account.version += 1
                                self.db.add(account)

                        logger.info(f"Sys Invariant is Healthy before {f.__name__}")

                        # api call
                        result = f(self, *args, **kwargs)

                        # check if the version of the accounts have been updated by someoneelse
                        # to avoid concurrent updates
                        end_accounts: List[Account] = self.accounts()
                        mismatch = False
                        for index, account in enumerate(end_accounts):
                            if not account:
                                continue

                            logger.info(f"Checking Account {account}")
                            if account.version != start_accounts[index].version:
                                # cancel version update
                                logger.info("Version Mismatch Detected")
                                logger.info(f"Before version : {start_accounts[index].version}")
                                logger.info(f"After version : {account.version}")
                                mismatch = True
                                break

                        if mismatch:
                            self.db.rollback()
                            retry_exhausted = False

                        if isinstance(result, List):
                            for item in result:
                                self.db.add(item)
                        elif isinstance(result, SQLModel):
                            self.db.add(result)

                        # commit the transaction

                        # check if the system invariant is still healthy
                        healthy = check_invariant(self)
                        if not healthy:
                            logger.info(f"Sys Invariant is Unhealthy after {f.__name__}")
                            self.db.rollback()
                            continue

                        if isinstance(result, SQLModel):
                            logger.info("Refreshing DB")
                            self.db.refresh(result)
                        retry_exhausted = False
                        logger.info(f"Sys Invariant is Healthy after {f.__name__}")
                        break

                    except PendingRollbackError as error:
                        logger.info(str(error))
                        self.db.rollback()
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
                            self.db.rollback()
                        else:
                            raise error

                # if the system invariant is unhealthy after all retries
                if retry_exhausted and not healthy:
                    raise invariant_exception
                elif retry_exhausted:
                    raise MkdiError(
                        "ACCOUNT_VERSION_MISMATCH",
                        error_code=MkdiErrorCode.ACCOUNT_VERSION_MISMATCH,
                        http_status_code=HTTPStatus.NOT_ACCEPTABLE,
                    )

                self.db.commit()
            except Exception as error:
                logger.info(f"Unexpected Error {error}")
                raise error
            return result

        return wrapped_f

    return decorator


# a decorator to check if there's an ongoing activity for the user
def has_activity_started(f):
    """decorator to verify that there's an ongoing activity for the user"""

    @wraps(f)
    def wrapped_f(self, *args, **kwargs):
        try:
            if not self.has_started_activity():
                raise MkdiError(
                    "NO_ACTIVITY",
                    error_code=MkdiErrorCode.NO_ACTIVITY,
                    http_status_code=HTTPStatus.NOT_ACCEPTABLE,
                )
        except NoResultFound as e:
            logger.error(f"Error: {e}")
            raise MkdiError(
                error_code=MkdiErrorCode.NO_ACTIVITY,
                http_status_code=HTTPStatus.NOT_ACCEPTABLE,
                message="No activity found",
            ) from e
        return f(self, *args, **kwargs)

    return wrapped_f
