from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging_config import logger
from app.middleware.request_context import RequestContextMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.exception_handler import ExceptionHandlerMiddleware
from app.middleware.auth_middleware import AuthMiddleware
from app.middleware.permission_middleware import PermissionMiddleware

from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.roles.router import router as roles_router
from app.modules.permissions.router import router as permissions_router
from app.modules.departments.router import router as departments_router
from app.modules.lecturers.router import router as lecturers_router
from app.modules.phd_students.router import router as phd_students_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    from app.core.cache import clear_all_caches
    clear_all_caches()
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware (order matters: first added = outermost)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(ExceptionHandlerMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(PermissionMiddleware)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)
app.include_router(permissions_router)
app.include_router(departments_router)
app.include_router(lecturers_router)
app.include_router(phd_students_router)


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "db_status": "connected",
    }
