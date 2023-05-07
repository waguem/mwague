import json

from loguru import logger
from mkdi_backend.api.deps import api_auth, get_db
from mkdi_backend.config import settings
from mkdi_backend.database import engine
from mkdi_backend.repositories import user as user_repo
from mkdi_shared.schemas import protocol
from sqlmodel import Session


def create_seed_data():
    """
    Seed the database with data from the DEBUG_USE_SEED_DATA_PATH setting
    this will work only if the DEBUG_USE_SEED_DATA setting is set to True
    and the ENV setting is not set to production

    Raises:
        ValueError: Error
    """
    if not settings.ENV != "production":
        logger.critical("Cannot use seed data in production")
        raise ValueError("Cannot use seed data in production")
    if not settings.OFFICIAL_WEB_API_KEY:
        raise ValueError("Cannot use seed data without OFFICIAL_WEB_API_KEY set")
    with Session(engine) as session:
        api_auth(settings.OFFICIAL_WEB_API_KEY, db=session)
        logger.info("Creating seed data")
        repo = user_repo.UserRepository(session)
        with open(settings.DEBUG_USE_SEED_DATA_PATH, encoding="UTF-8") as seed_file:
            data = json.load(seed_file)
        users = [protocol.CreateFrontendUserRequest(**user) for user in data["users"]]
        for user in users:
            try:
                repo.create_local_user(user)
            except Exception as error:
                logger.error(f"Failed to create user {user.username}")
                logger.error(repr(error))
            finally:
                logger.info(f"Created user {user.username}")
