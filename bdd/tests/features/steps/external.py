# pylint: disable=missing-module-docstring
from behave import given, when, then  # pylint: disable=no-name-in-module
import client
from decimal import Decimal
from tests.tools import utils, database
import json

####################################################################################################@
# When I request an external transaction with the following details
# """
# {
#     "sender": "<sender>",
#     "amount": "<amount>"
#     "currency": <currency>
#     "charges": <charges>
#     "rate": <rate>
# }
# """
# Then I should get a response with the transaction details, the transaction is at a given state <state> or and error with a reason <reason>
# Then I logout
####################################################################################################@


@when("I request an external transaction with the following details")
def request_external_tr(ctx):
    """request external transaction"""
    test_input = json.loads(ctx.text)
    external = client.ExternalRequest(
        type=client.TransactionType.EXTERNAL,
        sender=test_input["sender"],
        payment_currency=test_input["currency"],
        customer=None,
    )
    ctx.charges = test_input["charges"]
    utils.request_transaction(
        ctx,
        amount=test_input["amount"],
        charges=test_input["charges"],
        currency=test_input["currency"],
        data=external.to_dict(),
    )


####################################################################################################@
# When I <review> a pending external <amount> for <sender>
# Then I should get a response with the reviewed transaction
# Then the state of the transaction should be <state>
####################################################################################################@
@when("I {review} a pending external {amount} for {sender} with {account}")
def review_pendings(ctx, review, amount, sender, account):
    """review external transaction"""

    ctx.review = review
    ctx.sender_account = database.get_agent_account(sender)
    ctx.fund_account = database.get_agent_account(ctx.logged_user.office_id)
    ctx.office_account = database.get_office_account(ctx.logged_user.office_id)
    state = client.ValidationState.APPROVED
    if review == "REJECTED":
        state = client.ValidationState.REJECTED
    elif review == "CANCELLED":
        state = client.ValidationState.CANCELLED

    external = client.ExternalRequest(
        type=client.TransactionType.EXTERNAL,
        sender=account,
        payment_currency="USD",
        customer=None,
    )
    utils.review_transaction(
        ctx=ctx,
        agent=sender,
        amount=amount,
        state=state,
        tr_type=client.TransactionType.EXTERNAL,
        data=external.to_dict(),
        currency="USD",
    )


@then("I should get a response with the reviewed transaction at a given state {state}")
def review_transaction(ctx, state):
    """review transaction"""
    assert ctx.review_successful
    assert ctx.response.state == state


@when("I pay {payment} an external {amount} for {sender} with {account}")
def pay_external(ctx, payment, amount, sender, account):
    """pay external transaction"""
    ctx.sender_account = database.get_agent_account(sender)
    ctx.fund_account = database.get_fund_account(ctx.logged_user.office_id)
    ctx.office_account = database.get_office_account(ctx.logged_user.office_id)
    ctx.payment = payment
    ctx.amount = amount
    ctx.sender = sender
    ctx.account = account

    ctx.transaction = utils.get_transaction(ctx, client.TransactionType.EXTERNAL, amount, sender)
    payment: client.PaymentRequest = client.PaymentRequest(
        amount=Decimal(amount),
        payment_type=client.TransactionType.EXTERNAL,
        notes=dict({"payment": payment}),
    )
    utils.pay_transaction(ctx, ctx.transaction, payment)
    assert ctx.response.state == client.PaymentState.NUMBER_1  # PAID ?


@then("The transaction is at a given state {state}")
def after_payment(ctx, state):
    ctx.transaction = utils.get_transaction(
        ctx, client.TransactionType.EXTERNAL, ctx.amount, ctx.sender
    )

    if ctx.payment == "COMPLETE":
        assert ctx.transaction.state == client.TransactionState.PAID


@then("the sender {sender} account should be debited and charged if complete {transaction_charges}")
def debited_sender(ctx, sender, transaction_charges):
    sender_account = database.get_agent_account(sender)
    ctx.charges = Decimal(transaction_charges) if ctx.payment == "COMPLETE" else 0
    debit_amount = Decimal(ctx.amount) + ctx.charges
    assert Decimal(sender_account.balance + debit_amount) == Decimal(ctx.sender_account.balance)


@then("the fund account should be credited")
def credited_fund(context):
    fund_account = database.get_fund_account(context.logged_user.office_id)
    assert Decimal(fund_account.balance) == Decimal(context.fund_account.balance) - Decimal(
        context.amount
    )


@then("the office account should be credited with the charges")
def credited_office(ctx):
    office_account = database.get_office_account(ctx.logged_user.office_id)
    charges = ctx.charges
    assert Decimal(office_account.balance) == Decimal(ctx.office_account.balance) + Decimal(charges)
