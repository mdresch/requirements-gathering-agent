/**
 * Shared TypeScript types for CLI and commands
 * 
 * Centralized type definitions for improved type safety and consistency
 * as recommended in CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 5 (Phase 3)
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created July 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\types.ts
 */

// Internal modules
import type { SupportedFormat } from './constants.js';

/**
 * Base options interface that all commands can extend
 */
export interface BaseCommandOptions {
  /** Suppress output messages */
  quiet?: boolean;
  /** Output directory for generated files */
  output?: string;
}

/**
 * Options for document generation commands
 */
export interface GenerateOptions extends BaseCommandOptions {
  /** Document key to generate */
  key?: string;
  /** Document category to generate */
  category?: string;
  /** Output format for generated documents */
  format?: SupportedFormat;
  /** Number of retry attempts */
  retries?: number;
  /** Initial retry backoff delay in milliseconds */
  retryBackoff?: number;
  /** Maximum retry delay in milliseconds */
  retryMaxDelay?: number;
}

/**
 * Options for Confluence integration commands
 */
export interface ConfluenceOptions extends BaseCommandOptions {
  /** Path to documents directory */
  documentsPath?: string;
  /** Parent page title in Confluence */
  parentPageTitle?: string;
  /** Label prefix for metadata */
  labelPrefix?: string;
  /** Preview only, don't actually publish */
  dryRun?: boolean;
  /** Force publish even if conflicts exist */
  force?: boolean;
}

/**
 * Options for SharePoint integration commands
 */
export interface SharePointOptions extends BaseCommandOptions {
  /** Path to documents directory */
  documentsPath?: string;
  /** Target folder path in SharePoint */
  folderPath?: string;
  /** Label prefix for metadata */
  labelPrefix?: string;
  /** Preview only, don't actually publish */
  dryRun?: boolean;
  /** Force publish even if conflicts exist */
  force?: boolean;
}

/**
 * Options for VCS (Version Control System) commands
 */
export interface VcsOptions extends BaseCommandOptions {
  /** Output directory for VCS operations */
  outputDir?: string;
  /** Commit message for VCS operations */
  message?: string;
  /** Remote name for push operations */
  remote?: string;
  /** Branch name for push operations */
  branch?: string;
}

/**
 * Options for OAuth2 authentication commands
 */
export interface OAuth2Options extends BaseCommandOptions {
  // OAuth2 specific options can be added here as needed
}

/**
 * Options for status and analysis commands
 */
export interface StatusOptions extends BaseCommandOptions {
  /** Show detailed information */
  verbose?: boolean;
}

/**
 * Options for validation commands
 */
export interface ValidateOptions extends BaseCommandOptions {
  /** Output directory to validate */
  outputDir?: string;
}

/**
 * Custom error types for better error handling
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string, public configPath?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class CommandExecutionError extends Error {
  constructor(message: string, public exitCode?: number) {
    super(message);
    this.name = 'CommandExecutionError';
  }
}

export class AIProviderError extends Error {
  constructor(message: string, public provider?: string) {
    super(message);
    this.name = 'AIProviderError';
  }
}

/**
 * Result types for command operations
 */
export interface CommandResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * AI Provider configuration types
 */
export interface AIProviderConfig {
  name: string;
  model?: string;
  endpoint?: string;
  apiKey?: string;
  enabled: boolean;
}

/**
 * Document generation result
 */
export interface GenerationResult {
  documentKey: string;
  filePath: string;
  success: boolean;
  error?: string;
  retryCount?: number;
}

/**
 * Validation result for PMBOK compliance
 */
export interface ValidationResult {
  documentPath: string;
  isValid: boolean;
  issues: ValidationIssue[];
  score?: number;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
}
