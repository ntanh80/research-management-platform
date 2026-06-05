from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.exceptions import AppException
from app.common.responses import error_response
from app.core.logging_config import logger


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except AppException as e:
            logger.warning(
                f"AppException: {e.message}",
                extra={"status_code": e.status_code},
            )
            return JSONResponse(
                status_code=e.status_code,
                content=error_response(message=e.message, errors=e.errors),
            )
        except Exception as e:
            logger.exception(f"Unhandled exception: {str(e)}")
            return JSONResponse(
                status_code=500,
                content=error_response(message="Internal server error"),
            )
