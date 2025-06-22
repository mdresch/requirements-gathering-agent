using TypeSpec.Http;

/**
 * Standard error response structure
 */
model ErrorDetail {
  /**
   * Machine-readable error code
   */
  code: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Additional error details and context
   */
  details?: string;

  /**
   * Field-specific validation errors
   */
  fieldErrors?: Record<string[]>;

  /**
   * Unique error identifier for support tracking
   */
  errorId?: string;

  /**
   * Error occurrence timestamp
   */
  timestamp: utcDateTime;

  /**
   * Suggested resolution steps
   */
  resolution?: string;

  /**
   * Link to documentation for this error
   */
  documentationUrl?: url;
}

/**
 * 400 Bad Request - Invalid request format or parameters
 */
@error
model BadRequestError {
  @statusCode statusCode: 400;
  @body error: ErrorDetail;
}

/**
 * 401 Unauthorized - Authentication required
 */
@error
model UnauthorizedError {
  @statusCode statusCode: 401;
  @body error: ErrorDetail;
}

/**
 * 403 Forbidden - Insufficient permissions
 */
@error
model ForbiddenError {
  @statusCode statusCode: 403;
  @body error: ErrorDetail;
}

/**
 * 404 Not Found - Resource does not exist
 */
@error
model NotFoundError {
  @statusCode statusCode: 404;
  @body error: ErrorDetail;
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate names)
 */
@error
model ConflictError {
  @statusCode statusCode: 409;
  @body error: ErrorDetail;
}

/**
 * 422 Unprocessable Entity - Request format valid but semantically incorrect
 */
@error
model UnprocessableEntityError {
  @statusCode statusCode: 422;
  @body error: ErrorDetail;
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
@error
model TooManyRequestsError {
  @statusCode statusCode: 429;
  @body error: ErrorDetail;
  
  /**
   * Rate limit headers
   */
  @header("Retry-After") retryAfter?: int32;
  @header("X-RateLimit-Limit") rateLimitLimit?: int32;
  @header("X-RateLimit-Remaining") rateLimitRemaining?: int32;
  @header("X-RateLimit-Reset") rateLimitReset?: int32;
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
@error
model InternalServerError {
  @statusCode statusCode: 500;
  @body error: ErrorDetail;
}

/**
 * 502 Bad Gateway - Upstream service error
 */
@error
model BadGatewayError {
  @statusCode statusCode: 502;
  @body error: ErrorDetail;
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
@error
model ServiceUnavailableError {
  @statusCode statusCode: 503;
  @body error: ErrorDetail;
  
  /**
   * Expected service recovery time
   */
  @header("Retry-After") retryAfter?: int32;
}

/**
 * 507 Insufficient Storage - Storage quota exceeded
 */
@error
model InsufficientStorageError {
  @statusCode statusCode: 507;
  @body error: ErrorDetail;
}

/**
 * Common error codes used throughout the API
 */
enum ErrorCode {
  // Validation errors
  INVALID_REQUEST: "INVALID_REQUEST",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FIELD_VALUE: "INVALID_FIELD_VALUE", 
  INVALID_FORMAT: "INVALID_FORMAT",

  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCESS_DENIED: "ACCESS_DENIED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Resource errors
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  RESOURCE_LOCKED: "RESOURCE_LOCKED",

  // Processing errors
  CONVERSION_FAILED: "CONVERSION_FAILED",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  PROCESSING_TIMEOUT: "PROCESSING_TIMEOUT",
  TEMPLATE_RENDERING_FAILED: "TEMPLATE_RENDERING_FAILED",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",

  // Service errors
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  UPSTREAM_SERVICE_ERROR: "UPSTREAM_SERVICE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",

  // Storage errors
  STORAGE_ERROR: "STORAGE_ERROR",
  INSUFFICIENT_STORAGE: "INSUFFICIENT_STORAGE",
  FILE_ACCESS_ERROR: "FILE_ACCESS_ERROR"
}
