# pylint: disable=missing-module-docstring
import json
from behave import given, when, then  # pylint: disable=no-name-in-module
import client
from client.rest import ApiException
from decimal import Decimal
from tests.tools import database, utils

####################################################################################################
# Feature: Internal Transaction
# Feature Description
# Scenario Outline: Internal Transaction Request
#     Background: User is logged in
#         Given I have a backend server
#         When I login with <username> and <password>
#         Then I should get an access token
#         And I have a required role "any" for this feature
#     Given I have started an activity with the following details
#         """
#     {
#         "rates": [
#             {
#             "currency":"USD",
#             "rate": 3.67
#             },
#             {
#             "currency":"EUR",
#             "rate": 3.94
#             }
#         ]
#     }
#   """
#     Given Two accounts located in my office <sender> and <receiver>
#     When I request an internal transaction of <amount> from <sender> to <receiver>
#     Then I should get a response with the transaction details, the transaction is at a given state <state>
#     Then I logout
#     Examples: Valid Internal Transaction
#         | username     | password  | sender | receiver | amount | state   |
#     Examples: Invalid Internal Transaction
#         | username     | password   | sender | receiver | amount | state    |
#         | botoreAdmin  | botorepass | GZM    | MDM      | 100    | REJECTED |
####################################################################################################


@when("I request an internal transaction of {amount} from {sender} to {receiver} with {charges}")
def request_internal_transaction(ctx, amount, sender, receiver, charges):
    """request internal transaction"""
    internal = client.InternalRequest(
        sender=sender, receiver=receiver, type=client.TransactionType.INTERNAL
    )
    utils.request_transaction(ctx, amount, charges, "USD", internal.to_dict())


####################################################################################################
# When I review the pending transaction from <sender> to <receiver>
# Then I should get a response with the reviewed transaction details, the transaction is at a given state <state>
# Then The receiver account should be credited with the amount of the transaction
# Then The sender account should be debited with the amount of the transaction and the charges if any
# Then The office account should be credited with the charges of the transaction
# Then I logout
# Examples: Valid Internal Review Transaction
#     | username     | password  | sender | receiver | state     |
#     | wagueAdmin   | waguepass | GZM    | MDM      | APPROVED  |


# I review an internal transaction from <sender> to <receiver> for <amount> with <charges>
@when("I review an internal transaction from {sender} to {receiver} for {amount} with {charges}")
def review_transaction(ctx, sender, receiver, amount, charges):
    """ "review transaction"""
    sender_account = database.get_agent_account(sender)
    receiver_account = database.get_agent_account(receiver)
    office_account = database.get_office_account(ctx.logged_user.office_id)
    ctx.sender = sender
    ctx.receiver = receiver
    ctx.sender_balance_before = sender_account.balance
    ctx.receiver_balance_before = receiver_account.balance
    ctx.office_balance_before = office_account.balance

    utils.review_transaction(
        ctx=ctx,
        agent=sender,
        amount=amount,
        charges=charges,
        currency="USD",
        state=client.ValidationState.APPROVED,
        tr_type=client.TransactionType.INTERNAL,
        data={
            "sender": sender_account.initials,
            "receiver": receiver_account.initials,
            "type": client.TransactionType.INTERNAL,
        },
    )


@then("The receiver account should be credited with the amount of the transaction")
def verify_receiver_credit(ctx):
    """verify receiver credit"""
    receiver_account = database.get_agent_account(ctx.receiver)
    assert receiver_account.balance == Decimal(ctx.receiver_balance_before) + Decimal(
        ctx.transaction.amount
    )


@then(
    "The sender account should be debited with the amount of the transaction and the {charges} if any"
)
def verify_sender_debit(ctx, charges):
    """verify sender debit"""
    # check the balance
    sender_account = database.get_agent_account(ctx.sender)
    credit = Decimal(ctx.transaction.amount) + Decimal(charges)
    assert sender_account.balance == Decimal(ctx.sender_balance_before) - credit


@then("The office account should be credited with the {charges} of the transaction")
def verify_office_credit(ctx, charges):
    """verify office credit"""
    office_account = database.get_office_account(ctx.logged_user.office_id)
    assert office_account.balance == Decimal(ctx.office_balance_before) + Decimal(charges)


####################################################################################################
