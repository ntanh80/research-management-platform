from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.permission import Permission
from app.common.responses import success_response
from app.modules.permissions.permissions import PERMISSIONS_CATALOG

router = APIRouter(prefix="/api/v1/permissions", tags=["Permissions"])


@router.get("")
async def list_permissions(db: Session = Depends(get_db)):
    permissions = db.query(Permission).all()
    grouped = {}
    for p in permissions:
        module = p.module
        if module not in grouped:
            grouped[module] = []
        grouped[module].append(
            {"id": p.id, "code": p.code, "name": p.name, "action": p.action}
        )
    return success_response(data={"permissions": grouped, "catalog": PERMISSIONS_CATALOG})


@router.get("/modules")
async def list_modules():
    modules = list(PERMISSIONS_CATALOG.keys())
    return success_response(data={"modules": modules})
