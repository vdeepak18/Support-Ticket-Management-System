# API Reference

Base URL for local development: `http://localhost:5000/api`  
Production base URL: `https://support-ticket-management-system-bv13.onrender.com/api`

Unless marked **Public**, requests require `Authorization: Bearer <JWT>`. Registration and login return a seven-day JWT. Users may access their own tickets; administrators may access all tickets and admin endpoints.

## Authentication and health

| Method | Path | Access | Request body / purpose |
|---|---|---|---|
| GET | `/health` | Public | API and database connectivity |
| POST | `/auth/register` | Public | `{ "name": "Sample User", "email": "sample@example.com", "password": "at-least-6-chars" }` |
| POST | `/auth/login` | Public | `{ "email": "sample@example.com", "password": "..." }` |
| GET | `/auth/me` | Signed in | Return the current user's public profile |

Registration constraints: name is 2–80 characters, email must be valid, password is 6–72 characters. Email is normalized to lowercase. Registration creates a regular user; create administrators with the backend seed command.

## Tickets and comments

| Method | Path | Access | Request body / query |
|---|---|---|---|
| POST | `/tickets` | Signed in | `{ "title": "Example request", "description": "Describe the issue in at least ten characters.", "category": "General", "priority": "medium" }` |
| GET | `/tickets` | Signed in | Optional `page`, `limit`, `status`, `priority`, `search`; returns only the signed-in user's tickets |
| GET | `/tickets/:id` | Owner or admin | Get one ticket |
| PUT | `/tickets/:id` | Owner or admin | One or more of `title`, `description`, `category`, `priority` |
| DELETE | `/tickets/:id` | Owner or admin | Delete ticket |
| POST | `/tickets/:id/comments` | Owner or admin | `{ "message": "Additional information" }` |
| GET | `/tickets/:id/comments` | Owner or admin | List comments |
| GET | `/tickets/:id/activity` | Owner or admin | List activity records |

Ticket filters accept statuses `open`, `in-progress`, `resolved`, `closed`; priorities `low`, `medium`, `high`. `limit` is 1–100 and defaults to 10. Search matches ticket titles. Ticket IDs are positive integer PostgreSQL IDs returned as `id`.

Ticket creation requires a 3–120 character title, 10–5000 character description, category of 2–60 characters, and an optional valid priority. New tickets default to `medium` priority and `open` status. Ticket updates cannot set the owner or status.

## Administrator

All administrator endpoints require a signed-in user whose database role is `admin`.

| Method | Path | Request body / query |
|---|---|---|
| GET | `/admin/stats` | Ticket totals grouped by status and priority |
| GET | `/admin/tickets` | Optional `page`, `limit`, `status`, `priority`, `search` filters |
| PATCH | `/admin/tickets/:id/status` | `{ "status": "resolved" }` |
| PATCH | `/admin/tickets/:id/priority` | `{ "priority": "high" }` |

## Responses and errors

Success response envelope:

```json
{
  "success": true,
  "data": {}
}
```

Errors use `{ "success": false, "message": "..." }`. Invalid request data returns HTTP 400 and an `errors` array. Other common statuses are 401 (missing or invalid authentication), 403 (authenticated but not permitted), 404 (route or ticket not found), and 409 (email already registered).

## Postman

Import [`../postman_collection.json`](../postman_collection.json). Its collection variables are `baseUrl`, `token`, and `ticketId`. Run Register or Login first to save the token, then Create ticket to save its ID. For admin requests, replace the token variable with a JWT for an administrator account created by the seed script.
