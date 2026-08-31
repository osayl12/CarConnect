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

GitHub Actions (`.github/workflows/ci.yml`) runs lint + build for both apps on
every push/PR to `main`. It needs no secrets — it never touches the database.
Deployment stays manual per the project plan (section 10.2/11 of the scope doc):
build the production images on the server and run
`docker compose -f docker-compose.prod.yml up -d --build`.

### GitHub Secrets & Variables (for later — deployment, not yet needed)

Repo Settings → **Secrets and variables → Actions**. Two kinds:

- **Secrets** — encrypted, write-only once saved (even you can't view them
  again in the UI). Use for anything sensitive: passwords, tokens, private keys.
- **Variables** — plain text, visible in the UI and in workflow logs. Use for
  non-sensitive config only.

Nothing needs to be added there today — CI doesn't use any. When we actually
deploy to Oracle Cloud, these are the ones that will matter:

| Name | Kind | Purpose |
|---|---|---|
| `PROD_MONGO_URI` | Secret | Production DB connection string (keep separate from your dev Atlas URI/DB) |
| `PROD_JWT_SECRET` | Secret | Production token-signing key (must differ from the dev one in `backend/.env`) |
| `ORACLE_SSH_PRIVATE_KEY` | Secret | Private key CI/you would use to SSH into the Oracle Cloud VM to deploy |
| `ORACLE_HOST` | Variable | The VM's IP/hostname |
| `ORACLE_USER` | Variable | SSH username on the VM |
| `GHCR_TOKEN` / `DOCKERHUB_TOKEN` | Secret | Only needed if CI builds and pushes images to a registry instead of building on the server directly |

I'll flag exactly which of these to create when we reach the deployment
milestone — none of that infrastructure (Oracle Cloud VM, registry) exists yet.

## Scripts

| Location | Command | Purpose |
|---|---|---|
| backend | `npm run dev` | Start API with auto-reload (nodemon) |
| backend | `npm start` | Start API (production) |
| backend | `npm run lint` | Lint backend code (ESLint) |
| frontend | `npm run dev` | Start Vite dev server |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | Lint frontend code (oxlint) |
