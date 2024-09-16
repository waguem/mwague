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

    def get_request_message(self) -> str:
        request = next((note for note in self.notes if note["type"] == "REQUEST"), None)
        if request:
            return request["message"]
        return ""

    def to_report_item(self, is_out: bool = False) -> dict:
        request_message = self.get_request_message()

        return {
            "created_at": self.item.created_at,
            "amount": str(self.item.amount),
            "type": str(self.item.type.value),
            "converted": str(self.item.amount * self.item.rate),
            "code": self.item.code,
            "state": str(self.item.state.value),
            "description": request_message,
            "is_out": is_out,
        }
