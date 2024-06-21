from enum import IntEnum
from http import HTTPStatus


class MkdiErrorCode(IntEnum):
    """
    Error codes of the Open-Assistant backend API.

    Ranges:
         0-1000: general errors
      1000-2000: tasks endpoint
      2000-3000: prompt_repository, task_repository, user_repository
      3000-4000: external resources
    """

    # 0-1000: general errors
    GENERIC_ERROR = 0
    DATABASE_URI_NOT_SET = 1
    API_CLIENT_NOT_AUTHORIZED = 2
    ROOT_TOKEN_NOT_AUTHORIZED = 3
    # for creating a new user, returned if the username is already taken
    USER_EXISTS = 4
    ORGANIZATION_EXISTS = 5
    OFFICE_EXISTS = 6
    USER_NOT_FOUND = 7
    ROLE_NOT_FOUND = 8
    INVALID_ROLE = 9
    USER_NOT_IN_SAME_ENTITTY = 10
    DUPLICATE_ERROR = 11

    SERVER_ERROR0 = 500
    SERVER_ERROR1 = 501

    TOO_MANY_REQUESTS = 429
    DATABASE_MAX_RETRIES_EXHAUSTED = 430

    INVALID_AUTHENTICATION = 600


class MkdiError(Exception):
    """Base class for Open-Assistant exceptions."""

    message: str
    error_code: int
    http_status_code: HTTPStatus

    def __init__(
        self,
        message: str,
        error_code: MkdiErrorCode,
        http_status_code: HTTPStatus = HTTPStatus.BAD_REQUEST,
    ):
        super().__init__(
            message, error_code, http_status_code
        )  # make exception picklable (fill args member)
        self.message = message
        self.error_code = error_code
        self.http_status_code = http_status_code

    def __repr__(self) -> str:
        class_name = self.__class__.__name__
        return f'{class_name}(message="{self.message}", error_code={self.error_code}, http_status_code={self.http_status_code})'
