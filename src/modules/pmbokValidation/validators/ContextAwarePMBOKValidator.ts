/**
 * Context-Aware PMBOK Validator
 * 
 * Intelligently validates PMBOK compliance based on the specific purpose
 * and context of each document type. Unlike the previous monolithic approach,
 * this validator applies appropriate validation rules based on document category.
 * 
 * @version 2.0.0 - Enhanced with full PMBOK validation suite
 * @author ADPA Quality Assurance Engine Team
 * @created June 2025
 */

import { IValidator, ValidationConfig, ValidationResult } from '../interfaces/IValidator.js';
import { 
    PMBOK_DOCUMENT_REQUIREMENTS, 
    PMBOK_TERMINOLOGY,
    QUALITY_THRESHOLDS,
    QUALITY_SCORING,
    PMBOK_PERFORMANCE_DOMAINS,
    PMBOK_PRINCIPLES,
    VALUE_DELIVERY_SYSTEM,
    QUALITY_METRICS_REQUIREMENTS,
    RISK_MANAGEMENT_REQUIREMENTS,
    STAKEHOLDER_ENGAGEMENT_REQUIREMENTS,
    PROJECT_LIFECYCLE_REQUIREMENTS,
    RESOURCE_MANAGEMENT_REQUIREMENTS,
    COMMUNICATION_REQUIREMENTS,
    CHANGE_MANAGEMENT_REQUIREMENTS,
    KNOWLEDGE_MANAGEMENT_REQUIREMENTS,
    SUSTAINABILITY_REQUIREMENTS,
    DIGITAL_TRANSFORMATION_REQUIREMENTS
} from '../validationRules.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Document quality assessment structure
 */
interface DocumentQualityAssessment {
    score: number;
    issues: string[];
    strengths: string[];
}

/**
 * Context-specific validation rules for different document types
 */
const DOCUMENT_CONTEXT_RULES = {
    'mission-vision-core-values': {
        applicablePerformanceDomains: ['stakeholders'], // Only stakeholder alignment matters
        applicablePrinciples: ['value', 'leadership'], // Focus on value and leadership
        requiredElements: ['alignment with project goals', 'organizational values'],
        skipChecks: ['risk-management', 'technical-complexity', 'delivery-metrics', 'project-lifecycle', 'resource-management', 'digital-transformation'],
        category: 'strategic-statements'
    },
    'project-charter': {
        applicablePerformanceDomains: ['stakeholders', 'planning', 'project work'],
        applicablePrinciples: ['value', 'leadership', 'stewardship', 'systems thinking'],
        requiredElements: ['project purpose', 'measurable objectives', 'high-level requirements'],
        skipChecks: ['detailed-technical-specs'],
        category: 'project-charter'
    },
    'stakeholder-register': {
        applicablePerformanceDomains: ['stakeholders'],
        applicablePrinciples: ['stakeholders', 'leadership'],
        requiredElements: ['identification information', 'assessment information', 'stakeholder classification'],
        skipChecks: ['technical-delivery', 'development-approach', 'digital-transformation'],
        category: 'stakeholder-management'
    },
    'scope-management-plan': {
        applicablePerformanceDomains: ['planning', 'project work', 'delivery'],
        applicablePrinciples: ['systems thinking', 'tailoring', 'quality'],
        requiredElements: ['scope definition', 'wbs development', 'scope verification'],
        skipChecks: ['stakeholder-detailed-analysis'],
        category: 'scope-management'
    },
    'work-breakdown-structure': {
        applicablePerformanceDomains: ['planning', 'project work'],
        applicablePrinciples: ['systems thinking', 'tailoring'],
        requiredElements: ['work packages', 'deliverables'],
        skipChecks: ['stakeholder-engagement', 'risk-detailed-analysis'],
        category: 'scope-management'
    },
    'risk-register': {
        applicablePerformanceDomains: ['uncertainty', 'planning'],
        applicablePrinciples: ['risk', 'systems thinking', 'complexity'],
        requiredElements: ['risk identification', 'risk analysis', 'risk response'],
        skipChecks: ['stakeholder-detailed-engagement'],
        category: 'risk-management'
    }
};

export class ContextAwarePMBOKValidator implements IValidator {
    public readonly name = 'Context-Aware PMBOK Validator';
    public readonly description = 'Validates PMBOK compliance with context-appropriate rules for each document type';
    public readonly id = 'context-aware-pmbok';
    public readonly version = '2.0.0';
    public readonly tags = ['pmbok', 'context-aware', 'intelligent', 'enhanced'];
    
    // Required interface properties
    public readonly applicableDocuments: string[] = []; // Apply to all documents - empty array means all
    public readonly priority: number = 1; // High priority
    public readonly defaultEnabled: boolean = true;
    
    private documentsBasePath: string;
    
    constructor(documentsBasePath: string = 'generated-documents') {
        this.documentsBasePath = documentsBasePath;
    }

    /**
     * Check if this validator is applicable to the given document types
     */
    public isApplicable(documentTypes: string[]): boolean {
        // This validator is applicable to any document set
        return documentTypes.length > 0;
    }

    public async validate(config: ValidationConfig): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: string[] = [];
        const strengths: string[] = [];
        const recommendations: string[] = [];
        
        let totalScore = 0;
        let maxTotalScore = 0;
        const documentResults: Record<string, any> = {};
        
        console.log('🧠 Running enhanced context-aware PMBOK validation...');
        
        // Validate each document with appropriate context rules
        for (const [docKey, docPath] of Object.entries(config.documents)) {
            const result = await this.validateDocument(docKey, docPath);
            documentResults[docKey] = result;
            
            totalScore += result.score;
            maxTotalScore += result.maxScore;
            
            if (result.issues.length > 0) {
                issues.push(...result.issues.map(issue => `${docKey}: ${issue}`));
            }
            
            if (result.strengths.length > 0) {
                strengths.push(...result.strengths.map(strength => `${docKey}: ${strength}`));
            }
            
            if (result.recommendations.length > 0) {
                recommendations.push(...result.recommendations);
            }
        }
        
        // Calculate overall score
        const score = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;
        const passed = score >= 70; // 70% threshold for context-aware validation
        
        // Add global recommendations based on overall performance
        if (score < 80) {
            recommendations.push('Consider reviewing PMBOK 7.0 performance domains for all documents');
        }
        if (issues.some(issue => issue.includes('Missing required'))) {
            recommendations.push('Focus on including all required PMBOK elements in each document type');
        }
        
        return {
            validatorId: this.id,
            validatorName: this.name,
            passed,
            score,
            maxScore: 100,
            issues,
            strengths,
            severity: score < 50 ? 'critical' : score < 70 ? 'warning' : 'info',
            recommendations,
            executionTimeMs: Date.now() - startTime,
            metadata: {
                documentResults,
                averageScore: score,
                documentsValidated: Object.keys(config.documents).length,
                contextRulesApplied: Object.keys(DOCUMENT_CONTEXT_RULES).length
            }
        };
    }
    
    /**
     * Validate a single document with context-appropriate rules
     */
    private async validateDocument(docKey: string, docPath: string): Promise<{
        score: number;
        maxScore: number;
        issues: string[];
        strengths: string[];
        recommendations: string[];
    }> {
        const result = {
            score: 100,
            maxScore: 100,
            issues: [] as string[],
            strengths: [] as string[],
            recommendations: [] as string[]
        };
        
        try {
            // Check if file exists
            const fullPath = path.join(this.documentsBasePath, docPath);
            let content: string;
            
            try {
                content = await fs.readFile(fullPath, 'utf-8');
            } catch (error) {
                result.issues.push('Document not found or could not be read');
                result.score = 0;
                return result;
            }
            
            // Get context-specific rules for this document type
            const contextRules = DOCUMENT_CONTEXT_RULES[docKey as keyof typeof DOCUMENT_CONTEXT_RULES];
            if (!contextRules) {
                // Use generic validation for unknown document types
                return this.validateGenericDocument(docKey, content);
            }
            
            // Perform comprehensive context-aware quality assessment
            const qualityAssessment = await this.assessDocumentQuality(content, docKey, contextRules);
            result.score = qualityAssessment.score;
            result.issues.push(...qualityAssessment.issues);
            result.strengths.push(...qualityAssessment.strengths);
            
            if (result.score < 70) {
                result.recommendations.push(`Enhance ${docKey} to better align with PMBOK ${contextRules.applicablePerformanceDomains.join(', ')} domain(s)`);
            }
            
        } catch (error) {
            result.issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.score = 0;
        }
        
        return result;
    }
    
    /**
     * Comprehensive document quality assessment with context-aware PMBOK validation
     */
    private async assessDocumentQuality(content: string, docType: string, contextRules: any): Promise<DocumentQualityAssessment> {
        const issues: string[] = [];
        const strengths: string[] = [];
        
        // Start with perfect score and deduct for non-compliance
        let score = QUALITY_SCORING.BASE_SCORE;

        // Get document-specific requirements
        const requirements = PMBOK_DOCUMENT_REQUIREMENTS[docType];
        if (!requirements) {
            // If no specific requirements, apply basic quality checks only
            return await this.assessBasicQuality(content);
        }

        // Basic structural quality checks
        const basicQuality = await this.assessBasicQuality(content);
        issues.push(...basicQuality.issues);
        strengths.push(...basicQuality.strengths);
        score = basicQuality.score;

        // Context-aware detailed PMBOK validation (only applies relevant checks)
        const detailedValidation = await this.performDetailedPmbokValidation(content, docType, requirements, contextRules);
        issues.push(...detailedValidation.issues);
        strengths.push(...detailedValidation.strengths);
        score -= detailedValidation.penaltyPoints;
        score += detailedValidation.bonusPoints;

        // Check for required elements (context-specific)
        let missingRequiredCount = 0;
        for (const element of requirements.required) {
            if (!this.contentContainsElement(content, element)) {
                issues.push(`Missing required element: ${element}`);
                missingRequiredCount++;
                score -= QUALITY_SCORING.MISSING_REQUIRED_ELEMENT_PENALTY;
            } else {
                strengths.push(`Contains required element: ${element}`);
            }
        }

        // Ensure score is within valid range
        const finalScore = Math.max(0, Math.min(Math.round(score), QUALITY_THRESHOLDS.PERFECT_SCORE));

        return {
            score: finalScore,
            issues,
            strengths
        };
    }

    /**
     * Perform detailed PMBOK validation with context awareness
     */
    private async performDetailedPmbokValidation(
        content: string, 
        docType: string, 
        requirements: any, 
        contextRules: any
    ): Promise<{
        issues: string[];
        strengths: string[];
        penaltyPoints: number;
        bonusPoints: number;
    }> {
        const issues: string[] = [];
        const strengths: string[] = [];
        let penaltyPoints = 0;
        let bonusPoints = 0;

        // Only validate performance domains that are applicable to this document type
        if (contextRules.applicablePerformanceDomains?.length > 0) {
            const performanceDomains = await this.validateContextualPerformanceDomains(content, contextRules.applicablePerformanceDomains);
            issues.push(...performanceDomains.findings);
            if (performanceDomains.score >= 80) {
                strengths.push('Strong performance domain coverage');
                bonusPoints += performanceDomains.score * QUALITY_SCORING.PERFORMANCE_DOMAIN_WEIGHT;
            } else if (performanceDomains.findings.length > 0) {
                penaltyPoints += performanceDomains.findings.length * QUALITY_SCORING.MISSING_PERFORMANCE_DOMAIN_PENALTY;
            }
        }

        // Only validate principles that are applicable to this document type
        if (contextRules.applicablePrinciples?.length > 0) {
            const principles = await this.validateContextualPrinciples(content, contextRules.applicablePrinciples);
            issues.push(...principles.findings);
            if (principles.score >= 80) {
                strengths.push('Well-aligned with PMBOK principles');
                bonusPoints += principles.score * QUALITY_SCORING.PRINCIPLES_WEIGHT;
            } else if (principles.findings.length > 0) {
                penaltyPoints += principles.findings.length * QUALITY_SCORING.MISSING_PRINCIPLE_PENALTY;
            }
        }

        // Validate specific PMBOK areas only if not in the skip list
        const skipChecks = contextRules.skipChecks || [];

        if (!skipChecks.includes('value-delivery')) {
            const valueDelivery = await this.validateValueDelivery(content);
            issues.push(...valueDelivery.findings);
            if (valueDelivery.score >= 80) {
                strengths.push('Comprehensive value delivery approach');
                bonusPoints += valueDelivery.score * QUALITY_SCORING.VALUE_DELIVERY_WEIGHT;
            } else if (valueDelivery.findings.length > 0) {
                penaltyPoints += valueDelivery.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('quality-metrics')) {
            const qualityMetrics = await this.validateQualityMetrics(content);
            issues.push(...qualityMetrics.findings);
            if (qualityMetrics.score >= 80) {
                strengths.push('Robust quality metrics implementation');
                bonusPoints += qualityMetrics.score * QUALITY_SCORING.QUALITY_METRICS_WEIGHT;
            } else if (qualityMetrics.findings.length > 0) {
                penaltyPoints += qualityMetrics.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('risk-management')) {
            const riskManagement = await this.validateRiskManagement(content);
            issues.push(...riskManagement.findings);
            if (riskManagement.score >= 80) {
                strengths.push('Thorough risk management approach');
                bonusPoints += riskManagement.score * QUALITY_SCORING.RISK_MANAGEMENT_WEIGHT;
            } else if (riskManagement.findings.length > 0) {
                penaltyPoints += riskManagement.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('stakeholder-engagement')) {
            const stakeholderEngagement = await this.validateStakeholderEngagement(content);
            issues.push(...stakeholderEngagement.findings);
            if (stakeholderEngagement.score >= 80) {
                strengths.push('Effective stakeholder engagement strategy');
                bonusPoints += stakeholderEngagement.score * QUALITY_SCORING.STAKEHOLDER_ENGAGEMENT_WEIGHT;
            } else if (stakeholderEngagement.findings.length > 0) {
                penaltyPoints += stakeholderEngagement.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('project-lifecycle')) {
            const projectLifecycle = await this.validateProjectLifecycle(content);
            issues.push(...projectLifecycle.findings);
            if (projectLifecycle.score >= 80) {
                strengths.push('Clear project lifecycle integration');
                bonusPoints += projectLifecycle.score * QUALITY_SCORING.LIFECYCLE_INTEGRATION_WEIGHT;
            } else if (projectLifecycle.findings.length > 0) {
                penaltyPoints += projectLifecycle.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('resource-management')) {
            const resourceManagement = await this.validateResourceManagement(content);
            issues.push(...resourceManagement.findings);
            if (resourceManagement.score >= 80) {
                strengths.push('Comprehensive resource management');
                bonusPoints += resourceManagement.score * QUALITY_SCORING.RESOURCE_MANAGEMENT_WEIGHT;
            } else if (resourceManagement.findings.length > 0) {
                penaltyPoints += resourceManagement.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('communication')) {
            const communication = await this.validateCommunication(content);
            issues.push(...communication.findings);
            if (communication.score >= 80) {
                strengths.push('Well-defined communication approach');
                bonusPoints += communication.score * QUALITY_SCORING.COMMUNICATION_WEIGHT;
            } else if (communication.findings.length > 0) {
                penaltyPoints += communication.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('change-management')) {
            const changeManagement = await this.validateChangeManagement(content);
            issues.push(...changeManagement.findings);
            if (changeManagement.score >= 80) {
                strengths.push('Strong change management framework');
                bonusPoints += changeManagement.score * QUALITY_SCORING.CHANGE_MANAGEMENT_WEIGHT;
            } else if (changeManagement.findings.length > 0) {
                penaltyPoints += changeManagement.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('knowledge-management')) {
            const knowledgeManagement = await this.validateKnowledgeManagement(content);
            issues.push(...knowledgeManagement.findings);
            if (knowledgeManagement.score >= 80) {
                strengths.push('Effective knowledge management');
                bonusPoints += knowledgeManagement.score * QUALITY_SCORING.KNOWLEDGE_MANAGEMENT_WEIGHT;
            } else if (knowledgeManagement.findings.length > 0) {
                penaltyPoints += knowledgeManagement.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('sustainability')) {
            const sustainability = await this.validateSustainability(content);
            issues.push(...sustainability.findings);
            if (sustainability.score >= 80) {
                strengths.push('Strong sustainability considerations');
                bonusPoints += sustainability.score * QUALITY_SCORING.SUSTAINABILITY_WEIGHT;
            } else if (sustainability.findings.length > 0) {
                penaltyPoints += sustainability.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        if (!skipChecks.includes('digital-transformation')) {
            const digitalTransformation = await this.validateDigitalTransformation(content);
            issues.push(...digitalTransformation.findings);
            if (digitalTransformation.score >= 80) {
                strengths.push('Robust digital transformation approach');
                bonusPoints += digitalTransformation.score * QUALITY_SCORING.DIGITAL_TRANSFORMATION_WEIGHT;
            } else if (digitalTransformation.findings.length > 0) {
                penaltyPoints += digitalTransformation.findings.length * QUALITY_SCORING.MISSING_CRITICAL_COMPONENT_PENALTY;
            }
        }

        return { issues, strengths, penaltyPoints, bonusPoints };
    }
    
    /**
     * Check if content has a required PMBOK element
     */
    private hasRequiredElement(content: string, element: string): boolean {
        const normalizedContent = content.toLowerCase();
        const normalizedElement = element.toLowerCase();
        
        // Simple keyword matching - could be enhanced with NLP
        const keywords = normalizedElement.split(' ');
        return keywords.some(keyword => normalizedContent.includes(keyword));
    }
      /**
     * Analyze content for context-specific requirements with enhanced intelligence
     */
    private analyzeContentForContext(content: string, contextRules: any): {
        scoreAdjustment: number;
        strengths: string[];
    } {
        let scoreAdjustment = 0;
        const strengths: string[] = [];
        
        // Enhanced performance domain validation - only check applicable domains
        for (const domain of contextRules.applicablePerformanceDomains) {
            const domainScore = this.validatePerformanceDomain(content, domain);
            if (domainScore > 0) {
                scoreAdjustment += domainScore;
                strengths.push(`Strong ${domain} performance domain coverage`);
            }
        }
        
        // Enhanced principles validation - only check applicable principles
        for (const principle of contextRules.applicablePrinciples) {
            const principleScore = this.validatePMBOKPrinciple(content, principle);
            if (principleScore > 0) {
                scoreAdjustment += principleScore;
                strengths.push(`Demonstrates ${principle} principle effectively`);
            }
        }
        
        // Skip validations that don't apply to this document type
        const skipChecks = contextRules.skipChecks || [];
        if (!skipChecks.includes('terminology')) {
            const terminologyScore = this.validateContextualTerminology(content, contextRules);
            scoreAdjustment += terminologyScore;
            if (terminologyScore > 0) {
                strengths.push('Uses appropriate PMBOK terminology');
            }
        }
        
        return { scoreAdjustment, strengths };
    }
    
    /**
     * Validate a specific performance domain only if it's applicable to the document type
     */
    private validatePerformanceDomain(content: string, domain: string): number {
        const domainKeywords: Record<string, string[]> = {
            'stakeholders': ['stakeholder', 'engagement', 'communication', 'influence', 'expectations'],
            'team': ['team', 'collaboration', 'leadership', 'skills', 'development'],
            'development-approach': ['approach', 'methodology', 'lifecycle', 'process', 'framework'],
            'planning': ['plan', 'schedule', 'scope', 'objectives', 'timeline'],
            'project-work': ['deliverable', 'execution', 'quality', 'performance', 'monitoring'],
            'delivery': ['delivery', 'value', 'benefits', 'outcomes', 'results'],
            'measurement': ['metrics', 'measurement', 'kpi', 'baseline', 'progress'],
            'uncertainty': ['risk', 'uncertainty', 'assumptions', 'constraints', 'contingency']
        };
        
        const keywords = domainKeywords[domain.toLowerCase()] || [];
        const matches = keywords.filter(keyword => 
            content.toLowerCase().includes(keyword)
        ).length;
        
        // Return score based on keyword coverage (0-10 points)
        return Math.min(10, matches * 2);
    }
    
    /**
     * Validate a specific PMBOK principle only if it's applicable to the document type
     */
    private validatePMBOKPrinciple(content: string, principle: string): number {
        const principleKeywords: Record<string, string[]> = {
            'stewardship': ['responsibility', 'accountability', 'stewardship', 'governance'],
            'stakeholders': ['stakeholder', 'engagement', 'involvement', 'participation'],
            'value': ['value', 'benefit', 'outcome', 'return', 'impact'],
            'systems-thinking': ['system', 'integration', 'holistic', 'interconnected'],
            'leadership': ['leadership', 'influence', 'direction', 'guidance', 'vision'],
            'tailoring': ['tailoring', 'adaptation', 'customization', 'flexibility'],
            'quality': ['quality', 'standard', 'excellence', 'requirements'],
            'complexity': ['complexity', 'ambiguity', 'uncertainty', 'dynamic'],
            'risk': ['risk', 'threat', 'opportunity', 'uncertainty'],
            'adaptability': ['adaptability', 'agility', 'flexibility', 'change'],
            'change': ['change', 'transformation', 'evolution', 'improvement']
        };
        
        const keywords = principleKeywords[principle.toLowerCase()] || [];
        const matches = keywords.filter(keyword => 
            content.toLowerCase().includes(keyword)
        ).length;
        
        // Return score based on keyword coverage (0-5 points)
        return Math.min(5, matches);
    }
    
    /**
     * Validate terminology that's contextually appropriate for the document type
     */
    private validateContextualTerminology(content: string, contextRules: any): number {
        // Only validate terminology that's relevant to this document type
        const relevantTerms = this.getRelevantTerminology(contextRules.category);
        const foundTerms = relevantTerms.filter(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );
        
        // Return score based on relevant terminology usage (0-15 points)
        return Math.min(15, foundTerms.length * 3);
    }
    
    /**
     * Get terminology that's relevant to a specific document category
     */
    private getRelevantTerminology(category: string): string[] {
        const terminologyByCategory: Record<string, string[]> = {
            'strategic-statements': ['mission', 'vision', 'values', 'purpose', 'goals', 'objectives'],
            'stakeholder-management': ['stakeholder', 'engagement', 'analysis', 'register', 'influence'],
            'scope-management': ['scope', 'requirements', 'deliverables', 'boundaries', 'acceptance'],
            'project-charter': ['charter', 'authorization', 'sponsor', 'objectives', 'success criteria'],
            'risk-management': ['risk', 'threat', 'opportunity', 'probability', 'impact', 'response'],
            'quality-management': ['quality', 'standards', 'metrics', 'assurance', 'control'],
            'management-plans': ['plan', 'process', 'procedure', 'guidelines', 'framework']
        };
        
        return terminologyByCategory[category] || [];
    }
    
    /**
     * Generic validation for unknown document types
     */
    private validateGenericDocument(docKey: string, content: string): {
        score: number;
        maxScore: number;
        issues: string[];
        strengths: string[];
        recommendations: string[];
    } {
        const result = {
            score: 80, // Start with reasonable score for unknown types
            maxScore: 100,
            issues: [] as string[],
            strengths: ['Content exists'] as string[],
            recommendations: [`Add specific validation rules for document type: ${docKey}`] as string[]
        };
        
        if (content.length < 200) {
            result.issues.push('Document appears to be too short');
            result.score -= 20;
        }
        
        if (!content.includes('#')) {
            result.issues.push('Document lacks proper structure (no headers found)');
            result.score -= 10;
        }
          return result;
    }

    /**
     * Basic quality assessment for content structure and terminology
     */
    private async assessBasicQuality(content: string): Promise<DocumentQualityAssessment> {
        const issues: string[] = [];
        const strengths: string[] = [];
        let score = QUALITY_SCORING.BASE_SCORE;

        // Basic structural checks
        if (content.length < QUALITY_THRESHOLDS.BRIEF_CONTENT_LENGTH) {
            issues.push('Content is too brief');
            score -= QUALITY_SCORING.CRITICAL_ISSUE_PENALTY;
        } else if (content.length >= QUALITY_THRESHOLDS.COMPREHENSIVE_CONTENT_LENGTH) {
            strengths.push('Comprehensive content coverage');
        }

        const sections = content.split('\n\n').filter(section => section.trim().length > 0);
        if (sections.length < QUALITY_THRESHOLDS.MIN_SECTION_COUNT) {
            issues.push('Insufficient section structure');
            score -= QUALITY_SCORING.WARNING_PENALTY;
        } else {
            strengths.push('Well-structured with multiple sections');
        }

        const pmbokTerms = PMBOK_TERMINOLOGY.filter(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );
        if (pmbokTerms.length < QUALITY_THRESHOLDS.MIN_PMBOK_TERMS) {
            issues.push('Insufficient PMBOK terminology usage');
            score -= QUALITY_SCORING.WARNING_PENALTY;
        } else {
            strengths.push(`Uses appropriate PMBOK terminology (${pmbokTerms.length} terms found)`);
        }

        return {
            score: Math.max(0, Math.min(Math.round(score), QUALITY_THRESHOLDS.PERFECT_SCORE)),
            issues,
            strengths
        };
    }

    /**
     * Check if content contains a specific element
     */
    private contentContainsElement(content: string, element: string): boolean {
        const contentLower = content.toLowerCase();
        const elementLower = element.toLowerCase();
        
        // Check for exact phrase or key words from the element
        const keywords = elementLower.split(' ');
        return keywords.every(keyword => contentLower.includes(keyword)) ||
               contentLower.includes(elementLower);
    }

    /**
     * Validate contextual performance domains (only applicable ones)
     */
    private async validateContextualPerformanceDomains(content: string, applicableDomains: string[]): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Only check applicable performance domains
        const relevantDomains = PMBOK_PERFORMANCE_DOMAINS.filter(domain => 
            applicableDomains.some(applicable => 
                domain.toLowerCase().includes(applicable.toLowerCase()) ||
                applicable.toLowerCase().includes(domain.toLowerCase())
            )
        );
        
        for (const domain of relevantDomains) {
            if (!this.contentContainsElement(content, domain)) {
                findings.push(`Missing performance domain: ${domain}`);
                score -= 10; // Deduct points for each missing domain
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate contextual principles (only applicable ones)
     */
    private async validateContextualPrinciples(content: string, applicablePrinciples: string[]): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Only check applicable PMBOK principles
        const relevantPrinciples = PMBOK_PRINCIPLES.filter(principle => 
            applicablePrinciples.some(applicable => 
                principle.toLowerCase().includes(applicable.toLowerCase()) ||
                applicable.toLowerCase().includes(principle.toLowerCase())
            )
        );
        
        for (const principle of relevantPrinciples) {
            if (!this.contentContainsElement(content, principle)) {
                findings.push(`Missing PMBOK principle: ${principle}`);
                score -= 5; // Deduct points for each missing principle
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate value delivery system in the document
     */
    private async validateValueDelivery(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for description of value delivery system
        if (!Array.isArray(VALUE_DELIVERY_SYSTEM) || VALUE_DELIVERY_SYSTEM.length === 0 || 
            !VALUE_DELIVERY_SYSTEM.some(system => this.contentContainsElement(content, system))) {
            findings.push('Missing description of value delivery system');
            score -= 20;
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate quality metrics in the document
     */
    private async validateQualityMetrics(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all quality metrics requirements
        for (const metric of QUALITY_METRICS_REQUIREMENTS.SMART_OBJECTIVES) {
            if (!this.contentContainsElement(content, metric)) {
                findings.push(`Missing quality metric: ${metric}`);
                score -= 10;
            }
        }
        
        for (const metric of QUALITY_METRICS_REQUIREMENTS.PERFORMANCE_METRICS) {
            if (!this.contentContainsElement(content, metric)) {
                findings.push(`Missing performance metric: ${metric}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate risk management in the document
     */
    private async validateRiskManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all risk management requirements
        for (const requirement of RISK_MANAGEMENT_REQUIREMENTS.RISK_BREAKDOWN) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing risk management requirement: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of RISK_MANAGEMENT_REQUIREMENTS.RISK_RESPONSE) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing risk response requirement: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate stakeholder engagement in the document
     */
    private async validateStakeholderEngagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all stakeholder engagement requirements
        for (const requirement of STAKEHOLDER_ENGAGEMENT_REQUIREMENTS.ASSESSMENT) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing stakeholder engagement assessment: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of STAKEHOLDER_ENGAGEMENT_REQUIREMENTS.STRATEGIES) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing stakeholder engagement strategy: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate project lifecycle integration in the document
     */
    private async validateProjectLifecycle(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all project lifecycle requirements
        for (const requirement of PROJECT_LIFECYCLE_REQUIREMENTS.PHASES) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing project lifecycle phase: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of PROJECT_LIFECYCLE_REQUIREMENTS.INTEGRATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing project lifecycle integration: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate resource management in the document
     */
    private async validateResourceManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all resource management requirements
        for (const requirement of RESOURCE_MANAGEMENT_REQUIREMENTS.PLANNING) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing resource management planning: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of RESOURCE_MANAGEMENT_REQUIREMENTS.CONTROL) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing resource management control: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate communication in the document
     */
    private async validateCommunication(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all communication requirements
        for (const requirement of COMMUNICATION_REQUIREMENTS.PLANNING) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing communication planning: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of COMMUNICATION_REQUIREMENTS.EXECUTION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing communication execution: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate change management in the document
     */
    private async validateChangeManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all change management requirements
        for (const requirement of CHANGE_MANAGEMENT_REQUIREMENTS.CONTROL) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing change management control: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of CHANGE_MANAGEMENT_REQUIREMENTS.IMPLEMENTATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing change management implementation: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate knowledge management in the document
     */
    private async validateKnowledgeManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all knowledge management requirements
        for (const requirement of KNOWLEDGE_MANAGEMENT_REQUIREMENTS.PROCESSES) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing knowledge management process: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of KNOWLEDGE_MANAGEMENT_REQUIREMENTS.INTEGRATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing knowledge management integration: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate sustainability in the document
     */
    private async validateSustainability(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all sustainability requirements
        for (const requirement of SUSTAINABILITY_REQUIREMENTS.CONSIDERATIONS) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing sustainability consideration: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of SUSTAINABILITY_REQUIREMENTS.IMPLEMENTATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing sustainability implementation: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate digital transformation in the document
     */
    private async validateDigitalTransformation(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all digital transformation requirements
        for (const requirement of DIGITAL_TRANSFORMATION_REQUIREMENTS.TECHNOLOGY) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing digital transformation technology: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of DIGITAL_TRANSFORMATION_REQUIREMENTS.INTEGRATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing digital transformation integration: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }
}
