# Dolf HRMS — Multi-tenant HR Management System MVP

Monorepo with **FastAPI** backend, **React + Vite + shadcn/ui** frontend, and **PostgreSQL**.

## Stack

- Backend: FastAPI, SQLModel, JWT auth, async PostgreSQL
- Frontend: React, TypeScript, Tailwind, shadcn/ui, React Router, TanStack Query, Axios, i18next (EN/AR + RTL)

## Quick Start (Docker)

```powershell
cd dolftech-hrms
docker compose up --build
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

## Local Development

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Start PostgreSQL (or use docker compose up db)
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Demo Credentials

Default password for all accounts: **`DolfTech123!`**

| Role                 | Email                      |
| -------------------- | -------------------------- |
| Super Admin          | `admin@dolftech.com`       |
| HR Manager           | `b.alobaidan@dolftech.com` |
| Full Stack Developer | `m.furqan@dolftech.com`    |

All Dolf Technologies employees use `{first_initial}.{lastname}@dolftech.com`.

## Seed Data

- Company: **Dolf Technologies** (Saudi Arabia)
- 16 employees with roles (VR Team Lead, CTO, HR Manager, etc.)
- Sample requests (pending, approved, rejected)

## Tests

```powershell
# Backend
cd backend && .\.venv\Scripts\Activate.ps1 && pytest

# Frontend
cd frontend && npm run test

# Database
npm run db:migrate    # apply migrations
npm run db:check      # verify schema matches models
```
