/**
 * Requirements Gathering Agent - Main Export Module
 * 
 * AI-powered PMBOK documentation generator with multi-provider support.
 * This module serves as the main entry point for all core functionality.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Multi-provider AI integration (Google AI, Azure OpenAI, GitHub AI)
 * - PMBOK 7.0 compliant document generation
 * - Comprehensive project analysis and context building
 * - Automated requirements gathering and documentation
 * - Modern TypeScript architecture with ES modules
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\index.ts
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
} from './modules/ai/processors/index.js';

// PMBOK document generators
export {
  getAiProjectCharter,
  getAiStakeholderRegister,
  getAiScopeManagementPlan,
  getAiRequirementsManagementPlan,
  getAiScheduleManagementPlan,
  getAiCostManagementPlan,
  getAiQualityManagementPlan,
  getAiResourceManagementPlan,
  getAiCommunicationManagementPlan,
  getAiRiskManagementPlan,
  getAiProcurementManagementPlan,
  getAiStakeholderEngagementPlan,
  getAiWbs,
  getAiWbsDictionary,
  getAiScopeBaseline,               // New function
  getAiActivityList,
  getAiActivityAttributes,          // New function
  getAiActivitySequencing,          // New function
  getAiResourceRequirements,        // New function
  getAiScheduleNetworkDiagram,
  getAiMilestoneList,
  getAiDevelopScheduleInput
} from './modules/llmProcessor-migration.js';

// Utility functions
export { generateMarkdownFile, generateMarkdownFiles, generateProjectDocumentation } from './modules/fileUtils.js';

// Strategic planning functions
export async function generateStrategicSections(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}) {
  const { getAiSummaryAndGoals } = await import('./modules/llmProcessor-migration.js');
  
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
  const { getAiKeyRolesAndNeeds } = await import('./modules/llmProcessor-migration.js');
  
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
  projectName: string;
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
export const version = '2.1.3';
export const name = 'requirements-gathering-agent';