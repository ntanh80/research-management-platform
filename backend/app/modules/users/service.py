from sqlalchemy.orm import Session
from app.models.user import User
from app.modules.users.repository import (
    get_user_by_id,
    get_user_by_username,
    get_user_by_email,
    create_user as repo_create,
    update_user as repo_update,
)
from app.core.security import hash_password, verify_password
from app.core.exceptions import (
    NotFoundException,
    DuplicateException,
    BusinessRuleException,
    ValidationException,
)
from app.common.validators import validate_email, validate_password_strength


def create_user(db: Session, user_data: dict) -> User:
    if get_user_by_username(db, user_data["username"]):
        raise DuplicateException("User", "username", user_data["username"])
    if get_user_by_email(db, user_data["email"]):
        raise DuplicateException("User", "email", user_data["email"])
    valid, msg = validate_password_strength(user_data["password"])
    if not valid:
        raise ValidationException(msg)
    user_data["hashed_password"] = hash_password(user_data.pop("password"))
    return repo_create(db, user_data)


def update_user(db: Session, user_id: int, update_data: dict) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User", user_id)
    if "email" in update_data and update_data["email"] != user.email:
        if get_user_by_email(db, update_data["email"]):
            raise DuplicateException("User", "email", update_data["email"])
    return repo_update(db, user, update_data)


def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User", user_id)
    user.soft_delete()
    db.commit()


def reset_password(db: Session, user_id: int, new_password: str):
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User", user_id)
    valid, msg = validate_password_strength(new_password)
    if not valid:
        raise ValidationException(msg)
    user.hashed_password = hash_password(new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()


def unlock_account(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User", user_id)
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()


def change_password(
    db: Session, user_id: int, current_password: str, new_password: str
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User", user_id)
    if not verify_password(current_password, user.hashed_password):
        raise BusinessRuleException("Current password is incorrect")
    valid, msg = validate_password_strength(new_password)
    if not valid:
        raise ValidationException(msg)
    from datetime import datetime, timezone
    user.hashed_password = hash_password(new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    db.commit()
