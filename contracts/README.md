# API Contracts Documentation

This directory contains comprehensive API documentation for the Shop Texxolution platform, organized by module and functionality.

## Available Contracts

### Public APIs
- **[PUBLIC_API_CONTRACT.md](./PUBLIC_API_CONTRACT.md)** - Public-facing product APIs for customers and website visitors

### Dashboard APIs  

#### Core Management
- **[DASHBOARD_AUTH_API_CONTRACT.md](./DASHBOARD_AUTH_API_CONTRACT.md)** - Authentication and user management for dashboard
- **[DASHBOARD_PRODUCTS_API_CONTRACT.md](./DASHBOARD_PRODUCTS_API_CONTRACT.md)** - Product management for dashboard users
- **[DASHBOARD_ENQUIRY_API_CONTRACT.md](./DASHBOARD_ENQUIRY_API_CONTRACT.md)** - Enquiry management and customer communication
- **[DASHBOARD_QUOTATION_API_CONTRACT.md](./DASHBOARD_QUOTATION_API_CONTRACT.md)** - Quotation creation, management, and tracking

#### Analytics & Reporting
- **[DASHBOARD_ANALYTICS_API_CONTRACT.md](./DASHBOARD_ANALYTICS_API_CONTRACT.md)** - Business analytics, metrics, and reporting

#### File Management
- **[DASHBOARD_UPLOADS_API_CONTRACT.md](./DASHBOARD_UPLOADS_API_CONTRACT.md)** - File upload, management, and storage

## Contract Structure

Each contract file follows a standardized structure:

1. **Overview** - Purpose and scope of the API module
2. **Authentication** - Required authentication methods
3. **User Roles & Permissions** - Access control specifications  
4. **Endpoints** - Detailed endpoint documentation including:
   - HTTP methods and URLs
   - Request/response examples
   - Error handling
   - Query parameters
   - Validation rules
5. **Business Rules** - Important constraints and logic
6. **Example Usage** - Practical implementation examples

## API Module Overview

### Public Module
**Purpose**: Customer-facing APIs for product browsing and basic interactions
- Product catalog access
- Search and filtering
- Basic enquiry submission
- Public content delivery

## 👥 User Roles

| Role       | Products  | Users        | Analytics   |
| ---------- | --------- | ------------ | ----------- |
| **Admin**  | Full CRUD | Full CRUD    | Full Access |
| **Editor** | Full CRUD | Read Profile | Read Access |
| **Viewer** | Read Only | Read Profile | Read Access |

## 📋 Common Response Format

All APIs follow a consistent response structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | array,
  "errors": array (optional)
}
```

## 🔄 HTTP Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | Success (GET, PUT, DELETE)             |
| 201  | Created (POST)                         |
| 400  | Bad Request (validation errors)        |
| 401  | Unauthorized (authentication required) |
| 403  | Forbidden (insufficient permissions)   |
| 404  | Not Found                              |
| 409  | Conflict (duplicate resources)         |
| 429  | Too Many Requests (rate limited)       |
| 500  | Internal Server Error                  |

## 🛡️ Security Features

### Authentication

- JWT-based authentication
- Refresh token rotation
- Password strength requirements
- Rate limiting on auth endpoints

### Authorization

- Role-based access control (RBAC)
- Resource-level permissions
- Admin-only operations protection

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Sensitive data filtering

### File Upload Security

- File type validation
- Size limits
- Virus scanning (production)
- CDN delivery

## 🚀 Getting Started

1. **Choose the appropriate contract** based on your needs:
   - Use `PUBLIC_API_CONTRACT.md` for public-facing applications
   - Use `DASHBOARD_*_API_CONTRACT.md` files for admin/internal applications

2. **Authentication setup** (for dashboard APIs):

   ```javascript
   // Login to get token
   const response = await fetch('/api/dashboard/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password }),
   });

   const { data } = await response.json();
   const token = data.token;

   // Use token in subsequent requests
   const apiResponse = await fetch('/api/dashboard/products', {
     headers: { Authorization: `Bearer ${token}` },
   });
   ```

3. **Error handling**:
   ```javascript
   try {
     const response = await fetch('/api/dashboard/products');
     const result = await response.json();

     if (!result.success) {
       console.error('API Error:', result.message);
       if (result.errors) {
         console.error('Validation Errors:', result.errors);
       }
     }
   } catch (error) {
     console.error('Network Error:', error);
   }
   ```

## 🔧 Development Environment

### Base URLs

- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging-api.texxolution.com/api`
- **Production**: `https://api.texxolution.com/api`

### Testing

Each contract includes:

- Complete request/response examples
- cURL commands for testing
- JavaScript/Node.js code examples
- Error scenario documentation

## 📞 Support

For API support and questions:

- **Developer Documentation**: [Internal Wiki Link]
- **Issue Tracker**: [GitHub Issues Link]
- **Team Contact**: dev-team@texxolution.com

---

## 📝 Contract Maintenance

These contracts are living documents that should be updated when:

- New endpoints are added
- Request/response formats change
- Authentication methods are modified
- Business rules are updated

**Last Updated**: November 16, 2024  
**Version**: 1.0.0
