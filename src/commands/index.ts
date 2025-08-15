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

// Utility exports
export { ValidationError } from './utils/validation.js';
export { SimpleSpinner } from './utils/common.js';
