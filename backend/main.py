import json
from datetime import datetime
from http import HTTPStatus
from pathlib import Path

import alembic.command
import alembic.config
import fastapi
from loguru import logger
from mkdi_backend.api.deps import api_auth, create_api_client
from mkdi_backend.api.v1.api import api_router
from mkdi_backend.config import settings
from mkdi_backend.database import engine
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as protocol_schema
from mkdi_shared.utils import utcnow
from sqlmodel import Session

app = fastapi.FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)
startup_time: datetime = utcnow()


def get_openapi_schema():
    return json.dumps(app.openapi())


app.include_router(api_router, prefix=settings.API_V1_STR)


if settings.UPDATE_ALEMBIC:

    @app.on_event("startup")
    def alembic_upgrade():
        logger.info("Attempting to upgrade alembic on startup")
        try:
            alembic_ini_path = Path(__file__).parent / "alembic.ini"
            alembic_cfg = alembic.config.Config(str(alembic_ini_path))
            alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URI)
            alembic.command.upgrade(alembic_cfg, "head")
            logger.info("Successfully upgraded alembic on startup")
        except Exception as e:
            logger.exception("Alembic upgrade failed on startup")
            logger.exception(e)


if settings.OFFICIAL_WEB_API_KEY:

    @app.on_event("startup")
    def create_official_web_api_client():
        with Session(engine) as session:
            try:
                api_auth(settings.OFFICIAL_WEB_API_KEY, db=session)
            except:
                logger.info("Creating official web api client")
                create_api_client(
                    session=session,
                    api_key=settings.OFFICIAL_WEB_API_KEY,
                    description="The Official web client for mkdi backend",
                    frontend_type="web",
                    trusted=True,
                )


if settings.DEBUG_USE_SEED_DATA:
    logger.info("Seeding database with debug data")

    @app.on_event("startup")
    def seed_data():
        from mkdi_backend.utils.seed import create_seed_data

        create_seed_data()
        logger.info("Seeded database with debug data")


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
    parser.add_argument("--port", help="The port to run the server", default=8080)

    args = parser.parse_args()
    if args.print_openapi_schema:
        print(get_openapi_schema())

    if not (args.print_openapi_schema):
        uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
