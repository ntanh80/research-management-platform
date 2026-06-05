from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.common.pagination import PaginationParams, create_pagination
from app.common.responses import success_response, paginated_response
from app.modules.roles.schemas import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    RoleDetailResponse,
    AssignPermissionsRequest,
)
from app.modules.roles.repository import (
    get_roles,
    get_role_by_id,
    get_role_permissions,
    set_role_permissions,
)
from app.modules.roles.service import create_role, update_role, delete_role

router = APIRouter(prefix="/api/v1/roles", tags=["Roles"])


@router.get("")
async def list_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    pagination = PaginationParams(page, page_size)
    roles, total = get_roles(db, pagination)
    return paginated_response(
        data=[RoleResponse.model_validate(r).model_dump() for r in roles],
        pagination=create_pagination(page, page_size, total),
    )


@router.get("/{role_id}")
async def get_role(role_id: int, db: Session = Depends(get_db)):
    role = get_role_by_id(db, role_id)
    if not role:
        raise NotFoundException("Role", role_id)
    permissions = get_role_permissions(db, role_id)
    result = RoleResponse.model_validate(role).model_dump()
    result["permissions"] = [
        {"id": p.id, "code": p.code, "name": p.name} for p in permissions
    ]
    return success_response(data=result)


@router.post("")
async def create(request: RoleCreate, db: Session = Depends(get_db)):
    role = create_role(db, request.model_dump())
    return success_response(
        data=RoleResponse.model_validate(role).model_dump(),
        message="Role created",
    )


@router.put("/{role_id}")
async def update(role_id: int, request: RoleUpdate, db: Session = Depends(get_db)):
    role = update_role(db, role_id, request.model_dump(exclude_unset=True))
    return success_response(
        data=RoleResponse.model_validate(role).model_dump(),
        message="Role updated",
    )


@router.delete("/{role_id}")
async def delete(role_id: int, db: Session = Depends(get_db)):
    delete_role(db, role_id)
    return success_response(message="Role deleted")


@router.put("/{role_id}/permissions")
async def assign_permissions(
    role_id: int,
    request: AssignPermissionsRequest,
    db: Session = Depends(get_db),
):
    role = get_role_by_id(db, role_id)
    if not role:
        raise NotFoundException("Role", role_id)
    set_role_permissions(db, role_id, request.permission_ids)
    return success_response(message="Permissions updated")
