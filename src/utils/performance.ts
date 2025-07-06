/**
 * Performance Monitoring Utilities
 * Provides timing and metrics for CLI commands
 */

// 1. Node.js built-ins
import { performance } from 'perf_hooks';

// 2. Third-party dependencies (none)

// 3. Internal modules (none)

interface PerformanceMetrics {
  commandName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  success: boolean;
  errorMessage?: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  /**
   * Start timing a command
   */
  startCommand(commandName: string): string {
    const id = `${commandName}-${Date.now()}-${Math.random()}`;
    const startTime = performance.now();
    
    this.metrics.set(id, {
      commandName,
      startTime,
      success: false
    });

    if (process.env.DEBUG) {
      console.log(`🚀 Starting command: ${commandName}`);
    }

    return id;
  }

  /**
   * End timing a command
   */
  endCommand(id: string, success: boolean = true, errorMessage?: string): PerformanceMetrics | null {
    const metrics = this.metrics.get(id);
    if (!metrics) {
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metrics.startTime;
    const memoryUsage = process.memoryUsage();

    const updatedMetrics: PerformanceMetrics = {
      ...metrics,
      endTime,
      duration,
      memoryUsage,
      success,
      errorMessage
    };

    this.metrics.set(id, updatedMetrics);

    if (process.env.DEBUG) {
      const status = success ? '✅' : '❌';
      console.log(`${status} Command ${metrics.commandName} completed in ${this.formatDuration(duration)}`);
      console.log(`   Memory: ${this.formatMemory(memoryUsage.heapUsed)} heap, ${this.formatMemory(memoryUsage.rss)} RSS`);
    }

    return updatedMetrics;
  }

  /**
   * Get metrics for a command
   */
  getMetrics(id: string): PerformanceMetrics | null {
    return this.metrics.get(id) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const allMetrics = this.getAllMetrics().filter(m => m.duration);
    
    if (allMetrics.length === 0) {
      return 'No performance data available.';
    }

    const successful = allMetrics.filter(m => m.success);
    const failed = allMetrics.filter(m => !m.success);
    
    const avgDuration = successful.reduce((sum, m) => sum + (m.duration || 0), 0) / successful.length;
    const totalDuration = allMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);

    let report = `\n📊 Performance Report\n`;
    report += `════════════════════\n`;
    report += `Total Commands: ${allMetrics.length}\n`;
    report += `Successful: ${successful.length}\n`;
    report += `Failed: ${failed.length}\n`;
    report += `Average Duration: ${this.formatDuration(avgDuration)}\n`;
    report += `Total Duration: ${this.formatDuration(totalDuration)}\n\n`;

    if (allMetrics.length > 0) {
      report += `Command Details:\n`;
      allMetrics.forEach(m => {
        const status = m.success ? '✅' : '❌';
        report += `${status} ${m.commandName}: ${this.formatDuration(m.duration || 0)}\n`;
        if (!m.success && m.errorMessage) {
          report += `   Error: ${m.errorMessage}\n`;
        }
      });
    }

    return report;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Format memory in human-readable format
   */
  private formatMemory(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)}MB`;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring command performance
 */
export function measurePerformance(commandName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      const id = performanceMonitor.startCommand(commandName);
      
      try {
        const result = await method.apply(this, args);
        performanceMonitor.endCommand(id, true);
        return result;
      } catch (error) {
        performanceMonitor.endCommand(id, false, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    }) as T;

    return descriptor;
  };
}

/**
 * Simple function wrapper for performance measurement
 */
export async function withPerformanceTracking<T>(
  commandName: string,
  fn: () => Promise<T>
): Promise<T> {
  const id = performanceMonitor.startCommand(commandName);
  
  try {
    const result = await fn();
    performanceMonitor.endCommand(id, true);
    return result;
  } catch (error) {
    performanceMonitor.endCommand(id, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export type { PerformanceMetrics };
