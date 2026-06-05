class TestAuthLogin:
    def test_login_success(self, client, db):
        from app.models.user import User
        from app.core.security import hash_password
        user = User(username="testuser", email="test@test.com", hashed_password=hash_password("Test1234"), full_name="Test User", is_active=True)
        db.add(user); db.commit()

        response = client.post("/api/v1/auth/login", json={"username": "testuser", "password": "Test1234"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
        assert data["data"]["user"]["username"] == "testuser"

    def test_login_wrong_password(self, client, db):
        from app.models.user import User
        from app.core.security import hash_password
        user = User(username="testuser2", email="test2@test.com", hashed_password=hash_password("Test1234"), full_name="Test User", is_active=True)
        db.add(user); db.commit()

        response = client.post("/api/v1/auth/login", json={"username": "testuser2", "password": "WrongPassword1"})
        assert response.status_code == 401

    def test_login_inactive_user(self, client, db):
        from app.models.user import User
        from app.core.security import hash_password
        user = User(username="inactive", email="inactive@test.com", hashed_password=hash_password("Test1234"), full_name="Inactive", is_active=False)
        db.add(user); db.commit()

        response = client.post("/api/v1/auth/login", json={"username": "inactive", "password": "Test1234"})
        assert response.status_code == 401


class TestAuthMe:
    def test_me_with_valid_token(self, client, admin_headers):
        response = client.get("/api/v1/auth/me", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["user"]["username"] == "admin"

    def test_me_without_token(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_my_permissions(self, client, admin_headers):
        response = client.get("/api/v1/auth/my-permissions", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "permissions" in data["data"]
