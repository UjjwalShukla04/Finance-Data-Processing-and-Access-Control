# Finance Dashboard Backend

A comprehensive backend API for a finance dashboard system with role-based access control, financial records management, and analytics.

## Features

- **User & Role Management**: Create and manage users with different roles (Viewer, Analyst, Admin)
- **Financial Records**: CRUD operations for income and expense records
- **Dashboard Analytics**: Summary data, category breakdowns, and trend analysis
- **Role-Based Access Control**: Granular permissions based on user roles
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with meaningful messages
- **Soft Deletes**: Records are soft-deleted to maintain audit trails

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── financeController.js # Financial records CRUD
│   └── dashboardController.js # Analytics & summaries
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── rbac.js              # Role-based access control
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js              # User schema with roles
│   └── FinancialRecord.js   # Financial entry schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── users.js             # User management routes
│   ├── finances.js          # Financial records routes
│   └── dashboard.js         # Dashboard analytics routes
├── services/
│   ├── authService.js       # Auth business logic
│   ├── userService.js       # User business logic
│   ├── financeService.js    # Finance business logic
│   └── dashboardService.js  # Analytics calculations
├── utils/
│   ├── response.js          # Standardized API responses
│   └── constants.js         # Role definitions, enums
├── server.js                # Application entry point
├── .env                     # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository and navigate to the backend folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration
5. Start the server:
   ```bash
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```

### Default Configuration

The server runs on `http://localhost:5000` by default.

## API Documentation

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get current user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/setup-admin` | Create initial admin | Public (one-time) |

#### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users with pagination |
| GET | `/api/users/stats` | Get user statistics |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |
| PUT | `/api/users/:id/status` | Toggle user status |

#### Financial Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/finances` | Get all records with filters | All roles |
| GET | `/api/finances/categories` | Get all categories | All roles |
| POST | `/api/finances` | Create a new record | Analyst, Admin |
| GET | `/api/finances/:id` | Get record by ID | All roles |
| PUT | `/api/finances/:id` | Update record | Admin only |
| DELETE | `/api/finances/:id` | Delete record | Admin only |

**Query Parameters for GET /api/finances:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `type` - Filter by type: `income` or `expense`
- `category` - Filter by category
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `sortBy` - Sort field: `date`, `amount`, `category`, `type`, `createdAt`
- `sortOrder` - Sort direction: `asc` or `desc`

#### Dashboard Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard` | Get complete dashboard data | Analyst, Admin |
| GET | `/api/dashboard/summary` | Get summary (income, expense, balance) | All roles |
| GET | `/api/dashboard/category-summary` | Get category breakdown | Analyst, Admin |
| GET | `/api/dashboard/recent-activity` | Get recent transactions | All roles |
| GET | `/api/dashboard/trends/monthly` | Get monthly trends | Analyst, Admin |
| GET | `/api/dashboard/trends/weekly` | Get weekly trends | Analyst, Admin |

**Query Parameters:**
- `startDate` - Start date for filtering (ISO format)
- `endDate` - End date for filtering (ISO format)
- `period` - Predefined period: `week`, `month`, `quarter`, `year`

## Role-Based Access Control

### Roles

| Role | Description |
|------|-------------|
| **viewer** | Can only view dashboard data and records |
| **analyst** | Can view records, create records, and access analytics |
| **admin** | Full access - can manage users, records, and all operations |

### Permission Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View Dashboard | Yes | Yes | Yes |
| View Records | Yes | Yes | Yes |
| Create Records | No | Yes | Yes |
| Update Records | No | No | Yes |
| Delete Records | No | No | Yes |
| Manage Users | No | No | Yes |
| View Analytics | No | Yes | Yes |

## Data Models

### User

```javascript
{
  name: String,      // Required
  email: String,     // Required, Unique
  password: String,  // Required, Min 6 chars
  role: String,      // Enum: viewer, analyst, admin
  status: String,    // Enum: active, inactive
  createdAt: Date,
  updatedAt: Date
}
```

### Financial Record

```javascript
{
  userId: ObjectId,     // Reference to User
  amount: Number,       // Required, Positive
  type: String,         // Enum: income, expense
  category: String,     // Required
  date: Date,           // Required
  description: String,  // Optional
  notes: String,        // Optional
  isDeleted: Boolean,   // Soft delete flag
  deletedAt: Date,      // Deletion timestamp
  createdAt: Date,
  updatedAt: Date
}
```

## API Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": "Detailed error information"
}
```

## Example Usage

### 1. Setup Initial Admin
```bash
curl -X POST http://localhost:5000/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 3. Create Financial Record
```bash
curl -X POST http://localhost:5000/api/finances \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2024-01-15",
    "description": "Monthly salary"
  }'
```

### 4. Get Dashboard Summary
```bash
curl -X GET "http://localhost:5000/api/dashboard/summary?period=month" \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/finance_dashboard |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (Duplicate) |
| 500 | Internal Server Error |

## Development Notes

- Passwords are hashed using bcrypt with a salt round of 10
- Financial records use soft deletes (isDeleted flag) for audit purposes
- JWT tokens expire after 7 days by default
- Input validation is performed using express-validator
- All list endpoints support pagination
- Date filters accept ISO 8601 format

## License

ISC

