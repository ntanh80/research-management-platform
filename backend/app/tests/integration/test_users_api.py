class TestUsersCRUD:
    def test_list_users(self, client, admin_headers):
        response = client.get("/api/v1/users", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "pagination" in data

    def test_create_user(self, client, admin_headers):
        response = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "newuser", "email": "new@test.com",
            "password": "Test1234", "full_name": "New User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "newuser"

    def test_create_duplicate_username(self, client, admin_headers):
        client.post("/api/v1/users", headers=admin_headers, json={
            "username": "dupuser", "email": "dup1@test.com",
            "password": "Test1234", "full_name": "Dup User"
        })
        response = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "dupuser", "email": "dup2@test.com",
            "password": "Test1234", "full_name": "Dup User 2"
        })
        assert response.status_code == 409

    def test_get_user(self, client, admin_headers):
        create_resp = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "getuser", "email": "get@test.com",
            "password": "Test1234", "full_name": "Get User"
        })
        user_id = create_resp.json()["data"]["id"]

        response = client.get(f"/api/v1/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["data"]["username"] == "getuser"

    def test_update_user(self, client, admin_headers):
        create_resp = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "updateuser", "email": "update@test.com",
            "password": "Test1234", "full_name": "Update User"
        })
        user_id = create_resp.json()["data"]["id"]

        response = client.put(f"/api/v1/users/{user_id}", headers=admin_headers, json={"full_name": "Updated Name"})
        assert response.status_code == 200
        assert response.json()["data"]["full_name"] == "Updated Name"

    def test_delete_user(self, client, admin_headers):
        create_resp = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "deleteuser", "email": "delete@test.com",
            "password": "Test1234", "full_name": "Delete User"
        })
        user_id = create_resp.json()["data"]["id"]

        response = client.delete(f"/api/v1/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200

        # Verify soft deleted
        get_resp = client.get(f"/api/v1/users/{user_id}", headers=admin_headers)
        assert get_resp.status_code == 404

    def test_reset_password(self, client, admin_headers):
        create_resp = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "pwuser", "email": "pw@test.com",
            "password": "Test1234", "full_name": "PW User"
        })
        user_id = create_resp.json()["data"]["id"]

        response = client.post(f"/api/v1/users/{user_id}/reset-password", headers=admin_headers, json={"new_password": "NewPass1"})
        assert response.status_code == 200

    def test_unlock_user(self, client, admin_headers):
        create_resp = client.post("/api/v1/users", headers=admin_headers, json={
            "username": "lockuser", "email": "lock@test.com",
            "password": "Test1234", "full_name": "Lock User"
        })
        user_id = create_resp.json()["data"]["id"]

        response = client.post(f"/api/v1/users/{user_id}/unlock", headers=admin_headers)
        assert response.status_code == 200
