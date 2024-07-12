# pylint: disable=missing-module-docstring
from behave import given, when, then  # pylint: disable=no-name-in-module
import client
from tests.tools import utils, database
from decimal import Decimal
import json

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


@when("I review the transaction first with {action} for {agent}")
def review_deposit_before_update(ctx, action, agent):
    """review pending deposit"""
    tr_to_review: client.TransactionResponse = ctx.response
    assert tr_to_review.state == client.TransactionState.REVIEW
    ctx.action = action
    review = None
    match action:
        case "APPROVE":
            review = review_deposit_tr
        case "REJECT":
            review = reject_pending_transaction
        case "CANCEL":
            review = cancel_pending_deposit
        case _:
            pass

    if review is not None:
        review(ctx, tr_to_review.amount, agent)


####################################################################################################
# when I edit the transaction with the following details with a new amount <new_amount>


@when("I edit the transaction with the following details with a new amount {new_amount}")
def edit_deposit_amount(ctx, new_amount):
    """edit deposit amount"""
    tranction: client.TransactionResponse = ctx.response
    request = {
        "amount": {"amount": Decimal(new_amount), "rate": tranction.rate},
        "currency": "USD",
        "transaction_type": "DEPOSIT",
    }
    ctx.request = client.TransactionRequest.from_dict(request)
    try:
        with client.ApiClient(ctx.config) as api:
            transaction_api = client.TransactionsApi(api)
            response: client.TransactionResponse = (
                transaction_api.update_transaction_api_v1_transaction_code_put(
                    code=tranction.code, transaction_request=ctx.request
                )
            )
            ctx.response = response
            ctx.error = None
    except client.ApiException as e:
        if hasattr(e, "body"):
            ctx.error = json.loads(e.body)["message"]
        else:
            ctx.error = e


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


@when("I reject the pending deposit {amount} for {receiver}")
def reject_pending_transaction(ctx, amount, receiver):
    """reject pending transaction"""
    ctx.receiver_account = database.get_agent_account(receiver)
    ctx.fund_account = database.get_fund_account(ctx.logged_user.office_id)

    utils.review_transaction(
        ctx=ctx,
        agent=receiver,
        amount=amount,
        currency="USD",
        state=client.ValidationState.REJECTED,
        tr_type=client.TransactionType.DEPOSIT,
        data={"receiver": ctx.receiver_account.initials, "type": client.TransactionType.DEPOSIT},
    )


@then("I should get a response with the {state} transaction details")
def reviewed_transaction(ctx, state):
    """check rejected transaction"""
    assert ctx.response is not None
    res: client.TransactionResponse = ctx.response
    assert res.state == client.TransactionState[state]
    if state != client.TransactionState.PAID:
        assert res.notes is not None


@then("The receiver {receiver} account should not be debited")
def receiver_not_debited(ctx, receiver):
    """check receiver account"""
    receiver_account = database.get_agent_account(receiver)
    assert receiver_account.balance == ctx.receiver_account.balance


@then("The fund account should not be debited")
def fund_account_not_debited(ctx):
    """check fund account"""
    fund = database.get_fund_account(ctx.logged_user.office_id)
    assert ctx.fund_account.balance == fund.balance


@when("I cancel the pending deposit {amount} for {receiver}")
def cancel_pending_deposit(ctx, amount, receiver):
    """cancel pending deposit"""
    ctx.receiver_account = database.get_agent_account(receiver)
    ctx.fund_account = database.get_fund_account(ctx.logged_user.office_id)

    utils.review_transaction(
        ctx=ctx,
        agent=receiver,
        amount=amount,
        currency="USD",
        state=client.ValidationState.CANCELLED,
        tr_type=client.TransactionType.DEPOSIT,
        data={"receiver": ctx.receiver_account.initials, "type": client.TransactionType.DEPOSIT},
    )


@then("I should get a response with the updated transaction or an {error}")
def updated_transaction(ctx, error):
    """"""
    assert ctx.action is not None
    if error != "None":
        ctx.error == error
    else:
        assert ctx.error is None
        state = client.TransactionState.REVIEW

        if ctx.action == "APPROVE":
            state = client.TransactionState.PAID
        elif ctx.action == "REJECT":
            state = client.TransactionState.REJECTED
        elif ctx.action == "CANCEL":
            state = client.TransactionState.CANCELLED
        req: client.TransactionRequest = ctx.request
        res: client.TransactionResponse = ctx.response
        assert res.state == state
        assert res.amount == req.amount.amount
