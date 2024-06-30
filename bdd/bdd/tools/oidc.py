"""OIDC helper functions."""

from keycloak import KeycloakOpenID, KeycloakAdmin
from bdd.tools.types import KcUser

oidc = KeycloakOpenID(
    server_url="http://localhost.auth.com:8443/auth/",
    client_id="rns:mwague:portal",
    realm_name="mwague",
    client_secret_key="nZmLx40sO6x14lQ1vSCe1e9gH8VfEZAY",
)

oidc_admin = KeycloakAdmin(
    server_url="http://localhost.auth.com:8443/auth/",
    username="kcadmincli",
    password="mwague",
    realm_name="mwague",
    verify=False,
)


def disconnect():
    """disconnect the admin user."""
    admin_id = oidc_admin.get_user_id("kcadmincli")
    oidc_admin.user_logout(admin_id)


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
