from sqlalchemy.orm import Session
from app.models.role import Role
from app.modules.roles.repository import (
    get_role_by_id,
    get_role_by_code,
    create_role as repo_create,
    update_role as repo_update,
)
from app.core.exceptions import NotFoundException, DuplicateException


def create_role(db: Session, role_data: dict) -> Role:
    if get_role_by_code(db, role_data["code"]):
        raise DuplicateException("Role", "code", role_data["code"])
    return repo_create(db, role_data)


def update_role(db: Session, role_id: int, update_data: dict) -> Role:
    role = get_role_by_id(db, role_id)
    if not role:
        raise NotFoundException("Role", role_id)
    return repo_update(db, role, update_data)


def delete_role(db: Session, role_id: int):
    role = get_role_by_id(db, role_id)
    if not role:
        raise NotFoundException("Role", role_id)
    role.soft_delete()
    db.commit()
