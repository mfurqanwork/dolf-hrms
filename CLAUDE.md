# Dolf HRMS — Claude Code Guide

> Multi-tenant HRMS monorepo. Read this before making changes. For the full agent reference, see [AGENTS.md](./AGENTS.md).

## Quick Context

- **Backend:** `backend/app/` — FastAPI + SQLModel + async Postgres + JWT
- **Frontend:** `frontend/src/` — React + TypeScript + shadcn/ui + TanStack Query
- **API:** `http://localhost:8000/api/v1` · **App:** `http://localhost:5173`
- **Tenancy:** Data scoped by `company_id`; roles: `super_admin`, `company_admin`, `employee`

## Project Structure

```
backend/
  alembic/versions/  → Alembic migration revisions
  app/
    api/        → HTTP routers (auth, core, attendance)
    core/       → config, database, migrations, security, deps
    models/     → SQLModel tables (one domain per file)
    schemas/    → Pydantic Read/Create/Update (all in __init__.py)
    services/   → (reserved) extract business logic when routes grow
    crud/       → (reserved) reusable DB queries

frontend/src/
  features/           → Domain pages (EmployeesPage, AttendancePage, …)
  components/ui/      → shadcn primitives — rarely edit
  components/shared/  → Reusable app UI (PageHeader, EmptyState, DataTable wrappers)
  components/layout/  → AppShell, Sidebar, ProtectedRoute, AdminRoute
  hooks/useHrmsApi.ts → ALL TanStack Query hooks + queryKeys
  lib/                → api.ts, types.ts, utils, domain helpers
  stores/             → Zustand (auth)
  i18n/               → EN/AR setup; strings in public/locales/{en,ar}/common.json
```

## Rules You Must Follow

### General

1. **Minimal scope** — Change only what the task needs. No unrelated refactors.
2. **Match existing patterns** — Copy the nearest feature's structure before inventing a new one.
3. **Separation of concerns** — Pages orchestrate; hooks fetch; columns define table UI; lib holds types/utils.

### Frontend

| Do | Don't |
| -- | ----- |
| Put new screens in `features/<domain>/` | Put pages in `src/` root |
| Add API hooks to `useHrmsApi.ts` | Call axios inside page components |
| Extract table defs to `columns.tsx` | Inline large `ColumnDef` arrays in pages |
| Use `@/` imports | Use deep relative paths |
| Use `PageHeader`, `Card`, `DataTable`, `EmptyState`, skeletons | Build one-off page chrome |
| Add strings to **en + ar** `common.json` | Hardcode English UI text |
| Use `AdminRoute` for HR-only pages | Rely on UI-only hiding for auth |

**List page template:** `PageHeader` → loading skeleton → `Card` + `DataTable` → `EmptyState` when no data.

**Types:** Backend shapes mirrored in `frontend/src/lib/types.ts`.

### Backend

| Do | Don't |
| -- | ----- |
| Filter by `company_id` for non-super_admin | Return cross-tenant data |
| Use `require_roles`, `assert_company_access`, `get_user_employee` | Skip auth/tenant checks |
| Return `*Read` Pydantic schemas | Return raw ORM objects |
| Keep routers thin; extract to `services/` when complex | Put 100+ lines of logic in routes |
| Use async `get_session` in API handlers | Add sync DB calls in routes |
| Generate Alembic migration for every model change | Use `create_all` or manual DDL |
| Run `npm run db:check` before committing model changes | Commit model changes without a migration |

Register new routers in `app/main.py` with prefix `/api/v1`.

### Multi-tenancy & roles

```python
# Standard tenant filter pattern
if current_user.role != UserRole.SUPER_ADMIN:
    if current_user.company_id is None:
        raise HTTPException(status_code=400, detail="User has no company")
    query = query.where(Model.company_id == current_user.company_id)
```

Employees see only their own data. Admins see company data. Super admins see all.

## Adding a Feature

**Backend:** model → **migration** (`npm run db:revision -- <msg>`) → schema → router (with guards) → register in `main.py` → `npm run db:check` → test

**Frontend:** types → hooks in `useHrmsApi.ts` → `features/<domain>/` page (+ `columns.tsx`) → route in `App.tsx` → sidebar link → i18n (en + ar)

## Database Migrations

Schema is managed by **Alembic** (`backend/alembic/`). App startup and Docker run `alembic upgrade head` — not `create_all`.

```powershell
npm run db:migrate                      # apply pending migrations
npm run db:revision -- add_leave_table  # autogenerate from model diff
npm run db:check                        # fail if models drift from migrations
npm run db:stamp                        # one-time: mark existing DB as migrated
```

**Required when changing models:** generate migration → review file in `alembic/versions/` → migrate → `db:check` → commit migration with model change.

**Production:** run `alembic upgrade head` before starting the API.

## Commands

```powershell
docker compose up --build          # full stack (migrate → seed → API)
npm run db:migrate                 # apply migrations
npm run db:check                   # verify model/migration sync
cd backend && pytest               # backend tests
cd frontend && npm run lint        # oxlint
cd frontend && npm run test        # vitest
cd frontend && npm run build       # tsc + vite build
```

## Files to Treat as Stable

- `components/ui/*` — shadcn generated; only touch when adding components
- `lib/api.ts` — shared axios + auth interceptors
- `app/core/deps.py` — central auth/tenant helpers
- `docker-compose.yml` — infra; change only when task requires

## Agent Constraints

- Do not commit unless asked.
- Do not create extra markdown files unless asked.
- Do not commit `.env` or secrets.
- When editing attendance, employees, or requests, study those modules first — they are the reference implementations.
- When changing SQLModel tables, always generate an Alembic migration and run `npm run db:check`.
