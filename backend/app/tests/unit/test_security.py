from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "Test1234"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_verify_wrong_password(self):
        hashed = hash_password("Test1234")
        assert not verify_password("WrongPassword1", hashed)

    def test_password_strength_valid(self):
        valid, msg = validate_password_strength("Test1234")
        assert valid
        assert msg is None

    def test_password_too_short(self):
        valid, msg = validate_password_strength("Ab1")
        assert not valid
        assert "8 characters" in msg

    def test_password_no_uppercase(self):
        valid, msg = validate_password_strength("test1234")
        assert not valid
        assert "uppercase" in msg

    def test_password_no_number(self):
        valid, msg = validate_password_strength("TestTest")
        assert not valid
        assert "number" in msg


class TestJWT:
    def test_access_token_create_and_decode(self):
        token = create_access_token({"sub": "1", "username": "admin"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "1"
        assert payload["type"] == "access"

    def test_refresh_token_create_and_decode(self):
        token = create_refresh_token({"sub": "1", "username": "admin"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_decode_invalid_token(self):
        payload = decode_token("invalid.token.here")
        assert payload is None

    def test_token_type_is_access(self):
        token = create_access_token({"sub": "1"})
        payload = decode_token(token)
        assert payload["type"] == "access"
