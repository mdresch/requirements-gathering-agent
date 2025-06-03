/**
 * Requirements Gathering Agent
 * AI-powered PMBOK documentation generator with multi-provider support
 */

// Core LLM functions
export {
  getAiSummaryAndGoals,
  getAiUserStories,
  getAiUserPersonas,
  getAiKeyRolesAndNeeds,
  getAiDataModelSuggestions,
  getAiTechStackAnalysis,
  getAiRiskAnalysis,
  getAiAcceptanceCriteria,
  getAiComplianceConsiderations,
  getAiUiUxConsiderations
} from './modules/llmProcessor.js';

// PMBOK document generators - Fixed export names
export {
  getAiProjectCharter,
  getAiStakeholderRegister,
  getAiScopeManagementPlan,
  // Note: Commented out missing exports, add them when they exist in llmProcessor.ts
  // getAiRequirementsManagementPlan,
  // getAiScheduleManagementPlan,
  getAiCostManagementPlan,
  getAiQualityManagementPlan,
  getAiResourceManagementPlan,
  getAiCommunicationManagementPlan, // Fixed name - no 's' in Communication
  getAiRiskManagementPlan,
  getAiProcurementManagementPlan,
  getAiStakeholderEngagementPlan,
  getAiWbs,
  getAiWbsDictionary,
  getAiActivityList,
  getAiActivityDurationEstimates,
  getAiActivityResourceEstimates,
  getAiScheduleNetworkDiagram,
  getAiMilestoneList,
  getAiDevelopScheduleInput
} from './modules/llmProcessor.js';

// Utility functions
export { generateMarkdownFile, generateMarkdownFiles, generateProjectDocumentation } from './modules/fileUtils.js';

// Strategic planning functions
export async function generateStrategicSections(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}) {
  const { getAiSummaryAndGoals } = await import('./modules/llmProcessor.js');
  
  const context = `
Business Problem: ${input.businessProblem}
Technology Stack: ${input.technologyStack.join(', ')}
Context: ${input.contextBundle}
  `.trim();

  const summary = await getAiSummaryAndGoals(context);
  
  return {
    vision: summary || 'Vision not generated',
    mission: summary || 'Mission not generated', 
    coreValues: summary || 'Core values not generated',
    purpose: summary || 'Purpose not generated'
  };
}

export async function generateRequirements(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}) {
  const { getAiKeyRolesAndNeeds } = await import('./modules/llmProcessor.js');
  
  const context = `
Business Problem: ${input.businessProblem}
Technology Stack: ${input.technologyStack.join(', ')}
Context: ${input.contextBundle}
  `.trim();

  const rolesAndNeeds = await getAiKeyRolesAndNeeds(context);
  
  // Parse the response into structured format
  if (!rolesAndNeeds) return [];
  
  return [
    {
      role: 'User',
      needs: ['Generated needs from AI'],
      processes: ['Generated processes from AI']
    }
  ];
}

// Type definitions
export interface ProjectContext {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}

export interface StrategicSections {
  vision: string;
  mission: string;
  coreValues: string;
  purpose: string;
}

export interface UserRequirement {
  role: string;
  needs: string[];
  processes: string[];
}

// Version information
export const version = '2.0.0';
export const name = 'requirements-gathering-agent';