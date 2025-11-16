# Dashboard Products API Contract

## Overview

This document outlines the product management API endpoints for the Shop Texxolution dashboard. These endpoints require authentication and are designed for internal product management.

**Base URL:** `https://your-domain.com/api/dashboard/products`

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles & Permissions

- **admin**: Full CRUD access to all products
- **editor**: Create, read, update products
- **viewer**: Read-only access

---

## Endpoints

### 1. Get All Products (Dashboard)

```http
GET /api/dashboard/products
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Description:** Retrieve all products with full details for dashboard management.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (default: -createdAt)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (draft, active, inactive, discontinued)
- `search` (optional): Search by name, SKU, or description
- `createdBy` (optional): Filter by creator user ID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Success Response (200):**

```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": {
    "products": [
      {
        "_id": "674b123456789abc12345678",
        "sku": "TEX-001",
        "uniqueId": "cotton-fabric-tex-123456",
        "name": "Premium Cotton Fabric",
        "category": "Fabrics",
        "description": "High-quality 100% cotton fabric perfect for garments.",
        "images": {
          "main": "https://cdn.example.com/products/tex-001/main.jpg",
          "gallery": ["https://cdn.example.com/products/tex-001/gallery1.jpg"]
        },
        "composition": "100% Cotton",
        "color": "Natural White",
        "width": "150cm",
        "gsm": 200,
        "finish": "Plain",
        "application": "Garments",
        "moq": 100,
        "leadTime": "2-3 weeks",
        "tags": ["cotton", "natural", "premium"],
        "specSheet": "https://cdn.example.com/products/tex-001/spec.pdf",
        "status": "active",
        "categoryData": {
          "fabricType": "Woven",
          "weavePattern": "Plain"
        },
        "pricing": {
          "basePrice": 12.5,
          "currency": "USD"
        },
        "seo": {
          "metaTitle": "Premium Cotton Fabric - TEX-001",
          "metaDescription": "High-quality cotton fabric for garments"
        },
        "vendor": {
          "name": "Premium Textiles Ltd",
          "country": "India"
        },
        "createdBy": "674b987654321abc87654321",
        "updatedBy": "674b987654321abc87654321",
        "createdAt": "2024-11-16T10:30:00.000Z",
        "updatedAt": "2024-11-16T11:45:00.000Z"
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

### 2. Create Product (Simple)

```http
POST /api/dashboard/products
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Description:** Create a new product with JSON data (no file uploads).

**Request Body:**

```json
{
  "sku": "TEX-002",
  "name": "Silk Fabric Premium",
  "category": "Fabrics",
  "description": "Luxurious silk fabric for high-end garments.",
  "composition": "100% Silk",
  "color": "Ivory",
  "width": "140cm",
  "gsm": 80,
  "finish": "Satin",
  "application": "Evening Wear",
  "moq": 50,
  "leadTime": "3-4 weeks",
  "tags": ["silk", "luxury", "premium"],
  "status": "active",
  "categoryData": {
    "fabricType": "Woven",
    "weavePattern": "Satin"
  },
  "pricing": {
    "basePrice": 45.0,
    "currency": "USD"
  },
  "seo": {
    "metaTitle": "Premium Silk Fabric - TEX-002",
    "metaDescription": "Luxurious silk fabric for evening wear"
  },
  "vendor": {
    "name": "Silk Masters Ltd",
    "country": "China",
    "contactPerson": "Li Wei"
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
      "_id": "674b123456789abc12345679",
      "sku": "TEX-002",
      "uniqueId": "silk-fabric-premium-fab-789456",
      "name": "Silk Fabric Premium",
      "category": "Fabrics",
      "description": "Luxurious silk fabric for high-end garments.",
      "images": {
        "main": "https://via.placeholder.com/400x300?text=Silk+Fabric+Premium",
        "gallery": []
      },
      "composition": "100% Silk",
      "color": "Ivory",
      "width": "140cm",
      "gsm": 80,
      "finish": "Satin",
      "application": "Evening Wear",
      "moq": 50,
      "leadTime": "3-4 weeks",
      "tags": ["silk", "luxury", "premium"],
      "specSheet": "",
      "status": "active",
      "categoryData": {
        "fabricType": "Woven",
        "weavePattern": "Satin"
      },
      "pricing": {
        "basePrice": 45.0,
        "currency": "USD"
      },
      "seo": {
        "metaTitle": "Premium Silk Fabric - TEX-002",
        "metaDescription": "Luxurious silk fabric for evening wear"
      },
      "vendor": {
        "name": "Silk Masters Ltd",
        "country": "China",
        "contactPerson": "Li Wei"
      },
      "createdBy": "674b987654321abc87654321",
      "updatedBy": "674b987654321abc87654321",
      "createdAt": "2024-11-16T12:30:00.000Z",
      "updatedAt": "2024-11-16T12:30:00.000Z"
    }
  }
}
```

### 3. Create Product with Images

```http
POST /api/dashboard/products/with-images
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Access:** Admin, Editor

**Description:** Create a new product with file uploads (images and spec sheet).

**Form Data:**

- `productData`: JSON string containing product information
- `mainImage`: Main product image file (optional)
- `galleryImages`: Array of gallery image files (optional)
- `specSheet`: PDF specification file (optional)

**Example Form Data:**

```
productData: {"sku":"TEX-003","name":"Cotton Blend Fabric","category":"Fabrics","description":"Durable cotton blend fabric","composition":"80% Cotton, 20% Polyester","color":"Navy Blue","width":"160cm","gsm":220,"finish":"Twill","application":"Workwear","moq":200,"leadTime":"2-3 weeks","tags":["cotton","blend","durable"],"status":"active"}
mainImage: [File: main-image.jpg]
galleryImages: [File: gallery1.jpg, File: gallery2.jpg]
specSheet: [File: specification.pdf]
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully with files.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345680",
      "sku": "TEX-003",
      "uniqueId": "cotton-blend-fabric-fab-456789",
      "name": "Cotton Blend Fabric",
      "category": "Fabrics",
      "description": "Durable cotton blend fabric",
      "images": {
        "main": "https://cdn.example.com/products/TEX-003/images/main_1637160000000.jpg",
        "gallery": [
          "https://cdn.example.com/products/TEX-003/images/gallery1_1637160000001.jpg",
          "https://cdn.example.com/products/TEX-003/images/gallery2_1637160000002.jpg"
        ]
      },
      "specSheet": "https://cdn.example.com/products/TEX-003/files/spec_TEX-003_1637160000003.pdf",
      "composition": "80% Cotton, 20% Polyester",
      "color": "Navy Blue",
      "width": "160cm",
      "gsm": 220,
      "finish": "Twill",
      "application": "Workwear",
      "moq": 200,
      "leadTime": "2-3 weeks",
      "tags": ["cotton", "blend", "durable"],
      "status": "active",
      "createdBy": "674b987654321abc87654321",
      "updatedBy": "674b987654321abc87654321",
      "createdAt": "2024-11-16T13:00:00.000Z",
      "updatedAt": "2024-11-16T13:00:00.000Z"
    },
    "uploadedFiles": {
      "mainImage": "https://cdn.example.com/products/TEX-003/images/main_1637160000000.jpg",
      "galleryImages": [
        "https://cdn.example.com/products/TEX-003/images/gallery1_1637160000001.jpg",
        "https://cdn.example.com/products/TEX-003/images/gallery2_1637160000002.jpg"
      ],
      "specSheet": "https://cdn.example.com/products/TEX-003/files/spec_TEX-003_1637160000003.pdf"
    }
  }
}
```

### 4. Get Product by ID

```http
GET /api/dashboard/products/:id
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product retrieved successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX-001",
      "uniqueId": "cotton-fabric-tex-123456",
      "name": "Premium Cotton Fabric",
      "category": "Fabrics",
      "description": "High-quality 100% cotton fabric perfect for garments.",
      "images": {
        "main": "https://cdn.example.com/products/tex-001/main.jpg",
        "gallery": ["https://cdn.example.com/products/tex-001/gallery1.jpg"]
      },
      "composition": "100% Cotton",
      "color": "Natural White",
      "width": "150cm",
      "gsm": 200,
      "finish": "Plain",
      "application": "Garments",
      "moq": 100,
      "leadTime": "2-3 weeks",
      "tags": ["cotton", "natural", "premium"],
      "specSheet": "https://cdn.example.com/products/tex-001/spec.pdf",
      "status": "active",
      "categoryData": {},
      "pricing": {
        "basePrice": 12.5,
        "currency": "USD"
      },
      "seo": {},
      "vendor": {},
      "createdBy": "674b987654321abc87654321",
      "updatedBy": "674b987654321abc87654321",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-16T11:45:00.000Z"
    }
  }
}
```

### 5. Update Product (Simple)

```http
PUT /api/dashboard/products/:id
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Access:** Admin, Editor

**Description:** Update product with FormData (supports both text fields and file uploads).

**Form Data Fields:**

- All product fields as individual form fields
- `mainImage`: New main image file (optional)
- `galleryImages`: New gallery images (optional)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX-001-UPDATED",
      "name": "Premium Cotton Fabric - Updated",
      "category": "Fabrics",
      "description": "Updated description for high-quality cotton fabric.",
      "images": {
        "main": "https://cdn.example.com/products/tex-001/main-updated.jpg",
        "gallery": ["https://cdn.example.com/products/tex-001/gallery1.jpg"]
      },
      "updatedBy": "674b987654321abc87654321",
      "updatedAt": "2024-11-16T14:30:00.000Z"
    }
  }
}
```

### 6. Update Product with Images

```http
PUT /api/dashboard/products/:id/images
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Access:** Admin, Editor

**Description:** Update product using productData JSON and images using FormData. Images are added to existing images (not replaced).

**Form Data:**

- `productData`: JSON string containing product information
- `mainImage`: New main image file (optional)
- `galleryImages`: New gallery image files (optional, added to existing)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully with images.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX-001",
      "name": "Premium Cotton Fabric",
      "images": {
        "main": "https://cdn.example.com/products/tex-001/main-new.jpg",
        "gallery": [
          "https://cdn.example.com/products/tex-001/gallery1.jpg",
          "https://cdn.example.com/products/tex-001/gallery-new1.jpg",
          "https://cdn.example.com/products/tex-001/gallery-new2.jpg"
        ]
      },
      "updatedBy": "674b987654321abc87654321",
      "updatedAt": "2024-11-16T15:00:00.000Z"
    }
  }
}
```

### 7. Delete Product (Soft Delete)

```http
DELETE /api/dashboard/products/:id
Authorization: Bearer <jwt-token>
```

**Access:** Admin, Editor

**Description:** Soft delete a product (changes status to 'discontinued').

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully.",
  "data": {
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "TEX-001",
      "name": "Premium Cotton Fabric",
      "status": "discontinued"
    }
  }
}
```

### 8. Bulk Update Products

```http
PUT /api/dashboard/products/bulk-update
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "productIds": ["674b123456789abc12345678", "674b123456789abc12345679"],
  "updateData": {
    "status": "inactive",
    "tags": ["updated", "bulk"]
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 products updated successfully.",
  "data": {
    "matched": 2,
    "modified": 2
  }
}
```

### 9. Get Product Statistics

```http
GET /api/dashboard/products/stats
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

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
      { "_id": "Fabrics", "count": 80 },
      { "_id": "Home Textiles", "count": 40 },
      { "_id": "Technical Textiles", "count": 30 }
    ],
    "recent": [
      {
        "_id": "674b123456789abc12345678",
        "name": "Premium Cotton Fabric",
        "sku": "TEX-001",
        "status": "active",
        "createdAt": "2024-11-16T10:30:00.000Z"
      }
    ]
  }
}
```

---

## File Upload Specifications

### Image Files

- **Formats**: JPEG, PNG, WebP
- **Max Size**: 5MB per file
- **Max Files**: 10 gallery images per product
- **Storage**: Cloudflare R2 with CDN

### Specification Files

- **Formats**: PDF
- **Max Size**: 10MB
- **Storage**: Cloudflare R2

---

## Error Responses

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": ["SKU is required.", "Name must be at least 3 characters long."]
}
```

### 400 - Duplicate SKU

```json
{
  "success": false,
  "message": "A product with this SKU already exists."
}
```

### 400 - File Upload Error

```json
{
  "success": false,
  "message": "Main image validation failed: File too large"
}
```

### 404 - Product Not Found

```json
{
  "success": false,
  "message": "Product not found."
}
```

### 403 - Insufficient Permissions

```json
{
  "success": false,
  "message": "Access denied. Editor role required."
}
```

---

## Example Usage

### JavaScript/Node.js

```javascript
// Create product with images
const formData = new FormData();
formData.append(
  'productData',
  JSON.stringify({
    sku: 'TEX-004',
    name: 'New Fabric',
    category: 'Fabrics',
  }),
);
formData.append('mainImage', imageFile);

const response = await fetch('/api/dashboard/products/with-images', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### cURL

```bash
# Get all products
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/dashboard/products?page=1&limit=20"

# Create product with images
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "productData={\"sku\":\"TEX-005\",\"name\":\"Test Fabric\"}" \
  -F "mainImage=@main-image.jpg" \
  "https://api.example.com/api/dashboard/products/with-images"
```

---

## Security & Performance

1. **Authentication**: JWT token required for all endpoints
2. **Authorization**: Role-based access control
3. **File Validation**: Strict file type and size limits
4. **Input Sanitization**: All inputs validated and sanitized
5. **Rate Limiting**: Applied to prevent abuse
6. **Caching**: Redis caching for frequently accessed data
7. **CDN**: Images served through CDN for performance
