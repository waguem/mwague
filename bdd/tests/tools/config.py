from pydantic_settings import BaseSettings


class Config(BaseSettings):
    API_URL: str = "http://backend:8080"
    DATABASE_URI: str = "postgresql://postgres:postgres@backenddb:5432/postgres"
    KC_URL: str = "http://keycloak:8443/auth/"
    KC_CLIENT_ID: str = "rns:mwague:portal"
    KC_REALM: str = "mwague"
    KC_SECRET_KEY: str = "nZmLx40sO6x14lQ1vSCe1e9gH8VfEZAY"
    KC_CLI_USER: str = "kcadmincli"
    KC_CLI_PASS: str = "mwague"


config = Config()
