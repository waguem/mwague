# pylint: disable=missing-module-docstring
from behave import given, when, then  # pylint: disable=no-name-in-module
import client
from decimal import Decimal
from tests.tools import utils, database
import json


@when("I request a sending transaction with the following details")
def request_sending_tr(ctx):
    test_input = json.loads(ctx.text)
    utils.request_transaction(
        ctx,
        amount=test_input["amount"]["amount"],
        charges=test_input["charges"]["amount"],
        currency=test_input["currency"],
        data=test_input["data"],
    )


@when("I review a pending sending with the following details")
def review_sending_tr(ctx):
    ctx.review_input = json.loads(ctx.text)
    ctx.receiver_account = database.get_agent_account(ctx.review_input["receiver"])
    ctx.fund_account = database.get_fund_account(ctx.logged_user.office_id)
    ctx.office_account = database.get_office_account(ctx.logged_user.office_id)

    state = client.ValidationState.APPROVED

    if ctx.review_input["review"] == "REJECT":
        state = client.ValidationState.REJECTED
    elif ctx.review_input["review"] == "CANCEL":
        state = client.ValidationState.CANCELLED
    ctx.transaction = utils.get_transaction(
        amount=ctx.review_input["amount"],
        tr_type=client.TransactionType.SENDING,
        intials=ctx.review_input["receiver"],
        ctx=ctx,
    )

    utils.review_transaction(
        ctx,
        agent=ctx.review_input["receiver"],
        amount=ctx.review_input["amount"],
        rate=ctx.transaction.rate,
        charges=ctx.transaction.charges,
        state=state,
        tr_type=client.TransactionType.SENDING,
        currency="USD",
        data=None,
    )


@when("the customer pay {payment} {amount} for {receiver} with {account}")
def customer_payment(ctx, payment, amount, receiver, account):
    ctx.receiver_account = database.get_agent_account(receiver)
    ctx.fund_account = database.get_fund_account(ctx.logged_user.office_id)
    ctx.office_account = database.get_office_account(ctx.logged_user.office_id)

    ctx.payment = payment
    ctx.amount = Decimal(amount)
    ctx.receiver = receiver

    ctx.transaction = utils.get_transaction(
        ctx, tr_type=client.TransactionType.SENDING, amount=ctx.amount, intials=ctx.receiver
    )

    payment: client.PaymentRequest = client.PaymentRequest(
        amount=Decimal(amount),
        payment_type=client.TransactionType.SENDING,
        notes={"payment": payment},
    )
    utils.pay_transaction(ctx, ctx.transaction, payment)
    assert ctx.response.state == client.PaymentState.NUMBER_1


@then("the receiver {receiver} account should be credited by the amount")
def receiver_credited(ctx, receiver):
    receiver_account = database.get_agent_account(receiver)
    assert Decimal(receiver_account.balance) == Decimal(ctx.receiver_account.balance) + Decimal(
        ctx.amount
    )


@then("the fund account should be credited by the {amount} + {transaction_charges}")
def fund_credited(ctx, amount, transaction_charges):
    charges = 0
    if ctx.payment == "COMPLETE":
        charges = Decimal(transaction_charges)
    ctx.charges = charges
    assert Decimal(ctx.fund_account.balance) == Decimal(ctx.fund_account.balance) + Decimal(
        ctx.amount
    ) + Decimal(charges)
