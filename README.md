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

## Scripts

| Location | Command | Purpose |
|---|---|---|
| backend | `npm run dev` | Start API with auto-reload (nodemon) |
| backend | `npm start` | Start API (production) |
| backend | `npm run lint` | Lint backend code (ESLint) |
| frontend | `npm run dev` | Start Vite dev server |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | Lint frontend code (oxlint) |
