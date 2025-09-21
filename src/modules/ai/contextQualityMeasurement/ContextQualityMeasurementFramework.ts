/**
 * Context Quality Measurement Framework
 * Measures and compares LLM response quality across different context window sizes
 * 
 * This framework enables A/B testing between limited context (8K tokens) and 
 * full project context (1M+ tokens) to quantify the value of larger context windows.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ConfigurationManager } from '../ConfigurationManager.js';
import { ContextManager } from '../../contextManager.js';

export interface QualityMetric {
    name: string;
    score: number;
    weight: number;
    description: string;
    measurement: 'automated' | 'human' | 'hybrid';
}

export interface ContextTestResult {
    testId: string;
    contextSize: number;
    modelUsed: string;
    documentType: string;
    qualityMetrics: QualityMetric[];
    overallScore: number;
    responseTime: number;
    tokenUsage: {
        input: number;
        output: number;
        total: number;
    };
    timestamp: Date;
    projectContext: {
        filesIncluded: number;
        totalProjectSize: number;
        contextUtilization: number;
    };
}

export interface ContextComparisonResult {
    testId: string;
    documentType: string;
    limitedContextResult: ContextTestResult;
    fullContextResult: ContextTestResult;
    improvementMetrics: {
        overallImprovement: number;
        metricImprovements: Record<string, number>;
        significantImprovements: string[];
        regressionAreas: string[];
    };
    costAnalysis: {
        tokenCostDifference: number;
        timeCostDifference: number;
        qualityValue: number;
        roi: number;
    };
}

export class ContextQualityMeasurementFramework {
    private configManager: ConfigurationManager;
    private contextManager: ContextManager;
    private testResults: Map<string, ContextTestResult> = new Map();
    private comparisonResults: Map<string, ContextComparisonResult> = new Map();
    
    // Quality metric definitions
    private readonly qualityMetrics: QualityMetric[] = [
        {
            name: 'completeness',
            score: 0,
            weight: 0.25,
            description: 'How completely the document addresses all required sections and requirements',
            measurement: 'automated'
        },
        {
            name: 'accuracy',
            score: 0,
            weight: 0.20,
            description: 'Factual correctness and technical accuracy of the content',
            measurement: 'hybrid'
        },
        {
            name: 'consistency',
            score: 0,
            weight: 0.15,
            description: 'Internal consistency and alignment with project context',
            measurement: 'automated'
        },
        {
            name: 'relevance',
            score: 0,
            weight: 0.15,
            description: 'Relevance to the specific project and stakeholder needs',
            measurement: 'automated'
        },
        {
            name: 'professional_quality',
            score: 0,
            weight: 0.10,
            description: 'Professional presentation, formatting, and language quality',
            measurement: 'automated'
        },
        {
            name: 'standards_compliance',
            score: 0,
            weight: 0.10,
            description: 'Adherence to industry standards (PMBOK, BABOK, DMBOK)',
            measurement: 'automated'
        },
        {
            name: 'actionability',
            score: 0,
            weight: 0.05,
            description: 'Practical utility and actionability of recommendations',
            measurement: 'human'
        }
    ];

    constructor() {
        this.configManager = ConfigurationManager.getInstance();
        this.contextManager = ContextManager.getInstance();
    }

    /**
     * Run a comprehensive A/B test comparing limited vs full context
     */
    async runContextComparisonTest(
        documentType: string,
        projectPath: string,
        options: {
            limitedContextTokens?: number;
            fullContextTokens?: number;
            modelOverride?: string;
            customMetrics?: QualityMetric[];
        } = {}
    ): Promise<ContextComparisonResult> {
        const testId = `context_test_${Date.now()}_${documentType}`;
        
        console.log(`🧪 Starting context comparison test: ${testId}`);
        console.log(`📄 Document type: ${documentType}`);
        console.log(`📁 Project path: ${projectPath}`);

        // Configure test parameters
        const limitedTokens = options.limitedContextTokens || 8000;
        const fullTokens = options.fullContextTokens || 1000000;
        const model = options.modelOverride || this.getCurrentModel();
        const metrics = options.customMetrics || this.qualityMetrics;

        try {
            // Run limited context test
            console.log(`🔍 Running limited context test (${limitedTokens} tokens)...`);
            const limitedResult = await this.runSingleContextTest(
                testId,
                documentType,
                projectPath,
                limitedTokens,
                model,
                metrics
            );

            // Run full context test
            console.log(`🚀 Running full context test (${fullTokens} tokens)...`);
            const fullResult = await this.runSingleContextTest(
                testId,
                documentType,
                projectPath,
                fullTokens,
                model,
                metrics
            );

            // Calculate improvements
            const improvementMetrics = this.calculateImprovementMetrics(
                limitedResult,
                fullResult,
                metrics
            );

            // Calculate cost analysis
            const costAnalysis = this.calculateCostAnalysis(limitedResult, fullResult);

            const comparisonResult: ContextComparisonResult = {
                testId,
                documentType,
                limitedContextResult: limitedResult,
                fullContextResult: fullResult,
                improvementMetrics,
                costAnalysis
            };

            this.comparisonResults.set(testId, comparisonResult);
            
            console.log(`✅ Context comparison test completed: ${testId}`);
            console.log(`📊 Overall improvement: ${improvementMetrics.overallImprovement.toFixed(2)}%`);
            
            return comparisonResult;

        } catch (error) {
            console.error(`❌ Context comparison test failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Run a single context test with specified token limit
     */
    private async runSingleContextTest(
        testId: string,
        documentType: string,
        projectPath: string,
        contextTokens: number,
        model: string,
        metrics: QualityMetric[]
    ): Promise<ContextTestResult> {
        const startTime = Date.now();

        // Load project context within token limit
        const projectContext = await this.loadProjectContext(
            projectPath,
            contextTokens,
            documentType
        );

        // Generate document with specified context
        const generatedDocument = await this.generateDocumentWithContext(
            documentType,
            projectContext,
            model
        );

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Measure quality metrics
        const measuredMetrics = await this.measureQualityMetrics(
            generatedDocument,
            projectContext,
            documentType,
            metrics
        );

        // Calculate token usage
        const tokenUsage = this.calculateTokenUsage(
            projectContext.fullContext,
            generatedDocument
        );

        // Calculate overall score
        const overallScore = this.calculateOverallScore(measuredMetrics);

        const result: ContextTestResult = {
            testId: `${testId}_${contextTokens === 8000 ? 'limited' : 'full'}`,
            contextSize: contextTokens,
            modelUsed: model,
            documentType,
            qualityMetrics: measuredMetrics,
            overallScore,
            responseTime,
            tokenUsage,
            timestamp: new Date(),
            projectContext: {
                filesIncluded: projectContext.filesLoaded,
                totalProjectSize: projectContext.totalProjectSize,
                contextUtilization: (tokenUsage.input / contextTokens) * 100
            }
        };

        this.testResults.set(result.testId, result);
        return result;
    }

    /**
     * Load project context within specified token limit
     */
    private async loadProjectContext(
        projectPath: string,
        maxTokens: number,
        documentType: string
    ): Promise<{
        fullContext: string;
        filesLoaded: number;
        totalProjectSize: number;
        contextStrategy: string;
    }> {
        const filesLoaded: string[] = [];
        let totalContext = '';
        let currentTokens = 0;
        let totalProjectSize = 0;

        // Strategy 1: Load entire project if under token limit
        if (maxTokens >= 500000) {
            console.log(`📚 Loading entire project library (${maxTokens} token limit)...`);
            return await this.loadEntireProjectLibrary(projectPath, maxTokens);
        }

        // Strategy 2: Smart context selection for limited windows
        console.log(`🎯 Smart context selection (${maxTokens} token limit)...`);
        return await this.loadSmartContext(projectPath, maxTokens, documentType);
    }

    /**
     * Load entire project library for large context windows
     */
    private async loadEntireProjectLibrary(
        projectPath: string,
        maxTokens: number
    ): Promise<{
        fullContext: string;
        filesLoaded: number;
        totalProjectSize: number;
        contextStrategy: string;
    }> {
        const filesLoaded: string[] = [];
        let totalContext = '';
        let currentTokens = 0;
        let totalProjectSize = 0;

        // Define project file patterns to include
        const includePatterns = [
            '**/*.md',
            '**/*.ts',
            '**/*.js',
            '**/*.json',
            '**/*.yaml',
            '**/*.yml',
            '**/*.txt',
            '**/*.csv',
            '**/README*',
            '**/docs/**',
            '**/src/**',
            '**/templates/**',
            '**/data/**'
        ];

        const excludePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.git/**',
            '**/coverage/**',
            '**/*.log',
            '**/package-lock.json'
        ];

        try {
            const { glob } = await import('glob');
            
            // Get all relevant files
            for (const pattern of includePatterns) {
                const files = await glob(pattern, { 
                    cwd: projectPath,
                    ignore: excludePatterns
                });
                
                for (const file of files) {
                    const filePath = path.join(projectPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const fileTokens = this.estimateTokens(content);
                    
                    if (currentTokens + fileTokens <= maxTokens * 0.9) { // Reserve 10% for response
                        totalContext += `\n\n=== FILE: ${file} ===\n${content}`;
                        currentTokens += fileTokens;
                        filesLoaded.push(file);
                        totalProjectSize += fileTokens;
                    } else {
                        console.log(`⚠️  Stopping at ${file} - would exceed token limit`);
                        break;
                    }
                }
                
                if (currentTokens >= maxTokens * 0.9) break;
            }

            console.log(`📊 Loaded ${filesLoaded.length} files (${currentTokens.toLocaleString()} tokens)`);
            console.log(`🎯 Context utilization: ${((currentTokens / maxTokens) * 100).toFixed(1)}%`);

            return {
                fullContext: totalContext,
                filesLoaded: filesLoaded.length,
                totalProjectSize,
                contextStrategy: 'full_project_library'
            };

        } catch (error) {
            console.error(`❌ Error loading project library: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Smart context selection for limited token windows
     */
    private async loadSmartContext(
        projectPath: string,
        maxTokens: number,
        documentType: string
    ): Promise<{
        fullContext: string;
        filesLoaded: number;
        totalProjectSize: number;
        contextStrategy: string;
    }> {
        // Use existing context manager logic for smart selection
        const contextManager = ContextManager.getInstance();
        
        // Get core context
        const coreContext = await contextManager.createCoreContext('');
        
        // Build context for specific document type
        const smartContext = contextManager.buildContextForDocument(
            documentType,
            []
        );

        const filesLoaded = 1; // Core context typically includes README
        const totalProjectSize = this.estimateTokens(smartContext);
        const currentTokens = this.estimateTokens(smartContext);

        console.log(`🎯 Smart context loaded (${currentTokens.toLocaleString()} tokens)`);
        console.log(`📊 Context utilization: ${((currentTokens / maxTokens) * 100).toFixed(1)}%`);

        return {
            fullContext: smartContext,
            filesLoaded,
            totalProjectSize,
            contextStrategy: 'smart_selection'
        };
    }

    /**
     * Generate document using the loaded context
     */
    private async generateDocumentWithContext(
        documentType: string,
        projectContext: any,
        model: string
    ): Promise<string> {
        // This would integrate with your existing document generation system
        // For now, return a placeholder that simulates document generation
        
        const prompt = `Generate a ${documentType} document based on the following project context:

${projectContext.fullContext}

Please create a comprehensive, professional ${documentType} that demonstrates the quality and depth possible with this level of context.`;

        // Simulate AI call (replace with actual implementation)
        return `# Generated ${documentType}

**Context Used:** ${projectContext.filesLoaded} files, ${this.estimateTokens(projectContext.fullContext).toLocaleString()} tokens
**Strategy:** ${projectContext.contextStrategy}

This is a placeholder for the actual generated document. In a real implementation, this would call your document generation system with the full project context.

## Key Benefits of Full Context

1. **Comprehensive Understanding**: Access to entire project library
2. **Consistency**: Alignment with existing project documentation
3. **Accuracy**: Based on actual project structure and requirements
4. **Completeness**: No missing context that could affect quality

## Project Context Summary

- **Files Included**: ${projectContext.filesLoaded}
- **Total Project Size**: ${projectContext.totalProjectSize.toLocaleString()} tokens
- **Context Utilization**: ${((this.estimateTokens(projectContext.fullContext) / 1000000) * 100).toFixed(1)}%

This demonstrates the power of utilizing large context windows for document generation.`;
    }

    /**
     * Measure quality metrics for generated document
     */
    private async measureQualityMetrics(
        document: string,
        projectContext: any,
        documentType: string,
        metrics: QualityMetric[]
    ): Promise<QualityMetric[]> {
        const measuredMetrics: QualityMetric[] = [];

        for (const metric of metrics) {
            let score = 0;

            switch (metric.name) {
                case 'completeness':
                    score = this.measureCompleteness(document, documentType);
                    break;
                case 'accuracy':
                    score = this.measureAccuracy(document, projectContext);
                    break;
                case 'consistency':
                    score = this.measureConsistency(document, projectContext);
                    break;
                case 'relevance':
                    score = this.measureRelevance(document, projectContext);
                    break;
                case 'professional_quality':
                    score = this.measureProfessionalQuality(document);
                    break;
                case 'standards_compliance':
                    score = this.measureStandardsCompliance(document, documentType);
                    break;
                case 'actionability':
                    score = this.measureActionability(document);
                    break;
                default:
                    score = 50; // Default neutral score
            }

            measuredMetrics.push({
                ...metric,
                score: Math.max(0, Math.min(100, score))
            });
        }

        return measuredMetrics;
    }

    /**
     * Measure document completeness
     */
    private measureCompleteness(document: string, documentType: string): number {
        // Define expected sections for different document types
        const expectedSections: Record<string, string[]> = {
            'project-charter': [
                'project overview', 'objectives', 'scope', 'stakeholders', 'timeline', 'budget', 'risks'
            ],
            'requirements-documentation': [
                'functional requirements', 'non-functional requirements', 'acceptance criteria', 'assumptions', 'constraints'
            ],
            'risk-management-plan': [
                'risk identification', 'risk analysis', 'risk response', 'risk monitoring', 'risk register'
            ]
        };

        const sections = expectedSections[documentType] || [];
        const documentLower = document.toLowerCase();
        
        let foundSections = 0;
        for (const section of sections) {
            if (documentLower.includes(section)) {
                foundSections++;
            }
        }

        return (foundSections / sections.length) * 100;
    }

    /**
     * Measure document accuracy
     */
    private measureAccuracy(document: string, projectContext: any): number {
        // Check for consistency with project context
        let accuracyScore = 50; // Base score
        
        // Check for project name consistency
        if (projectContext.fullContext.includes('ADPA') && document.includes('ADPA')) {
            accuracyScore += 20;
        }
        
        // Check for technical accuracy indicators
        const technicalIndicators = [
            'architecture', 'database', 'api', 'security', 'performance'
        ];
        
        let technicalAccuracy = 0;
        for (const indicator of technicalIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                technicalAccuracy += 10;
            }
        }
        
        accuracyScore += Math.min(30, technicalAccuracy);
        
        return Math.min(100, accuracyScore);
    }

    /**
     * Measure document consistency
     */
    private measureConsistency(document: string, projectContext: any): number {
        let consistencyScore = 60; // Base score
        
        // Check for consistent terminology
        const projectTerms = this.extractProjectTerms(projectContext.fullContext);
        let termConsistency = 0;
        
        for (const term of projectTerms) {
            if (document.toLowerCase().includes(term.toLowerCase())) {
                termConsistency += 5;
            }
        }
        
        consistencyScore += Math.min(40, termConsistency);
        
        return Math.min(100, consistencyScore);
    }

    /**
     * Measure document relevance
     */
    private measureRelevance(document: string, projectContext: any): number {
        let relevanceScore = 70; // Base score for full context
        
        // Check for project-specific content
        const projectSpecificTerms = [
            'requirements gathering', 'document generation', 'automation', 'framework'
        ];
        
        let relevancePoints = 0;
        for (const term of projectSpecificTerms) {
            if (document.toLowerCase().includes(term)) {
                relevancePoints += 7.5;
            }
        }
        
        relevanceScore += Math.min(30, relevancePoints);
        
        return Math.min(100, relevanceScore);
    }

    /**
     * Measure professional quality
     */
    private measureProfessionalQuality(document: string): number {
        let qualityScore = 50;
        
        // Check for professional structure
        if (document.includes('#') && document.includes('##')) {
            qualityScore += 20; // Has proper heading structure
        }
        
        if (document.includes('**') || document.includes('*')) {
            qualityScore += 15; // Has formatting
        }
        
        if (document.length > 1000) {
            qualityScore += 15; // Substantial content
        }
        
        return Math.min(100, qualityScore);
    }

    /**
     * Measure standards compliance
     */
    private measureStandardsCompliance(document: string, documentType: string): number {
        let complianceScore = 60;
        
        // Check for PMBOK compliance indicators
        const pmbokIndicators = [
            'project management', 'stakeholder', 'scope', 'risk', 'quality', 'communication'
        ];
        
        let compliancePoints = 0;
        for (const indicator of pmbokIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                compliancePoints += 6.67;
            }
        }
        
        complianceScore += Math.min(40, compliancePoints);
        
        return Math.min(100, complianceScore);
    }

    /**
     * Measure actionability
     */
    private measureActionability(document: string): number {
        let actionabilityScore = 40;
        
        // Check for actionable elements
        const actionableIndicators = [
            'action item', 'next step', 'recommendation', 'implementation', 'timeline', 'milestone'
        ];
        
        let actionabilityPoints = 0;
        for (const indicator of actionableIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                actionabilityPoints += 10;
            }
        }
        
        actionabilityScore += Math.min(60, actionabilityPoints);
        
        return Math.min(100, actionabilityScore);
    }

    /**
     * Calculate improvement metrics between two test results
     */
    private calculateImprovementMetrics(
        limitedResult: ContextTestResult,
        fullResult: ContextTestResult,
        metrics: QualityMetric[]
    ): ContextComparisonResult['improvementMetrics'] {
        const metricImprovements: Record<string, number> = {};
        const significantImprovements: string[] = [];
        const regressionAreas: string[] = [];

        let totalWeightedImprovement = 0;
        let totalWeight = 0;

        for (const metric of metrics) {
            const limitedScore = limitedResult.qualityMetrics.find(m => m.name === metric.name)?.score || 0;
            const fullScore = fullResult.qualityMetrics.find(m => m.name === metric.name)?.score || 0;
            
            const improvement = fullScore - limitedScore;
            metricImprovements[metric.name] = improvement;
            
            totalWeightedImprovement += improvement * metric.weight;
            totalWeight += metric.weight;
            
            if (improvement >= 10) {
                significantImprovements.push(metric.name);
            } else if (improvement <= -5) {
                regressionAreas.push(metric.name);
            }
        }

        const overallImprovement = totalWeightedImprovement / totalWeight;

        return {
            overallImprovement,
            metricImprovements,
            significantImprovements,
            regressionAreas
        };
    }

    /**
     * Calculate cost analysis for context comparison
     */
    private calculateCostAnalysis(
        limitedResult: ContextTestResult,
        fullResult: ContextTestResult
    ): ContextComparisonResult['costAnalysis'] {
        // Token cost calculation (simplified)
        const tokenCostPer1K = 0.002; // Example rate
        const timeCostPerHour = 50; // Example rate
        
        const limitedTokenCost = (limitedResult.tokenUsage.total / 1000) * tokenCostPer1K;
        const fullTokenCost = (fullResult.tokenUsage.total / 1000) * tokenCostPer1K;
        
        const limitedTimeCost = (limitedResult.responseTime / 3600000) * timeCostPerHour;
        const fullTimeCost = (fullResult.responseTime / 3600000) * timeCostPerHour;
        
        const tokenCostDifference = fullTokenCost - limitedTokenCost;
        const timeCostDifference = fullTimeCost - limitedTimeCost;
        
        const qualityValue = (fullResult.overallScore - limitedResult.overallScore) * 10; // $10 per quality point
        const roi = qualityValue / (tokenCostDifference + timeCostDifference);
        
        return {
            tokenCostDifference,
            timeCostDifference,
            qualityValue,
            roi: isFinite(roi) ? roi : 0
        };
    }

    /**
     * Calculate overall quality score
     */
    private calculateOverallScore(metrics: QualityMetric[]): number {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        for (const metric of metrics) {
            totalWeightedScore += metric.score * metric.weight;
            totalWeight += metric.weight;
        }
        
        return totalWeight / totalWeight;
    }

    /**
     * Calculate token usage
     */
    private calculateTokenUsage(input: string, output: string): {
        input: number;
        output: number;
        total: number;
    } {
        const inputTokens = this.estimateTokens(input);
        const outputTokens = this.estimateTokens(output);
        
        return {
            input: inputTokens,
            output: outputTokens,
            total: inputTokens + outputTokens
        };
    }

    /**
     * Extract project-specific terms from context
     */
    private extractProjectTerms(context: string): string[] {
        // Simple term extraction - in practice, this could be more sophisticated
        const terms = new Set<string>();
        
        // Extract capitalized terms that might be project-specific
        const matches = context.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) || [];
        matches.forEach(match => {
            if (match.length > 3 && match.length < 20) {
                terms.add(match);
            }
        });
        
        return Array.from(terms).slice(0, 20); // Limit to top 20 terms
    }

    /**
     * Estimate tokens in text
     */
    private estimateTokens(text: string): number {
        // Simple token estimation (rough approximation)
        return Math.ceil(text.length / 4);
    }

    /**
     * Get current model
     */
    private getCurrentModel(): string {
        return this.configManager.get<string>('deployment_name', 'gemini-1.5-pro');
    }

    /**
     * Generate comprehensive quality report
     */
    async generateQualityReport(testId: string): Promise<string> {
        const comparison = this.comparisonResults.get(testId);
        if (!comparison) {
            throw new Error(`Test result not found: ${testId}`);
        }

        const report = `
# Context Quality Measurement Report

**Test ID:** ${testId}  
**Document Type:** ${comparison.documentType}  
**Generated:** ${new Date().toISOString()}  

## Executive Summary

This report compares document generation quality between limited context (${comparison.limitedContextResult.contextSize.toLocaleString()} tokens) and full project context (${comparison.fullContextResult.contextSize.toLocaleString()} tokens).

**Overall Quality Improvement:** ${comparison.improvementMetrics.overallImprovement.toFixed(2)}%

## Detailed Results

### Quality Metrics Comparison

| Metric | Limited Context | Full Context | Improvement | Weight |
|--------|----------------|--------------|-------------|---------|
${comparison.limitedContextResult.qualityMetrics.map((metric, i) => {
    const fullMetric = comparison.fullContextResult.qualityMetrics[i];
    const improvement = comparison.improvementMetrics.metricImprovements[metric.name];
    return `| ${metric.name.replace('_', ' ')} | ${metric.score.toFixed(1)} | ${fullMetric.score.toFixed(1)} | ${improvement.toFixed(1)} | ${metric.weight} |`;
}).join('\n')}

### Significant Improvements
${comparison.improvementMetrics.significantImprovements.map(metric => `- **${metric.replace('_', ' ')}**: +${comparison.improvementMetrics.metricImprovements[metric].toFixed(1)} points`).join('\n')}

### Regression Areas
${comparison.improvementMetrics.regressionAreas.length > 0 ? 
    comparison.improvementMetrics.regressionAreas.map(metric => `- **${metric.replace('_', ' ')}**: ${comparison.improvementMetrics.metricImprovements[metric].toFixed(1)} points`).join('\n') :
    'None identified'}

## Cost Analysis

| Metric | Limited Context | Full Context | Difference |
|--------|----------------|--------------|------------|
| Token Cost | $${comparison.costAnalysis.tokenCostDifference.toFixed(4)} | - | $${comparison.costAnalysis.tokenCostDifference.toFixed(4)} |
| Time Cost | $${comparison.costAnalysis.timeCostDifference.toFixed(2)} | - | $${comparison.costAnalysis.timeCostDifference.toFixed(2)} |
| Quality Value | - | $${comparison.costAnalysis.qualityValue.toFixed(2)} | $${comparison.costAnalysis.qualityValue.toFixed(2)} |
| **ROI** | - | - | **${comparison.costAnalysis.roi.toFixed(2)}x** |

## Context Utilization

### Limited Context (${comparison.limitedContextResult.contextSize.toLocaleString()} tokens)
- Files included: ${comparison.limitedContextResult.projectContext.filesIncluded}
- Context utilization: ${comparison.limitedContextResult.projectContext.contextUtilization.toFixed(1)}%
- Response time: ${comparison.limitedContextResult.responseTime}ms

### Full Context (${comparison.fullContextResult.contextSize.toLocaleString()} tokens)
- Files included: ${comparison.fullContextResult.projectContext.filesIncluded}
- Context utilization: ${comparison.fullContextResult.projectContext.contextUtilization.toFixed(1)}%
- Response time: ${comparison.fullContextResult.responseTime}ms

## Recommendations

${comparison.improvementMetrics.overallImprovement > 15 ? 
    '**✅ RECOMMENDED**: Full context utilization shows significant quality improvements that justify the additional cost.' :
    comparison.improvementMetrics.overallImprovement > 5 ?
    '**⚠️ CONDITIONAL**: Full context provides moderate improvements. Consider for critical documents only.' :
    '**❌ NOT RECOMMENDED**: Limited improvements do not justify the additional cost and complexity.'
}

## Next Steps

1. **Expand Testing**: Run tests on additional document types
2. **Optimize Context Selection**: Refine smart context selection algorithms
3. **Cost Optimization**: Investigate ways to reduce token usage while maintaining quality
4. **Quality Metrics**: Enhance automated quality measurement capabilities

---

*This report was generated by the Context Quality Measurement Framework*
`;

        return report;
    }

    /**
     * Export test results to JSON
     */
    async exportResults(format: 'json' | 'csv' = 'json'): Promise<string> {
        const results = Array.from(this.comparisonResults.values());
        
        if (format === 'json') {
            return JSON.stringify(results, null, 2);
        } else {
            // CSV export logic would go here
            return 'CSV export not yet implemented';
        }
    }
}
