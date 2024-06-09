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
        self.roles = []

    def get_realm_roles(self):
        if len(self.roles) == 0:
            self.roles = self.keycloak_helper.get_kc_admin().get_realm_roles()

        return [role["name"] for role in self.roles]

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

    def update_user_roles(self, account_id, roles) -> list[str]:
        kc_admin = self.keycloak_helper.get_kc_admin()
        # filter self.roles by roles

        assinged_roles = list(
            filter(lambda role: any([r for r in roles if role["name"].startswith(r)]), self.roles)
        )  # remove roles that are not in roles
        roles_to_remove = list()
        for role in self.roles:
            for r in roles:
                if not role["name"].startswith(r) and role["name"] in self.get_roles():
                    roles_to_remove.append(role)

        list(
            filter(
                lambda role: any([r for r in roles if not role["name"].startswith(r)]), self.roles
            )
        )
        kc_admin.delete_realm_roles_of_user(account_id, roles_to_remove)
        kc_admin.assign_realm_roles(account_id, assinged_roles)
        return [role["name"] for role in assinged_roles]
