# Support Ticket Management System

A full-stack support ticket application. Customers can create and manage their own requests, add comments, and follow ticket activity. Administrators can view all tickets, update status and priority, and review ticket statistics.

## Submission links

- **Source repository:** [GitHub](https://github.com/vdeepak18/Support-Ticket-Management-System)
- **Live frontend:** [support-ticket-management-system-eta.vercel.app](https://support-ticket-management-system-eta.vercel.app)
- **Backend health:** [Render API health check](https://support-ticket-management-system-bv13.onrender.com/api/health)
- **API reference:** [docs/API.md](docs/API.md)
- **Postman collection:** [postman_collection.json](postman_collection.json)
- **Database design:** [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md)

The health endpoint reports API and PostgreSQL connectivity. The current deployment uses Vercel for the frontend and Render for the Express API and PostgreSQL database.

## Features

- Registration and login with JSON Web Tokens.
- Ticket creation, filtering, pagination, editing, and deletion.
- Ticket comments and activity history.
- Admin dashboard, ticket search, status and priority management.
- Role-based access checks and server-side ticket ownership checks.

## Technologies

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS.
- **Backend:** Node.js, Express, PostgreSQL (`pg`), Zod validation, bcryptjs, JSON Web Tokens.
- **Hosting:** Vercel (frontend), Render (API and PostgreSQL).

## Run locally

Requirements: Node.js 20.19 or newer and PostgreSQL.

### 1. Configure and run the API

Create a PostgreSQL database, then configure the backend:

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL connection string and replace `JWT_SECRET` with a long random value. On startup, the backend creates its tables and indexes if they do not exist.

```bash
npm run dev
```

The API listens on port `5000` by default. `GET /api/health` reports API and database status.

### 2. Create an administrator (optional)

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env` (the seed command requires a password of at least 12 characters), then run from `backend/`:

```bash
npm run seed:admin
```

Public registration always creates a regular user. The seed command does not overwrite an existing account with the same email.

### 3. Configure and run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. Set `VITE_API_URL` to the API origin or API root, for example `http://localhost:5000/api` or `https://your-service.onrender.com/api`. The Axios client normalizes a trailing `/api` or `/health` and sends requests under `/api`.

## Environment variables

| Service | Variable | Purpose |
|---|---|---|
| Backend | `PORT` | HTTP port (defaults to `5000`) |
| Backend | `DATABASE_URL` | PostgreSQL connection string |
| Backend | `JWT_SECRET` | Secret used to sign authentication tokens |
| Backend | `CLIENT_URL` | Exact frontend origin allowed by CORS, without a trailing slash |
| Backend | `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Optional values used by `npm run seed:admin` |
| Frontend | `VITE_API_URL` | Backend origin or API root; for production use `https://support-ticket-management-system-bv13.onrender.com/api` |

Never commit `.env` files or production secrets. For Render Postgres, use the connection URL provided by Render. For Vercel, set `VITE_API_URL` in the project environment and redeploy because Vite embeds it at build time.

## API and data design

The API endpoint list, request bodies, access rules, and validation constraints are in [docs/API.md](docs/API.md). Import [postman_collection.json](postman_collection.json) into Postman for executable sample requests. The table relationships and persistence decisions are described in [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md).

Implementation highlights:

- Passwords are hashed with bcryptjs; login issues a seven-day JWT sent in the `Authorization: Bearer <token>` header.
- API routes validate inputs with Zod and use parameterized PostgreSQL queries.
- Authentication and role checks are enforced by Express middleware. Ticket ownership is checked by the API, not trusted to the frontend.
- Activity events are written by a single in-process EventEmitter listener after controller writes. This is intentionally lightweight for the assignment; the event dispatch is not a durable queue across process crashes.
- The initial schema is created at application startup with `CREATE TABLE IF NOT EXISTS`. This is convenient for a small assignment; production schema evolution should use versioned migrations.

Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }` and may include validation details.
