/**
 * Migration wrapper for existing llmProcessor functions
 * This file provides backward compatibility while using the new optimized architecture
 */

import { ProcessorFactory } from './ai/processors';
import { AIProcessor } from './ai/AIProcessor';
import type { ContextManager } from './contextManager';
import { ChatMessage } from './ai/types';

/**
 * Migration Helper Processor
 * Utility class to handle common AI operations in the migration layer
 * 
 * @class MigrationHelperProcessor
 * @description Provides common utility functions for handling AI operations
 * in the backward compatibility migration layer. Simplifies error handling
 * and message creation.
 */
export class MigrationHelperProcessor {
    /**
     * Creates standard message array for AI calls
     * 
     * @param {string} systemPrompt - System prompt defining the AI's role
     * @param {string} userPrompt - The main prompt content to send
     * @returns {ChatMessage[]} Formatted chat message array 
     */
    static createMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }

    /**
     * Generic handler for AI function calls with proper error handling
     * 
     * @param {Function} operation - Async function that makes the actual AI call
     * @param {string} operationName - Name of the operation for logging and metrics
     * @returns {Promise<string|null>} AI-generated content or null if operation fails
     */
    static async handleAICall(
        operation: () => Promise<string | null>,
        operationName: string
    ): Promise<string | null> {
        try {
            const aiProcessor = AIProcessor.getInstance();
            return await aiProcessor.processAIRequest(operation, operationName);
        } catch (error: any) {
            console.error(`Migration AI operation failed: ${operationName}`, error.message);
            return null;
        }
    }
}

// Get processors
const projectMgmtProcessor = ProcessorFactory.getProjectManagementProcessor();
const pmbokProcessor = ProcessorFactory.getPMBOKProcessProcessor();
const scopeProcessor = ProcessorFactory.getScopeManagementProcessor();
const stakeholderProcessor = ProcessorFactory.getStakeholderProcessor();
const technicalAnalysisProcessor = ProcessorFactory.getTechnicalAnalysisProcessor();
const requirementsProcessor = ProcessorFactory.getRequirementsProcessor();
const planningProcessor = ProcessorFactory.getPlanningProcessor();
const wbsProcessor = ProcessorFactory.getWBSProcessor();
const activityProcessor = ProcessorFactory.getActivityProcessor();

// Core AI processor for direct calls
const aiProcessor = AIProcessor.getInstance();

// Use lazy initialization to resolve circular dependency
let _contextManager: any = null;

// Lazy initialization function for contextManager
function getContextManager(): any {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = require('./contextManager');
        _contextManager = new ContextManager();
    }
    return _contextManager;
}

// Backward compatibility exports - Core Values and Project Purpose
export async function getAiCoreValues(context: string): Promise<string | null> {
    return await projectMgmtProcessor.getCoreValues(context);
}

export async function getAiProjectPurpose(context: string): Promise<string | null> {
    return await projectMgmtProcessor.getProjectPurpose(context);
}

export async function getAiMissionVisionAndCoreValues(context: string): Promise<string | null> {
    return await projectMgmtProcessor.getMissionVisionAndCoreValues(context);
}

// Project Management Plans
export async function getAiProjectManagementPlan(context: string): Promise<string | null> {
    return await pmbokProcessor.getProjectManagementPlan(context);
}

export async function getAiDirectAndManageProjectWorkProcess(context: string): Promise<string | null> {
    return await pmbokProcessor.getDirectAndManageProjectWork(context);
}

// Scope Management
export async function getAiPlanScopeManagement(context: string): Promise<string | null> {
    return await scopeProcessor.getPlanScopeManagement(context);
}

// Enhanced context management functions using new architecture
/**
 * Generates a PMBOK-compliant Perform Integrated Change Control process document
 * 
 * @param {string} context - Project context information
 * @returns {Promise<string|null>} Process document or null if generation fails
 */
export async function getAiPerformIntegratedChangeControlProcess(context: string): Promise<string | null> {
    const enhancedContext = getContextManager().buildContextForDocument('perform-integrated-change-control', [
        'project-management-plan',
        'project-charter',
        'scope-management-plan',
        'schedule-management-plan',
        'cost-management-plan'
    ]);
    const fullContext = enhancedContext || context;
    
    return await MigrationHelperProcessor.handleAICall(async () => {
        const messages = MigrationHelperProcessor.createMessages(
            "You are a PMBOK-certified project manager. Describe the Perform Integrated Change Control process, following PMBOK 7th Edition standards, for a software project.",
            `Based on the comprehensive project context below, provide a detailed process description for Perform Integrated Change Control as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including Change Control Board)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Change request evaluation and approval workflow\n- Integration with other project management processes\n- Best practices and common challenges\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`
        );
        const response = await aiProcessor.makeAICall(messages, 1200);
        return aiProcessor.extractContent(response);
    }, 'Perform Integrated Change Control Process Generation');
}

/**
 * Generates a PMBOK-compliant Close Project or Phase process document
 * 
 * @param {string} context - Project context information
 * @returns {Promise<string|null>} Process document or null if generation fails
 */
export async function getAiCloseProjectOrPhaseProcess(context: string): Promise<string | null> {
    const enhancedContext = getContextManager().buildContextForDocument('close-project-or-phase', [
        'project-management-plan',
        'project-charter',
        'scope-management-plan'
    ]);
    const fullContext = enhancedContext || context;
    
    return await MigrationHelperProcessor.handleAICall(async () => {
        const messages = MigrationHelperProcessor.createMessages(
            "You are a PMBOK-certified project manager. Describe the Close Project or Phase process, following PMBOK 7th Edition standards, for a software project.",
            `Based on the comprehensive project context below, provide a detailed process description for Close Project or Phase as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including final product/service/result transition)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Documentation and knowledge transfer\n- Lessons learned and project evaluation\n- Integration with other project management processes\n- Best practices and common challenges\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`
        );
        const response = await aiProcessor.makeAICall(messages, 1200);
        return aiProcessor.extractContent(response);
    }, 'Close Project or Phase Process Generation');
}

export async function getAiRequirementsManagementPlan(context: string): Promise<string | null> {
    try {
        const enhancedContext = getContextManager().buildContextForDocument('requirements-management-plan', [
            'project-charter', 
            'user-stories', 
            'stakeholder-register', 
            'plan-scope-management'
        ]);
        const fullContext = enhancedContext || context;
        
        return await aiProcessor.processAIRequest(async () => {
            const messages = aiProcessor.createMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Requirements Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Requirements Management Plan as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour Requirements Management Plan should include:\n- Requirements planning approach\n- Requirements traceability process\n- Requirements configuration management\n- Requirements prioritization and approval process\n- Change control for requirements\n- Requirements validation and verification\n- Roles and responsibilities for requirements management\n- Tools and techniques for requirements management\n- Metrics and reporting for requirements\n\nEnsure the plan is actionable, comprehensive, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`
            );
            const response = await aiProcessor.makeAICall(messages, 1400);
            return aiProcessor.extractContent(response);
        }, 'Requirements Management Plan Generation');
    } catch (error: any) {
        console.error('AI operation failed: Requirements Management Plan Generation', error.message);
        return null;
    }
}

// Legacy functions that need to be migrated - these are placeholders
// The original file had many more functions that would need similar treatment

/**
 * Utility function to easily migrate existing functions from llmProcessor
 * 
 * @param {string} functionName - Name of the function being migrated (for logging)
 * @param {string} systemPrompt - System prompt defining the AI's role
 * @param {string} userPromptTemplate - Template string with ${context} placeholder
 * @param {string} context - The context to use in the prompt
 * @param {number} maxTokens - Maximum tokens for the AI response
 * @param {string[]} contextDocuments - List of documents to enhance context with
 * @returns {Promise<string|null>} The AI-generated content or null if operation fails
 */
async function migrateExistingFunction(
    functionName: string,
    systemPrompt: string,
    userPromptTemplate: string,
    context: string,
    maxTokens: number = 1200,
    contextDocuments?: string[]
): Promise<string | null> {
    try {
        let fullContext = context;
        
        if (contextDocuments && contextDocuments.length > 0) {
            const enhancedContext = getContextManager().buildContextForDocument(functionName, contextDocuments);
            fullContext = enhancedContext || context;
        }
          return await MigrationHelperProcessor.handleAICall(async () => {
            const userPrompt = userPromptTemplate.replace('${context}', fullContext);
            const messages = MigrationHelperProcessor.createMessages(systemPrompt, userPrompt);
            const response = await aiProcessor.makeAICall(messages, maxTokens);
            return aiProcessor.extractContent(response);
        }, `${functionName} Generation`);
    } catch (error: any) {
        console.error(`AI operation failed: ${functionName} Generation`, error.message);
        return null;
    }
}

// Export the migration utility for other functions that need to be converted
export { migrateExistingFunction };

// Export new architecture components for advanced usage
// Requirements Management Functions
export async function getAiSummaryAndGoals(readmeContent: string): Promise<string | null> {
    return await requirementsProcessor.getSummaryAndGoals(readmeContent);
}

export async function getAiUserStories(context: string): Promise<string | null> {
    return await requirementsProcessor.getUserStories(context);
}

export async function getAiUserPersonas(context: string): Promise<string | null> {
    return await requirementsProcessor.getUserPersonas(context);
}

export async function getAiKeyRolesAndNeeds(context: string): Promise<string | null> {
    return await requirementsProcessor.getKeyRolesAndNeeds(context);
}

export async function getAiAcceptanceCriteria(context: string): Promise<string | null> {
    return await requirementsProcessor.getAcceptanceCriteria(context);
}

export async function getAiRequirementsDocumentation(context: string): Promise<string | null> {
    return await requirementsProcessor.getRequirementsDocumentation(context);
}

export async function getAiRequirementsTraceabilityMatrix(context: string): Promise<string | null> {
    return await requirementsProcessor.getRequirementsTraceabilityMatrix(context);
}

// Technical Analysis Functions
export async function getAiDataModelSuggestions(context: string): Promise<string | null> {
    return await technicalAnalysisProcessor.getDataModelSuggestions(context);
}

export async function getAiTechStackAnalysis(context: string): Promise<string | null> {
    return await technicalAnalysisProcessor.getTechStackAnalysis(context);
}

export async function getAiRiskAnalysis(context: string): Promise<string | null> {
    return await technicalAnalysisProcessor.getRiskAnalysis(context);
}

export async function getAiComplianceConsiderations(context: string): Promise<string | null> {
    return await technicalAnalysisProcessor.getComplianceConsiderations(context);
}

export async function getAiUiUxConsiderations(context: string): Promise<string | null> {
    return await technicalAnalysisProcessor.getUiUxConsiderations(context);
}

// Stakeholder Management Functions
export async function getAiStakeholderRegister(context: string): Promise<string | null> {
    return await stakeholderProcessor.getStakeholderRegister(context);
}

export async function getAiStakeholderAnalysis(context: string): Promise<string | null> {
    return await stakeholderProcessor.getStakeholderAnalysis(context);
}

// WBS and Activity Management Functions
export async function getAiWbs(context: string): Promise<string | null> {
    return await wbsProcessor.getWorkBreakdownStructure(context);
}

export async function getAiWbsDictionary(context: string): Promise<string | null> {
    return await wbsProcessor.getWBSDictionary(context);
}

export async function getAiScopeBaseline(context: string): Promise<string | null> {
    return await wbsProcessor.getScopeBaseline(context);
}

export async function getAiActivityList(context: string): Promise<string | null> {
    return await activityProcessor.getActivityList(context);
}

export async function getAiActivityAttributes(context: string): Promise<string | null> {
    return await activityProcessor.getActivityAttributes(context);
}

export async function getAiActivitySequencing(context: string): Promise<string | null> {
    return await activityProcessor.getActivitySequencing(context);
}

export async function getAiResourceRequirements(context: string): Promise<string | null> {
    return await activityProcessor.getResourceRequirements(context);
}

// Planning Management Functions
export async function getAiScheduleManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getScheduleManagementPlan(context);
}

export async function getAiCostManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getCostManagementPlan(context);
}

export async function getAiQualityManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getQualityManagementPlan(context);
}

export async function getAiResourceManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getResourceManagementPlan(context);
}

export async function getAiCommunicationManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getCommunicationManagementPlan(context);
}

export async function getAiRiskManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getRiskManagementPlan(context);
}

export async function getAiProcurementManagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getProcurementManagementPlan(context);
}

export async function getAiStakeholderEngagementPlan(context: string): Promise<string | null> {
    return await planningProcessor.getStakeholderEngagementPlan(context);
}

// New PMBOK Process Processor functions
export async function getAiProjectCharter(context: string): Promise<string | null> {
    return await pmbokProcessor.getProjectCharter(context);
}

export async function getAiValidateScope(context: string): Promise<string | null> {
    return await pmbokProcessor.getValidateScopeProcess(context);
}

export async function getAiControlScope(context: string): Promise<string | null> {
    return await pmbokProcessor.getControlScopeProcess(context);
}

export async function getAiMonitorAndControlProjectWorkProcess(context: string): Promise<string | null> {
    return await pmbokProcessor.getMonitorAndControlProjectWork(context);
}

export { AIProcessor, ProcessorFactory } from './ai';

// Backward compatibility for global variables
let providerMetrics: Map<string, any> = new Map();

function initializeProviderMetrics(): Map<string, any> {
    return providerMetrics;
}

// Export for backward compatibility
export { providerMetrics, initializeProviderMetrics };

// Scope Management Functions
export async function getAiScopeManagementPlan(context: string): Promise<string | null> {
    return await scopeProcessor.getScopeManagementPlan(context);
}

export async function getAiProjectScopeStatement(context: string): Promise<string | null> {
    return await scopeProcessor.getProjectScopeStatement(context);
}

// Note: These functions are already defined above - no need to redefine
