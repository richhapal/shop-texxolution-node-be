# Authentication API Contract

## Overview

This document outlines the authentication and user management API endpoints for the Shop Texxolution platform. All endpoints are RESTful and return JSON responses.

**Base URL:** `https://your-domain.com/api/dashboard/auth`

## Authentication

Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles

- **admin**: Full access to all features
- **editor**: Can create and edit products, view analytics
- **viewer**: Read-only access

---

## Endpoints

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

---

### 2. User Registration (Admin Only)

```http
POST /api/dashboard/auth/register
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin users only

**Description:** Creates a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "editor"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully.",
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

**Error Responses:**

**400 - Validation Error:**

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

**409 - User Already Exists:**

```json
{
  "success": false,
  "message": "User already exists with this email."
}
```

---

### 3. Get User Profile

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

---

### 4. Update User Profile

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

---

### 5. Change Password

```http
PUT /api/dashboard/auth/change-password
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

**Error Responses:**

**400 - Invalid Current Password:**

```json
{
  "success": false,
  "message": "Current password is incorrect."
}
```

**400 - Weak Password:**

```json
{
  "success": false,
  "message": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
}
```

---

### 6. Admin Change User Password (Admin Only)

```http
PUT /api/dashboard/auth/admin/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin users only

**Description:** Allows admin users to change passwords for other users (editors and viewers only). Admins cannot change their own password or other admin passwords through this endpoint.

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

**Business Rules & Restrictions:**

- ❌ Admin cannot change their own password through this endpoint
- ❌ Admin cannot change passwords of other admin users
- ✅ Only works for users with `editor` and `viewer` roles

**Error Responses:**

**403 - Cannot Change Own Password:**

```json
{
  "success": false,
  "message": "Use the regular change-password endpoint to change your own password."
}
```

**403 - Cannot Change Admin Password:**

```json
{
  "success": false,
  "message": "Cannot change password for admin users."
}
```

---

### 7. Get All Users (Admin Only)

```http
GET /api/dashboard/auth/users
Authorization: Bearer <jwt-token>
```

**Access:** Admin users only

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (admin, editor, viewer)
- `status` (optional): Filter by status (active, inactive)

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
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

---

### 8. Get User by ID (Admin Only)

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

---

### 9. Update User (Admin Only)

```http
PUT /api/dashboard/auth/users/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin users only

**Request Body:**

```json
{
  "name": "John Updated Doe",
  "email": "john.updated@example.com",
  "role": "viewer",
  "status": "active"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Updated Doe",
      "email": "john.updated@example.com",
      "role": "viewer",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T11:45:00.000Z"
    }
  }
}
```

**Business Rules:**

- Cannot change role of the last admin user
- Cannot deactivate the last admin user

---

### 10. Delete User (Admin Only)

```http
DELETE /api/dashboard/auth/users/:id
Authorization: Bearer <jwt-token>
```

**Access:** Admin users only

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "status": "inactive"
    }
  }
}
```

**Error Responses:**

**403 - Cannot Delete Last Admin:**

```json
{
  "success": false,
  "message": "Cannot delete the last admin user."
}
```

---

## Common Error Responses

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "User not found."
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

// Get profile
const profileResponse = await fetch('/api/dashboard/auth/profile', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const profileResult = await profileResponse.json();
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

# Get profile (replace TOKEN with actual token)
curl -X GET https://api.example.com/api/dashboard/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Security Notes

1. **JWT Tokens**: Tokens have an expiration time. Clients should handle token refresh.
2. **Password Hashing**: All passwords are hashed using bcrypt before storage.
3. **Rate Limiting**: Login attempts are rate-limited to prevent brute force attacks.
4. **Input Validation**: All inputs are validated and sanitized.
5. **HTTPS Only**: All authentication endpoints must be accessed over HTTPS in production.

---

## Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error
