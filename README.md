# TaskFlow — Team Task Manager

A full-stack collaborative task management application similar to Trello / Asana,
with role-based access control, project workspaces, a Kanban board, search,
filtering, dark mode, and a polished corporate UI.

## Features

### Authentication
- Email + password sign-up and sign-in
- JWT-based session, token persisted in `localStorage`
- Real-time validation with password strength meter on sign-up

### Projects
- Create, list and switch between projects
- Each project has its own member list and task board
- The creator is automatically the project **admin**

### Members
- Admins can invite existing users to a project by email
- Admins can remove members (cannot remove themselves)
- Members are listed with their role badge (`ADMIN` / `MEMBER`)

### Tasks
- Create tasks with title, description, priority, due date and assignee
- Drag-and-drop tasks across `To Do → In Progress → Done` columns
- Inline status dropdown (works on touch devices)
- Members can update tasks assigned to them; admins can update or delete any task
- Task cards highlight overdue items in red

### Dashboard
- Live stats: total / by-status / overdue tasks across every project you belong to
- Task search by title or description
- Filter board by status and priority
- Smooth-scroll sidebar navigation between sections
- Dark / light mode toggle (preference persisted)
- Fully responsive (sidebar collapses into a drawer on mobile)

## Tech Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Axios                              |
| Backend  | Node.js, Express 5, Zod (validation), JSON Web Tokens, bcryptjs   |
| Database | PostgreSQL via Prisma 6 (works great with Supabase)               |
| Hosting  | Railway (frontend + backend deployable as separate services)     |

## Project Structure

```
team-task-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # User, Project, ProjectMember, Task models
│   ├── src/
│   │   ├── config/prisma.js       # PrismaClient singleton
│   │   ├── middleware/auth.js     # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /api/auth/{signup,login}
│   │   │   ├── project.routes.js  # /api/projects
│   │   │   ├── task.routes.js     # /api/projects/:id/tasks
│   │   │   └── dashboard.routes.js
│   │   ├── utils/projectAccess.js # role-based access helpers
│   │   ├── app.js                 # Express app setup
│   │   └── server.js              # entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # login/signup with strength meter, dark mode
│   │   │   ├── AuthPage.css
│   │   │   ├── DashboardPage.jsx  # main workspace with kanban board
│   │   │   └── DashboardPage.css
│   │   ├── components/ProtectedRoute.jsx
│   │   ├── state/{AuthContext,ThemeContext}.jsx
│   │   ├── hooks/{useToast,usePasswordStrength}.js
│   │   ├── utils/validation.js
│   │   ├── api.js                 # axios instance + JWT interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── package.json                   # root workspace scripts
└── README.md
```

## Local Development

### Prerequisites
- Node.js 20+
- A PostgreSQL database (Supabase, local Postgres, Docker, etc.)

### 1. Clone & install
```bash
git clone <repo-url> team-task-manager
cd team-task-manager
npm install --workspaces=false  # install root tooling (no workspaces in this repo)

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend
```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, CLIENT_URL
```

For Supabase the URLs look like:
```
DATABASE_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:5432/postgres?sslmode=require"
```
URL-encode any special characters in the password (e.g. `@` → `%40`).

### 3. Run migrations & start backend
```bash
cd backend
npx prisma migrate deploy   # apply migrations to your DB
# or, the first time:
# npx prisma migrate dev --name init
npm start                   # http://localhost:5000
```

### 4. Configure & start frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

Sign up with a new account, create a project, invite teammates and start tracking work.

## API Reference

All `/api/projects/**` and `/api/dashboard` routes require a `Bearer` token from `/api/auth/login` or `/api/auth/signup`.

| Method | Endpoint                                               | Notes                          |
| ------ | ------------------------------------------------------ | ------------------------------ |
| POST   | `/api/auth/signup`                                     | `{name, email, password}`      |
| POST   | `/api/auth/login`                                      | `{email, password}`            |
| GET    | `/api/projects`                                        | List projects you belong to    |
| POST   | `/api/projects`                                        | Create a project (you become ADMIN) |
| POST   | `/api/projects/:projectId/members`                     | Admin only — `{email, role?}`  |
| DELETE | `/api/projects/:projectId/members/:userId`             | Admin only                     |
| GET    | `/api/projects/:projectId/tasks`                       | List tasks (member visible)    |
| POST   | `/api/projects/:projectId/tasks`                       | Admin only                     |
| PATCH  | `/api/projects/:projectId/tasks/:taskId`               | Admin or assignee              |
| DELETE | `/api/projects/:projectId/tasks/:taskId`               | Admin only                     |
| GET    | `/api/dashboard`                                       | Aggregate metrics              |

## Deployment (Railway)

The backend and frontend deploy as two services in the same Railway project.

### Backend service
1. **New service → Deploy from GitHub repo**, root directory `backend`.
2. Add environment variables:
   - `DATABASE_URL`, `DIRECT_URL` (Supabase Postgres URLs)
   - `JWT_SECRET` (long random string)
   - `CLIENT_URL` = `https://<your-frontend>.up.railway.app`
   - `PORT` = `5000` (Railway auto-assigns; the app respects `process.env.PORT`)
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`

### Frontend service
1. **New service → Deploy from GitHub repo**, root directory `frontend`.
2. Add environment variable:
   - `VITE_API_URL` = `https://<your-backend>.up.railway.app/api`
3. Build command: `npm install && npm run build`
4. Start command: `npm start` (uses `vite preview --host 0.0.0.0 --port $PORT`)

After both services deploy, update the backend's `CLIENT_URL` to the frontend's
public URL and redeploy so CORS will accept browser requests.

## Submission Checklist
- [x] Authentication with JWT
- [x] Role-based access (Admin / Member)
- [x] Project create + list
- [x] Member invite + remove
- [x] Task CRUD with priority, due date, assignee
- [x] Drag-and-drop Kanban board
- [x] Dashboard with stats and filters
- [x] Search & filter tasks
- [x] Responsive layout + dark mode
- [x] Deployable on Railway
