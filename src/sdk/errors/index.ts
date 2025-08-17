/**
 * SDK Error Classes
 * 
 * Comprehensive error handling for the Requirements Gathering Agent SDK.
 * Provides specific error types for different failure scenarios.
 */

/**
 * Base SDK Error class
 */
export class SDKError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly details?: any;

  constructor(code: string, message: string, details?: any, requestId?: string) {
    super(message);
    this.name = 'SDKError';
    this.code = code;
    this.timestamp = new Date();
    this.details = details;
    this.requestId = requestId;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, SDKError.prototype);
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON(): any {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      requestId: this.requestId,
      details: this.details,
      stack: this.stack
    };
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends SDKError {
  public readonly configPath?: string;

  constructor(message: string, configPath?: string, details?: any) {
    super('CONFIGURATION_ERROR', message, details);
    this.name = 'ConfigurationError';
    this.configPath = configPath;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Validation-related errors
 */
export class ValidationError extends SDKError {
  public readonly field?: string;
  public readonly validationRules?: string[];

  constructor(message: string, field?: string, validationRules?: string[], details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
    this.field = field;
    this.validationRules = validationRules;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Document generation errors
 */
export class DocumentGenerationError extends SDKError {
  public readonly documentType?: string;
  public readonly stage?: string;

  constructor(message: string, documentType?: string, stage?: string, details?: any) {
    super('DOCUMENT_GENERATION_ERROR', message, details);
    this.name = 'DocumentGenerationError';
    this.documentType = documentType;
    this.stage = stage;
    Object.setPrototypeOf(this, DocumentGenerationError.prototype);
  }
}

/**
 * AI processing errors
 */
export class AIProcessingError extends SDKError {
  public readonly provider?: string;
  public readonly model?: string;
  public readonly retryable?: boolean;

  constructor(message: string, provider?: string, model?: string, retryable = false, details?: any) {
    super('AI_PROCESSING_ERROR', message, details);
    this.name = 'AIProcessingError';
    this.provider = provider;
    this.model = model;
    this.retryable = retryable;
    Object.setPrototypeOf(this, AIProcessingError.prototype);
  }
}

/**
 * Template management errors
 */
export class TemplateManagementError extends SDKError {
  public readonly templateId?: string;
  public readonly operation?: string;

  constructor(message: string, templateId?: string, operation?: string, details?: any) {
    super('TEMPLATE_MANAGEMENT_ERROR', message, details);
    this.name = 'TemplateManagementError';
    this.templateId = templateId;
    this.operation = operation;
    Object.setPrototypeOf(this, TemplateManagementError.prototype);
  }
}

/**
 * Integration errors (Confluence, SharePoint, etc.)
 */
export class IntegrationError extends SDKError {
  public readonly integrationType?: string;
  public readonly endpoint?: string;
  public readonly httpStatus?: number;

  constructor(
    message: string, 
    integrationType?: string, 
    endpoint?: string, 
    httpStatus?: number, 
    details?: any
  ) {
    super('INTEGRATION_ERROR', message, details);
    this.name = 'IntegrationError';
    this.integrationType = integrationType;
    this.endpoint = endpoint;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends SDKError {
  public readonly authType?: string;
  public readonly provider?: string;

  constructor(message: string, authType?: string, provider?: string, details?: any) {
    super('AUTHENTICATION_ERROR', message, details);
    this.name = 'AuthenticationError';
    this.authType = authType;
    this.provider = provider;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Network and connectivity errors
 */
export class NetworkError extends SDKError {
  public readonly url?: string;
  public readonly method?: string;
  public readonly statusCode?: number;
  public readonly retryable?: boolean;

  constructor(
    message: string, 
    url?: string, 
    method?: string, 
    statusCode?: number, 
    retryable = true, 
    details?: any
  ) {
    super('NETWORK_ERROR', message, details);
    this.name = 'NetworkError';
    this.url = url;
    this.method = method;
    this.statusCode = statusCode;
    this.retryable = retryable;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * File system and I/O errors
 */
export class FileSystemError extends SDKError {
  public readonly filePath?: string;
  public readonly operation?: string;

  constructor(message: string, filePath?: string, operation?: string, details?: any) {
    super('FILESYSTEM_ERROR', message, details);
    this.name = 'FileSystemError';
    this.filePath = filePath;
    this.operation = operation;
    Object.setPrototypeOf(this, FileSystemError.prototype);
  }
}

/**
 * Plugin system errors
 */
export class PluginError extends SDKError {
  public readonly pluginName?: string;
  public readonly pluginVersion?: string;
  public readonly hook?: string;

  constructor(
    message: string, 
    pluginName?: string, 
    pluginVersion?: string, 
    hook?: string, 
    details?: any
  ) {
    super('PLUGIN_ERROR', message, details);
    this.name = 'PluginError';
    this.pluginName = pluginName;
    this.pluginVersion = pluginVersion;
    this.hook = hook;
    Object.setPrototypeOf(this, PluginError.prototype);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends SDKError {
  public readonly retryAfter?: number;
  public readonly limit?: number;
  public readonly remaining?: number;

  constructor(
    message: string, 
    retryAfter?: number, 
    limit?: number, 
    remaining?: number, 
    details?: any
  ) {
    super('RATE_LIMIT_ERROR', message, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends SDKError {
  public readonly timeoutMs?: number;
  public readonly operation?: string;

  constructor(message: string, timeoutMs?: number, operation?: string, details?: any) {
    super('TIMEOUT_ERROR', message, details);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
    this.operation = operation;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Resource exhaustion errors
 */
export class ResourceExhaustionError extends SDKError {
  public readonly resourceType?: string;
  public readonly limit?: number;
  public readonly current?: number;

  constructor(
    message: string, 
    resourceType?: string, 
    limit?: number, 
    current?: number, 
    details?: any
  ) {
    super('RESOURCE_EXHAUSTION_ERROR', message, details);
    this.name = 'ResourceExhaustionError';
    this.resourceType = resourceType;
    this.limit = limit;
    this.current = current;
    Object.setPrototypeOf(this, ResourceExhaustionError.prototype);
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  /**
   * Create an error from an unknown error object
   */
  static fromUnknown(error: unknown, context?: string): SDKError {
    if (error instanceof SDKError) {
      return error;
    }

    if (error instanceof Error) {
      return new SDKError('UNKNOWN_ERROR', error.message, { originalError: error, context });
    }

    if (typeof error === 'string') {
      return new SDKError('UNKNOWN_ERROR', error, { context });
    }

    return new SDKError('UNKNOWN_ERROR', 'An unknown error occurred', { originalError: error, context });
  }

  /**
   * Create a network error from HTTP response
   */
  static fromHttpResponse(
    response: { status: number; statusText: string; url?: string },
    method = 'GET'
  ): NetworkError {
    const message = `HTTP ${response.status}: ${response.statusText}`;
    const retryable = response.status >= 500 || response.status === 429;
    
    return new NetworkError(
      message,
      response.url,
      method,
      response.status,
      retryable
    );
  }

  /**
   * Create a validation error from validation results
   */
  static fromValidationResults(
    results: Array<{ field: string; message: string; rule?: string }>
  ): ValidationError {
    const messages = results.map(r => `${r.field}: ${r.message}`);
    const fields = results.map(r => r.field);
    const rules = results.map(r => r.rule).filter(Boolean) as string[];
    
    return new ValidationError(
      `Validation failed: ${messages.join(', ')}`,
      fields.join(', '),
      rules,
      { validationResults: results }
    );
  }

  /**
   * Create a timeout error
   */
  static timeout(operation: string, timeoutMs: number): TimeoutError {
    return new TimeoutError(
      `Operation '${operation}' timed out after ${timeoutMs}ms`,
      timeoutMs,
      operation
    );
  }

  /**
   * Create a rate limit error
   */
  static rateLimit(retryAfter?: number, limit?: number, remaining?: number): RateLimitError {
    const message = retryAfter 
      ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
      : 'Rate limit exceeded.';
    
    return new RateLimitError(message, retryAfter, limit, remaining);
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Check if an error is retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof NetworkError) {
      return error.retryable ?? true;
    }
    
    if (error instanceof AIProcessingError) {
      return error.retryable ?? false;
    }
    
    if (error instanceof RateLimitError) {
      return true;
    }
    
    if (error instanceof TimeoutError) {
      return true;
    }
    
    return false;
  }

  /**
   * Get retry delay for an error
   */
  static getRetryDelay(error: Error, attempt: number): number {
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000; // Convert to milliseconds
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }

  /**
   * Format error for logging
   */
  static format(error: Error): string {
    if (error instanceof SDKError) {
      return `[${error.code}] ${error.message}`;
    }
    
    return `[${error.name}] ${error.message}`;
  }

  /**
   * Extract error details for debugging
   */
  static getDetails(error: Error): any {
    if (error instanceof SDKError) {
      return {
        code: error.code,
        timestamp: error.timestamp,
        requestId: error.requestId,
        details: error.details
      };
    }
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
}