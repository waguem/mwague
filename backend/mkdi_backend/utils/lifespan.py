import json
from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command as a_command
from alembic import config as a_config
from fastapi import FastAPI
from loguru import logger
from mkdi_backend.config import settings
from mkdi_backend.database import engine
from sqlmodel import Session
import asyncio
from datetime import datetime, timedelta
from mkdi_backend.repositories.report_repo import ReportRepository


async def create_account_report():
    while True:
        logger.info("Running periodic task")
        # get the db session
        with Session(engine) as session:
            report_repo = ReportRepository(session)
            report_repo.start_reports()

        await asyncio.sleep(settings.TASK_CREATE_REPORTS_INTERVAL * 60)


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

    # start the cron job
    task = asyncio.create_task(create_account_report())

    yield

    task.cancel()
    # wait for the task to finish
    await task

    logger.info("Closing database connection")
    app.state.db.close()
