from keycloak import KeycloakOpenID
from mkdi_backend.config import settings


# This actually does the auth checks
# client_secret_key is not mandatory if the client is public on keycloak
keycloak_openid = KeycloakOpenID(
    server_url=settings.KC_SERVER_URL, # https://sso.example.com/auth/
    client_id=settings.KC_CLIENT_ID, # backend-client-id
    realm_name=settings.KC_REALM, # example-realm
    client_secret_key=settings.KC_CLIENT_SECRET, # your backend client secret
    verify= settings.ENV == "production" and settings.KC_VERIFY_CERTS, # True if not in development
)
