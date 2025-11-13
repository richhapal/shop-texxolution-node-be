# Shop Texxolution Backend - File Upload API Documentation

## Overview

This document describes the file upload functionality for the Shop Texxolution backend, which uses Cloudflare R2 (S3-compatible) for storage.

## Authentication

All upload endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Product Images

**Endpoint:** `POST /api/dashboard/uploads/products/:productId/images`

**Description:** Upload multiple images for a product (main image or gallery images)

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Form Data:**

- `images` (required): Array of image files (max 10 files, max 10MB each)
- `imageType` (optional): "main" or "gallery" (default: "gallery")

**Supported Image Types:**

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

**Request Example:**

```javascript
const formData = new FormData();
formData.append("images", imageFile1);
formData.append("images", imageFile2);
formData.append("imageType", "gallery");

fetch("/api/dashboard/uploads/products/674b123456789abc12345678/images", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
  body: formData,
});
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 image(s) uploaded successfully.",
  "data": {
    "uploadedImages": [
      "https://your-r2-domain.com/products/SKU123/images/image_1703123456000_0.jpg",
      "https://your-r2-domain.com/products/SKU123/images/image_1703123456001_1.jpg"
    ],
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "SKU123",
      "name": "Product Name",
      "images": {
        "main": "https://your-r2-domain.com/products/SKU123/images/main_image.jpg",
        "gallery": [
          "https://your-r2-domain.com/products/SKU123/images/image_1703123456000_0.jpg",
          "https://your-r2-domain.com/products/SKU123/images/image_1703123456001_1.jpg"
        ]
      }
    }
  }
}
```

**Error Responses:**

- `400`: File validation failed, invalid product ID
- `404`: Product not found
- `500`: Server error during upload

---

### 2. Delete Product Image

**Endpoint:** `DELETE /api/dashboard/uploads/products/:productId/images/:imageUrl`

**Description:** Delete a specific product image from R2 and update the product

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**URL Parameters:**

- `productId`: Product MongoDB ObjectId
- `imageUrl`: URL-encoded image URL to delete

**Request Example:**

```javascript
const imageUrl = encodeURIComponent(
  "https://your-r2-domain.com/products/SKU123/images/image_123.jpg"
);

fetch(
  `/api/dashboard/uploads/products/674b123456789abc12345678/images/${imageUrl}`,
  {
    method: "DELETE",
    headers: {
      Authorization: "Bearer your-jwt-token",
    },
  }
);
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Image deleted successfully.",
  "data": {
    "deletedImageUrl": "https://your-r2-domain.com/products/SKU123/images/image_123.jpg",
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "SKU123",
      "name": "Product Name",
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

**Endpoint:** `POST /api/dashboard/uploads/products/:productId/files`

**Description:** Upload files like spec sheets, documentation, etc.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Form Data:**

- `file` (required): Single file (max 10MB)
- `fileType` (optional): "spec" (default: "spec")

**Supported File Types:**

- PDF (.pdf)
- Microsoft Word (.doc, .docx)

**Request Example:**

```javascript
const formData = new FormData();
formData.append("file", specSheetFile);
formData.append("fileType", "spec");

fetch("/api/dashboard/uploads/products/674b123456789abc12345678/files", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
  body: formData,
});
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "spec file uploaded successfully.",
  "data": {
    "fileUrl": "https://your-r2-domain.com/products/SKU123/files/spec_SKU123_1703123456000.pdf",
    "fileName": "products/SKU123/files/spec_SKU123_1703123456000.pdf",
    "product": {
      "_id": "674b123456789abc12345678",
      "sku": "SKU123",
      "name": "Product Name",
      "specSheet": "https://your-r2-domain.com/products/SKU123/files/spec_SKU123_1703123456000.pdf"
    }
  }
}
```

---

## File Organization in R2

Files are organized in the following structure:

```
bucket/
├── products/
│   └── {product-sku}/
│       ├── images/
│       │   ├── image_{timestamp}_{index}.{ext}
│       │   └── main_{timestamp}.{ext}
│       └── files/
│           └── spec_{sku}_{timestamp}.{ext}
└── quotations/
    └── quotation_{id}_{timestamp}.pdf
```

## Error Codes

| Code | Description                                                       |
| ---- | ----------------------------------------------------------------- |
| 400  | Bad Request - Invalid file type, size, or missing required fields |
| 401  | Unauthorized - Invalid or missing JWT token                       |
| 403  | Forbidden - Insufficient permissions                              |
| 404  | Not Found - Product not found                                     |
| 413  | Payload Too Large - File size exceeds limit                       |
| 500  | Internal Server Error - Server-side processing error              |

## Rate Limiting

File upload endpoints are subject to the following limits:

- Max file size: 10MB per file
- Max files per request: 10 (for image uploads)
- Supported concurrent uploads: Based on server capacity

## Security Features

1. **File Type Validation**: Only specific MIME types are allowed
2. **File Size Limits**: Maximum file size enforced
3. **Authentication Required**: All endpoints require valid JWT
4. **Automatic Cleanup**: Temporary files are automatically removed
5. **Metadata Tracking**: Files include metadata for tracking and organization

## Environment Variables Required

```env
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=your-r2-domain.com
```

## Usage Examples

### Frontend React Example

```javascript
// Upload multiple images
const uploadImages = async (productId, imageFiles, imageType = "gallery") => {
  const formData = new FormData();

  imageFiles.forEach((file) => {
    formData.append("images", file);
  });
  formData.append("imageType", imageType);

  try {
    const response = await fetch(
      `/api/dashboard/uploads/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Images uploaded:", result.data.uploadedImages);
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

// Upload spec sheet
const uploadSpecSheet = async (productId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileType", "spec");

  try {
    const response = await fetch(
      `/api/dashboard/uploads/products/${productId}/files`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Spec sheet uploaded:", result.data.fileUrl);
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### cURL Examples

```bash
# Upload images
curl -X POST \
  'http://localhost:3000/api/dashboard/uploads/products/674b123456789abc12345678/images' \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'images=@image1.jpg' \
  -F 'images=@image2.jpg' \
  -F 'imageType=gallery'

# Upload spec sheet
curl -X POST \
  'http://localhost:3000/api/dashboard/uploads/products/674b123456789abc12345678/files' \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@spec-sheet.pdf' \
  -F 'fileType=spec'

# Delete image
curl -X DELETE \
  'http://localhost:3000/api/dashboard/uploads/products/674b123456789abc12345678/images/https%3A%2F%2Fyour-domain.com%2Fimage.jpg' \
  -H 'Authorization: Bearer your-jwt-token'
```
