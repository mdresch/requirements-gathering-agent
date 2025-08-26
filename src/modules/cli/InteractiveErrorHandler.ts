/**
 * Interactive Error Handler
 * 
 * Provides specialized error handling for the interactive CLI system.
 * Ensures that errors don't crash the application and provides user-friendly
 * error messages with recovery options.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import { ValidationError } from '../../commands/utils/validation.js';
import { ValidationResult } from './InputValidationService.js';

export interface ErrorContext {
  operation: string;
  userInput?: string;
  menuId?: string;
  timestamp: Date;
}

export interface ErrorRecoveryOptions {
  canRetry: boolean;
  canGoBack: boolean;
  canSkip: boolean;
  suggestedActions: string[];
}

export interface InteractiveError {
  type: 'validation' | 'system' | 'network' | 'configuration' | 'user' | 'unknown';
  message: string;
  context: ErrorContext;
  recoveryOptions: ErrorRecoveryOptions;
  originalError?: Error;
}

export class InteractiveErrorHandler {
  private static errorHistory: InteractiveError[] = [];
  private static maxHistorySize = 50;

  /**
   * Handle validation errors in interactive context
   */
  static handleValidationError(
    validationResult: ValidationResult,
    context: ErrorContext
  ): InteractiveError {
    const error: InteractiveError = {
      type: 'validation',
      message: validationResult.error || 'Validation failed',
      context,
      recoveryOptions: {
        canRetry: true,
        canGoBack: false,
        canSkip: false,
        suggestedActions: validationResult.suggestions || ['Please correct your input and try again']
      }
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle system errors (file system, permissions, etc.)
   */
  static handleSystemError(
    originalError: Error,
    context: ErrorContext
  ): InteractiveError {
    let message = 'System error occurred';
    let suggestedActions: string[] = [];

    // Categorize common system errors
    if (originalError.message.includes('ENOENT')) {
      message = 'File or directory not found';
      suggestedActions = [
        'Check that the file path is correct',
        'Ensure the file exists',
        'Check file permissions'
      ];
    } else if (originalError.message.includes('EACCES')) {
      message = 'Permission denied';
      suggestedActions = [
        'Check file/directory permissions',
        'Run with appropriate privileges',
        'Contact system administrator'
      ];
    } else if (originalError.message.includes('ENOSPC')) {
      message = 'No space left on device';
      suggestedActions = [
        'Free up disk space',
        'Choose a different output directory',
        'Contact system administrator'
      ];
    } else {
      message = originalError.message;
      suggestedActions = [
        'Try the operation again',
        'Check system resources',
        'Contact support if the problem persists'
      ];
    }

    const error: InteractiveError = {
      type: 'system',
      message,
      context,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canSkip: false,
        suggestedActions
      },
      originalError
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle network errors (API calls, downloads, etc.)
   */
  static handleNetworkError(
    originalError: Error,
    context: ErrorContext
  ): InteractiveError {
    let message = 'Network error occurred';
    let suggestedActions: string[] = [];

    if (originalError.message.includes('timeout')) {
      message = 'Request timed out';
      suggestedActions = [
        'Check your internet connection',
        'Try again in a few moments',
        'Check if the service is available'
      ];
    } else if (originalError.message.includes('ENOTFOUND')) {
      message = 'Service not found';
      suggestedActions = [
        'Check the URL or endpoint',
        'Verify your internet connection',
        'Check if the service is online'
      ];
    } else if (originalError.message.includes('401')) {
      message = 'Authentication failed';
      suggestedActions = [
        'Check your API key or credentials',
        'Verify the credentials are still valid',
        'Re-configure the provider if needed'
      ];
    } else if (originalError.message.includes('403')) {
      message = 'Access forbidden';
      suggestedActions = [
        'Check your account permissions',
        'Verify your subscription status',
        'Contact the service provider'
      ];
    } else if (originalError.message.includes('429')) {
      message = 'Rate limit exceeded';
      suggestedActions = [
        'Wait a few minutes before trying again',
        'Check your API usage limits',
        'Consider upgrading your plan'
      ];
    } else {
      message = originalError.message;
      suggestedActions = [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the problem persists'
      ];
    }

    const error: InteractiveError = {
      type: 'network',
      message,
      context,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canSkip: true,
        suggestedActions
      },
      originalError
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle configuration errors
   */
  static handleConfigurationError(
    originalError: Error,
    context: ErrorContext
  ): InteractiveError {
    let message = 'Configuration error';
    let suggestedActions: string[] = [];

    if (originalError.message.includes('API key')) {
      message = 'API key configuration issue';
      suggestedActions = [
        'Check your API key is correctly set',
        'Verify the API key format',
        'Run the setup wizard to reconfigure'
      ];
    } else if (originalError.message.includes('provider')) {
      message = 'AI provider configuration issue';
      suggestedActions = [
        'Check your provider configuration',
        'Run "adpa setup" to reconfigure',
        'Verify your provider credentials'
      ];
    } else {
      message = originalError.message;
      suggestedActions = [
        'Check your configuration files',
        'Run the setup wizard',
        'Reset configuration if needed'
      ];
    }

    const error: InteractiveError = {
      type: 'configuration',
      message,
      context,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canSkip: false,
        suggestedActions
      },
      originalError
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle user cancellation or interruption
   */
  static handleUserCancellation(context: ErrorContext): InteractiveError {
    const error: InteractiveError = {
      type: 'user',
      message: 'Operation cancelled by user',
      context,
      recoveryOptions: {
        canRetry: false,
        canGoBack: true,
        canSkip: false,
        suggestedActions: ['Return to previous menu', 'Try a different operation']
      }
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError(
    originalError: Error,
    context: ErrorContext
  ): InteractiveError {
    const error: InteractiveError = {
      type: 'unknown',
      message: `Unexpected error: ${originalError.message}`,
      context,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canSkip: true,
        suggestedActions: [
          'Try the operation again',
          'Return to previous menu',
          'Contact support with error details'
        ]
      },
      originalError
    };

    this.logError(error);
    return error;
  }

  /**
   * Display error to user with recovery options
   */
  static async displayError(error: InteractiveError): Promise<void> {
    console.log('\n' + '─'.repeat(60));
    console.log(`❌ Error: ${error.message}`);
    
    if (error.context.userInput) {
      console.log(`📝 Your input: "${error.context.userInput}"`);
    }
    
    if (error.context.operation) {
      console.log(`🔧 Operation: ${error.context.operation}`);
    }

    if (error.recoveryOptions.suggestedActions.length > 0) {
      console.log('\n💡 Suggestions:');
      for (const action of error.recoveryOptions.suggestedActions) {
        console.log(`   • ${action}`);
      }
    }

    console.log('\n🔄 Recovery Options:');
    if (error.recoveryOptions.canRetry) {
      console.log('   • Press Enter to try again');
    }
    if (error.recoveryOptions.canGoBack) {
      console.log('   • Type "back" to return to previous menu');
    }
    if (error.recoveryOptions.canSkip) {
      console.log('   • Type "skip" to skip this step');
    }
    console.log('   • Type "help" for more assistance');
    console.log('─'.repeat(60));
  }

  /**
   * Get recovery action from user
   */
  static async getRecoveryAction(
    error: InteractiveError,
    promptFunction: (message: string) => Promise<string>
  ): Promise<'retry' | 'back' | 'skip' | 'help' | 'exit'> {
    while (true) {
      const input = await promptFunction('\nWhat would you like to do? ');
      const choice = input.trim().toLowerCase();

      switch (choice) {
        case '':
        case 'retry':
        case 'r':
          if (error.recoveryOptions.canRetry) {
            return 'retry';
          }
          console.log('❌ Retry is not available for this error');
          break;

        case 'back':
        case 'b':
          if (error.recoveryOptions.canGoBack) {
            return 'back';
          }
          console.log('❌ Going back is not available for this error');
          break;

        case 'skip':
        case 's':
          if (error.recoveryOptions.canSkip) {
            return 'skip';
          }
          console.log('❌ Skipping is not available for this error');
          break;

        case 'help':
        case 'h':
        case '?':
          return 'help';

        case 'exit':
        case 'quit':
        case 'q':
          return 'exit';

        default:
          console.log('❌ Invalid choice. Please try again.');
          this.showRecoveryHelp(error);
      }
    }
  }

  /**
   * Show recovery help
   */
  static showRecoveryHelp(error: InteractiveError): void {
    console.log('\n❓ Available Recovery Actions:');
    
    if (error.recoveryOptions.canRetry) {
      console.log('   • "retry" or Enter - Try the operation again');
    }
    if (error.recoveryOptions.canGoBack) {
      console.log('   • "back" - Return to previous menu');
    }
    if (error.recoveryOptions.canSkip) {
      console.log('   • "skip" - Skip this step and continue');
    }
    console.log('   • "help" - Show this help message');
    console.log('   • "exit" - Exit the application');
  }

  /**
   * Log error to history
   */
  private static logError(error: InteractiveError): void {
    this.errorHistory.push(error);
    
    // Maintain history size limit
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Log to console in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEBUG] Interactive Error:', {
        type: error.type,
        message: error.message,
        context: error.context,
        originalError: error.originalError?.stack
      });
    }
  }

  /**
   * Get error statistics
   */
  static getErrorStatistics(): {
    total: number;
    byType: { [key: string]: number };
    recent: InteractiveError[];
  } {
    const byType: { [key: string]: number } = {};
    
    for (const error of this.errorHistory) {
      byType[error.type] = (byType[error.type] || 0) + 1;
    }

    return {
      total: this.errorHistory.length,
      byType,
      recent: this.errorHistory.slice(-10)
    };
  }

  /**
   * Clear error history
   */
  static clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Wrap async operation with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    promptFunction: (message: string) => Promise<string>
  ): Promise<T | null> {
    while (true) {
      try {
        return await operation();
      } catch (originalError) {
        const error = this.categorizeError(originalError as Error, context);
        await this.displayError(error);
        
        const action = await this.getRecoveryAction(error, promptFunction);
        
        switch (action) {
          case 'retry':
            continue; // Try again
          case 'back':
          case 'skip':
          case 'exit':
            return null; // Let caller handle these
          case 'help':
            await this.showDetailedHelp(error);
            continue;
        }
      }
    }
  }

  /**
   * Categorize error based on type and message
   */
  private static categorizeError(error: Error, context: ErrorContext): InteractiveError {
    if (error instanceof ValidationError) {
      return this.handleValidationError({ isValid: false, error: error.message }, context);
    }

    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout') || 
        message.includes('enotfound') || message.includes('econnrefused')) {
      return this.handleNetworkError(error, context);
    }

    if (message.includes('enoent') || message.includes('eacces') || message.includes('enospc')) {
      return this.handleSystemError(error, context);
    }

    if (message.includes('config') || message.includes('api key') || message.includes('provider')) {
      return this.handleConfigurationError(error, context);
    }

    return this.handleUnknownError(error, context);
  }

  /**
   * Show detailed help for an error
   */
  private static async showDetailedHelp(error: InteractiveError): Promise<void> {
    console.log('\n📚 Detailed Help');
    console.log('─'.repeat(40));
    
    switch (error.type) {
      case 'validation':
        console.log('🔍 Input Validation Error:');
        console.log('   This error occurs when your input doesn\'t meet the required format.');
        console.log('   Please check the suggestions above and correct your input.');
        break;
        
      case 'network':
        console.log('🌐 Network Error:');
        console.log('   This error occurs when there\'s a problem connecting to external services.');
        console.log('   Check your internet connection and try again.');
        break;
        
      case 'system':
        console.log('💻 System Error:');
        console.log('   This error occurs when there\'s a problem with file system operations.');
        console.log('   Check file permissions and available disk space.');
        break;
        
      case 'configuration':
        console.log('⚙️ Configuration Error:');
        console.log('   This error occurs when there\'s a problem with your settings.');
        console.log('   Run the setup wizard to reconfigure your environment.');
        break;
        
      default:
        console.log('❓ Unknown Error:');
        console.log('   An unexpected error occurred. Please try again or contact support.');
    }
    
    console.log('\n💡 General Tips:');
    console.log('   • Use "back" to return to the previous menu');
    console.log('   • Use "exit" to quit the application');
    console.log('   • Check the system status for configuration issues');
    console.log('   • Run diagnostics from the System Configuration menu');
    
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve(void 0));
      console.log('\nPress Enter to continue...');
    });
  }
}