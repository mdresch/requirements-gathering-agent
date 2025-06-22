import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error handling middleware for ADPA API
 */

// Async handler wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    
    console.error('API Error:', {
        requestId,
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Default error response
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = error.message;
    } else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        errorCode = 'AUTHENTICATION_REQUIRED';
        message = 'Authentication required';
    } else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        errorCode = 'ACCESS_DENIED';
        message = 'Insufficient permissions';
    } else if (error.name === 'NotFoundError') {
        statusCode = 404;
        errorCode = 'RESOURCE_NOT_FOUND';
        message = error.message || 'Resource not found';
    } else if (error.name === 'ConflictError') {
        statusCode = 409;
        errorCode = 'RESOURCE_CONFLICT';
        message = error.message;
    } else if (error.name === 'RateLimitError') {
        statusCode = 429;
        errorCode = 'RATE_LIMIT_EXCEEDED';
        message = 'Rate limit exceeded';
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            errorId: uuidv4(),
            timestamp: new Date().toISOString(),
            resolution: getResolutionAdvice(errorCode),
            documentationUrl: `https://docs.adpa.io/errors/${errorCode.toLowerCase()}`
        },
        requestId
    });
}

export function notFoundHandler(req: Request, res: Response) {
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    
    res.status(404).json({
        success: false,
        error: {
            code: 'ENDPOINT_NOT_FOUND',
            message: `Endpoint ${req.method} ${req.path} not found`,
            timestamp: new Date().toISOString(),
            resolution: 'Check the API documentation for valid endpoints',
            documentationUrl: 'https://docs.adpa.io/api'
        },
        requestId
    });
}

function getResolutionAdvice(errorCode: string): string {
    const resolutions: Record<string, string> = {
        'VALIDATION_ERROR': 'Check request format and required fields',
        'AUTHENTICATION_REQUIRED': 'Provide a valid API key in the Authorization header',
        'ACCESS_DENIED': 'Ensure your API key has the required permissions',
        'RESOURCE_NOT_FOUND': 'Verify the resource ID and try again',
        'RESOURCE_CONFLICT': 'Check for duplicate names or conflicting operations',
        'RATE_LIMIT_EXCEEDED': 'Reduce request frequency or upgrade your plan',
        'INTERNAL_ERROR': 'Contact support if the problem persists'
    };

    return resolutions[errorCode] || 'Contact support for assistance';
}
