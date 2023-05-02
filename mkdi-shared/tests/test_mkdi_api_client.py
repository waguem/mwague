from typing import Any
from unittest import mock
from uuid import uuid4

import aiohttp
import pytest
from mkdi_shared.api_client import MkdiApiClient

# from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode, HTTPStatus
from mkdi_shared.schemas import protocol as protocol_schema


class MockClientSession:
    def __init__(self):
        self._session = aiohttp.ClientSession()

    async def get(self, url):
        return MockClientResponse(await self._session.get(url))

    # other methods go here


class MockClientResponse:
    def __init__(self, response):
        self.response = response
        self.status = response.status
        self.reason = response.reason
        self.headers = response.headers

    async def text(self):
        return await self.response.text()

    # other methods go here


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
def mkdi_api_client_mocked():
    """
    A an oasst_api_client pointed at the mocked backend.
    Relies on ./scripts/backend-development/start-mock-server.sh
    being run.
    """
    client = MkdiApiClient(backend_url="http://localhost:8080", api_key="123")
    yield client


@pytest.mark.asyncio
async def test_can_ping_backend(mkdi_api_client_mocked: MkdiApiClient):
    assert await mkdi_api_client_mocked.ping() is not None


@pytest.mark.asyncio
async def test_can_authenticate(mkdi_api_client_mocked: MkdiApiClient):
    response = await mkdi_api_client_mocked.authenticate("thierno", "thierno")
    assert response is not None
    assert response["access_token"] is not None
