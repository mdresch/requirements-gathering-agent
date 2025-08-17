/**
 * TypeScript Type Definitions for Requirements Gathering Agent SDK
 * 
 * Comprehensive type definitions for developer-friendly API consumption.
 * These types provide strong typing for all SDK functionality.
 */

// Core configuration types
export interface SDKConfig {
  /** AI provider configuration */
  aiProvider?: AIProviderType;
  /** API key for the selected AI provider */
  apiKey?: string;
  /** Custom endpoint URL (for self-hosted solutions) */
  endpoint?: string;
  /** Output directory for generated documents */
  outputDirectory?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retry attempts for failed requests */
  maxRetries?: number;
  /** Custom configuration for specific providers */
  providerConfig?: Record<string, any>;
}

// AI Provider types
export type AIProviderType = 
  | 'google-ai' 
  | 'azure-openai' 
  | 'azure-ai-studio' 
  | 'github-ai' 
  | 'ollama'
  | 'custom';

export interface AIProviderConfig {
  name: AIProviderType;
  model?: string;
  endpoint?: string;
  apiKey?: string;
  enabled: boolean;
  customHeaders?: Record<string, string>;
  rateLimits?: {
    requestsPerMinute?: number;
    tokensPerMinute?: number;
  };
}

// Project context types
export interface ProjectContext {
  /** Project name */
  projectName: string;
  /** Business problem description */
  businessProblem: string;
  /** Technology stack being used */
  technologyStack: string[];
  /** Additional context information */
  contextBundle?: string;
  /** Project stakeholders */
  stakeholders?: Stakeholder[];
  /** Project constraints */
  constraints?: ProjectConstraint[];
  /** Success criteria */
  successCriteria?: string[];
  /** Budget information */
  budget?: BudgetInfo;
  /** Timeline information */
  timeline?: TimelineInfo;
}

export interface Stakeholder {
  name: string;
  role: string;
  department?: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  contactInfo?: string;
}

export interface ProjectConstraint {
  type: 'time' | 'budget' | 'scope' | 'quality' | 'resource' | 'regulatory';
  description: string;
  impact: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface BudgetInfo {
  totalBudget?: number;
  currency?: string;
  breakdown?: BudgetBreakdown[];
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
  percentage?: number;
}

export interface TimelineInfo {
  startDate?: Date;
  endDate?: Date;
  phases?: ProjectPhase[];
  milestones?: Milestone[];
}

export interface ProjectPhase {
  name: string;
  startDate: Date;
  endDate: Date;
  deliverables: string[];
}

export interface Milestone {
  name: string;
  date: Date;
  description?: string;
  dependencies?: string[];
}

// Document generation types
export interface DocumentGenerationOptions {
  /** Document template to use */
  template?: string;
  /** Output format */
  format?: DocumentFormat;
  /** Include table of contents */
  includeTableOfContents?: boolean;
  /** Custom styling options */
  styling?: DocumentStyling;
  /** Validation options */
  validation?: ValidationOptions;
  /** Metadata to include */
  metadata?: DocumentMetadata;
}

export type DocumentFormat = 'markdown' | 'pdf' | 'docx' | 'html';

export interface DocumentStyling {
  theme?: 'default' | 'corporate' | 'minimal' | 'academic';
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: number;
  customCss?: string;
}

export interface ValidationOptions {
  enablePMBOKValidation?: boolean;
  enableGrammarCheck?: boolean;
  enableComplianceCheck?: boolean;
  customValidationRules?: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  pattern?: string;
  validator?: (content: string) => ValidationIssue[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
  suggestion?: string;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  createdAt?: Date;
  modifiedAt?: Date;
  version?: string;
  tags?: string[];
  customProperties?: Record<string, any>;
  pmbok?: PMBOKMetadata;
}

export interface PMBOKMetadata {
  phase?: 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closing';
  processGroup?: string;
  knowledgeArea?: string;
  deliverableType?: string;
}

// Document generation results
export interface DocumentGenerationResult {
  success: boolean;
  documentPath?: string;
  content?: string;
  metadata?: DocumentMetadata;
  validationResults?: ValidationResult[];
  warnings?: string[];
  errors?: string[];
  generationTime?: number;
  wordCount?: number;
  pageCount?: number;
}

export interface ValidationResult {
  documentPath: string;
  isValid: boolean;
  score?: number;
  issues: ValidationIssue[];
  summary?: ValidationSummary;
}

export interface ValidationSummary {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  complianceScore?: number;
  recommendations?: string[];
}

// Template management types
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  content: string;
  variables?: TemplateVariable[];
  metadata?: TemplateMetadata;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags?: string[];
}

export type TemplateCategory = 
  | 'project-charter'
  | 'requirements'
  | 'scope-management'
  | 'risk-management'
  | 'stakeholder-management'
  | 'quality-management'
  | 'communication-management'
  | 'technical-analysis'
  | 'business-analysis'
  | 'custom';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: TemplateVariableValidation;
}

export interface TemplateVariableValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

export interface TemplateMetadata {
  pmbok?: PMBOKMetadata;
  complexity?: 'simple' | 'medium' | 'complex';
  estimatedTime?: number;
  prerequisites?: string[];
  outputs?: string[];
}

// AI processing types
export interface AIAnalysisRequest {
  content: string;
  analysisType: AIAnalysisType;
  options?: AIAnalysisOptions;
}

export type AIAnalysisType = 
  | 'requirements-extraction'
  | 'stakeholder-analysis'
  | 'risk-assessment'
  | 'technical-analysis'
  | 'business-analysis'
  | 'compliance-check'
  | 'content-generation'
  | 'quality-assessment';

export interface AIAnalysisOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  customPrompt?: string;
  context?: string;
  outputFormat?: 'text' | 'json' | 'structured';
}

export interface AIAnalysisResult {
  success: boolean;
  analysisType: AIAnalysisType;
  result: any;
  confidence?: number;
  processingTime?: number;
  tokensUsed?: number;
  model?: string;
  warnings?: string[];
  errors?: string[];
}

// Integration types
export interface IntegrationConfig {
  type: IntegrationType;
  enabled: boolean;
  credentials: IntegrationCredentials;
  settings?: Record<string, any>;
}

export type IntegrationType = 'confluence' | 'sharepoint' | 'jira' | 'github' | 'azure-devops' | 'custom';

export interface IntegrationCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  customAuth?: Record<string, any>;
}

export interface PublishOptions {
  target: IntegrationType;
  destination?: string;
  metadata?: Record<string, any>;
  overwrite?: boolean;
  createBackup?: boolean;
  notifyStakeholders?: boolean;
}

export interface PublishResult {
  success: boolean;
  url?: string;
  id?: string;
  version?: string;
  publishedAt?: Date;
  warnings?: string[];
  errors?: string[];
}

// Plugin system types
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  hooks?: PluginHooks;
  config?: Record<string, any>;
}

export interface PluginHooks {
  beforeDocumentGeneration?: (context: ProjectContext, options: DocumentGenerationOptions) => Promise<void>;
  afterDocumentGeneration?: (result: DocumentGenerationResult) => Promise<void>;
  beforeValidation?: (content: string, options: ValidationOptions) => Promise<void>;
  afterValidation?: (result: ValidationResult) => Promise<void>;
  beforePublish?: (content: string, options: PublishOptions) => Promise<void>;
  afterPublish?: (result: PublishResult) => Promise<void>;
}

// Error types
export interface SDKError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

// Utility types
export interface ProgressCallback {
  (progress: ProgressInfo): void;
}

export interface ProgressInfo {
  stage: string;
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number;
}

// Batch processing types
export interface BatchProcessingOptions {
  maxConcurrency?: number;
  continueOnError?: boolean;
  progressCallback?: ProgressCallback;
  retryFailedItems?: boolean;
}

export interface BatchProcessingResult<T> {
  success: boolean;
  results: T[];
  successCount: number;
  failureCount: number;
  totalProcessingTime: number;
  errors?: BatchProcessingError[];
}

export interface BatchProcessingError {
  itemIndex: number;
  error: string;
  retryCount?: number;
}

// Search and filtering types
export interface SearchOptions {
  query?: string;
  category?: TemplateCategory;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
}

// Analytics and reporting types
export interface AnalyticsData {
  documentsGenerated: number;
  templatesUsed: Record<string, number>;
  aiProviderUsage: Record<string, number>;
  averageGenerationTime: number;
  validationScores: number[];
  errorRates: Record<string, number>;
  userActivity: UserActivityData[];
}

export interface UserActivityData {
  userId?: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Export all types for easy consumption
export type * from './core.js';
export type * from './documents.js';
export type * from './ai.js';
export type * from './templates.js';
export type * from './integrations.js';
export type * from './validation.js';
export type * from './plugins.js';