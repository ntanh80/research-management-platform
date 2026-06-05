# Research Management Platform (RMP)

Hệ thống quản lý nghiên cứu khoa học cấp khoa/trường, phục vụ quản lý nghiên cứu sinh, giảng viên, công trình khoa học, đề tài nghiên cứu, và phân tích mạng lưới cộng tác.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, SQLite |
| Authentication | JWT (Access + Refresh Token), bcrypt |
| API Docs | Swagger (OpenAPI) via FastAPI |
| Frontend | React 19, TypeScript, Vite, Ant Design 5 |
| State | TanStack Query 5 (server), Zustand (UI), React Hook Form + Zod |
| Charts | ECharts, Cytoscape.js (Sprint 3+) |
| DevOps | Docker, Docker Compose, GitHub Actions CI |

## Quick Start

### Development

```bash
# Backend
cd backend
pip install -r requirements.txt
python scripts/run_dev.py
# API: http://localhost:8000
# Docs: http://localhost:8000/api/v1/docs

# Frontend
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

**Default account:** `admin` / `Admin@123`

### Docker

```bash
docker-compose up -d
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

## Features

### Sprint 1 (Current)

| Module | API Routes | Features |
|--------|-----------|----------|
| Auth | 5 | Login, logout, refresh token, user profile, permissions |
| Users | 8 | CRUD, soft delete, reset password, unlock, change password |
| Roles | 6 | CRUD, assign permissions |
| Permissions | 2 | Catalog grouped by module (32 permissions) |
| Departments | 6 | CRUD, list lecturers |
| Lecturers | 9 | CRUD, summary, eligibility check (R4.1) |
| PhD Students | 11 | CRUD, summary, filters, supervisor assignment (R1.1-R1.7) |

### Business Rules

- **R1.1:** NCS có tối đa 2 người hướng dẫn (1 chính + 1 phụ)
- **R1.2:** GVHD chính phải có học vị ≥ Tiến sĩ
- **R1.3:** GVHD phải có ≥ 2 bài ISI/Scopus trong 5 năm gần nhất
- **R1.4:** Một GV hướng dẫn tối đa 5 NCS cùng lúc
- **R1.5:** NCS cần ≥ 2 công trình (≥ 1 ISI/Scopus) để bảo vệ
- **R1.6:** Transition trạng thái NCS có kiểm tra hợp lệ
- **R1.7:** Thời gian học tối đa 6 năm
- **R4.1:** GV đủ điều kiện hướng dẫn: (a) học vị Tiến sĩ, (b) ≥ 2 bài ISI/Scopus 5 năm, (c) không bị kỷ luật

### RBAC

| Role | Quyền |
|------|-------|
| System Admin | Toàn quyền + audit logs + backup |
| Dean | Xem toàn khoa, dashboard |
| Vice Dean | Xem toàn khoa |
| Department Head | Xem/sửa trong bộ môn |
| Lecturer | Xem/sửa dữ liệu cá nhân |
| Supervisor | Lecturer + xem NCS được hướng dẫn |
| Academic Staff | CRUD giảng viên, NCS |
| Viewer | Chỉ xem |

## Database

19 bảng: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `departments`, `lecturers`, `phd_students`, `phd_topics`, `phd_topic_histories`, `student_supervisors`, `external_authors`, `publications`, `publication_indexes`, `publication_authors`, `scholar_profiles`, `scholar_sync_logs`, `research_projects`, `audit_logs`

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── core/                 # config, database, security, exceptions, cache, constants, logging
│   │   ├── common/               # pagination, filters, responses, validators, file/excel/query utils
│   │   ├── middleware/            # auth (JWT), permission (RBAC), logging, exception, request_context
│   │   ├── models/               # 19 SQLAlchemy models
│   │   ├── modules/              # 7 feature modules (auth, users, roles, permissions, departments, lecturers, phd_students)
│   │   └── tests/                # unit, integration, API tests (52 passing)
│   ├── alembic/                  # Database migrations
│   ├── scripts/                  # init_roles, init_permissions, create_admin, seed_data, backup_db, run_dev
│   └── data/                     # SQLite DB, backups, uploads
├── frontend/
│   └── src/
│       ├── api/                  # Axios + API modules
│       ├── components/           # DataGrid, FormModal, PageHeader, KpiCard, common
│       ├── hooks/                # useAuth, usePermission
│       ├── layouts/              # MainLayout (Header + Sidebar + Content)
│       ├── modules/              # auth, users, roles, departments, lecturers, phd-students, dashboard
│       ├── routes/               # ProtectedRoute, PermissionGuard, route config
│       ├── store/                # Zustand (auth, ui) + TanStack Query client
│       └── types/                # TypeScript interfaces
├── docs/                         # Design spec + Implementation plan
├── docker-compose.yml
└── .github/workflows/ci.yml      # CI pipeline
```

## API Standard

```json
// Success
{ "success": true, "message": "Success", "data": {}, "pagination": null }
// Paginated
{ "success": true, "data": [], "pagination": { "page": 1, "page_size": 20, "total": 100, "total_pages": 5, "has_next": true, "has_prev": false } }
// Error
{ "success": false, "message": "Error", "errors": [{ "field": "email", "message": "Email already exists" }] }
```

## Tests

```bash
cd backend
pytest app/tests/ --cov=app --cov-report=term-missing
# 52 tests passing (unit + integration)
```

## Scripts

| Script | Purpose |
|--------|---------|
| `python scripts/run_dev.py` | Init DB → roles → permissions → admin → seed → start server |
| `python scripts/init_roles.py` | Create 8 default roles |
| `python scripts/init_permissions.py` | Create 32 permissions, assign to System Admin |
| `python scripts/create_admin.py` | Create admin user (admin/Admin@123) |
| `python scripts/seed_data.py` | Create 5 departments, 20 lecturers, 30 PhD students |
| `python scripts/backup_db.py` | Backup SQLite database |
| `python scripts/restore_db.py <file>` | Restore from backup |

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | `sqlite:///./data/qlncs.db` | Database connection string |
| SECRET_KEY | `change-me-...` | JWT signing key |
| ACCESS_TOKEN_EXPIRE_MINUTES | `30` | Access token lifetime |
| REFRESH_TOKEN_EXPIRE_DAYS | `7` | Refresh token lifetime |
| CORS_ORIGINS | `["http://localhost:3000"]` | Allowed origins |
| ACCOUNT_LOCKOUT_ATTEMPTS | `5` | Max failed login attempts |
| ACCOUNT_LOCKOUT_MINUTES | `15` | Lockout duration |

## License

MIT
