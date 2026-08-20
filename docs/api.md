# FlowCRM API Documentation

**Base URL:** `https://your-render-backend-url.com/api`

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /auth/signup
Register a new user account.

**Request body:**
```json
{
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "password": "SecurePass123",
  "role": "SALES"
}
```

**Response (201):**
```json
{
  "user": { "id": "clx123...", "name": "Aarav Mehta", "email": "aarav@example.com", "role": "SALES" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Errors:**
- `409` — Email already in use
- `400` — Validation failed (invalid email, password too short)

---

### POST /auth/login
Authenticate an existing user.

**Request body:**
```json
{
  "email": "aarav@example.com",
  "password": "SecurePass123"
}
```

**Response (200):** Same shape as signup.

**Errors:**
- `401` — Invalid email or password

---

### POST /auth/refresh
Exchange a refresh token for new access + refresh tokens.

**Request body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Errors:**
- `401` — Session expired or invalid refresh token

---

### GET /auth/me
Get the current user's profile. **Requires auth.**

**Response (200):**
```json
{
  "id": "clx123...",
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "role": "SALES",
  "phone": "+91 98765 43210",
  "department": "Sales",
  "avatarUrl": null,
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

### PATCH /auth/change-password
Change the current user's password. **Requires auth.**

**Request body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Response (200):**
```json
{ "message": "Password updated successfully" }
```

**Errors:**
- `400` — Current password is incorrect

---

## Leads

### GET /leads
List leads with pagination, search, and status filtering. **Requires auth.**

**Query parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `query` | string | "" | Search by name, company, or email |
| `status` | string | — | Filter by lead status |

**Response (200):**
```json
{
  "data": [
    {
      "id": "clx456...",
      "name": "Northstar Labs",
      "company": "Northstar Labs",
      "email": "aarav@northstarlabs.com",
      "status": "QUALIFIED",
      "priority": "HIGH",
      "value": 12000,
      "owner": { "id": "clx123...", "name": "Priya Sharma", "email": "priya@example.com" },
      "createdAt": "2026-01-20T08:00:00.000Z",
      "updatedAt": "2026-07-10T14:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42
}
```

---

### POST /leads
Create a new lead. **Requires auth.**

**Request body:**
```json
{
  "name": "Bluebird Retail",
  "company": "Bluebird Retail Inc",
  "email": "sofia@bluebirdretail.com",
  "phone": "+1 555 0123",
  "source": "LinkedIn",
  "status": "NEW",
  "priority": "MEDIUM",
  "value": 8400,
  "notes": "Interested in enterprise plan"
}
```

**Response (201):** The created lead object with `id` and timestamps.

---

### PUT /leads/:id
Update an existing lead. **Requires auth.** Body is a partial lead schema.

**Response (200):** The updated lead object.

**Errors:**
- `404` — Lead not found

---

### DELETE /leads/:id
Delete a lead. **Requires auth.**

**Response (200):**
```json
{ "message": "Lead deleted successfully" }
```

---

## Tasks

### GET /tasks
List all tasks for the kanban board. **Requires auth.**

**Response (200):**
```json
[
  {
    "id": "clx789...",
    "title": "Send proposal to Northstar Labs",
    "description": "Follow up with pricing document",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2026-07-15T11:00:00.000Z",
    "completedAt": null,
    "assignee": { "id": "clx123...", "name": "Priya Sharma", "email": "priya@example.com" },
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-07-10T14:30:00.000Z"
  }
]
```

---

### POST /tasks
Create a new task. **Requires auth.**

**Request body:**
```json
{
  "title": "Call Bluebird Retail for discovery",
  "description": "Discuss integration requirements",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-07-14T05:30:00.000Z"
}
```

**Response (201):** The created task object.

---

### PUT /tasks/:id
Update a task. **Requires auth.** Body is a partial task schema.

**Response (200):** The updated task object.

---

### PATCH /tasks/:id/complete
Mark a task as done in one step. **Requires auth.**

**Response (200):** The completed task object with `completedAt` set.

---

### DELETE /tasks/:id
Delete a task. **Requires auth.**

**Response (200):**
```json
{ "message": "Task deleted successfully" }
```

---

## Dashboard

### GET /dashboard/summary
Get aggregated dashboard data. **Requires auth.**

**Response (200):**
```json
{
  "stats": {
    "totalLeads": 42,
    "closedWon": 12,
    "totalTasks": 18,
    "completedTasks": 7
  },
  "recentActivities": [
    {
      "id": "clx001...",
      "type": "LEAD_CREATED",
      "message": "Lead created for Northstar Labs",
      "createdAt": "2026-07-12T09:00:00.000Z"
    }
  ],
  "recentLeads": [
    {
      "id": "clx456...",
      "name": "Northstar Labs",
      "company": "Northstar Labs",
      "status": "QUALIFIED",
      "value": 12000,
      "owner": { "name": "Priya Sharma" }
    }
  ]
}
```

---

## Profile

### GET /profile/me
Get the current user's profile. **Requires auth.**

**Response (200):** Same shape as `GET /auth/me`.

---

### PATCH /profile/me
Update profile fields. **Requires auth.**

**Request body:**
```json
{
  "name": "Priya Sharma",
  "phone": "+91 99999 11111",
  "department": "Enterprise Sales"
}
```

**Response (200):** The updated profile object.

---

### PATCH /profile/me/password
Change the password. **Requires auth.**

**Request body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Response (200):**
```json
{ "message": "Password updated successfully" }
```

---

## Health Check

### GET /health
Public endpoint — no auth required.

**Response (200):**
```json
{ "status": "ok", "service": "flowcrm-api" }
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "message": "Human-readable error description"
}
```

Common status codes:
| Code | Meaning |
|------|---------|
| 400 | Validation failed |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Resource not found |
| 409 | Unique constraint violation (duplicate email) |
| 500 | Internal server error |
