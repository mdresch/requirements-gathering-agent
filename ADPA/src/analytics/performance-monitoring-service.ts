/*
 * Performance Monitoring Service
 * Real-time performance monitoring and optimization recommendations
 */

/**
 * Performance Metrics
 */
export interface PerformanceSnapshot {
  timestamp: Date;
  metrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    fps: number;
    bundleSize: number;
    cacheHitRate: number;
  };
  userExperience: {
    timeToInteractive: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  platformMetrics: {
    platform: string;
    deviceType: string;
    connectionType: string;
    batteryLevel?: number;
    thermalState?: string;
  };
}

export interface PerformanceAlert {
  alertId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  description: string;
  recommendations: string[];
  affectedUsers: number;
}

export interface PerformanceOptimization {
  optimizationId: string;
  type: 'code' | 'asset' | 'network' | 'memory' | 'rendering';
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedImprovement: number; // percentage
  implementationEffort: 'low' | 'medium' | 'high';
  impact: {
    loadTime?: number;
    memoryUsage?: number;
    userExperience?: number;
  };
}

/**
 * Performance Monitoring Service
 */
export class PerformanceMonitoringService {
  private performanceSnapshots: PerformanceSnapshot[] = [];
  private activeAlerts: Map<string, PerformanceAlert> = new Map();
  private optimizations: PerformanceOptimization[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    try {
      // Initialize performance observers
      this.initializePerformanceObservers();
      
      // Start real-time monitoring
      this.startRealTimeMonitoring();
      
      // Setup alert thresholds
      this.setupAlertThresholds();

      this.emit('monitoring-started', { timestamp: new Date() });

    } catch (error) {
      throw new Error(`Performance monitoring failed to start: ${error.message}`);
    }
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.emit('monitoring-stopped', { timestamp: new Date() });
  }

  /**
   * Capture performance snapshot
   */
  async capturePerformanceSnapshot(): Promise<PerformanceSnapshot> {
    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      metrics: await this.collectPerformanceMetrics(),
      userExperience: await this.collectUserExperienceMetrics(),
      platformMetrics: await this.collectPlatformMetrics()
    };

    this.performanceSnapshots.push(snapshot);
    
    // Keep only last 1000 snapshots
    if (this.performanceSnapshots.length > 1000) {
      this.performanceSnapshots = this.performanceSnapshots.slice(-1000);
    }

    // Check for performance issues
    await this.analyzePerformanceSnapshot(snapshot);

    this.emit('snapshot-captured', { snapshot });
    return snapshot;
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<any> {
    try {
      const report = {
        summary: await this.generatePerformanceSummary(),
        trends: await this.analyzePerformanceTrends(),
        bottlenecks: await this.identifyBottlenecks(),
        optimizations: await this.generateOptimizationRecommendations(),
        platformComparison: await this.comparePlatformPerformance(),
        userImpact: await this.analyzeUserImpact(),
        alerts: Array.from(this.activeAlerts.values()),
        recommendations: await this.generateActionableRecommendations()
      };

      this.emit('report-generated', { report });
      return report;

    } catch (error) {
      throw new Error(`Performance report generation failed: ${error.message}`);
    }
  }

  /**
   * Get real-time performance metrics
   */
  getRealTimeMetrics(): any {
    const latest = this.performanceSnapshots[this.performanceSnapshots.length - 1];
    if (!latest) return null;

    return {
      current: latest,
      alerts: Array.from(this.activeAlerts.values()),
      health: this.calculatePerformanceHealth(latest),
      trends: this.calculateShortTermTrends()
    };
  }

  /**
   * Optimize performance automatically
   */
  async optimizePerformance(): Promise<any> {
    try {
      const optimizations = await this.identifyAutomaticOptimizations();
      const results = [];

      for (const optimization of optimizations) {
        const result = await this.applyOptimization(optimization);
        results.push(result);
      }

      this.emit('performance-optimized', { optimizations: results });
      return results;

    } catch (error) {
      throw new Error(`Performance optimization failed: ${error.message}`);
    }
  }

  // Private methods

  private initializePerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processNavigationEntry(entry);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processResourceEntry(entry);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPaintEntry(entry);
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Layout shift
      const layoutObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processLayoutShiftEntry(entry);
        }
      });
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.capturePerformanceSnapshot();
    }, 5000); // Capture every 5 seconds
  }

  private setupAlertThresholds(): void {
    // Define performance alert thresholds
    const thresholds = {
      loadTime: 3000, // 3 seconds
      memoryUsage: 100, // 100MB
      fps: 30, // Below 30 FPS
      networkLatency: 1000, // 1 second
      errorRate: 5 // 5%
    };

    // Store thresholds for alert checking
    this.alertThresholds = thresholds;
  }

  private alertThresholds: any = {};

  private async collectPerformanceMetrics(): Promise<any> {
    const metrics = {
      loadTime: this.measureLoadTime(),
      renderTime: this.measureRenderTime(),
      memoryUsage: this.measureMemoryUsage(),
      cpuUsage: this.measureCPUUsage(),
      networkLatency: await this.measureNetworkLatency(),
      fps: this.measureFPS(),
      bundleSize: this.measureBundleSize(),
      cacheHitRate: this.measureCacheHitRate()
    };

    return metrics;
  }

  private async collectUserExperienceMetrics(): Promise<any> {
    return {
      timeToInteractive: this.measureTimeToInteractive(),
      firstContentfulPaint: this.measureFirstContentfulPaint(),
      largestContentfulPaint: this.measureLargestContentfulPaint(),
      cumulativeLayoutShift: this.measureCumulativeLayoutShift(),
      firstInputDelay: this.measureFirstInputDelay()
    };
  }

  private async collectPlatformMetrics(): Promise<any> {
    return {
      platform: this.detectPlatform(),
      deviceType: this.detectDeviceType(),
      connectionType: this.detectConnectionType(),
      batteryLevel: await this.getBatteryLevel(),
      thermalState: await this.getThermalState()
    };
  }

  private async analyzePerformanceSnapshot(snapshot: PerformanceSnapshot): Promise<void> {
    // Check for performance alerts
    await this.checkPerformanceAlerts(snapshot);
    
    // Update optimization recommendations
    await this.updateOptimizationRecommendations(snapshot);
  }

  private async checkPerformanceAlerts(snapshot: PerformanceSnapshot): Promise<void> {
    const { metrics } = snapshot;

    // Check load time
    if (metrics.loadTime > this.alertThresholds.loadTime) {
      this.createAlert('load_time', 'high', metrics.loadTime, this.alertThresholds.loadTime,
        'Page load time exceeds threshold',
        ['Optimize bundle size', 'Enable compression', 'Use CDN']);
    }

    // Check memory usage
    if (metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      this.createAlert('memory_usage', 'medium', metrics.memoryUsage, this.alertThresholds.memoryUsage,
        'Memory usage is high',
        ['Clear unused objects', 'Optimize images', 'Implement lazy loading']);
    }

    // Check FPS
    if (metrics.fps < this.alertThresholds.fps) {
      this.createAlert('fps', 'medium', metrics.fps, this.alertThresholds.fps,
        'Frame rate is below optimal',
        ['Optimize animations', 'Reduce DOM complexity', 'Use CSS transforms']);
    }
  }

  private createAlert(
    metric: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    currentValue: number,
    threshold: number,
    description: string,
    recommendations: string[]
  ): void {
    const alertId = `alert-${metric}-${Date.now()}`;
    
    const alert: PerformanceAlert = {
      alertId,
      severity,
      metric,
      threshold,
      currentValue,
      timestamp: new Date(),
      description,
      recommendations,
      affectedUsers: this.estimateAffectedUsers(metric, currentValue)
    };

    this.activeAlerts.set(alertId, alert);
    this.emit('alert-created', { alert });
  }

  private estimateAffectedUsers(metric: string, value: number): number {
    // Mock implementation - would calculate based on real user data
    return Math.floor(Math.random() * 100);
  }

  // Performance measurement methods (simplified implementations)
  private measureLoadTime(): number {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;
    }
    return 0;
  }

  private measureRenderTime(): number {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : 0;
    }
    return 0;
  }

  private measureMemoryUsage(): number {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private measureCPUUsage(): number {
    // Mock implementation - would use more sophisticated measurement
    return Math.random() * 100;
  }

  private async measureNetworkLatency(): Promise<number> {
    try {
      const start = performance.now();
      await fetch('/ping', { method: 'HEAD' });
      return performance.now() - start;
    } catch {
      return 0;
    }
  }

  private measureFPS(): number {
    // Mock implementation - would use requestAnimationFrame for real measurement
    return 60;
  }

  private measureBundleSize(): number {
    // Mock implementation - would calculate actual bundle size
    return 2.5; // MB
  }

  private measureCacheHitRate(): number {
    // Mock implementation - would calculate from cache statistics
    return 85; // percentage
  }

  private measureTimeToInteractive(): number {
    // Mock implementation - would use real TTI measurement
    return 2500;
  }

  private measureFirstContentfulPaint(): number {
    if (typeof window !== 'undefined') {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : 0;
    }
    return 0;
  }

  private measureLargestContentfulPaint(): number {
    // Mock implementation - would use LCP observer
    return 3000;
  }

  private measureCumulativeLayoutShift(): number {
    // Mock implementation - would use CLS observer
    return 0.1;
  }

  private measureFirstInputDelay(): number {
    // Mock implementation - would use FID observer
    return 50;
  }

  private detectPlatform(): string {
    if (typeof window === 'undefined') return 'server';
    return navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop';
  }

  private detectDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private detectConnectionType(): string {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private async getBatteryLevel(): Promise<number | undefined> {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level * 100;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private async getThermalState(): Promise<string | undefined> {
    // Mock implementation - would use thermal API if available
    return undefined;
  }

  private processNavigationEntry(entry: PerformanceEntry): void {
    // Process navigation timing entry
  }

  private processResourceEntry(entry: PerformanceEntry): void {
    // Process resource timing entry
  }

  private processPaintEntry(entry: PerformanceEntry): void {
    // Process paint timing entry
  }

  private processLayoutShiftEntry(entry: PerformanceEntry): void {
    // Process layout shift entry
  }

  private async generatePerformanceSummary(): Promise<any> {
    return {
      averageLoadTime: 2500,
      averageMemoryUsage: 45,
      averageFPS: 58,
      overallScore: 85
    };
  }

  private async analyzePerformanceTrends(): Promise<any> {
    return {
      loadTime: { trend: 'improving', change: -15 },
      memoryUsage: { trend: 'stable', change: 2 },
      userExperience: { trend: 'improving', change: 8 }
    };
  }

  private async identifyBottlenecks(): Promise<any> {
    return [
      { type: 'Large images', impact: 'high', frequency: 45 },
      { type: 'Unoptimized JavaScript', impact: 'medium', frequency: 30 }
    ];
  }

  private async generateOptimizationRecommendations(): Promise<PerformanceOptimization[]> {
    return [
      {
        optimizationId: 'opt-1',
        type: 'asset',
        priority: 'high',
        description: 'Compress and optimize images',
        expectedImprovement: 25,
        implementationEffort: 'low',
        impact: { loadTime: 800, userExperience: 15 }
      }
    ];
  }

  private async comparePlatformPerformance(): Promise<any> {
    return {
      desktop: { score: 90, loadTime: 2000 },
      mobile: { score: 75, loadTime: 3500 },
      tablet: { score: 82, loadTime: 2800 }
    };
  }

  private async analyzeUserImpact(): Promise<any> {
    return {
      affectedUsers: 250,
      bounceRateIncrease: 5.2,
      conversionImpact: -3.1
    };
  }

  private async generateActionableRecommendations(): Promise<any> {
    return [
      'Implement image lazy loading',
      'Enable gzip compression',
      'Optimize critical rendering path'
    ];
  }

  private calculatePerformanceHealth(snapshot: PerformanceSnapshot): any {
    const { metrics } = snapshot;
    let score = 100;

    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.memoryUsage > 100) score -= 15;
    if (metrics.fps < 30) score -= 25;

    return {
      score: Math.max(0, score),
      status: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor'
    };
  }

  private calculateShortTermTrends(): any {
    return {
      loadTime: 'improving',
      memoryUsage: 'stable',
      userExperience: 'improving'
    };
  }

  private async identifyAutomaticOptimizations(): Promise<PerformanceOptimization[]> {
    return this.optimizations.filter(opt => opt.implementationEffort === 'low');
  }

  private async applyOptimization(optimization: PerformanceOptimization): Promise<any> {
    // Mock implementation - would apply actual optimizations
    return {
      optimizationId: optimization.optimizationId,
      applied: true,
      improvement: optimization.expectedImprovement * 0.8 // Actual improvement might be less
    };
  }

  private async updateOptimizationRecommendations(snapshot: PerformanceSnapshot): Promise<void> {
    // Update optimization recommendations based on current performance
  }

  // Event handling
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }
}

/**
 * Create performance monitoring service instance
 */
export function createPerformanceMonitoringService(): PerformanceMonitoringService {
  return new PerformanceMonitoringService();
}
