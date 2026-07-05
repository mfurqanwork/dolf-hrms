# Dolf HRMS — Agent Guide

This document tells AI coding agents how this repo is organized, what conventions to follow, and how to add features without breaking existing patterns.

## Project Overview

**Dolf HRMS** is a multi-tenant HR management MVP (monorepo).

| Layer    | Stack                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| Backend  | FastAPI, SQLModel, async PostgreSQL, JWT auth                                                                   |
| Frontend | React 19, TypeScript, Vite, Tailwind 4, shadcn/ui, TanStack Query, React Router, Zustand, i18next (EN/AR + RTL) |
| Infra    | Docker Compose (Postgres + API + frontend)                                                                      |

- API base: `http://localhost:8000/api/v1`
- Frontend dev: `http://localhost:5173`
- All routes are tenant-aware via `company_id` (except `super_admin`).

## Repository Layout

```
dolftech-hrms/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/             # HTTP route handlers (routers)
│   │   ├── core/            # Config, DB, security, auth deps
│   │   ├── models/          # SQLModel table definitions
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── crud/            # (reserved) DB access helpers
│   │   └── services/        # (reserved) business logic
│   ├── alembic/             # Database migrations (Alembic)
│   │   └── versions/        # One file per schema revision
│   ├── alembic.ini
│   ├── scripts/             # Seed & one-off scripts
├── frontend/
│   ├── public/locales/      # i18n JSON (en/, ar/)
│   └── src/
│       ├── features/        # Domain pages & feature UI
│       ├── components/
│       │   ├── ui/          # shadcn primitives (low-level)
│       │   ├── shared/      # Reusable app components
│       │   └── layout/      # Shell, sidebar, route guards
│       ├── hooks/             # TanStack Query hooks
│       ├── lib/               # API client, types, utilities
│       ├── stores/            # Zustand global state
│       └── i18n/              # i18next setup
│   └── tests/
├── package.json             # Root monorepo scripts (db:migrate, test, dev)
└── README.md
```

## Core Principles

1. **Separation of concerns** — UI, data fetching, types, and API logic live in distinct layers. Do not mix them in one file.
2. **Feature-first frontend** — New screens go under `src/features/<domain>/`, not loose files in `src/`.
3. **Reuse before reinvent** — Use existing shared components (`PageHeader`, `DataTable`, `EmptyState`, `LoadingState`, etc.) and shadcn/ui primitives.
4. **Match neighboring code** — Follow the style of the file or feature you are editing (imports, naming, formatting).
5. **Minimal diffs** — Only change what the task requires. No drive-by refactors.
6. **Multi-tenant safety** — Every backend query must respect `company_id` and role checks. Never expose cross-tenant data.
7. **i18n by default** — User-facing strings use `t("common.*")` keys in **both** `en` and `ar` locale files.

---

## Frontend Architecture

### Path alias

Use `@/` for all `src/` imports (configured in `tsconfig.app.json`).

```ts
import { useEmployees } from "@/hooks/useHrmsApi";
import { PageHeader } from "@/components/shared/PageHeader";
```

### Folder responsibilities

| Folder               | Purpose                  | Put here                                                       |
| -------------------- | ------------------------ | -------------------------------------------------------------- |
| `features/<domain>/` | Domain screens           | `*Page.tsx`, feature-only components, `columns.tsx`            |
| `components/ui/`     | shadcn primitives        | Buttons, cards, tables — generated/low-level                   |
| `components/shared/` | Cross-feature UI         | `PageHeader`, `StatCard`, `EmptyState`, `BoolBadge`            |
| `components/layout/` | App chrome & guards      | `AppShell`, `Sidebar`, `ProtectedRoute`, `AdminRoute`          |
| `hooks/`             | Data layer (React Query) | `useHrmsApi.ts` — all API hooks + `queryKeys`                  |
| `lib/`               | Pure utilities & config  | `api.ts`, `types.ts`, `utils.ts`, `datetime.ts`, `employee.ts` |
| `stores/`            | Client global state      | Zustand stores (auth today)                                    |

### Standard list page pattern

Follow `EmployeesPage` and `AttendancePage`:

1. `PageHeader` with breadcrumbs
2. Loading → `CardTablePageSkeleton`
3. Content → `Card` + `DataTable` or feature component
4. Empty → `EmptyState`
5. Table columns → separate `columns.tsx` with a factory like `getEmployeeColumns(t)`

```tsx
// features/employees/EmployeesPage.tsx — orchestration only
const { data = [], isLoading } = useEmployees();
const columns = useMemo(() => getEmployeeColumns(t), [t]);
```

```tsx
// features/employees/columns.tsx — presentation for table cells
export function getEmployeeColumns(t: TFunction): ColumnDef<Employee>[] { ... }
```

### Data fetching rules

- **All** server state goes through `hooks/useHrmsApi.ts`.
- Define `queryKeys` centrally; invalidate related keys in mutation `onSuccess`.
- Use the shared `api` axios instance from `lib/api.ts` (handles JWT + 401 logout).
- Mirror backend response shapes in `lib/types.ts`.

### Routing & access control

- Routes are declared in `App.tsx`.
- `ProtectedRoute` — requires auth token.
- `AdminRoute` — blocks `employee` role (HR/admin-only pages).
- Add new routes inside the `AppShell` layout unless public (like `/login`).

### UI & styling

- Tailwind utility classes; use `cn()` from `lib/utils.ts` for conditional classes.
- Brand accent: orange (`#f97316`) for avatars/accents.
- RTL: use logical properties (`ms-`, `me-`) and `rtl:` variants where needed (see `PageHeader` back button).
- Toast notifications via `sonner` (`Toaster` in `main.tsx`).

### i18n

- Keys live in `public/locales/en/common.json` and `public/locales/ar/common.json`.
- Namespace is `common.*` under the `translation` bundle.
- **Always update both languages** when adding user-visible text.
- Language preference: `localStorage` key `hrms-lang`; direction flips automatically for Arabic.

### What NOT to do (frontend)

- Do not call `axios` directly in page components — use hooks in `useHrmsApi.ts`.
- Do not put feature-specific logic in `components/shared/`.
- Do not edit `components/ui/*` unless adding a new shadcn component or fixing a primitive.
- Do not hardcode English strings on user-facing UI.
- Do not add a second state library; use TanStack Query for server state, Zustand for client auth state.

---

## Backend Architecture

### Layer responsibilities

| Layer    | Location        | Responsibility                                                 |
| -------- | --------------- | -------------------------------------------------------------- |
| Routes   | `app/api/`      | HTTP handling, auth deps, status codes                         |
| Schemas  | `app/schemas/`  | Pydantic `*Read`, `*Create`, `*Update` models                  |
| Models   | `app/models/`   | SQLModel tables, relationships, enums                          |
| Core     | `app/core/`     | Settings, DB session, JWT, `get_current_user`, `require_roles` |
| Services | `app/services/` | (future) complex business logic extracted from routes          |
| CRUD     | `app/crud/`     | (future) reusable DB queries                                   |

Currently business logic lives in route modules (`router.py`, `attendance.py`, `auth.py`). When logic grows beyond ~30 lines or is reused, extract to `app/services/`.

### API conventions

- Prefix: `/api/v1` (registered in `main.py`).
- Use `Annotated[..., Depends(...)]` for dependency injection.
- Return Pydantic `response_model` types from `app/schemas`.
- Use `HTTPException` with appropriate status codes (401, 403, 404, 400).
- Map DB models → read schemas via helper functions (e.g. `employee_to_read`, `_attendance_to_read`).

### Auth & multi-tenancy

Roles (`UserRole` enum):

| Role            | Access                                  |
| --------------- | --------------------------------------- |
| `super_admin`   | All companies                           |
| `company_admin` | Own `company_id` only                   |
| `employee`      | Own profile, own requests, check-in/out |

Use these deps from `app/core/deps.py`:

- `get_current_user` — JWT validation
- `require_roles(...)` — role gate
- `get_user_employee` — link user → employee record
- `assert_company_access` — block cross-tenant access

**Every list/detail endpoint** must filter by role:

```python
if current_user.role != UserRole.SUPER_ADMIN:
    query = query.where(Model.company_id == current_user.company_id)
```

### Models & schemas

- One model per file in `app/models/` (e.g. `employee.py`, `attendance.py`).
- Export schemas from `app/schemas/__init__.py`.
- Use SQLModel `Relationship` with `TYPE_CHECKING` imports to avoid circular refs.
- Table names: plural snake_case (`employees`, `attendance_records`).

### Database & migrations

Schema changes are managed with **Alembic** — never use `SQLModel.metadata.create_all` in application code.

| Piece                         | Location                                              |
| ----------------------------- | ----------------------------------------------------- |
| Migration config              | `backend/alembic.ini`, `backend/alembic/env.py`       |
| Revision files                | `backend/alembic/versions/`                           |
| Runtime runner                | `app/core/migrations.py` → `init_db()` on app startup |
| Sync driver (migrations only) | `settings.sync_database_url` (`psycopg2`)             |

**Startup flow:** `alembic upgrade head` → seed (Docker) → API serves requests.

#### When you add or change a model

1. Edit the SQLModel in `app/models/`.
2. Ensure the backend venv exists (`backend/.venv` with `pip install -r requirements.txt`).
3. **Generate a migration** (dev database must be running). If models match the DB, no file is created:

   ```powershell
   # From repo root
   npm run db:revision -- describe_change_here

   # Or from backend/
   npm run db:revision -- describe_change_here
   ```

   Output when nothing changed: `No schema changes detected. No migration file was created.`

4. **Review** the generated file in `alembic/versions/` — autogenerate is not perfect; fix enums, defaults, and renames manually.
5. **Apply locally:**

   ```powershell
   npm run db:migrate
   ```

6. **Verify models match migrations** (run before committing):

   ```powershell
   npm run db:check
   ```

   This fails if model changes exist without a corresponding migration file.

7. **Commit the migration file** alongside the model change. Production and Docker apply it via `alembic upgrade head`.

#### Migration commands (root `package.json`)

| Command                            | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| `npm run db:migrate`               | Apply all pending migrations (`upgrade head`)       |
| `npm run db:revision -- <message>` | Autogenerate migration; skips file creation when schema unchanged |
| `npm run db:check`                 | Fail if models drift from latest migration          |
| `npm run db:current`               | Show current revision                               |
| `npm run db:history`               | List migration history                              |
| `npm run db:stamp`                 | Mark DB as migrated without running SQL (see below) |
| `npm run db:seed`                  | Run seed script (after migrations)                  |

#### Existing databases (one-time)

If your local DB was created with the old `create_all` approach and already has tables, stamp it once instead of re-running the initial migration:

```powershell
npm run db:stamp
```

Only do this when the live schema already matches the latest migration.

#### Dev vs production

| Environment    | What runs migrations                                              |
| -------------- | ----------------------------------------------------------------- |
| Local dev      | `npm run db:migrate` manually, or app startup via `init_db()`     |
| Docker Compose | `alembic upgrade head` before seed in `docker-compose.yml`        |
| Production     | `alembic upgrade head` as a deploy step (before starting uvicorn) |

- Async SQLAlchemy session via `get_session` dependency for API handlers.
- Seed data: `python -m scripts.seed` (also runs in Docker after migrations).

### What NOT to do (backend)

- Do not bypass `assert_company_access` or role checks.
- Do not return raw SQLModel instances when a `*Read` schema exists.
- Do not put Pydantic schemas in model files.
- Do not commit secrets (`.env`, `SECRET_KEY`); use `.env.example` as reference.
- Do not use `create_all` or raw DDL — always generate an Alembic migration.
- Do not change models without running `npm run db:check` before committing.
- Do not add sync DB calls in API handlers — Alembic migrations use sync `psycopg2` only.

---

## Adding a New Feature (Checklist)

### Backend

1. Add/update SQLModel in `app/models/`.
2. **Generate and review migration:** `npm run db:revision -- <message>` then `npm run db:migrate` and `npm run db:check`.
3. Add Pydantic schemas in `app/schemas/__init__.py`.
4. Create router in `app/api/<domain>.py` with role + tenant guards.
5. Register router in `app/main.py` under `/api/v1`.
6. Add pytest coverage for auth boundaries and happy path.

### Frontend

1. Add types to `lib/types.ts`.
2. Add `queryKeys` + hooks in `hooks/useHrmsApi.ts`.
3. Create `features/<domain>/<Domain>Page.tsx`.
4. Extract table columns to `features/<domain>/columns.tsx` if applicable.
5. Add route in `App.tsx` (+ `AdminRoute` if admin-only).
6. Add sidebar link in `components/layout/Sidebar.tsx` if needed.
7. Add i18n keys to **both** `en/common.json` and `ar/common.json`.

---

## Testing & Quality

```powershell
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
cd frontend && npm run lint   # oxlint
cd frontend && npm run build  # typecheck + build

# Database
npm run db:migrate            # apply migrations
npm run db:check              # verify models match migrations
```

- Frontend lint: oxlint (`.oxlintrc.json`) — hooks rules enforced.
- TypeScript: strict unused locals/params enabled.
- Only add tests that verify real behavior; skip trivial assertions.

---

## Environment & Commands

| Command                                       | Purpose                                    |
| --------------------------------------------- | ------------------------------------------ |
| `docker compose up --build`                   | Full stack (migrates → seeds → starts API) |
| `npm run db:migrate`                          | Apply pending Alembic migrations           |
| `npm run db:revision -- <msg>`                | Autogenerate migration from model changes  |
| `npm run db:check`                            | Verify no model/migration drift            |
| `cd backend && uvicorn app.main:app --reload` | API only                                   |
| `cd frontend && npm run dev`                  | Frontend only                              |
| `npm run db:seed`                             | Seed demo data (after migrations)          |

Copy `.env.example` → `.env` for local overrides. Never commit `.env`.

---

## Agent Behavior Rules

- Read existing code in the target feature before writing new code.
- Prefer extending `useHrmsApi.ts` over creating one-off fetch logic.
- Keep page components thin; push table config to `columns.tsx`, charts to dedicated components.
- When unsure about access control, default to the stricter pattern used in `attendance.py` and `router.py`.
- Do not create commits, PRs, or markdown docs unless explicitly asked.
- When changing SQLModel tables, always generate an Alembic migration and run `npm run db:check`.
