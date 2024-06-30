"""Behave entry point for the functional tests."""

from behave import fixture, use_fixture
import client as api_client
from bdd.tools import oidc


@fixture
def setup(context):
    """set the api url."""
    context.api_url = "http://localhost:8080"
    configuration = api_client.Configuration(host=context.api_url)
    context.config = configuration


def before_all(context):
    """set up the tests."""
    use_fixture(setup, context)


def after_all(_):
    """tear down the tests."""
    oidc.disconnect()
