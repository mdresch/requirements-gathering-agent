/**
 * Enhanced Prompt Service with Input Validation and Error Handling
 * Provides robust user input handling with validation, sanitization, and error recovery
 */

import * as readline from 'readline';
import { InputValidationService, ValidationResult } from './InputValidationService.js';
import { InteractiveErrorHandler, ErrorContext } from './InteractiveErrorHandler.js';

export interface PromptOptions {
  message: string;
  validator?: (input: string) => ValidationResult;
  required?: boolean;
  defaultValue?: string;
  maxRetries?: number;
  timeout?: number;
  mask?: boolean; // For password input
  multiline?: boolean;
  suggestions?: string[];
  helpText?: string;
}

export interface PromptResult<T = string> {
  success: boolean;
  value?: T;
  error?: string;
  attempts: number;
  cancelled: boolean;
}

export class EnhancedPromptService {
  private rl: readline.Interface;
  private isActive: boolean = false;

  constructor(rl?: readline.Interface) {
    this.rl = rl || readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Enhanced prompt with validation and error handling
   */
  async prompt<T = string>(options: PromptOptions): Promise<PromptResult<T>> {
    const {
      message,
      validator,
      required = true,
      defaultValue,
      maxRetries = 3,
      timeout = 30000,
      mask = false,
      multiline = false,
      suggestions = [],
      helpText
    } = options;

    let attempts = 0;
    this.isActive = true;

    // Show help text if provided
    if (helpText) {
      console.log(`💡 ${helpText}`);
    }

    // Show suggestions if provided
    if (suggestions.length > 0) {
      console.log('💡 Suggestions:');
      suggestions.forEach(suggestion => console.log(`   • ${suggestion}`));
    }

    while (attempts < maxRetries && this.isActive) {
      attempts++;

      try {
        const input = await this.getInput(message, defaultValue, timeout, mask, multiline);
        
        // Handle user cancellation
        if (input === null) {
          return {
            success: false,
            error: 'User cancelled input',
            attempts,
            cancelled: true
          };
        }

        // Apply default value if input is empty and default is provided
        const finalInput = input.trim() === '' && defaultValue ? defaultValue : input;

        // Check required field
        if (required && finalInput.trim() === '') {
          console.log('❌ This field is required. Please enter a value.');
          if (attempts < maxRetries) {
            console.log(`💡 Attempt ${attempts}/${maxRetries}`);
          }
          continue;
        }

        // Apply validation if provided
        if (validator) {
          const validationResult = validator(finalInput);
          InputValidationService.trackValidationError(validationResult);

          if (!validationResult.isValid) {
            console.log(InputValidationService.formatValidationError(validationResult));
            if (attempts < maxRetries) {
              console.log(`💡 Please try again (Attempt ${attempts}/${maxRetries})`);
            }
            continue;
          }

          return {
            success: true,
            value: validationResult.sanitizedValue as T,
            attempts,
            cancelled: false
          };
        }

        // No validation, return sanitized input
        return {
          success: true,
          value: InputValidationService.sanitizeInputSecure(finalInput) as T,
          attempts,
          cancelled: false
        };

      } catch (error) {
        const context: ErrorContext = {
          operation: 'user input prompt',
          userInput: message,
          timestamp: new Date()
        };

        const interactiveError = InteractiveErrorHandler.handleUnknownError(error as Error, context);
        await InteractiveErrorHandler.displayError(interactiveError);

        if (attempts < maxRetries) {
          console.log(`💡 Please try again (Attempt ${attempts}/${maxRetries})`);
        }
      }
    }

    return {
      success: false,
      error: `Maximum retry attempts (${maxRetries}) exceeded`,
      attempts,
      cancelled: false
    };
  }

  /**
   * Prompt for menu choice with enhanced validation
   */
  async promptMenuChoice(message: string, validChoices: string[]): Promise<PromptResult<string>> {
    return this.prompt({
      message,
      validator: (input) => InputValidationService.validateMenuChoice(input, validChoices),
      required: true,
      maxRetries: 5,
      suggestions: [
        `Valid choices: ${validChoices.join(', ')}`,
        'Navigation: back, home, help, exit, status, refresh'
      ]
    });
  }

  /**
   * Prompt for project name with validation
   */
  async promptProjectName(message: string = 'Enter project name:'): Promise<PromptResult<string>> {
    return this.prompt({
      message,
      validator: InputValidationService.validateProjectName,
      required: true,
      helpText: 'Project name should be 3-50 characters, alphanumeric with hyphens/underscores'
    });
  }

  /**
   * Prompt for file path with security validation
   */
  async promptFilePath(message: string = 'Enter file path:'): Promise<PromptResult<string>> {
    return this.prompt({
      message,
      validator: InputValidationService.validatePathSecure,
      required: true,
      helpText: 'Use relative paths within the project directory'
    });
  }

  /**
   * Prompt for numeric input with range validation
   */
  async promptNumber(
    message: string,
    min: number = Number.MIN_SAFE_INTEGER,
    max: number = Number.MAX_SAFE_INTEGER
  ): Promise<PromptResult<number>> {
    const result = await this.prompt({
      message,
      validator: (input) => InputValidationService.validateNumericRange(input, min, max),
      required: true,
      helpText: `Enter a number between ${min} and ${max}`
    });

    if (result.success && result.value) {
      return {
        ...result,
        value: parseFloat(result.value as string) as number
      };
    }

    return result as PromptResult<number>;
  }

  /**
   * Prompt for yes/no confirmation
   */
  async promptConfirm(message: string, defaultValue: boolean = false): Promise<PromptResult<boolean>> {
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const result = await this.prompt({
      message: `${message} (${defaultText}):`,
      validator: InputValidationService.validateYesNo,
      required: false,
      defaultValue: defaultValue ? 'yes' : 'no',
      suggestions: ['yes, y, true, 1 for yes', 'no, n, false, 0 for no']
    });

    if (result.success && result.value) {
      const value = result.value.toLowerCase();
      return {
        ...result,
        value: ['yes', 'y', 'true', '1'].includes(value) as boolean
      };
    }

    return result as PromptResult<boolean>;
  }

  /**
   * Prompt for password with masking
   */
  async promptPassword(message: string = 'Enter password:'): Promise<PromptResult<string>> {
    return this.prompt({
      message,
      validator: (input) => InputValidationService.validateText(input, { 
        required: true, 
        minLength: 3 
      }, 'password'),
      required: true,
      mask: true,
      helpText: 'Password will be hidden as you type'
    });
  }

  /**
   * Prompt for email with validation
   */
  async promptEmail(message: string = 'Enter email address:'): Promise<PromptResult<string>> {
    return this.prompt({
      message,
      validator: InputValidationService.validateEmail,
      required: true,
      helpText: 'Enter a valid email address (e.g., user@example.com)'
    });
  }

  /**
   * Prompt for URL with validation
   */
  async promptUrl(message: string = 'Enter URL:'): Promise<PromptResult<string>> {
    return this.prompt({
      message,
      validator: InputValidationService.validateUrl,
      required: true,
      helpText: 'Enter a valid URL (e.g., https://example.com)'
    });
  }

  /**
   * Prompt for API key with validation
   */
  async promptApiKey(provider: string, message?: string): Promise<PromptResult<string>> {
    return this.prompt({
      message: message || `Enter ${provider} API key:`,
      validator: (input) => InputValidationService.validateApiKey(input, provider),
      required: true,
      mask: true,
      helpText: `Enter your ${provider} API key (will be hidden as you type)`
    });
  }

  /**
   * Prompt for multiple choice selection
   */
  async promptChoice(
    message: string,
    choices: string[],
    allowMultiple: boolean = false
  ): Promise<PromptResult<string | string[]>> {
    console.log(`\n${message}`);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });

    const validChoices = choices.map((_, index) => (index + 1).toString());
    
    if (allowMultiple) {
      const result = await this.prompt({
        message: 'Enter choice numbers separated by commas (e.g., 1,3,5):',
        validator: (input) => {
          const selections = input.split(',').map(s => s.trim());
          for (const selection of selections) {
            if (!validChoices.includes(selection)) {
              return {
                isValid: false,
                error: `Invalid choice: ${selection}`,
                suggestions: [`Valid choices: ${validChoices.join(', ')}`]
              };
            }
          }
          return {
            isValid: true,
            sanitizedValue: selections.join(',')
          };
        },
        required: true,
        suggestions: ['Enter multiple numbers separated by commas', 'Example: 1,3,5']
      });

      if (result.success && result.value) {
        const indices = result.value.split(',').map(s => parseInt(s.trim()) - 1);
        return {
          ...result,
          value: indices.map(i => choices[i]) as string[]
        };
      }

      return result as PromptResult<string[]>;
    } else {
      const result = await this.prompt({
        message: 'Enter choice number:',
        validator: (input) => InputValidationService.validateText(input, {
          required: true,
          allowedValues: validChoices,
          caseSensitive: true
        }, 'choice'),
        required: true,
        suggestions: [`Valid choices: ${validChoices.join(', ')}`]
      });

      if (result.success && result.value) {
        const index = parseInt(result.value) - 1;
        return {
          ...result,
          value: choices[index] as string
        };
      }

      return result as PromptResult<string>;
    }
  }

  /**
   * Get raw input with timeout and cancellation support
   */
  private getInput(
    message: string,
    defaultValue?: string,
    timeout: number = 30000,
    mask: boolean = false,
    multiline: boolean = false
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const displayMessage = defaultValue 
        ? `${message} [${defaultValue}]: `
        : `${message} `;

      let timeoutId: NodeJS.Timeout | null = null;
      let resolved = false;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const handleTimeout = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log('\n⏰ Input timed out. Please try again.');
          resolve(null);
        }
      };

      const handleInput = (input: string) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(input);
        }
      };

      const handleCancel = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log('\n🚫 Input cancelled by user.');
          resolve(null);
        }
      };

      // Set up timeout
      timeoutId = setTimeout(handleTimeout, timeout);

      // Handle Ctrl+C cancellation
      const originalListeners = process.listeners('SIGINT');
      process.removeAllListeners('SIGINT');
      process.once('SIGINT', handleCancel);

      if (mask) {
        // For password input, use a different approach
        this.getMaskedInput(displayMessage).then(handleInput).catch(() => handleCancel());
      } else if (multiline) {
        // For multiline input
        this.getMultilineInput(displayMessage).then(handleInput).catch(() => handleCancel());
      } else {
        // Standard input
        this.rl.question(displayMessage, (input) => {
          // Restore original SIGINT listeners
          process.removeAllListeners('SIGINT');
          originalListeners.forEach(listener => process.on('SIGINT', listener));
          handleInput(input);
        });
      }
    });
  }

  /**
   * Get masked input for passwords
   */
  private getMaskedInput(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      process.stdout.write(message);
      
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      let input = '';
      
      const onData = (char: string) => {
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(input);
            break;
          case '\u0003': // Ctrl+C
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener('data', onData);
            reject(new Error('User cancelled'));
            break;
          case '\u007f': // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            if (char.charCodeAt(0) >= 32) { // Printable characters
              input += char;
              process.stdout.write('*');
            }
            break;
        }
      };
      
      stdin.on('data', onData);
    });
  }

  /**
   * Get multiline input
   */
  private getMultilineInput(message: string): Promise<string> {
    return new Promise((resolve) => {
      console.log(message);
      console.log('💡 Enter multiple lines. Type "END" on a new line to finish.');
      
      const lines: string[] = [];
      
      const handleLine = (line: string) => {
        if (line.trim() === 'END') {
          this.rl.removeListener('line', handleLine);
          resolve(lines.join('\n'));
        } else {
          lines.push(line);
        }
      };
      
      this.rl.on('line', handleLine);
    });
  }

  /**
   * Cancel active prompt
   */
  cancel(): void {
    this.isActive = false;
  }

  /**
   * Close the prompt service
   */
  close(): void {
    this.isActive = false;
    if (this.rl) {
      this.rl.close();
    }
  }
}