# API Contract (Backend)

## Base URL

- Local: `http://localhost:<PORT>`
- Port is defined by environment/config (see backend `.env`).

## Authentication

- Auth scheme: Bearer token (JWT)
- Header: `Authorization: Bearer <token>`

## Common Response Shape

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Dashboard

- `GET /api/dashboard/summary`

### Finances

- `GET /api/finances`
- `GET /api/finances/:id`
- `POST /api/finances`
- `PUT /api/finances/:id`
- `DELETE /api/finances/:id`
