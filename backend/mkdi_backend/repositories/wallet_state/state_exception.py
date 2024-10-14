"""STATE exception"""

from mkdi_shared.schemas.protocol import TransactionState


class StateException(Exception):
    """Custom exception to handle state-related errors."""

    def __init__(self, message, state: TransactionState):
        super().__init__(message)
        self.state = state

    def __str__(self):
        return f"{self.args[0]} (State: {self.state})"
