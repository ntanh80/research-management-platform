from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.database import SessionLocal
from app.models.user_role import UserRole
from app.models.role_permission import RolePermission
from app.models.permission import Permission
from app.models.user import User
from app.common.responses import error_response


class PermissionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not hasattr(request.state, "user_id"):
            return await call_next(request)

        required_permission = getattr(
            request.state, "required_permission", None
        )
        if required_permission is None:
            return await call_next(request)

        db = SessionLocal()
        try:
            user = (
                db.query(User)
                .filter(User.id == request.state.user_id)
                .first()
            )
            if user and user.is_superuser:
                return await call_next(request)

            user_roles = (
                db.query(UserRole)
                .filter(UserRole.user_id == request.state.user_id)
                .all()
            )
            role_ids = [ur.role_id for ur in user_roles]
            role_permissions = (
                db.query(RolePermission)
                .filter(RolePermission.role_id.in_(role_ids))
                .all()
            )
            permission_ids = [rp.permission_id for rp in role_permissions]
            permissions = (
                db.query(Permission)
                .filter(Permission.id.in_(permission_ids))
                .all()
            )
            user_permission_codes = {p.code for p in permissions}

            if required_permission not in user_permission_codes:
                return JSONResponse(
                    status_code=403,
                    content=error_response(
                        message=f"Missing permission: {required_permission}"
                    ),
                )
        finally:
            db.close()

        return await call_next(request)
