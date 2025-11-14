# Shop Texxolution API Contract Documentation

> **Updated:** November 13, 2025  
> **Version:** 3.0  
> **Base URL:** `https://shop-texxolution-node-be.onrender.com`  
> **Changes:** Removed all pricing information, updated to staging URL, simplified product structure

## 🌐 Base URLs

**Staging/Production:** `https://shop-texxolution-node-be.onrender.com`  
**Development:** `http://localhost:8080`

All API endpoints should be prefixed with the base URL. For example:

- Health Check: `https://shop-texxolution-node-be.onrender.com/health`
- Public Products: `https://shop-texxolution-node-be.onrender.com/api/public/products`
- Dashboard Login: `https://shop-texxolution-node-be.onrender.com/api/dashboard/auth/login`

## 🌐 Public Endpoints (No Authentication Required)

### 1. Health Check

```http
GET /health
```

**Success Response (200):**

```json
{
  "status": "OK",
  "message": "Server is healthy",
  "timestamp": "2024-11-13T10:30:00.000Z",
  "environment": "production"
}
```

### 2. Get Public Products

```http
GET /api/public/products
```

**Query Parameters:**

- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 12) - Number of products per page
- `category` (string) - Filter by product category
- `search` (string) - Search in name, description, and tags
- `sort` (string) - Sort by fields (e.g., "name", "-createdAt", "category")
- `color` (string) - Filter by color
- `gsm` (number) - Filter by GSM value
- `tags` (string) - Comma-separated tags to filter by

**Success Response (200):**

```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": {
    "products": [
      {
        "_id": "674b123456789abc12345678",
        "sku": "TEX001",
        "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
        "name": "Premium Cotton Fabric",
        "category": "Fabric (Finished)",
        "description": "High-quality cotton fabric perfect for garments.",
        "images": {
          "main": "https://r2-domain.com/products/TEX001/images/main.jpg",
          "gallery": [
            "https://r2-domain.com/products/TEX001/images/gallery1.jpg"
          ]
        },
        "composition": "100% Cotton",
        "color": "White",
        "width": "60 inches",
        "gsm": 180,
        "finish": "Mercerized",
        "application": "Shirting, Bedding",
        "moq": 100,
        "leadTime": "2-3 weeks",
        "tags": ["cotton", "premium", "shirting"],
        "status": "active",
        "isAvailable": true,
        "createdAt": "2024-11-13T03:30:00.000Z",
        "updatedAt": "2024-11-13T03:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 12
    }
  }
}
```

### 3. Get Public Product by uniqueId

```http
GET /api/public/products/:uniqueId
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product retrieved successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
      "name": "Premium Cotton Fabric",
      "category": "Fabric (Finished)",
      "description": "High-quality cotton fabric perfect for garments.",
      "images": {
        "main": "https://r2-domain.com/products/TEX001/images/main.jpg",
        "gallery": ["https://r2-domain.com/products/TEX001/images/gallery1.jpg"]
      },
      "composition": "100% Cotton",
      "color": "White",
      "width": "60 inches",
      "gsm": 180,
      "finish": "Mercerized",
      "application": "Shirting, Bedding",
      "moq": 100,
      "leadTime": "2-3 weeks",
      "tags": ["cotton", "premium", "shirting"],
      "specSheet": "https://r2-domain.com/products/TEX001/files/spec.pdf",
      "status": "active",
      "isAvailable": true,
      "categoryData": {
        "fabricType": "Woven",
        "threadCount": "120x80",
        "shrinkage": "3%",
        "washCare": "Machine wash cold"
      },
      "createdAt": "2024-11-13T03:30:00.000Z",
      "updatedAt": "2024-11-13T03:30:00.000Z"
    }
  }
}
```

### 4. Submit Enquiry

```http
POST /api/public/enquiries
Content-Type: application/json
```

**Request Body:**

```json
{
  "companyName": "ABC Textiles Ltd",
  "contactPerson": "John Doe",
  "email": "john@abctextiles.com",
  "phone": "+91-9876543210",
  "products": [
    {
      "productId": "674b123456789abc12345678",
      "quantity": 1000,
      "unit": "meters",
      "specifications": "Custom requirements here"
    }
  ],
  "message": "We are interested in bulk purchase of this fabric.",
  "urgency": "medium"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Enquiry submitted successfully.",
  "data": {
    "enquiry": {
      "_id": "674b123456789abc12345679",
      "enquiryNo": "ENQ-2024-001",
      "companyName": "ABC Textiles Ltd",
      "contactPerson": "John Doe",
      "email": "john@abctextiles.com",
      "phone": "+91-9876543210",
      "status": "new",
      "urgency": "medium",
      "totalProducts": 1,
      "submittedAt": "2024-11-13T03:30:00.000Z"
    }
  }
}
```

---

## 🔐 Authentication & Authorization

All dashboard endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### User Roles:

- **admin**: Full access to all endpoints, can assign roles to other users
- **editor**: Can create, update, and manage content
- **viewer**: Read-only access (default role for new signups)

### User Registration Flow:

1. **New User Signup**: All new users are automatically assigned the `viewer` role
2. **Role Assignment**: Only `admin` users can upgrade roles using the `/assign-role` endpoint
3. **Role Restrictions**: Users cannot change their own role, and the last admin cannot be demoted

### Rate Limiting:

All authentication endpoints are rate-limited to **5 attempts per 15 minutes** per IP address to prevent brute-force attacks.

---

## 🔐 Authentication Endpoints

### 1. Login

```http
POST /api/dashboard/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin",
      "status": "active"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 2. Signup

```http
POST /api/dashboard/auth/signup
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

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
      "role": "viewer",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Error Response (409) - Email Already Exists:**

```json
{
  "success": false,
  "message": "User with this email already exists."
}
```

**Error Response (400) - Invalid Password:**

```json
{
  "success": false,
  "message": "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character."
}
```

### 3. Get Profile

```http
GET /api/dashboard/auth/profile
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-11-13T03:30:00.000Z",
      "updatedAt": "2024-11-13T03:30:00.000Z"
    }
  }
}
```

### 4. Assign Role (Admin Only)

```http
PUT /api/dashboard/auth/assign-role
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin users only

**Request Body:**

```json
{
  "email": "user@example.com",
  "role": "editor"
}
```

**Available Roles:**

- `admin`: Full access to all endpoints
- `editor`: Can create, update, and manage content
- `viewer`: Read-only access

**Success Response (200):**

```json
{
  "success": true,
  "message": "User role updated successfully from 'viewer' to 'editor'.",
  "data": {
    "user": {
      "_id": "674b123456789abc12345678",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "editor",
      "status": "active"
    },
    "previousRole": "viewer",
    "newRole": "editor",
    "updatedBy": {
      "_id": "674b987654321abc87654321",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

**Error Response (404) - User Not Found:**

```json
{
  "success": false,
  "message": "User not found with the provided email."
}
```

**Error Response (403) - Access Denied:**

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**Error Response (403) - Cannot Change Own Role:**

```json
{
  "success": false,
  "message": "You cannot change your own role."
}
```

**Error Response (403) - Last Admin Protection:**

```json
{
  "success": false,
  "message": "Cannot remove the last admin user."
}
```

---

## 📦 Product Management Endpoints

### 1. Get All Products

```http
GET /api/dashboard/products
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort field with direction (e.g., "-createdAt", "name")
- `category` (string): Filter by category
- `status` (string): Filter by status (draft, active, inactive, discontinued)
- `search` (string): Search in name, SKU, description
- `createdBy` (string): Filter by creator ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": {
    "products": [
      {
        "_id": "674b123456789abc12345678",
        "sku": "TEX001",
        "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
        "name": "Premium Cotton Fabric",
        "category": "Fabric (Finished)",
        "description": "High-quality cotton fabric",
        "status": "active",
        "images": {
          "main": "https://r2-domain.com/products/TEX001/images/main.jpg",
          "gallery": [
            "https://r2-domain.com/products/TEX001/images/gallery1.jpg"
          ]
        },
        "composition": "100% Cotton",
        "color": "White",
        "gsm": 180,
        "moq": 100,
        "leadTime": "2-3 weeks",
        "createdBy": {
          "_id": "674b123456789abc12345679",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2024-11-13T03:30:00.000Z",
        "updatedAt": "2024-11-13T03:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 100,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

### 2. Create Product

```http
POST /api/dashboard/products
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:**

```json
{
  "sku": "TEX002",
  "name": "Silk Fabric",
  "category": "Fabric (Finished)",
  "description": "Luxurious silk fabric",
  "composition": "100% Silk",
  "color": "Ivory",
  "width": "45 inches",
  "gsm": 80,
  "finish": "Satin",
  "application": "Formal wear",
  "moq": 50,
  "leadTime": "10-14 days",
  "tags": ["silk", "luxury", "ivory"],
  "status": "active",
  "categoryData": {
    "weaveType": "Plain",
    "threadCount": "400TC"
  }
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX002",
      "uniqueId": "silk-fabric-fabric-finished-1699876544",
      "name": "Silk Fabric",
      "category": "Fabric (Finished)",
      "status": "active",
      "images": {
        "main": "",
        "gallery": []
      },
      "createdBy": {
        "_id": "674b123456789abc12345679",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  }
}
```

### 3. Get Product Stats

```http
GET /api/dashboard/products/stats
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product statistics retrieved successfully.",
  "data": {
    "total": 150,
    "byStatus": [
      { "_id": "active", "count": 120 },
      { "_id": "draft", "count": 20 },
      { "_id": "inactive", "count": 10 }
    ],
    "byCategory": [
      { "_id": "Fabric (Finished)", "count": 50 },
      { "_id": "Yarn", "count": 30 },
      { "_id": "Denim", "count": 25 },
      { "_id": "Garments", "count": 20 }
    ],
    "recent": [
      {
        "_id": "674b123456789abc12345678",
        "name": "Premium Cotton Fabric",
        "sku": "TEX001",
        "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
        "status": "active",
        "createdAt": "2024-11-13T03:30:00.000Z",
        "createdBy": {
          "_id": "674b123456789abc12345679",
          "name": "Admin User"
        }
      }
    ]
  }
}
```

### 4. Get Product by ID

```http
GET /api/dashboard/products/{id}
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product retrieved successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
      "name": "Premium Cotton Fabric",
      "category": "Fabric (Finished)",
      "description": "High-quality cotton fabric",
      "composition": "100% Cotton",
      "color": "White",
      "width": "60 inches",
      "gsm": 150,
      "finish": "Plain",
      "application": "Clothing",
      "moq": 100,
      "leadTime": "7-10 days",
      "tags": ["cotton", "premium", "white"],
      "status": "active",
      "categoryData": {
        "organicCertified": true,
        "shrinkage": "3%"
      },
      "images": {
        "main": "https://r2-domain.com/products/TEX001/images/main.jpg",
        "gallery": []
      },
      "specSheet": "https://r2-domain.com/products/TEX001/files/spec.pdf",
      "createdBy": {
        "_id": "674b123456789abc12345679",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-11-13T03:30:00.000Z",
      "updatedAt": "2024-11-13T03:30:00.000Z"
    }
  }
}
```

### 5. Update Product

```http
PUT /api/dashboard/products/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:** (All fields optional)

```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "status": "active",
  "color": "Blue",
  "gsm": 200
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "name": "Updated Product Name",
      "updatedBy": {
        "_id": "674b123456789abc12345679",
        "name": "Admin User"
      }
    }
  }
}
```

### 6. Delete Product

```http
DELETE /api/dashboard/products/{id}
Authorization: Bearer <jwt-token>
Access: Admin
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully."
}
```

---

## 📧 Enquiry Management Endpoints

### 1. Get All Enquiries

```http
GET /api/dashboard/enquiries
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `sort` (string): Sort field with direction
- `status` (string): Filter by status (new, contacted, quoted, converted, closed)
- `search` (string): Search in name, email, company

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiries retrieved successfully.",
  "data": {
    "enquiries": [
      {
        "_id": "674b123456789abc12345678",
        "enquiryNo": "ENQ-001",
        "customerName": "John Smith",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "ABC Corp",
        "subject": "Product Inquiry",
        "message": "Interested in cotton fabrics",
        "status": "new",
        "priority": "medium",
        "source": "website",
        "products": [
          {
            "_id": "674b123456789abc12345679",
            "name": "Cotton Fabric",
            "sku": "TEX001",
            "uniqueId": "cotton-fabric-fabric-finished-1699876540"
          }
        ],
        "createdAt": "2024-11-13T03:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalEnquiries": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

### 2. Get Enquiry by ID

```http
GET /api/dashboard/enquiries/{id}
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiry retrieved successfully.",
  "data": {
    "enquiry": {
      "_id": "674b123456789abc12345678",
      "enquiryNo": "ENQ-001",
      "customerName": "John Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "ABC Corp",
      "message": "Interested in cotton fabrics for bulk order",
      "status": "contacted",
      "priority": "high",
      "products": [
        {
          "_id": "674b123456789abc12345680",
          "name": "Premium Cotton Fabric",
          "sku": "TEX001",
          "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
          "quantity": 1000,
          "specifications": "60 inch width, white color"
        }
      ],
      "createdAt": "2024-11-13T03:30:00.000Z",
      "updatedAt": "2024-11-13T04:00:00.000Z"
    }
  }
}
```

### 3. Update Enquiry

```http
PATCH /api/dashboard/enquiries/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:**

```json
{
  "status": "contacted",
  "priority": "high"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiry updated successfully.",
  "data": {
    "enquiry": {
      "_id": "674b123456789abc12345678",
      "status": "contacted",
      "priority": "high",
      "updatedAt": "2024-11-13T04:00:00.000Z"
    }
  }
}
```

---

## 📤 File Upload Endpoints

### 1. Upload Product Images

```http
POST /api/dashboard/uploads/products/{productId}/images
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
Access: Admin, Editor
```

**Form Data:**

- `images` (files): Multiple image files (max 10 files, max 5MB each)
- `imageType` (string): "main" or "gallery" (default: "gallery")

**Supported Formats:** JPEG, PNG, WebP

**Success Response (200):**

```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully.",
  "data": {
    "uploadedImages": [
      "https://r2-domain.com/products/TEX001/images/image_1234567890_0.jpg",
      "https://r2-domain.com/products/TEX001/images/image_1234567891_1.jpg",
      "https://r2-domain.com/products/TEX001/images/image_1234567892_2.jpg"
    ],
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
      "name": "Premium Cotton Fabric",
      "images": {
        "main": "https://r2-domain.com/products/TEX001/images/image_1234567890_0.jpg",
        "gallery": [
          "https://r2-domain.com/products/TEX001/images/image_1234567891_1.jpg",
          "https://r2-domain.com/products/TEX001/images/image_1234567892_2.jpg"
        ]
      }
    }
  }
}
```

### 2. Upload Product Files

```http
POST /api/dashboard/uploads/products/{productId}/files
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
Access: Admin, Editor
```

**Form Data:**

- `file` (file): Single file (max 10MB)
- `fileType` (string): "spec" (default: "spec")

**Supported Formats:** PDF, DOC, DOCX

**Success Response (200):**

```json
{
  "success": true,
  "message": "spec file uploaded successfully.",
  "data": {
    "fileUrl": "https://r2-domain.com/products/TEX001/files/spec_TEX001_1234567890.pdf",
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "uniqueId": "premium-cotton-fabric-fabric-finished-1699876543",
      "name": "Premium Cotton Fabric",
      "specSheet": "https://r2-domain.com/products/TEX001/files/spec_TEX001_1234567890.pdf"
    }
  }
}
```

---

## 🚨 Error Responses

### Common Error Status Codes:

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

### Error Response Format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

---

## 📝 Notes

### Key Features:

1. **No Pricing Information**: All pricing-related data has been removed from the API
2. **Unique ID System**: Products use uniqueId for public URLs (SEO-friendly)
3. **Redis Caching**: Product details are cached for performance
4. **File Storage**: Images and documents stored in Cloudflare R2
5. **Authentication**: JWT-based authentication for dashboard access

### Product Categories:

- Yarn
- Garments
- Denim
- Greige Fabric
- Packing
- Machineries & Equipment
- Home Decoration
- Textile Farming
- Fibre
- Fabric (Finished)
- Finished Fabrics
- Trims & Accessories
- Dyes & Chemicals

### Product Fields:

**Core Fields:** sku, uniqueId, name, category, description, composition, color, width, gsm, finish, application, moq, leadTime, tags, status

**Optional Fields:** images, specSheet, categoryData (flexible JSON for category-specific data)

**System Fields:** createdBy, updatedBy, createdAt, updatedAt

---

**Last Updated:** November 13, 2025  
**Deployment URL:** https://shop-texxolution-node-be.onrender.com
