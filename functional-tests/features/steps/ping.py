from behave import given, then, when
from behave.api.async_step import async_run_until_complete


@given("I have a backend server")
def step_impl(context):
    assert context.api_url is not None


@when("I ping the backend server")
@async_run_until_complete
async def step_impl(context):
    assert context.client is not None
    context.response = await context.client.ping()


@then("I should get a response")
def step_impl(context):
    context.response is not None
