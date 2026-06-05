from app.common.validators import (
    validate_email,
    validate_phone,
    validate_doi,
    validate_orcid,
)


class TestValidateEmail:
    def test_valid_email(self):
        assert validate_email("user@example.com")
        assert validate_email("user.name@domain.vn")

    def test_invalid_email(self):
        assert not validate_email("not-an-email")
        assert not validate_email("")
        assert not validate_email("@domain.com")


class TestValidatePhone:
    def test_valid_phone(self):
        assert validate_phone("0123456789")
        assert validate_phone("+84123456789")

    def test_invalid_phone(self):
        assert not validate_phone("abc")
        assert not validate_phone("123")


class TestValidateDOI:
    def test_valid_doi(self):
        assert validate_doi("10.1234/abcdef")
        assert validate_doi("10.1000/issn.1234-5678")

    def test_invalid_doi(self):
        assert not validate_doi("not-a-doi")
        assert not validate_doi("")


class TestValidateORCID:
    def test_valid_orcid(self):
        assert validate_orcid("0000-0001-2345-6789")
        assert validate_orcid("0000-0002-3456-789X")

    def test_invalid_orcid(self):
        assert not validate_orcid("1234-5678")
        assert not validate_orcid("")
