# Dolf HRMS

### Multi-tenant HR management system — built for modern teams

A full-stack HRMS MVP for **employee management**, **attendance**, **requests**, and **role-based access** — with bilingual **English / Arabic (RTL)** support.

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Status-MVP-orange?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/i18n-EN%20%7C%20AR-blue?style=flat-square" alt="i18n" />
  <img src="https://img.shields.io/badge/Auth-JWT-green?style=flat-square" alt="Auth" />
</p>

---

## About

**Dolf HRMS** is a multi-tenant HR platform monorepo. Companies get isolated data via `company_id`, with three roles:

| Role            | Access                             |
| --------------- | ---------------------------------- |
| `super_admin`   | All companies                      |
| `company_admin` | Own company data                   |
| `employee`      | Own profile, attendance & requests |

---

## Features

- **Dashboard** — overview of HR metrics and activity
- **Employees** — directory + employee profiles
- **Attendance** — check-in / check-out flows
- **Requests** — leave & HR request workflows (pending / approved / rejected)
- **Settings** — app preferences
- **Auth** — JWT-based login with role guards
- **i18n + RTL** — English & Arabic with full RTL layout support
- **Multi-tenancy** — strict company-scoped data access

---

## Tech Stack

### Backend

| Tool                                                                                                               | Role                  |
| ------------------------------------------------------------------------------------------------------------------ | --------------------- |
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)             | Async REST API        |
| ![SQLModel](https://img.shields.io/badge/SQLModel-SQLAlchemy-red?style=flat-square)                                | ORM + Pydantic models |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white) | Primary database      |
| ![Alembic](https://img.shields.io/badge/Alembic-Migrations-8B5CF6?style=flat-square)                               | Schema migrations     |
| ![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)          | Token-based auth      |
| ![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-499848?style=flat-square)                                     | ASGI server           |
| ![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white)                | Backend tests         |

```text
Python · FastAPI · SQLModel · SQLAlchemy · asyncpg · Pydantic · Alembic · python-jose · Passlib · Pytest · Ruff
```

### Frontend

| Tool                                                                                                                    | Role                 |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------- |
| ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)                     | UI framework         |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)         | Type safety          |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)                           | Build tool           |
| ![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)          | Styling              |
| ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)           | Component system     |
| ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white) | Server state         |
| ![Zustand](https://img.shields.io/badge/Zustand-State-443E38?style=flat-square)                                         | Client auth state    |
| ![i18next](https://img.shields.io/badge/i18next-EN%2FAR-26A69A?style=flat-square)                                       | Internationalization |

```text
React 19 · TypeScript · Vite · Tailwind CSS 4 · shadcn/ui · TanStack Query · TanStack Table · React Router · Axios · Zustand · React Hook Form · Zod · Recharts · i18next · Vitest · Oxlint
```

### Infra

<p>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/PostgreSQL-16_Alpine-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres" />
</p>

---

## Architecture

```text
dolftech-hrms/
├── backend/                 # FastAPI application
│   ├── alembic/             # Database migrations
│   ├── app/
│   │   ├── api/             # HTTP routers
│   │   ├── core/            # Config, DB, security, deps
│   │   ├── models/          # SQLModel tables
│   │   ├── schemas/         # Pydantic Read/Create/Update
│   │   ├── services/        # Business logic (reserved)
│   │   └── crud/            # Reusable queries (reserved)
│   └── scripts/             # Seed & one-off scripts
├── frontend/
│   ├── public/locales/      # i18n (en / ar)
│   └── src/
│       ├── features/        # Domain pages
│       ├── components/      # UI, shared, layout
│       ├── hooks/           # TanStack Query hooks
│       ├── lib/             # API client, types, utils
│       └── stores/          # Zustand (auth)
└── docker-compose.yml       # Postgres + API + frontend
```

| Layer    | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:5173        |
| API      | http://localhost:8000/api/v1 |
| API docs | http://localhost:8000/docs   |

---

## Quick Start

### Docker

```powershell
cd dolftech-hrms
docker compose up --build
```

- App → http://localhost:5173
- Swagger → http://localhost:8000/docs

### Local development

**Backend**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Start Postgres (or: docker compose up db)
npm run db:migrate   # from repo root
npm run db:seed
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```powershell
cd frontend
npm install
npm run dev
```

---

## Demo Credentials

Default password for all accounts: **`DolfTech123!`**

| Role        | Email                      |
| ----------- | -------------------------- |
| Super Admin | `admin@dolftech.com`       |
| HR Manager  | `b.alobaidan@dolftech.com` |
| AI Engineer | `m.furqan@dolftech.com`    |

All Dolf Technologies employees use `{first_initial}.{lastname}@dolftech.com`.

### Seed data

- Company: **Dolf Technologies** (Saudi Arabia)
- 16 employees across roles (VR Team Lead, CTO, HR Manager, …)
- Sample requests in pending / approved / rejected states

---

## Database

Schema is managed with **Alembic** — not `create_all`.

```powershell
npm run db:migrate              # apply pending migrations
npm run db:revision -- <msg>    # autogenerate migration
npm run db:check                # fail if models drift
npm run db:seed                 # seed demo data
```

---

## Testing

```powershell
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
cd frontend && npm run lint

# Full suite (from root)
npm run test
```

---

## Project Highlights

```text
🏢  Multi-tenant by design          — company_id scoping on every query
🔐  Role-based access               — super_admin · company_admin · employee
🌍  Bilingual UX                    — English + Arabic with RTL
⚡  Modern React stack              — Query, Table, Form, Zod, shadcn
🗄️  Migration-first DB              — Alembic + db:check drift detection
🐳  One-command bootstrap           — docker compose up --build
```

---

## Useful Commands

| Command                     | Purpose                             |
| --------------------------- | ----------------------------------- |
| `docker compose up --build` | Full stack (migrate → seed → serve) |
| `npm run db:migrate`        | Apply Alembic migrations            |
| `npm run db:check`          | Verify models match migrations      |
| `npm run db:seed`           | Seed demo data                      |
| `npm run test`              | Run backend + frontend tests        |
| `npm run lint:frontend`     | Oxlint                              |

---

<p align="center">
  <b>Dolf Technologies</b> · Built with FastAPI + React
</p>
