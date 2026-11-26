# Support Ticket Management System

A small full-stack helpdesk built with React, Express, and PostgreSQL. Users manage their own support tickets; administrators manage all tickets.

## Run locally

Use Node.js 20.19+ and PostgreSQL. Create a database named `support_ticket_management`, then configure the backend:

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL connection URL and replace `JWT_SECRET` with a long random secret. On startup, the backend creates the required tables and indexes if they do not already exist.

```bash
npm run dev
```

The API runs on port 5000 by default. `GET /api/health` checks the PostgreSQL connection.

### Create an admin

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env` (at least 12 characters), then run:

```bash
npm run seed:admin
```

Public registration always creates a normal user. The seed script exits if the admin email already exists.

### Run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. Set `VITE_API_URL` if the backend is hosted elsewhere. Set `CLIENT_URL` in the backend environment to the frontend origin.



## API endpoints

Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Signed in |
| GET | `/api/health` | Public |
| POST | `/api/tickets` | Signed in |
| GET | `/api/tickets?page=1&limit=10&status=open&priority=high&search=login` | Own tickets |
| GET | `/api/tickets/:id` | Owner or admin |
| PUT | `/api/tickets/:id` | Owner or admin; title, description, category, priority |
| DELETE | `/api/tickets/:id` | Owner or admin |
| POST | `/api/tickets/:id/comments` | Owner or admin |
| GET | `/api/tickets/:id/comments` | Owner or admin |
| GET | `/api/tickets/:id/activity` | Owner or admin |
| GET | `/api/admin/tickets?page=1&limit=10&status=open&priority=high&search=login` | Admin |
| PATCH | `/api/admin/tickets/:id/status` | Admin |
| PATCH | `/api/admin/tickets/:id/priority` | Admin |
| GET | `/api/admin/stats` | Admin |

Import [`postman_collection.json`](postman_collection.json) into Postman for sample requests.

## How it works

- **JWT login:** Passwords are hashed with bcryptjs. Login returns a seven-day JWT, which Axios sends in the Bearer header.
- **Role checks:** Auth middleware verifies the JWT and loads the user's database role. Admin routes call `adminOnly` on the server.
- **Ownership:** Ticket and comment controllers compare the signed-in user's ID with the ticket's `created_by` value. Users cannot set `created_by`, `role`, or `status` in ticket updates.
- **PostgreSQL relationships:** Tickets reference their creator; comments and activity records reference tickets and users. Foreign keys enforce those relationships. Ticket deletion cascades comments and preserves a deletion activity record with a null ticket reference.
- **Activity events:** Controllers emit events after database writes. A single in-process EventEmitter listener writes activity rows and logs its own errors. In-memory events are not durable across a process crash; a persistent queue is unnecessary for this small assignment.

Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`.
