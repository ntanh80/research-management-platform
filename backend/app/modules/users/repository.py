from sqlalchemy.orm import Session
from app.models.user import User
from app.common.pagination import PaginationParams
from app.common.query_builder import (
    apply_search,
    apply_sorting,
    apply_pagination,
    apply_soft_delete_filter,
)


def get_users(db: Session, filters, pagination: PaginationParams):
    query = db.query(User)
    query = apply_soft_delete_filter(query, User)
    if filters.keyword:
        query = apply_search(
            query,
            User,
            filters.keyword,
            ["username", "email", "full_name"],
        )
    if filters.department_id:
        query = query.filter(User.department_id == filters.department_id)
    if filters.is_active is not None:
        query = query.filter(User.is_active == filters.is_active)
    total = query.count()
    query = apply_sorting(query, User, filters.sort_by, filters.sort_order)
    query = apply_pagination(query, pagination)
    return query.all(), total


def get_user_by_id(db: Session, user_id: int):
    return (
        db.query(User)
        .filter(User.id == user_id, User.deleted_at.is_(None))
        .first()
    )


def get_user_by_username(db: Session, username: str):
    return (
        db.query(User)
        .filter(User.username == username, User.deleted_at.is_(None))
        .first()
    )


def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email, User.deleted_at.is_(None))
        .first()
    )


def create_user(db: Session, user_data: dict) -> User:
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, update_data: dict):
    for key, value in update_data.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
