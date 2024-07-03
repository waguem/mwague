# pylint: disable=missing-module-docstring
from behave import given, when, then  # pylint: disable=no-name-in-module
import json

from client.rest import ApiException
from loguru import logger
import client as api_client
from decimal import Decimal

from tests.tools import oidc, database


@given("I have a backend server")
def backend_is_available(context):
    """Check if the backend server is available"""
    # This step can be used to set up or check the backend server
    with api_client.ApiClient(context.config) as api:
        ping_api = api_client.TestingApi(api)

        logger.info("Backend server is available ??")
        try:
            response = ping_api.ping_api_v1_ping_get()
            expected_response = {"health": "UP"}
            logger.debug(f"Response: {response}")
            assert response == expected_response
        except ApiException as e:
            logger.error(f"Exception when calling TestingApi->ping_api_v1_ping_get: {e}")
            logger.info("Failed to connect to the backend server")
            context.response = e


@when('I login with username "{username}" and password "{password}"')
def get_access_token(context, username, password):
    """Get the access token for the user"""
    user_token = oidc.get_access_token(username, password)
    context.user_token = user_token
    context.logged_user = oidc.decode_access_token(user_token["access_token"])
    context.config.access_token = context.user_token["access_token"]


@then("I should get an access token")
def obtained_token(context):
    """check that the token is not none"""
    assert context.logged_user is not None


@then('I have a required role "{role}" for this feature')
def check_role(context, role):
    """check that the user has the required role"""
    if role != "any":
        assert role in context.logged_user.roles


@then("I logout")
def logout(context):
    """logout the user"""
    oidc.clear_sessions(context.logged_user.id)


####################################################################################################
# Background: System invariant
#     Given My Office Invariant is correct
####################################################################################################
@given("My Office Invariant is correct")
def set_office_invariant(ctx):
    """set office invariant"""
    if ctx.logged_user is not None:
        database.reset_office_invariant(ctx.logged_user.office_id)


@then("My Office Invariant should be correct")
def verify_office_invariant(ctx):
    """verify office invariant"""
    office_invariant = database.get_office_invariant(ctx.logged_user.office_id)
    assert office_invariant is not None
    assert abs(office_invariant) < 0.001


@then("I have started an activity with the following details")
def start_activity(ctx):
    """start activity"""
    json_data = json.loads(ctx.text)
    ctx.rates = json_data["rates"]
    with api_client.ApiClient(ctx.config) as api:
        activity_api = api_client.ActivityApi(api)

        ctx.request = api_client.CreateActivityRequest(rates=json_data["rates"])
        try:
            response: api_client.ActivityResponse = (
                activity_api.start_activity_api_v1_office_activity_post(
                    create_activity_request=ctx.request
                )
            )
            assert response.state == api_client.ActivityState.OPEN
            assert response.started_at is not None
        except ApiException as e:
            ctx.error = e
    # start activity


@then(
    "I should get a response with the transaction details, the transaction is at a given state {state} or and error with a reason {reason}"
)
def request_transaction_response(ctx, state, reason):
    """check the transaction response"""
    if state == "REJECTED":
        assert ctx.error == reason
    elif state == "REVIEW":
        assert ctx.error is None
        response: api_client.TransactionResponse = ctx.response
        request: api_client.Data = ctx.request.data
        assert response.state == api_client.TransactionState.REVIEW
        assert response.amount == ctx.request.amount.amount
        assert response.type == request.actual_instance.type
        assert response.rate == ctx.request.amount.rate
        assert response.code is not None
        assert response.created_at is not None


@then(
    "I should get a response with the reviewed transaction details, the transaction is at a given state {state}"
)
def reviewed_transaction_response(ctx, state):
    """check the reviewed transaction response"""
    if state == "APPROVED":
        res: api_client.TransactionResponse = ctx.response
        assert ctx.error is None
        assert res.state == api_client.TransactionState.PAID
        assert res.code == ctx.transaction.code
        assert res.amount == ctx.transaction.amount


# Then The receiver account should be debited with the <amount> of the transaction
@then("The receiver account should be debited with the {amount} of the transaction")
def receiver_account_debited(ctx, amount):
    """receiver account debited"""
    receiver_account = database.get_account(ctx.receiver_account.initials)

    assert receiver_account.balance == Decimal(ctx.receiver_account.balance) + Decimal(amount)


# Then The fund account should be debited with the <amount> of the transaction
@then("The fund account should be debited with the {amount} of the transaction")
def fund_account_debited(ctx, amount):
    """fund account debited"""
    fund_account = database.get_fund_account(ctx.logged_user.office_id)
    assert fund_account.balance == Decimal(ctx.fund_account.balance) + Decimal(amount)
