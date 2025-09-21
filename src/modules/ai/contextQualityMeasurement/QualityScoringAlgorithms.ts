/**
 * Quality Scoring Algorithms
 * Advanced algorithms for measuring and scoring LLM response quality improvements
 * 
 * This module provides sophisticated quality measurement algorithms that can
 * automatically assess document generation quality across different metrics.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface QualityScore {
    metric: string;
    score: number; // 0-100
    confidence: number; // 0-1
    explanation: string;
    evidence: string[];
    weight: number;
}

export interface DocumentAnalysis {
    content: string;
    metadata: {
        documentType: string;
        contextSize: number;
        modelUsed: string;
        generationTime: number;
        tokenUsage: number;
    };
    qualityScores: QualityScore[];
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

export interface ComparisonAnalysis {
    documentA: DocumentAnalysis;
    documentB: DocumentAnalysis;
    improvements: Record<string, number>;
    regressions: Record<string, number>;
    overallImprovement: number;
    significantChanges: Array<{
        metric: string;
        change: number;
        significance: 'high' | 'medium' | 'low';
        explanation: string;
    }>;
}

export class QualityScoringAlgorithms {
    private static instance: QualityScoringAlgorithms;
    
    // Quality metric definitions with scoring algorithms
    private readonly qualityMetrics: Record<string, {
        name: string;
        description: string;
        weight: number;
        algorithm: string;
        thresholds: {
            excellent: number;
            good: number;
            acceptable: number;
            poor: number;
        };
    }> = {
        completeness: {
            name: 'Completeness',
            description: 'How completely the document addresses all required sections',
            weight: 0.25,
            algorithm: 'section_coverage',
            thresholds: {
                excellent: 90,
                good: 75,
                acceptable: 60,
                poor: 40
            }
        },
        accuracy: {
            name: 'Accuracy',
            description: 'Factual correctness and technical accuracy',
            weight: 0.20,
            algorithm: 'factual_consistency',
            thresholds: {
                excellent: 90,
                good: 75,
                acceptable: 60,
                poor: 40
            }
        },
        consistency: {
            name: 'Consistency',
            description: 'Internal consistency and alignment with context',
            weight: 0.15,
            algorithm: 'internal_consistency',
            thresholds: {
                excellent: 85,
                good: 70,
                acceptable: 55,
                poor: 35
            }
        },
        relevance: {
            name: 'Relevance',
            description: 'Relevance to the specific project and requirements',
            weight: 0.15,
            algorithm: 'context_relevance',
            thresholds: {
                excellent: 85,
                good: 70,
                acceptable: 55,
                poor: 35
            }
        },
        professional_quality: {
            name: 'Professional Quality',
            description: 'Professional presentation, formatting, and language',
            weight: 0.10,
            algorithm: 'presentation_quality',
            thresholds: {
                excellent: 85,
                good: 70,
                acceptable: 55,
                poor: 35
            }
        },
        standards_compliance: {
            name: 'Standards Compliance',
            description: 'Adherence to industry standards and best practices',
            weight: 0.10,
            algorithm: 'standards_check',
            thresholds: {
                excellent: 85,
                good: 70,
                acceptable: 55,
                poor: 35
            }
        },
        actionability: {
            name: 'Actionability',
            description: 'Practical utility and implementability of content',
            weight: 0.05,
            algorithm: 'actionability_assessment',
            thresholds: {
                excellent: 80,
                good: 65,
                acceptable: 50,
                poor: 30
            }
        }
    };

    // Document type templates for completeness checking
    private readonly documentTemplates: Record<string, string[]> = {
        'project-charter': [
            'project overview', 'objectives', 'scope', 'stakeholders', 'timeline', 'budget', 'risks',
            'success criteria', 'assumptions', 'constraints', 'approval'
        ],
        'requirements-documentation': [
            'functional requirements', 'non-functional requirements', 'acceptance criteria',
            'assumptions', 'constraints', 'dependencies', 'risks', 'stakeholders'
        ],
        'technical-design': [
            'architecture overview', 'system components', 'data flow', 'interfaces',
            'security considerations', 'performance requirements', 'scalability', 'deployment'
        ],
        'quality-metrics': [
            'quality objectives', 'measurement criteria', 'metrics framework', 'data collection',
            'reporting schedule', 'quality gates', 'improvement actions', 'stakeholder roles'
        ],
        'risk-management-plan': [
            'risk identification', 'risk analysis', 'risk response', 'risk monitoring',
            'risk register', 'escalation procedures', 'contingency plans', 'lessons learned'
        ],
        'test-plan': [
            'test objectives', 'test scope', 'test strategy', 'test cases',
            'test environment', 'test schedule', 'test resources', 'test deliverables'
        ]
    };

    constructor() {
        if (QualityScoringAlgorithms.instance) {
            return QualityScoringAlgorithms.instance;
        }
        QualityScoringAlgorithms.instance = this;
    }

    static getInstance(): QualityScoringAlgorithms {
        if (!QualityScoringAlgorithms.instance) {
            QualityScoringAlgorithms.instance = new QualityScoringAlgorithms();
        }
        return QualityScoringAlgorithms.instance;
    }

    /**
     * Analyze document quality comprehensively
     */
    async analyzeDocumentQuality(
        document: string,
        metadata: DocumentAnalysis['metadata'],
        projectContext?: string
    ): Promise<DocumentAnalysis> {
        console.log(`🔍 Analyzing document quality for ${metadata.documentType}`);
        
        const qualityScores: QualityScore[] = [];
        
        // Calculate quality scores for each metric
        for (const [metricKey, metricConfig] of Object.entries(this.qualityMetrics)) {
            const score = await this.calculateQualityScore(
                metricKey,
                document,
                metadata,
                projectContext
            );
            qualityScores.push(score);
        }
        
        // Calculate overall score
        const overallScore = this.calculateOverallScore(qualityScores);
        
        // Identify strengths and weaknesses
        const strengths = this.identifyStrengths(qualityScores);
        const weaknesses = this.identifyWeaknesses(qualityScores);
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(qualityScores, metadata);
        
        return {
            content: document,
            metadata,
            qualityScores,
            overallScore,
            strengths,
            weaknesses,
            recommendations
        };
    }

    /**
     * Compare two documents and analyze improvements
     */
    async compareDocuments(
        documentA: DocumentAnalysis,
        documentB: DocumentAnalysis
    ): Promise<ComparisonAnalysis> {
        console.log(`📊 Comparing documents: ${documentA.metadata.documentType}`);
        
        const improvements: Record<string, number> = {};
        const regressions: Record<string, number> = {};
        const significantChanges: ComparisonAnalysis['significantChanges'] = [];
        
        // Compare each quality metric
        for (let i = 0; i < documentA.qualityScores.length; i++) {
            const scoreA = documentA.qualityScores[i];
            const scoreB = documentB.qualityScores[i];
            const change = scoreB.score - scoreA.score;
            
            if (change > 0) {
                improvements[scoreA.metric] = change;
            } else if (change < 0) {
                regressions[scoreA.metric] = Math.abs(change);
            }
            
            // Identify significant changes
            const significance = this.assessChangeSignificance(change, scoreA.score);
            if (significance !== 'low') {
                significantChanges.push({
                    metric: scoreA.metric,
                    change,
                    significance,
                    explanation: this.generateChangeExplanation(scoreA.metric, change, significance)
                });
            }
        }
        
        const overallImprovement = documentB.overallScore - documentA.overallScore;
        
        return {
            documentA,
            documentB,
            improvements,
            regressions,
            overallImprovement,
            significantChanges
        };
    }

    /**
     * Calculate quality score for specific metric
     */
    private async calculateQualityScore(
        metricKey: string,
        document: string,
        metadata: DocumentAnalysis['metadata'],
        projectContext?: string
    ): Promise<QualityScore> {
        const metricConfig = this.qualityMetrics[metricKey];
        
        let score = 0;
        let confidence = 0.5;
        let explanation = '';
        let evidence: string[] = [];
        
        switch (metricConfig.algorithm) {
            case 'section_coverage':
                const coverageResult = this.assessSectionCoverage(
                    document, metadata.documentType
                );
                score = coverageResult.score;
                confidence = coverageResult.confidence;
                explanation = coverageResult.explanation;
                evidence = coverageResult.evidence;
                break;
                
            case 'factual_consistency':
                const accuracyResult = this.assessFactualConsistency(
                    document, projectContext
                );
                score = accuracyResult.score;
                confidence = accuracyResult.confidence;
                explanation = accuracyResult.explanation;
                evidence = accuracyResult.evidence;
                break;
                
            case 'internal_consistency':
                const consistencyResult = this.assessInternalConsistency(
                    document
                );
                score = consistencyResult.score;
                confidence = consistencyResult.confidence;
                explanation = consistencyResult.explanation;
                evidence = consistencyResult.evidence;
                break;
                
            case 'context_relevance':
                const relevanceResult = this.assessContextRelevance(
                    document, projectContext
                );
                score = relevanceResult.score;
                confidence = relevanceResult.confidence;
                explanation = relevanceResult.explanation;
                evidence = relevanceResult.evidence;
                break;
                
            case 'presentation_quality':
                const presentationResult = this.assessPresentationQuality(
                    document
                );
                score = presentationResult.score;
                confidence = presentationResult.confidence;
                explanation = presentationResult.explanation;
                evidence = presentationResult.evidence;
                break;
                
            case 'standards_check':
                const standardsResult = this.assessStandardsCompliance(
                    document, metadata.documentType
                );
                score = standardsResult.score;
                confidence = standardsResult.confidence;
                explanation = standardsResult.explanation;
                evidence = standardsResult.evidence;
                break;
                
            case 'actionability_assessment':
                const actionabilityResult = this.assessActionability(
                    document
                );
                score = actionabilityResult.score;
                confidence = actionabilityResult.confidence;
                explanation = actionabilityResult.explanation;
                evidence = actionabilityResult.evidence;
                break;
                
            default:
                score = 50; // Default neutral score
                explanation = 'Metric not implemented';
                evidence = [];
        }
        
        return {
            metric: metricKey,
            score: Math.max(0, Math.min(100, score)),
            confidence,
            explanation,
            evidence,
            weight: metricConfig.weight
        };
    }

    /**
     * Assess section coverage completeness
     */
    private assessSectionCoverage(
        document: string,
        documentType: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        const expectedSections = this.documentTemplates[documentType] || [];
        const documentLower = document.toLowerCase();
        
        let foundSections = 0;
        const evidence: string[] = [];
        
        for (const section of expectedSections) {
            if (documentLower.includes(section)) {
                foundSections++;
                evidence.push(`Found section: ${section}`);
            }
        }
        
        const coverage = expectedSections.length > 0 ? (foundSections / expectedSections.length) * 100 : 50;
        const confidence = expectedSections.length > 5 ? 0.8 : 0.6;
        
        let explanation = `Coverage: ${foundSections}/${expectedSections.length} expected sections (${coverage.toFixed(1)}%)`;
        
        if (coverage >= 90) {
            explanation += ' - Excellent coverage of all required sections';
        } else if (coverage >= 75) {
            explanation += ' - Good coverage with minor gaps';
        } else if (coverage >= 60) {
            explanation += ' - Acceptable coverage but missing some sections';
        } else {
            explanation += ' - Poor coverage, many sections missing';
        }
        
        return {
            score: coverage,
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Assess factual consistency
     */
    private assessFactualConsistency(
        document: string,
        projectContext?: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        let score = 60; // Base score
        let confidence = 0.5;
        const evidence: string[] = [];
        
        if (projectContext) {
            // Check for consistency with project context
            const contextTerms = this.extractProjectTerms(projectContext);
            let consistencyPoints = 0;
            
            for (const term of contextTerms) {
                if (document.toLowerCase().includes(term.toLowerCase())) {
                    consistencyPoints += 5;
                    evidence.push(`Consistent use of project term: ${term}`);
                }
            }
            
            score += Math.min(30, consistencyPoints);
            confidence = Math.min(0.9, 0.5 + (consistencyPoints / 100));
        }
        
        // Check for technical accuracy indicators
        const technicalIndicators = [
            'architecture', 'database', 'api', 'security', 'performance', 'scalability'
        ];
        
        let technicalAccuracy = 0;
        for (const indicator of technicalIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                technicalAccuracy += 10;
                evidence.push(`Technical accuracy indicator: ${indicator}`);
            }
        }
        
        score += Math.min(20, technicalAccuracy);
        
        // Check for contradiction indicators
        const contradictionPatterns = [
            /but\s+however/i,
            /nevertheless\s+but/i,
            /although\s+but/i
        ];
        
        let contradictions = 0;
        for (const pattern of contradictionPatterns) {
            if (pattern.test(document)) {
                contradictions++;
            }
        }
        
        score -= contradictions * 10;
        
        let explanation = 'Factual consistency assessment based on project context alignment and technical accuracy';
        if (contradictions > 0) {
            explanation += `. Found ${contradictions} potential contradictions`;
        }
        
        return {
            score: Math.max(0, score),
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Assess internal consistency
     */
    private assessInternalConsistency(
        document: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        let score = 70;
        let confidence = 0.7;
        const evidence: string[] = [];
        
        // Check for consistent terminology
        const terms = this.extractTerms(document);
        const termFrequency = new Map<string, number>();
        
        terms.forEach(term => {
            const lowerTerm = term.toLowerCase();
            termFrequency.set(lowerTerm, (termFrequency.get(lowerTerm) || 0) + 1);
        });
        
        // Check for inconsistent terminology (same concept, different terms)
        const inconsistentTerms = this.findInconsistentTerms(termFrequency);
        if (inconsistentTerms.length > 0) {
            score -= inconsistentTerms.length * 5;
            evidence.push(`Found ${inconsistentTerms.length} inconsistent term usages`);
        }
        
        // Check for consistent formatting
        const headings = document.match(/^#+\s+.+$/gm) || [];
        const headingLevels = headings.map(h => (h.match(/^#+/) || [''])[0].length);
        const maxLevel = Math.max(...headingLevels);
        const minLevel = Math.min(...headingLevels);
        
        if (maxLevel - minLevel <= 2) {
            score += 10;
            evidence.push('Consistent heading structure');
        } else {
            score -= 5;
            evidence.push('Inconsistent heading levels');
        }
        
        // Check for logical flow
        const logicalFlowScore = this.assessLogicalFlow(document);
        score += logicalFlowScore;
        
        if (logicalFlowScore > 0) {
            evidence.push('Good logical flow and structure');
        }
        
        let explanation = 'Internal consistency based on terminology, formatting, and logical flow';
        if (inconsistentTerms.length === 0 && logicalFlowScore > 0) {
            explanation += ' - High internal consistency';
        } else if (inconsistentTerms.length > 0) {
            explanation += ` - Some inconsistencies in terminology`;
        }
        
        return {
            score: Math.max(0, score),
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Assess context relevance
     */
    private assessContextRelevance(
        document: string,
        projectContext?: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        let score = 50;
        let confidence = 0.5;
        const evidence: string[] = [];
        
        if (!projectContext) {
            return {
                score: 50,
                confidence: 0.3,
                explanation: 'No project context available for relevance assessment',
                evidence: []
            };
        }
        
        // Extract key concepts from project context
        const projectConcepts = this.extractKeyConcepts(projectContext);
        const documentConcepts = this.extractKeyConcepts(document);
        
        // Calculate concept overlap
        let relevantConcepts = 0;
        for (const concept of projectConcepts) {
            if (documentConcepts.includes(concept)) {
                relevantConcepts++;
                evidence.push(`Relevant concept: ${concept}`);
            }
        }
        
        const relevanceRatio = relevantConcepts / Math.max(projectConcepts.length, 1);
        score += relevanceRatio * 40;
        confidence = Math.min(0.9, 0.5 + relevanceRatio);
        
        // Check for project-specific terminology
        const projectTerms = this.extractProjectTerms(projectContext);
        let projectTermUsage = 0;
        
        for (const term of projectTerms) {
            if (document.toLowerCase().includes(term.toLowerCase())) {
                projectTermUsage++;
                evidence.push(`Project-specific term: ${term}`);
            }
        }
        
        score += Math.min(20, projectTermUsage * 2);
        
        let explanation = `Context relevance: ${relevantConcepts}/${projectConcepts.length} key concepts addressed`;
        if (relevanceRatio > 0.7) {
            explanation += ' - Highly relevant to project context';
        } else if (relevanceRatio > 0.5) {
            explanation += ' - Moderately relevant to project context';
        } else {
            explanation += ' - Limited relevance to project context';
        }
        
        return {
            score: Math.max(0, score),
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Assess presentation quality
     */
    private assessPresentationQuality(
        document: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        let score = 50;
        let confidence = 0.6;
        const evidence: string[] = [];
        
        // Check for proper structure
        const hasHeadings = /^#+\s+.+$/m.test(document);
        if (hasHeadings) {
            score += 15;
            evidence.push('Has proper heading structure');
        }
        
        // Check for formatting
        const hasFormatting = /(\*\*|__|\*|_|`)/.test(document);
        if (hasFormatting) {
            score += 10;
            evidence.push('Uses text formatting');
        }
        
        // Check for lists
        const hasLists = /^[\s]*[-*+]\s+/.test(document) || /^[\s]*\d+\.\s+/.test(document);
        if (hasLists) {
            score += 10;
            evidence.push('Uses lists for organization');
        }
        
        // Check for proper length
        const wordCount = document.split(/\s+/).length;
        if (wordCount > 500) {
            score += 10;
            evidence.push('Substantial content length');
        } else if (wordCount < 100) {
            score -= 15;
            evidence.push('Content may be too brief');
        }
        
        // Check for professional language
        const professionalLanguage = this.assessProfessionalLanguage(document);
        score += professionalLanguage;
        
        if (professionalLanguage > 0) {
            evidence.push('Uses professional language');
        }
        
        // Check for grammar and spelling (basic)
        const grammarScore = this.assessBasicGrammar(document);
        score += grammarScore;
        
        let explanation = 'Presentation quality based on structure, formatting, length, and language';
        if (score >= 80) {
            explanation += ' - Professional presentation';
        } else if (score >= 65) {
            explanation += ' - Good presentation with minor issues';
        } else {
            explanation += ' - Presentation needs improvement';
        }
        
        return {
            score: Math.max(0, score),
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Assess standards compliance
     */
    private assessStandardsCompliance(
        document: string,
        documentType: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        let score = 60;
        let confidence = 0.6;
        const evidence: string[] = [];
        
        // Define standards indicators by document type
        const standardsIndicators: Record<string, string[]> = {
            'project-charter': [
                'project management', 'stakeholder', 'scope', 'risk', 'quality',
                'communication', 'budget', 'timeline', 'deliverables'
            ],
            'requirements-documentation': [
                'functional requirements', 'non-functional requirements', 'acceptance criteria',
                'traceability', 'verification', 'validation', 'baseline'
            ],
            'technical-design': [
                'architecture', 'design patterns', 'interfaces', 'components',
                'security', 'performance', 'scalability', 'maintainability'
            ],
            'quality-metrics': [
                'quality objectives', 'measurement', 'metrics', 'kpi',
                'benchmarks', 'thresholds', 'monitoring', 'improvement'
            ]
        };
        
        const indicators = standardsIndicators[documentType] || standardsIndicators['project-charter'];
        let compliancePoints = 0;
        
        for (const indicator of indicators) {
            if (document.toLowerCase().includes(indicator)) {
                compliancePoints += 10;
                evidence.push(`Standards indicator: ${indicator}`);
            }
        }
        
        score += Math.min(40, compliancePoints);
        
        // Check for document structure compliance
        const structureScore = this.assessDocumentStructure(document, documentType);
        score += structureScore;
        
        if (structureScore > 0) {
            evidence.push('Follows standard document structure');
        }
        
        let explanation = `Standards compliance for ${documentType}: ${compliancePoints/10}/${indicators.length} indicators present`;
        if (compliancePoints >= indicators.length * 8) {
            explanation += ' - Excellent standards compliance';
        } else if (compliancePoints >= indicators.length * 6) {
            explanation += ' - Good standards compliance';
        } else {
            explanation += ' - Limited standards compliance';
        }
        
        return {
            score: Math.max(0, score),
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Assess actionability
     */
    private assessActionability(
        document: string
    ): { score: number; confidence: number; explanation: string; evidence: string[] } {
        let score = 40;
        let confidence = 0.5;
        const evidence: string[] = [];
        
        // Check for actionable elements
        const actionableIndicators = [
            'action item', 'next step', 'recommendation', 'implementation',
            'timeline', 'milestone', 'deliverable', 'deadline',
            'responsible', 'owner', 'assignee', 'due date'
        ];
        
        let actionabilityPoints = 0;
        for (const indicator of actionableIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                actionabilityPoints += 10;
                evidence.push(`Actionable element: ${indicator}`);
            }
        }
        
        score += Math.min(50, actionabilityPoints);
        
        // Check for specific, measurable criteria
        const measurablePatterns = [
            /\d+\s*(percent|%|days|weeks|months|hours)/gi,
            /by\s+\w+\s+\d+/gi,
            /within\s+\d+/gi,
            /at least\s+\d+/gi
        ];
        
        let measurableElements = 0;
        for (const pattern of measurablePatterns) {
            if (pattern.test(document)) {
                measurableElements++;
                evidence.push('Contains measurable criteria');
            }
        }
        
        score += measurableElements * 5;
        
        // Check for clear responsibilities
        const responsibilityPatterns = [
            /responsible for/gi,
            /owner:/gi,
            /assigned to/gi,
            /will be handled by/gi
        ];
        
        let clearResponsibilities = 0;
        for (const pattern of responsibilityPatterns) {
            if (pattern.test(document)) {
                clearResponsibilities++;
                evidence.push('Contains clear responsibilities');
            }
        }
        
        score += clearResponsibilities * 5;
        
        let explanation = `Actionability: ${actionabilityPoints/10} actionable elements, ${measurableElements} measurable criteria`;
        if (score >= 70) {
            explanation += ' - Highly actionable content';
        } else if (score >= 50) {
            explanation += ' - Moderately actionable content';
        } else {
            explanation += ' - Limited actionability';
        }
        
        return {
            score: Math.max(0, score),
            confidence,
            explanation,
            evidence
        };
    }

    /**
     * Calculate overall quality score
     */
    private calculateOverallScore(qualityScores: QualityScore[]): number {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        for (const score of qualityScores) {
            totalWeightedScore += score.score * score.weight;
            totalWeight += score.weight;
        }
        
        return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    }

    /**
     * Identify document strengths
     */
    private identifyStrengths(qualityScores: QualityScore[]): string[] {
        const strengths: string[] = [];
        
        for (const score of qualityScores) {
            if (score.score >= 80) {
                strengths.push(`Strong ${score.metric.replace('_', ' ')} (${score.score.toFixed(1)}/100)`);
            }
        }
        
        return strengths;
    }

    /**
     * Identify document weaknesses
     */
    private identifyWeaknesses(qualityScores: QualityScore[]): string[] {
        const weaknesses: string[] = [];
        
        for (const score of qualityScores) {
            if (score.score < 60) {
                weaknesses.push(`Needs improvement in ${score.metric.replace('_', ' ')} (${score.score.toFixed(1)}/100)`);
            }
        }
        
        return weaknesses;
    }

    /**
     * Generate improvement recommendations
     */
    private generateRecommendations(
        qualityScores: QualityScore[],
        metadata: DocumentAnalysis['metadata']
    ): string[] {
        const recommendations: string[] = [];
        
        for (const score of qualityScores) {
            if (score.score < 70) {
                switch (score.metric) {
                    case 'completeness':
                        recommendations.push('Add missing sections to improve document completeness');
                        break;
                    case 'accuracy':
                        recommendations.push('Review content for factual accuracy and consistency');
                        break;
                    case 'consistency':
                        recommendations.push('Ensure consistent terminology and formatting throughout');
                        break;
                    case 'relevance':
                        recommendations.push('Align content more closely with project context and requirements');
                        break;
                    case 'professional_quality':
                        recommendations.push('Improve document formatting and professional presentation');
                        break;
                    case 'standards_compliance':
                        recommendations.push('Enhance compliance with industry standards and best practices');
                        break;
                    case 'actionability':
                        recommendations.push('Add specific, actionable items with clear responsibilities');
                        break;
                }
            }
        }
        
        // Add general recommendations based on context size
        if (metadata.contextSize < 50000) {
            recommendations.push('Consider using larger context window for more comprehensive content');
        }
        
        return recommendations;
    }

    /**
     * Assess change significance
     */
    private assessChangeSignificance(change: number, baselineScore: number): 'high' | 'medium' | 'low' {
        const changePercent = Math.abs(change) / baselineScore;
        
        if (changePercent > 0.2 || Math.abs(change) > 15) {
            return 'high';
        } else if (changePercent > 0.1 || Math.abs(change) > 8) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Generate change explanation
     */
    private generateChangeExplanation(
        metric: string,
        change: number,
        significance: 'high' | 'medium' | 'low'
    ): string {
        const direction = change > 0 ? 'improved' : 'degraded';
        const magnitude = significance === 'high' ? 'significantly' : 
                         significance === 'medium' ? 'moderately' : 'slightly';
        
        return `${metric.replace('_', ' ')} ${magnitude} ${direction} by ${Math.abs(change).toFixed(1)} points`;
    }

    // Helper methods for text analysis

    private extractProjectTerms(context: string): string[] {
        const terms = new Set<string>();
        const matches = context.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) || [];
        matches.forEach(match => {
            if (match.length > 3 && match.length < 20) {
                terms.add(match);
            }
        });
        return Array.from(terms).slice(0, 20);
    }

    private extractTerms(document: string): string[] {
        return document.match(/\b[a-zA-Z]{3,}\b/g) || [];
    }

    private findInconsistentTerms(termFrequency: Map<string, number>): string[] {
        // This is a simplified implementation
        // In practice, you'd use more sophisticated NLP techniques
        const inconsistentTerms: string[] = [];
        
        // Look for similar terms that might be inconsistent
        const terms = Array.from(termFrequency.keys());
        for (let i = 0; i < terms.length; i++) {
            for (let j = i + 1; j < terms.length; j++) {
                if (this.areSimilarTerms(terms[i], terms[j])) {
                    inconsistentTerms.push(`${terms[i]} / ${terms[j]}`);
                }
            }
        }
        
        return inconsistentTerms;
    }

    private areSimilarTerms(term1: string, term2: string): boolean {
        // Simple similarity check - in practice, use more sophisticated algorithms
        const similarity = this.calculateStringSimilarity(term1, term2);
        return similarity > 0.7 && Math.abs(term1.length - term2.length) < 3;
    }

    private calculateStringSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    private assessLogicalFlow(document: string): number {
        // Check for logical progression indicators
        const progressionIndicators = [
            'first', 'second', 'third', 'next', 'then', 'finally',
            'initially', 'subsequently', 'consequently', 'therefore'
        ];
        
        let flowScore = 0;
        for (const indicator of progressionIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                flowScore += 2;
            }
        }
        
        return Math.min(10, flowScore);
    }

    private extractKeyConcepts(text: string): string[] {
        // Extract capitalized terms and technical concepts
        const concepts = new Set<string>();
        
        // Extract capitalized terms
        const capitalizedTerms = text.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) || [];
        capitalizedTerms.forEach(term => {
            if (term.length > 3 && term.length < 20) {
                concepts.add(term);
            }
        });
        
        // Extract technical terms
        const technicalTerms = [
            'architecture', 'database', 'api', 'security', 'performance',
            'scalability', 'framework', 'algorithm', 'protocol', 'interface'
        ];
        
        technicalTerms.forEach(term => {
            if (text.toLowerCase().includes(term)) {
                concepts.add(term);
            }
        });
        
        return Array.from(concepts).slice(0, 15);
    }

    private assessProfessionalLanguage(document: string): number {
        const professionalIndicators = [
            'implement', 'execute', 'deliver', 'achieve', 'ensure',
            'facilitate', 'coordinate', 'manage', 'monitor', 'evaluate'
        ];
        
        let professionalScore = 0;
        for (const indicator of professionalIndicators) {
            if (document.toLowerCase().includes(indicator)) {
                professionalScore += 5;
            }
        }
        
        return Math.min(15, professionalScore);
    }

    private assessBasicGrammar(document: string): number {
        // Basic grammar checks
        let grammarScore = 0;
        
        // Check for proper sentence structure
        const sentences = document.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const properSentences = sentences.filter(s => /^[A-Z]/.test(s.trim()));
        
        if (properSentences.length / sentences.length > 0.8) {
            grammarScore += 10;
        }
        
        // Check for common grammar issues
        const grammarIssues = [
            /there\s+are\s+are/i,
            /is\s+are/i,
            /was\s+are/i,
            /\s+a\s+an\s+/i,
            /\s+an\s+a\s+/i
        ];
        
        let issues = 0;
        for (const pattern of grammarIssues) {
            if (pattern.test(document)) {
                issues++;
            }
        }
        
        grammarScore -= issues * 5;
        
        return Math.max(0, grammarScore);
    }

    private assessDocumentStructure(document: string, documentType: string): number {
        let structureScore = 0;
        
        // Check for proper heading hierarchy
        const headings = document.match(/^#+\s+.+$/gm) || [];
        if (headings.length > 0) {
            structureScore += 10;
            
            // Check for logical heading progression
            const headingLevels = headings.map(h => (h.match(/^#+/) || [''])[0].length);
            let properProgression = true;
            
            for (let i = 1; i < headingLevels.length; i++) {
                if (headingLevels[i] > headingLevels[i - 1] + 1) {
                    properProgression = false;
                    break;
                }
            }
            
            if (properProgression) {
                structureScore += 5;
            }
        }
        
        // Check for document-specific structure
        const expectedStructure = this.getExpectedStructure(documentType);
        let structureElements = 0;
        
        for (const element of expectedStructure) {
            if (document.toLowerCase().includes(element)) {
                structureElements++;
            }
        }
        
        structureScore += (structureElements / expectedStructure.length) * 10;
        
        return Math.min(15, structureScore);
    }

    private getExpectedStructure(documentType: string): string[] {
        const structures: Record<string, string[]> = {
            'project-charter': ['introduction', 'background', 'objectives', 'scope', 'timeline'],
            'requirements-documentation': ['introduction', 'scope', 'requirements', 'acceptance criteria'],
            'technical-design': ['overview', 'architecture', 'components', 'interfaces', 'implementation'],
            'quality-metrics': ['introduction', 'objectives', 'metrics', 'measurement', 'reporting']
        };
        
        return structures[documentType] || structures['project-charter'];
    }
}
