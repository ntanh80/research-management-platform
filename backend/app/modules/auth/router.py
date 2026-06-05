from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.schemas import LoginRequest, TokenRefreshRequest
from app.modules.auth.service import (
    authenticate_user,
    refresh_access_token,
    get_current_user,
)
from app.common.responses import success_response
from app.core.exceptions import AppException

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/login")
async def login(
    request: LoginRequest,
    req: Request,
    db: Session = Depends(get_db),
):
    try:
        result = authenticate_user(db, request.username, request.password)
        return success_response(data=result, message="Login successful")
    except AppException as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=e.status_code,
            content={"success": False, "message": e.message},
        )


@router.post("/logout")
async def logout(request: Request, db: Session = Depends(get_db)):
    return success_response(message="Logged out successfully")


@router.post("/refresh")
async def refresh(
    request: TokenRefreshRequest,
    db: Session = Depends(get_db),
):
    try:
        result = refresh_access_token(db, request.refresh_token)
        return success_response(data=result)
    except AppException as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=e.status_code,
            content={"success": False, "message": e.message},
        )


@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db)):
    user_id = getattr(request.state, "user_id", None)
    if user_id is None:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Not authenticated"},
        )
    result = get_current_user(db, user_id)
    return success_response(data=result)


@router.get("/my-permissions")
async def my_permissions(request: Request, db: Session = Depends(get_db)):
    user_id = getattr(request.state, "user_id", None)
    if user_id is None:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Not authenticated"},
        )
    result = get_current_user(db, user_id)
    return success_response(data={"permissions": result["permissions"]})
