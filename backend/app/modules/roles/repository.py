from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.common.pagination import PaginationParams
from app.common.query_builder import apply_sorting, apply_pagination, apply_soft_delete_filter


def get_roles(db: Session, pagination: PaginationParams):
    query = db.query(Role)
    query = apply_soft_delete_filter(query, Role)
    total = query.count()
    query = apply_sorting(query, Role, "id", "ASC")
    query = apply_pagination(query, pagination)
    return query.all(), total


def get_role_by_id(db: Session, role_id: int):
    return db.query(Role).filter(Role.id == role_id, Role.deleted_at.is_(None)).first()


def get_role_by_code(db: Session, code: str):
    return db.query(Role).filter(Role.code == code, Role.deleted_at.is_(None)).first()


def create_role(db: Session, role_data: dict) -> Role:
    role = Role(**role_data)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def update_role(db: Session, role: Role, update_data: dict):
    for key, value in update_data.items():
        if value is not None:
            setattr(role, key, value)
    db.commit()
    db.refresh(role)
    return role


def get_role_permissions(db: Session, role_id: int):
    return (
        db.query(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role_id == role_id)
        .all()
    )


def set_role_permissions(db: Session, role_id: int, permission_ids: list):
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
    for pid in permission_ids:
        rp = RolePermission(role_id=role_id, permission_id=pid)
        db.add(rp)
    db.commit()
