from pydantic import BaseModel


class AuthConfiguration(BaseModel):
    server_url: str
    realm: str
    client_id: str
    client_secret: str
    authorization_url: str
    token_url: str
