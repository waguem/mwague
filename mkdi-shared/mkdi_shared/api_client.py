from typing import Any, Optional, Type

import aiohttp
from loguru import logger
from mkdi_shared.exceptions.mkdi_api_error import HTTPStatus, MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as protocol_schema
from pydantic import ValidationError


class MkdiApiClient:
    def __init__(
        self,
        backend_url: str,
        api_key: str,
        session: Optional[aiohttp.ClientSession] = None,
    ):
        """Create a new MkdiApiClient.

        Args:
        ----
            backend_url (str): The base backend URL.
            api_key (str): The API key to use for authentication.
        """
        if session is None:
            session = aiohttp.ClientSession()

        self.session = session
        self.backend_url = backend_url
        self.api_key = api_key
        return None

    async def _init_session(self):
        logger.debug("Opening OasstApiClient session")
        async with aiohttp.ClientSession() as session:
            self.session = session

    async def ping(self):
        logger.debug("PING the backend server")
        response = await self.session.get(f"{self.backend_url}/api/v1/ping")
        logger.debug(f"response: {response}")
        if response.status >= 300:
            text = await response.text()
            logger.debug(f"resp text: {text}")
            data = await response.json()
            try:
                mkdi_error = protocol_schema.MkdiErrorResponse()
                raise MkdiError(
                    error_code=mkdi_error.error_code,
                    message=mkdi_error.message,
                )
            except ValidationError as e:
                logger.debug(f"Got error from API but could not parse: {e}")

                raw_response = await response.text()
                logger.debug(f"Raw response: {raw_response}")

                raise MkdiError(
                    raw_response,
                    MkdiErrorCode.GENERIC_ERROR,
                    HTTPStatus(response.status),
                )
        if response.status == 204:
            return None
        return await response.json()

    async def post(self, path: str, data: dict[str, Any]) -> Optional[dict[str, Any]]:
        """Make a POST request to the backend."""
        logger.debug(f"POST {self.backend_url}{path} DATA: {data}")
        response = await self.session.post(f"{self.backend_url}{path}", json=data, headers={"x-api-key": self.api_key})
        logger.debug(f"response: {response}")

        # If the response is not a 2XX, check to see
        # if the json has the fields to create an
        # MkdiError.
        if response.status >= 300:
            text = await response.text()
            logger.debug(f"resp text: {text}")
            data = await response.json()
            try:
                mkdi_error = protocol_schema.MkdiErrorResponse(**(data or {}))
                raise MkdiError(
                    error_code=mkdi_error.error_code,
                    message=mkdi_error.message,
                )
            except ValidationError as e:
                logger.debug(f"Got error from API but could not parse: {e}")

                raw_response = await response.text()
                logger.debug(f"Raw response: {raw_response}")

                raise MkdiError(
                    raw_response,
                    MkdiErrorCode.GENERIC_ERROR,
                    HTTPStatus(response.status),
                )

        if response.status == 204:
            # No content
            return None
        return await response.json()

    async def close(self):
        logger.debug("Closing MkdiApi client session")
        await self.session.close()
