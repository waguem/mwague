from mkdi_backend.models import External, Internal, Deposit, Sending, ForEx
from pydantic import BaseModel, root_validator
from typing import Union, List, Dict
from mkdi_shared.schemas import protocol
import json


class TransactionItem(BaseModel):
    item: Union[Internal, Deposit, Sending, External, ForEx]
    notes: List[protocol.Note]

    @root_validator
    def extract_notes(cls, values):
        item = values.get("item")
        if not item:
            return values
        notes = json.loads(item.notes) if len(item.notes) > 0 else []
        values["notes"] = notes

        return values
