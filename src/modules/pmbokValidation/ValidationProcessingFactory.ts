/**
 * Document Validation Processing Factory
 * 
 * Factory pattern implementation for document-specific validation processing.
 * Creates specialized validators based on document type and context.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 */

import { DocumentValidationContext, getValidationContext } from './DocumentValidationRegistry';

/**
 * Result of document validation processing
 */
export interface ValidationProcessingResult {
    score: number;
    issues: string[];
    strengths: string[];
    missingElements: string[];
    contextualRelevance: number; // How relevant the validation is to this document type
}

/**
 * Base abstract validator for all document types
 */
abstract class BaseDocumentValidator {
    protected context: DocumentValidationContext;
    protected content: string;

    constructor(context: DocumentValidationContext, content: string) {
        this.context = context;
        this.content = content;
    }

    /**
     * Main validation method - template pattern
     */
    public async validate(): Promise<ValidationProcessingResult> {
        const issues: string[] = [];
        const strengths: string[] = [];
        const missingElements: string[] = [];

        // Step 1: Validate contextually relevant aspects
        const relevanceScore = this.validateContextualRelevance();
        
        // Step 2: Check required elements specific to this document type
        const requiredElementsResult = this.validateRequiredElements();
        issues.push(...requiredElementsResult.issues);
        missingElements.push(...requiredElementsResult.missing);
        strengths.push(...requiredElementsResult.strengths);

        // Step 3: Validate only relevant PMBOK aspects
        const pmbokResult = this.validateRelevantPMBOKAspects();
        issues.push(...pmbokResult.issues);
        strengths.push(...pmbokResult.strengths);

        // Step 4: Calculate weighted score
        const score = this.calculateWeightedScore(relevanceScore, requiredElementsResult.score, pmbokResult.score);

        return {
            score,
            issues,
            strengths,
            missingElements,
            contextualRelevance: relevanceScore
        };
    }

    /**
     * Validate contextual relevance - does the document serve its purpose?
     */
    protected abstract validateContextualRelevance(): number;

    /**
     * Validate required elements specific to this document type
     */
    protected abstract validateRequiredElements(): { score: number; issues: string[]; strengths: string[]; missing: string[] };

    /**
     * Validate only the PMBOK aspects relevant to this document type
     */
    protected validateRelevantPMBOKAspects(): { score: number; issues: string[]; strengths: string[] } {
        const issues: string[] = [];
        const strengths: string[] = [];
        let score = 100;

        // Only check relevant performance domains
        const missingDomains = this.checkRelevantPerformanceDomains();
        if (missingDomains.length > 0) {
            issues.push(...missingDomains.map(domain => `Missing performance domain: ${domain}`));
            score -= missingDomains.length * 10;
        }

        // Only check relevant principles
        const missingPrinciples = this.checkRelevantPrinciples();
        if (missingPrinciples.length > 0) {
            issues.push(...missingPrinciples.map(principle => `Missing PMBOK principle: ${principle}`));
            score -= missingPrinciples.length * 5;
        }

        // Check PMBOK terminology usage
        const terminologyScore = this.checkPMBOKTerminologyUsage();
        if (terminologyScore > 0) {
            strengths.push(`Uses appropriate PMBOK terminology (${terminologyScore} terms found)`);
        } else {
            issues.push('Insufficient PMBOK terminology usage');
            score -= 15;
        }

        return { score: Math.max(0, score), issues, strengths };
    }

    /**
     * Check only the performance domains relevant to this document type
     */
    protected checkRelevantPerformanceDomains(): string[] {
        const relevantDomains = this.context.relevantPerformanceDomains;
        const missing: string[] = [];

        for (const domain of relevantDomains) {
            if (!this.hasPerformanceDomainCoverage(domain)) {
                missing.push(domain);
            }
        }

        return missing;
    }

    /**
     * Check only the principles relevant to this document type
     */
    protected checkRelevantPrinciples(): string[] {
        const relevantPrinciples = this.context.relevantPrinciples;
        const missing: string[] = [];

        for (const principle of relevantPrinciples) {
            if (!this.hasPrincipleCoverage(principle)) {
                missing.push(principle);
            }
        }

        return missing;
    }

    /**
     * Check if document covers a specific performance domain
     */    protected hasPerformanceDomainCoverage(domain: string): boolean {
        const domainKeywords: Record<string, string[]> = {
            'stakeholders': ['stakeholder', 'customer', 'user', 'sponsor', 'team member'],
            'team': ['team', 'collaboration', 'communication', 'leadership'],
            'development approach': ['methodology', 'approach', 'process', 'framework'],
            'planning': ['plan', 'schedule', 'timeline', 'milestone', 'deliverable'],
            'project work': ['work', 'task', 'activity', 'execution', 'implementation'],
            'delivery': ['delivery', 'outcome', 'output', 'result', 'value'],
            'measurement': ['measure', 'metric', 'kpi', 'performance', 'success criteria'],
            'uncertainty': ['risk', 'uncertainty', 'assumption', 'constraint', 'issue']
        };

        const keywords = domainKeywords[domain.toLowerCase()] || [];
        return keywords.some((keyword: string) => this.content.toLowerCase().includes(keyword));
    }    /**
     * Check if document demonstrates a specific PMBOK principle
     */
    protected hasPrincipleCoverage(principle: string): boolean {
        const principleKeywords: Record<string, string[]> = {
            'stewardship': ['responsibility', 'accountability', 'governance', 'oversight'],
            'stakeholders': ['stakeholder', 'customer', 'user', 'sponsor'],
            'value': ['value', 'benefit', 'outcome', 'return'],
            'systems thinking': ['integration', 'system', 'holistic', 'interconnected'],
            'leadership': ['leadership', 'vision', 'direction', 'guidance'],
            'tailoring': ['tailored', 'customized', 'adapted', 'specific'],
            'quality': ['quality', 'standard', 'excellence', 'criteria'],
            'complexity': ['complex', 'challenging', 'sophisticated'],
            'risk': ['risk', 'uncertainty', 'threat', 'opportunity'],
            'adaptability': ['adaptable', 'flexible', 'agile', 'responsive'],
            'change': ['change', 'evolve', 'transform', 'modify']
        };

        const keywords = principleKeywords[principle.toLowerCase()] || [];
        return keywords.some((keyword: string) => this.content.toLowerCase().includes(keyword));
    }

    /**
     * Check PMBOK terminology usage
     */
    protected checkPMBOKTerminologyUsage(): number {
        const pmbokTerms = [
            'project charter', 'stakeholder', 'scope', 'deliverable', 'milestone',
            'work breakdown structure', 'risk', 'quality', 'resource', 'schedule',
            'budget', 'communication', 'procurement', 'integration', 'requirements'
        ];

        let count = 0;
        for (const term of pmbokTerms) {
            if (this.content.toLowerCase().includes(term.toLowerCase())) {
                count++;
            }
        }

        return count;
    }

    /**
     * Calculate weighted score based on different validation aspects
     */
    protected calculateWeightedScore(relevanceScore: number, requiredElementsScore: number, pmbokScore: number): number {
        // Weight the scores based on importance for this document type
        const relevanceWeight = 0.4;  // 40% - most important
        const requiredElementsWeight = 0.4;  // 40% - equally important
        const pmbokWeight = 0.2;  // 20% - supportive

        const weightedScore = (
            relevanceScore * relevanceWeight +
            requiredElementsScore * requiredElementsWeight +
            pmbokScore * pmbokWeight
        );

        return Math.round(Math.max(0, Math.min(100, weightedScore)));
    }
}

/**
 * Specialized validator for Mission-Vision-Core Values documents
 */
class MissionVisionCoreValuesValidator extends BaseDocumentValidator {
    protected validateContextualRelevance(): number {
        let score = 100;
        const content = this.content.toLowerCase();

        // Must have mission, vision, or values content
        if (!content.includes('mission') && !content.includes('vision') && !content.includes('values')) {
            score -= 30;
        }

        // Should be inspiring and forward-looking
        const inspirationalWords = ['inspire', 'achieve', 'excellence', 'innovation', 'leadership', 'success'];
        const foundInspirational = inspirationalWords.filter(word => content.includes(word)).length;
        if (foundInspirational === 0) {
            score -= 20;
        }

        // Should be specific to the organization/project
        if (content.includes('company') || content.includes('organization') || content.includes('project')) {
            // Good - specific context
        } else {
            score -= 15;
        }

        return Math.max(0, score);
    }

    protected validateRequiredElements(): { score: number; issues: string[]; strengths: string[]; missing: string[] } {
        const issues: string[] = [];
        const strengths: string[] = [];
        const missing: string[] = [];
        let score = 100;

        const content = this.content.toLowerCase();

        // Check for alignment with project goals (from custom rules)
        if (!content.includes('goal') && !content.includes('objective') && !content.includes('purpose')) {
            missing.push('alignment with project goals');
            issues.push('Missing required PMBOK element \'alignment with project goals\'');
            score -= 25;
        }

        // Check document structure
        if (content.includes('mission') || content.includes('vision') || content.includes('values')) {
            strengths.push('Well-structured with appropriate sections');
        } else {
            issues.push('Insufficient section structure');
            score -= 20;
        }

        // Check for comprehensive content
        if (content.length > 500) {
            strengths.push('Comprehensive content coverage');
        }

        return { score: Math.max(0, score), issues, strengths, missing };
    }
}

/**
 * Specialized validator for Project Charter documents
 */
class ProjectCharterValidator extends BaseDocumentValidator {
    protected validateContextualRelevance(): number {
        let score = 100;
        const content = this.content.toLowerCase();

        // Must have key charter elements
        const charterElements = ['purpose', 'objective', 'scope', 'deliverable', 'stakeholder'];
        const foundElements = charterElements.filter(element => content.includes(element)).length;
        
        if (foundElements < 3) {
            score -= 40;
        }

        return Math.max(0, score);
    }

    protected validateRequiredElements(): { score: number; issues: string[]; strengths: string[]; missing: string[] } {
        const issues: string[] = [];
        const strengths: string[] = [];
        const missing: string[] = [];
        let score = 100;

        const content = this.content.toLowerCase();

        // Check for measurable objectives (from custom rules)
        if (!content.includes('measurable') && !content.includes('metric') && !content.includes('kpi')) {
            missing.push('measurable objectives');
            issues.push('Missing required PMBOK element \'measurable objectives\'');
            score -= 25;
        }

        return { score: Math.max(0, score), issues, strengths, missing };
    }
}

/**
 * Generic validator for documents not in the specialized registry
 */
class GenericDocumentValidator extends BaseDocumentValidator {
    protected validateContextualRelevance(): number {
        // Generic documents get a moderate relevance score
        return 70;
    }

    protected validateRequiredElements(): { score: number; issues: string[]; strengths: string[]; missing: string[] } {
        const issues: string[] = [];
        const strengths: string[] = [];
        const missing: string[] = [];
        
        // Basic content quality checks
        let score = 80;
        
        if (this.content.length > 500) {
            strengths.push('Comprehensive content coverage');
        } else {
            score -= 20;
        }

        return { score, issues, strengths, missing };
    }
}

/**
 * Validation Processing Factory
 */
export class ValidationProcessingFactory {
    /**
     * Create appropriate validator for document type
     */
    public static createValidator(documentType: string, content: string): BaseDocumentValidator {
        const context = getValidationContext(documentType);
        
        if (!context) {
            // Create generic context for unregistered documents
            const genericContext: DocumentValidationContext = {
                documentType,
                category: 'unknown',
                relevantPerformanceDomains: [],
                relevantPrinciples: [],
                applicableQualityMetrics: [],
                relevantPerformanceMetrics: [],
                relevantRiskManagement: [],
                relevantStakeholderEngagement: [],
                relevantProjectLifecycle: [],
                relevantResourceManagement: [],
                relevantCommunication: [],
                relevantChangeManagement: [],
                relevantKnowledgeManagement: [],
                relevantSustainability: [],
                relevantDigitalTransformation: [],
                scoreWeight: 0.5,
                minimumScore: 50
            };
            return new GenericDocumentValidator(genericContext, content);
        }

        // Create specialized validators based on document type
        switch (documentType) {
            case 'mission-vision-core-values':
                return new MissionVisionCoreValuesValidator(context, content);
            case 'project-charter':
                return new ProjectCharterValidator(context, content);
            // Add more specialized validators as needed
            default:
                return new GenericDocumentValidator(context, content);
        }
    }

    /**
     * Process validation for a document
     */
    public static async processValidation(documentType: string, content: string): Promise<ValidationProcessingResult> {
        const validator = this.createValidator(documentType, content);
        return await validator.validate();
    }
}
