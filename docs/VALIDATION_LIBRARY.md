# Enhanced Validation Library Documentation

## Overview

The Enhanced Validation Library is a comprehensive validation system built for Phase 2 Structure implementation. It provides robust input validation, sanitization, and error handling across all API endpoints.

## Features

- **Comprehensive Joi Schemas**: Detailed validation rules for all models
- **Enhanced Middleware**: Advanced validation middleware with error handling
- **Input Sanitization**: XSS, NoSQL injection, and command injection protection
- **Standardized Error Responses**: Consistent error message format
- **Type Safety**: Full TypeScript support with proper typing
- **Performance Optimized**: Efficient validation with minimal overhead

## Architecture

### Core Components

1. **Validation Schemas** (`src/validation/schemas.ts`)
2. **Validation Middleware** (`src/middleware/validation.ts`)
3. **Validation Utilities** (`src/validation/utils.ts`)
4. **Route Integration** (`src/routes/`)

### File Structure

```
src/
├── validation/
│   ├── schemas.ts          # Joi validation schemas
│   ├── utils.ts            # Validation utilities
│   └── index.ts            # Centralized exports
├── middleware/
│   ├── validation.ts       # Enhanced validation middleware
│   └── sanitization.ts     # Input sanitization
└── routes/
    ├── templates.ts        # Template routes with validation
    ├── projects.ts         # Project routes with validation
    ├── feedback.ts         # Feedback routes with validation
    ├── categories.ts       # Category routes with validation
    └── index.ts            # Main router
```

## Validation Schemas

### Common Schemas

The validation library provides common validation patterns:

```typescript
import { commonSchemas } from '../validation/schemas.js';

// ObjectId validation
commonSchemas.objectId

// Pagination validation
commonSchemas.pagination

// Email validation
commonSchemas.email

// URL validation
commonSchemas.url

// Phone validation
commonSchemas.phone

// Priority validation
commonSchemas.priority

// Status validation
commonSchemas.status

// Severity validation
commonSchemas.severity

// Rating validation
commonSchemas.rating

// Percentage validation
commonSchemas.percentage

// Date validation
commonSchemas.date

// Future date validation
commonSchemas.futureDate

// Past date validation
commonSchemas.pastDate
```

### Model-Specific Schemas

#### Template Schemas

```typescript
import { templateSchemas } from '../validation/schemas.js';

// Create template validation
templateSchemas.create

// Update template validation
templateSchemas.update
```

#### Project Schemas

```typescript
import { projectSchemas } from '../validation/schemas.js';

// Create project validation
projectSchemas.create

// Update project validation
projectSchemas.update
```

#### Feedback Schemas

```typescript
import { feedbackSchemas } from '../validation/schemas.js';

// Create feedback validation
feedbackSchemas.create

// Update feedback validation
feedbackSchemas.update
```

#### Category Schemas

```typescript
import { categorySchemas } from '../validation/schemas.js';

// Create category validation
categorySchemas.create

// Update category validation
categorySchemas.update
```

#### Audit Trail Schemas

```typescript
import { auditTrailSchemas } from '../validation/schemas.js';

// Create audit trail validation
auditTrailSchemas.create
```

#### Authentication Schemas

```typescript
import { authSchemas } from '../validation/schemas.js';

// User registration validation
authSchemas.register

// User login validation
authSchemas.login
```

## Validation Middleware

### Basic Validation

```typescript
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';

// Validate request body
router.post('/endpoint', validateBody(schema), handler);

// Validate query parameters
router.get('/endpoint', validateQuery(schema), handler);

// Validate URL parameters
router.get('/endpoint/:id', validateParams(schema), handler);
```

### Advanced Validation

```typescript
import { validate } from '../middleware/validation.js';

// Validate multiple parts of request
router.post('/endpoint', 
  validate({
    body: bodySchema,
    params: paramsSchema,
    query: querySchema
  }), 
  handler
);
```

### File Upload Validation

```typescript
import { validateFileUpload } from '../middleware/validation.js';

// Validate file uploads
router.post('/upload', 
  validateFileUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    required: true
  }),
  handler
);
```

### Request Size Validation

```typescript
import { validateRequestSize } from '../middleware/validation.js';

// Validate request size
router.post('/endpoint', 
  validateRequestSize(5 * 1024 * 1024), // 5MB
  handler
);
```

### JSON Validation

```typescript
import { validateJSON } from '../middleware/validation.js';

// Validate JSON content type
router.post('/endpoint', 
  validateJSON(),
  handler
);
```

### Common Validation Combinations

```typescript
import { commonValidations } from '../middleware/validation.js';

// Validate ObjectId parameter
router.get('/endpoint/:id', 
  commonValidations.objectIdParam('id'),
  handler
);

// Validate pagination query
router.get('/endpoint', 
  commonValidations.paginationQuery(),
  handler
);

// Validate search query
router.get('/endpoint', 
  commonValidations.searchQuery(),
  handler
);
```

## Error Handling

### Validation Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address",
        "value": "invalid-email"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Codes

- `VALIDATION_ERROR`: General validation failure
- `REQUEST_TOO_LARGE`: Request payload too large
- `INVALID_CONTENT_TYPE`: Invalid content type
- `FILE_TOO_LARGE`: File size exceeds limit
- `INVALID_FILE_TYPE`: Invalid file type

## Usage Examples

### Complete Route Implementation

```typescript
import { Router, Request, Response } from 'express';
import { TemplateModel } from '../models/Template.model.js';
import { sanitizeInput } from '../middleware/sanitization.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import { templateSchemas, commonSchemas } from '../validation/schemas.js';
import Joi from 'joi';
import { toObjectId, transformDocument, createSuccessResponse } from '../utils/idUtils.js';

const router = Router();

// GET /api/v1/templates
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    search: Joi.string().trim().max(100).optional(),
    category: Joi.string().trim().max(50).optional(),
    is_active: Joi.boolean().optional()
  })),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      // Route logic here
      const response = createSuccessResponse(data);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve templates'
        }
      });
    }
  }
);

// POST /api/v1/templates
router.post('/',
  validateBody(templateSchemas.create),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      // Route logic here
      const response = createSuccessResponse(data);
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create template'
        }
      });
    }
  }
);

export default router;
```

### Custom Validation

```typescript
import Joi from 'joi';

// Custom validation schema
const customSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120).required()
});

// Use in route
router.post('/custom', 
  validateBody(customSchema),
  handler
);
```

## Validation Utilities

### Utility Functions

```typescript
import { 
  isValidObjectId,
  isValidEmail,
  isValidUrl,
  isValidPhoneNumber,
  isValidPassword,
  sanitizeString,
  sanitizeHTML,
  createValidationErrorResponse,
  createSuccessResponse
} from '../validation/utils.js';

// Validate ObjectId
const isValid = isValidObjectId('507f1f77bcf86cd799439011');

// Validate email
const isEmailValid = isValidEmail('user@example.com');

// Validate URL
const isUrlValid = isValidUrl('https://example.com');

// Validate phone number
const isPhoneValid = isValidPhoneNumber('+1234567890');

// Validate password strength
const passwordValidation = isValidPassword('MySecure123!');
console.log(passwordValidation.valid); // true/false
console.log(passwordValidation.errors); // array of errors

// Sanitize strings
const sanitized = sanitizeString('<script>alert("xss")</script>');

// Create responses
const errorResponse = createValidationErrorResponse(errors);
const successResponse = createSuccessResponse(data);
```

## Testing

### Unit Testing Validation Schemas

```typescript
import { templateSchemas } from '../validation/schemas.js';

describe('Template Validation', () => {
  test('should validate valid template data', () => {
    const validData = {
      name: 'Test Template',
      description: 'A test template',
      category: 'test',
      documentKey: 'test-template',
      template_type: 'document',
      ai_instructions: 'Generate test content',
      prompt_template: 'Create a test document',
      generation_function: 'generateTest'
    };

    const { error } = templateSchemas.create.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should reject invalid template data', () => {
    const invalidData = {
      name: '', // Empty name should fail
      description: 'A test template'
    };

    const { error } = templateSchemas.create.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('Template name is required');
  });
});
```

### Integration Testing

```typescript
import request from 'supertest';
import app from '../app.js';

describe('Template Routes', () => {
  test('POST /api/v1/templates should validate input', async () => {
    const invalidData = {
      name: '', // Invalid: empty name
      description: 'Test description'
    };

    const response = await request(app)
      .post('/api/v1/templates')
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details[0].field).toBe('name');
  });
});
```

## Performance Considerations

### Optimization Tips

1. **Use `stripUnknown: true`**: Removes unknown fields during validation
2. **Cache schemas**: Reuse validation schemas across requests
3. **Early validation**: Validate input as early as possible in the request pipeline
4. **Minimize validation depth**: Keep nested validation to a minimum
5. **Use indexes**: Ensure database queries are optimized

### Monitoring

Monitor validation performance using:

```typescript
import { logger } from '../utils/logger.js';

// Log validation performance
const startTime = Date.now();
const { error, value } = schema.validate(data);
const duration = Date.now() - startTime;

if (duration > 100) { // Log slow validations
  logger.warn('Slow validation detected', {
    duration,
    schema: schema.describe().type,
    dataSize: JSON.stringify(data).length
  });
}
```

## Security Features

### Input Sanitization

The validation library includes comprehensive input sanitization:

- **XSS Protection**: Removes script tags and dangerous HTML
- **NoSQL Injection Prevention**: Strips MongoDB operators
- **Command Injection Protection**: Sanitizes shell commands
- **SQL Injection Prevention**: Validates and escapes SQL queries

### Security Headers

```typescript
import helmet from 'helmet';

// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## Best Practices

### 1. Always Validate Input

```typescript
// Good: Validate all input
router.post('/endpoint', validateBody(schema), handler);

// Bad: No validation
router.post('/endpoint', handler);
```

### 2. Use Specific Error Messages

```typescript
// Good: Specific error message
Joi.string().required().messages({
  'any.required': 'User name is required'
});

// Bad: Generic error message
Joi.string().required();
```

### 3. Sanitize Before Validation

```typescript
// Good: Sanitize then validate
router.post('/endpoint', 
  sanitizeInput,
  validateBody(schema),
  handler
);
```

### 4. Handle Validation Errors Gracefully

```typescript
// Good: Proper error handling
try {
  const { error, value } = schema.validate(data);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: error.details
      }
    });
  }
  // Process valid data
} catch (err) {
  logger.error('Validation error:', err);
  res.status(500).json({ success: false, error: 'Internal error' });
}
```

### 5. Use TypeScript for Type Safety

```typescript
// Good: Type-safe validation
interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
}

const schema = Joi.object<CreateTemplateRequest>({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required()
});
```

## Migration Guide

### From Express Validator to Joi

```typescript
// Old: Express Validator
import { body, validationResult } from 'express-validator';

router.post('/endpoint', [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Handle request
});

// New: Joi Validation
import { validateBody } from '../middleware/validation.js';
import { templateSchemas } from '../validation/schemas.js';

router.post('/endpoint', 
  validateBody(templateSchemas.create),
  (req, res) => {
    // Handle request - req.body is already validated and sanitized
  }
);
```

## Troubleshooting

### Common Issues

1. **Validation not working**: Ensure middleware is applied in correct order
2. **Type errors**: Check TypeScript types match Joi schema
3. **Performance issues**: Monitor validation duration and optimize schemas
4. **Error messages not helpful**: Customize error messages in schemas

### Debug Mode

Enable debug logging:

```typescript
import { logger } from '../utils/logger.js';

// Enable debug logging
logger.level = 'debug';

// Log validation details
const { error, value } = schema.validate(data, { 
  debug: true,
  abortEarly: false 
});
```

## Conclusion

The Enhanced Validation Library provides a robust, secure, and performant validation system for the Requirements Gathering Agent API. It ensures data integrity, prevents security vulnerabilities, and provides excellent developer experience with comprehensive error handling and TypeScript support.

For more information, refer to the individual schema files and middleware implementations in the `src/validation/` and `src/middleware/` directories.
