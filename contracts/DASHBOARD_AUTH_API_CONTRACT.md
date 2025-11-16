# Dashboard Authentication API Contract

## Overview

This document outlines the authentication and user management API endpoints for the Shop Texxolution dashboard. These endpoints handle user authentication, authorization, and user management functionality.

**Base URL:** `https://your-domain.com/api/dashboard/auth`

## Authentication

Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles

- **admin**: Full access to all features and user management
- **editor**: Can create and edit products, view analytics
- **viewer**: Read-only access

---

## Public Endpoints (No Authentication Required)

### 1. User Login

```http
POST /api/dashboard/auth/login
Content-Type: application/json
```

**Description:** Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "editor",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 - Missing Credentials:**

```json
{
  "success": false,
  "message": "Email and password are required."
}
```

**401 - Invalid Credentials:**

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**403 - Account Inactive:**

```json
{
  "success": false,
  "message": "Your account is inactive. Please contact administrator."
}
```

### 2. User Registration (Public Signup)

```http
POST /api/dashboard/auth/signup
Content-Type: application/json
```

**Description:** Creates a new user account with viewer role (requires admin approval for role elevation).

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully. Account created with viewer role.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T10:30:00.000Z"
    }
  }
}
```

### 3. Refresh Token

```http
POST /api/dashboard/auth/refresh-token
Content-Type: application/json
```

**Description:** Generates a new access token using a valid refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Protected Endpoints (Authentication Required)

### 4. Get User Profile

```http
GET /api/dashboard/auth/profile
Authorization: Bearer <jwt-token>
```

**Description:** Returns the current user's profile information.

**Success Response (200):**

```json
{
  "success": true,
  "message": "User profile retrieved successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "editor",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T10:30:00.000Z"
    }
  }
}
```

### 5. Update User Profile

```http
PUT /api/dashboard/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Description:** Updates the current user's profile information.

**Request Body:**

```json
{
  "name": "John Updated Doe",
  "email": "john.updated@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Updated Doe",
      "email": "john.updated@example.com",
      "role": "editor",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T11:45:00.000Z"
    }
  }
}
```

### 6. Change Password

```http
POST /api/dashboard/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Description:** Allows users to change their own password.

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%\*?&)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "editor",
      "status": "active"
    },
    "passwordChanged": true
  }
}
```

### 7. Logout

```http
POST /api/dashboard/auth/logout
Authorization: Bearer <jwt-token>
```

**Description:** Logs out the current user and invalidates the refresh token.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## Admin-Only Endpoints

### 8. Get All Users (Admin Only)

```http
GET /api/dashboard/auth/users
Authorization: Bearer <jwt-token>
```

**Access:** Admin users only

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (admin, editor, viewer)
- `status` (optional): Filter by status (active, inactive)
- `sort` (optional): Sort field (default: -createdAt)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": {
    "users": [
      {
        "_id": "674b123456789abc12345678",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "editor",
        "status": "active",
        "createdAt": "2024-11-16T10:30:00.000Z",
        "updatedAt": "2024-11-16T10:30:00.000Z"
      },
      {
        "_id": "674b123456789abc12345679",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "viewer",
        "status": "active",
        "createdAt": "2024-11-15T14:20:00.000Z",
        "updatedAt": "2024-11-15T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 42,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10,
      "resultsOnPage": 10
    },
    "filters": {
      "search": null,
      "role": null,
      "status": null,
      "sort": "-createdAt"
    }
  }
}
```

### 9. Get User by ID (Admin Only)

```http
GET /api/dashboard/auth/users/:id
Authorization: Bearer <jwt-token>
```

**Access:** Admin users only

**Success Response (200):**

```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T10:30:00.000Z"
    }
  }
}
```

### 10. Assign Role (Admin Only)

```http
PUT /api/dashboard/auth/assign-role
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin users only

**Description:** Assign or change a user's role.

**Request Body:**

```json
{
  "email": "user@example.com",
  "role": "editor"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Role assigned successfully to user: user@example.com",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "editor",
      "status": "active",
      "updatedAt": "2024-11-16T12:00:00.000Z"
    },
    "updatedBy": {
      "_id": "674b987654321abc87654321",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "previousRole": "viewer",
    "newRole": "editor"
  }
}
```

### 11. Admin Change User Password (Admin Only)

```http
PUT /api/dashboard/auth/admin/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin users only

**Description:** Change password for any user (except other admins and self).

**Request Body:**

```json
{
  "email": "user@example.com",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password updated successfully for user: user@example.com",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "editor",
      "status": "active",
      "updatedAt": "2024-11-16T10:30:00.000Z"
    },
    "updatedBy": {
      "_id": "674b987654321abc87654321",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "passwordChanged": true
  }
}
```

**Business Rules:**

- ❌ Admin cannot change their own password through this endpoint
- ❌ Admin cannot change passwords of other admin users
- ✅ Only works for users with `editor` and `viewer` roles

---

## Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Email and password are required."
}
```

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": [
    "Name is required.",
    "Email must be valid.",
    "Password must be at least 8 characters."
  ]
}
```

### 400 - Weak Password

```json
{
  "success": false,
  "message": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### 401 - Invalid Token

```json
{
  "success": false,
  "message": "Invalid token. Access denied."
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 403 - Account Inactive

```json
{
  "success": false,
  "message": "Your account is inactive. Please contact administrator."
}
```

### 404 - User Not Found

```json
{
  "success": false,
  "message": "User not found."
}
```

### 409 - User Already Exists

```json
{
  "success": false,
  "message": "User already exists with this email."
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## Rate Limiting

- **Login attempts**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password change**: 10 attempts per hour per user
- **General auth endpoints**: 60 requests per minute per user

---

## Example Usage

### JavaScript/Node.js

```javascript
// Login
const loginResponse = await fetch('/api/dashboard/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
  }),
});

const loginResult = await loginResponse.json();
const token = loginResult.data.token;

// Get all users (admin only)
const usersResponse = await fetch('/api/dashboard/auth/users?page=1&limit=10', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const usersResult = await usersResponse.json();
```

### cURL

```bash
# Login
curl -X POST https://api.example.com/api/dashboard/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Get users with pagination and filtering
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/dashboard/auth/users?page=1&limit=10&role=editor"

# Change user role
curl -X PUT https://api.example.com/api/dashboard/auth/assign-role \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "role": "editor"
  }'
```

---

## Security Notes

1. **JWT Tokens**: Access tokens expire in 1 hour, refresh tokens in 7 days
2. **Password Hashing**: All passwords hashed using bcrypt with salt rounds
3. **Rate Limiting**: Implemented to prevent brute force attacks
4. **Input Validation**: All inputs validated and sanitized
5. **Role-Based Access**: Strict role checking for admin operations
6. **Audit Trail**: User actions logged for security monitoring
7. **HTTPS Only**: All endpoints must use HTTPS in production
8. **CORS**: Configured for authorized domains only

---

## Token Management

### Access Token

- **Expiration**: 1 hour
- **Usage**: Include in Authorization header for API requests
- **Format**: `Bearer <access-token>`

### Refresh Token

- **Expiration**: 7 days
- **Usage**: Generate new access tokens
- **Storage**: Secure, HTTP-only cookies recommended
- **Rotation**: New refresh token issued on each refresh

### Token Refresh Flow

1. Access token expires (401 error)
2. Client uses refresh token to get new access token
3. New access token and refresh token returned
4. Client updates stored tokens
5. Retry original request with new access token
