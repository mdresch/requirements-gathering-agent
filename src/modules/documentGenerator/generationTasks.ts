/**
 * Generation Tasks Configuration
 * Defines all available document generation tasks
 */
import { GenerationTask } from './types';

/**
 * All available document generation tasks with proper organization and priorities
 */
export const GENERATION_TASKS: GenerationTask[] = [
  // Technical Design Documents
  {
    key: 'architecture-design',
    name: 'Architecture Design Document',
    category: 'technical-design',
    fileName: 'architecture-design.md',
    priority: 1,
    emoji: '🏗️',
    description: 'Comprehensive architecture design document outlining system components and interactions.',
    estimatedTokens: 3000,
  },
  {
    key: 'system-design',
    name: 'System Design Specification',
    category: 'technical-design',
    fileName: 'system-design-specification.md',
    priority: 2,
    emoji: '📐',
    description: 'Detailed system design specifications including interfaces and data structures.',
    estimatedTokens: 2500,
  },
  {
    key: 'database-schema',
    name: 'Database Schema Design',
    category: 'technical-design',
    fileName: 'database-schema-design.md',
    priority: 3,
    emoji: '🗄️',
    description: 'Database schema design including tables, relationships, and optimization strategies.',
    estimatedTokens: 2000,
  },
  {
    key: 'api-documentation',
    name: 'API Documentation',
    category: 'technical-design',
    fileName: 'api-documentation.md',
    priority: 4,
    emoji: '📡',
    description: 'Comprehensive API documentation including endpoints, authentication, and usage guidelines.',
    estimatedTokens: 2500,
  },
  {
    key: 'security-design',
    name: 'Security Design Document',
    category: 'technical-design',
    fileName: 'security-design.md',
    priority: 5,
    emoji: '🔒',
    description: 'Security architecture and design including authentication, authorization, and threat modeling.',
    estimatedTokens: 2500,
  },
  {
    key: 'performance-requirements',
    name: 'Performance Requirements',
    category: 'technical-design',
    fileName: 'performance-requirements.md',
    priority: 6,
    emoji: '⚡',
    description: 'System performance requirements including response times, throughput, and scalability.',
    estimatedTokens: 2000,
  },
  {
    key: 'integration-design',
    name: 'Integration Design',
    category: 'technical-design',
    fileName: 'integration-design.md',
    priority: 7,
    emoji: '🔄',
    description: 'System integration design including interfaces, data flows, and integration patterns.',
    estimatedTokens: 2500,
  },
  {
    key: 'technical-stack',
    name: 'Technical Stack Overview',
    category: 'technical-design',
    fileName: 'technical-stack-overview.md',
    priority: 8,
    emoji: '🔧',
    description: 'Overview of the technical stack including frontend, backend, and infrastructure technologies.',
    estimatedTokens: 2000,
  },
  {
    key: 'deployment-architecture',
    name: 'Deployment Architecture',
    category: 'technical-design',
    fileName: 'deployment-architecture.md',
    priority: 9,
    emoji: '🚀',
    description: 'Deployment architecture including infrastructure, environments, and deployment processes.',
    estimatedTokens: 2500,
  },
  {
    key: 'error-handling',
    name: 'Error Handling Guidelines',
    category: 'technical-design',
    fileName: 'error-handling-guidelines.md',
    priority: 10,
    emoji: '⚠️',
    description: 'Error handling guidelines including strategies, logging, and recovery procedures.',
    estimatedTokens: 2000,
  },
  // Quality Assurance Documents
  {
    key: 'test-strategy',
    name: 'Test Strategy Document',
    category: 'quality-assurance',
    fileName: 'test-strategy.md',
    priority: 1,
    emoji: '📋',
    description: 'Comprehensive test strategy including objectives, approach, and quality metrics.',
    estimatedTokens: 2500,
  },
  {
    key: 'test-plan',
    name: 'Test Plan Template',
    category: 'quality-assurance',
    fileName: 'test-plan-template.md',
    priority: 2,
    emoji: '📝',
    description: 'Detailed test plan template following IEEE 829 standard.',
    estimatedTokens: 2000,
  },
  {
    key: 'test-cases',
    name: 'Test Case Specifications',
    category: 'quality-assurance',
    fileName: 'test-case-specifications.md',
    priority: 3,
    emoji: '✅',
    description: 'Test case specifications including structure, steps, and expected results.',
    estimatedTokens: 2000,
  },
  {
    key: 'quality-metrics',
    name: 'Quality Metrics Definition',
    category: 'quality-assurance',
    fileName: 'quality-metrics-definition.md',
    priority: 4,
    emoji: '📊',
    description: 'Quality metrics definitions including measurement methods and targets.',
    estimatedTokens: 2000,
  },
  {
    key: 'acceptance-criteria',
    name: 'Acceptance Criteria Template',
    category: 'quality-assurance',
    fileName: 'acceptance-criteria-template.md',
    priority: 5,
    emoji: '✔️',
    description: 'Acceptance criteria template including business, functional, and non-functional requirements.',
    estimatedTokens: 2000,
  },
  {
    key: 'performance-test-plan',
    name: 'Performance Test Plan',
    category: 'quality-assurance',
    fileName: 'performance-test-plan.md',
    priority: 6,
    emoji: '⚡',
    description: 'Performance test plan including load profiles, metrics, and success criteria.',
    estimatedTokens: 2500,
  },
  {
    key: 'security-testing',
    name: 'Security Testing Guidelines',
    category: 'quality-assurance',
    fileName: 'security-testing-guidelines.md',
    priority: 7,
    emoji: '🔒',
    description: 'Security testing guidelines including vulnerability assessment and penetration testing.',
    estimatedTokens: 2500,
  },
  {
    key: 'code-review',
    name: 'Code Review Checklist',
    category: 'quality-assurance',
    fileName: 'code-review-checklist.md',
    priority: 8,
    emoji: '👀',
    description: 'Code review checklist including quality standards, security checks, and best practices.',
    estimatedTokens: 2000,
  },
  {
    key: 'bug-report',
    name: 'Bug Report Template',
    category: 'quality-assurance',
    fileName: 'bug-report-template.md',
    priority: 9,
    emoji: '🐛',
    description: 'Bug report template including issue description, reproduction steps, and severity levels.',
    estimatedTokens: 1500,
  },
  {
    key: 'test-environment',
    name: 'Test Environment Setup Guide',
    category: 'quality-assurance',
    fileName: 'test-environment-setup.md',
    priority: 10,
    emoji: '🔧',
    description: 'Test environment setup guide including hardware, software, and configuration requirements.',
    estimatedTokens: 2500,
  },
  // Implementation Guides
  {
    key: 'coding-standards',
    name: 'Coding Standards Guide',
    category: 'implementation-guides',
    fileName: 'coding-standards-guide.md',
    priority: 1,
    emoji: '📝',
    description: 'Coding standards and best practices for development.',
    estimatedTokens: 2500,
  },
  {
    key: 'development-setup',
    name: 'Development Setup Guide',
    category: 'implementation-guides',
    fileName: 'development-setup-guide.md',
    priority: 2,
    emoji: '🔧',
    description: 'Development environment setup and configuration guide.',
    estimatedTokens: 2000,
  },
  {
    key: 'version-control',
    name: 'Version Control Guidelines',
    category: 'implementation-guides',
    fileName: 'version-control-guidelines.md',
    priority: 3,
    emoji: '🔀',
    description: 'Version control workflow and best practices.',
    estimatedTokens: 2000,
  },
  {
    key: 'ci-pipeline',
    name: 'CI/CD Pipeline Guide',
    category: 'implementation-guides',
    fileName: 'ci-cd-pipeline-guide.md',
    priority: 4,
    emoji: '🔄',
    description: 'CI/CD pipeline setup and configuration guide.',
    estimatedTokens: 2500,
  },
  {
    key: 'release-process',
    name: 'Release Process Document',
    category: 'implementation-guides',
    fileName: 'release-process.md',
    priority: 5,
    emoji: '🚀',
    description: 'Software release process and procedures.',
    estimatedTokens: 2000,
  },
  {
    key: 'code-documentation',
    name: 'Code Documentation Standards',
    category: 'implementation-guides',
    fileName: 'code-documentation-standards.md',
    priority: 6,
    emoji: '📚',
    description: 'Code documentation standards and guidelines.',
    estimatedTokens: 2000,
  },
  {
    key: 'troubleshooting',
    name: 'Troubleshooting Guide',
    category: 'implementation-guides',
    fileName: 'troubleshooting-guide.md',
    priority: 7,
    emoji: '🔍',
    description: 'System troubleshooting and debugging guide.',
    estimatedTokens: 2500,
  },
  {
    key: 'development-workflow',
    name: 'Development Workflow Guide',
    category: 'implementation-guides',
    fileName: 'development-workflow-guide.md',
    priority: 8,
    emoji: '⚙️',
    description: 'Development workflow and processes guide.',
    estimatedTokens: 2000,
  },
  {
    key: 'api-integration',
    name: 'API Integration Guide',
    category: 'implementation-guides',
    fileName: 'api-integration-guide.md',
    priority: 9,
    emoji: '🔌',
    description: 'API integration and implementation guide.',
    estimatedTokens: 2500,
  },
  {
    key: 'deployment-guide',
    name: 'Deployment Guide',
    category: 'implementation-guides',
    fileName: 'deployment-guide.md',
    priority: 10,
    emoji: '📦',
    description: 'System deployment process and procedures.',
    estimatedTokens: 2500,
  },
    // Core Analysis Documents (High Priority)
    { key: 'project-summary', name: 'AI Summary and Goals', func: 'getAiSummaryAndGoals', emoji: '🤖', category: 'core-analysis', priority: 1, pmbokRef: 'N/A' },
    { key: 'user-stories', name: 'User Stories', func: 'getAiUserStories', emoji: '📖', category: 'core-analysis', priority: 2, pmbokRef: '5.2' },
    { key: 'user-personas', name: 'User Personas', func: 'getAiUserPersonas', emoji: '👥', category: 'core-analysis', priority: 3, pmbokRef: '13.1' },
    { key: 'key-roles-and-needs', name: 'Key Roles and Needs', func: 'getAiKeyRolesAndNeeds', emoji: '🎭', category: 'core-analysis', priority: 4, pmbokRef: '9.1' },
    { key: 'project-statement-of-work', name: 'Project Statement of Work', func: 'getAiProjectStatementOfWork', emoji: '📝', category: 'core-analysis', priority: 4.5, pmbokRef: '4.1' },
    { key: 'business-case', name: 'Business Case', func: 'getAiBusinessCase', emoji: '💼', category: 'core-analysis', priority: 5, pmbokRef: '1.1' },
    
    // Strategic Statements (New)
    {
        key: 'mission-vision-core-values',
        name: 'Mission, Vision & Core Values',
        func: 'getAiMissionVisionAndCoreValues',
        emoji: '🎯',
        category: 'strategic-statements',
        priority: 1,
        pmbokRef: '1.2.3.1 Strategic Alignment'
    },
    {
        key: 'project-purpose',
        name: 'Project Purpose',
        func: 'getAiProjectPurpose',
        emoji: '🎯',
        category: 'strategic-statements',
        priority: 2,
        pmbokRef: '1.2.3.1 Strategic Alignment'
    },
    
    // Project Charter (Critical)
    { key: 'project-charter', name: 'Project Charter', func: 'getAiProjectCharter', emoji: '📜', category: 'project-charter', priority: 8, pmbokRef: '4.1' },
    { key: 'project-management-plan', name: 'Project Management Plan', func: 'getAiProjectManagementPlan', emoji: '🗂️', category: 'project-charter', priority: 9, pmbokRef: '4.2' },
    { key: 'direct-and-manage-project-work', name: 'Direct and Manage Project Work Process', func: 'getAiDirectAndManageProjectWorkProcess', emoji: '🚦', category: 'management-plans', priority: 9.5, pmbokRef: '4.3' },
    { key: 'perform-integrated-change-control', name: 'Perform Integrated Change Control Process', func: 'getAiPerformIntegratedChangeControlProcess', emoji: '🔄', category: 'management-plans', priority: 9.6, pmbokRef: '4.6' },
    { key: 'close-project-or-phase', name: 'Close Project or Phase Process', func: 'getAiCloseProjectOrPhaseProcess', emoji: '🏁', category: 'management-plans', priority: 9.7, pmbokRef: '4.7' },
    { key: 'plan-scope-management', name: 'Plan Scope Management', func: 'getAiPlanScopeManagement', emoji: '📝', category: 'management-plans', priority: 9.8, pmbokRef: '5.1' },
    { key: 'requirements-management-plan', name: 'Requirements Management Plan', func: 'getAiRequirementsManagementPlan', emoji: '📑', category: 'management-plans', priority: 9.85, pmbokRef: '5.1.3.1' },
    { key: 'collect-requirements', name: 'Collect Requirements Process', func: 'getAiCollectRequirementsProcess', emoji: '🗒️', category: 'management-plans', priority: 9.87, pmbokRef: '5.2' },
    { key: 'requirements-documentation', name: 'Requirements Documentation', func: 'getAiRequirementsDocumentation', emoji: '📃', category: 'management-plans', priority: 9.88, pmbokRef: '5.2.3.1' },
    { key: 'requirements-traceability-matrix', name: 'Requirements Traceability Matrix', func: 'getAiRequirementsTraceabilityMatrix', emoji: '🔗', category: 'management-plans', priority: 9.89, pmbokRef: '5.2.3.2' },
    { key: 'define-scope', name: 'Define Scope Process', func: 'getAiDefineScopeProcess', emoji: '🛑', category: 'management-plans', priority: 9.9, pmbokRef: '5.3' },
    { key: 'project-scope-statement', name: 'Project Scope Statement', func: 'getAiProjectScopeStatement', emoji: '📄', category: 'management-plans', priority: 9.91, pmbokRef: '5.3.3.1' },
    { key: 'create-wbs', name: 'Create WBS Process', func: 'getAiCreateWbsProcess', emoji: '🧩', category: 'management-plans', priority: 9.92, pmbokRef: '5.4' },
    { key: 'scope-baseline', name: 'Scope Baseline', func: 'getAiScopeBaseline', emoji: '📏', category: 'management-plans', priority: 9.93, pmbokRef: '5.4.3.1' },
    { key: 'validate-scope', name: 'Validate Scope Process', func: 'getAiValidateScopeProcess', emoji: '✅', category: 'management-plans', priority: 9.94, pmbokRef: '5.5' },
    { key: 'control-scope', name: 'Control Scope Process', func: 'getAiControlScopeProcess', emoji: '🛡️', category: 'management-plans', priority: 9.95, pmbokRef: '5.6' },
    { key: 'work-performance-information-scope', name: 'Work Performance Information (Scope)', func: 'getAiWorkPerformanceInformationScope', emoji: '📈', category: 'management-plans', priority: 9.96, pmbokRef: '5.6.3.2' },
    
    // Management Plans (High Priority)
    { key: 'scope-management-plan', name: 'Scope Management Plan', func: 'getAiScopeManagementPlan', emoji: '📊', category: 'management-plans', priority: 10, pmbokRef: '5.1.3.1' },
    { key: 'risk-management-plan', name: 'Risk Management Plan', func: 'getAiRiskManagementPlan', emoji: '⚠️', category: 'management-plans', priority: 11, pmbokRef: '11.1.3.1' },
    { key: 'cost-management-plan', name: 'Cost Management Plan', func: 'getAiCostManagementPlan', emoji: '💰', category: 'management-plans', priority: 12, pmbokRef: '7.1.3.1' },
    { key: 'quality-management-plan', name: 'Quality Management Plan', func: 'getAiQualityManagementPlan', emoji: '✅', category: 'management-plans', priority: 13, pmbokRef: '8.1.3.1' },
    { key: 'resource-management-plan', name: 'Resource Management Plan', func: 'getAiResourceManagementPlan', emoji: '👨‍💼', category: 'management-plans', priority: 14, pmbokRef: '9.1.3.1' },
    { key: 'communication-management-plan', name: 'Communication Management Plan', func: 'getAiCommunicationManagementPlan', emoji: '📢', category: 'management-plans', priority: 15, pmbokRef: '10.1.3.1' },
    { key: 'procurement-management-plan', name: 'Procurement Management Plan', func: 'getAiProcurementManagementPlan', emoji: '🛒', category: 'management-plans', priority: 16, pmbokRef: '12.1.3.1' },
    
    // Stakeholder Management (Updated with proper priority order)
    { key: 'stakeholder-engagement-plan', name: 'Stakeholder Engagement Plan', func: 'getAiStakeholderEngagementPlan', emoji: '🤝', category: 'stakeholder-management', priority: 17, pmbokRef: '13.2.3.1' },
    { key: 'stakeholder-register', name: 'Stakeholder Register', func: 'getAiStakeholderRegister', emoji: '👥', category: 'stakeholder-management', priority: 18, pmbokRef: '13.1.3.1' },
    { key: 'stakeholder-analysis', name: 'Stakeholder Analysis', func: 'getAiStakeholderAnalysis', emoji: '📈', category: 'stakeholder-management', priority: 19, pmbokRef: '13.1.2.4' },
    
    // Planning Artifacts (Medium Priority - updated priorities)
    { key: 'work-breakdown-structure', name: 'Work Breakdown Structure', func: 'getAiWbs', emoji: '🏗️', category: 'planning-artifacts', priority: 20, pmbokRef: '5.4.3.1' },
    { key: 'wbs-dictionary', name: 'WBS Dictionary', func: 'getAiWbsDictionary', emoji: '📚', category: 'planning-artifacts', priority: 21, pmbokRef: '5.4.3.1' },
    { key: 'activity-list', name: 'Activity List', func: 'getAiActivityList', emoji: '📋', category: 'planning-artifacts', priority: 22, pmbokRef: '6.2.3.1' },
    { key: 'activity-duration-estimates', name: 'Activity Duration Estimates', func: 'getAiActivityDurationEstimates', emoji: '⏱️', category: 'planning-artifacts', priority: 23, pmbokRef: '6.4.3.1' },
    { key: 'activity-resource-estimates', name: 'Activity Resource Estimates', func: 'getAiActivityResourceEstimates', emoji: '📦', category: 'planning-artifacts', priority: 24, pmbokRef: '6.3.3.1' },
    { key: 'schedule-network-diagram', name: 'Schedule Network Diagram', func: 'getAiScheduleNetworkDiagram', emoji: '🔗', category: 'planning-artifacts', priority: 25, pmbokRef: '6.3.3.1' },
    { key: 'milestone-list', name: 'Milestone List', func: 'getAiMilestoneList', emoji: '🎯', category: 'planning-artifacts', priority: 26, pmbokRef: '6.2.3.3' },
    { key: 'schedule-development-input', name: 'Schedule Development Input', func: 'getAiDevelopScheduleInput', emoji: '📅', category: 'planning-artifacts', priority: 27, pmbokRef: '6.5.1.2' },
    {
        key: 'project-kickoff-preparations-checklist',
        name: 'Project KickOff Preparations Checklist',
        func: 'getProjectKickoffPreparationsChecklist',
        emoji: '✅',
        category: 'planning-artifacts',
        priority: 10,
        pmbokRef: 'N/A'
    },
    
    // Technical Analysis (Lower Priority but Important - updated priorities)
    { key: 'data-model-suggestions', name: 'Data Model Suggestions', func: 'getAiDataModelSuggestions', emoji: '🗄️', category: 'technical-analysis', priority: 28, pmbokRef: 'N/A' },
    { key: 'tech-stack-analysis', name: 'Tech Stack Analysis', func: 'getAiTechStackAnalysis', emoji: '⚙️', category: 'technical-analysis', priority: 29, pmbokRef: 'N/A' },
    { key: 'risk-analysis', name: 'Risk Analysis', func: 'getAiRiskAnalysis', emoji: '🔍', category: 'technical-analysis', priority: 30, pmbokRef: '11.2.3.1' },
    { key: 'acceptance-criteria', name: 'Acceptance Criteria', func: 'getAiAcceptanceCriteria', emoji: '✔️', category: 'technical-analysis', priority: 31, pmbokRef: '5.2.3.1' },
    { key: 'compliance-considerations', name: 'Compliance Considerations', func: 'getAiComplianceConsiderations', emoji: '⚖️', category: 'technical-analysis', priority: 32, pmbokRef: 'N/A' },
    { key: 'ui-ux-considerations', name: 'UI/UX Considerations', func: 'getAiUiUxConsiderations', emoji: '🎨', category: 'technical-analysis', priority: 33, pmbokRef: 'N/A' }
];

/**
 * Document configuration
 */
export const DOCUMENT_CONFIG: Record<string, { filename: string; title: string; description?: string }> = {
    // Core Analysis Documents
    'project-summary': { filename: 'project-summary.md', title: 'AI Summary and Goals' },
    'user-stories': { filename: 'user-stories.md', title: 'User Stories' },
    'user-personas': { filename: 'user-personas.md', title: 'User Personas' },
    'key-roles-and-needs': { filename: 'key-roles-and-needs.md', title: 'Key Roles and Needs' },
    'project-statement-of-work': { filename: 'project-statement-of-work.md', title: 'Project Statement of Work' },
    'business-case': { filename: 'business-case.md', title: 'Business Case' },
    
    // Strategic Documents
    'mission-vision-core-values': {
        filename: 'strategic-statements/mission-vision-core-values.md',
        title: 'Mission, Vision & Core Values',
        description: 'Defines the project mission, vision, and core values for strategic alignment.'
    },
    'project-purpose': {
        filename: 'strategic-statements/project-purpose.md',
        title: 'Project Purpose',
        description: 'Describes the overall purpose and strategic intent of the project.'
    },
    
    // Project Charter
    'project-charter': { filename: 'project-charter.md', title: 'Project Charter' },
    'project-management-plan': { filename: 'project-management-plan.md', title: 'Project Management Plan' },
    
    // Management Plans and Processes
    'direct-and-manage-project-work': { filename: 'direct-and-manage-project-work.md', title: 'Direct and Manage Project Work Process' },
    'perform-integrated-change-control': { filename: 'perform-integrated-change-control.md', title: 'Perform Integrated Change Control Process' },
    'close-project-or-phase': { filename: 'close-project-or-phase.md', title: 'Close Project or Phase Process' },
    'plan-scope-management': { filename: 'plan-scope-management.md', title: 'Plan Scope Management' },
    'requirements-management-plan': { filename: 'requirements-management-plan.md', title: 'Requirements Management Plan' },
    'collect-requirements': { filename: 'collect-requirements.md', title: 'Collect Requirements Process' },
    'requirements-documentation': { filename: 'requirements-documentation.md', title: 'Requirements Documentation' },
    'requirements-traceability-matrix': { filename: 'requirements-traceability-matrix.md', title: 'Requirements Traceability Matrix' },
    'define-scope': { filename: 'define-scope.md', title: 'Define Scope Process' },
    'project-scope-statement': { filename: 'project-scope-statement.md', title: 'Project Scope Statement' },
    'create-wbs': { filename: 'create-wbs.md', title: 'Create WBS Process' },
    'scope-baseline': { filename: 'scope-baseline.md', title: 'Scope Baseline' },
    'validate-scope': { filename: 'validate-scope.md', title: 'Validate Scope Process' },
    'control-scope': { filename: 'control-scope.md', title: 'Control Scope Process' },
    'work-performance-information-scope': { filename: 'work-performance-information-scope.md', title: 'Work Performance Information (Scope)' },
    'scope-management-plan': { filename: 'scope-management-plan.md', title: 'Scope Management Plan' },
    'risk-management-plan': { filename: 'risk-management-plan.md', title: 'Risk Management Plan' },
    'cost-management-plan': { filename: 'cost-management-plan.md', title: 'Cost Management Plan' },
    'quality-management-plan': { filename: 'quality-management-plan.md', title: 'Quality Management Plan' },
    'resource-management-plan': { filename: 'resource-management-plan.md', title: 'Resource Management Plan' },
    'communication-management-plan': { filename: 'communication-management-plan.md', title: 'Communication Management Plan' },
    'procurement-management-plan': { filename: 'procurement-management-plan.md', title: 'Procurement Management Plan' },
    
    // Stakeholder Management
    'stakeholder-engagement-plan': { filename: 'stakeholder-engagement-plan.md', title: 'Stakeholder Engagement Plan' },
    'stakeholder-register': { filename: 'stakeholder-register.md', title: 'Stakeholder Register' },
    'stakeholder-analysis': { filename: 'stakeholder-analysis.md', title: 'Stakeholder Analysis' },
    
    // Planning Artifacts
    'work-breakdown-structure': { filename: 'work-breakdown-structure.md', title: 'Work Breakdown Structure' },
    'wbs-dictionary': { filename: 'wbs-dictionary.md', title: 'WBS Dictionary' },
    'activity-list': { filename: 'activity-list.md', title: 'Activity List' },
    'activity-duration-estimates': { filename: 'activity-duration-estimates.md', title: 'Activity Duration Estimates' },
    'activity-resource-estimates': { filename: 'activity-resource-estimates.md', title: 'Activity Resource Estimates' },
    'schedule-network-diagram': { filename: 'schedule-network-diagram.md', title: 'Schedule Network Diagram' },
    'milestone-list': { filename: 'milestone-list.md', title: 'Milestone List' },
    'schedule-development-input': { filename: 'schedule-development-input.md', title: 'Schedule Development Input' },
    // Project Kickoff Preparations Checklist (single canonical doc)
    'project-kickoff-preparations-checklist': {
        filename: 'project-kickoff-preparations-checklist.md',
        title: 'Project KickOff Preparations Checklist',
        description: 'Checklist to ensure all preparations are complete before project kick-off'
    },
    
    // Technical Analysis
    'data-model-suggestions': { filename: 'data-model-suggestions.md', title: 'Data Model Suggestions' },
    'tech-stack-analysis': { filename: 'tech-stack-analysis.md', title: 'Tech Stack Analysis' },
    'risk-analysis': { filename: 'risk-analysis.md', title: 'Risk Analysis' },
    'acceptance-criteria': { filename: 'acceptance-criteria.md', title: 'Acceptance Criteria' },
    'compliance-considerations': { filename: 'compliance-considerations.md', title: 'Compliance Considerations' },
    'ui-ux-considerations': { filename: 'ui-ux-considerations.md', title: 'UI/UX Considerations' }
};

/**
 * Get available document categories
 */
export function getAvailableCategories(): string[] {
    const categories = new Set<string>();
    GENERATION_TASKS.forEach(task => categories.add(task.category));
    return Array.from(categories).sort();
}

/**
 * Get all tasks for a specific category
 */
export function getTasksByCategory(category: string): GenerationTask[] {
    return GENERATION_TASKS.filter(task => task.category === category)
        .sort((a, b) => a.priority - b.priority);
}

/**
 * Find task by key
 */
export function getTaskByKey(key: string): GenerationTask | undefined {
    return GENERATION_TASKS.find(task => task.key === key);
}
