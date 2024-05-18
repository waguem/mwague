from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import AnyHttpUrl, BaseSettings, FilePath, PostgresDsn, validator


class Settings(BaseSettings):
    ENV: str = "production"
    PROJECT_NAME: str = "minkadi backend"
    API_V1_STR: str = "/api/v1"
    OFFICIAL_WEB_API_KEY: str = "755b9e02daafdc25deb5a3ad0ae865b532cab53027f90acf6e1fd453f73a84fa"

    # Encryption fields for handling the web generated JSON Web Tokens.
    # These fields need to be shared with the web's auth settings in order to
    # correctly decrypt the web tokens.
    AUTH_INFO: bytes = b"NextAuth.js Generated Encryption Key"
    AUTH_SALT: bytes = b"ea01136f23b4acbe"
    # the length of the encrypted token in bytes
    AUTH_LENGTH: int = 32
    # this key is used for key derivation and token creation
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
    #KEYCLOAK configuration
    KC_SERVER_URL="https://localhost.auth.com:8443/auth/"
    KC_REALM="mwague"
    KC_CLIENT_ID="rns:mwague:portal"
    KC_CLIENT_SECRET="bmdsVvDMsh1CJ91SDaXGXTZc0DFp1Ufi"
    KC_AUTHORIZATION_URL=f"https://localhost.auth.com:8443/auth/realms/mwague/protocol/openid-connect/auth"
    KC_TOKEN_URL="https://localhost.auth.com:8443/auth/realms/mwague/protocol/openid-connect/token"
    KC_VERIFY_CERTS=False

    DATABASE_POOL_SIZE = 75
    DATABASE_MAX_OVERFLOW = 20

    RATE_LIMIT: bool = True
    MESSAGE_SIZE_LIMIT: int = 2000
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"

    DEBUG_USE_SEED_DATA: bool = False
    DEBUG_USE_SEED_DATA_PATH: Optional[FilePath] = (
        Path(__file__).parent.parent / "test_data/seed.json"
    )
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
