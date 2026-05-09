# Team Task Manager

**Full-stack team collaboration platform** for project and task management. This repository contains a production-oriented **REST API** (Node.js) and a **single-page application** (React) suitable for internal or customer-facing deployment.

---

## Executive summary

| Layer | Technology | Role |
|--------|------------|------|
| **Frontend** | React 19, Vite 8, React Router 7, Axios | Authentication, dashboards, projects, tasks |
| **Backend** | Express 5, Prisma 6, PostgreSQL | JWT auth, data access, CORS, validation |
| **Data** | PostgreSQL (e.g. Supabase) | Users, projects, memberships, tasks |

The solution separates **presentation** (SPA) from **business logic and persistence** (API + database), with environment-driven configuration for local development and cloud hosting (e.g. Railway).

---

## Business requirements (what the product must do)

### Identity and access

- User **registration** and **login** with email and password.
- **JWT-based** session continuity for protected routes and API calls.
- Password handling via **bcrypt** (hashed storage only).

### Projects and collaboration

- **Projects** with name and optional description.
- **Project membership** with roles (e.g. admin / member) and uniqueness per user–project pair.
- Access control so users only interact with projects they belong to.

### Tasks

- **Tasks** scoped to a project: title, optional description, due date, status (todo / in progress / done), priority (low / medium / high).
- **Creator** and optional **assignee** (references to users).
- CRUD and listing aligned with project membership.

### Dashboard

- Aggregated views and metrics appropriate for a **team task dashboard** (summary data from the API).

### Non-functional expectations

- **API validation** on inputs (structured error responses).
- **CORS** configured for known front-end origins (including local dev and hosted URLs).
- **Health endpoint** for load balancers and monitoring.
- **12-factor** style configuration via environment variables (no secrets in source control).

---

## Technical requirements

### Frontend

| Requirement | Status |
|-------------|--------|
| Modern React with component-based UI | Satisfied |
| Client-side routing (protected vs public routes) | Satisfied |
| Centralized HTTP client with auth header injection | Satisfied |
| Build pipeline producing static assets (`vite build`) | Satisfied |
| Optional containerized deploy (Dockerfile + static serve) | Satisfied |
| CI-friendly lockfile (`package-lock.json`) for reproducible installs | Satisfied |

### Backend

| Requirement | Status |
|-------------|--------|
| REST API under a clear base path (e.g. `/api`) | Satisfied |
| PostgreSQL with ORM (Prisma) and migrations | Satisfied |
| Auth routes (signup / login) and JWT middleware for protected resources | Satisfied |
| Project, task, and dashboard routes with access checks | Satisfied |
| Prisma client generation after install (`postinstall` / `prisma generate`) | Satisfied |
| Server binds appropriately for containers (e.g. `0.0.0.0`, `PORT`) | Satisfied |
| Explicit failure when `DATABASE_URL` is missing (fail fast) | Satisfied |

### Operations and security

| Requirement | Status |
|-------------|--------|
| `.env` excluded from Git; `.env.example` patterns documented | Satisfied |
| Separate concerns: DB credentials and JWT secret only on API service | Recommended practice |
| HTTPS in production; align `CLIENT_URL` / front-end origin with CORS | Operator responsibility |

---

## Repository layout

```
team-task-manager/
├── backend/                 # API service
│   ├── prisma/              # Schema and migrations
│   ├── src/
│   │   ├── server.js        # Entry: env load, listen
│   │   ├── app.js           # Express app, CORS, routes
│   │   ├── config/          # Prisma client singleton
│   │   ├── routes/          # auth, projects, tasks, dashboard
│   │   ├── middleware/      # JWT auth
│   │   └── utils/           # Project access helpers
│   └── package.json
├── frontend/                # SPA (may also be mirrored to a dedicated frontend repo)
│   ├── Dockerfile           # Optional: build + serve for Railway / Docker
│   ├── railway.json         # Optional Railway builder config
│   ├── scripts/serve.cjs    # Production static file server
│   └── src/                 # Pages, API client, contexts
├── package.json             # Optional root manifest for platforms that build from repo root
└── README.md                # This document
```

---

## Environment variables

### Backend (`backend/.env` or host variables)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Prisma connection string (pooled if using Supabase pooler) |
| `DIRECT_URL` | Yes* | Direct DB URL for migrations (*as required by your Prisma datasource) |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `PORT` | No | HTTP port (defaults e.g. to `5000` locally; use host-provided value in cloud) |
| `CLIENT_URL` | Recommended | Comma-separated allowed CORS origins (e.g. `http://localhost:5173`, front-end production URL) |

### Frontend (build-time / runtime)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | Recommended | Full API base including `/api` (baked in at build for Vite) |

Do **not** place database credentials or `JWT_SECRET` on the **frontend** hosting service.

---

## Local development

### Prerequisites

- Node.js **20+**
- PostgreSQL instance and connection strings

### Backend

```bash
cd backend
cp .env.example .env   # if present; otherwise create .env from the table above
npm install
npx prisma migrate deploy   # or migrate dev for local iteration
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL to your local or remote API
npm install
npm run dev
```

---

## Deployment notes (summary)

- **API:** Often deployed from a repository whose root or `backend/` path matches the host’s build/start commands; ensure `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` are set on the **API** service only.
- **Frontend:** Static build output (`dist`) can be served by the included Node static server, Docker image, or a dedicated static host (Netlify, Cloudflare Pages, Vercel). Set `VITE_API_URL` before build when the API URL is not the default in code.
- **CORS:** Backend `CLIENT_URL` must include every browser origin that will call the API (local Vite port and production front-end URL).

---

## API surface (high level)

| Area | Typical routes |
|------|------------------|
| Health | `GET /health` |
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Projects | Under `/api/projects` (protected) |
| Tasks | Under `/api/projects/:projectId/tasks` (protected) |
| Dashboard | Under `/api/dashboard` (protected) |

Refer to `backend/src/routes/` for exact contracts and payloads.

---

## Document control

| Item | Detail |
|------|--------|
| **Product name** | Team Task Manager |
| **Document** | Repository README |
| **Audience** | Engineering, DevOps, technical stakeholders |

---

## License

See `backend/package.json` and `frontend/package.json` for package-level license fields. Add a root `LICENSE` file if your organization requires an explicit corporate license statement.
