/**
 * Common Command Utilities
 * Shared utility functions for CLI commands
 */

// 1. Node.js built-ins
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createRequire } from 'module';

// 2. Third-party dependencies (none in this file)

// 3. Internal modules (none in this file)

// 4. Constants and configuration
const require = createRequire(import.meta.url);

/**
 * Get package version from package.json
 */
export function getPackageVersion(): string {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const { version } = require(packagePath);
    return version;
  } catch {
    return 'unknown';
  }
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Create progress indicator
 */
export function createProgressIndicator(current: number, total: number, description?: string): string {
  const percentage = Math.round((current / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + 
                     '░'.repeat(20 - Math.floor(percentage / 5));
  
  const baseProgress = `[${progressBar}] ${percentage}% (${current}/${total})`;
  
  return description 
    ? `${baseProgress} - ${description}`
    : baseProgress;
}

/**
 * Safely execute async operation with error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`❌ ${errorMessage}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Check if running in quiet mode from CLI args
 */
export function isQuietMode(): boolean {
  return process.argv.includes('--quiet') || process.argv.includes('-q');
}

/**
 * Check if running in verbose mode from CLI args
 */
export function isVerboseMode(): boolean {
  return process.argv.includes('--verbose') || process.argv.includes('-v');
}

/**
 * Log with timestamp and level
 */
export function logWithLevel(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔵 INFO',
    warn: '🟡 WARN',
    error: '🔴 ERROR'
  }[level];
  
  console.log(`[${timestamp}] ${prefix}: ${message}`, ...args);
}

/**
 * Create a simple spinner for async operations
 */
export class SimpleSpinner {
  private timer?: NodeJS.Timeout;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private index = 0;
  private text: string;

  constructor(text: string = 'Loading...') {
    this.text = text;
  }

  start(): void {
    if (isQuietMode()) return;
    
    this.timer = setInterval(() => {
      process.stdout.write(`\r${this.frames[this.index]} ${this.text}`);
      this.index = (this.index + 1) % this.frames.length;
    }, 100);
  }

  stop(finalText?: string): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    
    if (!isQuietMode()) {
      process.stdout.write(`\r${finalText || '✅ Complete!'}\n`);
    }
  }

  updateText(text: string): void {
    this.text = text;
  }
}

/**
 * Debounce function for rate limiting
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
