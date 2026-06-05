from typing import Any, Dict, List, Optional


class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        errors: Optional[List[Dict[str, str]]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.errors = errors or []
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, entity: str = "Resource", identifier: Any = None):
        message = f"{entity} not found"
        if identifier is not None:
            message = f"{entity} with id '{identifier}' not found"
        super().__init__(message=message, status_code=404)


class PermissionDeniedException(AppException):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message=message, status_code=403)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Not authenticated"):
        super().__init__(message=message, status_code=401)


class ValidationException(AppException):
    def __init__(
        self,
        message: str = "Validation error",
        errors: Optional[List[Dict[str, str]]] = None,
    ):
        super().__init__(message=message, status_code=422, errors=errors)


class BusinessRuleException(AppException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=409)


class DuplicateException(AppException):
    def __init__(
        self, entity: str = "Resource", field: str = "field", value: Any = None
    ):
        message = f"{entity} with {field} '{value}' already exists"
        super().__init__(message=message, status_code=409)


class AccountLockedException(AppException):
    def __init__(self, minutes_remaining: int = 15):
        super().__init__(
            message=f"Account locked. Try again in {minutes_remaining} minutes.",
            status_code=423,
        )


class RateLimitException(AppException):
    def __init__(self, message: str = "Too many requests. Please try again later."):
        super().__init__(message=message, status_code=429)
