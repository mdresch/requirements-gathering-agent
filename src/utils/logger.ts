/**
 * Logger Implementation
 * Provides structured logging with different levels and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: any;
  module: string;
}

export class Logger {
  private module: string;
  private minLevel: LogLevel;

  constructor(module: string, minLevel: LogLevel = 'info') {
    this.module = module;
    this.minLevel = minLevel;
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      module: this.module
    };

    this.output(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.minLevel);
    return currentIndex >= minIndex;
  }

  private output(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelUpper = entry.level.toUpperCase().padEnd(5);
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    
    const logMessage = `[${timestamp}] ${levelUpper} [${entry.module}] ${entry.message}${contextStr}`;

    switch (entry.level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  createChild(childModule: string): Logger {
    return new Logger(`${this.module}:${childModule}`, this.minLevel);
  }
}

// Legacy compatibility export
export const logger = new Logger('adobe');
