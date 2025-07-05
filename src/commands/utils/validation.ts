/**
 * Command Validation Utilities
 * Provides validation functions for CLI command inputs
 */

// 1. Node.js built-ins
import { existsSync } from 'fs';
import { join } from 'path';

// 2. Third-party dependencies (none in this file)

// 3. Internal modules (none in this file)

// 4. Constants
import { SUPPORTED_FORMATS } from '../../constants.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate output directory path
 */
export function validateOutputDirectory(outputDir: string): void {
  if (!outputDir || typeof outputDir !== 'string') {
    throw new ValidationError('Output directory must be a non-empty string');
  }
  
  if (outputDir.includes('..')) {
    throw new ValidationError('Output directory cannot contain ".." path segments');
  }
}

/**
 * Validate output format
 */
export function validateFormat(format: string): void {
  if (!SUPPORTED_FORMATS.includes(format as any)) {
    throw new ValidationError(
      `Invalid format "${format}". Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
    );
  }
}

/**
 * Validate retry count
 */
export function validateRetryCount(retries: number): void {
  if (retries < 0) {
    throw new ValidationError('Retries must be non-negative');
  }
  
  if (retries > 10) {
    throw new ValidationError('Retries cannot exceed 10');
  }
}

/**
 * Validate retry backoff timing
 */
export function validateRetryBackoff(backoff: number): void {
  if (backoff < 0) {
    throw new ValidationError('Retry backoff must be non-negative');
  }
  
  if (backoff > 60000) {
    throw new ValidationError('Retry backoff cannot exceed 60 seconds');
  }
}

/**
 * Validate document key format
 */
export function validateDocumentKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new ValidationError('Document key must be a non-empty string');
  }
  
  // Basic validation - alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    throw new ValidationError(
      'Document key can only contain letters, numbers, hyphens, and underscores'
    );
  }
}

/**
 * Validate category name
 */
export function validateCategory(category: string): void {
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Category must be a non-empty string');
  }
  
  // Basic validation - alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(category)) {
    throw new ValidationError(
      'Category can only contain letters, numbers, hyphens, and underscores'
    );
  }
}

/**
 * Validate file path exists
 */
export function validateFileExists(filePath: string, description: string = 'File'): void {
  if (!existsSync(filePath)) {
    throw new ValidationError(`${description} does not exist: ${filePath}`);
  }
}

/**
 * Validate directory exists
 */
export function validateDirectoryExists(dirPath: string, description: string = 'Directory'): void {
  if (!existsSync(dirPath)) {
    throw new ValidationError(`${description} does not exist: ${dirPath}`);
  }
}

/**
 * Validate Git repository exists
 */
export function validateGitRepository(outputDir: string): void {
  const gitDir = join(outputDir, '.git');
  if (!existsSync(gitDir)) {
    throw new ValidationError(
      `No Git repository found in ${outputDir}. Run 'rga vcs init' to initialize.`
    );
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, description: string = 'URL'): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`Invalid ${description}: ${url}`);
  }
}
