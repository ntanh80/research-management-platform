from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import AppException, NotFoundException
from app.common.pagination import PaginationParams, create_pagination
from app.common.responses import success_response, paginated_response
from app.modules.users.schemas import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserFilter,
    ChangePasswordRequest,
    ResetPasswordRequest,
)
from app.modules.users.repository import get_users, get_user_by_id
from app.modules.users.service import (
    create_user,
    update_user,
    delete_user,
    reset_password,
    unlock_account,
    change_password,
)

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("")
async def list_users(
    keyword: str = Query(None),
    department_id: int = Query(None),
    is_active: bool = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    sort_by: str = Query("id"),
    sort_order: str = Query("ASC"),
    db: Session = Depends(get_db),
):
    filters = UserFilter(
        keyword=keyword,
        department_id=department_id,
        is_active=is_active,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    pagination = PaginationParams(page, page_size)
    users, total = get_users(db, filters, pagination)
    return paginated_response(
        data=[UserResponse.model_validate(u).model_dump() for u in users],
        pagination=create_pagination(page, page_size, total),
    )


@router.get("/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise NotFoundException("User", user_id)
    return success_response(data=UserResponse.model_validate(user).model_dump())


@router.post("")
async def create(request: UserCreate, db: Session = Depends(get_db)):
    user = create_user(db, request.model_dump())
    return success_response(
        data=UserResponse.model_validate(user).model_dump(),
        message="User created",
    )


@router.put("/{user_id}")
async def update(user_id: int, request: UserUpdate, db: Session = Depends(get_db)):
    user = update_user(db, user_id, request.model_dump(exclude_unset=True))
    return success_response(
        data=UserResponse.model_validate(user).model_dump(),
        message="User updated",
    )


@router.delete("/{user_id}")
async def delete(user_id: int, db: Session = Depends(get_db)):
    delete_user(db, user_id)
    return success_response(message="User deleted")


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int, request: ResetPasswordRequest, db: Session = Depends(get_db)
):
    reset_password(db, user_id, request.new_password)
    return success_response(message="Password reset")


@router.post("/{user_id}/unlock")
async def unlock_user(user_id: int, db: Session = Depends(get_db)):
    unlock_account(db, user_id)
    return success_response(message="Account unlocked")


@router.put("/me/password")
async def change_my_password(
    request: ChangePasswordRequest,
    req: Request,
    db: Session = Depends(get_db),
):
    user_id = getattr(req.state, "user_id", None)
    if user_id is None:
        raise AppException("Not authenticated", 401)
    change_password(db, user_id, request.current_password, request.new_password)
    return success_response(message="Password changed")
