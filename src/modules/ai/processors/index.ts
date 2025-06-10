/**
 * AI Function Processors Index for Requirements Gathering Agent
 * 
 * Central export hub for domain-specific AI processors organized by
 * functional area for better maintainability and modularity.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Domain-separated AI processors for specialized functionality
 * - Organized exports by functional area (stakeholder, technical, etc.)
 * - Type-safe processor interfaces and implementations
 * - Modular architecture for easy extension
 * - Clean separation of concerns
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\processors\index.ts
 */

import { AIProcessor } from "../AIProcessor.js";
import type { ContextManager } from "../../contextManager.js";

// Import domain-specific processors
import { StakeholderProcessor } from "./StakeholderProcessor.js";
import { TechnicalAnalysisProcessor } from "./TechnicalAnalysisProcessor.js";
import { RequirementsProcessor } from "./RequirementsProcessor.js";
import { PMBOKProcessProcessor } from "./PMBOKProcessProcessor.js";
import { PlanningProcessor } from "./PlanningProcessor.js";
import { WBSProcessor } from "./WBSProcessor.js";
import { ActivityProcessor } from "./ActivityProcessor.js";
import { ScopeManagementProcessor } from "./ScopeManagementProcessor.js";
import { ProjectManagementProcessor } from "./ProjectManagementProcessor.js";
import { StrategicStatementsProcessor } from './StrategicStatementsProcessor.js';

export { BaseAIProcessor } from "./BaseAIProcessor.js";

// Export the ProcessorFactory
export { ProcessorFactory } from "./ProcessorFactory.js";

const aiProcessor = AIProcessor.getInstance();
// Use lazy initialization to resolve circular dependency
let _contextManager: any = null;

// Lazy initialization function for contextManager
async function getContextManager(): Promise<any> {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = await import("../../contextManager.js");
        _contextManager = new ContextManager();
    }
    return _contextManager;
}

// Create instances
const projectManagementProcessor = new ProjectManagementProcessor();
const pmbokProcessor = new PMBOKProcessProcessor();
const scopeProcessor = new ScopeManagementProcessor();
const stakeholderProcessor = new StakeholderProcessor();
const technicalProcessor = new TechnicalAnalysisProcessor();
const requirementsProcessor = new RequirementsProcessor();
const planningProcessor = new PlanningProcessor();
const wbsProcessor = new WBSProcessor();
const activityProcessor = new ActivityProcessor();
const strategicStatementsProcessor = new StrategicStatementsProcessor();

// Helper function to safely handle null returns from processors
const safeProcessorCall = async (processorPromise: Promise<string | null>): Promise<string> => {
    const result = await processorPromise;
    return result ?? '';
};

const safeProcessorCallSync = (processorFunction: (context: string) => string | null, context: string): string => {
    const result = processorFunction(context);
    return result ?? '';
};

// Export individual functions - delegate to processors with proper implementations

// Core Analysis Documents
export const getAiSummaryAndGoals = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getSummaryAndGoals(context));
export const getAiUserStories = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getUserStories(context));
export const getAiUserPersonas = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getUserPersonas(context));
export const getAiKeyRolesAndNeeds = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getKeyRolesAndNeeds(context));
export const getAiProjectStatementOfWork = async (context: string): Promise<string> => await safeProcessorCall(projectManagementProcessor.getProjectStatementOfWork(context));
export const getAiBusinessCase = async (context: string): Promise<string> => await safeProcessorCall(projectManagementProcessor.getBusinessCase(context));

// Strategic Statements  
export const getMissionVisionAndCoreValues = async (context: string): Promise<string> => await safeProcessorCall(strategicStatementsProcessor.getAiMissionVisionAndCoreValues(context));
export const getProjectPurpose = async (context: string): Promise<string> => await safeProcessorCall(strategicStatementsProcessor.getAiProjectPurpose(context));

// Project Charter
export const getAiProjectCharter = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getProjectCharter(context));
export const getAiProjectManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getProjectManagementPlan(context));

// PMBOK Process Functions
export const getAiDirectAndManageProjectWorkProcess = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getDirectAndManageProjectWork(context));
export const getAiPerformIntegratedChangeControlProcess = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getPerformIntegratedChangeControlProcess(context));
export const getAiCloseProjectOrPhaseProcess = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getCloseProjectOrPhaseProcess(context));
export const getAiPlanScopeManagement = async (context: string): Promise<string> => await safeProcessorCall(scopeProcessor.getPlanScopeManagement(context));
export const getAiRequirementsManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getRequirementsManagementPlan(context));
export const getAiCollectRequirementsProcess = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getCollectRequirementsProcess(context));
export const getAiRequirementsDocumentation = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getRequirementsDocumentation(context));
export const getAiRequirementsTraceabilityMatrix = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getRequirementsTraceabilityMatrix(context));
export const getAiDefineScopeProcess = async (context: string): Promise<string> => await safeProcessorCall(scopeProcessor.getDefineScopeProcess(context));
export const getAiProjectScopeStatement = async (context: string): Promise<string> => await safeProcessorCall(scopeProcessor.getProjectScopeStatement(context));
export const getAiCreateWbsProcess = async (context: string): Promise<string> => await safeProcessorCall(wbsProcessor.getCreateWbsProcess(context));
export const getAiScopeBaseline = async (context: string): Promise<string> => await safeProcessorCall(wbsProcessor.getScopeBaseline(context));
export const getAiValidateScopeProcess = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getValidateScopeProcess(context));
export const getAiControlScopeProcess = async (context: string): Promise<string> => await safeProcessorCall(pmbokProcessor.getControlScopeProcess(context));
export const getAiWorkPerformanceInformationScope = async (context: string): Promise<string> => await safeProcessorCall(scopeProcessor.getWorkPerformanceInformationScope(context));

// Management Plans
export const getAiScopeManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(scopeProcessor.getScopeManagementPlan(context));
export const getAiRiskManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getRiskManagementPlan(context));
export const getAiCostManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getCostManagementPlan(context));
export const getAiQualityManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getQualityManagementPlan(context));
export const getAiResourceManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getResourceManagementPlan(context));
export const getAiCommunicationManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getCommunicationManagementPlan(context));
export const getAiProcurementManagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getProcurementManagementPlan(context));

// Stakeholder Management
export const getAiStakeholderEngagementPlan = async (context: string): Promise<string> => await safeProcessorCall(planningProcessor.getStakeholderEngagementPlan(context));
export const getAiStakeholderRegister = async (context: string): Promise<string> => await safeProcessorCall(stakeholderProcessor.getStakeholderRegister(context));
export const getAiStakeholderAnalysis = async (context: string): Promise<string> => await safeProcessorCall(stakeholderProcessor.getStakeholderAnalysis(context));

// Planning Artifacts
export const getAiWbs = async (context: string): Promise<string> => await safeProcessorCall(wbsProcessor.getWorkBreakdownStructure(context));
export const getAiWbsDictionary = async (context: string): Promise<string> => await safeProcessorCall(wbsProcessor.getWBSDictionary(context));
export const getAiActivityList = async (context: string): Promise<string> => await safeProcessorCall(activityProcessor.getActivityList(context));
export const getAiActivityDurationEstimates = async (context: string): Promise<string> => await safeProcessorCall(activityProcessor.getActivityDurationEstimates(context));
export const getAiActivityResourceEstimates = async (context: string): Promise<string> => await safeProcessorCall(activityProcessor.getActivityResourceEstimates(context));
export const getAiScheduleNetworkDiagram = async (context: string): Promise<string> => await safeProcessorCall(projectManagementProcessor.getScheduleNetworkDiagram(context));
export const getAiMilestoneList = async (context: string): Promise<string> => await safeProcessorCall(projectManagementProcessor.getMilestoneList(context));
export const getAiDevelopScheduleInput = async (context: string): Promise<string> => await safeProcessorCall(activityProcessor.getDevelopScheduleInput(context));

// Technical Analysis
export const getAiDataModelSuggestions = async (context: string): Promise<string> => await safeProcessorCall(technicalProcessor.getDataModelSuggestions(context));
export const getAiTechStackAnalysis = async (context: string): Promise<string> => await safeProcessorCall(technicalProcessor.getTechStackAnalysis(context));
export const getAiRiskAnalysis = async (context: string): Promise<string> => await safeProcessorCall(projectManagementProcessor.getRiskAnalysis(context));
export const getAiAcceptanceCriteria = async (context: string): Promise<string> => await safeProcessorCall(requirementsProcessor.getAcceptanceCriteria(context));
export const getAiComplianceConsiderations = async (context: string): Promise<string> => await safeProcessorCall(technicalProcessor.getComplianceConsiderations(context));
export const getAiUiUxConsiderations = async (context: string): Promise<string> => await safeProcessorCall(technicalProcessor.getUiUxConsiderations(context));
