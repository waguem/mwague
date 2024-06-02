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
