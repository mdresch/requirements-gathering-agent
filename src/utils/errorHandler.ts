/**
 * Centralized error handling utilities
 * 
 * Provides consistent error handling and user feedback across all CLI commands
 * as recommended in CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 7
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created July 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\utils\errorHandler.ts
 */

// Node.js built-ins
import process from 'process';

// Internal modules
import {
  ValidationError,
  ConfigurationError,
  CommandExecutionError,
  AIProviderError,
  CommandResult
} from '../types.js';

/**
 * Log levels for different types of messages
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Handle errors with appropriate user feedback and exit codes
 */
export function handleError(error: Error, quiet: boolean = false): never {
  if (!quiet) {
    if (error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      console.error(`❌ Validation Error: ${validationError.message}`);
      if (validationError.field) {
        console.error(`   Field: ${validationError.field}`);
      }
      process.exit(1);
    }

    if (error.name === 'ConfigurationError') {
      const configError = error as ConfigurationError;
      console.error(`⚙️ Configuration Error: ${configError.message}`);
      if (configError.configPath) {
        console.error(`   Config file: ${configError.configPath}`);
      }
      console.error('   Run "rga setup" to configure the application');
      process.exit(1);
    }

    if (error.name === 'CommandExecutionError') {
      const cmdError = error as CommandExecutionError;
      console.error(`🚫 Command Failed: ${cmdError.message}`);
      process.exit(cmdError.exitCode || 1);
    }

    if (error.name === 'AIProviderError') {
      const aiError = error as AIProviderError;
      console.error(`🤖 AI Provider Error: ${aiError.message}`);
      if (aiError.provider) {
        console.error(`   Provider: ${aiError.provider}`);
      }
      console.error('   Check your AI provider configuration and API keys');
      process.exit(1);
    }

    // Generic error handling
    console.error(`💥 Unexpected Error: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  }
  
  process.exit(1);
}

/**
 * Log messages with appropriate formatting based on level and quiet mode
 */
export function log(message: string, level: LogLevel = LogLevel.INFO, quiet: boolean = false): void {
  if (quiet && level !== LogLevel.ERROR) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = getLogPrefix(level);
  
  switch (level) {
    case LogLevel.ERROR:
      console.error(`${prefix} ${message}`);
      break;
    case LogLevel.WARN:
      console.warn(`${prefix} ${message}`);
      break;
    case LogLevel.INFO:
      console.log(`${prefix} ${message}`);
      break;
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[${timestamp}] ${prefix} ${message}`);
      }
      break;
  }
}

/**
 * Get emoji prefix for log level
 */
function getLogPrefix(level: LogLevel): string {
  switch (level) {
    case LogLevel.ERROR:
      return '❌';
    case LogLevel.WARN:
      return '⚠️';
    case LogLevel.INFO:
      return 'ℹ️';
    case LogLevel.DEBUG:
      return '🐛';
    default:
      return 'ℹ️';
  }
}

/**
 * Validate common command options
 */
export function validateBaseOptions(options: any): void {
  if (options.retries !== undefined && options.retries < 0) {
    throw new ValidationError('Retries must be non-negative', 'retries');
  }

  if (options.retryBackoff !== undefined && options.retryBackoff < 0) {
    throw new ValidationError('Retry backoff must be non-negative', 'retryBackoff');
  }

  if (options.retryMaxDelay !== undefined && options.retryMaxDelay < 0) {
    throw new ValidationError('Retry max delay must be non-negative', 'retryMaxDelay');
  }

  if (options.output !== undefined && typeof options.output !== 'string') {
    throw new ValidationError('Output directory must be a string', 'output');
  }
}

/**
 * Validate file path exists and is accessible
 */
export async function validateFilePath(filePath: string, description: string = 'file'): Promise<void> {
  const { access, constants } = await import('fs/promises');
  
  try {
    await access(filePath, constants.F_OK);
  } catch {
    throw new ValidationError(`${description} does not exist: ${filePath}`, 'filePath');
  }
}

/**
 * Validate directory exists and is writable
 */
export async function validateOutputDirectory(dirPath: string): Promise<void> {
  const { access, constants, mkdir } = await import('fs/promises');
  const path = await import('path');
  
  try {
    await access(dirPath, constants.F_OK);
    await access(dirPath, constants.W_OK);
  } catch {
    try {
      await mkdir(dirPath, { recursive: true });
      log(`Created output directory: ${dirPath}`, LogLevel.INFO);
    } catch (error) {
      throw new ValidationError(`Cannot create or access output directory: ${dirPath}`, 'output');
    }
  }
}

/**
 * Wrap async command execution with error handling
 */
export async function executeWithErrorHandling<T>(
  commandFn: () => Promise<T>,
  quiet: boolean = false
): Promise<CommandResult<T>> {
  try {
    const result = await commandFn();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (!quiet) {
      handleError(error instanceof Error ? error : new Error(errorMessage), quiet);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Create a standardized success message
 */
export function logSuccess(message: string, quiet: boolean = false): void {
  if (!quiet) {
    console.log(`✅ ${message}`);
  }
}

/**
 * Create a standardized warning message
 */
export function logWarning(message: string, quiet: boolean = false): void {
  if (!quiet) {
    console.warn(`⚠️ ${message}`);
  }
}

/**
 * Create a standardized info message
 */
export function logInfo(message: string, quiet: boolean = false): void {
  if (!quiet) {
    console.log(`ℹ️ ${message}`);
  }
}
