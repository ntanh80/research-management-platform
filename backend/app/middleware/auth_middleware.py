from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.security import decode_token
from app.common.responses import error_response


PUBLIC_PATHS = [
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/docs",
    "/openapi.json",
    "/api/v1/health",
    "/api/v1/docs",
]


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if any(request.url.path.startswith(p) for p in PUBLIC_PATHS):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content=error_response(message="Not authenticated"),
            )

        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload is None or payload.get("type") != "access":
            return JSONResponse(
                status_code=401,
                content=error_response(message="Invalid or expired token"),
            )

        request.state.user_id = payload.get("sub")
        request.state.token_type = payload.get("type")
        return await call_next(request)
