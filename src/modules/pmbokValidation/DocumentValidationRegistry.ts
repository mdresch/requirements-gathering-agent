/**
 * Document Validation Registry
 * 
 * Centralized registry for document-specific validation rules and processors.
 * Each document type has its own validation context that determines which
 * PMBOK requirements are relevant and how they should be evaluated.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 */

import { PMBOKDocumentRequirements } from './types';

/**
 * Document validation context - defines what aspects are relevant for each document type
 */
export interface DocumentValidationContext {
    /** Document type identifier */
    documentType: string;
    /** Category this document belongs to */
    category: string;
    /** PMBOK performance domains relevant to this document */
    relevantPerformanceDomains: string[];
    /** PMBOK principles that should be evident in this document */
    relevantPrinciples: string[];
    /** Quality metrics that apply to this document type */
    applicableQualityMetrics: string[];
    /** Performance metrics relevant to this document */
    relevantPerformanceMetrics: string[];
    /** Risk management aspects relevant to this document */
    relevantRiskManagement: string[];
    /** Stakeholder engagement aspects relevant to this document */
    relevantStakeholderEngagement: string[];
    /** Project lifecycle aspects relevant to this document */
    relevantProjectLifecycle: string[];
    /** Resource management aspects relevant to this document */
    relevantResourceManagement: string[];
    /** Communication aspects relevant to this document */
    relevantCommunication: string[];
    /** Change management aspects relevant to this document */
    relevantChangeManagement: string[];
    /** Knowledge management aspects relevant to this document */
    relevantKnowledgeManagement: string[];
    /** Sustainability considerations relevant to this document */
    relevantSustainability: string[];
    /** Digital transformation aspects relevant to this document */
    relevantDigitalTransformation: string[];
    /** Custom validation rules specific to this document type */
    customValidationRules?: string[];
    /** Weight adjustment for scoring - some documents are more critical */
    scoreWeight: number;
    /** Minimum acceptable score for this document type */
    minimumScore: number;
}

/**
 * Registry of document validation contexts
 * Each document type has a tailored validation approach
 */
export const DOCUMENT_VALIDATION_REGISTRY: Record<string, DocumentValidationContext> = {
    'mission-vision-core-values': {
        documentType: 'mission-vision-core-values',
        category: 'strategic-statements',
        relevantPerformanceDomains: ['stakeholders'], // Only stakeholder alignment matters
        relevantPrinciples: ['value', 'leadership'], // Focus on value and leadership principles
        applicableQualityMetrics: ['specific', 'relevant'], // Should be specific and relevant to project
        relevantPerformanceMetrics: [], // No specific performance metrics needed
        relevantRiskManagement: [], // Risk management not relevant for mission/vision
        relevantStakeholderEngagement: ['stakeholder analysis'], // Should align with stakeholder needs
        relevantProjectLifecycle: [], // Lifecycle not relevant for mission/vision
        relevantResourceManagement: [], // Resource management not relevant
        relevantCommunication: [], // Communication methods not relevant
        relevantChangeManagement: [], // Change management not relevant
        relevantKnowledgeManagement: [], // Knowledge management not relevant
        relevantSustainability: ['long-term value'], // Should consider long-term sustainability
        relevantDigitalTransformation: [], // Digital transformation not relevant
        customValidationRules: ['alignment with project goals'], // Must align with project
        scoreWeight: 0.8, // Slightly less critical than project charter
        minimumScore: 60
    },

    'project-charter': {
        documentType: 'project-charter',
        category: 'project-charter',
        relevantPerformanceDomains: ['stakeholders', 'planning', 'project work'],
        relevantPrinciples: ['stewardship', 'value', 'systems thinking', 'leadership'],
        applicableQualityMetrics: ['specific', 'measurable', 'achievable', 'relevant', 'time-bound'],
        relevantPerformanceMetrics: ['key performance indicators', 'performance baselines'],
        relevantRiskManagement: ['risk categories', 'risk thresholds'],
        relevantStakeholderEngagement: ['stakeholder analysis', 'communication requirements'],
        relevantProjectLifecycle: ['project phases', 'phase gates'],
        relevantResourceManagement: ['resource planning'],
        relevantCommunication: ['communication planning'],
        relevantChangeManagement: ['change control procedures'],
        relevantKnowledgeManagement: ['organizational process assets'],
        relevantSustainability: ['long-term value', 'economic sustainability'],
        relevantDigitalTransformation: [],
        customValidationRules: ['measurable objectives', 'project approval requirements'],
        scoreWeight: 1.0, // Highest priority document
        minimumScore: 80
    },

    'stakeholder-register': {
        documentType: 'stakeholder-register',
        category: 'stakeholder-management',
        relevantPerformanceDomains: ['stakeholders'],
        relevantPrinciples: ['stakeholders', 'value', 'systems thinking'],
        applicableQualityMetrics: ['specific', 'measurable'],
        relevantPerformanceMetrics: [],
        relevantRiskManagement: [],
        relevantStakeholderEngagement: ['stakeholder analysis', 'power/influence grid', 'engagement assessment matrix'],
        relevantProjectLifecycle: [],
        relevantResourceManagement: [],
        relevantCommunication: ['communication requirements'],
        relevantChangeManagement: [],
        relevantKnowledgeManagement: [],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['identification information', 'assessment information', 'stakeholder classification'],
        scoreWeight: 0.9,
        minimumScore: 70
    },

    'stakeholder-engagement-plan': {
        documentType: 'stakeholder-engagement-plan',
        category: 'stakeholder-management',
        relevantPerformanceDomains: ['stakeholders', 'planning'],
        relevantPrinciples: ['stakeholders', 'leadership', 'tailoring'],
        applicableQualityMetrics: ['specific', 'measurable', 'achievable'],
        relevantPerformanceMetrics: [],
        relevantRiskManagement: [],
        relevantStakeholderEngagement: ['engagement strategies', 'communication methods', 'stakeholder management approach'],
        relevantProjectLifecycle: [],
        relevantResourceManagement: [],
        relevantCommunication: ['communication methods', 'communication frequency'],
        relevantChangeManagement: [],
        relevantKnowledgeManagement: [],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['engagement strategies', 'communication requirements', 'stakeholder expectations'],
        scoreWeight: 0.8,
        minimumScore: 70
    },

    'scope-management-plan': {
        documentType: 'scope-management-plan',
        category: 'management-plans',
        relevantPerformanceDomains: ['planning', 'project work'],
        relevantPrinciples: ['systems thinking', 'quality', 'tailoring'],
        applicableQualityMetrics: ['specific', 'measurable', 'achievable'],
        relevantPerformanceMetrics: ['control measures'],
        relevantRiskManagement: ['risk categories'],
        relevantStakeholderEngagement: [],
        relevantProjectLifecycle: ['project phases'],
        relevantResourceManagement: [],
        relevantCommunication: [],
        relevantChangeManagement: ['change control procedures', 'change impact assessment'],
        relevantKnowledgeManagement: ['lessons learned'],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['scope definition', 'wbs development', 'scope verification', 'scope control'],
        scoreWeight: 0.9,
        minimumScore: 75
    },

    'work-breakdown-structure': {
        documentType: 'work-breakdown-structure',
        category: 'planning-artifacts',
        relevantPerformanceDomains: ['planning', 'project work'],
        relevantPrinciples: ['systems thinking', 'quality'],
        applicableQualityMetrics: ['specific', 'measurable'],
        relevantPerformanceMetrics: [],
        relevantRiskManagement: [],
        relevantStakeholderEngagement: [],
        relevantProjectLifecycle: ['project phases'],
        relevantResourceManagement: ['resource planning'],
        relevantCommunication: [],
        relevantChangeManagement: [],
        relevantKnowledgeManagement: [],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['work packages', 'deliverables', 'wbs dictionary'],
        scoreWeight: 0.8,
        minimumScore: 70
    },

    'project-scope-statement': {
        documentType: 'project-scope-statement',
        category: 'scope-management',
        relevantPerformanceDomains: ['planning', 'project work'],
        relevantPrinciples: ['systems thinking', 'quality'],
        applicableQualityMetrics: ['specific', 'measurable', 'achievable'],
        relevantPerformanceMetrics: ['control measures'],
        relevantRiskManagement: ['risk categories'],
        relevantStakeholderEngagement: [],
        relevantProjectLifecycle: [],
        relevantResourceManagement: [],
        relevantCommunication: [],
        relevantChangeManagement: ['change control procedures'],
        relevantKnowledgeManagement: [],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['product scope description', 'acceptance criteria', 'project deliverables'],
        scoreWeight: 0.9,
        minimumScore: 75
    },

    'risk-management-plan': {
        documentType: 'risk-management-plan',
        category: 'management-plans',
        relevantPerformanceDomains: ['uncertainty', 'planning'],
        relevantPrinciples: ['risk', 'systems thinking', 'adaptability'],
        applicableQualityMetrics: ['specific', 'measurable'],
        relevantPerformanceMetrics: ['key performance indicators'],
        relevantRiskManagement: ['risk categories', 'risk breakdown structure', 'risk thresholds', 'risk tolerances', 'response strategies', 'contingency plans', 'risk monitoring'],
        relevantStakeholderEngagement: [],
        relevantProjectLifecycle: [],
        relevantResourceManagement: [],
        relevantCommunication: [],
        relevantChangeManagement: [],
        relevantKnowledgeManagement: ['lessons learned'],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['risk methodology', 'risk categories', 'risk assessment'],
        scoreWeight: 0.9,
        minimumScore: 75
    },

    'quality-management-plan': {
        documentType: 'quality-management-plan',
        category: 'management-plans',
        relevantPerformanceDomains: ['planning', 'project work'],
        relevantPrinciples: ['quality', 'systems thinking'],
        applicableQualityMetrics: ['specific', 'measurable', 'achievable'],
        relevantPerformanceMetrics: ['quality metrics', 'performance baselines', 'control measures'],
        relevantRiskManagement: [],
        relevantStakeholderEngagement: [],
        relevantProjectLifecycle: [],
        relevantResourceManagement: [],
        relevantCommunication: [],
        relevantChangeManagement: [],
        relevantKnowledgeManagement: ['best practices'],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['quality standards', 'quality assurance', 'quality control'],
        scoreWeight: 0.8,
        minimumScore: 70
    },

    'requirements-documentation': {
        documentType: 'requirements-documentation',
        category: 'management-plans',
        relevantPerformanceDomains: ['planning', 'stakeholders'],
        relevantPrinciples: ['systems thinking', 'quality'],
        applicableQualityMetrics: ['specific', 'measurable', 'achievable'],
        relevantPerformanceMetrics: [],
        relevantRiskManagement: [],
        relevantStakeholderEngagement: ['stakeholder analysis'],
        relevantProjectLifecycle: [],
        relevantResourceManagement: [],
        relevantCommunication: [],
        relevantChangeManagement: ['change control procedures'],
        relevantKnowledgeManagement: [],
        relevantSustainability: [],
        relevantDigitalTransformation: [],
        customValidationRules: ['functional requirements', 'non-functional requirements', 'acceptance criteria'],
        scoreWeight: 0.9,
        minimumScore: 75
    }
};

/**
 * Get validation context for a specific document type
 */
export function getValidationContext(documentType: string): DocumentValidationContext | null {
    return DOCUMENT_VALIDATION_REGISTRY[documentType] || null;
}

/**
 * Get all registered document types
 */
export function getRegisteredDocumentTypes(): string[] {
    return Object.keys(DOCUMENT_VALIDATION_REGISTRY);
}

/**
 * Check if a document type is registered
 */
export function isDocumentTypeRegistered(documentType: string): boolean {
    return documentType in DOCUMENT_VALIDATION_REGISTRY;
}

/**
 * Get documents by category
 */
export function getDocumentsByCategory(category: string): DocumentValidationContext[] {
    return Object.values(DOCUMENT_VALIDATION_REGISTRY).filter(ctx => ctx.category === category);
}
