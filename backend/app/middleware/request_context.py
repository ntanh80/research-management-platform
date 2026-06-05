import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.request_id = str(uuid.uuid4())
        request.state.ip_address = (
            request.client.host if request.client else "unknown"
        )
        request.state.user_agent = request.headers.get("user-agent", "unknown")
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        return response
