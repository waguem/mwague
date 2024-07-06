"""Behave entry point for the functional tests."""

from behave import fixture, use_fixture
import client as api_client
from tests.tools import oidc
from tests.tools import database
from tests.tools.config import config


@fixture
def setup(context):
    """set the api url."""
    context.api_url = config.API_URL
    configuration = api_client.Configuration(host=context.api_url)
    context.config = configuration
    clean_database(context)


@fixture
def teardown(context):
    """tear down the tests."""
    oidc.disconnect()
    # clean_database(context)


def clean_database(_):
    """clean the database."""
    database.remove_internals()
    database.remove_externals()
    database.remove_deposits()


def after_scenario(__, _):
    """clean the database after each scenario."""
    # database.remove_activity()
    pass


def before_all(context):
    """set up the tests."""
    use_fixture(setup, context)


def after_all(ctx):
    """tear down the tests."""
    use_fixture(teardown, ctx)
