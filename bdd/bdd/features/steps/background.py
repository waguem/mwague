# pylint: disable=missing-module-docstring
from behave import given, when, then  # pylint: disable=no-name-in-module

from loguru import logger
import client as api_client
from client.rest import ApiException

from bdd.tools import oidc

configuration = api_client.Configuration(host="http://localhost:8080")


@given("I have a backend server")
def backend_is_available(context):
    """Check if the backend server is available"""
    # This step can be used to set up or check the backend server
    with api_client.ApiClient(configuration) as api:
        ping_api = api_client.TestingApi(api)

        logger.info("Backend server is available ??")
        try:
            response = ping_api.ping_api_v1_ping_get()
            expected_response = {"ping": "pong"}
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


@then("I logout")
def logout(context):
    """logout the user"""
    oidc.clear_sessions(context.logged_user.id)
