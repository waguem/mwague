# pylint: disable=missing-module-docstring
from behave import given, when, then  # pylint: disable=no-name-in-module
import client
from tests.tools import utils, database

####################################################################################################
# When I request a deposit transaction of <amount> for <receiver>
# Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
# Then I logout
# Examples: Valid Internal Transaction
#     | username     | password  | receiver | amount | state    | charges | reason               |
#     | wagueAdmin   | waguepass | MDM      | 100    | REJECTED | 3.45    | No activity found    |
####################################################################################################


@when("I request a deposit transaction of {amount} for {receiver}")
def request_deposit_transaction(ctx, amount, receiver):
    """request deposit transaction"""

    deposit = client.DepositRequest(receiver=receiver, type=client.TransactionType.DEPOSIT)

    utils.request_transaction(ctx, amount=amount, charges=0, currency="USD", data=deposit.to_dict())


# I review the pending deposit for <receiver>
@when("I review the pending deposit {amount} for {receiver}")
def review_deposit_tr(ctx, amount, receiver):
    """review deposit"""
    ctx.receiver_account = database.get_agent_account(receiver)
    ctx.fund_account = database.get_fund_account(ctx.logged_user.office_id)

    utils.review_transaction(
        ctx=ctx,
        agent=receiver,
        amount=amount,
        currency="USD",
        state=client.ValidationState.APPROVED,
        tr_type=client.TransactionType.DEPOSIT,
        data={"receiver": ctx.receiver_account.initials, "type": client.TransactionType.DEPOSIT},
    )
