/**
 * AI Function Processors - Separated by domain for better organization
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

export { BaseAIProcessor } from "./BaseAIProcessor.js";

// Export the ProcessorFactory
export { ProcessorFactory } from "./ProcessorFactory.js";

const aiProcessor = AIProcessor.getInstance();
// Use lazy initialization to resolve circular dependency
let _contextManager: any = null;

// Lazy initialization function for contextManager
function getContextManager(): any {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = require("../../contextManager");
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

// Export individual functions
export const getAiSummaryAndGoals = (context: string) => projectManagementProcessor.getSummaryAndGoals(context);
export const getAiUserStories = (context: string) => projectManagementProcessor.getUserStories(context);
export const getAiUserPersonas = (context: string) => requirementsProcessor.getUserPersonas(context);
export const getAiKeyRolesAndNeeds = (context: string) => stakeholderProcessor.getStakeholderRegister(context);
export const getAiDataModelSuggestions = (context: string) => technicalProcessor.getDataModelSuggestions(context);
export const getAiTechStackAnalysis = (context: string) => technicalProcessor.getTechStackAnalysis(context);
export const getAiRiskAnalysis = (context: string) => projectManagementProcessor.getRiskAnalysis(context);
export const getAiAcceptanceCriteria = (context: string) => requirementsProcessor.getAcceptanceCriteria(context);
export const getAiComplianceConsiderations = (context: string) => technicalProcessor.getComplianceConsiderations(context);
export const getAiUiUxConsiderations = (context: string) => technicalProcessor.getUiUxConsiderations(context);
export const getAiScheduleNetworkDiagram = (context: string) => projectManagementProcessor.getScheduleNetworkDiagram(context);
export const getAiMilestoneList = (context: string) => projectManagementProcessor.getMilestoneList(context);
export const getAiDevelopScheduleInput = (context: string) => projectManagementProcessor.getDevelopScheduleInput(context);
