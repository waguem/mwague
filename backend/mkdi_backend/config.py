from typing import Any, Dict, List, Optional

from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "minkadi backend"
    API_V1_STR: str = "/api/v1"
    OFFICIAL_WEB_API_KEY: str = "1234"

    # Encryption fields for handling the web generated JSON Web Tokens.
    # These fields need to be shared with the web's auth settings in order to
    # correctly decrypt the web tokens.
    AUTH_INFO: bytes = b"NextAuth.js Generated Encryption Key"
    AUTH_SALT: bytes = b""
    AUTH_LENGTH: int = 32
    AUTH_SECRET: bytes = b"tyqABZo4LDtM27Y4j5x1XFmgcyHdmsNQlJ2IhXM+XsI="
    AUTH_COOKIE_NAME: str = "next-auth.session-token"
    AUTH_ALGORITHM: str = "HS256"
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "postgres"
    DATABASE_URI: Optional[PostgresDsn] = None
    DATABASE_MAX_TX_RETRY_COUNT: int = 3

    DATABASE_POOL_SIZE = 75
    DATABASE_MAX_OVERFLOW = 20

    RATE_LIMIT: bool = True
    MESSAGE_SIZE_LIMIT: int = 2000
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"

    DEBUG_DATABASE_ECHO: bool = False
    DEBUG_IGNORE_TOS_ACCEPTANCE: bool = (  # ignore whether users accepted the ToS
        True  # TODO: set False after ToS acceptance UI was added to web-frontend
    )

    ROOT_TOKENS: List[str] = ["1234"]  # supply a string that can be parsed to a json list

    @validator("DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_HOST"),
            port=values.get("POSTGRES_PORT"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )

    BACKEND_CORS_ORIGINS_CSV: Optional[str]  # allow setting CORS origins as comma separated values
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Optional[List[str]], values: Dict[str, Any]) -> List[str]:
        s = values.get("BACKEND_CORS_ORIGINS_CSV")
        if isinstance(s, str):
            v = [i.strip() for i in s.split(",")]
            return v
        return v

    UPDATE_ALEMBIC: bool = True

    CACHED_STATS_UPDATE_INTERVAL: int = 60  # minutes

    RATE_LIMIT_TASK_USER_TIMES: int = 30
    RATE_LIMIT_TASK_USER_MINUTES: int = 4
    RATE_LIMIT_TASK_API_TIMES: int = 10_000
    RATE_LIMIT_TASK_API_MINUTES: int = 1

    RATE_LIMIT_ASSISTANT_USER_TIMES: int = 4
    RATE_LIMIT_ASSISTANT_USER_MINUTES: int = 2

    RATE_LIMIT_PROMPTER_USER_TIMES: int = 8
    RATE_LIMIT_PROMPTER_USER_MINUTES: int = 2

    TASK_VALIDITY_MINUTES: int = 60 * 24 * 2  # tasks expire after 2 days

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        env_nested_delimiter = "__"


settings = Settings()