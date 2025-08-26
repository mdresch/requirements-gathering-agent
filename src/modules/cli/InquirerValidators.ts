/**
 * Inquirer Validators
 * 
 * Custom validators for inquirer prompts that integrate with the existing
 * InputValidationService for consistent validation across the CLI.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import { InputValidationService, ValidationResult } from './InputValidationService.js';

/**
 * Validator factory for inquirer prompts
 */
export class InquirerValidators {
  /**
   * Create a validator for project names
   */
  static projectName() {
    return (input: string): boolean | string => {
      const result = InputValidationService.validateProjectName(input);
  return result.isValid ? true : result.error || 'Invalid input';
    };
  }

  /**
   * Create a validator for file paths
   */
  static filePath() {
    return (input: string): boolean | string => {
      const result = InputValidationService.validateFilePath(input);
  return result.isValid ? true : result.error || 'Invalid input';
    };
  }

  /**
   * Create a validator for URLs
   */
  static url() {
    return (input: string): boolean | string => {
      const result = InputValidationService.validateUrl(input);
  return result.isValid ? true : result.error || 'Invalid input';
    };
  }

  /**
   * Create a validator for email addresses
   */
  static email() {
    return (input: string): boolean | string => {
      const result = InputValidationService.validateEmail(input);
  return result.isValid ? true : result.error || 'Invalid input';
    };
  }

  /**
   * Create a validator for API keys
   */
  static apiKey(provider?: string) {
    return (input: string): boolean | string => {
      const result = InputValidationService.validateApiKey(input, provider);
  return result.isValid ? true : result.error || 'Invalid input';
    };
  }

  /**
   * Create a validator for numbers
   */
  static number(min?: number, max?: number) {
    return (input: string): boolean | string => {
      const result = InputValidationService.validateNumber(input, min, max);
  return result.isValid ? true : result.error || 'Invalid input';
    };
  }

  /**
   * Create a validator for required text
   */
  static required(fieldName: string = 'field') {
    return (input: string): boolean | string => {
      if (!input || input.trim().length === 0) {
        return `${fieldName} is required`;
      }
      return true;
    };
  }

  /**
   * Create a validator for text with minimum length
   */
  static minLength(minLength: number, fieldName: string = 'field') {
    return (input: string): boolean | string => {
      if (!input || input.trim().length < minLength) {
        return `${fieldName} must be at least ${minLength} characters long`;
      }
      return true;
    };
  }

  /**
   * Create a validator for text with maximum length
   */
  static maxLength(maxLength: number, fieldName: string = 'field') {
    return (input: string): boolean | string => {
      if (input && input.length > maxLength) {
        return `${fieldName} must be no more than ${maxLength} characters long`;
      }
      return true;
    };
  }

  /**
   * Create a validator that combines multiple validators
   */
  static combine(...validators: Array<(input: string) => boolean | string>) {
    return (input: string): boolean | string => {
      for (const validator of validators) {
        const result = validator(input);
        if (result !== true) {
          return result;
        }
      }
      return true;
    };
  }

  /**
   * Create a validator for allowed values
   */
  static allowedValues(allowedValues: string[], caseSensitive: boolean = false) {
    return (input: string): boolean | string => {
      const checkValue = caseSensitive ? input : input.toLowerCase();
      const allowedSet = caseSensitive ? allowedValues : allowedValues.map(v => v.toLowerCase());
      
      if (!allowedSet.includes(checkValue)) {
        return `Value must be one of: ${allowedValues.join(', ')}`;
      }
      return true;
    };
  }

  /**
   * Create a validator for regex patterns
   */
  static pattern(pattern: RegExp, errorMessage: string) {
    return (input: string): boolean | string => {
      if (!pattern.test(input)) {
        return errorMessage;
      }
      return true;
    };
  }

  /**
   * Create a conditional validator
   */
  static conditional(
    condition: (input: string) => boolean,
    validator: (input: string) => boolean | string
  ) {
    return (input: string): boolean | string => {
      if (condition(input)) {
        return validator(input);
      }
      return true;
    };
  }
}

/**
 * Filter factory for inquirer prompts
 */
export class InquirerFilters {
  /**
   * Trim whitespace
   */
  static trim() {
    return (input: string): string => input.trim();
  }

  /**
   * Convert to lowercase
   */
  static toLowerCase() {
    return (input: string): string => input.toLowerCase();
  }

  /**
   * Convert to uppercase
   */
  static toUpperCase() {
    return (input: string): string => input.toUpperCase();
  }

  /**
   * Sanitize input using InputValidationService
   */
  static sanitize() {
    return (input: string): string => InputValidationService.sanitizeInput(input);
  }

  /**
   * Parse number
   */
  static parseNumber() {
    return (input: string): number => {
      const num = parseFloat(input);
      return isNaN(num) ? 0 : num;
    };
  }

  /**
   * Parse integer
   */
  static parseInt() {
    return (input: string): number => {
      const num = parseInt(input, 10);
      return isNaN(num) ? 0 : num;
    };
  }

  /**
   * Combine multiple filters
   */
  static combine(...filters: Array<(input: any) => any>) {
    return (input: any): any => {
      return filters.reduce((value, filter) => filter(value), input);
    };
  }
}

/**
 * Common prompt configurations
 */
export class InquirerPrompts {
  /**
   * Create a project name prompt
   */
  static projectName(message: string = 'Enter project name:', defaultValue?: string) {
    return {
      type: 'input' as const,
      name: 'projectName',
      message,
      default: defaultValue,
      validate: InquirerValidators.projectName(),
      filter: InquirerFilters.trim()
    };
  }

  /**
   * Create an API key prompt
   */
  static apiKey(provider: string, message?: string) {
    return {
      type: 'password' as const,
      name: 'apiKey',
      message: message || `Enter ${provider} API key:`,
      validate: InquirerValidators.apiKey(provider),
      filter: InquirerFilters.trim()
    };
  }

  /**
   * Create a confirmation prompt
   */
  static confirm(message: string, defaultValue: boolean = false) {
    return {
      type: 'confirm' as const,
      name: 'confirmed',
      message,
      default: defaultValue
    };
  }

  /**
   * Create a list selection prompt
   */
  static list(name: string, message: string, choices: any[], defaultValue?: any) {
    return {
      type: 'list' as const,
      name,
      message,
      choices,
      default: defaultValue,
      pageSize: 10
    };
  }

  /**
   * Create a checkbox selection prompt
   */
  static checkbox(name: string, message: string, choices: any[]) {
    return {
      type: 'checkbox' as const,
      name,
      message,
      choices,
      pageSize: 10,
      validate: (answer: any[]) => {
        if (answer.length === 0) {
          return 'You must choose at least one option';
        }
        return true;
      }
    };
  }

  /**
   * Create a text input prompt
   */
  static input(name: string, message: string, required: boolean = true, defaultValue?: string) {
    return {
      type: 'input' as const,
      name,
      message,
      default: defaultValue,
      validate: required ? InquirerValidators.required(name) : () => true,
      filter: InquirerFilters.trim()
    };
  }

  /**
   * Create a password input prompt
   */
  static password(name: string, message: string, minLength: number = 3) {
    return {
      type: 'password' as const,
      name,
      message,
      validate: InquirerValidators.minLength(minLength, name),
      filter: InquirerFilters.trim()
    };
  }
}

export default {
  InquirerValidators,
  InquirerFilters,
  InquirerPrompts
};