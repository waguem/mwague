import functools

from keycloak import KeycloakAdmin, KeycloakOpenID
from keycloak.exceptions import KeycloakAuthenticationError
from mkdi_backend.config import settings

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
        self._kc_admin = KeycloakAdmin(
            server_url=settings.KC_SERVER_URL,
            username=settings.KC_ADMIN_USER,
            password=settings.KC_ADMIN_PASSWORD,
            client_id=settings.KC_ADMIN_CLIENT_ID,
            realm_name=settings.KC_REALM,
            verify=settings.ENV == "production" and settings.KC_VERIFY_CERTS,
        )

    def get_kc_admin(self):
        if self._kc_admin is None:
            self._init_kc_conn()
        return self._kc_admin


class RoleProvider:
    filter_roles = ["offline_access", "uma_authorization", "default-roles-mwague"]

    def __init__(self):
        self.keycloak_helper = KeycloakAdminHelper()

    def get_realm_roles(self):
        roles_representation = self.keycloak_helper.get_kc_admin().get_realm_roles()
        return [role["name"] for role in roles_representation]

    def get_roles(self):
        realm_roles = self.get_realm_roles()
        # ["sofware_admin_0","office_admin_2","org_admin_1"]
        # sort filter realm_roles by filter_roles and then sort by the number at the end
        # the sort order is descending
        # ["sofware_admin_0","org_admin_1","office_admin_2"]
        return sorted(
            filter(lambda role: role not in self.filter_roles, realm_roles),
            key=lambda role: int(role.split("_")[-1]),
        )
