# Dashboard Quotation API Contract

## Overview

This document outlines the quotation management API endpoints for the Shop Texxolution dashboard. These endpoints handle quotation creation, management, and tracking functionality.

**Base URL:** `https://your-domain.com/api/dashboard/quotations`

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles & Permissions

- **admin**: Full CRUD access to all quotations
- **editor**: Create, read, update quotations
- **viewer**: Read-only access to quotations

---

## Endpoints

### 1. Get All Quotations

```http
GET /api/dashboard/quotations
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (default: -createdAt)
- `status` (optional): Filter by status (draft, sent, accepted, rejected, expired)
- `search` (optional): Search by quotation ID, customer name, or company
- `enquiryId` (optional): **NEW** - Filter quotations by specific enquiry ID
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `createdBy` (optional): Filter by creator user ID
- `expiringIn` (optional): Filter quotations expiring within X days
- `minAmount` (optional): Minimum total amount
- `maxAmount` (optional): Maximum total amount

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotations retrieved successfully.",
  "data": {
    "quotations": [
      {
        "_id": "674b777888999abc00011122",
        "quotationId": "QUO-2024-001",
        "enquiry": {
          "_id": "674b123456789abc12345678",
          "enquiryId": "ENQ-2024-001",
          "name": "John Doe",
          "company": "ABC Garments Ltd",
          "email": "john@example.com"
        },
        "customer": {
          "name": "John Doe",
          "company": "ABC Garments Ltd",
          "email": "john@example.com",
          "phone": "+1234567890",
          "address": {
            "street": "123 Fashion Street",
            "city": "New York",
            "country": "USA",
            "zipCode": "10001"
          }
        },
        "items": [
          {
            "_id": "674b555444333abc22211100",
            "product": {
              "_id": "674b987654321abc87654321",
              "name": "Premium Cotton Fabric",
              "sku": "TEX-001"
            },
            "description": "Premium Cotton Fabric - Navy Blue",
            "quantity": 500,
            "unit": "meters",
            "unitPrice": 12.5,
            "discount": 5,
            "totalPrice": 5937.5
          }
        ],
        "subtotal": 6250.0,
        "discountAmount": 312.5,
        "taxAmount": 0.0,
        "totalAmount": 5937.5,
        "currency": "USD",
        "status": "sent",
        "validUntil": "2024-12-16T23:59:59.000Z",
        "terms": {
          "paymentTerms": "Net 30 days",
          "deliveryTerms": "FOB Factory",
          "leadTime": "3-4 weeks",
          "warranty": "6 months"
        },
        "notes": "Custom colors available upon request. Minimum order quantity applies.",
        "createdBy": {
          "_id": "674b555666777abc88899900",
          "name": "Sales Manager",
          "email": "sales@texxolution.com"
        },
        "sentAt": "2024-11-17T09:00:00.000Z",
        "createdAt": "2024-11-17T08:30:00.000Z",
        "updatedAt": "2024-11-17T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalQuotations": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "summary": {
      "total": 50,
      "byStatus": {
        "draft": 10,
        "sent": 25,
        "accepted": 8,
        "rejected": 5,
        "expired": 2
      },
      "totalValue": 125000.0,
      "averageValue": 2500.0,
      "currency": "USD"
    }
  }
}
```

### 2. Create Quotation

```http
POST /api/dashboard/quotations
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**NEW BEHAVIOR:**

- Automatically updates linked enquiry status to "quoted"
- Logs "quotation_created" activity in enquiry.activities array
- Generates auto-incremented quotation number

**Request Body:**

```json
{
  "enquiryId": "674b123456789abc12345678",
  "customer": {
    "name": "John Doe",
    "company": "ABC Garments Ltd",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Fashion Street",
      "city": "New York",
      "country": "USA",
      "zipCode": "10001"
    }
  },
  "items": [
    {
      "productId": "674b987654321abc87654321",
      "description": "Premium Cotton Fabric - Navy Blue",
      "quantity": 500,
      "unit": "meters",
      "unitPrice": 12.5,
      "discount": 5
    },
    {
      "productId": "674b987654321abc87654322",
      "description": "Premium Cotton Fabric - Forest Green",
      "quantity": 300,
      "unit": "meters",
      "unitPrice": 12.5,
      "discount": 5
    }
  ],
  "taxRate": 0,
  "currency": "USD",
  "validUntil": "2024-12-16T23:59:59.000Z",
  "terms": {
    "paymentTerms": "Net 30 days",
    "deliveryTerms": "FOB Factory",
    "leadTime": "3-4 weeks",
    "warranty": "6 months"
  },
  "notes": "Custom colors available upon request. Minimum order quantity applies.",
  "status": "draft"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Quotation created successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011123",
      "quotationId": "QUO-2024-002",
      "enquiry": {
        "_id": "674b123456789abc12345678",
        "enquiryId": "ENQ-2024-001"
      },
      "customer": {
        "name": "John Doe",
        "company": "ABC Garments Ltd",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": {
          "street": "123 Fashion Street",
          "city": "New York",
          "country": "USA",
          "zipCode": "10001"
        }
      },
      "items": [
        {
          "_id": "674b555444333abc22211101",
          "product": {
            "_id": "674b987654321abc87654321",
            "name": "Premium Cotton Fabric",
            "sku": "TEX-001"
          },
          "description": "Premium Cotton Fabric - Navy Blue",
          "quantity": 500,
          "unit": "meters",
          "unitPrice": 12.5,
          "discount": 5,
          "totalPrice": 5937.5
        },
        {
          "_id": "674b555444333abc22211102",
          "product": {
            "_id": "674b987654321abc87654322",
            "name": "Premium Cotton Fabric",
            "sku": "TEX-001"
          },
          "description": "Premium Cotton Fabric - Forest Green",
          "quantity": 300,
          "unit": "meters",
          "unitPrice": 12.5,
          "discount": 5,
          "totalPrice": 3562.5
        }
      ],
      "subtotal": 10000.0,
      "discountAmount": 500.0,
      "taxAmount": 0.0,
      "totalAmount": 9500.0,
      "currency": "USD",
      "status": "draft",
      "validUntil": "2024-12-16T23:59:59.000Z",
      "terms": {
        "paymentTerms": "Net 30 days",
        "deliveryTerms": "FOB Factory",
        "leadTime": "3-4 weeks",
        "warranty": "6 months"
      },
      "notes": "Custom colors available upon request. Minimum order quantity applies.",
      "createdBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "createdAt": "2024-11-17T10:00:00.000Z",
      "updatedAt": "2024-11-17T10:00:00.000Z"
    }
  }
}
```

### 3. Get Quotation by ID

```http
GET /api/dashboard/quotations/:id
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation retrieved successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011122",
      "quotationId": "QUO-2024-001",
      "enquiry": {
        "_id": "674b123456789abc12345678",
        "enquiryId": "ENQ-2024-001",
        "name": "John Doe",
        "company": "ABC Garments Ltd",
        "message": "Interested in bulk purchasing cotton fabric"
      },
      "customer": {
        "name": "John Doe",
        "company": "ABC Garments Ltd",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": {
          "street": "123 Fashion Street",
          "city": "New York",
          "country": "USA",
          "zipCode": "10001"
        }
      },
      "items": [
        {
          "_id": "674b555444333abc22211100",
          "product": {
            "_id": "674b987654321abc87654321",
            "name": "Premium Cotton Fabric",
            "sku": "TEX-001",
            "images": {
              "main": "https://cdn.example.com/products/tex-001/main.jpg"
            }
          },
          "description": "Premium Cotton Fabric - Navy Blue",
          "quantity": 500,
          "unit": "meters",
          "unitPrice": 12.5,
          "discount": 5,
          "discountAmount": 312.5,
          "totalPrice": 5937.5
        }
      ],
      "subtotal": 6250.0,
      "discountAmount": 312.5,
      "taxRate": 0,
      "taxAmount": 0.0,
      "totalAmount": 5937.5,
      "currency": "USD",
      "status": "sent",
      "validUntil": "2024-12-16T23:59:59.000Z",
      "terms": {
        "paymentTerms": "Net 30 days",
        "deliveryTerms": "FOB Factory",
        "leadTime": "3-4 weeks",
        "warranty": "6 months",
        "validityPeriod": "30 days",
        "cancellationPolicy": "Orders can be cancelled within 24 hours"
      },
      "notes": "Custom colors available upon request. Minimum order quantity applies.",
      "createdBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com",
        "role": "editor"
      },
      "updatedBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "activities": [
        {
          "_id": "674b333444555abc66677790",
          "type": "created",
          "description": "Quotation created",
          "performedBy": {
            "_id": "674b555666777abc88899900",
            "name": "Sales Manager"
          },
          "performedAt": "2024-11-17T08:30:00.000Z"
        },
        {
          "_id": "674b333444555abc66677791",
          "type": "sent",
          "description": "Quotation sent to customer via email",
          "performedBy": {
            "_id": "674b555666777abc88899900",
            "name": "Sales Manager"
          },
          "performedAt": "2024-11-17T09:00:00.000Z",
          "metadata": {
            "recipientEmail": "john@example.com",
            "emailSubject": "Quotation QUO-2024-001 - Premium Cotton Fabric"
          }
        }
      ],
      "emailTracking": {
        "sent": true,
        "sentAt": "2024-11-17T09:00:00.000Z",
        "opened": true,
        "openedAt": "2024-11-17T10:30:00.000Z",
        "downloaded": false
      },
      "sentAt": "2024-11-17T09:00:00.000Z",
      "createdAt": "2024-11-17T08:30:00.000Z",
      "updatedAt": "2024-11-17T09:00:00.000Z"
    }
  }
}
```

### 4. Update Quotation

```http
PUT /api/dashboard/quotations/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**NEW BEHAVIOR:**

- Automatically logs activity when quotation status changes
- Updates linked enquiry status to "closed" when quotation status = "accepted"
- Updates linked enquiry status to "rejected" when quotation status = "declined"
- Tracks status change history in enquiry.activities array

**Request Body:**

```json
{
  "items": [
    {
      "_id": "674b555444333abc22211100",
      "productId": "674b987654321abc87654321",
      "description": "Premium Cotton Fabric - Navy Blue (Updated)",
      "quantity": 600,
      "unit": "meters",
      "unitPrice": 11.5,
      "discount": 7
    }
  ],
  "validUntil": "2024-12-20T23:59:59.000Z",
  "notes": "Updated pricing and quantity as per customer request.",
  "status": "draft"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation updated successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011122",
      "quotationId": "QUO-2024-001",
      "items": [
        {
          "_id": "674b555444333abc22211100",
          "product": {
            "_id": "674b987654321abc87654321",
            "name": "Premium Cotton Fabric",
            "sku": "TEX-001"
          },
          "description": "Premium Cotton Fabric - Navy Blue (Updated)",
          "quantity": 600,
          "unit": "meters",
          "unitPrice": 11.5,
          "discount": 7,
          "discountAmount": 483.0,
          "totalPrice": 6417.0
        }
      ],
      "subtotal": 6900.0,
      "discountAmount": 483.0,
      "totalAmount": 6417.0,
      "status": "draft",
      "updatedBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager"
      },
      "updatedAt": "2024-11-17T11:00:00.000Z"
    }
  }
}
```

### 5. Send Quotation

```http
POST /api/dashboard/quotations/:id/send
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**NEW BEHAVIOR:**

- Updates quotation status to "sent"
- Logs "quotation_sent" activity in linked enquiry.activities array
- Records sentAt timestamp and sentBy user

**Request Body:**

```json
{
  "recipientEmail": "john@example.com",
  "subject": "Quotation for Premium Cotton Fabric - QUO-2024-001",
  "message": "Dear John,\n\nPlease find attached our quotation for your recent enquiry. We look forward to your response.\n\nBest regards,\nSales Team",
  "attachPDF": true,
  "sendCopy": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation sent successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011122",
      "quotationId": "QUO-2024-001",
      "status": "sent",
      "sentAt": "2024-11-17T12:00:00.000Z"
    },
    "email": {
      "recipientEmail": "john@example.com",
      "subject": "Quotation for Premium Cotton Fabric - QUO-2024-001",
      "sentAt": "2024-11-17T12:00:00.000Z",
      "messageId": "msg_674b888999000abc11122233"
    },
    "pdf": {
      "generated": true,
      "downloadUrl": "https://cdn.example.com/quotations/QUO-2024-001.pdf",
      "expiresAt": "2024-11-24T12:00:00.000Z"
    }
  }
}
```

### 6. Generate PDF

```http
GET /api/dashboard/quotations/:id/pdf
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**

- `download` (optional): Set to true to force download (default: false)

**Success Response (200):**

```json
{
  "success": true,
  "message": "PDF generated successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011122",
      "quotationId": "QUO-2024-001"
    },
    "pdf": {
      "downloadUrl": "https://cdn.example.com/quotations/QUO-2024-001.pdf",
      "filename": "QUO-2024-001.pdf",
      "size": 245760,
      "generatedAt": "2024-11-17T12:30:00.000Z",
      "expiresAt": "2024-11-24T12:30:00.000Z"
    }
  }
}
```

### 7. Update Quotation Status

```http
PUT /api/dashboard/quotations/:id/status
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "status": "accepted",
  "note": "Customer confirmed acceptance via phone call",
  "customerResponse": {
    "acceptedAt": "2024-11-18T10:00:00.000Z",
    "acceptedBy": "John Doe",
    "method": "phone"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation status updated successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011122",
      "quotationId": "QUO-2024-001",
      "status": "accepted",
      "statusHistory": [
        {
          "status": "draft",
          "changedAt": "2024-11-17T08:30:00.000Z",
          "changedBy": "674b555666777abc88899900"
        },
        {
          "status": "sent",
          "changedAt": "2024-11-17T09:00:00.000Z",
          "changedBy": "674b555666777abc88899900"
        },
        {
          "status": "accepted",
          "changedAt": "2024-11-18T10:00:00.000Z",
          "changedBy": "674b555666777abc88899900",
          "note": "Customer confirmed acceptance via phone call"
        }
      ],
      "customerResponse": {
        "acceptedAt": "2024-11-18T10:00:00.000Z",
        "acceptedBy": "John Doe",
        "method": "phone"
      },
      "updatedAt": "2024-11-18T10:00:00.000Z"
    }
  }
}
```

### 8. Duplicate Quotation

```http
POST /api/dashboard/quotations/:id/duplicate
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "newValidUntil": "2024-12-30T23:59:59.000Z",
  "updatePricing": true,
  "notes": "Revised quotation based on updated requirements"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Quotation duplicated successfully.",
  "data": {
    "quotation": {
      "_id": "674b777888999abc00011124",
      "quotationId": "QUO-2024-003",
      "originalQuotation": "QUO-2024-001",
      "customer": {
        "name": "John Doe",
        "company": "ABC Garments Ltd",
        "email": "john@example.com"
      },
      "items": [
        {
          "_id": "674b555444333abc22211103",
          "product": {
            "_id": "674b987654321abc87654321",
            "name": "Premium Cotton Fabric",
            "sku": "TEX-001"
          },
          "description": "Premium Cotton Fabric - Navy Blue",
          "quantity": 500,
          "unit": "meters",
          "unitPrice": 12.5,
          "discount": 5,
          "totalPrice": 5937.5
        }
      ],
      "totalAmount": 5937.5,
      "status": "draft",
      "validUntil": "2024-12-30T23:59:59.000Z",
      "notes": "Revised quotation based on updated requirements",
      "createdAt": "2024-11-18T11:00:00.000Z"
    }
  }
}
```

### 9. Get Quotation Statistics

```http
GET /api/dashboard/quotations/stats
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quotation statistics retrieved successfully.",
  "data": {
    "overview": {
      "total": 50,
      "thisMonth": 15,
      "totalValue": 125000.0,
      "averageValue": 2500.0,
      "conversionRate": 16.0,
      "currency": "USD"
    },
    "byStatus": [
      { "status": "draft", "count": 10, "percentage": 20.0, "value": 25000.0 },
      { "status": "sent", "count": 25, "percentage": 50.0, "value": 62500.0 },
      {
        "status": "accepted",
        "count": 8,
        "percentage": 16.0,
        "value": 20000.0
      },
      {
        "status": "rejected",
        "count": 5,
        "percentage": 10.0,
        "value": 12500.0
      },
      { "status": "expired", "count": 2, "percentage": 4.0, "value": 5000.0 }
    ],
    "timeline": [
      {
        "date": "2024-11-18",
        "created": 3,
        "sent": 2,
        "accepted": 1,
        "rejected": 0
      }
    ],
    "topCustomers": [
      {
        "company": "ABC Garments Ltd",
        "quotationCount": 5,
        "totalValue": 15000.0
      }
    ],
    "responseTime": {
      "averageDays": 3.5,
      "medianDays": 2.0
    }
  }
}
```

---

## Quotation Status Flow

```
draft → sent → accepted/rejected/expired
  ↑       ↓
  ←───────┘ (can revert to draft for editing)
```

**Status Definitions:**

- **draft**: Being prepared, not yet sent
- **sent**: Delivered to customer
- **accepted**: Customer approved the quotation
- **rejected**: Customer declined the quotation
- **expired**: Validity period has passed

---

## Error Responses

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": [
    "Valid until date must be in the future",
    "At least one item is required"
  ]
}
```

### 403 - Cannot Edit Sent Quotation

```json
{
  "success": false,
  "message": "Cannot edit quotation that has already been sent. Create a new version instead."
}
```

### 404 - Quotation Not Found

```json
{
  "success": false,
  "message": "Quotation not found."
}
```

---

## Example Usage

### JavaScript/Node.js

```javascript
// Create quotation
const createResponse = await fetch('/api/dashboard/quotations', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    enquiryId: '674b123456789abc12345678',
    customer: {
      /* customer data */
    },
    items: [
      /* quotation items */
    ],
  }),
});

// Send quotation
const sendResponse = await fetch(
  '/api/dashboard/quotations/674b777888999abc00011122/send',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientEmail: 'john@example.com',
      attachPDF: true,
    }),
  },
);
```

### cURL

```bash
# Get quotations
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/dashboard/quotations?status=sent&page=1"

# Generate PDF
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/dashboard/quotations/674b777888999abc00011122/pdf?download=true"
```

---

## Business Rules

1. **Editing Restrictions**: Sent quotations cannot be edited (must duplicate to create new version)
2. **Validity Period**: Quotations automatically expire after validity date
3. **Currency**: All amounts must be in the same currency within a quotation
4. **Minimum Values**: Quotation must have at least one item with quantity > 0
5. **Email Tracking**: Track email delivery, opens, and downloads
6. **Audit Trail**: Complete activity log for all quotation changes
