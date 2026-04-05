# Backend Documentation

## Overview

Node.js/Express backend for FDPAC.

## Structure

- `config/` database configuration
- `controllers/` request/response handlers
- `middleware/` auth, RBAC, validation, error handling
- `models/` Mongoose models
- `routes/` API routes
- `services/` business logic
- `utils/` shared utilities
- `tests/` backend tests

## Environment Variables

- `PORT` server port
- `MONGODB_URI` MongoDB connection string
- `JWT_SECRET` JWT signing secret

## Local Development

```bash
cd backend
npm install
npm run dev
```

## Testing

```bash
cd backend
npm test
```
