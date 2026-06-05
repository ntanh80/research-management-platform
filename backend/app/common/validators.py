import re
from typing import Optional


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    pattern = r"^\+?[0-9]{7,15}$"
    return bool(re.match(pattern, phone))


def validate_doi(doi: str) -> bool:
    pattern = r"^10\.\d{4,}/[-._;()/:a-zA-Z0-9]+$"
    return bool(re.match(pattern, doi))


def validate_orcid(orcid: str) -> bool:
    pattern = r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$"
    return bool(re.match(pattern, orcid))


def validate_password_strength(password: str) -> tuple:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    return True, None
