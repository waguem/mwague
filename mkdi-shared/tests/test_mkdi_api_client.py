from typing import Any
from unittest import mock
from uuid import uuid4

import aiohttp
import pytest
from mkdi_shared.api_client import MkdiApiClient

# from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode, HTTPStatus
from mkdi_shared.schemas import protocol as protocol_schema


class MockClientSession(aiohttp.ClientSession):
    response: Any

    def set_response(self, response: Any):
        self.response = response

    async def post(self, *args, **kwargs):
        return self.response


@pytest.fixture
def mock_http_session():
    yield MockClientSession()


@pytest.fixture
def mkdi_api_client_fake_http(mock_http_session):
    """
    An oasst_api_client that uses a mocked http session. No real requests are made.
    """
    client = MkdiApiClient(backend_url="http://localhost:8080", api_key="123", session=mock_http_session)
    yield client


@pytest.fixture
async def mkdi_api_client_mocked():
    """
    A an oasst_api_client pointed at the mocked backend.
    Relies on ./scripts/backend-development/start-mock-server.sh
    being run.
    """
    client = MkdiApiClient(backend_url="http://localhost:8080", api_key="123")
    yield client
    # TODO The fixture should close this connection, but there seems to be a bug
    # with async fixtures and pytest.
    # Since this only results in a warning, I'm leaving this for now.
    await client.close()


@pytest.mark.asyncio
async def test_can_ping_backend(mkdi_api_client_mocked: MkdiApiClient):
    assert await mkdi_api_client_mocked.ping() is not None
