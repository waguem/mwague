import functools

from keycloak import KeycloakAdmin, KeycloakOpenID
from keycloak.exceptions import KeycloakAuthenticationError
from loguru import logger
from mkdi_backend.config import settings
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.roles import Role
from mkdi_shared.schemas import protocol

# This actually does the auth checks
# client_secret_key is not mandatory if the client is public on keycloak
keycloak_openid = KeycloakOpenID(
    server_url=settings.KC_SERVER_URL,  # https://sso.example.com/auth/
    client_id=settings.KC_CLIENT_ID,  # backend-client-id
    realm_name=settings.KC_REALM,  # example-realm
    client_secret_key=settings.KC_CLIENT_SECRET,  # your backend client secret
    verify=settings.ENV == "production" and settings.KC_VERIFY_CERTS,  # True if not in development
)


def refresh_keycloak_token(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        try:
            print("Trying to get users")
            return func(self, *args, **kwargs)
        except KeycloakAuthenticationError:
            print("Refreshing keycloak token")
            self.get_kc_admin()
            return func(self, *args, **kwargs)

    return wrapper


class KeycloakAdminHelper:
    def __init__(self):
        self._kc_admin = None

    def _init_kc_conn(self):
        logger.info(f"{settings.KC_ADMIN_CLIENT_ID}")
        logger.info(f"{settings.KC_ADMIN_USER}")

        logger.info(f"{settings.KC_SERVER_URL}")
        self._kc_admin = KeycloakAdmin(
            server_url=settings.KC_SERVER_URL,
            username=settings.KC_ADMIN_USER,
            password=settings.KC_ADMIN_PASSWORD,
            client_id=settings.KC_ADMIN_CLIENT_ID,
            realm_name=settings.KC_REALM,
            verify=settings.ENV == "production" and settings.KC_VERIFY_CERTS,
        )

    def update_user(self, *, user_id: str, data: dict):
        out = self.get_kc_admin().update_user(user_id, data)
        return out

    def create_user(
        self, *, auth_user: KcUser, usr_input: protocol.CreateEmployeeRequest, office_id: str
    ):
        data = {
            "username": usr_input.username,
            "email": usr_input.email,
            "enabled": True,
            "emailVerified": True,
            "credentials": [{"type": "password", "value": usr_input.password, "temporary": True}],
            "attributes": {
                "organizationId": auth_user.organization_id,
                "officeId": office_id,
                "email": usr_input.email,
            },
        }
        user_id = None
        user_id = self.get_kc_admin().create_user(data)
        return user_id

    def get_kc_admin(self):
        if self._kc_admin is None:
            self._init_kc_conn()
        return self._kc_admin


class RoleProvider:
    filter_roles = ["offline_access", "uma_authorization", "default-roles-mwague"]

    def __init__(self, helper=None):
        self.keycloak_helper = KeycloakAdminHelper() if not helper else helper
        self.realm_roles = []
        self.roles = []

        self.get_roles()

    def get_roles(self) -> list[Role]:
        if len(self.realm_roles) == 0:
            self.roles = list()
            self.realm_roles = self.keycloak_helper.get_kc_admin().get_realm_roles()

            for r in self.realm_roles:
                r_with_attr = self._get_role(role_name=r["name"])

                if (
                    "weight" in r_with_attr["attributes"]
                    and len(r_with_attr["attributes"]["weight"]) == 1
                ):
                    self.roles.append(Role.from_number(int(r_with_attr["attributes"]["weight"][0])))

        return self.roles

    def _get_role(self, role_name):
        return self.keycloak_helper.get_kc_admin().get_realm_role(role_name=role_name)

    def update_user_roles(self, account_id: str, roles: list[str]) -> list[str]:
        kc_admin = self.keycloak_helper.get_kc_admin()
        # filter self.roles by roles

        roles_to_remove = list()
        assigned_roles = list()

        for r in self.realm_roles:
            if not r["name"] in roles:
                roles_to_remove.append(r)
            elif Role.is_valid(r["name"]):
                assigned_roles.append(r)

        if len(assigned_roles) == 0:
            return []

        kc_admin.delete_realm_roles_of_user(account_id, roles_to_remove)
        kc_admin.assign_realm_roles(account_id, assigned_roles)
        return [role["name"] for role in assigned_roles]
