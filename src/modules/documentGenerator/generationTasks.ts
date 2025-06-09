/**
 * Generation Tasks Configuration
 * Defines all available document generation tasks
 */
import { GenerationTask } from './types';

/**
 * All available document generation tasks with proper organization and priorities
 */
export const GENERATION_TASKS: GenerationTask[] = [
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
    'mission-vision-core-values': { filename: 'mission-vision-core-values.md', title: 'Mission, Vision & Core Values' },
    'project-purpose': { filename: 'project-purpose.md', title: 'Project Purpose' },
    
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
