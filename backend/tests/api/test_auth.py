from .client import client

token = ""


def test_create_api_client():
    response = client.post(
        "/api/v1/auth/api_client",
        json={
            "description": "description",
            "trusted": False,
            "frontend_type": "type",
            "admin_email": "admin@gmail.com",
        },
    )
    assert response.status_code == 200
    assert response.json() is not None


def test_login_for_access_token():
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "Alice", "password": "Alice"},
    )
    assert response.status_code == 200
    response = response.json()
    assert response["access_token"] is not None
    assert response["token_type"] == "bearer"
    token = response["access_token"]
    response = client.get(
        f"/api/v1/auth/check?token={token}",
        # headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json() == "alice@gmail.com"


def test_login_for_access_token_fail():
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "Alice", "password": "aliceeeee"},
    )
    assert response.status_code == 401
    response = response.json()
    assert response == {"error_code": 600, "message": "Incorrect username or password"}
