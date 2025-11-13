# Shop Texxolution API Contract Documentation

> **Updated:** November 13, 2025  
> **Version:** 2.0  
> **Changes:** Removed inventory management, added public endpoints, enhanced security for pricing information

## 🌐 Public Endpoints (No Authentication Required)

### 1. Health Check

```http
GET /health
```

**Success Response (200):**

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-11-13T10:30:00.000Z",
  "environment": "development"
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
- `minPrice` (number) - Minimum price filter (not used in public API)
- `maxPrice` (number) - Maximum price filter (not used in public API)
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

**Note:** Public endpoints do not expose pricing information, vendor details, or internal tracking data for security reasons.

### 3. Get Public Product by ID

```http
GET /api/public/products/:id
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
      "seo": {
        "metaTitle": "Premium Cotton Fabric - TEX001",
        "metaDescription": "High-quality cotton fabric for premium garments",
        "keywords": ["cotton", "fabric", "premium"]
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

## Dashboard API Contract Documentation

## 🔄 Recent Changes (v2.0)

### Removed Features:
- ❌ **Inventory Management**: No longer tracking stock levels (inStock, reserved, trackInventory)
- ❌ **Low Stock Alerts**: Removed from product statistics
- ❌ **Stock-based Availability**: Products are now available based on status only

### Enhanced Security:
- 🔒 **Public API Protection**: Pricing information is never exposed in public endpoints
- 🔒 **Field Exclusion**: Vendor details and internal tracking data hidden from public
- 🔒 **Role-based Access**: Dashboard endpoints require proper authentication and authorization

### New Features:
- ✅ **Public Product Catalog**: Browse products without authentication
- ✅ **Public Enquiry System**: Submit enquiries without registration
- ✅ **Simplified Availability**: Products are available when status = "active"
- ✅ **Enhanced Documentation**: Complete API contract with examples

---

## Authentication & Authorization

All dashboard endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### User Roles:

- **admin**: Full access to all endpoints
- **editor**: Can create, update, and manage content
- **viewer**: Read-only access

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

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### 2. Refresh Token

```http
POST /api/dashboard/auth/refresh-token
Content-Type: application/json
```

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

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

---

### 4. Update Profile

```http
PUT /api/dashboard/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Updated",
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
      "name": "John Updated",
      "email": "john.updated@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

---

### 5. Change Password

```http
POST /api/dashboard/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

### 6. Logout

```http
POST /api/dashboard/auth/logout
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully."
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
- `status` (string): Filter by status (draft, active, discontinued)
- `search` (string): Search in name, SKU, description
- `createdBy` (string): Filter by creator ID
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

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
        "name": "Premium Cotton Fabric",
        "category": "Cotton",
        "description": "High-quality cotton fabric",
        "status": "active",
        "images": {
          "main": "https://r2-domain.com/products/TEX001/images/main.jpg",
          "gallery": [
            "https://r2-domain.com/products/TEX001/images/gallery1.jpg"
          ]
        },
        "pricing": {
          "basePrice": 25.5,
          "currency": "USD"
        },
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

---

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
  "category": "Silk",
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
  },
  "pricing": {
    "basePrice": 85.0,
    "currency": "USD"
  },
  "seo": {
    "title": "Premium Silk Fabric",
    "description": "High-quality silk fabric"
  },
  "vendor": {
    "name": "Silk Supplier Co",
    "email": "supplier@example.com"
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
      "name": "Silk Fabric",
      "category": "Silk",
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

---

### 3. Create Product with Images

```http
POST /api/dashboard/products/with-images
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
Access: Admin, Editor
```

**Form Data:**

- `productData` (string): JSON stringified product data
- `mainImage` (file): Single main image file (optional)
- `galleryImages` (files): Multiple gallery images (max 9, optional)
- `specSheet` (file): PDF spec sheet (optional)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully with files.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX003",
      "name": "Premium Wool Fabric",
      "images": {
        "main": "https://r2-domain.com/products/TEX003/images/main_1234567890.jpg",
        "gallery": [
          "https://r2-domain.com/products/TEX003/images/image_1234567890_0.jpg"
        ]
      },
      "specSheet": "https://r2-domain.com/products/TEX003/files/spec_TEX003_1234567890.pdf"
    },
    "uploadedFiles": {
      "mainImage": "https://r2-domain.com/products/TEX003/images/main_1234567890.jpg",
      "galleryImages": [
        "https://r2-domain.com/products/TEX003/images/image_1234567890_0.jpg"
      ],
      "specSheet": "https://r2-domain.com/products/TEX003/files/spec_TEX003_1234567890.pdf"
    }
  }
}
```

---

### 4. Get Product Stats

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

---

### 5. Get Product by ID

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
      "name": "Premium Cotton Fabric",
      "category": "Cotton",
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
      "pricing": {
        "basePrice": 25.5,
        "currency": "USD"
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

---

### 6. Update Product

```http
PUT /api/dashboard/products/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:** (Same as Create Product, all fields optional)

```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "pricing": {
    "basePrice": 30.0
  },
  "status": "active"
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

---

### 7. Delete Product

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

### 8. Bulk Update Products

```http
PATCH /api/dashboard/products/bulk
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:**

```json
{
  "productIds": ["674b123456789abc12345678", "674b123456789abc12345679"],
  "updateData": {
    "status": "active",
    "category": "Updated Category"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 products updated successfully.",
  "data": {
    "updatedCount": 2,
    "skippedCount": 0
  }
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
- `assignedTo` (string): Filter by assigned user ID
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `source` (string): Filter by source
- `search` (string): Search in name, email, company
- `dateFrom` (string): Filter from date (ISO string)
- `dateTo` (string): Filter to date (ISO string)

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
        "assignedTo": null,
        "followUpDate": null,
        "products": [
          {
            "_id": "674b123456789abc12345679",
            "name": "Cotton Fabric",
            "sku": "TEX001"
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

---

### 2. Get Enquiry Stats

```http
GET /api/dashboard/enquiries/stats
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiry statistics retrieved successfully.",
  "data": {
    "totalEnquiries": 250,
    "newEnquiries": 45,
    "contactedEnquiries": 80,
    "quotedEnquiries": 70,
    "convertedEnquiries": 35,
    "closedEnquiries": 20,
    "priorityCounts": {
      "low": 100,
      "medium": 90,
      "high": 50,
      "urgent": 10
    },
    "sourceCounts": {
      "website": 150,
      "email": 50,
      "phone": 30,
      "referral": 20
    }
  }
}
```

---

### 3. Get Enquiry by ID

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
      "subject": "Product Inquiry",
      "message": "Interested in cotton fabrics for bulk order",
      "status": "contacted",
      "priority": "high",
      "source": "website",
      "assignedTo": {
        "_id": "674b123456789abc12345679",
        "name": "Sales Rep",
        "email": "sales@example.com"
      },
      "followUpDate": "2024-11-15T10:00:00.000Z",
      "internalNote": "Customer is interested in bulk order",
      "products": [
        {
          "_id": "674b123456789abc12345680",
          "name": "Premium Cotton Fabric",
          "sku": "TEX001",
          "quantity": 1000,
          "specifications": "60 inch width, white color"
        }
      ],
      "communications": [
        {
          "_id": "674b123456789abc12345681",
          "type": "email",
          "subject": "Re: Product Inquiry",
          "content": "Thank you for your inquiry. We'll get back to you soon.",
          "direction": "outbound",
          "communicatedBy": {
            "_id": "674b123456789abc12345679",
            "name": "Sales Rep"
          },
          "communicatedAt": "2024-11-13T04:00:00.000Z"
        }
      ],
      "createdAt": "2024-11-13T03:30:00.000Z",
      "updatedAt": "2024-11-13T04:00:00.000Z"
    }
  }
}
```

---

### 4. Update Enquiry

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
  "assignedTo": "674b123456789abc12345679",
  "priority": "high",
  "followUpDate": "2024-11-15T10:00:00.000Z",
  "internalNote": "Customer is interested in bulk order"
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
      "assignedTo": {
        "_id": "674b123456789abc12345679",
        "name": "Sales Rep"
      },
      "priority": "high",
      "updatedAt": "2024-11-13T04:00:00.000Z"
    }
  }
}
```

---

### 5. Add Communication

```http
POST /api/dashboard/enquiries/{id}/communication
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:**

```json
{
  "type": "email",
  "subject": "Follow-up on your inquiry",
  "content": "Thank you for your interest. Here are the details you requested.",
  "direction": "outbound"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Communication added successfully.",
  "data": {
    "communication": {
      "_id": "674b123456789abc12345682",
      "type": "email",
      "subject": "Follow-up on your inquiry",
      "content": "Thank you for your interest. Here are the details you requested.",
      "direction": "outbound",
      "communicatedBy": {
        "_id": "674b123456789abc12345679",
        "name": "Sales Rep"
      },
      "communicatedAt": "2024-11-13T04:30:00.000Z"
    }
  }
}
```

---

### 6. Bulk Update Enquiries

```http
PATCH /api/dashboard/enquiries/bulk
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:**

```json
{
  "enquiryIds": ["674b123456789abc12345678", "674b123456789abc12345679"],
  "updateData": {
    "status": "contacted",
    "assignedTo": "674b123456789abc12345680"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 enquiries updated successfully.",
  "data": {
    "updatedCount": 2,
    "skippedCount": 0
  }
}
```

---

## 💰 Quotation Management Endpoints

### 1. Get All Quotations

```http
GET /api/dashboard/quotations
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `sort` (string): Sort field with direction
- `status` (string): Filter by status (draft, sent, accepted, rejected, expired)
- `createdBy` (string): Filter by creator ID
- `search` (string): Search in quotation number, customer details
- `dateFrom` (string): Filter from date
- `dateTo` (string): Filter to date
- `expiringIn` (number): Filter quotations expiring in X days

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotations retrieved successfully.",
  "data": {
    "quotations": [
      {
        "_id": "674b123456789abc12345678",
        "quotationNo": "QUO-001",
        "enquiryId": {
          "_id": "674b123456789abc12345679",
          "enquiryNo": "ENQ-001",
          "customerName": "John Smith",
          "email": "john@example.com",
          "company": "ABC Corp"
        },
        "status": "sent",
        "totalAmount": 2550.0,
        "currency": "USD",
        "validUntil": "2024-12-13T23:59:59.000Z",
        "products": [
          {
            "productId": "674b123456789abc12345680",
            "name": "Premium Cotton Fabric",
            "sku": "TEX001",
            "quantity": 100,
            "unitPrice": 25.5,
            "totalPrice": 2550.0
          }
        ],
        "createdBy": {
          "_id": "674b123456789abc12345681",
          "name": "Sales Manager"
        },
        "createdAt": "2024-11-13T03:30:00.000Z",
        "sentAt": "2024-11-13T04:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalQuotations": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

---

### 2. Create Quotation

```http
POST /api/dashboard/quotations
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor
```

**Request Body:**

```json
{
  "enquiryId": "674b123456789abc12345679",
  "products": [
    {
      "productId": "674b123456789abc12345680",
      "quantity": 100,
      "unitPrice": 25.5,
      "specifications": "60 inch width, white color"
    }
  ],
  "validUntil": "2024-12-13T23:59:59.000Z",
  "terms": "Payment terms: 30 days net. Delivery: 2-3 weeks.",
  "currency": "USD",
  "taxRate": 10,
  "shippingCost": 100.0,
  "paymentTerms": "Net 30"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Quotation created successfully.",
  "data": {
    "quotation": {
      "_id": "674b123456789abc12345678",
      "quotationNo": "QUO-002",
      "enquiryId": {
        "_id": "674b123456789abc12345679",
        "customerName": "John Smith",
        "email": "john@example.com"
      },
      "status": "draft",
      "products": [
        {
          "productId": "674b123456789abc12345680",
          "name": "Premium Cotton Fabric",
          "sku": "TEX001",
          "quantity": 100,
          "unitPrice": 25.5,
          "totalPrice": 2550.0
        }
      ],
      "subtotal": 2550.0,
      "taxAmount": 255.0,
      "shippingCost": 100.0,
      "totalAmount": 2905.0,
      "currency": "USD",
      "validUntil": "2024-12-13T23:59:59.000Z",
      "createdAt": "2024-11-13T03:30:00.000Z"
    }
  }
}
```

---

### 3. Get Quotation Stats

```http
GET /api/dashboard/quotations/stats
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation statistics retrieved successfully.",
  "data": {
    "totalQuotations": 150,
    "draftQuotations": 25,
    "sentQuotations": 70,
    "acceptedQuotations": 35,
    "rejectedQuotations": 15,
    "expiredQuotations": 5,
    "totalQuotationValue": 250000.0,
    "acceptedQuotationValue": 87500.0,
    "averageQuotationValue": 1666.67,
    "conversionRate": 50.0,
    "expiringToday": 3,
    "expiringThisWeek": 12
  }
}
```

---

### 4. Get Quotation by ID

```http
GET /api/dashboard/quotations/{id}
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation retrieved successfully.",
  "data": {
    "quotation": {
      "_id": "674b123456789abc12345678",
      "quotationNo": "QUO-001",
      "enquiryId": {
        "_id": "674b123456789abc12345679",
        "enquiryNo": "ENQ-001",
        "customerName": "John Smith",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "ABC Corp"
      },
      "status": "sent",
      "products": [
        {
          "productId": {
            "_id": "674b123456789abc12345680",
            "name": "Premium Cotton Fabric",
            "sku": "TEX001",
            "description": "High-quality cotton fabric"
          },
          "quantity": 100,
          "unitPrice": 25.5,
          "totalPrice": 2550.0,
          "specifications": "60 inch width, white color"
        }
      ],
      "subtotal": 2550.0,
      "taxRate": 10,
      "taxAmount": 255.0,
      "shippingCost": 100.0,
      "totalAmount": 2905.0,
      "currency": "USD",
      "validUntil": "2024-12-13T23:59:59.000Z",
      "terms": "Payment terms: 30 days net. Delivery: 2-3 weeks.",
      "paymentTerms": "Net 30",
      "pdfUrl": "https://r2-domain.com/quotations/quotation_674b123456789abc12345678_1234567890.pdf",
      "createdBy": {
        "_id": "674b123456789abc12345681",
        "name": "Sales Manager",
        "email": "sales@example.com"
      },
      "createdAt": "2024-11-13T03:30:00.000Z",
      "sentAt": "2024-11-13T04:00:00.000Z",
      "updatedAt": "2024-11-13T04:00:00.000Z"
    }
  }
}
```

---

### 5. Update Quotation

```http
PATCH /api/dashboard/quotations/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json
Access: Admin, Editor (only if status is draft)
```

**Request Body:**

```json
{
  "products": [
    {
      "productId": "674b123456789abc12345680",
      "quantity": 150,
      "unitPrice": 24.0,
      "specifications": "Updated specifications"
    }
  ],
  "validUntil": "2024-12-20T23:59:59.000Z",
  "terms": "Updated terms and conditions",
  "shippingCost": 150.0
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation updated successfully.",
  "data": {
    "quotation": {
      "_id": "674b123456789abc12345678",
      "products": [
        {
          "productId": "674b123456789abc12345680",
          "quantity": 150,
          "unitPrice": 24.0,
          "totalPrice": 3600.0
        }
      ],
      "subtotal": 3600.0,
      "totalAmount": 4110.0,
      "updatedAt": "2024-11-13T05:00:00.000Z"
    }
  }
}
```

---

### 6. Send Quotation

```http
POST /api/dashboard/quotations/{id}/send
Authorization: Bearer <jwt-token>
Access: Admin, Editor
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation sent successfully.",
  "data": {
    "quotation": {
      "_id": "674b123456789abc12345678",
      "quotationNo": "QUO-001",
      "status": "sent",
      "sentAt": "2024-11-13T05:30:00.000Z",
      "sentTo": "john@example.com"
    }
  }
}
```

---

### 7. Upload Quotation PDF

```http
POST /api/dashboard/quotations/{id}/pdf
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
Access: Admin, Editor
```

**Form Data:**

- `pdf` (file): PDF file to upload

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation PDF uploaded successfully.",
  "data": {
    "quotation": {
      "_id": "674b123456789abc12345678",
      "quotationNo": "QUO-001",
      "pdfUrl": "https://r2-domain.com/quotations/quotation_674b123456789abc12345678_1234567890.pdf",
      "updatedAt": "2024-11-13T06:00:00.000Z"
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

---

### 2. Delete Product Image

```http
DELETE /api/dashboard/uploads/products/{productId}/images/{imageUrl}
Authorization: Bearer <jwt-token>
Access: Admin, Editor
```

**URL Parameters:**

- `productId`: Product MongoDB ObjectId
- `imageUrl`: URL-encoded image URL to delete

**Success Response (200):**

```json
{
  "success": true,
  "message": "Image deleted successfully.",
  "data": {
    "deletedImageUrl": "https://r2-domain.com/products/TEX001/images/image_123.jpg",
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
      "name": "Premium Cotton Fabric",
      "images": {
        "main": "",
        "gallery": []
      }
    }
  }
}
```

---

### 3. Upload Product Files

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
    "fileName": "products/TEX001/files/spec_TEX001_1234567890.pdf",
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX001",
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

### General Guidelines:
1. **Rate Limiting:** Authentication endpoints have rate limiting (5 attempts per 15 minutes)
2. **File Size Limits:** Images: 5MB, Documents: 10MB
3. **Pagination:** Default page size is 20, maximum is 100
4. **Date Formats:** All dates are in ISO 8601 format
5. **Currency:** All monetary values are in the specified currency (default: USD)
6. **File Storage:** Files are stored in Cloudflare R2 with public URLs

### Security & Privacy:
7. **Public API Security:** Pricing, vendor, and internal data are never exposed in public endpoints
8. **Authentication:** All dashboard endpoints require valid JWT tokens
9. **Authorization:** Role-based access control enforced (admin, editor, viewer)
10. **Data Validation:** All inputs are validated and sanitized

### Product Availability:
11. **Simple Availability Logic:** Products are available when status = "active"
12. **No Inventory Tracking:** Stock levels are not managed by the system
13. **Category-Specific Data:** Each product category can have custom fields in categoryData
14. **SEO Optimization:** All products support SEO metadata for search engines

### File Management:
15. **Image Processing:** Automatic optimization and resizing for web delivery
16. **Cloudflare R2:** S3-compatible object storage with global CDN
17. **Secure Upload:** Presigned URLs for direct browser uploads
18. **File Validation:** MIME type and size validation on upload

### Development:
19. **Environment Variables:** Secure configuration via .env files
20. **MongoDB Atlas:** Cloud database with automatic backups
21. **Error Logging:** Comprehensive logging for debugging and monitoring
22. **API Versioning:** Structured versioning for backward compatibility
