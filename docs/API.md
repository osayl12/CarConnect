# API Reference

Base URL: `/api` (e.g. `https://carconnect.duckdns.org/api` in production, `http://localhost:5000/api` locally).

All endpoints except `/health`, `/auth/register`, and `/auth/login` require a `Bearer <token>` Authorization header, obtained from `/auth/login`.

## Health

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | None | Liveness/readiness check (DB connection state) |

## Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | None | Register a new customer or mechanic |
| POST | `/auth/login` | None | Log in, returns a JWT |
| GET | `/auth/me` | Any logged-in user | Get the current user's profile |

## Vehicles

Customer-only.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/vehicles` | Customer | Add a vehicle |
| GET | `/vehicles` | Customer | List my vehicles |
| GET | `/vehicles/:id` | Customer | Get one vehicle |
| PUT | `/vehicles/:id` | Customer | Update a vehicle |
| DELETE | `/vehicles/:id` | Customer | Delete a vehicle |
| GET | `/vehicles/:id/repair-record` | Customer | Get a vehicle's repair history |

## Fault reports

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/faults` | Customer | Create a fault report (with optional image upload) |
| GET | `/faults/mine` | Customer | List my fault reports |
| GET | `/faults` | Mechanic | List all fault reports |
| GET | `/faults/:id` | Owner or any mechanic | Get one fault report |
| PUT | `/faults/:id/quote` | Mechanic | Respond with a repair quote |
| PATCH | `/faults/:id/status` | Mechanic | Update a fault report's status |

## Appointments

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/appointments` | Mechanic | Create an available slot |
| GET | `/appointments/mine` | Mechanic | List my created slots |
| GET | `/appointments/available` | Any logged-in user | List available slots |
| GET | `/appointments/my-bookings` | Customer | List my bookings |
| PATCH | `/appointments/:id/request` | Customer | Request a slot |
| PATCH | `/appointments/:id/confirm` | Mechanic | Confirm a requested slot |
| PATCH | `/appointments/:id/cancel` | Owning mechanic or booking customer | Cancel a slot |

## Notifications

Customer-only.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/notifications` | Customer | List my notifications |
| PATCH | `/notifications/read-all` | Customer | Mark all notifications as read |
| PATCH | `/notifications/:id/read` | Customer | Mark one notification as read |
