# Dashboard Enquiry API Contract

## Overview

This document outlines the enquiry management API endpoints for the Shop Texxolution dashboard. These endpoints handle customer enquiries, quotations, and lead management functionality.

**Base URL:** `https://your-domain.com/api/dashboard/enquiries`

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles & Permissions

- **admin**: Full CRUD access to all enquiries
- **editor**: Create, read, update enquiries and quotations
- **viewer**: Read-only access to enquiries

---

## Endpoints

### 1. Get All Enquiries

```http
GET /api/dashboard/enquiries
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (default: -createdAt)
- `status` (optional): Filter by status (new, in-progress, quoted, closed, rejected)
- `urgency` (optional): Filter by urgency (low, medium, high, urgent)
- `search` (optional): Search by name, email, company, or enquiry ID
- `productId` (optional): Filter by specific product
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `assignedTo` (optional): Filter by assigned user ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiries retrieved successfully.",
  "data": {
    "enquiries": [
      {
        "_id": "674b123456789abc12345678",
        "enquiryId": "ENQ-2024-001",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "ABC Garments Ltd",
        "product": {
          "_id": "674b987654321abc87654321",
          "name": "Premium Cotton Fabric",
          "sku": "TEX-001",
          "category": "Fabrics"
        },
        "message": "I'm interested in bulk purchasing this fabric for our upcoming collection.",
        "quantity": "500 meters",
        "urgency": "medium",
        "status": "new",
        "source": "website",
        "tags": ["bulk-order", "cotton"],
        "assignedTo": {
          "_id": "674b555666777abc88899900",
          "name": "Sales Manager",
          "email": "sales@texxolution.com"
        },
        "notes": [
          {
            "_id": "674b111222333abc44455566",
            "content": "Customer is interested in custom colors.",
            "addedBy": {
              "_id": "674b555666777abc88899900",
              "name": "Sales Manager"
            },
            "addedAt": "2024-11-16T11:00:00.000Z"
          }
        ],
        "quotation": {
          "_id": "674b777888999abc00011122",
          "quotationId": "QUO-2024-001",
          "status": "pending"
        },
        "followUpDate": "2024-11-20T10:00:00.000Z",
        "createdAt": "2024-11-16T10:30:00.000Z",
        "updatedAt": "2024-11-16T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalEnquiries": 100,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "summary": {
      "total": 100,
      "byStatus": {
        "new": 25,
        "in-progress": 35,
        "quoted": 20,
        "closed": 15,
        "rejected": 5
      },
      "byUrgency": {
        "low": 30,
        "medium": 40,
        "high": 25,
        "urgent": 5
      }
    }
  }
}
```

### 2. Get Enquiry by ID

```http
GET /api/dashboard/enquiries/:id
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiry retrieved successfully.",
  "data": {
    "enquiry": {
      "_id": "674b123456789abc12345678",
      "enquiryId": "ENQ-2024-001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "ABC Garments Ltd",
      "product": {
        "_id": "674b987654321abc87654321",
        "name": "Premium Cotton Fabric",
        "sku": "TEX-001",
        "category": "Fabrics",
        "images": {
          "main": "https://cdn.example.com/products/tex-001/main.jpg"
        },
        "pricing": {
          "basePrice": 12.5,
          "currency": "USD"
        }
      },
      "message": "I'm interested in bulk purchasing this fabric for our upcoming collection. We need it in custom colors - navy blue and forest green.",
      "quantity": "500 meters",
      "urgency": "medium",
      "status": "in-progress",
      "source": "website",
      "tags": ["bulk-order", "cotton", "custom-colors"],
      "customerInfo": {
        "companySize": "50-100 employees",
        "industry": "Fashion & Apparel",
        "website": "https://abcgarments.com",
        "address": {
          "street": "123 Fashion Street",
          "city": "New York",
          "country": "USA"
        }
      },
      "assignedTo": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com",
        "role": "editor"
      },
      "notes": [
        {
          "_id": "674b111222333abc44455566",
          "content": "Customer is interested in custom colors - navy blue and forest green.",
          "addedBy": {
            "_id": "674b555666777abc88899900",
            "name": "Sales Manager"
          },
          "addedAt": "2024-11-16T11:00:00.000Z"
        },
        {
          "_id": "674b111222333abc44455567",
          "content": "Scheduled follow-up call for tomorrow at 2 PM.",
          "addedBy": {
            "_id": "674b555666777abc88899900",
            "name": "Sales Manager"
          },
          "addedAt": "2024-11-16T14:30:00.000Z"
        }
      ],
      "quotations": [
        {
          "_id": "674b777888999abc00011122",
          "quotationId": "QUO-2024-001",
          "status": "sent",
          "totalAmount": 6250.0,
          "currency": "USD",
          "validUntil": "2024-12-16T23:59:59.000Z",
          "createdAt": "2024-11-17T09:00:00.000Z"
        }
      ],
      "activities": [
        {
          "_id": "674b333444555abc66677788",
          "type": "status_changed",
          "description": "Status changed from 'new' to 'in-progress'",
          "performedBy": {
            "_id": "674b555666777abc88899900",
            "name": "Sales Manager"
          },
          "performedAt": "2024-11-16T11:00:00.000Z"
        },
        {
          "_id": "674b333444555abc66677789",
          "type": "quotation_sent",
          "description": "Quotation QUO-2024-001 sent to customer",
          "performedBy": {
            "_id": "674b555666777abc88899900",
            "name": "Sales Manager"
          },
          "performedAt": "2024-11-17T09:00:00.000Z"
        }
      ],
      "followUpDate": "2024-11-20T10:00:00.000Z",
      "expectedCloseDate": "2024-11-30T23:59:59.000Z",
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-11-17T09:00:00.000Z"
    }
  }
}
```

### 3. Update Enquiry

```http
PUT /api/dashboard/enquiries/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "status": "in-progress",
  "urgency": "high",
  "assignedTo": "674b555666777abc88899900",
  "tags": ["bulk-order", "cotton", "custom-colors"],
  "followUpDate": "2024-11-20T10:00:00.000Z",
  "expectedCloseDate": "2024-11-30T23:59:59.000Z",
  "customerInfo": {
    "companySize": "50-100 employees",
    "industry": "Fashion & Apparel",
    "website": "https://abcgarments.com"
  }
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
      "enquiryId": "ENQ-2024-001",
      "status": "in-progress",
      "urgency": "high",
      "assignedTo": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "updatedBy": {
        "_id": "674b999000111abc22233344",
        "name": "Admin User"
      },
      "updatedAt": "2024-11-16T15:30:00.000Z"
    }
  }
}
```

### 4. Add Note to Enquiry

```http
POST /api/dashboard/enquiries/:id/notes
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "content": "Customer confirmed they need delivery by end of December. Checking production capacity."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Note added successfully.",
  "data": {
    "note": {
      "_id": "674b111222333abc44455568",
      "content": "Customer confirmed they need delivery by end of December. Checking production capacity.",
      "addedBy": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "addedAt": "2024-11-16T16:00:00.000Z"
    },
    "enquiry": {
      "_id": "674b123456789abc12345678",
      "enquiryId": "ENQ-2024-001",
      "updatedAt": "2024-11-16T16:00:00.000Z"
    }
  }
}
```

### 5. Delete/Update Note

```http
DELETE /api/dashboard/enquiries/:id/notes/:noteId
PUT /api/dashboard/enquiries/:id/notes/:noteId
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor (only note creator or admin can delete/edit)

### 6. Get Enquiry Statistics

```http
GET /api/dashboard/enquiries/stats
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**

- `period` (optional): Time period (today, week, month, quarter, year)
- `dateFrom` (optional): Custom start date
- `dateTo` (optional): Custom end date

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiry statistics retrieved successfully.",
  "data": {
    "overview": {
      "total": 150,
      "newToday": 8,
      "thisWeek": 35,
      "thisMonth": 120,
      "conversionRate": 15.5
    },
    "byStatus": [
      { "status": "new", "count": 25, "percentage": 16.7 },
      { "status": "in-progress", "count": 45, "percentage": 30.0 },
      { "status": "quoted", "count": 35, "percentage": 23.3 },
      { "status": "closed", "count": 30, "percentage": 20.0 },
      { "status": "rejected", "count": 15, "percentage": 10.0 }
    ],
    "byUrgency": [
      { "urgency": "low", "count": 45, "percentage": 30.0 },
      { "urgency": "medium", "count": 60, "percentage": 40.0 },
      { "urgency": "high", "count": 35, "percentage": 23.3 },
      { "urgency": "urgent", "count": 10, "percentage": 6.7 }
    ],
    "bySource": [
      { "source": "website", "count": 80, "percentage": 53.3 },
      { "source": "email", "count": 30, "percentage": 20.0 },
      { "source": "phone", "count": 25, "percentage": 16.7 },
      { "source": "referral", "count": 15, "percentage": 10.0 }
    ],
    "topProducts": [
      {
        "productId": "674b987654321abc87654321",
        "productName": "Premium Cotton Fabric",
        "enquiryCount": 25
      },
      {
        "productId": "674b987654321abc87654322",
        "productName": "Silk Blend Fabric",
        "enquiryCount": 18
      }
    ],
    "timeline": [
      {
        "date": "2024-11-16",
        "new": 8,
        "inProgress": 5,
        "quoted": 3,
        "closed": 2
      }
    ],
    "responseTime": {
      "average": 4.5,
      "median": 3.0,
      "unit": "hours"
    }
  }
}
```

### 7. Export Enquiries

```http
GET /api/dashboard/enquiries/export
Authorization: Bearer <jwt-token>
```

**Access:** Admin, Editor

**Query Parameters:**

- `format` (required): Export format (csv, xlsx, pdf)
- `status` (optional): Filter by status
- `dateFrom` (optional): Start date for export
- `dateTo` (optional): End date for export
- `fields` (optional): Comma-separated list of fields to include

**Success Response (200):**

```json
{
  "success": true,
  "message": "Export generated successfully.",
  "data": {
    "downloadUrl": "https://cdn.example.com/exports/enquiries-2024-11-16.xlsx",
    "filename": "enquiries-2024-11-16.xlsx",
    "format": "xlsx",
    "totalRecords": 150,
    "expiresAt": "2024-11-17T10:30:00.000Z"
  }
}
```

### 8. Bulk Update Enquiries

```http
PUT /api/dashboard/enquiries/bulk-update
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "enquiryIds": ["674b123456789abc12345678", "674b123456789abc12345679"],
  "updateData": {
    "status": "in-progress",
    "assignedTo": "674b555666777abc88899900"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "2 enquiries updated successfully.",
  "data": {
    "updated": 2,
    "failed": 0,
    "results": [
      {
        "enquiryId": "ENQ-2024-001",
        "status": "updated"
      },
      {
        "enquiryId": "ENQ-2024-002",
        "status": "updated"
      }
    ]
  }
}
```

### 9. Assign Enquiry

```http
PUT /api/dashboard/enquiries/:id/assign
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "assignedTo": "674b555666777abc88899900",
  "note": "Assigning to sales team for immediate follow-up"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Enquiry assigned successfully.",
  "data": {
    "enquiry": {
      "_id": "674b123456789abc12345678",
      "enquiryId": "ENQ-2024-001",
      "assignedTo": {
        "_id": "674b555666777abc88899900",
        "name": "Sales Manager",
        "email": "sales@texxolution.com"
      },
      "assignedBy": {
        "_id": "674b999000111abc22233344",
        "name": "Admin User"
      },
      "assignedAt": "2024-11-16T17:00:00.000Z"
    }
  }
}
```

---

## Error Responses

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": [
    "Status must be one of: new, in-progress, quoted, closed, rejected"
  ]
}
```

### 403 - Insufficient Permissions

```json
{
  "success": false,
  "message": "You don't have permission to update this enquiry."
}
```

### 404 - Enquiry Not Found

```json
{
  "success": false,
  "message": "Enquiry not found."
}
```

### 409 - Conflict

```json
{
  "success": false,
  "message": "Enquiry is already assigned to another user."
}
```

---

## Enquiry Status Flow

```
new → in-progress → quoted → closed
  ↓         ↓         ↓
rejected  rejected  rejected
```

**Status Definitions:**

- **new**: Just submitted, not yet reviewed
- **in-progress**: Being processed by sales team
- **quoted**: Quotation sent to customer
- **closed**: Successfully converted to order
- **rejected**: Not suitable or declined

## Urgency Levels

- **low**: Standard enquiry, no rush
- **medium**: Important enquiry, follow up within 2 days
- **high**: Urgent enquiry, follow up within 24 hours
- **urgent**: Critical enquiry, immediate attention required

---

## Example Usage

### JavaScript/Node.js

```javascript
// Get enquiries with filtering
const response = await fetch(
  '/api/dashboard/enquiries?status=new&urgency=high&page=1',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

// Update enquiry status
const updateResponse = await fetch(
  '/api/dashboard/enquiries/674b123456789abc12345678',
  {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'in-progress',
      assignedTo: '674b555666777abc88899900',
    }),
  },
);

// Add note to enquiry
const noteResponse = await fetch(
  '/api/dashboard/enquiries/674b123456789abc12345678/notes',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: 'Customer requires custom packaging',
    }),
  },
);
```

### cURL

```bash
# Get all enquiries
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/dashboard/enquiries?page=1&limit=20"

# Update enquiry
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress","urgency":"high"}' \
  "https://api.example.com/api/dashboard/enquiries/674b123456789abc12345678"

# Export enquiries
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/dashboard/enquiries/export?format=xlsx&status=new"
```

---

## Integration Notes

### Webhook Events

The system can send webhook notifications for:

- New enquiry received
- Status changes
- Quotation sent
- Follow-up reminders

### Email Integration

- Automatic email notifications to assigned users
- Email templates for customer communication
- Email tracking and delivery status

### CRM Integration

- Export data to external CRM systems
- Import customer data from CRM
- Sync contact information

---

## Performance & Caching

- **Response Caching**: Statistics and summary data cached for 5 minutes
- **Database Indexing**: Optimized queries for filtering and searching
- **Pagination**: Efficient pagination for large datasets
- **Background Processing**: Export generation handled asynchronously
