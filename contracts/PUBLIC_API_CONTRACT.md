# Public API Contract

## Overview

This document outlines the public-facing API endpoints for the Shop Texxolution platform. These endpoints are accessible without authentication and are designed for public consumption.

**Base URL:** `https://your-domain.com/api/public`

## Units and Category Rules (NEW)

All product items in public enquiries must include a mandatory `unit` field. Units are restricted by product category. Allowed units mapping:

- Yarn: ["kg", "cones"]
- Garments: ["pcs", "dz"]
- Denim: ["m", "yards", "rolls"]
- Greige Fabric: ["m", "yards", "rolls", "kg"]
- Finished Fabrics: ["m", "yards", "rolls"]
- Fabric (Finished): ["m", "yards", "rolls"]
- Fibre: ["kg", "bales", "tons"]
- Textile Farming: ["kg", "quintal", "bales", "tons"]
- Home Decoration: ["pcs", "sets", "m"]
- Trims & Accessories: ["pcs", "m", "rolls", "sets"]
- Packing: ["pcs", "kg", "sets"]
- Dyes & Chemicals: ["kg", "liters", "tons", "drums"]
- Machineries & Equipment: ["pcs", "units", "sets"]

If the `unit` is missing or invalid for the product category, the API returns HTTP 400 with:

```json
{
  "success": false,
  "message": "Invalid unit for category <category>. Allowed units: <units[]>"
}
```


## Authentication

Public endpoints do not require authentication, but some may have rate limiting applied.

---

## Endpoints

### 1. Get All Products (Public)

```http
GET /api/public/products
```

**Description:** Retrieve all active products with basic information for public display.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)
- `category` (optional): Filter by category
- `search` (optional): Search by product name or description
- `sort` (optional): Sort field (name, createdAt, -name, -createdAt)

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
        "pricing": {
          "basePrice": 12.5,
          "currency": "USD",
          "unit": "meter"
        },
        "status": "active",
        "createdAt": "2024-11-16T10:30:00.000Z"
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

### 2. Get Product by ID (Public)

```http
GET /api/public/products/:id
```

**Description:** Retrieve detailed information about a specific product.

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
        "gallery": [
          "https://cdn.example.com/products/tex-001/gallery1.jpg",
          "https://cdn.example.com/products/tex-001/gallery2.jpg"
        ]
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
      "pricing": {
        "basePrice": 12.5,
        "currency": "USD",
        "unit": "meter"
      },
      "categoryData": {
        "fabricType": "Woven",
        "weavePattern": "Plain",
        "threadCount": "150x100"
      },
      "vendor": {
        "name": "Premium Textiles Ltd",
        "country": "India"
      },
      "specSheet": "https://cdn.example.com/products/tex-001/spec.pdf",
      "status": "active",
      "createdAt": "2024-11-16T10:30:00.000Z"
    }
  }
}
```

### 3. Get Product Categories (Public)

```http
GET /api/public/categories
```

**Description:** Retrieve all available product categories.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Categories retrieved successfully.",
  "data": {
    "categories": [
      {
        "name": "Fabrics",
        "count": 45,
        "subcategories": ["Cotton", "Silk", "Wool", "Synthetic"]
      },
      {
        "name": "Home Textiles",
        "count": 23,
        "subcategories": ["Bedding", "Curtains", "Upholstery"]
      },
      {
        "name": "Technical Textiles",
        "count": 12,
        "subcategories": ["Medical", "Automotive", "Industrial"]
      }
    ],
    "totalCategories": 3,
    "totalProducts": 80
  }
}
```

### 4. Submit Enquiry (Public)

```http
POST /api/public/enquiries
Content-Type: application/json
```

**Description:** Submit a product enquiry from public users.

**Request Body:**

```json
{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "ABC Garments Ltd",
  "message": "I'm interested in bulk purchasing this fabric.",
  "products": [
    {
      "productId": "674b123456789abc12345678",
      "quantity": 500,
      "unit": "m",
      "notes": "Optional notes about product"
    }
  ],
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
      "_id": "674b987654321abc87654321",
      "enquiryId": "ENQ-2024-001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "ABC Garments Ltd",
      "product": {
        "_id": "674b123456789abc12345678",
        "name": "Premium Cotton Fabric",
        "sku": "TEX-001"
      },
      "message": "I'm interested in bulk purchasing this fabric.",
      "products": [
        {
          "_id": "674b123456789abc12345678",
          "name": "Premium Cotton Fabric",
          "sku": "TEX-001",
          "quantity": 500,
          "unit": "m"
        }
      ],
      "urgency": "medium",
      "status": "new",
      "submittedAt": "2024-11-16T10:30:00.000Z"
    }
  }
}
```

### 5. Get Company Information (Public)

```http
GET /api/public/company
```

**Description:** Retrieve basic company information.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Company information retrieved successfully.",
  "data": {
    "company": {
      "name": "Texxolution",
      "tagline": "Premium Textile Solutions",
      "description": "Leading provider of high-quality textiles and fabrics for global markets.",
      "contact": {
        "email": "info@texxolution.com",
        "phone": "+1-555-0123",
        "address": {
          "street": "123 Textile Street",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "zipCode": "10001"
        }
      },
      "social": {
        "website": "https://texxolution.com",
        "linkedin": "https://linkedin.com/company/texxolution",
        "facebook": "https://facebook.com/texxolution"
      },
      "certifications": [
        "ISO 9001:2015",
        "OEKO-TEX Standard 100",
        "GOTS Certified"
      ],
      "established": "2010"
    }
  }
}
```

---

## Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Invalid request parameters.",
  "errors": ["Product ID is required."]
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Product not found."
}
```

### 429 - Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 300
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

- **General endpoints**: 100 requests per minute per IP
- **Enquiry submission**: 5 requests per hour per IP
- **Search endpoints**: 60 requests per minute per IP

---

## Example Usage

### JavaScript/Node.js

```javascript
// Get all products
const response = await fetch(
  '/api/public/products?page=1&limit=20&category=Fabrics',
);
const result = await response.json();

// Submit enquiry
const enquiryResponse = await fetch('/api/public/enquiries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    productId: '674b123456789abc12345678',
    message: 'Interested in bulk purchase',
  }),
});
```

### cURL

```bash
# Get products
curl "https://api.example.com/api/public/products?page=1&limit=10"

# Submit enquiry
curl -X POST https://api.example.com/api/public/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "productId": "674b123456789abc12345678",
    "message": "Interested in bulk purchase"
  }'
```

---

## Security Notes

1. **Input Validation**: All inputs are validated and sanitized
2. **Rate Limiting**: Applied to prevent abuse
3. **CORS**: Configured for cross-origin requests
4. **Data Sanitization**: Personal information is filtered in responses
5. **SSL/HTTPS**: All endpoints must be accessed over HTTPS in production
