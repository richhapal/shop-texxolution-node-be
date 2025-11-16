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

### Dashboard Authentication Module

**Purpose**: Secure access control and user management

- JWT-based authentication
- Role-based permissions (admin, editor, viewer)
- User profile management
- Session handling

### Dashboard Products Module

**Purpose**: Complete product lifecycle management

- CRUD operations for products
- Image and document management
- Category and inventory tracking
- Bulk operations and import/export

### Dashboard Enquiry Module

**Purpose**: Customer enquiry management and communication

- Enquiry processing and tracking
- Status management workflow
- Communication history
- Response templates and automation

### Dashboard Quotation Module

**Purpose**: Sales quotation management

- Quotation creation from enquiries
- PDF generation and email delivery
- Status tracking and conversion analytics
- Terms and pricing management

### Dashboard Analytics Module

**Purpose**: Business intelligence and reporting

- Performance metrics and KPIs
- Customer and product analytics
- Revenue tracking and forecasting
- Real-time dashboard metrics

### Dashboard Uploads Module

**Purpose**: File and media management

- Multi-format file uploads
- Image optimization and processing
- Document management and organization
- Storage analytics and quota management

## Usage Guidelines

### Authentication

- All dashboard APIs require valid JWT tokens
- Token format: `Authorization: Bearer <jwt-token>`
- Tokens include role-based permissions
- Refresh tokens available for session management

### Permissions Matrix

| Role       | Products  | Enquiries | Quotations | Analytics     | Uploads       | Users        |
| ---------- | --------- | --------- | ---------- | ------------- | ------------- | ------------ |
| **Admin**  | Full CRUD | Full CRUD | Full CRUD  | Full Access   | Full CRUD     | Full CRUD    |
| **Editor** | Full CRUD | Full CRUD | Full CRUD  | Operational   | Create/Update | Read Profile |
| **Viewer** | Read Only | Read Only | Read Only  | Basic Metrics | Read Only     | Read Profile |

### Data Consistency

- All endpoints follow consistent response formats
- Pagination patterns standardized across modules
- Error handling follows RFC 7807 Problem Details
- Timestamps in ISO 8601 format (UTC)

### Rate Limiting

- Authentication: 5 requests/second
- File uploads: 10 uploads/minute
- Analytics: 100 requests/minute
- General APIs: 60 requests/minute

## Integration Notes

### Common Patterns

- **Search**: Query parameter `search` available on list endpoints
- **Filtering**: Multiple filter parameters supported
- **Sorting**: `sort` parameter with field and direction
- **Pagination**: `page` and `limit` parameters with metadata
- **Bulk Operations**: Special endpoints for batch processing

### File Handling

- Multiple upload strategies (single, multiple, chunked)
- Automatic image optimization and thumbnail generation
- CDN integration for fast content delivery
- Virus scanning and security validation

### Real-time Features

- Live metrics via polling endpoints
- Activity tracking across modules
- System health monitoring
- User session management

### Error Handling

All APIs return consistent error formats:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed validation errors"],
  "code": "ERROR_CODE"
}
```

### Business Rules Summary

1. **Data Privacy**: Role-based access to sensitive information
2. **File Limits**: Size and format restrictions per module
3. **Workflow States**: Defined status flows for enquiries and quotations
4. **Audit Trail**: Complete activity logging for all operations
5. **Performance**: Caching and optimization for high-traffic endpoints

## Development Workflow

1. **Review Contract**: Study relevant contract before implementation
2. **Authentication Setup**: Implement JWT token handling
3. **Error Handling**: Implement all documented error cases
4. **Testing**: Validate against contract examples
5. **Monitoring**: Track performance and error rates

For technical questions or clarifications, refer to the specific contract files or contact the development team.
