# Car Connect

Car Connect is a web app connecting customers with mechanics for vehicle fault
reporting, repair coordination, and appointment management.

Full scope, feature decisions, and milestone plan: [CarConnect_Project_Scope.md](./CarConnect_Project_Scope.md).

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcrypt

## Project structure

```
CarConnect2/
├── frontend/        React app (Vite)
├── backend/         Express API
│   └── src/
│       ├── config/      DB connection
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── middleware/
└── docs/
```

## Getting started (local development)

### Backend

```
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

Runs on http://localhost:5000. Health check: `GET /api/health`.

### Frontend

```
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173. API calls to `/api/*` are proxied to the
backend in development (see `frontend/vite.config.js`).

## Running with Docker

```
cp backend/.env.example backend/.env   # fill in MONGO_URI and JWT_SECRET
docker compose up --build
```

Frontend: http://localhost:5173 (hot-reload) · Backend: http://localhost:5000/api/health

This talks to MongoDB Atlas (via `backend/.env`), same as running outside Docker —
there is no local Mongo container. `docker-compose.prod.yml` builds the
optimized production images (nginx serving the frontend, backend not exposed
directly) for later deployment to Oracle Cloud.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

1. **backend** / **frontend** jobs — install deps, lint, build. No secrets needed.
2. **deploy** job — only on an actual push to `main` (never on a PR), and only
   if both jobs above pass: builds the production images, pushes them to
   Docker Hub, then SSHes into the Oracle Cloud VM to pull and restart them
   (`docker-compose.prod.yml`).

This deploys automatically on every push to `main` — a deliberate choice made
when setting this up, which is more automated than the project scope doc's
own suggested "manual, controlled deployment" (section 10.2/11). Worth
reviewing before this project is handed in/graded, if strict adherence to
the documented plan matters.

### GitHub Secrets in use

Repo Settings → **Secrets and variables → Actions**:

| Name | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub account the images are pushed to |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not your account password) |
| `SSH_HOST` | Oracle Cloud VM's public IP/hostname |
| `SSH_USER` | SSH username on the VM |
| `SSH_KEY` | Private key matching a public key in that user's `~/.ssh/authorized_keys` |

### One-time server setup

Before the deploy job can succeed, the VM needs Docker installed, this repo
cloned to `~/carconnect`, `backend/.env` created with real production values,
and a `.env` (repo root, next to `docker-compose.prod.yml`) containing
`DOCKERHUB_USERNAME=<your docker hub username>`. See chat history for the
exact commands used — do this once, manually, over SSH.

## Scripts

| Location | Command | Purpose |
|---|---|---|
| backend | `npm run dev` | Start API with auto-reload (nodemon) |
| backend | `npm start` | Start API (production) |
| backend | `npm run lint` | Lint backend code (ESLint) |
| frontend | `npm run dev` | Start Vite dev server |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | Lint frontend code (oxlint) |
