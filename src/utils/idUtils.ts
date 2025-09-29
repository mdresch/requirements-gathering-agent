// ID Consistency Utilities
// Provides consistent handling of MongoDB ObjectIds across the application

import mongoose from 'mongoose';

/**
 * Converts a string ID to MongoDB ObjectId
 * @param id - String ID or existing ObjectId
 * @returns MongoDB ObjectId
 */
export const toObjectId = (id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId => {
  if (typeof id === 'string') {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * Converts MongoDB ObjectId to string
 * @param id - ObjectId or string ID
 * @returns String representation of the ID
 */
export const toStringId = (id: mongoose.Types.ObjectId | string): string => {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
};

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - String to validate
 * @returns True if valid ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Transforms a document to include both _id and id fields for backward compatibility
 * @param doc - Document to transform
 * @returns Transformed document with consistent ID fields
 */
export const transformDocument = (doc: any): any => {
  if (!doc) return doc;
  
  const transformed = { ...doc };
  
  // Always include both _id and id for backward compatibility
  if (doc._id) {
    transformed.id = doc._id.toString();
    transformed._id = doc._id.toString();
  }
  
  // Handle nested documents with audit_trail
  if (doc.audit_trail && Array.isArray(doc.audit_trail)) {
    transformed.audit_trail = doc.audit_trail.map((item: any) => ({
      ...item,
      id: item._id ? item._id.toString() : undefined,
      _id: item._id ? item._id.toString() : undefined
    }));
  }
  
  // Handle nested stakeholders array
  if (doc.stakeholders && Array.isArray(doc.stakeholders)) {
    transformed.stakeholders = doc.stakeholders.map((stakeholder: any) => ({
      ...stakeholder,
      id: stakeholder._id ? stakeholder._id.toString() : stakeholder.id,
      _id: stakeholder._id ? stakeholder._id.toString() : stakeholder._id
    }));
  }
  
  // Handle nested documents array
  if (doc.documents && Array.isArray(doc.documents)) {
    transformed.documents = doc.documents.map((document: any) => ({
      ...document,
      id: document._id ? document._id.toString() : document.id,
      _id: document._id ? document._id.toString() : document._id
    }));
  }
  
  return transformed;
};

/**
 * Transforms an array of documents to include consistent ID fields
 * @param docs - Array of documents to transform
 * @returns Array of transformed documents
 */
export const transformDocuments = (docs: any[]): any[] => {
  if (!Array.isArray(docs)) return [];
  return docs.map(transformDocument);
};

/**
 * Creates a MongoDB query object with proper ObjectId handling
 * @param id - String ID to convert to ObjectId
 * @returns Query object with _id field
 */
export const createIdQuery = (id: string): { _id: mongoose.Types.ObjectId } => {
  return { _id: toObjectId(id) };
};

/**
 * Validates and converts ID parameter from request
 * @param id - ID from request parameters
 * @returns ObjectId if valid, throws error if invalid
 */
export const validateAndConvertId = (id: string): mongoose.Types.ObjectId => {
  if (!id) {
    throw new Error('ID parameter is required');
  }
  
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ID format');
  }
  
  return toObjectId(id);
};

/**
 * Creates a consistent error response for ID validation failures
 * @param message - Error message
 * @param code - Error code
 * @returns Standardized error response object
 */
export const createIdErrorResponse = (message: string = 'Invalid ID format', code: string = 'INVALID_ID') => {
  return {
    success: false,
    error: {
      code,
      message
    }
  };
};

/**
 * Handles ID validation errors consistently across endpoints
 * @param error - Error object
 * @param res - Express response object
 * @returns True if error was handled, false otherwise
 */
export const handleIdValidationError = (error: any, res: any): boolean => {
  if (error.message === 'ID parameter is required' || error.message === 'Invalid ID format') {
    res.status(400).json(createIdErrorResponse(error.message, 'INVALID_ID'));
    return true;
  }
  return false;
};

/**
 * Middleware function to validate ObjectId parameters
 * @param paramName - Name of the parameter to validate (default: 'id')
 * @returns Express middleware function
 */
export const validateObjectIdParam = (paramName: string = 'id') => {
  return (req: any, res: any, next: any) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json(createIdErrorResponse(`${paramName} parameter is required`, 'MISSING_ID'));
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(createIdErrorResponse(`Invalid ${paramName} format`, 'INVALID_ID'));
    }
    
    // Add the validated ObjectId to the request for use in route handlers
    req.validatedIds = req.validatedIds || {};
    req.validatedIds[paramName] = toObjectId(id);
    
    next();
  };
};

/**
 * Utility to safely extract and convert multiple ID parameters
 * @param req - Express request object
 * @param paramNames - Array of parameter names to extract
 * @returns Object with converted ObjectIds
 */
export const extractValidatedIds = (req: any, paramNames: string[]): Record<string, mongoose.Types.ObjectId> => {
  const ids: Record<string, mongoose.Types.ObjectId> = {};
  
  for (const paramName of paramNames) {
    const id = req.params[paramName];
    if (id && isValidObjectId(id)) {
      ids[paramName] = toObjectId(id);
    }
  }
  
  return ids;
};

/**
 * Creates a standardized success response with transformed data
 * @param data - Data to include in response
 * @param message - Optional success message
 * @returns Standardized success response
 */
export const createSuccessResponse = (data: any, message?: string) => {
  const response: any = {
    success: true,
    data: Array.isArray(data) ? transformDocuments(data) : transformDocument(data)
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
};

/**
 * Creates a standardized paginated response with transformed data
 * @param data - Array of documents
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @returns Standardized paginated response
 */
export const createPaginatedResponse = (data: any[], pagination: any, message?: string) => {
  const response: any = {
    success: true,
    data: transformDocuments(data),
    pagination
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
};
