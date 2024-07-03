"""OIDC helper functions."""

from keycloak import KeycloakOpenID, KeycloakAdmin
from tests.tools.types import KcUser
from loguru import logger
from tests.tools.config import config

oidc = KeycloakOpenID(
    server_url=config.KC_URL,
    client_id=config.KC_CLIENT_ID,
    realm_name=config.KC_REALM,
    client_secret_key=config.KC_SECRET_KEY,
)

oidc_admin = KeycloakAdmin(
    server_url=config.KC_URL,
    username=config.KC_CLI_USER,
    password=config.KC_CLI_PASS,
    realm_name=config.KC_REALM,
    verify=False,
)


def disconnect():
    """disconnect the admin user."""
    admin_id = oidc_admin.get_user_id("kcadmincli")
    oidc_admin.user_logout(admin_id)


def cleanup_users():
    """should clean up all users except kcadmincli."""
    users = oidc_admin.get_users()
    for user in users:
        if "username" in user and user.get("username") != "kcadmincli":
            oidc_admin.delete_user(user.get("id"))


def decode_access_token(access_token: str) -> KcUser:
    """decode the access token."""
    payload = oidc.decode_token(access_token)
    return KcUser(
        id=payload.get("sub"),
        username=payload.get("preferred_username"),
        email=payload.get("email"),
        first_name=payload.get("given_name"),
        last_name=payload.get("family_name"),
        roles=payload.get("realm_access", {}).get("roles", []),
        office_id=payload.get("officeId"),
        organization_id=payload.get("organizationId"),
    )


def get_access_token(username: str, password: str):
    """get access token for the user amadou."""
    return oidc.token(username=username, password=password)


def clear_sessions(user_id: str):
    oidc_admin.user_logout(user_id=user_id)


def create_user(
    *,
    username: str,
    password: str,
    email: str,
    org_id: str,
    office_id: str,
    enabled: bool = True,
    email_verified: bool = True,
    temporary: bool = False,
) -> str:
    """create a user."""

    return oidc_admin.create_user(
        payload={
            "username": username,
            "email": email,
            "enabled": enabled,
            "emailVerified": email_verified,
            "credentials": [{"type": "password", "value": password, "temporary": temporary}],
            "attributes": {"organizationId": org_id, "officeId": office_id},
        }
    )


def fully_setup_account(*, username: str, first_name: str = "", last_name: str = ""):
    """create a user and get the access token."""
    user_id = oidc_admin.get_user_id(username)
    user = oidc_admin.get_user(user_id)
    user["attributes"]["firstName"] = first_name
    user["attributes"]["lastName"] = last_name
    user["requiredActions"] = []
    oidc_admin.update_user(user_id, payload=user)
