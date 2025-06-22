# TypeSpec Implementation Guide for ADPA

## Getting Started with TypeSpec

This guide provides step-by-step instructions for implementing TypeSpec in the ADPA project to create a professional API-first document processing platform.

## Installation and Setup

### 1. Install TypeSpec

```bash
# Install TypeSpec compiler and emitters
npm install -g @typespec/compiler
npm install --save-dev @typespec/http @typespec/rest @typespec/openapi3
```

### 2. Initialize TypeSpec Project

```bash
# Create TypeSpec configuration in your project
mkdir api-specs
cd api-specs
tsp init
```

### 3. Project Structure

```
adpa-api-specs/
├── tspconfig.yaml           # TypeSpec configuration
├── main.tsp                 # Main API specification
├── models/
│   ├── common.tsp          # Shared types and models
│   ├── document.tsp        # Document processing models
│   ├── template.tsp        # Template management models
│   └── errors.tsp          # Error handling models
├── services/
│   ├── document-api.tsp    # Document processing endpoints
│   ├── template-api.tsp    # Template management endpoints
│   └── health-api.tsp      # Health check endpoints
└── generated/
    ├── openapi/            # Generated OpenAPI specs
    └── clients/            # Generated client SDKs
```

## Core ADPA API Specification

### 1. Main TypeSpec File (`main.tsp`)

```typescript
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "ADPA Document Processing API",
  version: "1.0.0",
  description: "Professional document processing and conversion API"
})
@server("https://api.adpa.io", "Production server")
@server("https://api-staging.adpa.io", "Staging server")
namespace ADPA;

// Import models and services
import "./models/common.tsp";
import "./models/document.tsp";
import "./models/template.tsp";
import "./models/errors.tsp";
import "./services/document-api.tsp";
import "./services/template-api.tsp";
import "./services/health-api.tsp";
```

### 2. Common Models (`models/common.tsp`)

```typescript
namespace ADPA.Models;

/**
 * Standard API response wrapper
 */
model ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetail;
  timestamp: utcDateTime;
  requestId: string;
}

/**
 * Pagination parameters
 */
model PaginationParams {
  @query page?: int32 = 1;
  @query limit?: int32 = 20;
  @query sort?: string;
  @query order?: "asc" | "desc" = "asc";
}

/**
 * Pagination response
 */
model PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: int32;
    limit: int32;
    total: int32;
    totalPages: int32;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Metadata for documents
 */
model DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  createdAt?: utcDateTime;
  modifiedAt?: utcDateTime;
  tags?: string[];
  customProperties?: Record<string>;
}

/**
 * Processing status enumeration
 */
enum ProcessingStatus {
  queued: "queued",
  processing: "processing",
  completed: "completed",
  failed: "failed",
  cancelled: "cancelled"
}
```

### 3. Document Processing Models (`models/document.tsp`)

```typescript
namespace ADPA.Models;

/**
 * Supported input formats
 */
enum InputFormat {
  markdown: "markdown",
  html: "html", 
  docx: "docx",
  txt: "txt"
}

/**
 * Supported output formats
 */
enum OutputFormat {
  pdf: "pdf",
  docx: "docx",
  html: "html",
  pptx: "pptx"
}

/**
 * Document conversion request
 */
model DocumentConversionRequest {
  /**
   * Source document content or URL
   */
  @minLength(1)
  content: string;

  /**
   * Input format of the source document
   */
  inputFormat: InputFormat;

  /**
   * Desired output format
   */
  outputFormat: OutputFormat;

  /**
   * Template to use for conversion
   */
  templateId?: string;

  /**
   * Document metadata
   */
  metadata?: DocumentMetadata;

  /**
   * Conversion options
   */
  options?: ConversionOptions;

  /**
   * Webhook URL for completion notification
   */
  webhookUrl?: url;
}

/**
 * Conversion options
 */
model ConversionOptions {
  /**
   * Page size for PDF output
   */
  pageSize?: "A4" | "A3" | "Letter" | "Legal";

  /**
   * Page orientation
   */
  orientation?: "portrait" | "landscape";

  /**
   * Include table of contents
   */
  includeTableOfContents?: boolean;

  /**
   * Include page numbers
   */
  includePageNumbers?: boolean;

  /**
   * Custom CSS for styling
   */
  customCss?: string;

  /**
   * DPI for image rendering
   */
  dpi?: int32;

  /**
   * Compression level (0-9)
   */
  compression?: int32;

  /**
   * Password protection
   */
  password?: string;
}

/**
 * Document conversion response
 */
model DocumentConversionResponse {
  /**
   * Unique job identifier
   */
  jobId: string;

  /**
   * Current processing status
   */
  status: ProcessingStatus;

  /**
   * Download URL (available when completed)
   */
  downloadUrl?: url;

  /**
   * File size in bytes
   */
  fileSize?: int64;

  /**
   * Processing progress (0-100)
   */
  progress?: int32;

  /**
   * Estimated completion time
   */
  estimatedCompletion?: utcDateTime;

  /**
   * Created timestamp
   */
  createdAt: utcDateTime;

  /**
   * Completed timestamp
   */
  completedAt?: utcDateTime;

  /**
   * Error details if failed
   */
  error?: ProcessingError;
}

/**
 * Processing error details
 */
model ProcessingError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}

/**
 * Batch conversion request
 */
model BatchConversionRequest {
  /**
   * List of documents to convert
   */
  @minItems(1)
  @maxItems(100)
  documents: DocumentConversionRequest[];

  /**
   * Batch processing options
   */
  options?: BatchOptions;
}

/**
 * Batch processing options
 */
model BatchOptions {
  /**
   * Maximum parallel conversions
   */
  maxParallel?: int32;

  /**
   * Continue on individual failures
   */
  continueOnError?: boolean;

  /**
   * Batch completion webhook
   */
  webhookUrl?: url;
}

/**
 * Batch conversion response
 */
model BatchConversionResponse {
  /**
   * Batch job identifier
   */
  batchId: string;

  /**
   * Individual job responses
   */
  jobs: DocumentConversionResponse[];

  /**
   * Overall batch status
   */
  status: ProcessingStatus;

  /**
   * Batch progress (0-100)
   */
  progress: int32;

  /**
   * Created timestamp
   */
  createdAt: utcDateTime;
}
```

### 4. Document Processing API (`services/document-api.tsp`)

```typescript
namespace ADPA.Services;

using ADPA.Models;

@tag("Document Processing")
@route("/api/v1/documents")
interface DocumentAPI {
  /**
   * Convert a single document
   */
  @post
  @route("/convert")
  convertDocument(
    @body request: DocumentConversionRequest
  ): ApiResponse<DocumentConversionResponse>;

  /**
   * Convert multiple documents in batch
   */
  @post
  @route("/batch/convert")
  batchConvert(
    @body request: BatchConversionRequest
  ): ApiResponse<BatchConversionResponse>;

  /**
   * Get conversion job status
   */
  @get
  @route("/jobs/{jobId}")
  getJobStatus(
    @path jobId: string
  ): ApiResponse<DocumentConversionResponse>;

  /**
   * Get batch conversion status
   */
  @get
  @route("/batch/{batchId}")
  getBatchStatus(
    @path batchId: string
  ): ApiResponse<BatchConversionResponse>;

  /**
   * Download converted document
   */
  @get
  @route("/download/{jobId}")
  downloadDocument(
    @path jobId: string
  ): {
    @header("Content-Type") contentType: string;
    @header("Content-Disposition") contentDisposition: string;
    @body content: bytes;
  };

  /**
   * Cancel conversion job
   */
  @delete
  @route("/jobs/{jobId}")
  cancelJob(
    @path jobId: string
  ): ApiResponse<void>;

  /**
   * List conversion jobs
   */
  @get
  @route("/jobs")
  listJobs(
    ...PaginationParams,
    @query status?: ProcessingStatus,
    @query fromDate?: utcDateTime,
    @query toDate?: utcDateTime
  ): ApiResponse<PaginatedResponse<DocumentConversionResponse>>;

  /**
   * Get conversion statistics
   */
  @get
  @route("/stats")
  getStats(
    @query fromDate?: utcDateTime,
    @query toDate?: utcDateTime
  ): ApiResponse<{
    totalJobs: int32;
    successfulJobs: int32;
    failedJobs: int32;
    processingTime: {
      average: int32;
      min: int32;
      max: int32;
    };
    formatBreakdown: Record<int32>;
  }>;
}
```

### 5. Template Management API (`services/template-api.tsp`)

```typescript
namespace ADPA.Services;

using ADPA.Models;

/**
 * Template model
 */
model Template {
  id: string;
  name: string;
  description?: string;
  format: OutputFormat;
  content: string;
  variables?: string[];
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
  version: int32;
  isActive: boolean;
  metadata?: Record<string>;
}

/**
 * Template creation request
 */
model CreateTemplateRequest {
  @minLength(1)
  name: string;
  description?: string;
  format: OutputFormat;
  @minLength(1)
  content: string;
  variables?: string[];
  metadata?: Record<string>;
}

/**
 * Template update request
 */
model UpdateTemplateRequest {
  name?: string;
  description?: string;
  content?: string;
  variables?: string[];
  isActive?: boolean;
  metadata?: Record<string>;
}

@tag("Template Management")
@route("/api/v1/templates")
interface TemplateAPI {
  /**
   * Create a new template
   */
  @post
  createTemplate(
    @body request: CreateTemplateRequest
  ): ApiResponse<Template>;

  /**
   * Get template by ID
   */
  @get
  @route("/{templateId}")
  getTemplate(
    @path templateId: string
  ): ApiResponse<Template>;

  /**
   * Update template
   */
  @put
  @route("/{templateId}")
  updateTemplate(
    @path templateId: string,
    @body request: UpdateTemplateRequest
  ): ApiResponse<Template>;

  /**
   * Delete template
   */
  @delete
  @route("/{templateId}")
  deleteTemplate(
    @path templateId: string
  ): ApiResponse<void>;

  /**
   * List templates
   */
  @get
  listTemplates(
    ...PaginationParams,
    @query format?: OutputFormat,
    @query active?: boolean
  ): ApiResponse<PaginatedResponse<Template>>;

  /**
   * Preview template with sample data
   */
  @post
  @route("/{templateId}/preview")
  previewTemplate(
    @path templateId: string,
    @body data: Record<unknown>
  ): ApiResponse<{
    previewUrl: url;
    expiresAt: utcDateTime;
  }>;
}
```

### 6. Error Models (`models/errors.tsp`)

```typescript
namespace ADPA.Models;

/**
 * Standard error response
 */
model ErrorDetail {
  /**
   * Error code
   */
  code: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Additional error details
   */
  details?: string;

  /**
   * Field-specific errors for validation
   */
  fieldErrors?: Record<string[]>;

  /**
   * Unique error identifier for tracking
   */
  errorId?: string;

  /**
   * Timestamp when error occurred
   */
  timestamp: utcDateTime;
}

/**
 * Error response with proper HTTP status codes
 */
@error
model BadRequestError {
  @statusCode statusCode: 400;
  @body error: ErrorDetail;
}

@error
model UnauthorizedError {
  @statusCode statusCode: 401;
  @body error: ErrorDetail;
}

@error
model ForbiddenError {
  @statusCode statusCode: 403;
  @body error: ErrorDetail;
}

@error
model NotFoundError {
  @statusCode statusCode: 404;
  @body error: ErrorDetail;
}

@error
model UnprocessableEntityError {
  @statusCode statusCode: 422;
  @body error: ErrorDetail;
}

@error
model TooManyRequestsError {
  @statusCode statusCode: 429;
  @body error: ErrorDetail;
}

@error
model InternalServerError {
  @statusCode statusCode: 500;
  @body error: ErrorDetail;
}

@error
model ServiceUnavailableError {
  @statusCode statusCode: 503;
  @body error: ErrorDetail;
}
```

### 7. Health Check API (`services/health-api.tsp`)

```typescript
namespace ADPA.Services;

/**
 * Health check response
 */
model HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: int64;
  checks: {
    database: HealthStatus;
    queue: HealthStatus;
    storage: HealthStatus;
    adobe: HealthStatus;
  };
  timestamp: utcDateTime;
}

/**
 * Individual health status
 */
model HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  responseTime?: int32;
  message?: string;
}

@tag("Health")
@route("/api/v1/health")
interface HealthAPI {
  /**
   * Get service health status
   */
  @get
  getHealth(): HealthCheckResponse;

  /**
   * Get readiness status
   */
  @get
  @route("/ready")
  getReadiness(): {
    ready: boolean;
    timestamp: utcDateTime;
  };

  /**
   * Get liveness status
   */
  @get
  @route("/live")
  getLiveness(): {
    alive: boolean;
    timestamp: utcDateTime;
  };
}
```

## Configuration and Generation

### 1. TypeSpec Configuration (`tspconfig.yaml`)

```yaml
emit:
  - "@typespec/openapi3"
  - "@typespec/json-schema"

options:
  "@typespec/openapi3":
    output-file: "generated/openapi/adpa-api.yaml"
    version: "3.0.3"
    title: "ADPA Document Processing API"
    description: "Professional document processing and conversion API"
  
  "@typespec/json-schema":
    output-dir: "generated/schemas"

linter:
  extends:
    - "@typespec/best-practices"
  rules:
    no-closed-literal-union: "warn"
    require-docs: "error"
```

### 2. Build Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "api:compile": "tsp compile api-specs",
    "api:watch": "tsp compile api-specs --watch",
    "api:format": "tsp format api-specs/**/*.tsp",
    "api:lint": "tsp compile api-specs --no-emit",
    "api:generate-clients": "npm run api:generate-js && npm run api:generate-python",
    "api:generate-js": "openapi-generator-cli generate -i generated/openapi/adpa-api.yaml -g typescript-axios -o generated/clients/typescript",
    "api:generate-python": "openapi-generator-cli generate -i generated/openapi/adpa-api.yaml -g python -o generated/clients/python",
    "api:docs": "redoc-cli build generated/openapi/adpa-api.yaml --output docs/api/index.html"
  }
}
```

### 3. Generate API Artifacts

```bash
# Compile TypeSpec and generate OpenAPI
npm run api:compile

# Generate client SDKs
npm run api:generate-clients

# Generate API documentation
npm run api:docs

# Watch for changes
npm run api:watch
```

## Integration with Existing ADPA

### 1. Express.js Server Implementation

```typescript
// src/api/server.ts
import express from 'express';
import { DocumentController } from './controllers/DocumentController';
import { TemplateController } from './controllers/TemplateController';
import { HealthController } from './controllers/HealthController';

const app = express();
app.use(express.json());

// Document processing routes
app.post('/api/v1/documents/convert', DocumentController.convertDocument);
app.post('/api/v1/documents/batch/convert', DocumentController.batchConvert);
app.get('/api/v1/documents/jobs/:jobId', DocumentController.getJobStatus);
app.get('/api/v1/documents/download/:jobId', DocumentController.downloadDocument);

// Template management routes
app.post('/api/v1/templates', TemplateController.createTemplate);
app.get('/api/v1/templates/:templateId', TemplateController.getTemplate);
app.put('/api/v1/templates/:templateId', TemplateController.updateTemplate);

// Health check routes
app.get('/api/v1/health', HealthController.getHealth);
app.get('/api/v1/health/ready', HealthController.getReadiness);

export { app };
```

### 2. Document Controller Implementation

```typescript
// src/api/controllers/DocumentController.ts
import { Request, Response } from 'express';
import { DocumentConversionRequest, DocumentConversionResponse } from '../generated/types';
import { DocumentProcessor } from '../services/DocumentProcessor';

export class DocumentController {
  static async convertDocument(req: Request, res: Response) {
    try {
      const request: DocumentConversionRequest = req.body;
      const processor = new DocumentProcessor();
      const response = await processor.convertDocument(request);
      
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CONVERSION_FAILED',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  // Additional controller methods...
}
```

## Next Steps

1. **Set up TypeSpec project structure**
2. **Define core API specifications**
3. **Generate OpenAPI documentation**
4. **Implement server controllers**
5. **Generate and test client SDKs**
6. **Deploy API documentation**
7. **Integrate with existing ADPA CLI**

This TypeSpec implementation provides a solid foundation for transforming ADPA into a professional API-first document processing platform with enterprise-grade capabilities.
