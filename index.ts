// Requirements Gathering Agent - Main Export Module
// This module provides programmatic access to the PMBOK documentation generation capabilities

// Re-export main functions from LLM processor module for external use
export { 
  getAiSummaryAndGoals,
  getAiUserStories,
  getAiPersonas,
  getAiAcceptanceCriteria,
  getAiStrategicStatements,
  getAiCoreValuesAndPurpose,
  getAiKeyRolesAndNeeds,
  getAiTechStackAnalysis,
  getAiDataModelSuggestions,
  getAiProcessFlowSuggestions,
  getAiRiskAnalysis,
  getAiComplianceConsiderations,
  getAiUiUxConsiderations,
  getAiProjectKickoffChecklist,
  // PMBOK functions
  getAiProjectCharter,
  getAiStakeholderRegister,
  getAiScopeManagementPlan,
  getAiRequirementsManagementPlan,
  getAiProjectScopeStatement,
  getAiWbs,
} from './src/modules/llmProcessor.js';

export { generateMarkdownFile } from './src/modules/documentGenerator.js';

// Export configuration interfaces
export interface RequirementsConfig {
  projectName: string;
  outputDir?: string;
  model?: string;
  endpoint?: string;
  token?: string;
}

export interface PMBOKConfig {
  projectName: string;
  outputDir?: string;
  model?: string;
  endpoint?: string;
  token?: string;
}

// Main entry point for programmatic usage
export class RequirementsAgent {
  private config: RequirementsConfig;

  constructor(config: RequirementsConfig) {
    this.config = config;
  }

  async generateProjectSummaryAndGoals(textContent: string): Promise<string | null> {
    const { getAiSummaryAndGoals } = await import('./src/modules/llmProcessor.js');
    return getAiSummaryAndGoals(textContent);
  }

  async generateUserStories(projectContext: string): Promise<string | null> {
    const { getAiUserStories } = await import('./src/modules/llmProcessor.js');
    return getAiUserStories(projectContext);
  }
  async generatePersonas(projectContext: string, userStoriesContent?: string | null): Promise<string | null> {
    const { getAiPersonas } = await import('./src/modules/llmProcessor.js');
    return getAiPersonas(projectContext, userStoriesContent);
  }

  async generateAcceptanceCriteria(userStoriesContent: string): Promise<string | null> {
    const { getAiAcceptanceCriteria } = await import('./src/modules/llmProcessor.js');
    return getAiAcceptanceCriteria(userStoriesContent);
  }

  async generateStrategicStatements(projectSummaryAndGoals: string): Promise<string | null> {
    const { getAiStrategicStatements } = await import('./src/modules/llmProcessor.js');
    return getAiStrategicStatements(projectSummaryAndGoals);
  }
  async generateTechStackAnalysis(packageJsonData: Record<string, any>, projectSummary?: string | null): Promise<string | null> {
    const { getAiTechStackAnalysis } = await import('./src/modules/llmProcessor.js');
    return getAiTechStackAnalysis(packageJsonData, projectSummary);
  }

  async generateRiskAnalysis(projectContext: string, techStackAnalysis?: string | null, dataModelSuggestions?: string | null, processFlows?: string | null): Promise<string | null> {
    const { getAiRiskAnalysis } = await import('./src/modules/llmProcessor.js');
    return getAiRiskAnalysis(projectContext, techStackAnalysis, dataModelSuggestions, processFlows);
  }

  async generateProjectCharter(contextBundle: any): Promise<string | null> {
    const { getAiProjectCharter } = await import('./src/modules/llmProcessor.js');
    return getAiProjectCharter(contextBundle);
  }

  async generateWBS(contextBundle: any): Promise<string | null> {
    const { getAiWbs } = await import('./src/modules/llmProcessor.js');
    return getAiWbs(contextBundle);
  }

  async generateStakeholderRegister(contextBundle: any): Promise<string | null> {
    const { getAiStakeholderRegister } = await import('./src/modules/llmProcessor.js');
    return getAiStakeholderRegister(contextBundle);
  }

  async generateScopeManagementPlan(contextBundle: any): Promise<string | null> {
    const { getAiScopeManagementPlan } = await import('./src/modules/llmProcessor.js');
    return getAiScopeManagementPlan(contextBundle);
  }

  async generateRequirementsManagementPlan(contextBundle: any): Promise<string | null> {
    const { getAiRequirementsManagementPlan } = await import('./src/modules/llmProcessor.js');
    return getAiRequirementsManagementPlan(contextBundle);
  }

  async generateProjectScopeStatement(contextBundle: any): Promise<string | null> {
    const { getAiProjectScopeStatement } = await import('./src/modules/llmProcessor.js');
    return getAiProjectScopeStatement(contextBundle);
  }
}

// Default export for convenience
export default RequirementsAgent;
