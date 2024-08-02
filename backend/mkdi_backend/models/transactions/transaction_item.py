from mkdi_backend.models import External, Internal, Deposit, Sending, ForeignEx
from pydantic import BaseModel
from typing import Union


class TransactionItem(BaseModel):
    item: Union[Internal, Deposit, Sending, External, ForeignEx]
