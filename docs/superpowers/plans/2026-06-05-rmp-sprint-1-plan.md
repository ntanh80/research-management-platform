# RMP Sprint 1 — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement plan task-by-task.

**Goal:** Sprint 1 foundation: 18 DB tables, core/common/middleware, Auth/RBAC, CRUD (users/roles/departments/lecturers/phd_students), frontend pages, scripts, tests, Docker, CI/CD.

**Architecture:** FastAPI Modular Monolith + Clean Architecture (router/model/schemas/repository/service/permissions per module). React 19 + Ant Design + TanStack Query frontend.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, SQLite, JWT, bcrypt, React 19, TypeScript, Vite, Ant Design 5, TanStack Query 5, Zustand, React Hook Form + Zod.

---

## PHASE 1: PROJECT SCAFFOLDING

### Task 1: Backend project setup

- [ ] Create directory structure: `backend/app/core`, `backend/app/common`, `backend/app/middleware`, `backend/app/models`, `backend/app/modules/{auth,users,roles,permissions,departments,lecturers,phd_students}`, `backend/app/tests/{unit,integration,api}`, `backend/scripts/`, `backend/data/{backups,uploads,imports,exports,temp}`, `backend/alembic/versions`
- [ ] Write `backend/requirements.txt` with: fastapi 0.115.6, uvicorn, sqlalchemy 2.0.36, alembic, pydantic 2.10.3, pydantic-settings, python-jose, passlib[bcrypt], python-multipart, cachetools, openpyxl, python-dotenv
- [ ] Write `backend/requirements-dev.txt` adding: pytest, pytest-cov, pytest-asyncio, httpx, ruff, mypy, bandit, safety
- [ ] Write `backend/.env.example` and copy to `backend/.env`
- [ ] Write `__init__.py` in all Python package directories
- [ ] Run `pip install -r backend/requirements.txt`
- [ ] Write `backend/data/.gitkeep`
- [ ] Commit: `feat: scaffold backend project with dependencies and directory structure`

### Task 2: Frontend project setup

- [ ] Run `npm create vite@latest frontend -- --template react-ts`
- [ ] Install: `npm install antd @ant-design/icons react-router-dom @tanstack/react-query axios zustand react-hook-form @hookform/resolvers zod echarts echarts-for-react dayjs`
- [ ] Install dev: `npm install -D @types/node vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom eslint prettier eslint-config-prettier`
- [ ] Configure `vite.config.ts` with `@` path alias and proxy `/api` → `http://localhost:8000`
- [ ] Configure `.eslintrc.cjs` and `.prettierrc`
- [ ] Create all frontend directories: `src/{api,components/{DataGrid,FormModal,PageHeader,KpiCard,common},hooks,layouts/MainLayout,modules/{auth,users,roles,departments,lecturers,phd-students}/pages,routes,store,types,utils}`
- [ ] Commit: `feat: scaffold frontend project with React + TypeScript + Ant Design`

---

## PHASE 2: CORE LAYER

### Task 3: config.py + constants.py

- [ ] Write `backend/app/core/__init__.py`
- [ ] Write `backend/app/core/config.py`:
```python
from pydantic_settings import BaseSettings
from typing import List
import json

class Settings(BaseSettings):
    APP_NAME: str = "Research Management Platform"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./data/qlncs.db"
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'
    UPLOAD_DIR: str = "./data/uploads"
    BACKUP_DIR: str = "./data/backups"
    IMPORT_DIR: str = "./data/imports"
    EXPORT_DIR: str = "./data/exports"
    TEMP_DIR: str = "./data/temp"
    LOG_LEVEL: str = "INFO"
    MAX_UPLOAD_SIZE_MB: int = 50
    ACCOUNT_LOCKOUT_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15
    RATE_LIMIT_AUTH_PER_MIN: int = 10
    RATE_LIMIT_API_PER_MIN: int = 100

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```
- [ ] Write `backend/app/core/constants.py` with enums: `PhdStudentStatus` (STUDYING/LEAVE/EXTENDED/DEFENDED/DROPPED), `ProjectStatus`, `PublicationType`, `SupervisorRole` (CHINH/PHU), `AuthorType`, `IndexType`, `Quartile`, `AuditAction`, plus `VALID_TRANSITIONS` dict, `SCORING` dict, `AUTHOR_ROLE_FACTOR` dict
- [ ] Commit: `feat: add config and constants modules`

### Task 4: exceptions.py + database.py

- [ ] Write `backend/app/core/exceptions.py`:
```python
class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400, errors=None):
        self.message = message; self.status_code = status_code; self.errors = errors or []
        super().__init__(self.message)

class NotFoundException(AppException):
    def __init__(self, entity="Resource", identifier=None):
        msg = f"{entity} not found" if identifier is None else f"{entity} with id '{identifier}' not found"
        super().__init__(message=msg, status_code=404)

class PermissionDeniedException(AppException):
    def __init__(self, message="Permission denied"):
        super().__init__(message=message, status_code=403)

class UnauthorizedException(AppException):
    def __init__(self, message="Not authenticated"):
        super().__init__(message=message, status_code=401)

class ValidationException(AppException):
    def __init__(self, message="Validation error", errors=None):
        super().__init__(message=message, status_code=422, errors=errors)

class BusinessRuleException(AppException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=409)

class DuplicateException(AppException):
    def __init__(self, entity="Resource", field="field", value=None):
        super().__init__(message=f"{entity} with {field} '{value}' already exists", status_code=409)

class AccountLockedException(AppException):
    def __init__(self, minutes_remaining=15):
        super().__init__(message=f"Account locked. Try again in {minutes_remaining} minutes.", status_code=423)

class RateLimitException(AppException):
    def __init__(self, message="Too many requests. Please try again later."):
        super().__init__(message=message, status_code=429)
```
- [ ] Write `backend/app/core/database.py`:
```python
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase): pass

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if "sqlite" in settings.DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
```
- [ ] Commit: `feat: add exceptions and database modules`

### Task 5: security.py + logging_config.py + cache.py

- [ ] Write `backend/app/core/security.py` with: `hash_password()`, `verify_password()`, `create_access_token()`, `create_refresh_token()`, `decode_token()`, `validate_password_strength()` — using passlib bcrypt + python-jose JWT
- [ ] Write `backend/app/core/logging_config.py` with: `JSONFormatter`, `setup_logging()` — rotating file handler (30MB, 30 backups)
- [ ] Write `backend/app/core/cache.py` with: `dashboard_cache` (TTL 300s), `lookup_cache` (TTL 1800s), `query_cache` (TTL 600s), `cached()` decorator, `invalidate_cache()`, `clear_all_caches()`
- [ ] Commit: `feat: add security, logging, and cache modules`

---

## PHASE 3: DATABASE MODELS (18 tables)

### Task 6: Base model + Auth models

- [ ] Write `backend/app/models/__init__.py`
- [ ] Write `backend/app/models/base.py`:
```python
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, func
from app.core.database import Base as CoreBase

class TimestampMixin:
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)
    def soft_delete(self): self.deleted_at = datetime.now(timezone.utc)
    def restore(self): self.deleted_at = None
    @property
    def is_deleted(self) -> bool: return self.deleted_at is not None

class BaseModel(CoreBase, TimestampMixin, SoftDeleteMixin):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)
```
- [ ] Write `backend/app/models/user.py` — User model (15 columns: username, email, hashed_password, full_name, department_id FK, avatar, is_active, is_superuser, last_login_at, password_changed_at, failed_login_attempts, locked_until, + inherited id/created_at/updated_at/deleted_at)
- [ ] Write `backend/app/models/role.py` — Role model (code UK, name, description, status)
- [ ] Write `backend/app/models/permission.py` — Permission model (code UK, name, module, action)
- [ ] Write `backend/app/models/role_permission.py` — RolePermission model (role_id FK, permission_id FK, UK on pair)
- [ ] Write `backend/app/models/user_role.py` — UserRole model (user_id FK, role_id FK, UK on pair)
- [ ] Verify: `python -c "from app.models import User, Role, Permission; print('OK')"`
- [ ] Commit: `feat: add base model and auth models (User, Role, Permission)`

### Task 7: Academic models

- [ ] Write `backend/app/models/department.py` — Department (code UK, name, description, head_lecturer_id FK, status)
- [ ] Write `backend/app/models/lecturer.py` — Lecturer (code UK, full_name, academic_title, degree, position, email UK, phone, organization, department_id FK, specialization, research_interests, scholar_url, scholar_id, orcid, scopus_id, avatar, note, status, + base)
- [ ] Write `backend/app/models/phd_student.py` — PhdStudent (code UK, full_name, date_of_birth, gender, email UK, phone, organization, major, major_code, cohort, admission_decision_date, expected_defense_date, status, avatar, note, + base)
- [ ] Write `backend/app/models/phd_topic.py` — PhdTopic (phd_student_id FK, topic_title, research_direction, research_objectives, research_methods, approval_date, adjustment_date, status, attachment_file, note, + base)
- [ ] Write `backend/app/models/phd_topic_history.py` — PhdTopicHistory (phd_student_id FK, old/new_topic_title, changed_date, reason, attachment_file, created_at)
- [ ] Write `backend/app/models/student_supervisor.py` — StudentSupervisor (phd_student_id FK, lecturer_id FK, role CHINH/PHU, start_date, end_date, status, note, + base)
- [ ] Update `backend/app/models/__init__.py` with all new imports
- [ ] Verify imports
- [ ] Commit: `feat: add academic models (Department, Lecturer, PhDStudent, Topic, Supervisor)`

### Task 8: Publication models + Scholar models + ResearchProject + AuditLog

- [ ] Write `backend/app/models/external_author.py` — ExternalAuthor (full_name, email, organization, orcid, scholar_url, scholar_id, note, + base)
- [ ] Write `backend/app/models/publication.py` — Publication (title, publication_year, publication_type, journal_or_conference_name, publisher, doi UK, issn, isbn, url, volume, issue, pages, index_type, quartile, score, evidence_file, note, + base)
- [ ] Write `backend/app/models/publication_index.py` — PublicationIndex (publication_id FK, index_type, quartile, impact_factor, indexed_at, UK on (publication_id, index_type))
- [ ] Write `backend/app/models/publication_author.py` — PublicationAuthor (publication_id FK, author_type, lecturer_id FK nullable, phd_student_id FK nullable, external_author_id FK nullable, author_order, is_first_author, is_corresponding_author, contribution_rate, note, created_at, updated_at)
- [ ] Write `backend/app/models/scholar_profile.py` — ScholarProfile (person_type, person_id, orcid UK, openalex_id, scopus_id, scholar_url, scholar_id, display_name, affiliation, total_citations, h_index, i10_index, data_source, last_sync_at, sync_status, + base)
- [ ] Write `backend/app/models/scholar_sync_log.py` — ScholarSyncLog (scholar_profile_id FK, data_source, sync_time, status, message, total_publications_found, total_publications_imported, total_skipped, created_at)
- [ ] Write `backend/app/models/research_project.py` — ResearchProject (code UK, title, project_level, project_type, research_field, principal_investigator_id FK, host_organization, start_date, end_date, total_budget, funding_source, status, acceptance_result, acceptance_grade, + base)
- [ ] Write `backend/app/models/audit_log.py` — AuditLog (user_id FK nullable, action, entity_type, entity_id, changes JSON, ip_address, user_agent, request_id, created_at)
- [ ] Finalize `backend/app/models/__init__.py` with all 18 model exports
- [ ] Verify: `python -c "from app.models import *; print('All 18 models OK')"`
- [ ] Commit: `feat: add publication, scholar, project, and audit models (complete 18 tables)`

### Task 9: Alembic migration

- [ ] Run `alembic init alembic` in backend directory
- [ ] Edit `backend/alembic/env.py` — import all models, set `target_metadata = Base.metadata`, set `sqlalchemy.url` from settings
- [ ] Edit `backend/alembic.ini` — set `sqlalchemy.url = sqlite:///./data/qlncs.db`
- [ ] Run `alembic revision --autogenerate -m "initial_schema"`
- [ ] Run `alembic upgrade head`
- [ ] Verify: `python -c "from sqlalchemy import inspect; from app.core.database import engine; print(inspect(engine).get_table_names())"` → shows 18 tables
- [ ] Commit: `feat: add Alembic initial migration with all 18 tables`

---

## PHASE 4: COMMON LAYER

### Task 10: pagination.py + responses.py

- [ ] Write `backend/app/common/__init__.py`
- [ ] Write `backend/app/common/pagination.py` — `PaginationParams(page, page_size)` with `offset`/`limit` properties, `PaginationResponse` pydantic model (page, page_size, total, total_pages, has_next, has_prev), `create_pagination()` utility
- [ ] Write `backend/app/common/responses.py` — `success_response(data, message)`, `paginated_response(data, pagination, message)`, `error_response(message, errors)` — all return dict with standard format `{success, message, data/errors, pagination}`
- [ ] Commit: `feat: add pagination and response formatting`

### Task 11: validators.py + string_utils.py + date_utils.py

- [ ] Write `backend/app/common/validators.py` — `validate_email()`, `validate_phone()`, `validate_doi()`, `validate_orcid()`, `validate_password_strength()`
- [ ] Write `backend/app/common/string_utils.py` — `slugify()`, `normalize_search()`, `fuzzy_match()` (via difflib.SequenceMatcher), `title_similarity()`
- [ ] Write `backend/app/common/date_utils.py` — `format_date()`, `parse_date_range()`, `calculate_duration()`, `years_ago()`
- [ ] Commit: `feat: add validators, string utils, and date utils`

### Task 12: file_utils.py + excel_utils.py + pdf_utils.py + query_builder.py + filters.py

- [ ] Write `backend/app/common/file_utils.py` — `validate_file()` (check size + extension), `save_upload()`, `delete_file()`, `get_file_path()`, ALLOWED_EXTENSIONS set
- [ ] Write `backend/app/common/excel_utils.py` — `read_excel()`, `write_excel()`, `validate_columns()` using openpyxl
- [ ] Write `backend/app/common/pdf_utils.py` — `generate_pdf()` placeholder (raises NotImplementedError)
- [ ] Write `backend/app/common/query_builder.py` — `apply_search()` (ilike across multiple fields), `apply_sorting()`, `apply_pagination()`, `apply_soft_delete_filter()`
- [ ] Write `backend/app/common/filters.py` — `BaseFilter` pydantic model (keyword, status, date_from, date_to, sort_by, sort_order, page, page_size), `apply_filters()` helper
- [ ] Update `backend/app/common/__init__.py` with key exports
- [ ] Commit: `feat: add file/excel/query/filter utilities`

---

## PHASE 5: MIDDLEWARE

### Task 13: All 5 middleware files

- [ ] Write `backend/app/middleware/__init__.py` — exports all middleware classes
- [ ] Write `backend/app/middleware/request_context.py` — `RequestContextMiddleware`: generates `request_id` (uuid4), captures `ip_address`, `user_agent`; adds `X-Request-ID` response header
- [ ] Write `backend/app/middleware/logging_middleware.py` — `LoggingMiddleware`: logs method, URL, user_id, status_code, duration_ms per request
- [ ] Write `backend/app/middleware/exception_handler.py` — `ExceptionHandlerMiddleware`: catches `AppException` → JSON with status code; catches `Exception` → 500
- [ ] Write `backend/app/middleware/auth_middleware.py` — `AuthMiddleware`: extracts Bearer token, decodes JWT, sets `request.state.user_id`; skips PUBLIC_PATHS (`/auth/login`, `/auth/refresh`, `/docs`, `/openapi.json`, `/health`)
- [ ] Write `backend/app/middleware/permission_middleware.py` — `PermissionMiddleware`: checks if user is superuser (bypasses), otherwise looks up user→roles→role_permissions→permissions, checks against `request.state.required_permission`, 403 if missing
- [ ] Commit: `feat: add middleware layer (request_context, logging, exception, auth, permission)`

---

## PHASE 6: AUTH MODULE

### Task 14: Auth router, schemas, service

- [ ] Write `backend/app/modules/auth/permissions.py`:
```python
AUTH_PERMISSIONS = {
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.me": "View own profile",
    "auth.my_permissions": "View own permissions",
}
```
- [ ] Write `backend/app/modules/auth/schemas.py` — `LoginRequest(username, password)`, `LoginResponse(access_token, refresh_token, token_type, user)`, `TokenRefreshRequest(refresh_token)`, `TokenRefreshResponse(access_token)`, `UserInfo`, `MeResponse`
- [ ] Write `backend/app/modules/auth/service.py` — `authenticate_user(db, username, password)` (check exists→check locked→check password→increment fail count→reset on success→create tokens), `refresh_access_token(db, refresh_token)` (decode refresh→validate user→create new access), `get_current_user(db, user_id)` (user→roles→permissions)
- [ ] Write `backend/app/modules/auth/router.py`:
```python
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login")
async def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    result = authenticate_user(db, request.username, request.password)
    return success_response(data=result, message="Login successful")

@router.post("/logout")
async def logout(request: Request, db: Session = Depends(get_db)):
    return success_response(message="Logged out successfully")

@router.post("/refresh")
async def refresh(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    result = refresh_access_token(db, request.refresh_token)
    return success_response(data=result)

@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db)):
    return success_response(data=get_current_user(db, request.state.user_id))

@router.get("/my-permissions")
async def my_permissions(request: Request, db: Session = Depends(get_db)):
    result = get_current_user(db, request.state.user_id)
    return success_response(data={"permissions": result["permissions"]})
```
- [ ] Commit: `feat: add auth module (login, logout, refresh, me, my-permissions)`

---

## PHASE 7: USERS MODULE

### Task 15: Users CRUD (router, schemas, repository, service)

- [ ] Write `backend/app/modules/users/permissions.py`:
```python
USERS_PERMISSIONS = {
    "users.view": "View users", "users.create": "Create user",
    "users.update": "Update user", "users.delete": "Delete user",
}
```
- [ ] Write `backend/app/modules/users/schemas.py`:
```python
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=255)
    department_id: Optional[int] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int; username: str; email: str; full_name: str
    department_id: Optional[int]; is_active: bool; is_superuser: bool
    last_login_at: Optional[datetime]; created_at: datetime; updated_at: datetime

class UserFilter(BaseModel):
    keyword: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None
    page: int = 1; page_size: int = 20
    sort_by: str = "id"; sort_order: str = "ASC"

class ChangePasswordRequest(BaseModel):
    current_password: str; new_password: str = Field(..., min_length=8)

class ResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8)
```
- [ ] Write `backend/app/modules/users/repository.py`:
```python
from sqlalchemy.orm import Session
from app.models.user import User
from app.common.pagination import PaginationParams
from app.common.query_builder import apply_search, apply_sorting, apply_pagination, apply_soft_delete_filter

def get_users(db: Session, filters, pagination: PaginationParams):
    query = db.query(User)
    query = apply_soft_delete_filter(query, User)
    if filters.keyword:
        query = apply_search(query, User, filters.keyword, ["username", "email", "full_name"])
    if filters.department_id:
        query = query.filter(User.department_id == filters.department_id)
    if filters.is_active is not None:
        query = query.filter(User.is_active == filters.is_active)
    total = query.count()
    query = apply_sorting(query, User, filters.sort_by, filters.sort_order)
    query = apply_pagination(query, pagination)
    return query.all(), total

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username, User.deleted_at.is_(None)).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()

def create_user(db: Session, user_data: dict) -> User:
    user = User(**user_data); db.add(user); db.commit(); db.refresh(user); return user

def update_user(db: Session, user: User, update_data: dict):
    for key, value in update_data.items():
        if value is not None: setattr(user, key, value)
    db.commit(); db.refresh(user); return user
```
- [ ] Write `backend/app/modules/users/service.py` — `create_user()` (validate uniqueness + hash password), `update_user()`, `delete_user()` (soft delete), `reset_password()`, `unlock_account()`, `change_password()`
- [ ] Write `backend/app/modules/users/router.py`:
```python
router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.get("")
async def list_users(filters: UserFilter = Depends(), db: Session = Depends(get_db)):
    pagination = PaginationParams(filters.page, filters.page_size)
    users, total = get_users(db, filters, pagination)
    return paginated_response(data=[UserResponse.model_validate(u).model_dump() for u in users], pagination=create_pagination(filters.page, filters.page_size, total))

@router.get("/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user: raise NotFoundException("User", user_id)
    return success_response(data=UserResponse.model_validate(user).model_dump())

@router.post("")
async def create_user(request: UserCreate, db: Session = Depends(get_db)):
    user = create_user_service(db, request.model_dump())
    return success_response(data=UserResponse.model_validate(user).model_dump(), message="User created")

@router.put("/{user_id}")
async def update_user(user_id: int, request: UserUpdate, db: Session = Depends(get_db)):
    user = update_user_service(db, user_id, request.model_dump(exclude_unset=True))
    return success_response(data=UserResponse.model_validate(user).model_dump(), message="User updated")

@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    delete_user_service(db, user_id)
    return success_response(message="User deleted")

@router.post("/{user_id}/reset-password")
async def reset_user_password(user_id: int, request: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_password(db, user_id, request.new_password)
    return success_response(message="Password reset")

@router.post("/{user_id}/unlock")
async def unlock_user(user_id: int, db: Session = Depends(get_db)):
    unlock_account(db, user_id)
    return success_response(message="Account unlocked")

@router.put("/me/password")
async def change_my_password(request: ChangePasswordRequest, req: Request, db: Session = Depends(get_db)):
    change_password(db, req.state.user_id, request.current_password, request.new_password)
    return success_response(message="Password changed")
```
- [ ] Commit: `feat: add users module with full CRUD, soft delete, reset password, unlock`

---

## PHASE 8: ROLES + PERMISSIONS MODULES

### Task 16: Permissions module (catalog)

- [ ] Write `backend/app/modules/permissions/permissions.py`:
```python
PERMISSIONS_CATALOG = {
    "users": ["view", "create", "update", "delete"],
    "roles": ["view", "create", "update", "delete"],
    "permissions": ["view"],
    "departments": ["view", "create", "update", "delete"],
    "lecturers": ["view", "create", "update", "delete", "import", "export"],
    "phd_students": ["view", "create", "update", "delete", "import", "export"],
    "dashboard": ["view"],
    "audit_logs": ["view"],
    "backup": ["create", "restore"],
    "imports": ["create", "view"],
    "exports": ["create"],
}
```
- [ ] Write `backend/app/modules/permissions/router.py` — `GET /api/v1/permissions` returns catalog, `GET /api/v1/permissions/modules` returns module list
- [ ] Write `backend/app/modules/permissions/schemas.py`
- [ ] Commit: `feat: add permissions module with 32-permission catalog`

### Task 17: Roles module (CRUD + assign permissions)

- [ ] Write `backend/app/modules/roles/permissions.py`
- [ ] Write `backend/app/modules/roles/schemas.py` — `RoleCreate`, `RoleUpdate`, `RoleResponse`, `AssignPermissionsRequest(permission_ids: list[int])`
- [ ] Write `backend/app/modules/roles/repository.py` — `get_roles()`, `get_role_by_id()`, `get_role_by_code()`, `create_role()`, `update_role()`, `get_role_permissions()`, `set_role_permissions()`
- [ ] Write `backend/app/modules/roles/service.py` — `create_role()`, `update_role()`, `delete_role()`, `assign_permissions()`
- [ ] Write `backend/app/modules/roles/router.py` — CRUD endpoints + `PUT /{role_id}/permissions`
- [ ] Commit: `feat: add roles module with CRUD and permission assignment`

---

## PHASE 9: DEPARTMENTS + LECTURERS MODULES

### Task 18: Departments module

- [ ] Write `backend/app/modules/departments/permissions.py`
- [ ] Write `backend/app/modules/departments/schemas.py` — `DepartmentCreate`, `DepartmentUpdate`, `DepartmentResponse`
- [ ] Write `backend/app/modules/departments/repository.py`
- [ ] Write `backend/app/modules/departments/service.py` — `create_department()`, `update_department()`, `delete_department()`, validate head_lecturer exists in same department
- [ ] Write `backend/app/modules/departments/router.py` — CRUD + `GET /{id}/lecturers`
- [ ] Commit: `feat: add departments module with CRUD`

### Task 19: Lecturers module

- [ ] Write `backend/app/modules/lecturers/permissions.py`
- [ ] Write `backend/app/modules/lecturers/schemas.py` — `LecturerCreate(30 fields)`, `LecturerUpdate(optional fields)`, `LecturerResponse`, `LecturerFilter(keyword, department_id, status, page, page_size, sort_by, sort_order)`, `LecturerSummary(total, active, eligible, etc.)`
- [ ] Write `backend/app/modules/lecturers/repository.py` — `get_lecturers(filters, pagination)`, `get_lecturer_by_id()`, `get_lecturer_by_code()`, `get_lecturer_publications()`, `get_lecturer_students()`, `create_lecturer()`, `update_lecturer()`, `get_summary()`
- [ ] Write `backend/app/modules/lecturers/service.py` — `check_supervisor_eligibility()` (R4.1: degree ≥ PhD + ≥ 2 ISI/Scopus in 5 years + not disciplined), `create_lecturer()`, `update_lecturer()`, `delete_lecturer()`
- [ ] Write `backend/app/modules/lecturers/router.py` — CRUD + summary + `GET /{id}/publications` + `GET /{id}/students` + `GET /{id}/graph`
- [ ] Commit: `feat: add lecturers module with CRUD, summary, and eligibility rules`

---

## PHASE 10: PHD STUDENTS MODULE

### Task 20: PhD Students module

- [ ] Write `backend/app/modules/phd_students/permissions.py`
- [ ] Write `backend/app/modules/phd_students/schemas.py` — `PhDStudentCreate`, `PhDStudentUpdate`, `PhDStudentResponse`, `PhDStudentFilter`, `PhdTopicCreate`, `StudentSupervisorCreate`
- [ ] Write `backend/app/modules/phd_students/repository.py` — `get_phd_students(filters, pagination)`, `get_by_id()`, `get_summary()`, `get_topic()`, `get_publications()`, `get_supervisors()`, `create()`, `update()`
- [ ] Write `backend/app/modules/phd_students/service.py` with ALL business rules:
  - R1.1: `validate_supervisor_limit()` — max 2 supervisors (1 CHINH + 1 PHU)
  - R1.2: `validate_supervisor_degree()` — CHINH must have PhD
  - R1.3: `validate_supervisor_publications()` — ≥ 2 ISI/Scopus in 5 years
  - R1.4: `validate_supervisor_capacity()` — max 5 NCS simultaneously
  - R1.6: `validate_status_transition()` — check VALID_TRANSITIONS dict
  - R1.7: Max 4 years + 2 extensions × 1 year each
- [ ] Write `backend/app/modules/phd_students/summary_service.py` — aggregate: total, studying, leave, extended, defended, dropped, no_publications, has_publications
- [ ] Write `backend/app/modules/phd_students/router.py` — CRUD + summary + `GET /{id}/topic` + `GET /{id}/publications` + `GET /{id}/supervisors` + `POST /{id}/supervisors`
- [ ] Commit: `feat: add phd_students module with CRUD, business rules R1.1-R1.7, R4.1-R4.2`

---

## PHASE 11: MAIN APP ASSEMBLY

### Task 21: main.py + register all routers

- [ ] Write `backend/app/main.py` (if not already done):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging_config import logger
from app.middleware import (RequestContextMiddleware, LoggingMiddleware, ExceptionHandlerMiddleware, AuthMiddleware, PermissionMiddleware)
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

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, docs_url="/api/v1/docs", openapi_url="/api/v1/openapi.json", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(RequestContextMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(ExceptionHandlerMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(PermissionMiddleware)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)
app.include_router(permissions_router)
app.include_router(departments_router)
app.include_router(lecturers_router)
app.include_router(phd_students_router)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION, "db_status": "connected", "uptime_seconds": 0}
```
- [ ] Test: `uvicorn app.main:app --reload` → visit `http://localhost:8000/api/v1/docs` → Swagger shows all endpoints
- [ ] Commit: `feat: assemble main app with all routers and middleware`

---

## PHASE 12: SCRIPTS

### Task 22: init_roles.py + init_permissions.py + create_admin.py

- [ ] Write `backend/scripts/init_roles.py` — Insert 8 roles (System Admin, Dean, Vice Dean, Department Head, Lecturer, Supervisor, Academic Staff, Viewer) if not exists
- [ ] Write `backend/scripts/init_permissions.py` — Insert 32 permissions from PERMISSIONS_CATALOG if not exists, then assign all to System Admin role
- [ ] Write `backend/scripts/create_admin.py` — Create admin user (username: admin, password: Admin@123) + assign System Admin role
- [ ] Write `backend/scripts/seed_data.py` — Create 5 departments (KHMT, HTTT, KTPM, MMT&TT, KHDL), 20 lecturers (4 per dept, diverse degrees), 30 phd_students (mixed cohorts 2020-2025, mixed statuses), 5 phd_topics, 10 student_supervisors
- [ ] Write `backend/scripts/backup_db.py` — Copy `data/qlncs.db` to `data/backups/qlncs_YYYYMMDD_HHMMSS.db`
- [ ] Write `backend/scripts/restore_db.py` — Copy backup file to `data/qlncs.db`
- [ ] Write `backend/scripts/run_dev.py`:
```python
import subprocess, sys
steps = [
    (["alembic", "upgrade", "head"], "Running migrations..."),
    (["python", "scripts/init_roles.py"], "Initializing roles..."),
    (["python", "scripts/init_permissions.py"], "Initializing permissions..."),
    (["python", "scripts/create_admin.py"], "Creating admin user..."),
]
for cmd, msg in steps:
    print(msg)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        sys.exit(1)
print("Setup complete! Starting server...")
subprocess.run(["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
```
- [ ] Run: `python scripts/run_dev.py` → verify http://localhost:8000/api/v1/docs works
- [ ] Commit: `feat: add scripts (init_roles, init_permissions, create_admin, seed_data, backup, restore, run_dev)`

---

## PHASE 13: TESTS (BACKEND)

### Task 23: conftest.py + Unit tests

- [ ] Write `backend/app/tests/conftest.py`:
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./data/test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try: yield db
    finally: db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try: yield db
    finally: db.close()
```
- [ ] Write `backend/app/tests/unit/test_security.py` — test hash/verify, JWT create/decode, password strength validation
- [ ] Write `backend/app/tests/unit/test_validators.py` — test email, phone, DOI, ORCID validators
- [ ] Write `backend/app/tests/unit/test_pagination.py` — test PaginationParams offset/limit behavior
- [ ] Write `backend/app/tests/unit/test_business_rules.py` — test R1.1-R1.7, R4.1-R4.2 validation functions
- [ ] Run: `pytest backend/app/tests/unit/ -v`
- [ ] Commit: `test: add unit tests for security, validators, pagination, business rules`

### Task 24: Integration tests

- [ ] Write `backend/app/tests/integration/test_auth_api.py` — test login (success, wrong password, locked account, inactive), test refresh, test me, test permissions
- [ ] Write `backend/app/tests/integration/test_users_api.py` — test CRUD, pagination, search, filter, reset password, unlock, change password
- [ ] Write `backend/app/tests/integration/test_roles_api.py` — test CRUD, assign permissions, duplicate role code
- [ ] Write `backend/app/tests/integration/test_departments_api.py` — test CRUD, duplicate code
- [ ] Write `backend/app/tests/integration/test_lecturers_api.py` — test CRUD, summary, filter by department
- [ ] Write `backend/app/tests/integration/test_phd_students_api.py` — test CRUD, summary, status transitions, supervisor assignment rules
- [ ] Write `backend/app/tests/api/test_permissions.py` — permission matrix: 8 roles × key endpoints, verify 200/403 responses
- [ ] Run: `pytest backend/app/tests/ --cov=app --cov-report=term-missing`
- [ ] Ensure coverage > 80%
- [ ] Commit: `test: add integration tests and permission matrix`

---

## PHASE 14: FRONTEND FOUNDATION

### Task 25: Types, Store, API layer, Hooks, Utils

- [ ] Write `frontend/src/types/api.types.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `Pagination`, `ApiError`
- [ ] Write `frontend/src/types/user.types.ts`, `role.types.ts`, `department.types.ts`, `lecturer.types.ts`, `phd-student.types.ts`
- [ ] Write `frontend/src/store/authStore.ts` (Zustand):
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  permissions: string[];
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserInfo, permissions: string[]) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  can: (permission: string) => boolean;
}
```
- [ ] Write `frontend/src/store/uiStore.ts` — sidebarCollapsed, theme (light/dark)
- [ ] Write `frontend/src/store/queryClient.ts` — TanStack QueryClient with defaults (staleTime: 30000, retry: 1)
- [ ] Write `frontend/src/api/axios.ts` — Axios instance: baseURL `/api/v1`, interceptor attaches Bearer token, 401→refresh→retry, 403→toast
- [ ] Write `frontend/src/api/auth.api.ts`, `users.api.ts`, `roles.api.ts`, `permissions.api.ts`, `departments.api.ts`, `lecturers.api.ts`, `phd-students.api.ts`
- [ ] Write `frontend/src/hooks/useAuth.ts` — login(), logout(), getMe(), loading, error states
- [ ] Write `frontend/src/hooks/usePermission.ts` — `can(permission)` hook using authStore
- [ ] Write `frontend/src/hooks/usePagination.ts` — server-side pagination state management
- [ ] Write `frontend/src/hooks/useFilter.ts` — filter state + URL query string sync
- [ ] Write `frontend/src/utils/permissions.ts` — `canAccess()` helper
- [ ] Write `frontend/src/utils/formatters.ts` — `formatDate()`, `formatCurrency()`, `formatStatus()`
- [ ] Commit: `feat: add frontend types, stores, API layer, hooks, and utils`

### Task 26: Main Layout + Route Guards

- [ ] Write `frontend/src/layouts/MainLayout/MainLayout.tsx` — Ant Design Layout with Sider, Header, Content, Footer; responsive; dark/light theme
- [ ] Write `frontend/src/layouts/MainLayout/Sidebar.tsx` — Ant Menu items filtered by user permissions; collapsible
- [ ] Write `frontend/src/layouts/MainLayout/Header.tsx` — Logo, breadcrumb, notification bell (placeholder), user dropdown (profile, logout, theme toggle)
- [ ] Write `frontend/src/layouts/MainLayout/Breadcrumb.tsx` — auto breadcrumb from React Router location
- [ ] Write `frontend/src/routes/ProtectedRoute.tsx` — checks authStore.isAuthenticated(), redirects to /login
- [ ] Write `frontend/src/routes/PermissionGuard.tsx` — checks usePermission().can(requiredPermission), shows 403 page
- [ ] Write `frontend/src/routes/index.tsx` — full route tree: `/login` (public), `/` (ProtectedRoute → MainLayout), children with PermissionGuard per route
- [ ] Commit: `feat: add main layout, sidebar, header, breadcrumb, and route guards`

### Task 27: Shared Components

- [ ] Write `frontend/src/components/DataGrid/DataGrid.tsx` — Ant Table wrapper: server pagination, sort, row selection, action buttons with permission gating, loading skeleton, empty state
- [ ] Write `frontend/src/components/DataGrid/FilterBar.tsx` — keyword input, status select, date range picker, custom filter slots
- [ ] Write `frontend/src/components/DataGrid/ColumnManager.tsx` — checkbox list to hide/show columns, drag to reorder (placeholder)
- [ ] Write `frontend/src/components/DataGrid/BulkActions.tsx` — delete selected, export selected, update status dropdown
- [ ] Write `frontend/src/components/FormModal/FormModal.tsx` — Ant Modal with React Hook Form + Zod validation; create/edit mode; loading submit; unsaved changes warning
- [ ] Write `frontend/src/components/FormModal/FormField.tsx` — dynamic field renderer: text input, select, date picker, textarea, number input
- [ ] Write `frontend/src/components/PageHeader/PageHeader.tsx` — title + breadcrumb + action buttons (add, import, export, refresh)
- [ ] Write `frontend/src/components/KpiCard/KpiCard.tsx` — colored card with icon, value, label, trend arrow
- [ ] Write `frontend/src/components/common/Loading.tsx` (skeleton), `EmptyState.tsx` (Ant Empty wrapper), `ErrorBoundary.tsx` (React error boundary per module), `ConfirmModal.tsx` (delete confirmation)
- [ ] Commit: `feat: add shared components (DataGrid, FormModal, PageHeader, KpiCard, common)`

---

## PHASE 15: FRONTEND PAGES

### Task 28: Login Page + Auth Flow

- [ ] Write `frontend/src/modules/auth/pages/LoginPage.tsx` — Ant Design Form: username + password, "Login" button, logo, error alert, loading state; on success: store tokens → fetch /auth/me → redirect to /
- [ ] Write `frontend/src/App.tsx` — QueryClientProvider + RouterProvider + ConfigProvider (Ant Design theme)
- [ ] Write `frontend/src/main.tsx` — ReactDOM.createRoot, App mount
- [ ] Commit: `feat: add login page and auth flow`

### Task 29: Users + Roles + Departments pages

- [ ] Write `frontend/src/modules/users/pages/UserListPage.tsx` — DataGrid with columns (username, email, full_name, department, is_active, last_login, created_at); filters (keyword, department, active); actions: create, edit, delete, reset password, unlock
- [ ] Write `frontend/src/modules/users/pages/UserFormModal.tsx` — FormModal: username, email, full_name, department select, password (create only), is_active toggle
- [ ] Write `frontend/src/modules/roles/pages/RoleListPage.tsx` — DataGrid: code, name, description, status; actions: create, edit, delete, assign permissions
- [ ] Write `frontend/src/modules/roles/pages/RoleFormModal.tsx` — FormModal: code, name, description, status; Permissions tab with checkbox groups by module
- [ ] Write `frontend/src/modules/departments/pages/DepartmentListPage.tsx` — DataGrid: code, name, head_lecturer, status; actions: create, edit, delete
- [ ] Write `frontend/src/modules/departments/pages/DepartmentFormModal.tsx` — FormModal: code, name, description, head_lecturer select, status
- [ ] Commit: `feat: add user, role, and department list pages with forms`

### Task 30: Lecturers + PhD Students pages

- [ ] Write `frontend/src/modules/lecturers/pages/LecturerListPage.tsx` — DataGrid: code, full_name, academic_title, degree, department, email, status; filters (keyword, department, status); summary section (KPI cards); actions: create, edit, delete
- [ ] Write `frontend/src/modules/lecturers/pages/LecturerFormModal.tsx` — FormModal: all 30 fields in tabs (Basic Info, Research, Scholar IDs, Notes)
- [ ] Write `frontend/src/modules/phd-students/pages/PhDStudentListPage.tsx` — DataGrid: code, full_name, cohort, major, status, expected_defense; filters (keyword, cohort, major, status); summary KPI cards (total, studying, defended, no publications); actions: create, edit, delete; expandable row (topic, supervisors, publications)
- [ ] Write `frontend/src/modules/phd-students/pages/PhDStudentFormModal.tsx` — FormModal: basic info fields + status with transition validation
- [ ] Commit: `feat: add lecturer and phd student list pages with forms, summaries, and expandable rows`

---

## PHASE 16: DOCKER + CI/CD

### Task 31: Docker setup

- [ ] Write `backend/Dockerfile`:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p data/backups data/uploads data/imports data/exports data/temp
CMD ["sh", "-c", "alembic upgrade head && python scripts/init_roles.py && python scripts/init_permissions.py && python scripts/create_admin.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```
- [ ] Write `frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```
- [ ] Write `docker-compose.yml`:
```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app", "./backend/data:/app/data"]
    environment:
      - DATABASE_URL=sqlite:///./data/qlncs.db
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend/src:/app/src"]
    depends_on: [backend]
```
- [ ] Commit: `feat: add Docker files and docker-compose for dev environment`

### Task 32: CI/CD pipeline

- [ ] Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r backend/requirements-dev.txt
      - run: cd backend && ruff check app/
      - run: cd backend && mypy app/ --ignore-missing-imports
      - run: cd backend && pytest app/tests/ --cov=app --cov-fail-under=80
      - run: cd backend && bandit -r app/ -ll
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd frontend && npm ci
      - run: cd frontend && npx eslint src/ --ext .ts,.tsx
      - run: cd frontend && npx prettier --check src/
      - run: cd frontend && npx vitest run
```
- [ ] Commit: `feat: add GitHub Actions CI pipeline (lint, type-check, test, security scan)`

### Task 33: README.md + .gitignore

- [ ] Write `README.md` with project overview, tech stack, quick start, project structure, API docs link
- [ ] Write `.gitignore` covering Python (venv, __pycache__, .pytest_cache, data/qlncs.db) and Node (node_modules, dist)
- [ ] Commit: `docs: add README and .gitignore`

---

## IMPLEMENTATION ORDER

1. **Phase 1 (Task 1-2):** Project scaffolding → both BE and FE directories exist
2. **Phase 2 (Task 3-5):** Core layer → config, constants, exceptions, database, security, logging, cache
3. **Phase 3 (Task 6-9):** All 18 models + Alembic migration → database is functional
4. **Phase 4 (Task 10-12):** Common layer → pagination, responses, validators, utilities
5. **Phase 5 (Task 13):** Middleware → auth, permission, logging, exceptions
6. **Phase 6 (Task 14):** Auth module → login/logout working
7. **Phase 7 (Task 15):** Users module → CRUD + management
8. **Phase 8 (Task 16-17):** Roles + Permissions → RBAC complete
9. **Phase 9 (Task 18-19):** Departments + Lecturers → academic data working
10. **Phase 10 (Task 20):** PhD Students → core business rules
11. **Phase 11 (Task 21):** main.py assembly → Swagger complete
12. **Phase 12 (Task 22):** Scripts → init data, seed, backup
13. **Phase 13 (Task 23-24):** Tests → coverage > 80%
14. **Phase 14 (Task 25-27):** Frontend foundation
15. **Phase 15 (Task 28-30):** Frontend pages
16. **Phase 16 (Task 31-33):** Docker + CI/CD

---

## DEFINITION OF DONE

- [ ] All 18 tables created via Alembic
- [ ] All 7 modules have router/model/schemas/repository/service/permissions
- [ ] Swagger at `/api/v1/docs` shows all endpoints
- [ ] Login flow works (admin/admin)
- [ ] RBAC: roles + permissions + user-role assignment functional
- [ ] Business rules R1.1-R1.7, R4.1-R4.2 enforced in service layer
- [ ] `python scripts/run_dev.py` initializes and starts server
- [ ] Tests: `pytest --cov=app` > 80%
- [ ] Frontend: login → main layout → CRUD all entities
- [ ] Docker: `docker-compose up` starts both services
- [ ] CI: GitHub Actions passes lint + typecheck + tests
