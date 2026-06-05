# Research Management Platform — Sprint 1 Design Spec

**Date:** 2026-06-05
**Status:** Approved
**Scope:** Sprint 1 — Core Foundation (Database, Auth/RBAC, CRUD, Basic UI)

---

## 1. Tổng quan

### 1.1 Mục tiêu Sprint 1

Xây dựng nền tảng cốt lõi của RMP bao gồm:
- Database schema hoàn chỉnh (18 bảng)
- Authentication (JWT) + RBAC (Roles, Permissions, User-Role mapping)
- CRUD modules: Users, Roles, Permissions, Departments, Lecturers, PhD Students
- Common layer: pagination, filters, responses, validators, file utilities
- Middleware: auth, permission, logging, exception handling, request context
- Scripts: init roles/permissions, create admin, seed data, backup/restore
- Frontend foundation: Layout, Auth, DataGrid, FormModal, Route Guards
- Tests: Unit + Integration + API + Permission Matrix (>80% coverage)
- Docker dev environment + CI/CD pipeline

### 1.2 Kiến trúc

**Backend:** Modular Monolith + Clean Architecture + FastAPI + SQLAlchemy + SQLite
**Frontend:** React 19 + TypeScript + Vite + Ant Design + TanStack Query + Zustand

---

## 2. Kiến trúc thư mục

```
RESEARCH MANAGEMENT PLATFORM/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   ├── exceptions.py
│   │   │   ├── cache.py
│   │   │   └── constants.py
│   │   ├── common/
│   │   │   ├── pagination.py
│   │   │   ├── filters.py
│   │   │   ├── responses.py
│   │   │   ├── validators.py
│   │   │   ├── file_utils.py
│   │   │   ├── excel_utils.py
│   │   │   ├── pdf_utils.py
│   │   │   ├── date_utils.py
│   │   │   ├── string_utils.py
│   │   │   └── query_builder.py
│   │   ├── middleware/
│   │   │   ├── auth_middleware.py
│   │   │   ├── permission_middleware.py
│   │   │   ├── logging_middleware.py
│   │   │   ├── exception_middleware.py
│   │   │   └── request_context_middleware.py
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── departments/
│   │   │   ├── lecturers/
│   │   │   └── phd_students/
│   │   └── tests/
│   │       ├── unit/
│   │       ├── integration/
│   │       ├── api/
│   │       └── performance/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── data/
│   │   ├── qlncs.db
│   │   ├── backups/
│   │   ├── uploads/
│   │   ├── imports/
│   │   ├── exports/
│   │   └── temp/
│   ├── scripts/
│   │   ├── create_admin.py
│   │   ├── init_roles.py
│   │   ├── init_permissions.py
│   │   ├── seed_data.py
│   │   ├── backup_db.py
│   │   ├── restore_db.py
│   │   └── run_dev.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── users.api.ts
│   │   │   ├── roles.api.ts
│   │   │   ├── departments.api.ts
│   │   │   ├── lecturers.api.ts
│   │   │   └── phd-students.api.ts
│   │   ├── components/
│   │   │   ├── DataGrid/
│   │   │   │   ├── DataGrid.tsx
│   │   │   │   ├── ColumnManager.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── BulkActions.tsx
│   │   │   ├── FormModal/
│   │   │   │   ├── FormModal.tsx
│   │   │   │   └── FormField.tsx
│   │   │   ├── PageHeader/
│   │   │   │   └── PageHeader.tsx
│   │   │   ├── KpiCard/
│   │   │   │   └── KpiCard.tsx
│   │   │   └── common/
│   │   │       ├── Loading.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── ConfirmModal.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermission.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useFilter.ts
│   │   ├── layouts/
│   │   │   └── MainLayout/
│   │   │       ├── MainLayout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Breadcrumb.tsx
│   │   ├── modules/
│   │   │   ├── auth/pages/LoginPage.tsx
│   │   │   ├── users/pages/{UserListPage,UserFormModal}.tsx
│   │   │   ├── roles/pages/{RoleListPage,RoleFormModal}.tsx
│   │   │   ├── departments/pages/{DepartmentListPage,DepartmentFormModal}.tsx
│   │   │   ├── lecturers/pages/{LecturerListPage,LecturerFormModal}.tsx
│   │   │   └── phd-students/pages/{PhDStudentListPage,PhDStudentFormModal}.tsx
│   │   ├── routes/
│   │   │   ├── index.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PermissionGuard.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── queryClient.ts
│   │   ├── types/
│   │   │   ├── api.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── role.types.ts
│   │   │   ├── department.types.ts
│   │   │   ├── lecturer.types.ts
│   │   │   └── phd-student.types.ts
│   │   └── utils/
│   │       ├── permissions.ts
│   │       └── formatters.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/
│   └── superpowers/specs/
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

---

## 3. Database Schema (Sprint 1 — 18 bảng)

### 3.1 Core Tables

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| department_id | INTEGER | FK → departments.id |
| avatar | VARCHAR(500) | |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_superuser | BOOLEAN | DEFAULT FALSE |
| last_login_at | DATETIME | |
| password_changed_at | DATETIME | |
| failed_login_attempts | INTEGER | DEFAULT 0 |
| locked_until | DATETIME | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| deleted_at | DATETIME | Soft delete |

Index: `idx_users_email`, `idx_users_department`

**roles**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**permissions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| code | VARCHAR(100) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| module | VARCHAR(50) | NOT NULL |
| action | VARCHAR(20) | NOT NULL |

**role_permissions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| role_id | INTEGER | FK → roles.id |
| permission_id | INTEGER | FK → permissions.id |

Unique: `(role_id, permission_id)`

**user_roles**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| user_id | INTEGER | FK → users.id |
| role_id | INTEGER | FK → roles.id |

Unique: `(user_id, role_id)`

### 3.2 Academic Tables

**departments**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| code | VARCHAR(20) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| head_lecturer_id | INTEGER | FK → lecturers.id |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | |

**lecturers**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| code | VARCHAR(20) | UNIQUE, NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| academic_title | VARCHAR(50) | |
| degree | VARCHAR(50) | |
| position | VARCHAR(100) | |
| email | VARCHAR(255) | UNIQUE |
| phone | VARCHAR(20) | |
| organization | VARCHAR(255) | |
| department_id | INTEGER | FK → departments.id |
| specialization | TEXT | |
| research_interests | TEXT | |
| scholar_url | VARCHAR(500) | |
| scholar_id | VARCHAR(50) | |
| orcid | VARCHAR(20) | |
| scopus_id | VARCHAR(20) | |
| avatar | VARCHAR(500) | |
| note | TEXT | |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | |

**phd_students**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| code | VARCHAR(20) | UNIQUE, NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| date_of_birth | DATE | |
| gender | VARCHAR(10) | |
| email | VARCHAR(255) | UNIQUE |
| phone | VARCHAR(20) | |
| organization | VARCHAR(255) | |
| major | VARCHAR(255) | |
| major_code | VARCHAR(20) | |
| cohort | INTEGER | |
| admission_decision_date | DATE | |
| expected_defense_date | DATE | |
| status | VARCHAR(20) | DEFAULT 'STUDYING' |
| avatar | VARCHAR(500) | |
| note | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | |

**phd_topics**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| phd_student_id | INTEGER | FK → phd_students.id |
| topic_title | VARCHAR(500) | NOT NULL |
| research_direction | TEXT | |
| research_objectives | TEXT | |
| research_methods | TEXT | |
| approval_date | DATE | |
| adjustment_date | DATE | |
| status | VARCHAR(20) | |
| attachment_file | VARCHAR(500) | |
| note | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**phd_topic_histories**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| phd_student_id | INTEGER | FK → phd_students.id |
| old_topic_title | VARCHAR(500) | |
| new_topic_title | VARCHAR(500) | |
| changed_date | DATE | |
| reason | TEXT | |
| attachment_file | VARCHAR(500) | |
| created_at | DATETIME | |

**student_supervisors**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| phd_student_id | INTEGER | FK → phd_students.id |
| lecturer_id | INTEGER | FK → lecturers.id |
| role | VARCHAR(20) | CHINH / PHU |
| start_date | DATE | |
| end_date | DATE | |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' |
| note | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### 3.3 Publication Tables (Schema only in Sprint 1)

**external_authors**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| full_name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | |
| organization | VARCHAR(255) | |
| orcid | VARCHAR(20) | |
| scholar_url | VARCHAR(500) | |
| scholar_id | VARCHAR(50) | |
| note | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**publications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| title | TEXT | NOT NULL |
| publication_year | INTEGER | |
| publication_type | VARCHAR(50) | |
| journal_or_conference_name | VARCHAR(500) | |
| publisher | VARCHAR(255) | |
| doi | VARCHAR(255) | UNIQUE |
| issn | VARCHAR(20) | |
| isbn | VARCHAR(20) | |
| url | VARCHAR(500) | |
| volume | VARCHAR(20) | |
| issue | VARCHAR(20) | |
| pages | VARCHAR(50) | |
| index_type | VARCHAR(50) | |
| quartile | VARCHAR(5) | |
| score | FLOAT | |
| evidence_file | VARCHAR(500) | |
| note | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | |

**publication_indexes**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| publication_id | INTEGER | FK → publications.id |
| index_type | VARCHAR(50) | NOT NULL |
| quartile | VARCHAR(5) | |
| impact_factor | FLOAT | |
| indexed_at | DATETIME | |

Unique: `(publication_id, index_type)`

**publication_authors**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| publication_id | INTEGER | FK → publications.id |
| author_type | VARCHAR(20) | LECTURER / PHD_STUDENT / EXTERNAL |
| lecturer_id | INTEGER | FK → lecturers.id, nullable |
| phd_student_id | INTEGER | FK → phd_students.id, nullable |
| external_author_id | INTEGER | FK → external_authors.id, nullable |
| author_order | INTEGER | |
| is_first_author | BOOLEAN | |
| is_corresponding_author | BOOLEAN | |
| contribution_rate | FLOAT | |
| note | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### 3.4 Scholar Tables (Schema only in Sprint 1)

**scholar_profiles**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| person_type | VARCHAR(20) | LECTURER / PHD_STUDENT / EXTERNAL |
| person_id | INTEGER | |
| orcid | VARCHAR(20) | UNIQUE |
| openalex_id | VARCHAR(50) | |
| scopus_id | VARCHAR(20) | |
| scholar_url | VARCHAR(500) | |
| scholar_id | VARCHAR(50) | |
| display_name | VARCHAR(255) | |
| affiliation | VARCHAR(500) | |
| total_citations | INTEGER | |
| h_index | INTEGER | |
| i10_index | INTEGER | |
| data_source | VARCHAR(50) | |
| last_sync_at | DATETIME | |
| sync_status | VARCHAR(20) | |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | |

**scholar_sync_logs**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| scholar_profile_id | INTEGER | FK → scholar_profiles.id |
| sync_time | DATETIME | |
| status | VARCHAR(20) | |
| message | TEXT | |
| total_publications_found | INTEGER | |
| total_publications_imported | INTEGER | |
| created_at | DATETIME | |

### 3.5 System Tables

**audit_logs**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| user_id | INTEGER | FK → users.id, nullable |
| action | VARCHAR(50) | NOT NULL |
| entity_type | VARCHAR(50) | |
| entity_id | INTEGER | |
| changes | JSON | |
| ip_address | VARCHAR(50) | |
| user_agent | VARCHAR(500) | |
| request_id | VARCHAR(50) | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**research_projects** (Schema only in Sprint 1)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| project_level | VARCHAR(50) | |
| project_type | VARCHAR(50) | |
| research_field | VARCHAR(255) | |
| principal_investigator_id | INTEGER | FK → lecturers.id |
| host_organization | VARCHAR(255) | |
| start_date | DATE | |
| end_date | DATE | |
| total_budget | FLOAT | |
| funding_source | VARCHAR(255) | |
| status | VARCHAR(20) | |
| acceptance_result | VARCHAR(50) | |
| acceptance_grade | VARCHAR(20) | |
| created_at | DATETIME | |
| updated_at | DATETIME | |
| deleted_at | DATETIME | |

---

## 4. Module Design

### 4.1 Module Structure Template

Mỗi module có cấu trúc chuẩn:
```
module_name/
├── router.py       # API endpoints
├── model.py        # SQLAlchemy model
├── schemas.py      # Pydantic schemas (Create, Update, Response, Filter)
├── repository.py   # Database queries
├── service.py      # Business logic
├── permissions.py  # Permission constants
└── tests/
```

### 4.2 Core Layer (`backend/app/core/`)

| File | Chức năng |
|------|-----------|
| `config.py` | Pydantic BaseSettings: APP_NAME, DATABASE_URL, SECRET_KEY, JWT_EXPIRE_MINUTES, CORS_ORIGINS, UPLOAD_DIR, BACKUP_DIR |
| `database.py` | SQLAlchemy engine, SessionLocal, Base Model, get_db dependency |
| `security.py` | bcrypt: hash_password(), verify_password() — JWT: create_access_token(), create_refresh_token(), decode_token() |
| `exceptions.py` | AppException, NotFoundException, PermissionDeniedException, BusinessRuleException, ValidationException |
| `logging.py` | Structured JSON logging với rotation (30MB/file, max 30 files) |
| `cache.py` | Multi-tier: L1 cachetools.TTLCache (5ph dashboard, 30ph lookup), cache decorator, invalidation |
| `constants.py` | Enum: PhdStudentStatus, ProjectStatus, PublicationType, SupervisorRole, AuthorType |

### 4.3 Common Layer (`backend/app/common/`)

| File | Chức năng |
|------|-----------|
| `pagination.py` | `PaginationParams` (page, page_size), `PaginationResponse` (total, total_pages, has_next, has_prev) |
| `filters.py` | `BaseFilter` (keyword, date_range, status, sort_by, sort_order), `apply_filters()` |
| `responses.py` | `success_response()`, `error_response()`, `paginated_response()` — format JSON chuẩn |
| `validators.py` | validate_email, validate_phone, validate_doi, validate_orcid, validate_file_type |
| `file_utils.py` | save_upload, delete_file, get_file_path, check_file_size |
| `excel_utils.py` | read_excel, write_excel, create_template, validate_columns |
| `pdf_utils.py` | generate_pdf (placeholder Sprint 1) |
| `date_utils.py` | format_date, parse_date_range, calculate_duration |
| `string_utils.py` | slugify, normalize_search, fuzzy_match, title_similarity |
| `query_builder.py` | build_search_query, apply_sorting, apply_pagination |

### 4.4 Middleware (`backend/app/middleware/`)

| Middleware | Thứ tự | Chức năng |
|-----------|--------|-----------|
| `request_context_middleware.py` | 1 | Gán request_id, ip_address, user_agent |
| `logging_middleware.py` | 2 | Ghi log: method, URL, user, IP, status, duration |
| `exception_middleware.py` | 3 | Bắt lỗi → format JSON `{ success: false, message, errors }` |
| `auth_middleware.py` | 4 | Giải mã JWT → gán `request.state.current_user` |
| `permission_middleware.py` | 5 | Check required permission từ route → 403 nếu thiếu |

### 4.5 Auth Module

**API Endpoints:**
| Method | Endpoint | Auth | Rate Limit | Mô tả |
|--------|----------|------|------------|-------|
| POST | `/api/v1/auth/login` | Public | 10/min | Login → access + refresh tokens |
| POST | `/api/v1/auth/logout` | Authenticated | 10/min | Logout + audit log |
| POST | `/api/v1/auth/refresh` | Public | 10/min | Refresh access token |
| GET | `/api/v1/auth/me` | Authenticated | 100/min | Current user profile |
| GET | `/api/v1/auth/my-permissions` | Authenticated | 100/min | User permissions list |

**Business Rules:**
- Account lockout: 5 lần login sai → khóa 15 phút
- Password: bcrypt hash, min 8 ký tự, phải có chữ hoa + số
- Access token: 30 phút, Refresh token: 7 ngày
- JWT payload: `{ sub: user_id, username: username, exp: timestamp }`

### 4.6 Users Module

**API Endpoints:**
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/users` | `users.view` |
| GET | `/api/v1/users/{id}` | `users.view` |
| POST | `/api/v1/users` | `users.create` |
| PUT | `/api/v1/users/{id}` | `users.update` |
| DELETE | `/api/v1/users/{id}` | `users.delete` |
| POST | `/api/v1/users/{id}/reset-password` | `users.update` |
| POST | `/api/v1/users/{id}/unlock` | `users.update` |
| PUT | `/api/v1/users/me/password` | Authenticated |

**Features:** Soft delete (deleted_at), server-side pagination, keyword search, filter by department/status/is_active

### 4.7 Roles Module

**API Endpoints:**
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/roles` | `roles.view` |
| GET | `/api/v1/roles/{id}` | `roles.view` |
| POST | `/api/v1/roles` | `roles.create` |
| PUT | `/api/v1/roles/{id}` | `roles.update` |
| DELETE | `/api/v1/roles/{id}` | `roles.delete` |
| PUT | `/api/v1/roles/{id}/permissions` | `roles.update` |

**8 Default Roles:** System Admin, Dean, Vice Dean, Department Head, Lecturer, Supervisor, Academic Staff, Viewer

### 4.8 Permissions Module

**API Endpoints:**
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/permissions` | `permissions.view` |
| GET | `/api/v1/permissions/modules` | `permissions.view` |

**32 Default Permissions** — grouped by module: users(4), roles(4), permissions(1), departments(4), lecturers(6), phd_students(6), dashboard(1), audit_logs(1), backup(2), imports(2), exports(1)

### 4.9 Departments Module

**API Endpoints:**
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/departments` | `departments.view` |
| GET | `/api/v1/departments/{id}` | `departments.view` |
| POST | `/api/v1/departments` | `departments.create` |
| PUT | `/api/v1/departments/{id}` | `departments.update` |
| DELETE | `/api/v1/departments/{id}` | `departments.delete` |
| GET | `/api/v1/departments/{id}/lecturers` | `lecturers.view` |

### 4.10 Lecturers Module

**API Endpoints:**
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/lecturers` | `lecturers.view` |
| GET | `/api/v1/lecturers/summary` | `lecturers.view` |
| GET | `/api/v1/lecturers/{id}` | `lecturers.view` |
| POST | `/api/v1/lecturers` | `lecturers.create` |
| PUT | `/api/v1/lecturers/{id}` | `lecturers.update` |
| DELETE | `/api/v1/lecturers/{id}` | `lecturers.delete` |
| GET | `/api/v1/lecturers/{id}/publications` | `lecturers.view` |
| GET | `/api/v1/lecturers/{id}/students` | `lecturers.view` |
| GET | `/api/v1/lecturers/{id}/graph` | `lecturers.view` |

### 4.11 PhD Students Module

**API Endpoints:**
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/phd-students` | `phd_students.view` |
| GET | `/api/v1/phd-students/summary` | `phd_students.view` |
| GET | `/api/v1/phd-students/{id}` | `phd_students.view` |
| POST | `/api/v1/phd-students` | `phd_students.create` |
| PUT | `/api/v1/phd-students/{id}` | `phd_students.update` |
| DELETE | `/api/v1/phd-students/{id}` | `phd_students.delete` |
| GET | `/api/v1/phd-students/{id}/topic` | `phd_students.view` |
| GET | `/api/v1/phd-students/{id}/publications` | `phd_students.view` |
| GET | `/api/v1/phd-students/{id}/supervisors` | `phd_students.view` |
| POST | `/api/v1/phd-students/{id}/supervisors` | `phd_students.update` |
| GET | `/api/v1/phd-students/{id}/graph` | `phd_students.view` |

**Business Rules (service layer):**
- R1.1: NCS có tối đa 2 GVHD (1 chính + 1 phụ)
- R1.2: GVHD chính phải có học vị ≥ Tiến sĩ
- R1.3: GVHD phải có ≥ 2 bài ISI/Scopus 5 năm gần nhất
- R1.4: 1 GV hướng dẫn tối đa 5 NCS cùng lúc
- R1.6: Trạng thái NCS: STUDYING → (LEAVE → STUDYING) → EXTENDED → DEFENDED / DROPPED
- R4.1: GV đủ điều kiện hướng dẫn khi: (a) học vị Tiến sĩ, (b) ≥ 2 bài ISI/Scopus 5 năm gần nhất, (c) không bị kỷ luật

---

## 5. Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "pagination": null
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

---

## 6. Frontend Design

### 6.1 Technology Stack
- React 19 + TypeScript + Vite
- Ant Design 5 (UI components)
- TanStack Query 5 (server state)
- Zustand (UI state)
- React Hook Form + Zod (form validation)
- Axios (HTTP client)
- React Router 6 (routing)
- ECharts + Cytoscape.js (placeholder)

### 6.2 State Management Strategy
- **Server State:** TanStack Query — single source of truth for API data
- **UI State:** Zustand — sidebar, theme, current filters
- **Form State:** React Hook Form + Zod — type-safe validation
- **Global Config:** React Context — currentUser, permissions, tenant
- **Principle:** "Server state belongs to the server" — no API data duplication in Redux/Zustand

### 6.3 Component Patterns

**DataGrid** — Enterprise table wrapper:
- Server-side pagination (10/20/50/100/200 rows)
- Multi-column sort
- Keyword search + status filter + date range filter
- Column manager (hide/show/reorder/resize)
- Bulk actions (delete, export, status update)
- Permission-gated action buttons

**FormModal** — Create/Edit modal:
- React Hook Form controlled inputs
- Zod schema validation
- Dynamic field configuration
- Loading state + error display
- Unsaved changes warning

**MainLayout:**
- Header: Logo | Breadcrumb | Global Search | Notification Bell | User Menu (Light/Dark toggle)
- Sidebar: Collapsible, permission-filtered menu items
- Content: PageHeader + children
- Footer: Version + copyright

### 6.4 Auth Flow (Frontend)
```
1. User visits app → ProtectedRoute checks authStore
2. No token → redirect /login
3. LoginPage → POST /auth/login → store tokens in Zustand (persist localStorage)
4. Axios interceptor: auto-attach Authorization header
5. 401 response → try refresh token → fail → clear auth → redirect /login
6. GET /auth/me → store user info + permissions in authStore
7. PermissionGuard: check required permission → 403 page if missing
8. In-component: can('users.create') → show/hide buttons
```

### 6.5 Route Structure
```
/login                          → Public (LoginPage)
/                               → ProtectedRoute → MainLayout
  /dashboard                    → PermissionGuard(dashboard.view) → TBD Sprint 3
  /phd-students                 → PermissionGuard(phd_students.view) → PhDStudentListPage
  /phd-students/:id             → PhDStudentDetailPage
  /lecturers                    → PermissionGuard(lecturers.view) → LecturerListPage
  /departments                  → PermissionGuard(departments.view) → DepartmentListPage
  /users                        → PermissionGuard(users.view) → UserListPage
  /roles                        → PermissionGuard(roles.view) → RoleListPage
  /profile                      → Authenticated → ProfilePage
  /403                          → ForbiddenPage
  /*                            → NotFoundPage
```

---

## 7. Scripts

| Script | Mục đích |
|--------|----------|
| `init_roles.py` | Insert 8 roles mặc định |
| `init_permissions.py` | Insert 32 permissions mặc định |
| `create_admin.py` | Tạo admin user + gán System Admin role |
| `seed_data.py` | Tạo dữ liệu mẫu: 5 departments, 20 lecturers, 30 phd_students, 5 topics, 10 supervisions |
| `backup_db.py` | Copy qlncs.db to backups/ với timestamp |
| `restore_db.py` | Restore từ file backup |
| `run_dev.py` | Init sequence → start uvicorn |

---

## 8. Testing Strategy

### 8.1 Coverage Targets
- Unit Tests: 70% of test cases, >80% code coverage
- Integration Tests: 20% — API tests with TestClient + SQLite in-memory
- Permission Matrix: 8 roles × 20+ endpoints

### 8.2 Test Structure
```
tests/
├── conftest.py
├── unit/
│   ├── test_security.py
│   ├── test_validators.py
│   ├── test_pagination.py
│   └── test_business_rules.py
├── integration/
│   ├── test_auth_api.py
│   ├── test_users_api.py
│   ├── test_roles_api.py
│   ├── test_departments_api.py
│   ├── test_lecturers_api.py
│   └── test_phd_students_api.py
├── api/
│   └── test_permissions.py
└── performance/
    └── test_crud_performance.py
```

### 8.3 Tools
- Backend: pytest + pytest-cov + pytest-asyncio + FastAPI TestClient
- Frontend: Vitest + React Testing Library
- Security: Bandit (SAST) + Safety (dependency scan)
- Lint: Ruff + MyPy (backend), ESLint + Prettier (frontend)

---

## 9. Docker & CI/CD

### 9.1 Docker Compose (Dev)
```yaml
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

### 9.2 CI/CD Pipeline (GitHub Actions)
```
on: [push, pull_request] → main/develop
  1. Checkout
  2. Setup Python 3.12 + Node 20
  3. Backend: pip install → Ruff lint → MyPy → pytest --cov → Bandit → Safety
  4. Frontend: npm ci → ESLint → Prettier → Vitest
  5. Build Docker images
  6. Push to ghcr.io
  7. Deploy to staging (SSH + docker-compose up -d)
  8. Smoke test (curl health check)
```

---

## 10. NFR Verification

| Requirement | Target | Verification Method |
|-------------|--------|---------------------|
| API CRUD p95 < 200ms | 100K records with index | Locust load test |
| 50 concurrent users | No degradation | Locust |
| Code coverage > 80% | pytest-cov | CI gate |
| Account lockout | 5 attempts → 15min lock | Integration test |
| Soft delete | deleted_at IS NULL filter | Unit test |
| Audit log immutable | No UPDATE/DELETE on audit_logs | Unit test |
| Backup daily | cron job | Manual verification |

---

## 11. Definition of Done (Sprint 1)

- [x] Design spec approved
- [ ] All 18 tables created via Alembic migration
- [ ] Core layer: config, database, security, exceptions, cache, constants, logging
- [ ] Common layer: pagination, filters, responses, validators, file_utils, excel_utils, date_utils, string_utils, query_builder
- [ ] Middleware: auth, permission, exception, logging, request_context
- [ ] Auth: login, logout, refresh, me, my-permissions
- [ ] Users CRUD: list (paginated), detail, create, update, delete (soft), reset password, unlock, change password
- [ ] Roles CRUD: list, detail, create, update, delete, assign permissions
- [ ] Permissions: list, grouped by module
- [ ] Departments CRUD: list, detail, create, update, delete
- [ ] Lecturers CRUD: list (paginated, filtered), detail, create, update, delete, summary
- [ ] PhD Students CRUD: list (paginated, filtered), detail, create, update, delete, summary
- [ ] Business rules: R1.1-R1.7, R4.1-R4.2
- [ ] Scripts: init_roles, init_permissions, create_admin, seed_data, backup_db
- [ ] Tests: Unit > 80%, Integration, Permission Matrix
- [ ] Code review + lint pass (Ruff, MyPy, ESLint, Prettier)
- [ ] Frontend: Login, Layout, Users, Roles, Departments, Lecturers, PhD Students pages
- [ ] Route guards (auth + permission)
- [ ] Docker dev environment working
- [ ] CI/CD pipeline green
- [ ] Swagger docs updated
- [ ] Deployed on staging, demo ready
