from behave import given, then, when
from behave.api.async_step import async_run_until_complete
from mkdi_func_tests.shared import error_code_dic
from mkdi_shared.exceptions.mkdi_api_error import MkdiError


@given('a user exists with username "Alice" and password "Alice"')
def step_impl(context):
    context.username = "Alice"
    context.password = "Alice"
    context.response = None
    context.response = None


@when('I send a POST request to "/api/token" with body')
@async_run_until_complete
async def step_impl(context):
    context.response = await context.client.authenticate(
        username=context.username, password=context.password
    )


@then("the response should contain JSON")
def step_impl(context):
    context.response is not None
    context.response["access_token"] is not None
    context.response["token_type"] == "bearer"


@given("a user {username} with a password {password}")
def ste_auth_user(context, username, password):
    context.username = username
    context.password = password
    context.response = None


@when('I send a POST request to "/api/token" with body and wait for response')
@async_run_until_complete
async def step_impl_authenticate(context):
    try:
        context.response = await context.client.authenticate(
            username=context.username, password=context.password
        )
    except MkdiError as error:
        context.error = error


@then("the response should contain JSON with {status}")
def step_impl(context, status):
    if status == "access_token":
        context.response is not None
        context.response["access_token"] is not None
        context.response["token_type"] == "bearer"
    else:
        context.error is not None
        context.error.error_code == error_code_dic[status]
