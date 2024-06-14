from enum import Enum

from loguru import logger


class Role(Enum):
    SOFT_ADMIN = 0
    OFFICE_ADMIN = 1
    ORG_ADMIN = 2
    # NORMAL        = 3
    # AGENT         = 4

    # add a function that converts the enum to a string
    # SOFT_ADMIN -> "soft_admin"

    def __str__(self):
        return self.name

    # add a function that takes a number and returns the enum
    # 0 -> SOFT_ADMIN

    @classmethod
    def from_number(cls, number: int):
        return cls(number)

    @classmethod
    def from_str(cls, name: str):
        return cls[name.upper()]

    def canAccess(self, role):
        return self.value <= role.value

    @classmethod
    def is_valid(cls, role: str):
        try:
            # check role can be converted into Role
            Role.from_str(role)
            return True
        except:
            pass
        return False
