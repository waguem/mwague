from behave import fixture, use_fixture
from mkdi_shared.api_client import MkdiApiClient

OFFICIAL_WEB_API_KEY: str = "755b9e02daafdc25deb5a3ad0ae865b532cab53027f90acf6e1fd453f73a84fa"


@fixture
def api_url(context):
    context.api_url = "http://localhost:8080"


@fixture
def mkdi_api_client(context):
    api_url = "http://localhost:8080"
    api_key = OFFICIAL_WEB_API_KEY
    context.client = MkdiApiClient(api_key=api_key, backend_url=api_url)


def before_all(context):
    use_fixture(api_url, context)
    use_fixture(mkdi_api_client, context)


def before_feature(context, feature):
    pass
