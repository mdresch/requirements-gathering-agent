/**
 * Enhanced Metrics Manager with performance optimization
 */

import { ProviderMetrics } from "./types.js";

export class MetricsManager {
    private static instance: MetricsManager;
    private providerMetrics: Map<string, ProviderMetrics> = new Map();
    private readonly MAX_ERROR_TYPES = 50; // Prevent memory bloat from error tracking

    private constructor() {}

    static getInstance(): MetricsManager {
        if (!MetricsManager.instance) {
            MetricsManager.instance = new MetricsManager();
        }
        return MetricsManager.instance;
    }

    private initializeProviderMetrics(provider: string): void {
        if (!this.providerMetrics.has(provider)) {
            this.providerMetrics.set(provider, {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                lastUsed: new Date(),
                rateLimitHits: 0,
                errors: {}
            });
        }
    }

    updateMetrics(provider: string, success: boolean, responseTime: number, errorType?: string): void {
        this.initializeProviderMetrics(provider);
        const metrics = this.providerMetrics.get(provider)!;
        
        // Batch update for better performance
        const updates = {
            totalCalls: metrics.totalCalls + 1,
            lastUsed: new Date(),
            totalResponseTime: metrics.totalResponseTime + responseTime
        };

        Object.assign(metrics, updates);
        metrics.averageResponseTime = metrics.totalResponseTime / metrics.totalCalls;

        if (success) {
            metrics.successfulCalls++;
        } else {
            metrics.failedCalls++;
            if (errorType) {
                this.trackError(metrics, errorType);
            }
        }
    }

    private trackError(metrics: ProviderMetrics, errorType: string): void {
        // Prevent memory bloat from too many error types
        if (Object.keys(metrics.errors).length >= this.MAX_ERROR_TYPES && !metrics.errors[errorType]) {
            return;
        }

        metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
        
        if (errorType === 'rate_limit') {
            metrics.rateLimitHits++;
        }
    }

    getProviderMetrics(provider: string): ProviderMetrics | undefined {
        return this.providerMetrics.get(provider);
    }

    getAllMetrics(): Map<string, ProviderMetrics> {
        return new Map(this.providerMetrics);
    }

    generatePerformanceReport(): string {
        const providers = Array.from(this.providerMetrics.entries());
        
        if (providers.length === 0) {
            return "# AI Provider Performance Report\n\nNo metrics data available.\n";
        }

        let report = "# AI Provider Performance Report\n\n";
        
        for (const [provider, metrics] of providers) {
            const successRate = metrics.totalCalls > 0 ? 
                (metrics.successfulCalls / metrics.totalCalls * 100).toFixed(2) : '0.00';
            
            report += `## ${provider.toUpperCase()}\n`;
            report += `- **Total Calls**: ${metrics.totalCalls}\n`;
            report += `- **Success Rate**: ${successRate}%\n`;
            report += `- **Average Response Time**: ${metrics.averageResponseTime.toFixed(2)}ms\n`;
            report += `- **Rate Limit Hits**: ${metrics.rateLimitHits}\n`;
            report += `- **Last Used**: ${metrics.lastUsed.toISOString()}\n`;
            
            const errorCount = Object.keys(metrics.errors).length;
            if (errorCount > 0) {
                report += `- **Error Types**: ${errorCount}\n`;
                const topErrors = Object.entries(metrics.errors)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5); // Show only top 5 errors
                
                if (topErrors.length > 0) {
                    report += `- **Top Errors**:\n`;
                    for (const [errorType, count] of topErrors) {
                        report += `  - ${errorType}: ${count}\n`;
                    }
                }
            }
            report += '\n';
        }
        
        return report;
    }

    // Add performance analysis
    getPerformanceInsights(): Record<string, any> {
        const insights: Record<string, any> = {};
        
        for (const [provider, metrics] of this.providerMetrics) {
            const successRate = metrics.totalCalls > 0 ? 
                (metrics.successfulCalls / metrics.totalCalls) : 0;
            
            insights[provider] = {
                performance: successRate >= 0.95 ? 'excellent' : 
                           successRate >= 0.90 ? 'good' : 
                           successRate >= 0.75 ? 'fair' : 'poor',
                reliability: metrics.rateLimitHits / Math.max(metrics.totalCalls, 1),
                avgResponseTime: metrics.averageResponseTime,
                totalCalls: metrics.totalCalls,
                recommendation: this.getRecommendation(metrics, successRate)
            };
        }
        
        return insights;
    }

    private getRecommendation(metrics: ProviderMetrics, successRate: number): string {
        if (successRate < 0.75) {
            return "Consider switching providers or checking configuration";
        }
        if (metrics.rateLimitHits > metrics.totalCalls * 0.1) {
            return "Implement rate limiting or upgrade plan";
        }
        if (metrics.averageResponseTime > 10000) {
            return "Response times are high, consider optimization";
        }
        return "Provider performing well";
    }

    resetMetrics(provider?: string): void {
        if (provider) {
            this.providerMetrics.delete(provider);
        } else {
            this.providerMetrics.clear();
        }
    }

    // Export metrics for external analysis
    exportMetrics(): Record<string, ProviderMetrics> {
        const exported: Record<string, ProviderMetrics> = {};
        for (const [provider, metrics] of this.providerMetrics) {
            exported[provider] = { ...metrics };
        }
        return exported;
    }
}
