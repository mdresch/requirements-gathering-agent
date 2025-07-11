/**
 * Adobe Creative Suite Phase 2 - Enhanced Error Handling
 * 
 * Provides comprehensive error handling, retry logic, and rate limiting
 * for all Adobe Creative Suite API interactions.
 */

import { CreativeSuiteAuthenticator, type AuthenticationResult } from './authenticator.js';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  burstLimit: number;
}

export interface ErrorDetails {
  code: string;
  message: string;
  timestamp: Date;
  context: any;
  isRetryable: boolean;
}

export class EnhancedErrorHandler {
  private retryOptions: RetryOptions;
  private rateLimitConfig: RateLimitConfig;
  private requestQueue: Array<{ timestamp: Date; service: string }> = [];

  constructor(
    retryOptions?: Partial<RetryOptions>,
    rateLimitConfig?: Partial<RateLimitConfig>
  ) {
    this.retryOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryableErrors: [
        'RATE_LIMITED',
        'NETWORK_ERROR',
        'TIMEOUT',
        'SERVER_ERROR',
        'AUTHENTICATION_EXPIRED'
      ],
      ...retryOptions
    };

    this.rateLimitConfig = {
      requestsPerSecond: 10,
      requestsPerMinute: 100,
      burstLimit: 20,
      ...rateLimitConfig
    };
  }

  /**
   * Execute a function with comprehensive error handling and retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    customRetryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    const options = { ...this.retryOptions, ...customRetryOptions };
    let lastError: Error;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        // Check rate limits before executing
        await this.checkRateLimit(context);
        
        // Execute the operation
        const result = await operation();
        
        // Record successful request
        this.recordRequest(context);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        const errorDetails = this.analyzeError(error as Error, context);
        
        // Don't retry if this is the last attempt or error is not retryable
        if (attempt === options.maxRetries || !errorDetails.isRetryable) {
          throw this.enhanceError(lastError, errorDetails, attempt);
        }

        // Calculate delay for next retry
        const delay = this.calculateBackoffDelay(attempt, options);
        
        console.warn(`🔄 Retry attempt ${attempt + 1}/${options.maxRetries} for ${context} after ${delay}ms delay. Error: ${errorDetails.message}`);
        
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw this.enhanceError(lastError!, this.analyzeError(lastError!, context), options.maxRetries);
  }

  /**
   * Check if the request is within rate limits
   */
  private async checkRateLimit(service: string): Promise<void> {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    // Clean old requests
    this.requestQueue = this.requestQueue.filter(req => req.timestamp > oneMinuteAgo);

    // Check rate limits
    const recentRequests = this.requestQueue.filter(req => req.timestamp > oneSecondAgo);
    const minuteRequests = this.requestQueue.length;

    if (recentRequests.length >= this.rateLimitConfig.requestsPerSecond) {
      const waitTime = 1000 - (now.getTime() - recentRequests[0].timestamp.getTime());
      if (waitTime > 0) {
        console.warn(`⏱️ Rate limit hit for ${service}. Waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }

    if (minuteRequests >= this.rateLimitConfig.requestsPerMinute) {
      const waitTime = 60000 - (now.getTime() - this.requestQueue[0].timestamp.getTime());
      if (waitTime > 0) {
        console.warn(`⏱️ Minute rate limit hit for ${service}. Waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }
  }

  /**
   * Record a successful request for rate limiting
   */
  private recordRequest(service: string): void {
    this.requestQueue.push({
      timestamp: new Date(),
      service
    });

    // Keep only recent requests
    const oneMinuteAgo = new Date(Date.now() - 60000);
    this.requestQueue = this.requestQueue.filter(req => req.timestamp > oneMinuteAgo);
  }

  /**
   * Analyze an error to determine if it's retryable and extract details
   */
  private analyzeError(error: Error, context: string): ErrorDetails {
    const errorMessage = error.message.toLowerCase();
    let code = 'UNKNOWN_ERROR';
    let isRetryable = false;

    // Determine error type and retryability
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      code = 'RATE_LIMITED';
      isRetryable = true;
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      code = 'NETWORK_ERROR';
      isRetryable = true;
    } else if (errorMessage.includes('timeout')) {
      code = 'TIMEOUT';
      isRetryable = true;
    } else if (errorMessage.includes('server error') || errorMessage.includes('internal error')) {
      code = 'SERVER_ERROR';
      isRetryable = true;
    } else if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
      code = 'AUTHENTICATION_ERROR';
      isRetryable = errorMessage.includes('expired');
    } else if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
      code = 'CLIENT_ERROR';
      isRetryable = false;
    }

    return {
      code,
      message: error.message,
      timestamp: new Date(),
      context,
      isRetryable: isRetryable && this.retryOptions.retryableErrors.includes(code)
    };
  }

  /**
   * Enhance an error with additional context and details
   */
  private enhanceError(originalError: Error, errorDetails: ErrorDetails, attempts: number): Error {
    const enhancedMessage = `${errorDetails.code}: ${originalError.message} (Context: ${errorDetails.context}, Attempts: ${attempts + 1})`;
    const enhancedError = new Error(enhancedMessage);
    enhancedError.name = errorDetails.code;
    enhancedError.stack = originalError.stack;
    
    // Add custom properties
    (enhancedError as any).originalError = originalError;
    (enhancedError as any).errorDetails = errorDetails;
    (enhancedError as any).attempts = attempts + 1;
    
    return enhancedError;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number, options: RetryOptions): number {
    const baseDelay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.1 * baseDelay; // Add up to 10% jitter
    return Math.min(baseDelay + jitter, options.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): {
    requestsInLastSecond: number;
    requestsInLastMinute: number;
    remainingQuota: number;
  } {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const recentRequests = this.requestQueue.filter(req => req.timestamp > oneSecondAgo);
    const minuteRequests = this.requestQueue.filter(req => req.timestamp > oneMinuteAgo);

    return {
      requestsInLastSecond: recentRequests.length,
      requestsInLastMinute: minuteRequests.length,
      remainingQuota: Math.max(0, this.rateLimitConfig.requestsPerMinute - minuteRequests.length)
    };
  }
}

/**
 * Enhanced Creative Suite Authenticator with error handling
 */
export class RobustCreativeSuiteAuthenticator extends CreativeSuiteAuthenticator {
  private errorHandler: EnhancedErrorHandler;

  constructor(errorHandlerOptions?: {
    retryOptions?: Partial<RetryOptions>;
    rateLimitConfig?: Partial<RateLimitConfig>;
  }) {
    super();
    this.errorHandler = new EnhancedErrorHandler(
      errorHandlerOptions?.retryOptions,
      errorHandlerOptions?.rateLimitConfig
    );
  }

  /**
   * Authenticate with comprehensive error handling and retry logic
   */
  async authenticateWithRetry(): Promise<AuthenticationResult> {
    return this.errorHandler.executeWithRetry(
      () => super.authenticate(),
      'CreativeSuite Authentication',
      {
        maxRetries: 3,
        retryableErrors: ['AUTHENTICATION_EXPIRED', 'NETWORK_ERROR', 'RATE_LIMITED']
      }
    );
  }

  /**
   * Get rate limit status for authentication requests
   */
  getAuthRateLimitStatus() {
    return this.errorHandler.getRateLimitStatus();
  }
}

/**
 * Enhanced API Client wrapper with error handling
 */
export class RobustAPIClient {
  private errorHandler: EnhancedErrorHandler;
  private authenticator: RobustCreativeSuiteAuthenticator;

  constructor(
    authenticator?: RobustCreativeSuiteAuthenticator,
    errorHandlerOptions?: {
      retryOptions?: Partial<RetryOptions>;
      rateLimitConfig?: Partial<RateLimitConfig>;
    }
  ) {
    this.authenticator = authenticator || new RobustCreativeSuiteAuthenticator();
    this.errorHandler = new EnhancedErrorHandler(
      errorHandlerOptions?.retryOptions,
      errorHandlerOptions?.rateLimitConfig
    );
  }

  /**
   * Execute any API call with comprehensive error handling
   */
  async executeAPICall<T>(
    apiCall: () => Promise<T>,
    context: string,
    customRetryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.errorHandler.executeWithRetry(apiCall, context, customRetryOptions);
  }

  /**
   * Get comprehensive API health status
   */
  async getHealthStatus(): Promise<{
    authentication: 'healthy' | 'warning' | 'error';
    rateLimits: ReturnType<EnhancedErrorHandler['getRateLimitStatus']>;
    lastError?: ErrorDetails;
  }> {
    try {
      await this.authenticator.authenticateWithRetry();
      return {
        authentication: 'healthy',
        rateLimits: this.errorHandler.getRateLimitStatus()
      };
    } catch (error) {
      const errorDetails = (this.errorHandler as any).analyzeError(error, 'Health Check');
      return {
        authentication: errorDetails.isRetryable ? 'warning' : 'error',
        rateLimits: this.errorHandler.getRateLimitStatus(),
        lastError: errorDetails
      };
    }
  }
}


