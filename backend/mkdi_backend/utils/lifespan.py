from alembic import command as a_command,config as a_config
from fastapi import FastAPI
from contextlib import asynccontextmanager
from mkdi_backend.database import engine
from sqlmodel import Session
from loguru import logger
from mkdi_backend.config import settings
from pathlib import Path


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
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = Session(engine)
    await alembic_upgrade()
    # run alembic upgrade
    yield
    logger.info("Closing database connection")
    app.state.db.close()