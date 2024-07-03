import json
from datetime import datetime
from http import HTTPStatus

import fastapi
from loguru import logger
from mkdi_backend.api.v1.api import api_router
from mkdi_backend.config import settings
from mkdi_backend.utils.lifespan import lifespan
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as protocol_schema
from mkdi_shared.utils import utcnow

app = fastapi.FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)
startup_time: datetime = utcnow()


def get_openapi_schema():
    return json.dumps(app.openapi())


def save_schema():
    """save the openapi schema to a file"""
    with open("openapi.json", "w", encoding="utf-8") as f:
        f.write(get_openapi_schema())
        logger.info("Schema saved to openapi.json")


app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(MkdiError)
async def mkdi_exception_handler(request: fastapi.Request, ex: MkdiError):
    logger.error(f"{request.method} {request.url} failed: {repr(ex)}")

    return fastapi.responses.JSONResponse(
        status_code=int(ex.http_status_code),
        content=protocol_schema.MkdiErrorResponse(
            message=ex.message,
            error_code=MkdiErrorCode(ex.error_code),
        ).dict(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: fastapi.Request, ex: Exception):
    """unhandled exception handler"""
    logger.exception(f"{request.method} {request.url} failed [UNHANDLED]: {repr(ex)}")
    status = HTTPStatus.INTERNAL_SERVER_ERROR
    return fastapi.responses.JSONResponse(
        status_code=status.value,
        content={"message": status.name, "error_code": MkdiErrorCode.GENERIC_ERROR},
    )


def main():
    import argparse

    import uvicorn

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--print-openapi-schema",
        default=False,
        help="Dumps the openapi schema to stdout",
        action="store_true",
    )
    parser.add_argument("--host", help="The host to run the server", default="0.0.0.0")
    parser.add_argument("--port", help="The port to run the server", default=80)

    args = parser.parse_args()
    if args.print_openapi_schema:
        print(get_openapi_schema())

    if not (args.print_openapi_schema):
        logger.info("Reruning again...")
        save_schema()
        uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
