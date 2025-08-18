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
}