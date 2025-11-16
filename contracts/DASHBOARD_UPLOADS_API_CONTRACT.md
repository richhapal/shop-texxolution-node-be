# Dashboard File Upload API Contract

## Overview

This document outlines the file upload and management API endpoints for the Shop Texxolution dashboard. These endpoints handle image uploads, document management, and file organization.

**Base URL:** `https://your-domain.com/api/dashboard/uploads`

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles & Permissions

- **admin**: Full access to all file operations
- **editor**: Upload, update, delete own files
- **viewer**: Read-only access to files

---

## File Upload Endpoints

### 1. Upload Product Images

```http
POST /api/dashboard/uploads/products
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Access:** Admin, Editor

**Request Body (multipart/form-data):**

- `mainImage` (file): Main product image (required)
- `galleryImages` (files): Additional product images (optional, max 10)
- `productId` (string): Product ID for image association
- `category` (string): Image category (main, gallery, technical, lifestyle)

**File Specifications:**

- **Formats**: JPG, JPEG, PNG, WebP
- **Max Size**: 10MB per image
- **Max Dimensions**: 4096x4096 pixels
- **Min Dimensions**: 300x300 pixels

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product images uploaded successfully.",
  "data": {
    "productId": "674b987654321abc87654321",
    "uploadedImages": [
      {
        "type": "main",
        "originalName": "cotton-fabric-main.jpg",
        "filename": "prod_674b987654321abc87654321_main_20241118.jpg",
        "url": "https://cdn.example.com/products/prod_674b987654321abc87654321_main_20241118.jpg",
        "size": 245760,
        "dimensions": {
          "width": 1200,
          "height": 1200
        },
        "uploadedAt": "2024-11-18T10:30:00.000Z"
      },
      {
        "type": "gallery",
        "originalName": "cotton-fabric-detail-1.jpg",
        "filename": "prod_674b987654321abc87654321_gal_1_20241118.jpg",
        "url": "https://cdn.example.com/products/prod_674b987654321abc87654321_gal_1_20241118.jpg",
        "size": 198432,
        "dimensions": {
          "width": 800,
          "height": 800
        },
        "uploadedAt": "2024-11-18T10:30:01.000Z"
      }
    ],
    "processing": {
      "thumbnails": "generating",
      "optimization": "in_progress",
      "estimatedTime": "2 minutes"
    }
  }
}
```

### 2. Upload Documents

```http
POST /api/dashboard/uploads/documents
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Access:** Admin, Editor

**Request Body (multipart/form-data):**

- `document` (file): Document file (required)
- `category` (string): Document category (specification, certificate, manual, brochure)
- `title` (string): Document title
- `description` (string): Document description
- `tags` (string): Comma-separated tags
- `productId` (string): Associated product ID (optional)
- `enquiryId` (string): Associated enquiry ID (optional)

**File Specifications:**

- **Formats**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Max Size**: 50MB per document

**Success Response (200):**

```json
{
  "success": true,
  "message": "Document uploaded successfully.",
  "data": {
    "document": {
      "_id": "674b111222333abc44455566",
      "originalName": "fabric-specifications.pdf",
      "filename": "doc_674b111222333abc44455566_20241118.pdf",
      "title": "Premium Cotton Fabric Specifications",
      "description": "Detailed technical specifications and quality standards",
      "category": "specification",
      "tags": ["cotton", "specifications", "quality", "technical"],
      "url": "https://cdn.example.com/documents/doc_674b111222333abc44455566_20241118.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "productId": "674b987654321abc87654321",
      "uploadedBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "uploadedAt": "2024-11-18T11:00:00.000Z",
      "status": "active"
    }
  }
}
```

### 3. Upload Quotation Attachments

```http
POST /api/dashboard/uploads/quotations/:quotationId
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Access:** Admin, Editor

**Request Body (multipart/form-data):**

- `attachments` (files): Files to attach (max 5)
- `category` (string): Attachment category (terms, specifications, samples, certificates)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation attachments uploaded successfully.",
  "data": {
    "quotationId": "674b777888999abc00011122",
    "attachments": [
      {
        "_id": "674b222333444abc55566677",
        "originalName": "terms-and-conditions.pdf",
        "filename": "quo_674b777888999abc00011122_terms_20241118.pdf",
        "category": "terms",
        "url": "https://cdn.example.com/quotations/quo_674b777888999abc00011122_terms_20241118.pdf",
        "size": 524288,
        "uploadedAt": "2024-11-18T12:00:00.000Z"
      }
    ]
  }
}
```

---

## File Management Endpoints

### 4. Get Files List

```http
GET /api/dashboard/uploads
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**

- `type` (optional): File type filter (images, documents, all)
- `category` (optional): Category filter
- `productId` (optional): Filter by product
- `enquiryId` (optional): Filter by enquiry
- `quotationId` (optional): Filter by quotation
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search in filename or title
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `uploadedBy` (optional): Filter by uploader

**Success Response (200):**

```json
{
  "success": true,
  "message": "Files retrieved successfully.",
  "data": {
    "files": [
      {
        "_id": "674b111222333abc44455566",
        "type": "document",
        "originalName": "fabric-specifications.pdf",
        "filename": "doc_674b111222333abc44455566_20241118.pdf",
        "title": "Premium Cotton Fabric Specifications",
        "category": "specification",
        "url": "https://cdn.example.com/documents/doc_674b111222333abc44455566_20241118.pdf",
        "thumbnailUrl": "https://cdn.example.com/thumbnails/doc_674b111222333abc44455566_thumb.jpg",
        "size": 1048576,
        "mimeType": "application/pdf",
        "productId": "674b987654321abc87654321",
        "uploadedBy": {
          "_id": "674b555666777abc88899900",
          "name": "Sales Manager"
        },
        "uploadedAt": "2024-11-18T11:00:00.000Z",
        "downloads": 5,
        "lastDownloadAt": "2024-11-18T14:30:00.000Z",
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFiles": 95,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "summary": {
      "totalFiles": 95,
      "totalSize": 104857600,
      "byType": {
        "images": 65,
        "documents": 30
      },
      "byCategory": {
        "product_images": 45,
        "specifications": 15,
        "certificates": 10
      }
    }
  }
}
```

### 5. Get File Details

```http
GET /api/dashboard/uploads/:fileId
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Success Response (200):**

```json
{
  "success": true,
  "message": "File details retrieved successfully.",
  "data": {
    "file": {
      "_id": "674b111222333abc44455566",
      "type": "document",
      "originalName": "fabric-specifications.pdf",
      "filename": "doc_674b111222333abc44455566_20241118.pdf",
      "title": "Premium Cotton Fabric Specifications",
      "description": "Detailed technical specifications and quality standards",
      "category": "specification",
      "tags": ["cotton", "specifications", "quality", "technical"],
      "url": "https://cdn.example.com/documents/doc_674b111222333abc44455566_20241118.pdf",
      "downloadUrl": "https://api.example.com/api/dashboard/uploads/674b111222333abc44455566/download",
      "size": 1048576,
      "mimeType": "application/pdf",
      "dimensions": null,
      "metadata": {
        "pages": 15,
        "author": "Texxolution Team",
        "createdDate": "2024-11-15T00:00:00.000Z"
      },
      "associations": {
        "productId": "674b987654321abc87654321",
        "product": {
          "name": "Premium Cotton Fabric",
          "sku": "TEX-001"
        }
      },
      "uploadedBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "uploadedAt": "2024-11-18T11:00:00.000Z",
      "updatedAt": "2024-11-18T11:00:00.000Z",
      "analytics": {
        "downloads": 5,
        "views": 12,
        "lastDownloadAt": "2024-11-18T14:30:00.000Z",
        "lastViewAt": "2024-11-18T15:00:00.000Z"
      },
      "status": "active"
    }
  }
}
```

### 6. Update File Information

```http
PUT /api/dashboard/uploads/:fileId
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor (own files)

**Request Body:**

```json
{
  "title": "Updated Premium Cotton Fabric Specifications",
  "description": "Updated technical specifications with new quality standards",
  "category": "specification",
  "tags": ["cotton", "specifications", "quality", "technical", "updated"],
  "productId": "674b987654321abc87654321"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "File information updated successfully.",
  "data": {
    "file": {
      "_id": "674b111222333abc44455566",
      "title": "Updated Premium Cotton Fabric Specifications",
      "description": "Updated technical specifications with new quality standards",
      "tags": ["cotton", "specifications", "quality", "technical", "updated"],
      "updatedAt": "2024-11-18T16:00:00.000Z"
    }
  }
}
```

### 7. Download File

```http
GET /api/dashboard/uploads/:fileId/download
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**

- `inline` (optional): Display inline instead of download (default: false)

**Success Response (200):**

- Returns the actual file with appropriate headers
- Content-Type: Based on file type
- Content-Disposition: attachment or inline

### 8. Delete File

```http
DELETE /api/dashboard/uploads/:fileId
Authorization: Bearer <jwt-token>
```

**Access:** Admin, Editor (own files)

**Success Response (200):**

```json
{
  "success": true,
  "message": "File deleted successfully.",
  "data": {
    "fileId": "674b111222333abc44455566",
    "deletedAt": "2024-11-18T17:00:00.000Z"
  }
}
```

### 9. Bulk File Operations

```http
POST /api/dashboard/uploads/bulk
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "action": "delete",
  "fileIds": [
    "674b111222333abc44455566",
    "674b111222333abc44455567",
    "674b111222333abc44455568"
  ],
  "reason": "Outdated specifications"
}
```

**Available Actions:**

- `delete`: Delete multiple files
- `update_category`: Update category for multiple files
- `add_tags`: Add tags to multiple files
- `remove_tags`: Remove tags from multiple files

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bulk operation completed successfully.",
  "data": {
    "action": "delete",
    "processedFiles": 3,
    "results": [
      {
        "fileId": "674b111222333abc44455566",
        "status": "success"
      },
      {
        "fileId": "674b111222333abc44455567",
        "status": "success"
      },
      {
        "fileId": "674b111222333abc44455568",
        "status": "error",
        "error": "File not found"
      }
    ],
    "summary": {
      "successful": 2,
      "failed": 1
    }
  }
}
```

---

## File Processing & Optimization

### 10. Get Processing Status

```http
GET /api/dashboard/uploads/:fileId/processing
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Processing status retrieved successfully.",
  "data": {
    "fileId": "674b111222333abc44455566",
    "processing": {
      "status": "completed",
      "startedAt": "2024-11-18T10:30:00.000Z",
      "completedAt": "2024-11-18T10:32:15.000Z",
      "steps": [
        {
          "step": "upload",
          "status": "completed",
          "completedAt": "2024-11-18T10:30:30.000Z"
        },
        {
          "step": "virus_scan",
          "status": "completed",
          "completedAt": "2024-11-18T10:31:00.000Z"
        },
        {
          "step": "thumbnail_generation",
          "status": "completed",
          "completedAt": "2024-11-18T10:31:45.000Z"
        },
        {
          "step": "optimization",
          "status": "completed",
          "completedAt": "2024-11-18T10:32:15.000Z"
        }
      ],
      "optimizations": {
        "originalSize": 1048576,
        "optimizedSize": 654321,
        "compressionRatio": 37.6,
        "thumbnailGenerated": true,
        "webpGenerated": true
      }
    }
  }
}
```

---

## Storage Analytics

### 11. Get Storage Statistics

```http
GET /api/dashboard/uploads/stats
Authorization: Bearer <jwt-token>
```

**Access:** Admin

**Success Response (200):**

```json
{
  "success": true,
  "message": "Storage statistics retrieved successfully.",
  "data": {
    "overview": {
      "totalFiles": 1250,
      "totalSize": 5368709120,
      "averageFileSize": 4294967,
      "storageUsed": "5.0 GB",
      "storageLimit": "100 GB",
      "usagePercentage": 5.0
    },
    "byType": [
      {
        "type": "images",
        "count": 850,
        "size": 3221225472,
        "percentage": 60.0
      },
      {
        "type": "documents",
        "count": 400,
        "size": 2147483648,
        "percentage": 40.0
      }
    ],
    "byCategory": [
      {
        "category": "product_images",
        "count": 650,
        "size": 2684354560
      },
      {
        "category": "specifications",
        "count": 200,
        "size": 1073741824
      }
    ],
    "recentUploads": [
      {
        "date": "2024-11-18",
        "count": 15,
        "size": 52428800
      }
    ],
    "largestFiles": [
      {
        "filename": "product_catalog_2024.pdf",
        "size": 52428800,
        "uploadedAt": "2024-11-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Error Responses

### 400 - File Validation Error

```json
{
  "success": false,
  "message": "File validation failed.",
  "errors": [
    "File size exceeds maximum limit of 10MB",
    "Invalid file format. Only JPG, PNG, WebP allowed"
  ]
}
```

### 413 - File Too Large

```json
{
  "success": false,
  "message": "File size exceeds maximum allowed limit.",
  "maxSize": "10MB",
  "receivedSize": "15MB"
}
```

### 415 - Unsupported Media Type

```json
{
  "success": false,
  "message": "Unsupported file type.",
  "supportedTypes": ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]
}
```

---

## File Processing Pipeline

1. **Upload**: File received and temporarily stored
2. **Validation**: File type, size, and format validation
3. **Virus Scan**: Security scanning for malicious content
4. **Processing**: Image optimization, thumbnail generation
5. **Storage**: Move to permanent storage (Cloudflare R2)
6. **Cleanup**: Remove temporary files
7. **Notification**: Update file status and notify user

---

## Business Rules

1. **File Limits**: Max 10 images per product, 5 attachments per quotation
2. **Storage Quota**: 100GB total storage per organization
3. **Retention**: Files retained for 5 years, then archived
4. **Access Control**: File access based on user permissions
5. **Optimization**: Images automatically optimized and thumbnails generated
6. **Security**: All uploads scanned for malicious content
