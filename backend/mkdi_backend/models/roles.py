"""Software Roles"""

from enum import Enum


class Role(Enum):
    """Role Enum"""

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
        """get role from a number"""
        return cls(number)

    @classmethod
    def from_str(cls, name: str):
        """get role from a string"""
        return cls[name.upper()]

    def can_access(self, role) -> bool:
        """check if this role can access another role"""
        return self.value <= role.value

    @classmethod
    def is_valid(cls, role: str) -> bool:
        """check if a role is valid"""
        try:
            # check role can be converted into Role
            Role.from_str(role)
            return True
        except ValueError as e:
            print(f"Role is invalid {e}")

        return False
