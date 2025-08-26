/**
 * Commands Module Index
 * Exports all command handlers for the CLI
 */

export { handleStatusCommand } from './status.js';
export type { StatusCommandOptions } from './status.js';

export { handleAnalyzeCommand } from './analyze.js';

export { handleSetupCommand } from './setup.js';

export { 
  handleGenerateCommand,
  handleGenerateCategoryCommand,
  handleGenerateAllCommand,
  handleGenerateCoreAnalysisCommand,
  handleListTemplatesCommand
} from './generate.js';
export type { GenerateOptions } from '../types.js';
export type { 
  GenerateCategoryOptions,
  GenerateAllOptions,
  GenerateCoreOptions
} from './generate.js';

export { handleValidateCommand } from './validate.js';
export type { ValidateOptions } from './validate.js';

// Confluence commands
export {
  handleConfluenceInitCommand,
  handleConfluenceTestCommand,
  handleConfluencePublishCommand,
  handleConfluenceStatusCommand,
  handleConfluenceOAuth2LoginCommand,
  handleConfluenceOAuth2StatusCommand,
  handleConfluenceOAuth2DebugCommand
} from './confluence.js';
export type {
  ConfluenceInitOptions,
  ConfluenceTestOptions,
  ConfluencePublishOptions,
  ConfluenceStatusOptions,
  ConfluenceOAuth2Options
} from './confluence.js';

// SharePoint commands
export {
  handleSharePointInitCommand,
  handleSharePointTestCommand,
  handleSharePointPublishCommand,
  handleSharePointStatusCommand,
  handleSharePointOAuth2LoginCommand,
  handleSharePointOAuth2StatusCommand,
  handleSharePointOAuth2DebugCommand
} from './sharepoint.js';
export type {
  SharePointInitOptions,
  SharePointTestOptions,
  SharePointPublishOptions,
  SharePointStatusOptions,
  SharePointOAuth2Options
} from './sharepoint.js';

// VCS commands
export {
  handleVcsInitCommand,
  handleVcsStatusCommand,
  handleVcsCommitCommand,
  handleVcsPushCommand
} from './vcs.js';
export type {
  VcsInitOptions,
  VcsStatusOptions,
  VcsCommitOptions,
  VcsPushOptions
} from './vcs.js';

// Business Analysis commands
export {
  handleInterviewQuestionsCommand,
  handleWorkshopPlanCommand,
  handleRequirementsExtractionCommand,
  handleProcessModelCommand,
  handleUseCaseModelCommand,
  handleBusinessRulesCommand,
  handleImpactAnalysisCommand,
  handleQualityAssessmentCommand,
  handleConsistencyValidationCommand,
  handleQualityMetricsCommand,
  displayBusinessAnalysisHelp
} from './business-analysis.js';
export type {
  BusinessAnalysisOptions,
  ElicitationOptions,
  AnalysisOptions,
  QualityOptions
} from './business-analysis.js';
// Feedback commands
export { createFeedbackCommand } from './feedback.js';
// Prompts commands
export { promptsCommand } from './prompts.js';
// Risk and Compliance commands
export { createRiskComplianceCommand } from './risk-compliance.js';

// Stakeholder Analysis commands
export {
  handleStakeholderAnalysisCommand,
  handleStakeholderRegisterCommand,
  handleStakeholderEngagementPlanCommand,
  handleStakeholderAutomationCommand,
  displayStakeholderHelp
} from './stakeholder.js';
export type { StakeholderAnalysisOptions } from './stakeholder.js';

// Interactive CLI commands
export { 
  handleInteractiveCommand,
  showInteractiveHelp,
  validateInteractiveOptions,
  getDefaultInteractiveOptions,
  checkInteractiveSupport,
  showInteractiveNotSupportedMessage
} from './interactive.js';
export type { InteractiveOptions } from './interactive.js';

// User Stories commands
export {
  handleStrategicPlanningCommand,
  handleRequirementsGenerationCommand,
  handleTechnologyAnalysisCommand,
  handleRiskManagementCommand,
  handleComprehensiveAnalysisCommand
} from './user-stories.js';
export type { UserStoryOptions } from './user-stories.js';

// Utility exports
export { ValidationError } from './utils/validation.js';
export { SimpleSpinner } from './utils/common.js';
