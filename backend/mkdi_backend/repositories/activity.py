

from datetime import datetime

from mkdi_backend.models.Activity import Activity
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.office import Office
from mkdi_backend.repositories.account import AccountRepository
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session


class ActivityRepo:

    def __init__(self, db: Session):
        self.db = db

    def has_started(self, office_id: str) -> bool:
        return (
            self.db.query(Activity)
            .filter(Activity.office_id == office_id, Activity.state == protocol.ActivityState.OPEN)
            .first()
            is not None
        )

    def get_current_activity(self,office_id:str)->protocol.ActivityResponse:
        return self.db.query(Activity).filter(Activity.office_id == office_id, Activity.state == protocol.ActivityState.OPEN).first()

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def start_activity(self,*,auth_user: KcUser, input: protocol.CreateActivityRequest) -> protocol.ActivityResponse:
        # only one activity is allowed per office and per day
        # if there is an open activity for the office then return it
        # once the activity is closed then no new activity can be started
        # if the activity is closed return an error

        # has started
        if self.has_started(auth_user.office_id):
            raise MkdiError(
                f"Activity already started in your office",
                error_code=MkdiErrorCode.ACTIVITY_STARTED,
            )
        # get office fund account
        fund_account = AccountRepository(self.db).get_office_fund_account(auth_user.office_id)
        if not fund_account:
            raise MkdiError(
                f"Fund account not found for your office",
                error_code=MkdiErrorCode.NOT_FOUND,
            )
        # the user office
        office: Office = self.db.query(Office).filter(Office.id == auth_user.office_id).first()
        assert office is not None
        # make sure the currencies match offices currency
        def has_currency(list:list[dict],currency):
            for item in list:
                if item["name"] == currency:
                    return True

        for rate in input.rates:
            if not has_currency(office.currencies,rate.currency):
                raise MkdiError(
                    f"Currency {rate.currency} not allowed for your office",
                    error_code=MkdiErrorCode.INVALID_CURRENCY,
                )

        activity = Activity(
            office_id=auth_user.office_id,
            state=protocol.ActivityState.OPEN,
            openning_fund=fund_account.balance,
            started_at= datetime.now(),
            started_by=auth_user.user_db_id,
            openning_rate={rate.currency: str(rate.rate) for rate in input.rates},
            account_id=fund_account.id,
            closing_fund=0,
        )
        self.db.add(activity)
        return activity
