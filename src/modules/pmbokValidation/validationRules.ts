/**
 * PMBOK Validation Rules
 * Defines requirements and validation rules for PMBOK document compliance
 */
import { PMBOKDocumentRequirements } from './types';

/**
 * PMBOK 7.0 document requirements by document key
 */
export const PMBOK_DOCUMENT_REQUIREMENTS: Record<string, PMBOKDocumentRequirements> = {
    'project-charter': {
        required: [
            'project purpose', 
            'measurable objectives', 
            'high-level requirements', 
            'assumptions', 
            'constraints', 
            'project approval requirements'
        ],
        category: 'project-charter'
    },
    'stakeholder-register': {
        required: [
            'identification information', 
            'assessment information', 
            'stakeholder classification'
        ],
        category: 'stakeholder-management'
    },
    'stakeholder-engagement-plan': {
        required: [
            'engagement strategies', 
            'communication requirements', 
            'stakeholder expectations'
        ],
        category: 'stakeholder-management'
    },
    'scope-management-plan': {
        required: [
            'scope definition', 
            'wbs development', 
            'scope verification', 
            'scope control'
        ],
        category: 'management-plans'
    },
    'work-breakdown-structure': {
        required: [
            'work packages', 
            'deliverables', 
            'hierarchical decomposition'
        ],
        category: 'planning-artifacts'
    },
    'requirements-documentation': {
        required: [
            'functional requirements',
            'non-functional requirements',
            'quality requirements',
            'acceptance criteria'
        ],
        category: 'management-plans'
    },
    'project-scope-statement': {
        required: [
            'product scope description',
            'deliverables',
            'acceptance criteria',
            'exclusions',
            'constraints',
            'assumptions'
        ],
        category: 'management-plans'
    },
    'risk-management-plan': {
        required: [
            'methodology',
            'roles and responsibilities',
            'risk categories',
            'risk probability and impact',
            'risk response strategies'
        ],
        category: 'management-plans'
    },
    'quality-management-plan': {
        required: [
            'quality standards',
            'quality objectives',
            'quality assurance',
            'quality control',
            'quality improvement'
        ],
        category: 'management-plans'
    }
};

/**
 * PMBOK 7.0 terminology to check for appropriate usage
 */
export const PMBOK_TERMINOLOGY = [
    'deliverable', 
    'milestone', 
    'work package', 
    'baseline', 
    'change control',
    'risk register', 
    'stakeholder', 
    'requirements', 
    'assumptions', 
    'constraints',
    'work performance data',
    'change request',
    'quality metrics',
    'activity duration',
    'resource requirements',
    'critical path',
    'schedule baseline',
    'work breakdown structure',
    'configuration management',
    'performance measurement'
];

/**
 * Document quality assessment thresholds
 */
export const QUALITY_THRESHOLDS = {
    BRIEF_CONTENT_LENGTH: 500,
    COMPREHENSIVE_CONTENT_LENGTH: 2000,
    MIN_SECTION_COUNT: 3,
    MIN_PMBOK_TERMS: 3,
    PERFECT_SCORE: 100
};

/**
 * Scoring weights for different quality aspects
 */
export const QUALITY_SCORING = {
    COMPREHENSIVE_CONTENT_POINTS: 20,
    GOOD_STRUCTURE_POINTS: 15,
    PMBOK_TERMINOLOGY_POINTS: 15,
    REQUIRED_ELEMENTS_WEIGHT: 0.5, // Multiply by percentage of covered elements
    CRITICAL_ISSUE_PENALTY: 20,
    WARNING_PENALTY: 10,
    QUALITY_BONUS_WEIGHT: 0.3 // Multiply by average quality score
};
