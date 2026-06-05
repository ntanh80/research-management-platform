from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.user_role import UserRole
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.core.exceptions import (
    UnauthorizedException,
    AccountLockedException,
)


def authenticate_user(db: Session, username: str, password: str) -> dict:
    user = (
        db.query(User)
        .filter(User.username == username, User.deleted_at.is_(None))
        .first()
    )
    if not user:
        raise UnauthorizedException("Invalid username or password")

    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        minutes_left = (
            int(
                (user.locked_until - datetime.now(timezone.utc)).total_seconds()
                / 60
            )
            + 1
        )
        raise AccountLockedException(minutes_left)

    if not verify_password(password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= settings.ACCOUNT_LOCKOUT_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=settings.ACCOUNT_LOCKOUT_MINUTES
            )
            db.commit()
            raise AccountLockedException(settings.ACCOUNT_LOCKOUT_MINUTES)
        db.commit()
        raise UnauthorizedException("Invalid username or password")

    if not user.is_active:
        raise UnauthorizedException("Account is deactivated")

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token_data = {"sub": user.id, "username": user.username}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
        },
    }


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid or expired refresh token")

    user_id = payload.get("sub")
    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.deleted_at.is_(None),
            User.is_active == True,
        )
        .first()
    )
    if not user:
        raise UnauthorizedException("User not found")

    token_data = {"sub": user.id, "username": user.username}
    access_token = create_access_token(token_data)
    return {"access_token": access_token}


def get_current_user(db: Session, user_id: int) -> dict:
    user = (
        db.query(User)
        .filter(User.id == user_id, User.deleted_at.is_(None))
        .first()
    )
    if not user:
        raise UnauthorizedException("User not found")

    user_roles = db.query(UserRole).filter(UserRole.user_id == user.id).all()
    role_ids = [ur.role_id for ur in user_roles]
    roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
    role_permissions = (
        db.query(RolePermission)
        .filter(RolePermission.role_id.in_(role_ids))
        .all()
    )
    permission_ids = [rp.permission_id for rp in role_permissions]
    permissions = (
        db.query(Permission).filter(Permission.id.in_(permission_ids)).all()
    )

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
        },
        "roles": [r.code for r in roles],
        "permissions": [p.code for p in permissions],
    }
