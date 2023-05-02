from typing import Any, Optional, Type
from urllib.parse import urlencode

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
        self.backend_url = backend_url
        self.api_key = api_key
        self.bearer_token = ""
        return None

    async def authenticate(
        self, username, password, grant_type: str = "", scope: str = "", client_id: str = "", client_secret: str = ""
    ):
        logger.debug("authenticate api client")
        credentials = {
            "username": username,
            "password": password,
            "grant_type": grant_type,
            "scope": scope,
            "client_id": client_id,
            "client_secret": client_secret,
        }
        # data=urlencode(credentials,encoding="utf-8")
        logger.debug(f"credentials: {credentials}")
        async with aiohttp.ClientSession() as session:
            # Set the Content-Type header to application/x-www-form-urlencoded
            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            # Encode the data as a string in application/x-www-form-urlencoded format
            data_str = "&".join([f"{key}={value}" for key, value in credentials.items()])
            # Send a POST request with the data encoded as application/x-www-form-urlencoded
            async with session.post(
                f"{self.backend_url}/api/v1/auth/token", data=data_str, headers=headers
            ) as response:
                # Check the response
                logger.debug(f"authentication response: {response}")
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
                    return None
                response = await response.json()
                # save token
                self.bearer_token = response["access_token"]
                #
                logger.info(f"bearer token: {self.bearer_token}")
                return response

    async def ping(self):
        logger.debug("PING the backend server")
        async with aiohttp.ClientSession() as session:
            response = await session.get(f"{self.backend_url}/api/v1/ping")
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
        async with aiohttp.ClientSession() as session:
            response = await session.post(f"{self.backend_url}{path}", json=data, headers={"x-api-key": self.api_key})
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
