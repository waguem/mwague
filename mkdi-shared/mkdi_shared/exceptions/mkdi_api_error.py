from enum import IntEnum
from http import HTTPStatus


class OasstErrorCode(IntEnum):
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


class OasstError(Exception):
    """Base class for Open-Assistant exceptions."""

    message: str
    error_code: int
    http_status_code: HTTPStatus

    def __init__(self, message: str, error_code: OasstErrorCode, http_status_code: HTTPStatus = HTTPStatus.BAD_REQUEST):
        super().__init__(message, error_code, http_status_code)  # make exception picklable (fill args member)
        self.message = message
        self.error_code = error_code
        self.http_status_code = http_status_code

    def __repr__(self) -> str:
        class_name = self.__class__.__name__
        return f'{class_name}(message="{self.message}", error_code={self.error_code}, http_status_code={self.http_status_code})'
