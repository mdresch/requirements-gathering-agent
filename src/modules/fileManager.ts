
/**
 * File Management and Context Utilities Module for Requirements Gathering Agent
 * 
 * Provides comprehensive file management capabilities, project context reading,
 * and document metadata handling for the requirements gathering system.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Enhanced project context reading from multiple sources
 * - Document metadata management and validation
 * - Integration with project analyzer for comprehensive analysis
 * - File system utilities for document organization
 * - Context population and enhancement workflows
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\fileManager.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PACKAGE_JSON_FILENAME } from '../constants.js';
import type { ProjectAnalysis, ProjectMarkdownFile } from './projectAnalyzer.js';
import { analyzeProjectComprehensively } from './projectAnalyzer.js';
import { populateEnhancedContextFromAnalysis } from './llmProcessor.js';
import { ConfigurationManager } from './ai/ConfigurationManager.js';
import type { AIProvider } from './ai/types.js';

// Function to get project info from package.json
function getProjectInfo() {
    try {
        const packageJsonPath = path.resolve(process.cwd(), PACKAGE_JSON_FILENAME);
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return {
            name: packageJson.name || 'Requirements Gathering Agent',
            version: packageJson.version || '2.1.2',
            description: packageJson.description || 'AI-powered PMBOK documentation generator'
        };
    } catch (error) {
        console.warn('Could not read package.json, using fallback values');
        return {
            name: 'Requirements Gathering Agent',
            version: '2.1.2',
            description: 'AI-powered PMBOK documentation generator'
        };
    }
}

// Function to get AI provider display name
function getAIProviderDisplayName(): string {
    try {
        const configManager = ConfigurationManager.getInstance();
        const provider = configManager.getAIProvider();
        
        const providerNames: Record<AIProvider, string> = {
            'azure-openai': 'Azure OpenAI',
            'azure-openai-key': 'Azure OpenAI (API Key)',
            'azure-openai-entra': 'Azure OpenAI (Entra ID)',
            'azure-ai-studio': 'Azure AI Studio',
            'google-ai': 'Google AI (Gemini)',
            'github-ai': 'GitHub AI',
            'ollama': 'Ollama'
        };
        
        return providerNames[provider] || provider; // Original line
    } catch (error) {
        console.warn('Could not determine AI provider, using fallback');
        return 'AI Provider';
    }
}

export interface DocumentMetadata {
    title: string;
    filename: string;
    category: string;
    description: string;
    generatedAt: string;
}

// Define document categories for better organization
export const DOCUMENT_CATEGORIES = {
    REQUIREMENTS: 'requirements',
    BASIC_DOCS: 'basic-docs',
    PMBOK: 'pmbok',
    PLANNING: 'planning',
    TECHNICAL_DESIGN: 'technical-design',
    PROJECT_CHARTER: 'project-charter',
    RISK_MANAGEMENT: 'risk-management',
    STAKEHOLDER_MANAGEMENT: 'stakeholder-management',
    SCOPE_MANAGEMENT: 'scope-management',
    STRATEGIC_STATEMENTS: 'strategic-statements',
    CORE: 'core-analysis',
    STRATEGIC: 'strategic-statements',
    CHARTER: 'project-charter',
    MANAGEMENT_PLANS: 'management-plans',
    PLANNING_ARTIFACTS: 'planning-artifacts',
    STAKEHOLDER: 'stakeholder-management',
    TECHNICAL_ANALYSIS: 'technical-analysis',
    QUALITY_ASSURANCE: 'quality-assurance',
    IMPLEMENTATION_GUIDES: 'implementation-guides',
    DMBOK: 'dmbok',
    PPPM: 'pppm',
    BABOK: 'babok', // Added new category for BABOK
    UNKNOWN: 'unknown' // Added for fallback/validation
} as const;

// Document configuration with proper categorization
export const DOCUMENT_CONFIG: Record<string, DocumentMetadata> = {
    'strategic-alignment': {
        title: 'Strategic Alignment Document',
        filename: 'strategic-statements/strategic-alignment.md',
        category: DOCUMENT_CATEGORIES.STRATEGIC,
        description: 'Defines the strategic alignment of the project, including objectives, business case, and alignment with organizational goals.',
        generatedAt: ''
    },
    'introduction-data-management-body-of-knowledge': {
        title: 'Introduction Data Management Body of Knowledge',
        filename: 'dmbok/INTRODUCTION DATA MANAGEMENT BODY OF KNOWLEDGE.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Provides an overview, checklist, and summary of all DMBOK documents, including coverage gaps and improvement suggestions.',
        generatedAt: ''
    },
    'data-architecture-quality': {
        title: 'Data Architecture & Quality',
        filename: 'dmbok/data-architecture-quality.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Defines the standards, principles, and practices for data architecture and quality management.',
        generatedAt: ''
    },
    'personas-assess-motivations': { title: 'PersonasAssessMotivations', filename: 'basic-docs/personas-assess-motivations.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Assessment of user personas and their motivations for project engagement.', generatedAt: '' },

    // DMBOK Data Management Documents
    'data-governance-framework': {
        title: 'Data Governance Framework',
        filename: 'dmbok/data-governance-framework.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Defines the structure, roles, policies, and processes for data governance in the ADPA project.',
        generatedAt: ''
    },
    'data-governance-plan': {
        title: 'Data Governance Plan',
        filename: 'dmbok/data-governance-plan.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Comprehensive plan outlining data governance objectives, principles, roles, responsibilities, and processes in alignment with DMBOK best practices.',
        generatedAt: ''
    },
    'data-stewardship-roles-responsibilities': {
        title: 'Data Stewardship and Roles & Responsibilities',
        filename: 'dmbok/data-stewardship-roles-responsibilities.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Framework defining data stewardship roles, responsibilities, and governance structure.',
        generatedAt: ''
    },
    'data-quality-management-plan': {
        title: 'Data Quality Management Plan',
        filename: 'dmbok/data-quality-management-plan.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Defines the organization\'s approach to data quality management, including objectives, standards, roles, responsibilities, and processes in alignment with DMBOK best practices.',
        generatedAt: ''
    },
    'master-data-management-strategy': {
        title: 'Master Data Management Strategy',
        filename: 'dmbok/master-data-management-strategy.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Outlines the strategy for managing master data across the organization, including governance, quality, and architecture.',
        generatedAt: ''
    },
    'data-architecture-modeling-guide': {
        title: 'Data Architecture & Modeling Guide',
        filename: 'dmbok/data-architecture-modeling-guide.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Provides target and current state data architecture with modelling standards and roadmap.',
        generatedAt: ''
    },
    'data-modeling-standards': {
        title: 'Data Modeling Standards Guide',
        filename: 'dmbok/data-modeling-standards.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Comprehensive guide to data modeling standards, conventions, and best practices.',
        generatedAt: ''
    },
    'business-intelligence-strategy': {
        title: 'Business Intelligence & Analytics Strategy',
        filename: 'dmbok/business-intelligence-strategy.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Strategy for business intelligence, analytics, and data-driven decision making.',
        generatedAt: ''
    },
    'metadata-management-framework': {
        title: 'Metadata Management Framework',
        filename: 'dmbok/metadata-management-framework.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Defines the framework for managing metadata, including principles, architecture, standards, and governance.',
        generatedAt: ''
    },
    'enterprise-data-dictionary': {
        title: 'Enterprise Data Dictionary',
        filename: 'dmbok/enterprise-data-dictionary.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Centralized repository of business and technical metadata for all enterprise data assets.',
        generatedAt: ''
    },
    'data-integration-interoperability-strategy': {
        title: 'Data Integration & Interoperability Strategy',
        filename: 'dmbok/data-integration-interoperability-strategy.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Outlines the strategy for data integration and interoperability, including patterns, standards, and governance.',
        generatedAt: ''
    },
    'data-security-privacy-plan': {
        title: 'Data Security & Privacy Plan',
        filename: 'dmbok/data-security-privacy-plan.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Defines the policies, procedures, controls, and responsibilities to protect data assets and ensure privacy compliance.',
        generatedAt: ''
    },
    'reference-data-management-plan': {
        title: 'Reference Data Management Plan',
        filename: 'dmbok/reference-data-management-plan.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'A plan for managing reference data across the enterprise.',
        generatedAt: ''
    },
    'data-storage-operations-handbook': {
        title: 'Data Storage & Operations Handbook',
        filename: 'dmbok/data-storage-operations-handbook.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Comprehensive guide for database administration, storage management, and data operations following DMBOK standards.',
        generatedAt: ''
    },
    'document-content-management': {
        title: 'Document & Content Management Framework',
        filename: 'dmbok/document-content-management-framework.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Comprehensive framework for managing documents and unstructured content across the enterprise, including policies, standards, and best practices.',
        generatedAt: ''
    },
    'data-lifecycle-management': {
        title: 'Data Lifecycle Management Policy',
        filename: 'dmbok/data-lifecycle-management-policy.md',
        category: DOCUMENT_CATEGORIES.DMBOK,
        description: 'Comprehensive policy for managing data throughout its lifecycle from creation to archival and disposal.',
        generatedAt: ''
    },
    'persona-utilize-app': { title: 'PersonaUtilizeApp', filename: 'basic-docs/persona-utilize-app.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Describes how different personas interact with and utilize the application.', generatedAt: '' },
    'technology-comfort-user-personas': { title: 'TechnologyComfortUserPersonas', filename: 'basic-docs/technology-comfort-user-personas.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Analysis of user personas’ comfort level with technology.', generatedAt: '' },
    'common-challenges-user-personas': { title: 'CommonChallengesUserPersonas', filename: 'basic-docs/common-challenges-user-personas.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Common challenges faced by user personas in the project context.', generatedAt: '' },
    'common-goals-user-personas': { title: 'CommonGoalsUserPersonas', filename: 'basic-docs/common-goals-user-personas.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Shared goals and objectives among user personas.', generatedAt: '' },
    'collect-requirements-process': { title: 'CollectRequirementsProcess', filename: 'requirements/collect-requirements-process.md', category: DOCUMENT_CATEGORIES.REQUIREMENTS, description: 'Process and methodology for collecting project requirements.', generatedAt: '' },
    'key-rbacroles': { title: 'KeyRBACroles', filename: 'requirements/key-rbacroles.md', category: DOCUMENT_CATEGORIES.REQUIREMENTS, description: 'Key roles and responsibilities for Role-Based Access Control (RBAC).', generatedAt: '' },
    'develop-schedule-input': { title: 'DevelopScheduleInput', filename: 'basic-docs/develop-schedule-input.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Inputs and considerations for developing the project schedule.', generatedAt: '' },
    'core-values': { title: 'CoreValues', filename: 'basic-docs/core-values.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Core values guiding the project and organization.', generatedAt: '' },
    'summary-and-goals': { title: 'SummaryAndGoals', filename: 'basic-docs/summary-and-goals.md', category: DOCUMENT_CATEGORIES.BASIC_DOCS, description: 'Summary of the project and its primary goals.', generatedAt: '' },
    'close-project-phase-process': { title: 'CloseProjectPhaseProcess', filename: 'pmbok/close-project-phase-process.md', category: DOCUMENT_CATEGORIES.PMBOK, description: 'PMBOK process for formally closing a project phase.', generatedAt: '' },
    'perform-integration-change-control-process': { title: 'PerformIntegrationChangeControlProcess', filename: 'pmbok/perform-integration-change-control-process.md', category: DOCUMENT_CATEGORIES.PMBOK, description: 'PMBOK process for managing and controlling project changes.', generatedAt: '' },
    'control-scope-process': { title: 'ControlScopeProcess', filename: 'pmbok/control-scope-process.md', category: DOCUMENT_CATEGORIES.PMBOK, description: 'PMBOK process for monitoring and controlling project scope.', generatedAt: '' },
    'validate-scope-process': { title: 'ValidateScopeProcess', filename: 'pmbok/validate-scope-process.md', category: DOCUMENT_CATEGORIES.PMBOK, description: 'PMBOK process for validating project scope and deliverables.', generatedAt: '' },
    'develop-project-charter': { title: 'DevelopProjectCharter', filename: 'pmbok/develop-project-charter.md', category: DOCUMENT_CATEGORIES.PMBOK, description: 'PMBOK process for developing the formal project charter.', generatedAt: '' },
    'monitor-and-control-project-work': { title: 'MonitorAndControlProjectWork', filename: 'pmbok/monitor-and-control-project-work.md', category: DOCUMENT_CATEGORIES.PMBOK, description: '', generatedAt: '' },
    'quality-management-plsn': { title: 'QualityManagementPlsn', filename: 'planning/quality-management-plsn.md', category: DOCUMENT_CATEGORIES.PLANNING, description: '', generatedAt: '' },
    'schedule-management-plan': { title: 'ScheduleManagementPlan', filename: 'planning/schedule-management-plan.md', category: DOCUMENT_CATEGORIES.PLANNING, description: '', generatedAt: '' },
    'error-handling': { title: 'ErrorHandling', filename: 'technical-design/error-handling.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'deployment-architecture': { title: 'DeploymentArchitecture', filename: 'technical-design/deployment-architecture.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'technical-stack': { title: 'TechnicalStack', filename: 'technical-design/technical-stack.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'integration-design': { title: 'IntegrationDesign', filename: 'technical-design/integration-design.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'performance-requirements': { title: 'PerformanceRequirements', filename: 'technical-design/performance-requirements.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'security-design': { title: 'SecurityDesign', filename: 'technical-design/security-design.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'apidocumentation': { title: 'APIDocumentation', filename: 'technical-design/apidocumentation.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'database-schema': { title: 'DatabaseSchema', filename: 'technical-design/database-schema.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'system-design': { title: 'SystemDesign', filename: 'technical-design/system-design.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'architecture-design': { title: 'ArchitectureDesign', filename: 'technical-design/architecture-design.md', category: DOCUMENT_CATEGORIES.TECHNICAL_DESIGN, description: '', generatedAt: '' },
    'risk-register': { title: 'RiskRegister', filename: 'risk-management/risk-register.md', category: DOCUMENT_CATEGORIES.RISK_MANAGEMENT, description: '', generatedAt: '' },
    'scope-statement': { title: 'ScopeStatement', filename: 'scope-management/scope-statement.md', category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT, description: '', generatedAt: '' },
    'purpose-statement': { title: 'PurposeStatement', filename: 'strategic-statements/purpose-statement.md', category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS, description: '', generatedAt: '' },
    'company-values': { title: 'CompanyValues', filename: 'strategic-statements/company-values.md', category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS, description: '', generatedAt: '' },
    'mission-vision-core-values': { title: 'MissionVisionCoreValues', filename: 'strategic-statements/mission-vision-core-values.md', category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS, description: '', generatedAt: '' },
    'new-test-doc': { title: 'NewTestDoc', filename: 'quality-assurance/new-test-doc.md', category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE, description: '', generatedAt: '' },
    'project-summary': {
        title: 'Project Summary and Goals',
        filename: 'basic-docs/project-summary.md',
        category: DOCUMENT_CATEGORIES.BASIC_DOCS,
        description: 'AI-generated project overview with business goals and objectives',
        generatedAt: ''
    },
    'user-stories': {
        title: 'User Stories and Requirements',
        filename: 'basic-docs/user-stories.md',
        category: DOCUMENT_CATEGORIES.BASIC_DOCS,
        description: 'Comprehensive user stories following Agile format',
        generatedAt: ''
    },
    'user-personas': {
        title: 'User Personas',
        filename: 'basic-docs/user-personas.md',
        category: DOCUMENT_CATEGORIES.BASIC_DOCS,
        description: 'Detailed user personas and demographics',
        generatedAt: ''
    },
    'key-roles-and-needs': {
        title: 'Key Roles and Needs Analysis',
        filename: 'basic-docs/key-roles-and-needs.md',
        category: DOCUMENT_CATEGORIES.BASIC_DOCS,
        description: 'Analysis of user roles and their specific needs',
        generatedAt: ''
    },
    'project-statement-of-work': {
        title: 'Project Statement of Work',
        filename: 'basic-docs/project-statement-of-work.md',
        category: DOCUMENT_CATEGORIES.BASIC_DOCS,
        description: 'Project Statement of Work detailing scope, deliverables, and acceptance criteria',
        generatedAt: ''
    },
    'business-case': {
        title: 'Business Case',
        filename: 'basic-docs/business-case.md',
        category: DOCUMENT_CATEGORIES.BASIC_DOCS,
        description: 'Comprehensive business case and justification',
        generatedAt: ''
    },
    'project-charter': {
        title: 'Project Charter',
        filename: 'project-charter/project-charter.md',
        category: DOCUMENT_CATEGORIES.PROJECT_CHARTER,
        description: 'PMBOK Project Charter formally authorizing the project',
        generatedAt: ''
    },
    'program-project-charter': {
        title: 'Program/Project Charter',
        filename: 'pppm/program-charter.md',
        category: DOCUMENT_CATEGORIES.PPPM,
        description: 'Defines program/project purpose, objectives, scope, stakeholders, and authorization. Generated using ProgramCharterTemplate and ProgramCharterProcessor.',
        generatedAt: ''
    },
    'project-management-plan': {
        title: 'Project Management Plan',
        filename: 'project-charter/project-management-plan.md',
        category: DOCUMENT_CATEGORIES.PROJECT_CHARTER,
        description: 'PMBOK Project Management Plan',
        generatedAt: ''
    },
    'elicitation-and-collaboration': {
        title: 'Elicitation & Collaboration',
        filename: 'babok/elicitation-and-collaboration.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Elicitation & Collaboration document',
        generatedAt: ''
    },
    'scope-management-plan': {
        title: 'Scope Management Plan',
        filename: 'scope-management/scope-management-plan.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Scope Management Plan',
        generatedAt: ''
    },
    'risk-management-plan': {
        title: 'Risk Management Plan',
        filename: 'management-plans/risk-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Risk Management Plan',
        generatedAt: ''
    },
    'cost-management-plan': {
        title: 'Cost Management Plan',
        filename: 'management-plans/cost-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Cost Management Plan',
        generatedAt: ''
    },
    'quality-management-plan': {
        title: 'Quality Management Plan',
        filename: 'management-plans/quality-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Quality Management Plan',
        generatedAt: ''
    },
    'resource-management-plan': {
        title: 'Resource Management Plan',
        filename: 'management-plans/resource-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Resource Management Plan',
        generatedAt: ''
    },
    'communication-management-plan': {
        title: 'Communication Management Plan',
        filename: 'management-plans/communication-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Communication Management Plan',
        generatedAt: ''
    },
    'procurement-management-plan': {
        title: 'Procurement Management Plan',
        filename: 'management-plans/procurement-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,        
        description: 'PMBOK Procurement Management Plan',
        generatedAt: ''
    },
    // Stakeholder Management - Fix missing properties
    'stakeholder-engagement-plan': {
        title: 'Stakeholder Engagement Plan',
        filename: 'stakeholder-management/stakeholder-engagement-plan.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER_MANAGEMENT,
        description: 'PMBOK Stakeholder Engagement Plan',
        generatedAt: ''
    },
    'stakeholder-register': {
        title: 'Stakeholder Register',
        filename: 'stakeholder-management/stakeholder-register.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER_MANAGEMENT,
        description: 'PMBOK Stakeholder Register',
        generatedAt: ''
    },
    'stakeholder-analysis': {
        title: 'Stakeholder Analysis',
        filename: 'stakeholder-management/stakeholder-analysis.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER_MANAGEMENT,
        description: 'PMBOK Stakeholder Analysis',
        generatedAt: ''
    },    'work-breakdown-structure': {
        title: 'Work Breakdown Structure (WBS)',
        filename: 'planning/work-breakdown-structure.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Work Breakdown Structure',
        generatedAt: ''
    },
    'wbs-dictionary': {
        title: 'WBS Dictionary',
        filename: 'planning/wbs-dictionary.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK WBS Dictionary with detailed descriptions',
        generatedAt: ''
    },
    'program-work-breakdown-structure': {
        title: 'Program Work Breakdown Structure (WBS)',
        filename: 'pppm/program-work-breakdown-structure.md',
        category: DOCUMENT_CATEGORIES.PPPM,
        description: 'PMBOK Program Work Breakdown Structure',
        generatedAt: ''
    },
    'activity-list': {
        title: 'Activity List',
        filename: 'planning/activity-list.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Activity List',
        generatedAt: ''
    },
    'activity-duration-estimates': {
        title: 'Activity Duration Estimates',
        filename: 'planning/activity-duration-estimates.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Activity Duration Estimates',
        generatedAt: ''
    },
    'activity-resource-estimates': {
        title: 'Activity Resource Estimates',
        filename: 'planning/activity-resource-estimates.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Activity Resource Estimates',
        generatedAt: ''
    },
    'schedule-network-diagram': {
        title: 'Schedule Network Diagram',
        filename: 'planning/schedule-network-diagram.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Schedule Network Diagram',
        generatedAt: ''
    },
    'milestone-list': {
        title: 'Milestone List',
        filename: 'planning/milestone-list.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Milestone List',
        generatedAt: ''
    },
    'schedule-development-input': {
        title: 'Schedule Development Input',
        filename: 'planning/schedule-development-input.md',
        category: DOCUMENT_CATEGORIES.PLANNING,
        description: 'PMBOK Schedule Development Input',
        generatedAt: ''
    },    'data-model-suggestions': {
        title: 'Data Model Suggestions',
        filename: 'technical-analysis/data-model-suggestions.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Database architecture and data model recommendations',
        generatedAt: ''
    },
    'tech-stack-analysis': {
        title: 'Technology Stack Analysis',
        filename: 'technical-analysis/tech-stack-analysis.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Comprehensive technology stack recommendations',
        generatedAt: ''
    },
    'risk-analysis': {
        title: 'Risk Analysis',
        filename: 'technical-analysis/risk-analysis.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Detailed risk analysis and mitigation strategies',
        generatedAt: ''
    },
    'acceptance-criteria': {
        title: 'Acceptance Criteria',
        filename: 'technical-analysis/acceptance-criteria.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Comprehensive acceptance criteria and validation methods',
        generatedAt: ''
    },
    'compliance-considerations': {
        title: 'Compliance Considerations',
        filename: 'technical-analysis/compliance-considerations.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Regulatory and compliance requirements analysis',
        generatedAt: ''
    },    'ui-ux-considerations': {
        title: 'UI/UX Considerations',
        filename: 'technical-analysis/ui-ux-considerations.md',        
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'User experience and interface design recommendations',
        generatedAt: ''
    },
    'technical-recommendations': {
        title: 'Technical Recommendations',
        filename: 'technical-analysis/technical-recommendations.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Comprehensive technical recommendations aligned with PMBOK standards',
        generatedAt: ''
    },
    'technology-selection-criteria': {
        title: 'Technology Selection Criteria',
        filename: 'technical-analysis/technology-selection-criteria.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Criteria and framework for technology selection decisions',
        generatedAt: ''
    },
    'technical-implementation-roadmap': {
        title: 'Technical Implementation Roadmap',
        filename: 'technical-analysis/technical-implementation-roadmap.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Phased technical implementation plan and timeline',
        generatedAt: ''
    },
    'technology-governance-framework': {
        title: 'Technology Governance Framework',
        filename: 'technical-analysis/technology-governance-framework.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS,
        description: 'Technology governance structure and decision-making framework',
        generatedAt: ''
    },
    // Missing documents that were incorrectly categorized as "unknown"
    'control-scope': {
        title: 'Control Scope Process',
        filename: 'scope-management/control-scope.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Control Scope Process',
        generatedAt: ''
    },
    'direct-and-manage-project-work': {
        title: 'Direct and Manage Project Work Process',
        filename: 'management-plans/direct-and-manage-project-work.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Direct and Manage Project Work Process',
        generatedAt: ''
    },    'project-scope-statement': {
        title: 'Project Scope Statement',
        filename: 'scope-management/project-scope-statement.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Project Scope Statement',
        generatedAt: ''
    },
    'requirements-documentation': {
        title: 'Requirements Documentation',
        filename: 'management-plans/requirements-documentation.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Requirements Documentation',
        generatedAt: ''
    },
    'requirements-traceability-matrix': {
        title: 'Requirements Traceability Matrix',
        filename: 'management-plans/requirements-traceability-matrix.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Requirements Traceability Matrix',
        generatedAt: ''
    },    'scope-baseline': {
        title: 'Scope Baseline',
        filename: 'scope-management/scope-baseline.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Scope Baseline',
        generatedAt: ''    },
    'validate-scope': {
        title: 'Validate Scope Process',
        filename: 'scope-management/validate-scope.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Validate Scope Process',
        generatedAt: ''
    },
    // Additional missing PMBOK documents
    'perform-integrated-change-control': {
        title: 'Perform Integrated Change Control Process',
        filename: 'management-plans/perform-integrated-change-control.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Perform Integrated Change Control Process',
        generatedAt: ''
    },
    'close-project-or-phase': {
        title: 'Close Project or Phase Process',
        filename: 'management-plans/close-project-or-phase.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Close Project or Phase Process',
        generatedAt: ''
    },    'plan-scope-management': {
        title: 'Plan Scope Management',
        filename: 'scope-management/plan-scope-management.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Plan Scope Management',
        generatedAt: ''
    },
    'requirements-management-plan': {
        title: 'Requirements Management Plan',
        filename: 'management-plans/requirements-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Requirements Management Plan',
        generatedAt: ''
    },
    'collect-requirements': {
        title: 'Collect Requirements Process',
        filename: 'management-plans/collect-requirements.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Collect Requirements Process',
        generatedAt: ''
    },    'define-scope': {
        title: 'Define Scope Process',
        filename: 'scope-management/define-scope.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Define Scope Process',
        generatedAt: ''
    },
    'create-wbs': {
        title: 'Create WBS Process',
        filename: 'management-plans/create-wbs.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Create WBS Process',
        generatedAt: ''
    },    'work-performance-information-scope': {
        title: 'Work Performance Information (Scope)',
        filename: 'scope-management/work-performance-information-scope.md',
        category: DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT,
        description: 'PMBOK Work Performance Information (Scope)',
        generatedAt: ''
    },
    'project-purpose': {
        title: 'Project Purpose',
        filename: 'strategic-statements/project-purpose.md',
        category: DOCUMENT_CATEGORIES.STRATEGIC,
        description: 'Project purpose and objectives documentation',
        generatedAt: ''
    },
    'project-kickoff-preparations-checklist': {
        title: 'Project KickOff Preparations Checklist',
        filename: 'planning/Project-KickOff-Preprations-CheckList.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'Checklist for project kickoff preparations, including scope, stakeholders, resources, and readiness.',
        generatedAt: ''
    },
    // Quality Assurance Documents
    'test-strategy': {
        title: 'Test Strategy',
        filename: 'quality-assurance/test-strategy.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Comprehensive testing strategy and approach',
        generatedAt: ''
    },
    'test-plan': {
        title: 'Test Plan',
        filename: 'quality-assurance/test-plan.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Detailed test plan with test scenarios and execution plan',
        generatedAt: ''
    },
    'test-cases': {
        title: 'Test Cases',
        filename: 'quality-assurance/test-cases.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Detailed test cases and test scenarios',
        generatedAt: ''
    },
    'quality-metrics': {
        title: 'Quality Metrics',
        filename: 'quality-assurance/quality-metrics.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Quality metrics and measurement criteria',
        generatedAt: ''
    },
    'tech-acceptance-criteria': {
        title: 'Technical Acceptance Criteria',
        filename: 'quality-assurance/tech-acceptance-criteria.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Technical acceptance criteria and validation requirements',
        generatedAt: ''
    },
    'performance-test-plan': {
        title: 'Performance Test Plan',
        filename: 'quality-assurance/performance-test-plan.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Performance testing strategy and test plan',
        generatedAt: ''
    },
    'security-testing': {
        title: 'Security Testing',
        filename: 'quality-assurance/security-testing.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Security testing procedures and validation',
        generatedAt: ''
    },
    'code-review': {
        title: 'Code Review',
        filename: 'quality-assurance/code-review.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Code review processes and standards',
        generatedAt: ''
    },
    'bug-report': {
        title: 'Bug Report',
        filename: 'quality-assurance/bug-report.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Bug reporting template and procedures',
        generatedAt: ''
    },
    'test-environment': {
        title: 'Test Environment',
        filename: 'quality-assurance/test-environment.md',
        category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE,
        description: 'Test environment setup and configuration',
        generatedAt: ''
    },
    // Implementation Guides Documents
    'coding-standards': {
        title: 'Coding Standards',
        filename: 'implementation-guides/coding-standards.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Development coding standards and guidelines',
        generatedAt: ''
    },
    'development-setup': {
        title: 'Development Setup',
        filename: 'implementation-guides/development-setup.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Development environment setup guide',
        generatedAt: ''
    },
    'version-control': {
        title: 'Version Control',
        filename: 'implementation-guides/version-control.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Version control procedures and best practices',
        generatedAt: ''
    },
    'ci-pipeline': {
        title: 'CI Pipeline',
        filename: 'implementation-guides/ci-pipeline.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Continuous integration pipeline setup and configuration',
        generatedAt: ''
    },
    'release-process': {
        title: 'Release Process',
        filename: 'implementation-guides/release-process.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Software release process and procedures',
        generatedAt: ''
    },
    'code-documentation': {
        title: 'Code Documentation',
        filename: 'implementation-guides/code-documentation.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Code documentation standards and guidelines',
        generatedAt: ''
    },
    'troubleshooting': {
        title: 'Troubleshooting',
        filename: 'implementation-guides/troubleshooting.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Troubleshooting guide and common issues',
        generatedAt: ''
    },
    'development-workflow': {
        title: 'Development Workflow',
        filename: 'implementation-guides/development-workflow.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Development workflow and processes',
        generatedAt: ''
    },
    'api-integration': {
        title: 'API Integration',
        filename: 'implementation-guides/api-integration.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'API integration guide and best practices',
        generatedAt: ''
    },
    'deployment-guide': {
        title: 'Deployment Guide',
        filename: 'implementation-guides/deployment-guide.md',
        category: DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES,
        description: 'Application deployment guide and procedures',
        generatedAt: ''
    },
    // Strategic Statements Documents
    'strategic-business-case': {
        title: 'Strategic Business Case',
        filename: 'strategic-statements/strategic-business-case.md',
        category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS,
        description: 'Strategic business case and strategic analysis',
        generatedAt: ''
    },
    'introduction-business-analysis-body-of-knowledge': {
        title: 'Introduction Business Analysis Body of Knowledge',
        filename: 'babok/INTRODUCTION BUSINESS ANALYSIS BODY OF KNOWLEDGE.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'Provides an overview, checklist, and summary of all BABOK documents, including coverage gaps and improvement suggestions.',
        generatedAt: ''
    },
    // BABOK Documents
    'business-analysis-planning-and-monitoring': {
        title: 'Business Analysis Planning & Monitoring',
        filename: 'babok/business-analysis-planning-and-monitoring.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'Defines the tasks used to organize and coordinate business analysis efforts.',
        generatedAt: ''
    },
    'babokintroduction': {
        title: 'BABOK Introduction',
        filename: 'BABOK/babokintroduction.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'Business Analysis Body of Knowledge introduction',
        generatedAt: ''
    },
    'requirements-life-cycle-management': {
        title: 'Requirements Life Cycle Management',
        filename: 'babok/requirements-life-cycle-management.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Requirements Life Cycle Management document',
        generatedAt: ''
    },
    'strategy-analysis': {
        title: 'Strategy Analysis',
        filename: 'babok/strategy-analysis.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Strategy Analysis document',
        generatedAt: ''
    },
    'requirements-analysis-and-design-definition': {
        title: 'Requirements Analysis & Design Definition',
        filename: 'babok/requirements-analysis-and-design-definition.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Requirements Analysis & Design Definition document',
        generatedAt: ''
    },
    'solution-evaluation': {
        title: 'Solution Evaluation',
        filename: 'babok/solution-evaluation.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Solution Evaluation document',
        generatedAt: ''
    },
    'underlying-competencies': {
        title: 'Underlying Competencies',
        filename: 'babok/underlying-competencies.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Underlying Competencies document',
        generatedAt: ''
    },
    'perspectives': {
        title: 'Perspectives',
        filename: 'babok/perspectives.md',
        category: DOCUMENT_CATEGORIES.BABOK,
        description: 'BABOK: Perspectives document',
        generatedAt: ''
    },
    'portfolio-stakeholder-analysis': {
        title: 'Portfolio/Program Stakeholder Analysis',
        filename: 'stakeholder-management/portfolio-stakeholder-analysis.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER_MANAGEMENT,
        description: 'Portfolio/Program-level Stakeholder Analysis',
        generatedAt: ''
    },
    'project-status-report': {
        title: 'Project Status Report',
        filename: 'pppm/project-status-report.md',
        category: DOCUMENT_CATEGORIES.PPPM,
        description: 'Tracks project progress, accomplishments, milestones, budget, schedule, issues, risks, action items, and next period focus.',
        generatedAt: ''
    },
    'program-risk-register': {
        title: 'Program Risk Register',
        filename: 'pppm/program-risk-register.md',
        category: DOCUMENT_CATEGORIES.PPPM,
        description: 'Comprehensive risk register for program-level, cross-project, and strategic risks. PMO/PMBOK-compliant.',
        generatedAt: ''
    },
        'program-change-request-form': {
        title: 'Program Change Request Form',
        filename: 'pppm/program-change-request-form.md',
        category: DOCUMENT_CATEGORIES.PPPM,
        description: 'PMO/PMBOK-compliant change request form for program-level changes.',
        generatedAt: ''
    },
    'detailed-planning-artifacts': {
        title: 'Detailed Planning Artifacts',
        filename: 'pppm/detailed-planning-artifacts.md',
        category: DOCUMENT_CATEGORIES.PPPM,
        description: 'PMO/PMBOK-compliant detailed planning artifacts for program-level changes.',
        generatedAt: ''
    }
};

// Create organized directory structure
export function createDirectoryStructure(): void {
    const baseDir = 'generated-documents';

    // Create base directory
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    // Create category subdirectories
    Object.values(DOCUMENT_CATEGORIES).forEach(category => {
        const categoryDir = path.join(baseDir, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }
    });

    console.log(`📁 Created organized directory structure in ${baseDir}/`);
}

export function readProjectContext(filename: string = 'README.md'): string {
    try {
        if (!fs.existsSync(filename)) {
            console.warn(`⚠️  ${filename} not found. Using generic project context.`);
            return 'Generic project requiring comprehensive requirements analysis and PMBOK documentation.';
        }

        const content = fs.readFileSync(filename, 'utf-8');
        console.log(`✅ Found ${filename} - using as project context`);
        return content;
    } catch (error) {
        console.error(`❌ Error reading ${filename}:`, error);
        return 'Project context could not be loaded.';
    }
}

/**
 * Enhanced project context reader that analyzes all relevant markdown files
 * @param projectPath - The root directory of the project (defaults to current directory)
 * @returns Comprehensive project context including all relevant documentation
 */
export async function readEnhancedProjectContext(projectPath: string = process.cwd()): Promise<string> {
    try {
        console.log('🔍 Performing comprehensive project analysis...');

        // Import the analyzer and processor dynamically to avoid circular imports
        const { analyzeProjectComprehensively } = await import('./projectAnalyzer.js');
        const { populateEnhancedContextFromAnalysis } = await import('./llmProcessor.js');

        // Perform comprehensive analysis
        const analysis = await analyzeProjectComprehensively(projectPath);        // Log findings for transparency
        if (analysis.additionalMarkdownFiles?.length > 0) {
            console.log(`📋 Found ${analysis.additionalMarkdownFiles.length} additional relevant files:`);
            analysis.additionalMarkdownFiles
                .slice(0, 10) // Show top 10
                .forEach((file: ProjectMarkdownFile) => {
                    console.log(`   • ${file.fileName} (${file.category}, score: ${file.relevanceScore})`);
                });

            if (analysis.additionalMarkdownFiles.length > 10) {
                console.log(`   • ... and ${analysis.additionalMarkdownFiles.length - 10} more files`);
            }
        }

        if (analysis.suggestedSources?.length > 0) {
            console.log(`💡 High-value sources identified: ${analysis.suggestedSources.join(', ')}`);
        }

        // Populate Enhanced Context Manager with discovered files
        await populateEnhancedContextFromAnalysis(analysis);

        // Return the comprehensive context
        return analysis.projectContext;

    } catch (error) {
        console.warn('⚠️ Enhanced analysis failed, falling back to basic README analysis:', error);
        return readProjectContext();
    }
}

export function saveDocument(documentKey: string, content: string): void {
    if (!content || content.trim().length === 0) {
        console.log(`⚠️ Skipped: ${documentKey} (no content generated)`);
        return;
    }

    const config = DOCUMENT_CONFIG[documentKey];
    if (!config) {
        console.warn(`\u26a0\ufe0f WARNING: Unknown document key: ${documentKey}. This document type is not registered in DOCUMENT_CONFIG and will be saved as 'UNKNOWN'.\nTo enable full support and version control, add this document type to the registry in both generationTasks.ts and fileManager.ts.`);
        // Create a fallback config for unknown keys
        const fallbackConfig = {
            title: documentKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            filename: `${documentKey}.md`,
            category: DOCUMENT_CATEGORIES.UNKNOWN, // Use the new UNKNOWN key
            description: 'Auto-generated document',
            generatedAt: ''
        };

        const baseDir = 'generated-documents';
        const categoryDir = path.join(baseDir, fallbackConfig.category);
        const filePath = path.join(categoryDir, fallbackConfig.filename);

        // Ensure directory exists
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }        const timestamp = new Date().toISOString();
        const projectInfo = getProjectInfo();
        const documentHeader = `# ${fallbackConfig.title}

**Generated by ${projectInfo.name} v${projectInfo.version}**  
**Category:** ${fallbackConfig.category}  
**Generated:** ${timestamp}  
**Description:** ${fallbackConfig.description}

---

`;

        const fullContent = documentHeader + content;

        try {
            fs.writeFileSync(filePath, fullContent, 'utf-8');
            console.log(`✅ Saved: ${fallbackConfig.title} → ${filePath}`);
        } catch (error) {
            console.error(`❌ Error saving ${documentKey}:`, error);
        }
        return;
    }

    const baseDir = 'generated-documents';
    // Use filename (which may include category subfolder) directly under baseDir
    const filePath = path.join(baseDir, config.filename);
    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }    // Add document header with metadata
    const timestamp = new Date().toISOString();
    const projectInfo = getProjectInfo();
    const documentHeader = `# ${config.title}

**Generated by ${projectInfo.name} v${projectInfo.version}**  
**Category:** ${config.category}  
**Generated:** ${timestamp}  
**Description:** ${config.description}

---

`;

    const fullContent = documentHeader + content;

    try {
        fs.writeFileSync(filePath, fullContent, 'utf-8');
        console.log(`✅ Saved: ${config.title} → ${filePath}`);
    } catch (error) {
        console.error(`❌ Error saving ${documentKey}:`, error);
    }
}

export function generateIndexFile(): void {
    const baseDir = 'generated-documents';
    const indexPath = path.join(baseDir, 'README.md');

    const timestamp = new Date().toISOString();    
    const projectInfo = getProjectInfo();
    const aiProvider = getAIProviderDisplayName();
    let indexContent = `# Generated PMBOK Documentation

**Generated by ${projectInfo.name} v${projectInfo.version}**  
**Timestamp:** ${timestamp}  
**Total Documents:** ${Object.keys(DOCUMENT_CONFIG).length}

## Directory Structure

This directory contains comprehensive PMBOK (Project Management Body of Knowledge) documentation organized by category:

`;

    // Group documents by category
    const categorizedDocs: Record<string, DocumentMetadata[]> = {};
    Object.entries(DOCUMENT_CONFIG).forEach(([key, config]) => {
        if (!categorizedDocs[config.category]) {
            categorizedDocs[config.category] = [];
        }
        categorizedDocs[config.category].push(config);
    });

    // Generate index by category
    Object.entries(categorizedDocs).forEach(([category, docs]) => {
        const categoryTitle = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        indexContent += `\n### ${categoryTitle}\n\n`;        docs.forEach(doc => {
            // Check if filename already includes a directory path
            const filePath = doc.filename.includes('/') ? doc.filename : path.join(category, doc.filename);
            indexContent += `- [${doc.title}](${filePath}) - ${doc.description}\n`;
        });
    });

    indexContent += `\n## Usage

Each document is AI-generated based on your project's README.md context and follows PMBOK standards. The documents are organized into logical categories for easy navigation and reference.

## Categories Explained

${generateCategoriesExplanation()}

---
*Generated by ${projectInfo.name} using ${aiProvider}*
`;

    try {
        fs.writeFileSync(indexPath, indexContent, 'utf-8');
        console.log(`📋 Generated documentation index: ${indexPath}`);
    } catch (error) {
        console.error(`❌ Error generating index file:`, error);
    }
}

// Function to get category descriptions
function getCategoryDescriptions(): Record<string, string> {
    return {
        [DOCUMENT_CATEGORIES.BASIC_DOCS]: 'Fundamental project analysis including user stories, personas, and requirements',
        [DOCUMENT_CATEGORIES.PROJECT_CHARTER]: 'Formal project authorization and high-level planning',
        [DOCUMENT_CATEGORIES.MANAGEMENT_PLANS]: 'Detailed PMBOK management plans for scope, risk, cost, quality, etc.',
        [DOCUMENT_CATEGORIES.PLANNING]: 'Detailed planning documents including WBS, schedules, and activities',
        [DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS]: 'Planning artifacts and work breakdown structures',
        [DOCUMENT_CATEGORIES.STAKEHOLDER_MANAGEMENT]: 'Stakeholder analysis and engagement strategies',
        [DOCUMENT_CATEGORIES.TECHNICAL_ANALYSIS]: 'Technology stack, data models, compliance, and UX considerations',
        [DOCUMENT_CATEGORIES.TECHNICAL_DESIGN]: 'Technical design documents including architecture, security, and system design',
        [DOCUMENT_CATEGORIES.QUALITY_ASSURANCE]: 'Testing strategies, quality metrics, and validation procedures',
        [DOCUMENT_CATEGORIES.IMPLEMENTATION_GUIDES]: 'Development guides, coding standards, and deployment procedures',
        [DOCUMENT_CATEGORIES.PMBOK]: 'PMBOK process documentation and methodology guides',
        [DOCUMENT_CATEGORIES.REQUIREMENTS]: 'Requirements gathering, analysis, and documentation',
        [DOCUMENT_CATEGORIES.RISK_MANAGEMENT]: 'Risk identification, analysis, and mitigation strategies',
        [DOCUMENT_CATEGORIES.SCOPE_MANAGEMENT]: 'Project scope definition, validation, and control processes',
        [DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS]: 'Strategic planning documents including mission, vision, and purpose statements',
        [DOCUMENT_CATEGORIES.CORE]: 'Core analysis and foundational documents'
    };
}

// Function to generate dynamic categories explanation
function generateCategoriesExplanation(): string {
    const categoryDescriptions = getCategoryDescriptions();
    const usedCategories = new Set<string>();
    
    // Collect all unique categories used in DOCUMENT_CONFIG
    Object.values(DOCUMENT_CONFIG).forEach(doc => {
        usedCategories.add(doc.category);
    });
    
    // Generate explanation for each used category
    const explanations = Array.from(usedCategories)
        .sort()
        .map(category => {
            const categoryName = category.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            const description = categoryDescriptions[category] || 'Additional project documentation';
            return `- **${categoryName}**: ${description}`;
        })
        .join('\n');
    
    return explanations;
}

// Version export for tracking
export const fileManagerVersion = getProjectInfo().version;

export function cleanupOldFiles(): void {
    // Remove any .md files from root directory (except README.md)
    const rootFiles = fs.readdirSync('.');
    rootFiles.forEach(file => {
        if (file.endsWith('.md') && file !== 'README.md' && file !== '.env.example') {
            try {
                // Check if this looks like a generated document
                const content = fs.readFileSync(file, 'utf-8');
                if (content.includes('Generated by Requirements Gathering Agent') ||
                    content.includes('PMBOK') ||
                    Object.values(DOCUMENT_CONFIG).some(config => file === config.filename)) {
                    fs.unlinkSync(file);
                    console.log(`🗑️  Cleaned up old file: ${file}`);
                }
            } catch (error) {
                // Skip if we can't read the file
            }
        }
    });
}