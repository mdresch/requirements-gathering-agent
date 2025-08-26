/**
 * Input Validation Service for Interactive CLI
 * 
 * Provides comprehensive input validation and sanitization for all user inputs
 * in the interactive CLI system. Ensures robust user experience by preventing
 * invalid inputs and providing helpful error messages.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import { ValidationError } from '../../commands/utils/validation.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
  suggestions?: string[];
  timestamp?: Date;
}

export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  customValidator?: (value: string) => ValidationResult;
  sanitize?: boolean;
  caseSensitive?: boolean;
}

export class InputValidationService {
  private static readonly errorHistory: ValidationResult[] = [];
  private static readonly MAX_ERROR_HISTORY = 100;

  /**
   * Enhanced validation with timeout and retry support
   */
  static async validateWithRetry<T>(
    input: string,
    validator: (input: string) => ValidationResult,
    options: {
      maxRetries?: number;
      retryMessage?: string;
      fieldName?: string;
    } = {}
  ): Promise<{ isValid: boolean; value?: T; attempts: number }> {
    const { maxRetries = 3, retryMessage = 'Please try again', fieldName = 'input' } = options;
    let attempts = 0;
    
    while (attempts < maxRetries) {
      attempts++;
      const result = validator(input);
      
      if (result.isValid) {
        return { isValid: true, value: result.sanitizedValue as T, attempts };
      }
      
      if (attempts < maxRetries) {
        console.log(`❌ ${this.formatValidationError(result)}`);
        console.log(`💡 ${retryMessage} (Attempt ${attempts}/${maxRetries})`);
      }
    }
    
    return { isValid: false, attempts };
  }

  /**
   * Validate input with timeout
   */
  static validateWithTimeout(input: string, validator: (input: string) => ValidationResult, timeoutMs: number = 30000): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          isValid: false,
          error: 'Input validation timed out',
          suggestions: ['Please try again with valid input']
        });
      }, timeoutMs);

      try {
        const result = validator(input);
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        resolve({
          isValid: false,
          error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
          suggestions: ['Please check your input and try again']
        });
      }
    });
  }

  /**
   * Enhanced input sanitization with security measures
   */
  static sanitizeInputSecure(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      // Remove potential script injection attempts
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Limit length to prevent buffer overflow
      .substring(0, 1000);
  }

  /**
   * Validate menu choice input
   */
  static validateMenuChoice(input: string, validChoices: string[]): ValidationResult {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Please enter a choice',
        suggestions: ['Enter a number from the menu options', 'Type "help" for navigation commands']
      };
    }

    // Check for special navigation commands (case-insensitive)
    const navigationCommands = ['back', 'b', 'home', 'h', 'help', '?', 'exit', 'quit', 'q', 'status', 's', 'refresh', 'r'];
    const lowerInput = trimmed.toLowerCase();
    
    if (navigationCommands.includes(lowerInput)) {
      return {
        isValid: true,
        sanitizedValue: lowerInput
      };
    }

    // Check if it's a valid menu choice
    if (validChoices.includes(trimmed)) {
      return {
        isValid: true,
        sanitizedValue: trimmed
      };
    }

    // Check if it's a number that might be valid
    const numericInput = parseInt(trimmed);
    if (!isNaN(numericInput)) {
      const numericChoice = numericInput.toString();
      if (validChoices.includes(numericChoice)) {
        return {
          isValid: true,
          sanitizedValue: numericChoice
        };
      }
    }

    return {
      isValid: false,
      error: `Invalid choice "${trimmed}"`,
      suggestions: [
        `Valid choices: ${validChoices.join(', ')}`,
        'Navigation commands: back, home, help, exit, status, refresh'
      ]
    };
  }

  /**
   * Validate project name input
   */
  static validateProjectName(input: string): ValidationResult {
    const options: ValidationOptions = {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_\.]+$/,
      sanitize: true
    };

    return this.validateText(input, options, 'project name');
  }

  /**
   * Validate file path input
   */
  static validateFilePath(input: string): ValidationResult {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'File path cannot be empty'
      };
    }

    // Check for dangerous path patterns
    if (trimmed.includes('..') || trimmed.includes('~')) {
      return {
        isValid: false,
        error: 'File path cannot contain ".." or "~" for security reasons',
        suggestions: ['Use relative paths from the current directory', 'Use absolute paths starting with "/"']
      };
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(trimmed)) {
      return {
        isValid: false,
        error: 'File path contains invalid characters',
        suggestions: ['Remove characters: < > : " | ? *']
      };
    }

    return {
      isValid: true,
      sanitizedValue: trimmed
    };
  }

  /**
   * Validate URL input
   */
  static validateUrl(input: string): ValidationResult {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'URL cannot be empty'
      };
    }

    try {
      const url = new URL(trimmed);
      
      // Check for allowed protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(url.protocol)) {
        return {
          isValid: false,
          error: 'URL must use HTTP or HTTPS protocol',
          suggestions: ['Example: https://example.com']
        };
      }

      return {
        isValid: true,
        sanitizedValue: url.toString()
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format',
        suggestions: ['Example: https://example.com', 'Include protocol (http:// or https://)']
      };
    }
  }

  /**
   * Validate email input
   */
  static validateEmail(input: string): ValidationResult {
    const trimmed = input.trim().toLowerCase();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Email cannot be empty'
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid email format',
        suggestions: ['Example: user@example.com']
      };
    }

    return {
      isValid: true,
      sanitizedValue: trimmed
    };
  }

  /**
   * Validate API key input
   */
  static validateApiKey(input: string, provider?: string): ValidationResult {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'API key cannot be empty'
      };
    }

    // Basic length validation
    if (trimmed.length < 10) {
      return {
        isValid: false,
        error: 'API key appears too short',
        suggestions: ['Check that you copied the complete API key']
      };
    }

    // Provider-specific validation
    if (provider) {
      switch (provider.toLowerCase()) {
        case 'google-ai':
        case 'gemini':
          if (!trimmed.startsWith('AI') || trimmed.length < 30) {
            return {
              isValid: false,
              error: 'Google AI API key should start with "AI" and be at least 30 characters',
              suggestions: ['Get your API key from https://aistudio.google.com/app/apikey']
            };
          }
          break;
        
        case 'openai':
          if (!trimmed.startsWith('sk-') || trimmed.length < 40) {
            return {
              isValid: false,
              error: 'OpenAI API key should start with "sk-" and be at least 40 characters',
              suggestions: ['Get your API key from https://platform.openai.com/api-keys']
            };
          }
          break;
      }
    }

    return {
      isValid: true,
      sanitizedValue: trimmed
    };
  }

  /**
   * Validate numeric input
   */
  static validateNumber(input: string, min?: number, max?: number): ValidationResult {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Number cannot be empty'
      };
    }

    const num = parseFloat(trimmed);
    if (isNaN(num)) {
      return {
        isValid: false,
        error: 'Invalid number format',
        suggestions: ['Enter a valid number']
      };
    }

    if (min !== undefined && num < min) {
      return {
        isValid: false,
        error: `Number must be at least ${min}`,
        suggestions: [`Enter a number >= ${min}`]
      };
    }

    if (max !== undefined && num > max) {
      return {
        isValid: false,
        error: `Number must be at most ${max}`,
        suggestions: [`Enter a number <= ${max}`]
      };
    }

    return {
      isValid: true,
      sanitizedValue: num.toString()
    };
  }

  /**
   * Validate yes/no input
   */
  static validateYesNo(input: string): ValidationResult {
    const trimmed = input.trim().toLowerCase();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Please enter yes or no',
        suggestions: ['Enter "y" or "yes" for yes', 'Enter "n" or "no" for no']
      };
    }

    const yesValues = ['y', 'yes', 'true', '1'];
    const noValues = ['n', 'no', 'false', '0'];
    
    if (yesValues.includes(trimmed)) {
      return {
        isValid: true,
        sanitizedValue: 'yes'
      };
    }

    if (noValues.includes(trimmed)) {
      return {
        isValid: true,
        sanitizedValue: 'no'
      };
    }

    return {
      isValid: false,
      error: `Invalid input "${input}"`,
      suggestions: ['Enter "y" or "yes" for yes', 'Enter "n" or "no" for no']
    };
  }

  /**
   * Generic text validation
   */
  static validateText(input: string, options: ValidationOptions = {}, fieldName: string = 'input'): ValidationResult {
    let value = options.sanitize ? this.sanitizeInput(input) : input.trim();
    
    // Required validation
    if (options.required && !value) {
      return {
        isValid: false,
        error: `${fieldName} is required`
      };
    }

    // Skip further validation if empty and not required
    if (!value && !options.required) {
      return {
        isValid: true,
        sanitizedValue: value
      };
    }

    // Length validation
    if (options.minLength && value.length < options.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${options.minLength} characters`,
        suggestions: [`Current length: ${value.length}`]
      };
    }

    if (options.maxLength && value.length > options.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at most ${options.maxLength} characters`,
        suggestions: [`Current length: ${value.length}`]
      };
    }

    // Pattern validation
    if (options.pattern && !options.pattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldName} contains invalid characters`,
        suggestions: ['Use only letters, numbers, spaces, hyphens, and underscores']
      };
    }

    // Allowed values validation
    if (options.allowedValues) {
      const checkValue = options.caseSensitive ? value : value.toLowerCase();
      const allowedValues = options.caseSensitive ? options.allowedValues : options.allowedValues.map(v => v.toLowerCase());
      
      if (!allowedValues.includes(checkValue)) {
        return {
          isValid: false,
          error: `Invalid ${fieldName}`,
          suggestions: [`Allowed values: ${options.allowedValues.join(', ')}`]
        };
      }
    }

    // Custom validation
    if (options.customValidator) {
      const customResult = options.customValidator(value);
      if (!customResult.isValid) {
        return customResult;
      }
    }

    return {
      isValid: true,
      sanitizedValue: value
    };
  }

  /**
   * Sanitize input to prevent security issues
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/['"]/g, '') // Remove quotes that could cause injection
      .replace(/\\/g, '/') // Normalize path separators
      .substring(0, 1000); // Limit length to prevent DoS
  }

  /**
   * Validate multiple inputs at once
   */
  static validateMultiple(inputs: { [key: string]: { value: string; validator: (value: string) => ValidationResult } }): { [key: string]: ValidationResult } {
    const results: { [key: string]: ValidationResult } = {};
    
    for (const [key, { value, validator }] of Object.entries(inputs)) {
      results[key] = validator(value);
    }
    
    return results;
  }

  /**
   * Check if all validation results are valid
   */
  static allValid(results: ValidationResult[]): boolean {
    return results.every(result => result.isValid);
  }

  /**
   * Get first error from validation results
   */
  static getFirstError(results: ValidationResult[]): string | null {
    const firstInvalid = results.find(result => !result.isValid);
    return firstInvalid?.error || null;
  }

  /**
   * Format validation error for display
   */
  static formatValidationError(result: ValidationResult): string {
    let message = `❌ ${result.error}`;
    
    if (result.suggestions && result.suggestions.length > 0) {
      message += '\n💡 Suggestions:';
      for (const suggestion of result.suggestions) {
        message += `\n   • ${suggestion}`;
      }
    }
    
    return message;
  }

  /**
   * Track validation errors for analytics
   */
  static trackValidationError(result: ValidationResult): void {
    if (!result.isValid) {
      this.errorHistory.push({
        ...result,
        timestamp: new Date()
      });
      
      // Keep history size manageable
      if (this.errorHistory.length > this.MAX_ERROR_HISTORY) {
        this.errorHistory.shift();
      }
    }
  }

  /**
   * Get validation error statistics
   */
  static getValidationStats(): {
    totalErrors: number;
    recentErrors: number;
    commonErrors: string[];
    errorRate: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentErrors = this.errorHistory.filter(error => 
      error.timestamp && error.timestamp > oneHourAgo
    );
    
    const errorCounts: { [key: string]: number } = {};
    this.errorHistory.forEach(error => {
      if (error.error) {
        errorCounts[error.error] = (errorCounts[error.error] || 0) + 1;
      }
    });
    
    const commonErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);
    
    return {
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      commonErrors,
      errorRate: this.errorHistory.length > 0 ? (recentErrors.length / this.errorHistory.length) * 100 : 0
    };
  }

  /**
   * Clear validation error history
   */
  static clearValidationHistory(): void {
    this.errorHistory.length = 0;
  }

  /**
   * Validate command line arguments
   */
  static validateCommandArgs(args: string[]): ValidationResult {
    if (!Array.isArray(args)) {
      return {
        isValid: false,
        error: 'Invalid arguments format',
        suggestions: ['Arguments must be an array of strings']
      };
    }

    // Check for potentially dangerous arguments
    const dangerousPatterns = [
      /--eval/i,
      /--exec/i,
      /\$\(/,
      /`[^`]*`/,
      /\|\s*sh/i,
      /\|\s*bash/i,
      /\|\s*cmd/i
    ];

    for (const arg of args) {
      if (typeof arg !== 'string') {
        return {
          isValid: false,
          error: 'All arguments must be strings',
          suggestions: ['Check argument types']
        };
      }

      for (const pattern of dangerousPatterns) {
        if (pattern.test(arg)) {
          return {
            isValid: false,
            error: 'Potentially dangerous argument detected',
            suggestions: ['Remove shell injection attempts', 'Use safe argument values']
          };
        }
      }
    }

    return {
      isValid: true,
      sanitizedValue: args.map(arg => this.sanitizeInputSecure(arg))
    };
  }

  /**
   * Validate file system paths with security checks
   */
  static validatePathSecure(input: string): ValidationResult {
    const sanitized = this.sanitizeInputSecure(input);
    
    if (!sanitized) {
      return {
        isValid: false,
        error: 'Path cannot be empty',
        suggestions: ['Provide a valid file or directory path']
      };
    }

    // Check for path traversal attempts
    if (sanitized.includes('..') || sanitized.includes('~')) {
      return {
        isValid: false,
        error: 'Path traversal not allowed',
        suggestions: ['Use relative paths within the project directory', 'Avoid ".." and "~" in paths']
      };
    }

    // Check for absolute paths outside allowed directories
    if (sanitized.startsWith('/') && !sanitized.startsWith('/tmp/') && !sanitized.startsWith('/var/tmp/')) {
      return {
        isValid: false,
        error: 'Absolute paths outside allowed directories not permitted',
        suggestions: ['Use relative paths', 'Use paths within the project directory']
      };
    }

    return {
      isValid: true,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate numeric input with range checking
   */
  static validateNumericRange(input: string, min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER): ValidationResult {
    const sanitized = this.sanitizeInputSecure(input);
    
    if (!sanitized) {
      return {
        isValid: false,
        error: 'Numeric input cannot be empty',
        suggestions: [`Enter a number between ${min} and ${max}`]
      };
    }

    const num = parseFloat(sanitized);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        error: 'Input must be a valid number',
        suggestions: ['Enter a numeric value', 'Use decimal notation if needed']
      };
    }

    if (num < min || num > max) {
      return {
        isValid: false,
        error: `Number must be between ${min} and ${max}`,
        suggestions: [`Enter a value between ${min} and ${max}`]
      };
    }

    return {
      isValid: true,
      sanitizedValue: num.toString()
    };
  }
}