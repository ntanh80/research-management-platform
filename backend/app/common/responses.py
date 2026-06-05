from typing import Any, Dict, List, Optional
from app.common.pagination import PaginationResponse


def success_response(
    data: Any = None, message: str = "Success"
) -> Dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
        "pagination": None,
    }


def paginated_response(
    data: Any,
    pagination: PaginationResponse,
    message: str = "Success",
) -> Dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
        "pagination": pagination.model_dump(),
    }


def error_response(
    message: str = "Error",
    errors: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "errors": errors or [],
    }
