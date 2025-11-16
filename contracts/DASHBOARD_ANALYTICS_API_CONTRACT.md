# Dashboard Analytics API Contract

## Overview

This document outlines the analytics and reporting API endpoints for the Shop Texxolution dashboard. These endpoints provide business insights, metrics, and data visualization capabilities.

**Base URL:** `https://your-domain.com/api/dashboard/analytics`

## Authentication

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## User Roles & Permissions

- **admin**: Full access to all analytics data
- **editor**: Access to operational analytics
- **viewer**: Limited access to basic metrics

---

## Endpoints

### 1. Get Dashboard Overview

```http
GET /api/dashboard/analytics/overview
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**
- `period` (optional): Time period (today, week, month, quarter, year, custom)
- `dateFrom` (optional): Start date for custom period (YYYY-MM-DD)
- `dateTo` (optional): End date for custom period (YYYY-MM-DD)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully.",
  "data": {
    "period": {
      "type": "month",
      "start": "2024-11-01T00:00:00.000Z",
      "end": "2024-11-30T23:59:59.000Z"
    },
    "metrics": {
      "enquiries": {
        "total": 150,
        "new": 25,
        "pending": 45,
        "completed": 80,
        "growth": 12.5,
        "previousPeriod": 134
      },
      "quotations": {
        "total": 85,
        "sent": 60,
        "accepted": 15,
        "rejected": 8,
        "pending": 37,
        "conversionRate": 17.6,
        "averageValue": 2850.00,
        "totalValue": 242250.00
      },
      "products": {
        "total": 1250,
        "active": 1180,
        "inactive": 70,
        "mostViewed": "Premium Cotton Fabric",
        "mostEnquired": "Silk Blend Material"
      },
      "customers": {
        "totalCompanies": 320,
        "activeThisMonth": 85,
        "newThisMonth": 15,
        "topMarkets": ["USA", "Germany", "UK", "Canada"]
      },
      "performance": {
        "responseTime": {
          "averageHours": 4.2,
          "target": 6.0,
          "improvement": 15.3
        },
        "satisfaction": {
          "rating": 4.6,
          "totalResponses": 45,
          "nps": 72
        }
      }
    },
    "trends": {
      "enquiryTrend": [
        { "date": "2024-11-01", "count": 5 },
        { "date": "2024-11-02", "count": 8 },
        { "date": "2024-11-03", "count": 6 }
      ],
      "quotationTrend": [
        { "date": "2024-11-01", "sent": 3, "accepted": 1 },
        { "date": "2024-11-02", "sent": 5, "accepted": 2 }
      ]
    }
  }
}
```

### 2. Get Revenue Analytics

```http
GET /api/dashboard/analytics/revenue
Authorization: Bearer <jwt-token>
```

**Access:** Admin, Editor

**Query Parameters:**
- `period` (optional): Time period (month, quarter, year, custom)
- `dateFrom` (optional): Start date (YYYY-MM-DD)
- `dateTo` (optional): End date (YYYY-MM-DD)
- `currency` (optional): Currency filter (USD, EUR, etc.)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Revenue analytics retrieved successfully.",
  "data": {
    "summary": {
      "totalRevenue": 125000.00,
      "projectedRevenue": 180000.00,
      "growth": 22.5,
      "currency": "USD",
      "period": "month"
    },
    "breakdown": {
      "byStatus": {
        "accepted": 45000.00,
        "pending": 80000.00,
        "pipeline": 125000.00
      },
      "byProduct": [
        {
          "productName": "Premium Cotton Fabric",
          "revenue": 35000.00,
          "percentage": 28.0,
          "quotations": 15
        }
      ],
      "byCustomer": [
        {
          "company": "ABC Garments Ltd",
          "revenue": 15000.00,
          "quotations": 5,
          "conversionRate": 80.0
        }
      ],
      "byRegion": [
        {
          "region": "North America",
          "revenue": 65000.00,
          "percentage": 52.0
        }
      ]
    },
    "timeline": [
      {
        "date": "2024-11-01",
        "revenue": 5000.00,
        "quotations": 3
      }
    ],
    "forecast": {
      "nextMonth": 135000.00,
      "nextQuarter": 400000.00,
      "confidence": 78.5
    }
  }
}
```

### 3. Get Customer Analytics

```http
GET /api/dashboard/analytics/customers
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Success Response (200):**

```json
{
  "success": true,
  "message": "Customer analytics retrieved successfully.",
  "data": {
    "overview": {
      "totalCustomers": 320,
      "activeCustomers": 85,
      "newCustomers": 15,
      "returningCustomers": 70,
      "averageOrderValue": 2850.00
    },
    "segments": [
      {
        "segment": "Enterprise",
        "count": 45,
        "percentage": 14.1,
        "averageValue": 15000.00
      },
      {
        "segment": "SME",
        "count": 180,
        "percentage": 56.3,
        "averageValue": 3500.00
      },
      {
        "segment": "Startup",
        "count": 95,
        "percentage": 29.6,
        "averageValue": 750.00
      }
    ],
    "geography": [
      {
        "country": "USA",
        "customers": 125,
        "percentage": 39.1,
        "revenue": 65000.00
      },
      {
        "country": "Germany",
        "customers": 65,
        "percentage": 20.3,
        "revenue": 35000.00
      }
    ],
    "engagement": {
      "highEngagement": 45,
      "mediumEngagement": 180,
      "lowEngagement": 95,
      "averageEnquiriesPerCustomer": 2.3,
      "averageResponseTime": "4.2 hours"
    },
    "lifecycle": {
      "new": 15,
      "active": 250,
      "inactive": 40,
      "churned": 15
    }
  }
}
```

### 4. Get Product Performance

```http
GET /api/dashboard/analytics/products
Authorization: Bearer <jwt-token>
```

**Access:** All authenticated users

**Query Parameters:**
- `category` (optional): Filter by product category
- `limit` (optional): Number of top products to return (default: 10)
- `sortBy` (optional): Sort criteria (views, enquiries, quotations, revenue)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product performance retrieved successfully.",
  "data": {
    "overview": {
      "totalProducts": 1250,
      "activeProducts": 1180,
      "productsWithEnquiries": 450,
      "averageViewsPerProduct": 125.5
    },
    "topProducts": [
      {
        "_id": "674b987654321abc87654321",
        "name": "Premium Cotton Fabric",
        "sku": "TEX-001",
        "views": 1250,
        "enquiries": 45,
        "quotations": 25,
        "revenue": 35000.00,
        "conversionRate": 55.6,
        "category": "Cotton"
      }
    ],
    "categories": [
      {
        "name": "Cotton",
        "products": 320,
        "views": 15000,
        "enquiries": 180,
        "revenue": 85000.00
      }
    ],
    "performance": {
      "mostViewed": [
        {
          "product": "Premium Cotton Fabric",
          "views": 1250,
          "growth": 15.2
        }
      ],
      "mostEnquired": [
        {
          "product": "Silk Blend Material",
          "enquiries": 55,
          "conversionRate": 65.5
        }
      ],
      "topRevenue": [
        {
          "product": "Premium Cotton Fabric",
          "revenue": 35000.00,
          "quotations": 25
        }
      ]
    },
    "trends": {
      "viewTrends": [
        {
          "date": "2024-11-01",
          "views": 450
        }
      ],
      "enquiryTrends": [
        {
          "date": "2024-11-01",
          "enquiries": 15
        }
      ]
    }
  }
}
```

### 5. Export Analytics Report

```http
POST /api/dashboard/analytics/export
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Access:** Admin, Editor

**Request Body:**

```json
{
  "reportType": "comprehensive",
  "period": {
    "type": "custom",
    "dateFrom": "2024-11-01",
    "dateTo": "2024-11-30"
  },
  "sections": [
    "overview",
    "revenue",
    "customers",
    "products",
    "enquiries",
    "quotations"
  ],
  "format": "pdf",
  "includeCharts": true,
  "includeTables": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Analytics report generated successfully.",
  "data": {
    "report": {
      "id": "RPT-2024-001",
      "type": "comprehensive",
      "period": {
        "type": "custom",
        "dateFrom": "2024-11-01",
        "dateTo": "2024-11-30"
      },
      "format": "pdf",
      "downloadUrl": "https://cdn.example.com/reports/RPT-2024-001.pdf",
      "filename": "Analytics_Report_Nov_2024.pdf",
      "size": 2048576,
      "generatedAt": "2024-11-18T15:00:00.000Z",
      "expiresAt": "2024-11-25T15:00:00.000Z"
    },
    "summary": {
      "totalPages": 15,
      "sectionsIncluded": 6,
      "chartsGenerated": 12,
      "tablesGenerated": 8
    }
  }
}
```

---

## Chart Data Endpoints

### Get Chart Data

```http
GET /api/dashboard/analytics/charts/:chartType
Authorization: Bearer <jwt-token>
```

**Chart Types:**
- `enquiry-timeline`
- `quotation-conversion`
- `revenue-trend`
- `product-performance`
- `customer-segments`
- `geographic-distribution`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chart data retrieved successfully.",
  "data": {
    "chartType": "enquiry-timeline",
    "title": "Enquiry Timeline",
    "subtitle": "Last 30 days",
    "data": {
      "labels": ["Nov 1", "Nov 2", "Nov 3", "Nov 4"],
      "datasets": [
        {
          "label": "New Enquiries",
          "data": [5, 8, 6, 12],
          "backgroundColor": "#3B82F6",
          "borderColor": "#1D4ED8"
        },
        {
          "label": "Responded",
          "data": [4, 7, 5, 10],
          "backgroundColor": "#10B981",
          "borderColor": "#059669"
        }
      ]
    },
    "options": {
      "responsive": true,
      "scales": {
        "x": { "title": { "display": true, "text": "Date" } },
        "y": { "title": { "display": true, "text": "Count" } }
      }
    }
  }
}
```

---

## Real-time Metrics

### Get Live Metrics

```http
GET /api/dashboard/analytics/live
Authorization: Bearer <jwt-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Live metrics retrieved successfully.",
  "data": {
    "timestamp": "2024-11-18T15:30:00.000Z",
    "metrics": {
      "activeUsers": 12,
      "todayEnquiries": 8,
      "todayQuotations": 5,
      "pendingResponses": 23,
      "systemHealth": {
        "status": "healthy",
        "responseTime": "145ms",
        "uptime": "99.98%"
      }
    },
    "alerts": [
      {
        "type": "info",
        "message": "5 enquiries require response within 2 hours",
        "priority": "medium"
      }
    ],
    "recentActivity": [
      {
        "type": "enquiry",
        "message": "New enquiry received from ABC Garments",
        "timestamp": "2024-11-18T15:25:00.000Z"
      }
    ]
  }
}
```

---

## Error Responses

### 400 - Invalid Parameters
```json
{
  "success": false,
  "message": "Invalid date range. End date must be after start date."
}
```

### 403 - Insufficient Permissions
```json
{
  "success": false,
  "message": "Insufficient permissions to access revenue analytics."
}
```

---

## Business Rules

1. **Data Privacy**: Viewer role has limited access to sensitive financial data
2. **Performance**: Large datasets are paginated and cached
3. **Real-time**: Live metrics updated every 30 seconds
4. **Export Limits**: Maximum 1 comprehensive report per user per day
5. **Data Retention**: Analytics data retained for 2 years
6. **Accuracy**: Metrics calculated from live database with 5-minute cache
