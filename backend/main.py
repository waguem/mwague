import json
from datetime import datetime
from pathlib import Path

import alembic.command
import alembic.config
import fastapi
from loguru import logger
from mkdi_backend.api.v1.api import api_router
from mkdi_backend.config import settings
from mkdi_shared.utils import utcnow

app = fastapi.FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")
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
