/**
 * Context A/B Testing Infrastructure
 * Enables systematic comparison of document generation quality across different context window sizes
 * 
 * This module provides comprehensive A/B testing capabilities to measure the impact
 * of larger context windows on document generation quality and cost-effectiveness.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ContextQualityMeasurementFramework, ContextComparisonResult } from './ContextQualityMeasurementFramework.js';
import { ProjectLibraryLoader } from './ProjectLibraryLoader.js';
import { ConfigurationManager } from '../ConfigurationManager.js';

export interface ABTestConfiguration {
    testId: string;
    name: string;
    description: string;
    documentTypes: string[];
    contextConfigurations: ContextConfiguration[];
    testDuration?: number; // in days
    maxIterations?: number;
    randomizationStrategy: 'sequential' | 'random' | 'balanced';
    qualityThresholds: {
        minimumImprovement: number; // percentage
        significantImprovement: number; // percentage
        costEffectivenessThreshold: number; // ROI threshold
    };
    evaluationCriteria: {
        metrics: string[];
        weights: Record<string, number>;
        humanEvaluationRequired: boolean;
    };
}

export interface ContextConfiguration {
    id: string;
    name: string;
    description: string;
    tokenLimit: number;
    contextStrategy: 'limited' | 'smart' | 'full_library' | 'custom';
    customSettings?: Record<string, any>;
    expectedCost: number; // per document
    expectedQuality: number; // baseline score
}

export interface ABTestResult {
    testId: string;
    configuration: ABTestConfiguration;
    startTime: Date;
    endTime: Date;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    iterations: ABTestIteration[];
    summary: {
        totalIterations: number;
        successfulIterations: number;
        averageImprovement: number;
        bestConfiguration: string;
        costAnalysis: {
            totalCost: number;
            averageCostPerDocument: number;
            roi: number;
        };
        qualityAnalysis: {
            averageQualityScore: number;
            qualityImprovement: number;
            consistencyScore: number;
        };
        recommendations: string[];
    };
}

export interface ABTestIteration {
    iterationId: string;
    documentType: string;
    contextConfigurations: Array<{
        configId: string;
        result: ContextComparisonResult;
        timestamp: Date;
    }>;
    winner: string;
    improvement: number;
    costDifference: number;
}

export class ContextABTesting {
    private static instance: ContextABTesting;
    private activeTests: Map<string, ABTestResult> = new Map();
    private testHistory: Map<string, ABTestResult[]> = new Map();
    
    // Default test configurations
    private readonly defaultContextConfigurations: ContextConfiguration[] = [
        {
            id: 'limited_8k',
            name: 'Limited Context (8K)',
            description: 'Traditional limited context window approach',
            tokenLimit: 8000,
            contextStrategy: 'limited',
            expectedCost: 0.05,
            expectedQuality: 70
        },
        {
            id: 'smart_32k',
            name: 'Smart Context (32K)',
            description: 'Intelligent context selection with 32K tokens',
            tokenLimit: 32000,
            contextStrategy: 'smart',
            expectedCost: 0.15,
            expectedQuality: 75
        },
        {
            id: 'full_1m',
            name: 'Full Library (1M)',
            description: 'Complete project library with 1M token context',
            tokenLimit: 1000000,
            contextStrategy: 'full_library',
            expectedCost: 2.50,
            expectedQuality: 85
        },
        {
            id: 'optimized_500k',
            name: 'Optimized Context (500K)',
            description: 'Optimized context selection with 500K tokens',
            tokenLimit: 500000,
            contextStrategy: 'smart',
            expectedCost: 1.25,
            expectedQuality: 82
        }
    ];

    private framework!: ContextQualityMeasurementFramework;
    private libraryLoader!: ProjectLibraryLoader;
    private configManager!: ConfigurationManager;

    constructor() {
        if (ContextABTesting.instance) {
            return ContextABTesting.instance;
        }
        
        this.framework = new ContextQualityMeasurementFramework();
        this.libraryLoader = ProjectLibraryLoader.getInstance();
        this.configManager = ConfigurationManager.getInstance();
        ContextABTesting.instance = this;
    }

    static getInstance(): ContextABTesting {
        if (!ContextABTesting.instance) {
            ContextABTesting.instance = new ContextABTesting();
        }
        return ContextABTesting.instance;
    }

    /**
     * Run a comprehensive A/B test comparing different context configurations
     */
    async runABTest(
        projectPath: string,
        configuration: Partial<ABTestConfiguration> = {}
    ): Promise<ABTestResult> {
        const testConfig = this.buildTestConfiguration(configuration);
        const testResult = this.initializeTestResult(testConfig);
        
        console.log(`🧪 Starting A/B test: ${testConfig.name}`);
        console.log(`📊 Testing ${testConfig.documentTypes.length} document types`);
        console.log(`🎯 Comparing ${testConfig.contextConfigurations.length} context configurations`);

        try {
            this.activeTests.set(testConfig.testId, testResult);
            
            // Run test iterations
            const iterations = await this.runTestIterations(
                projectPath,
                testConfig,
                testResult
            );
            
            testResult.iterations = iterations;
            testResult.status = 'completed';
            testResult.endTime = new Date();
            
            // Generate summary
            testResult.summary = this.generateTestSummary(testResult);
            
            // Save results
            await this.saveTestResults(testResult);
            
            console.log(`✅ A/B test completed: ${testConfig.name}`);
            console.log(`📈 Average improvement: ${testResult.summary.averageImprovement.toFixed(2)}%`);
            console.log(`🏆 Best configuration: ${testResult.summary.bestConfiguration}`);
            
            return testResult;
            
        } catch (error) {
            testResult.status = 'failed';
            testResult.endTime = new Date();
            console.error(`❌ A/B test failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        } finally {
            this.activeTests.delete(testConfig.testId);
            this.addToTestHistory(testResult);
        }
    }

    /**
     * Run quick comparison test for specific document type
     */
    async runQuickComparison(
        projectPath: string,
        documentType: string,
        contextConfigs: string[] = ['limited_8k', 'full_1m']
    ): Promise<ContextComparisonResult> {
        console.log(`⚡ Running quick comparison for ${documentType}`);
        
        const configs = this.defaultContextConfigurations.filter(
            config => contextConfigs.includes(config.id)
        );
        
        if (configs.length < 2) {
            throw new Error('At least 2 context configurations required for comparison');
        }
        
        // Run comparison between first two configurations
        const limitedConfig = configs[0];
        const fullConfig = configs[1];
        
        return await this.framework.runContextComparisonTest(
            documentType,
            projectPath,
            {
                limitedContextTokens: limitedConfig.tokenLimit,
                fullContextTokens: fullConfig.tokenLimit,
                modelOverride: this.getCurrentModel()
            }
        );
    }

    /**
     * Run continuous monitoring test
     */
    async runContinuousMonitoring(
        projectPath: string,
        configuration: {
            documentTypes: string[];
            monitoringInterval: number; // in hours
            duration: number; // in days
            alertThresholds: {
                qualityDrop: number;
                costIncrease: number;
                consistencyDrop: number;
            };
        }
    ): Promise<void> {
        console.log(`📊 Starting continuous monitoring for ${configuration.duration} days`);
        
        const startTime = Date.now();
        const endTime = startTime + (configuration.duration * 24 * 60 * 60 * 1000);
        const intervalMs = configuration.monitoringInterval * 60 * 60 * 1000;
        
        while (Date.now() < endTime) {
            try {
                console.log(`🔍 Running monitoring check...`);
                
                // Run quick comparison for each document type
                const results: ContextComparisonResult[] = [];
                for (const docType of configuration.documentTypes) {
                    const result = await this.runQuickComparison(
                        projectPath,
                        docType,
                        ['limited_8k', 'full_1m']
                    );
                    results.push(result);
                }
                
                // Analyze results for alerts
                await this.analyzeMonitoringResults(results, configuration.alertThresholds);
                
                // Wait for next interval
                await this.sleep(intervalMs);
                
            } catch (error) {
                console.error(`❌ Monitoring check failed: ${error instanceof Error ? error.message : String(error)}`);
                await this.sleep(intervalMs);
            }
        }
        
        console.log(`✅ Continuous monitoring completed`);
    }

    /**
     * Generate comprehensive test report
     */
    async generateTestReport(testId: string): Promise<string> {
        const testResult = this.activeTests.get(testId) || 
                          this.getTestFromHistory(testId);
        
        if (!testResult) {
            throw new Error(`Test result not found: ${testId}`);
        }
        
        return this.createTestReport(testResult);
    }

    /**
     * Get test statistics and trends
     */
    getTestStatistics(): {
        totalTests: number;
        averageImprovement: number;
        bestPerformingConfiguration: string;
        costEffectivenessTrend: Array<{ date: Date; roi: number }>;
        qualityTrend: Array<{ date: Date; quality: number }>;
        recommendations: string[];
    } {
        const allTests = Array.from(this.testHistory.values()).flat();
        
        if (allTests.length === 0) {
            return {
                totalTests: 0,
                averageImprovement: 0,
                bestPerformingConfiguration: 'N/A',
                costEffectivenessTrend: [],
                qualityTrend: [],
                recommendations: ['No test data available']
            };
        }
        
        const averageImprovement = allTests.reduce(
            (sum, test) => sum + test.summary.averageImprovement, 0
        ) / allTests.length;
        
        // Find best performing configuration
        const configPerformance = new Map<string, number>();
        allTests.forEach(test => {
            const configId = test.summary.bestConfiguration;
            configPerformance.set(configId, (configPerformance.get(configId) || 0) + 1);
        });
        
        const bestConfig = Array.from(configPerformance.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        
        // Generate trends
        const costTrend = allTests.map(test => ({
            date: test.endTime,
            roi: test.summary.costAnalysis.roi
        })).sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const qualityTrend = allTests.map(test => ({
            date: test.endTime,
            quality: test.summary.qualityAnalysis.averageQualityScore
        })).sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(allTests);
        
        return {
            totalTests: allTests.length,
            averageImprovement,
            bestPerformingConfiguration: bestConfig,
            costEffectivenessTrend: costTrend,
            qualityTrend,
            recommendations
        };
    }

    /**
     * Build test configuration from partial configuration
     */
    private buildTestConfiguration(config: Partial<ABTestConfiguration>): ABTestConfiguration {
        return {
            testId: config.testId || `test_${Date.now()}`,
            name: config.name || 'Context Window A/B Test',
            description: config.description || 'Comparing document generation quality across different context window sizes',
            documentTypes: config.documentTypes || [
                'project-charter',
                'requirements-documentation',
                'technical-design',
                'quality-metrics'
            ],
            contextConfigurations: config.contextConfigurations || this.defaultContextConfigurations,
            testDuration: config.testDuration || 1,
            maxIterations: config.maxIterations || 10,
            randomizationStrategy: config.randomizationStrategy || 'balanced',
            qualityThresholds: {
                minimumImprovement: 5,
                significantImprovement: 15,
                costEffectivenessThreshold: 2.0,
                ...config.qualityThresholds
            },
            evaluationCriteria: {
                metrics: ['completeness', 'accuracy', 'consistency', 'relevance', 'professional_quality'],
                weights: {
                    completeness: 0.25,
                    accuracy: 0.20,
                    consistency: 0.15,
                    relevance: 0.15,
                    professional_quality: 0.25
                },
                humanEvaluationRequired: false,
                ...config.evaluationCriteria
            }
        };
    }

    /**
     * Initialize test result
     */
    private initializeTestResult(config: ABTestConfiguration): ABTestResult {
        return {
            testId: config.testId,
            configuration: config,
            startTime: new Date(),
            endTime: new Date(),
            status: 'running',
            iterations: [],
            summary: {
                totalIterations: 0,
                successfulIterations: 0,
                averageImprovement: 0,
                bestConfiguration: '',
                costAnalysis: {
                    totalCost: 0,
                    averageCostPerDocument: 0,
                    roi: 0
                },
                qualityAnalysis: {
                    averageQualityScore: 0,
                    qualityImprovement: 0,
                    consistencyScore: 0
                },
                recommendations: []
            }
        };
    }

    /**
     * Run test iterations
     */
    private async runTestIterations(
        projectPath: string,
        config: ABTestConfiguration,
        testResult: ABTestResult
    ): Promise<ABTestIteration[]> {
        const iterations: ABTestIteration[] = [];
        const maxIterations = config.maxIterations || 10;
        
        for (let i = 0; i < maxIterations; i++) {
            console.log(`🔄 Running iteration ${i + 1}/${maxIterations}`);
            
            // Select document type for this iteration
            const documentType = this.selectDocumentType(config.documentTypes, i);
            
            // Run comparison test
            const iteration = await this.runSingleIteration(
                projectPath,
                documentType,
                config,
                i
            );
            
            iterations.push(iteration);
            
            // Check if we should stop early
            if (this.shouldStopEarly(iterations, config)) {
                console.log(`⏹️  Stopping early based on convergence criteria`);
                break;
            }
        }
        
        return iterations;
    }

    /**
     * Run single test iteration
     */
    private async runSingleIteration(
        projectPath: string,
        documentType: string,
        config: ABTestConfiguration,
        iterationNumber: number
    ): Promise<ABTestIteration> {
        const iterationId = `${config.testId}_iter_${iterationNumber}`;
        const results: Array<{ configId: string; result: ContextComparisonResult; timestamp: Date }> = [];
        
        // Compare limited vs full context configurations
        const limitedConfig = config.contextConfigurations.find(c => c.contextStrategy === 'limited') ||
                             config.contextConfigurations[0];
        const fullConfig = config.contextConfigurations.find(c => c.contextStrategy === 'full_library') ||
                          config.contextConfigurations[config.contextConfigurations.length - 1];
        
        const comparison = await this.framework.runContextComparisonTest(
            documentType,
            projectPath,
            {
                limitedContextTokens: limitedConfig.tokenLimit,
                fullContextTokens: fullConfig.tokenLimit,
                modelOverride: this.getCurrentModel()
            }
        );
        
        results.push({
            configId: limitedConfig.id,
            result: comparison,
            timestamp: new Date()
        });
        
        results.push({
            configId: fullConfig.id,
            result: comparison,
            timestamp: new Date()
        });
        
        // Determine winner
        const improvement = comparison.improvementMetrics.overallImprovement;
        const winner = improvement > config.qualityThresholds.minimumImprovement ? 
                      fullConfig.id : limitedConfig.id;
        
        return {
            iterationId,
            documentType,
            contextConfigurations: results,
            winner,
            improvement,
            costDifference: comparison.costAnalysis.tokenCostDifference
        };
    }

    /**
     * Select document type for iteration
     */
    private selectDocumentType(
        documentTypes: string[],
        iterationNumber: number
    ): string {
        return documentTypes[iterationNumber % documentTypes.length];
    }

    /**
     * Check if test should stop early
     */
    private shouldStopEarly(
        iterations: ABTestIteration[],
        config: ABTestConfiguration
    ): boolean {
        if (iterations.length < 3) return false;
        
        // Check for convergence
        const recentImprovements = iterations.slice(-3).map(iter => iter.improvement);
        const variance = this.calculateVariance(recentImprovements);
        const mean = recentImprovements.reduce((a, b) => a + b, 0) / recentImprovements.length;
        
        // Stop if variance is low and we have enough data
        return variance < 5 && iterations.length >= 5;
    }

    /**
     * Calculate variance
     */
    private calculateVariance(values: number[]): number {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Generate test summary
     */
    private generateTestSummary(testResult: ABTestResult): ABTestResult['summary'] {
        const iterations = testResult.iterations;
        
        if (iterations.length === 0) {
            return testResult.summary;
        }
        
        const successfulIterations = iterations.filter(iter => iter.improvement > 0).length;
        const averageImprovement = iterations.reduce((sum, iter) => sum + iter.improvement, 0) / iterations.length;
        
        // Find best configuration
        const configWins = new Map<string, number>();
        iterations.forEach(iter => {
            configWins.set(iter.winner, (configWins.get(iter.winner) || 0) + 1);
        });
        const bestConfiguration = Array.from(configWins.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
        
        // Calculate costs
        const totalCost = iterations.reduce((sum, iter) => sum + iter.costDifference, 0);
        const averageCostPerDocument = totalCost / iterations.length;
        
        // Calculate quality metrics
        const qualityScores = iterations.map(iter => 
            iter.contextConfigurations.find(c => c.configId === iter.winner)?.result.fullContextResult.overallScore || 0
        );
        const averageQualityScore = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
        
        // Calculate ROI
        const qualityValue = averageImprovement * 10; // $10 per quality point
        const roi = qualityValue / Math.max(averageCostPerDocument, 0.01);
        
        // Generate recommendations
        const recommendations = this.generateTestRecommendations(testResult);
        
        return {
            totalIterations: iterations.length,
            successfulIterations,
            averageImprovement,
            bestConfiguration,
            costAnalysis: {
                totalCost,
                averageCostPerDocument,
                roi
            },
            qualityAnalysis: {
                averageQualityScore,
                qualityImprovement: averageImprovement,
                consistencyScore: this.calculateConsistencyScore(iterations)
            },
            recommendations
        };
    }

    /**
     * Generate test recommendations
     */
    private generateTestRecommendations(testResult: ABTestResult): string[] {
        const recommendations: string[] = [];
        const summary = testResult.summary;
        
        if (summary.averageImprovement > testResult.configuration.qualityThresholds.significantImprovement) {
            recommendations.push(`✅ Significant quality improvement (${summary.averageImprovement.toFixed(1)}%) - recommend using larger context windows`);
        } else if (summary.averageImprovement > testResult.configuration.qualityThresholds.minimumImprovement) {
            recommendations.push(`⚠️ Moderate quality improvement (${summary.averageImprovement.toFixed(1)}%) - consider larger context for critical documents`);
        } else {
            recommendations.push(`❌ Limited quality improvement (${summary.averageImprovement.toFixed(1)}%) - current context approach is sufficient`);
        }
        
        if (summary.costAnalysis.roi > testResult.configuration.qualityThresholds.costEffectivenessThreshold) {
            recommendations.push(`💰 High ROI (${summary.costAnalysis.roi.toFixed(2)}x) - cost-effective to use larger context`);
        } else {
            recommendations.push(`💸 Low ROI (${summary.costAnalysis.roi.toFixed(2)}x) - consider cost optimization`);
        }
        
        if (summary.qualityAnalysis.consistencyScore > 80) {
            recommendations.push(`🎯 High consistency - reliable quality improvements`);
        } else {
            recommendations.push(`📊 Variable results - monitor quality closely`);
        }
        
        return recommendations;
    }

    /**
     * Generate general recommendations from test history
     */
    private generateRecommendations(allTests: ABTestResult[]): string[] {
        const recommendations: string[] = [];
        
        if (allTests.length === 0) {
            return ['Run more A/B tests to generate recommendations'];
        }
        
        const avgImprovement = allTests.reduce((sum, test) => sum + test.summary.averageImprovement, 0) / allTests.length;
        const avgROI = allTests.reduce((sum, test) => sum + test.summary.costAnalysis.roi, 0) / allTests.length;
        
        if (avgImprovement > 15) {
            recommendations.push('Large context windows consistently improve document quality - implement as standard practice');
        }
        
        if (avgROI > 3) {
            recommendations.push('High ROI on larger context windows - scale up usage');
        }
        
        const bestConfigs = allTests.map(test => test.summary.bestConfiguration);
        const mostCommonBest = bestConfigs.sort((a,b) =>
            bestConfigs.filter(v => v === a).length - bestConfigs.filter(v => v === b).length
        ).pop();
        
        if (mostCommonBest) {
            recommendations.push(`Most effective configuration: ${mostCommonBest} - use as default`);
        }
        
        return recommendations;
    }

    /**
     * Calculate consistency score
     */
    private calculateConsistencyScore(iterations: ABTestIteration[]): number {
        if (iterations.length < 2) return 100;
        
        const improvements = iterations.map(iter => iter.improvement);
        const mean = improvements.reduce((a, b) => a + b, 0) / improvements.length;
        const variance = this.calculateVariance(improvements);
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to 0-100 scale (lower deviation = higher consistency)
        return Math.max(0, 100 - (standardDeviation * 5));
    }

    /**
     * Analyze monitoring results for alerts
     */
    private async analyzeMonitoringResults(
        results: ContextComparisonResult[],
        thresholds: { qualityDrop: number; costIncrease: number; consistencyDrop: number }
    ): Promise<void> {
        const avgImprovement = results.reduce((sum, result) => 
            sum + result.improvementMetrics.overallImprovement, 0) / results.length;
        
        const avgCost = results.reduce((sum, result) => 
            sum + result.costAnalysis.tokenCostDifference, 0) / results.length;
        
        // Check for alerts
        if (avgImprovement < thresholds.qualityDrop) {
            console.warn(`⚠️  Quality drop detected: ${avgImprovement.toFixed(1)}%`);
        }
        
        if (avgCost > thresholds.costIncrease) {
            console.warn(`⚠️  Cost increase detected: $${avgCost.toFixed(4)}`);
        }
    }

    /**
     * Create comprehensive test report
     */
    private createTestReport(testResult: ABTestResult): string {
        const config = testResult.configuration;
        const summary = testResult.summary;
        
        return `
# Context Window A/B Test Report

**Test ID:** ${testResult.testId}  
**Test Name:** ${config.name}  
**Duration:** ${testResult.startTime.toISOString()} - ${testResult.endTime.toISOString()}  
**Status:** ${testResult.status.toUpperCase()}  

## Executive Summary

This A/B test compared document generation quality across ${config.contextConfigurations.length} different context window configurations over ${summary.totalIterations} iterations.

**Key Findings:**
- **Average Quality Improvement:** ${summary.averageImprovement.toFixed(2)}%
- **Best Performing Configuration:** ${summary.bestConfiguration}
- **Cost-Effectiveness (ROI):** ${summary.costAnalysis.roi.toFixed(2)}x
- **Success Rate:** ${((summary.successfulIterations / summary.totalIterations) * 100).toFixed(1)}%

## Test Configuration

### Document Types Tested
${config.documentTypes.map(type => `- ${type}`).join('\n')}

### Context Configurations
${config.contextConfigurations.map(config => `
#### ${config.name} (${config.id})
- **Token Limit:** ${config.tokenLimit.toLocaleString()}
- **Strategy:** ${config.contextStrategy}
- **Expected Cost:** $${config.expectedCost}
- **Expected Quality:** ${config.expectedQuality}/100
`).join('\n')}

## Results Analysis

### Quality Metrics
| Metric | Value |
|--------|-------|
| Average Quality Score | ${summary.qualityAnalysis.averageQualityScore.toFixed(1)}/100 |
| Quality Improvement | ${summary.qualityAnalysis.qualityImprovement.toFixed(2)}% |
| Consistency Score | ${summary.qualityAnalysis.consistencyScore.toFixed(1)}/100 |
| Success Rate | ${((summary.successfulIterations / summary.totalIterations) * 100).toFixed(1)}% |

### Cost Analysis
| Metric | Value |
|--------|-------|
| Total Test Cost | $${summary.costAnalysis.totalCost.toFixed(4)} |
| Average Cost per Document | $${summary.costAnalysis.averageCostPerDocument.toFixed(4)} |
| Return on Investment | ${summary.costAnalysis.roi.toFixed(2)}x |

### Iteration Results
${testResult.iterations.map((iter, index) => `
#### Iteration ${index + 1}: ${iter.documentType}
- **Winner:** ${iter.winner}
- **Improvement:** ${iter.improvement.toFixed(2)}%
- **Cost Difference:** $${iter.costDifference.toFixed(4)}
`).join('\n')}

## Recommendations

${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. **Implement Best Configuration:** Deploy the winning configuration (${summary.bestConfiguration}) as the default approach
2. **Monitor Performance:** Set up continuous monitoring to track quality and cost metrics
3. **Optimize Further:** Investigate ways to reduce costs while maintaining quality improvements
4. **Expand Testing:** Run additional tests on other document types and project configurations

---

*Report generated by Context A/B Testing Infrastructure*
`;
    }

    /**
     * Save test results
     */
    private async saveTestResults(testResult: ABTestResult): Promise<void> {
        const resultsDir = path.join(process.cwd(), 'test-results', 'context-ab-testing');
        await fs.mkdir(resultsDir, { recursive: true });
        
        const filename = `test_${testResult.testId}_${Date.now()}.json`;
        const filepath = path.join(resultsDir, filename);
        
        await fs.writeFile(filepath, JSON.stringify(testResult, null, 2));
        console.log(`💾 Test results saved to: ${filepath}`);
    }

    /**
     * Add test to history
     */
    private addToTestHistory(testResult: ABTestResult): void {
        if (!this.testHistory.has(testResult.testId)) {
            this.testHistory.set(testResult.testId, []);
        }
        this.testHistory.get(testResult.testId)!.push(testResult);
    }

    /**
     * Get test from history
     */
    private getTestFromHistory(testId: string): ABTestResult | undefined {
        for (const tests of this.testHistory.values()) {
            const test = tests.find(t => t.testId === testId);
            if (test) return test;
        }
        return undefined;
    }

    /**
     * Get current model
     */
    private getCurrentModel(): string {
        return this.configManager.get<string>('deployment_name', 'gemini-1.5-pro');
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
