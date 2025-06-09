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
    },
    'mission-vision-core-values': {
        required: [
            'mission statement',
            'vision statement',
            'core values',
            'alignment with project goals'
        ],
        category: 'strategic-statements'
    },
    'project-purpose': {
        required: [
            'executive summary',
            'project background',
            'purpose statement',
            'strategic importance',
            'expected impact',
            'success criteria',
            'stakeholder benefits',
            'alignment with strategy'
        ],
        category: 'strategic-statements'
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
 * PMBOK 7.0 Performance Domains
 */
export const PMBOK_PERFORMANCE_DOMAINS = [
    'stakeholders',
    'team',
    'development approach',
    'planning',
    'project work',
    'delivery',
    'measurement',
    'uncertainty'
];

/**
 * PMBOK 7.0 Project Management Principles
 */
export const PMBOK_PRINCIPLES = [
    'stewardship',
    'team',
    'stakeholders',
    'value',
    'systems thinking',
    'leadership',
    'tailoring',
    'quality',
    'complexity',
    'risk',
    'adaptability',
    'change'
];

/**
 * Value Delivery System Components
 */
export const VALUE_DELIVERY_SYSTEM = [
    'value identification',
    'value creation',
    'value realization',
    'value sustainability'
];

/**
 * Quality Metrics Requirements
 */
export const QUALITY_METRICS_REQUIREMENTS = {
    SMART_OBJECTIVES: [
        'specific',
        'measurable',
        'achievable',
        'relevant',
        'time-bound'
    ],
    PERFORMANCE_METRICS: [
        'key performance indicators',
        'quality metrics',
        'performance baselines',
        'control measures'
    ]
};

/**
 * Risk Management Integration Requirements
 */
export const RISK_MANAGEMENT_REQUIREMENTS = {
    RISK_BREAKDOWN: [
        'risk categories',
        'risk breakdown structure',
        'risk thresholds',
        'risk tolerances'
    ],
    RISK_RESPONSE: [
        'response strategies',
        'contingency plans',
        'fallback plans',
        'risk monitoring'
    ]
};

/**
 * Stakeholder Engagement Requirements
 */
export const STAKEHOLDER_ENGAGEMENT_REQUIREMENTS = {
    ASSESSMENT: [
        'power/influence grid',
        'engagement assessment matrix',
        'stakeholder analysis',
        'communication requirements'
    ],
    STRATEGIES: [
        'engagement strategies',
        'communication methods',
        'stakeholder management approach',
        'expectations management'
    ]
};

/**
 * Project Life Cycle Requirements
 */
export const PROJECT_LIFECYCLE_REQUIREMENTS = {
    PHASES: [
        'project phases',
        'phase gates',
        'transition points',
        'handover requirements'
    ],
    INTEGRATION: [
        'phase dependencies',
        'phase deliverables',
        'phase reviews',
        'phase transitions'
    ]
};

/**
 * Resource Management Requirements
 */
export const RESOURCE_MANAGEMENT_REQUIREMENTS = {
    PLANNING: [
        'resource breakdown structure',
        'resource calendars',
        'resource leveling',
        'team development'
    ],
    CONTROL: [
        'resource allocation',
        'resource optimization',
        'resource monitoring',
        'resource reporting'
    ]
};

/**
 * Communication Management Requirements
 */
export const COMMUNICATION_REQUIREMENTS = {
    PLANNING: [
        'communication matrix',
        'information distribution',
        'communication technology',
        'communication models'
    ],
    EXECUTION: [
        'communication channels',
        'communication methods',
        'communication frequency',
        'communication protocols'
    ]
};

/**
 * Change Management Requirements
 */
export const CHANGE_MANAGEMENT_REQUIREMENTS = {
    CONTROL: [
        'change control procedures',
        'configuration management',
        'version control',
        'change impact assessment'
    ],
    IMPLEMENTATION: [
        'change requests',
        'change approval process',
        'change documentation',
        'change tracking'
    ]
};

/**
 * Knowledge Management Requirements
 */
export const KNOWLEDGE_MANAGEMENT_REQUIREMENTS = {
    PROCESSES: [
        'lessons learned',
        'knowledge transfer',
        'best practices',
        'organizational process assets'
    ],
    INTEGRATION: [
        'knowledge sharing',
        'knowledge capture',
        'knowledge application',
        'knowledge maintenance'
    ]
};

/**
 * Sustainability Requirements
 */
export const SUSTAINABILITY_REQUIREMENTS = {
    CONSIDERATIONS: [
        'environmental impact',
        'social responsibility',
        'economic sustainability',
        'long-term value'
    ],
    IMPLEMENTATION: [
        'sustainability goals',
        'sustainability metrics',
        'sustainability reporting',
        'sustainability improvement'
    ]
};

/**
 * Digital Transformation Requirements
 */
export const DIGITAL_TRANSFORMATION_REQUIREMENTS = {
    TECHNOLOGY: [
        'technology adoption',
        'digital tools',
        'data management',
        'cybersecurity'
    ],
    INTEGRATION: [
        'digital strategy',
        'digital capabilities',
        'digital governance',
        'digital innovation'
    ]
};

/**
 * Document quality assessment thresholds
 */
export const QUALITY_THRESHOLDS = {
    BRIEF_CONTENT_LENGTH: 500,
    COMPREHENSIVE_CONTENT_LENGTH: 2000,
    MIN_SECTION_COUNT: 3,
    MIN_PMBOK_TERMS: 3,
    PERFECT_SCORE: 100,
    MIN_PERFORMANCE_DOMAINS: 4,
    MIN_PRINCIPLES: 6,
    MIN_VALUE_DELIVERY_ELEMENTS: 2,
    MIN_QUALITY_METRICS: 3,
    MIN_RISK_ELEMENTS: 3,
    MIN_STAKEHOLDER_ELEMENTS: 3,
    MIN_LIFECYCLE_ELEMENTS: 2,
    MIN_RESOURCE_ELEMENTS: 2,
    MIN_COMMUNICATION_ELEMENTS: 3,
    MIN_CHANGE_ELEMENTS: 2,
    MIN_KNOWLEDGE_ELEMENTS: 2,
    MIN_SUSTAINABILITY_ELEMENTS: 2,
    MIN_DIGITAL_ELEMENTS: 2
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
    QUALITY_BONUS_WEIGHT: 0.3, // Multiply by average quality score
    PERFORMANCE_DOMAIN_WEIGHT: 0.15,
    PRINCIPLES_WEIGHT: 0.15,
    VALUE_DELIVERY_WEIGHT: 0.1,
    QUALITY_METRICS_WEIGHT: 0.1,
    RISK_MANAGEMENT_WEIGHT: 0.1,
    STAKEHOLDER_ENGAGEMENT_WEIGHT: 0.1,
    LIFECYCLE_INTEGRATION_WEIGHT: 0.1,
    RESOURCE_MANAGEMENT_WEIGHT: 0.1,
    COMMUNICATION_WEIGHT: 0.1,
    CHANGE_MANAGEMENT_WEIGHT: 0.1,
    KNOWLEDGE_MANAGEMENT_WEIGHT: 0.1,
    SUSTAINABILITY_WEIGHT: 0.1,
    DIGITAL_TRANSFORMATION_WEIGHT: 0.1
};
