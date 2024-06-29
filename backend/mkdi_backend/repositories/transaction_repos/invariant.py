"""Invariant checker for the transaction repository"""

from functools import wraps
from http import HTTPStatus
from typing import List

from loguru import logger
from mkdi_backend.models.Account import Account
from mkdi_backend.repositories.account import AccountRepository
from mkdi_backend.utils.database import CommitMode
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from psycopg2.errors import (
    DeadlockDetected,
    ExclusionViolation,
    SerializationFailure,
    UniqueViolation,
)
from sqlalchemy.exc import OperationalError, PendingRollbackError
from sqlmodel import SQLModel


def managed_invariant_tx_method(
    auto_commit: CommitMode = CommitMode.COMMIT,
    num_retries: int = 3,
):
    """Invariant checker decorator"""

    def check_invariant(self):
        """check sys invariant before calling a function"""
        # check system invariant and make sure it is healthy
        acc_repo = AccountRepository(self.db)
        return self.has_started_activity() and acc_repo.check_invariant(
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

                        self.db.commit()
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
                        self.db.commit()

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
            except Exception as error:
                logger.info(f"Unexpected Error {error}")
                raise error
            return result

        return wrapped_f

    return decorator
