import type { ProjectContext } from '../../ai/types';

/**
 * API Documentation Template generates comprehensive API documentation
 * following OpenAPI/Swagger standards and RESTful API best practices.
 */
export class ApidocumentationTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for API Documentation
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'API Service';
    
    return `# API Documentation

**Project Name:** ${projectName}  
**API Version:** 1.0.0  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}

## Executive Summary

${projectDescription}

This document provides comprehensive API documentation for ${projectName}, including endpoint definitions, authentication methods, request/response formats, error handling, and usage examples.

## 1. API Overview

### 1.1 Introduction
- **Purpose:** [Define the primary purpose and capabilities of the API]
- **Target Audience:** [Developers, integrators, third-party applications]
- **API Type:** [REST, GraphQL, gRPC, WebSocket]
- **Data Format:** [JSON, XML, Protocol Buffers]

### 1.2 Base Information
- **Base URL:** \`https://api.${projectName.toLowerCase().replace(/\s+/g, '')}.com/v1\`
- **Protocol:** HTTPS only
- **Content Type:** \`application/json\`
- **Character Encoding:** UTF-8

### 1.3 API Principles
- **RESTful Design:** Following REST architectural constraints
- **Stateless:** Each request contains all necessary information
- **Resource-Oriented:** URLs represent resources, not actions
- **HTTP Methods:** Proper use of GET, POST, PUT, DELETE, PATCH
- **Idempotent Operations:** Safe retry mechanisms for applicable methods

## 2. Authentication Methods

### 2.1 Authentication Overview
The API supports multiple authentication methods to accommodate different use cases and security requirements.

### 2.2 API Key Authentication
**Usage:** Simple authentication for server-to-server communication
\`\`\`http
GET /api/v1/resources
Authorization: Bearer YOUR_API_KEY
\`\`\`

**Obtaining API Keys:**
1. Register for a developer account
2. Create a new application
3. Generate API key from dashboard
4. Store securely and never expose in client-side code

### 2.3 OAuth 2.0
**Usage:** Secure authentication for user-authorized access
\`\`\`http
GET /api/v1/user/profile
Authorization: Bearer ACCESS_TOKEN
\`\`\`

**OAuth Flow:**
1. **Authorization Request:** Redirect user to authorization server
2. **User Consent:** User grants permission
3. **Authorization Code:** Receive code at redirect URI
4. **Token Exchange:** Exchange code for access token
5. **API Access:** Use access token for authenticated requests

**Token Endpoints:**
- **Authorization:** \`/oauth/authorize\`
- **Token:** \`/oauth/token\`
- **Refresh:** \`/oauth/refresh\`

### 2.4 JWT (JSON Web Tokens)
**Usage:** Stateless authentication with embedded claims
\`\`\`http
GET /api/v1/protected-resource
Authorization: Bearer JWT_TOKEN
\`\`\`

**JWT Structure:**
\`\`\`
header.payload.signature
\`\`\`

## 3. Endpoint Definitions

### 3.1 Resource Endpoints

#### 3.1.1 Users

##### GET /api/v1/users
**Description:** Retrieve a list of users
**Authentication:** Required
**Parameters:**
- \`page\` (query, integer, optional): Page number (default: 1)
- \`limit\` (query, integer, optional): Items per page (default: 20, max: 100)
- \`search\` (query, string, optional): Search term for filtering
- \`sort\` (query, string, optional): Sort field (default: created_at)
- \`order\` (query, string, optional): Sort order (asc/desc, default: desc)

**Request Example:**
\`\`\`http
GET /api/v1/users?page=1&limit=10&search=john&sort=name&order=asc
Authorization: Bearer YOUR_API_KEY
\`\`\`

**Response Example:**
\`\`\`json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "status": "active",
        "created_at": "2025-06-17T10:30:00Z",
        "updated_at": "2025-06-17T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 150,
      "total_pages": 15,
      "has_next": true,
      "has_previous": false
    }
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2025-06-17T10:30:00Z"
  }
}
\`\`\`

##### GET /api/v1/users/{id}
**Description:** Retrieve a specific user by ID
**Authentication:** Required
**Parameters:**
- \`id\` (path, string, required): User UUID

**Request Example:**
\`\`\`http
GET /api/v1/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer YOUR_API_KEY
\`\`\`

**Response Example:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "status": "active",
    "profile": {
      "bio": "Software developer",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com"
    },
    "created_at": "2025-06-17T10:30:00Z",
    "updated_at": "2025-06-17T10:30:00Z"
  },
  "meta": {
    "request_id": "req_123456790",
    "timestamp": "2025-06-17T10:30:00Z"
  }
}
\`\`\`

##### POST /api/v1/users
**Description:** Create a new user
**Authentication:** Required
**Content-Type:** \`application/json\`

**Request Body:**
\`\`\`json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "profile": {
    "bio": "Product manager",
    "location": "New York, NY"
  }
}
\`\`\`

**Request Example:**
\`\`\`http
POST /api/v1/users
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

**Response Example:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "987e6543-e21b-34c5-b678-426614174001",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "status": "active",
    "created_at": "2025-06-17T11:00:00Z",
    "updated_at": "2025-06-17T11:00:00Z"
  },
  "meta": {
    "request_id": "req_123456791",
    "timestamp": "2025-06-17T11:00:00Z"
  }
}
\`\`\`

##### PUT /api/v1/users/{id}
**Description:** Update an existing user
**Authentication:** Required
**Parameters:**
- \`id\` (path, string, required): User UUID

**Request Example:**
\`\`\`http
PUT /api/v1/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "John D. Smith",
  "profile": {
    "bio": "Senior software developer",
    "website": "https://johnsmith.com"
  }
}
\`\`\`

##### DELETE /api/v1/users/{id}
**Description:** Delete a user
**Authentication:** Required
**Parameters:**
- \`id\` (path, string, required): User UUID

**Request Example:**
\`\`\`http
DELETE /api/v1/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer YOUR_API_KEY
\`\`\`

**Response Example:**
\`\`\`json
{
  "success": true,
  "message": "User successfully deleted",
  "meta": {
    "request_id": "req_123456792",
    "timestamp": "2025-06-17T11:15:00Z"
  }
}
\`\`\`

#### 3.1.2 Resources (Generic Entity)

##### GET /api/v1/resources
**Description:** Retrieve a list of resources
**Authentication:** Required

##### POST /api/v1/resources
**Description:** Create a new resource
**Authentication:** Required

##### GET /api/v1/resources/{id}
**Description:** Retrieve a specific resource
**Authentication:** Required

##### PUT /api/v1/resources/{id}
**Description:** Update a resource
**Authentication:** Required

##### DELETE /api/v1/resources/{id}
**Description:** Delete a resource
**Authentication:** Required

### 3.2 Utility Endpoints

#### 3.2.1 Health Check
##### GET /api/v1/health
**Description:** Check API health status
**Authentication:** Not required

**Response Example:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-06-17T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "external_api": "healthy"
  }
}
\`\`\`

#### 3.2.2 API Information
##### GET /api/v1/info
**Description:** Get API version and information
**Authentication:** Not required

**Response Example:**
\`\`\`json
{
  "api_name": "${projectName} API",
  "version": "1.0.0",
  "description": "${projectDescription}",
  "documentation": "https://docs.api.example.com",
  "support": "support@example.com"
}
\`\`\`

## 4. Request/Response Formats

### 4.1 Request Format Standards
- **Content-Type:** \`application/json\`
- **Character Encoding:** UTF-8
- **Date Format:** ISO 8601 (e.g., "2025-06-17T10:30:00Z")
- **Boolean Values:** \`true\` or \`false\`
- **Null Values:** \`null\`

### 4.2 Response Format Standards
All API responses follow a consistent structure:

\`\`\`json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": "string",
    "message": "string",
    "details": object
  } | null,
  "meta": {
    "request_id": "string",
    "timestamp": "string",
    "rate_limit": {
      "limit": number,
      "remaining": number,
      "reset": number
    }
  }
}
\`\`\`

### 4.3 Data Types
- **String:** Text data, UTF-8 encoded
- **Integer:** 32-bit signed integers
- **Float:** Double-precision floating-point numbers
- **Boolean:** \`true\` or \`false\`
- **Date/Time:** ISO 8601 format strings
- **UUID:** RFC 4122 compliant UUIDs
- **Array:** Ordered collections of values
- **Object:** Key-value pairs (JSON objects)

### 4.4 Field Naming Conventions
- **snake_case:** All field names use lowercase with underscores
- **Consistent:** Same field names across all endpoints
- **Descriptive:** Clear, meaningful field names
- **Standard:** Common fields (id, created_at, updated_at)

## 5. Error Codes

### 5.1 HTTP Status Codes
- **200 OK:** Successful GET, PUT, PATCH requests
- **201 Created:** Successful POST requests
- **204 No Content:** Successful DELETE requests
- **400 Bad Request:** Invalid request format or parameters
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource conflict (duplicate, etc.)
- **422 Unprocessable Entity:** Validation errors
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error
- **502 Bad Gateway:** Upstream service error
- **503 Service Unavailable:** Service temporarily unavailable

### 5.2 Error Response Format
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "Must be a valid email address"
    }
  },
  "meta": {
    "request_id": "req_123456793",
    "timestamp": "2025-06-17T11:30:00Z"
  }
}
\`\`\`

### 5.3 Custom Error Codes
- **VALIDATION_ERROR:** Input validation failed
- **AUTHENTICATION_FAILED:** Invalid credentials
- **AUTHORIZATION_DENIED:** Insufficient permissions
- **RESOURCE_NOT_FOUND:** Requested resource doesn't exist
- **DUPLICATE_RESOURCE:** Resource already exists
- **RATE_LIMIT_EXCEEDED:** Too many requests
- **EXTERNAL_SERVICE_ERROR:** Third-party service failure
- **DATA_INTEGRITY_ERROR:** Database constraint violation

## 6. Rate Limiting

### 6.1 Rate Limit Policy
- **Authenticated Requests:** 1000 requests per hour per API key
- **Unauthenticated Requests:** 100 requests per hour per IP address
- **Burst Limit:** 50 requests per minute
- **Premium Plans:** Higher limits available

### 6.2 Rate Limit Headers
Every response includes rate limit information:
\`\`\`http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 750
X-RateLimit-Reset: 1624875600
X-RateLimit-Window: 3600
\`\`\`

### 6.3 Rate Limit Exceeded Response
\`\`\`json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "limit": 1000,
      "window": 3600,
      "reset_at": "2025-06-17T12:00:00Z"
    }
  }
}
\`\`\`

## 7. Versioning Strategy

### 7.1 Versioning Approach
- **URL Versioning:** Version included in the URL path (\`/api/v1/\`)
- **Backward Compatibility:** Maintained for at least 12 months
- **Deprecation Notice:** 6 months advance notice for version deprecation
- **Migration Guide:** Provided for each version upgrade

### 7.2 Version Headers
Optional version specification via headers:
\`\`\`http
API-Version: 1.0
Accept: application/vnd.api+json;version=1.0
\`\`\`

### 7.3 Version Lifecycle
- **Beta:** \`/api/beta/\` - Unstable, subject to change
- **Stable:** \`/api/v1/\` - Production-ready, maintained
- **Deprecated:** \`/api/v0/\` - Legacy, scheduled for removal
- **Sunset:** No longer available

## 8. Security Considerations

### 8.1 Transport Security
- **HTTPS Only:** All communication encrypted in transit
- **TLS 1.3:** Modern encryption protocols
- **Certificate Pinning:** For mobile applications
- **HSTS Headers:** Enforce HTTPS connections

### 8.2 Authentication Security
- **Strong Passwords:** Minimum 8 characters, complexity requirements
- **Token Expiration:** Access tokens expire after 1 hour
- **Refresh Tokens:** Longer-lived, can be revoked
- **Rate Limiting:** Prevent brute force attacks

### 8.3 Data Security
- **Input Validation:** All inputs validated and sanitized
- **Output Encoding:** Prevent XSS attacks
- **SQL Injection Prevention:** Parameterized queries
- **CORS Configuration:** Proper cross-origin policies

### 8.4 API Security Best Practices
- **Principle of Least Privilege:** Minimal required permissions
- **Audit Logging:** All API access logged
- **IP Whitelisting:** Restrict access by IP (optional)
- **Request Signing:** HMAC signatures for critical operations

## 9. Example Usage

### 9.1 JavaScript/Node.js Example
\`\`\`javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Get users
async function getUsers() {
  try {
    const response = await apiClient.get('/users?page=1&limit=10');
    console.log('Users:', response.data.data.users);
  } catch (error) {
    console.error('Error:', error.response.data.error);
  }
}

// Create user
async function createUser(userData) {
  try {
    const response = await apiClient.post('/users', userData);
    console.log('Created user:', response.data.data);
  } catch (error) {
    console.error('Error:', error.response.data.error);
  }
}
\`\`\`

### 9.2 Python Example
\`\`\`python
import requests
import json

class APIClient:
    def __init__(self, api_key):
        self.base_url = 'https://api.example.com/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_users(self, page=1, limit=10):
        response = requests.get(
            f'{self.base_url}/users',
            headers=self.headers,
            params={'page': page, 'limit': limit}
        )
        return response.json()
    
    def create_user(self, user_data):
        response = requests.post(
            f'{self.base_url}/users',
            headers=self.headers,
            json=user_data
        )
        return response.json()

# Usage
client = APIClient('YOUR_API_KEY')
users = client.get_users()
print(users['data']['users'])
\`\`\`

### 9.3 cURL Examples
\`\`\`bash
# Get users
curl -X GET "https://api.example.com/v1/users?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Create user
curl -X POST "https://api.example.com/v1/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'

# Update user
curl -X PUT "https://api.example.com/v1/users/123e4567-e89b-12d3-a456-426614174000" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Smith"
  }'
\`\`\`

## 10. Testing Guidelines

### 10.1 Testing Environment
- **Base URL:** \`https://api-staging.example.com/v1\`
- **Test API Keys:** Available through developer dashboard
- **Test Data:** Pre-populated test accounts and resources
- **Rate Limits:** Higher limits for testing

### 10.2 Test Cases
- **Happy Path:** Test successful operations
- **Error Scenarios:** Test error handling and responses
- **Edge Cases:** Test boundary conditions
- **Security Tests:** Test authentication and authorization
- **Performance Tests:** Test response times and throughput

### 10.3 Postman Collection
A comprehensive Postman collection is available with:
- Pre-configured requests for all endpoints
- Environment variables for easy configuration
- Test scripts for response validation
- Example requests and responses

**Download:** [Postman Collection Link]

### 10.4 API Testing Tools
- **Postman:** Manual testing and collection sharing
- **Newman:** Command-line collection runner
- **Insomnia:** Alternative REST client
- **Swagger UI:** Interactive API documentation
- **Jest/Mocha:** Automated testing frameworks

## 11. SDKs and Libraries

### 11.1 Official SDKs
- **JavaScript/Node.js:** \`npm install ${projectName.toLowerCase()}-api-client\`
- **Python:** \`pip install ${projectName.toLowerCase()}-api-python\`
- **PHP:** \`composer require ${projectName.toLowerCase()}/api-client\`
- **Ruby:** \`gem install ${projectName.toLowerCase()}_api\`

### 11.2 Community SDKs
- **Go:** Community-maintained Go client
- **Java:** Community-maintained Java client
- **C#:** Community-maintained .NET client

### 11.3 SDK Features
- **Automatic Authentication:** Handle API key management
- **Request/Response Mapping:** Type-safe request/response objects
- **Error Handling:** Consistent error handling across languages
- **Retry Logic:** Built-in retry mechanisms
- **Rate Limit Handling:** Automatic rate limit respect

## 12. Changelog and Migration

### 12.1 Version History
- **v1.0.0** (2025-06-17): Initial API release
- **v0.9.0** (2025-05-15): Beta release
- **v0.8.0** (2025-04-10): Alpha release

### 12.2 Breaking Changes
When breaking changes are introduced:
1. **Advance Notice:** 6 months minimum
2. **Migration Guide:** Detailed upgrade instructions
3. **Parallel Support:** Old and new versions supported
4. **Deprecation Timeline:** Clear sunset schedule

### 12.3 Migration Support
- **Documentation:** Step-by-step migration guides
- **Tools:** Migration scripts and utilities
- **Support:** Dedicated migration support team
- **Testing:** Sandbox environment for testing

## 13. Support and Resources

### 13.1 Getting Help
- **Documentation:** [https://docs.api.example.com]
- **Support Email:** [api-support@example.com]
- **Developer Forum:** [https://forum.example.com]
- **Status Page:** [https://status.api.example.com]

### 13.2 Resources
- **API Reference:** Interactive API documentation
- **Tutorials:** Step-by-step guides
- **Code Examples:** Sample implementations
- **Best Practices:** API usage recommendations

### 13.3 Developer Tools
- **API Explorer:** Interactive API testing tool
- **Request Builder:** Visual request construction
- **Response Inspector:** Detailed response analysis
- **Performance Monitor:** API performance metrics

## 14. Appendices

### Appendix A: OpenAPI Specification
\`\`\`yaml
openapi: 3.0.3
info:
  title: ${projectName} API
  description: ${projectDescription}
  version: 1.0.0
  contact:
    email: api-support@example.com
servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://api-staging.example.com/v1
    description: Staging server
\`\`\`

### Appendix B: Glossary
- **API:** Application Programming Interface
- **REST:** Representational State Transfer
- **JWT:** JSON Web Token
- **OAuth:** Open Authorization framework
- **CORS:** Cross-Origin Resource Sharing
- **HTTPS:** HTTP Secure
- **UUID:** Universally Unique Identifier

### Appendix C: HTTP Methods
- **GET:** Retrieve data (safe, idempotent)
- **POST:** Create new resources
- **PUT:** Update/replace entire resource (idempotent)
- **PATCH:** Partial resource update
- **DELETE:** Remove resource (idempotent)
- **OPTIONS:** Check available methods
- **HEAD:** Get headers without body

### Appendix D: Status Code Reference
Complete list of HTTP status codes used by the API with descriptions and usage scenarios.

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **API Team Contact:** [api-team@example.com]
- **Version History:**
  - v1.0 - Initial comprehensive API documentation
`;
  }
}
