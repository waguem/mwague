import json
from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command as a_command
from alembic import config as a_config
from fastapi import FastAPI
from loguru import logger
from mkdi_backend.authproviders import KeycloakAdminHelper
from mkdi_backend.config import settings
from mkdi_backend.database import engine
from mkdi_backend.utils.seed import create_seed_data
from sqlmodel import Session


async def alembic_upgrade():
    logger.info("Attempting to upgrade alembic on startup")
    try:
        alembic_ini_path = Path(__file__).parent.parent.parent / "alembic.ini"
        logger.info(f"alembic.ini path: {alembic_ini_path}")
        alembic_cfg = a_config.Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URI)
        a_command.upgrade(alembic_cfg, "head")
        logger.info("Successfully upgraded alembic on startup")
    except Exception as e:
        logger.exception("Alembic upgrade failed on startup")
        logger.exception(e)


def save_schema(app: FastAPI):
    """save the openapi schema to a file"""
    with open("openapi.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(app.openapi()))
        logger.info("Schema saved to openapi.json")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = Session(engine)
    # run alembic upgrade
    await alembic_upgrade()
    save_schema(app)
    # seed database
    yield

    logger.info("Closing database connection")
    app.state.db.close()
