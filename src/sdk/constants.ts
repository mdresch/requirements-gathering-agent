/**
 * SDK Constants
 * 
 * Centralized constants for the Requirements Gathering Agent SDK.
 * Provides configuration defaults, supported formats, and other constants.
 */

/**
 * SDK Version Information
 */
export const SDK_VERSION = '2.1.3';
export const SDK_NAME = 'requirements-gathering-agent-sdk';
export const API_VERSION = 'v1';

/**
 * Default Configuration Values
 */
export const DEFAULT_CONFIG = {
  AI_PROVIDER: 'google-ai',
  OUTPUT_DIRECTORY: './generated-docs',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  DEBUG: false
} as const;

/**
 * Supported Document Formats
 */
export const SUPPORTED_FORMATS = [
  'markdown',
  'pdf',
  'docx',
  'html'
] as const;

export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

/**
 * AI Provider Types
 */
export const AI_PROVIDERS = [
  'google-ai',
  'azure-openai',
  'azure-ai-studio',
  'github-ai',
  'ollama',
  'custom'
] as const;

export type AIProvider = typeof AI_PROVIDERS[number];

/**
 * Document Categories
 */
export const DOCUMENT_CATEGORIES = [
  'project-charter',
  'requirements',
  'scope-management',
  'risk-management',
  'stakeholder-management',
  'quality-management',
  'communication-management',
  'technical-analysis',
  'business-analysis',
  'custom'
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

/**
 * Integration Types
 */
export const INTEGRATION_TYPES = [
  'confluence',
  'sharepoint',
  'jira',
  'github',
  'azure-devops',
  'custom'
] as const;

export type IntegrationType = typeof INTEGRATION_TYPES[number];

/**
 * Validation Severity Levels
 */
export const VALIDATION_SEVERITIES = [
  'error',
  'warning',
  'info'
] as const;

export type ValidationSeverity = typeof VALIDATION_SEVERITIES[number];

/**
 * PMBOK Process Groups
 */
export const PMBOK_PROCESS_GROUPS = [
  'initiating',
  'planning',
  'executing',
  'monitoring',
  'closing'
] as const;

export type PMBOKProcessGroup = typeof PMBOK_PROCESS_GROUPS[number];

/**
 * PMBOK Knowledge Areas
 */
export const PMBOK_KNOWLEDGE_AREAS = [
  'integration',
  'scope',
  'schedule',
  'cost',
  'quality',
  'resource',
  'communication',
  'risk',
  'procurement',
  'stakeholder'
] as const;

export type PMBOKKnowledgeArea = typeof PMBOK_KNOWLEDGE_AREAS[number];

/**
 * Project Phases
 */
export const PROJECT_PHASES = [
  'initiation',
  'planning',
  'execution',
  'monitoring',
  'closing'
] as const;

export type ProjectPhase = typeof PROJECT_PHASES[number];

/**
 * Stakeholder Influence Levels
 */
export const INFLUENCE_LEVELS = [
  'low',
  'medium',
  'high'
] as const;

export type InfluenceLevel = typeof INFLUENCE_LEVELS[number];

/**
 * Risk Impact Levels
 */
export const RISK_IMPACT_LEVELS = [
  'very-low',
  'low',
  'medium',
  'high',
  'very-high'
] as const;

export type RiskImpactLevel = typeof RISK_IMPACT_LEVELS[number];

/**
 * Risk Probability Levels
 */
export const RISK_PROBABILITY_LEVELS = [
  'very-low',
  'low',
  'medium',
  'high',
  'very-high'
] as const;

export type RiskProbabilityLevel = typeof RISK_PROBABILITY_LEVELS[number];

/**
 * Constraint Types
 */
export const CONSTRAINT_TYPES = [
  'time',
  'budget',
  'scope',
  'quality',
  'resource',
  'regulatory',
  'technical',
  'business'
] as const;

export type ConstraintType = typeof CONSTRAINT_TYPES[number];

/**
 * Template Variable Types
 */
export const TEMPLATE_VARIABLE_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'array',
  'object'
] as const;

export type TemplateVariableType = typeof TEMPLATE_VARIABLE_TYPES[number];

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // SDK errors
  SDK_NOT_INITIALIZED: 'SDK_NOT_INITIALIZED',
  SDK_ALREADY_INITIALIZED: 'SDK_ALREADY_INITIALIZED',
  
  // Document generation errors
  DOCUMENT_GENERATION_ERROR: 'DOCUMENT_GENERATION_ERROR',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  TEMPLATE_VALIDATION_ERROR: 'TEMPLATE_VALIDATION_ERROR',
  
  // AI processing errors
  AI_PROCESSING_ERROR: 'AI_PROCESSING_ERROR',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_RATE_LIMIT_ERROR: 'AI_RATE_LIMIT_ERROR',
  
  // Integration errors
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // File system errors
  FILESYSTEM_ERROR: 'FILESYSTEM_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Plugin errors
  PLUGIN_ERROR: 'PLUGIN_ERROR',
  PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
  PLUGIN_DEPENDENCY_ERROR: 'PLUGIN_DEPENDENCY_ERROR',
  
  // Timeout and resource errors
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  RESOURCE_EXHAUSTION_ERROR: 'RESOURCE_EXHAUSTION_ERROR'
} as const;

/**
 * Default Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  DEFAULT: 30000,
  AI_REQUEST: 60000,
  FILE_OPERATION: 10000,
  NETWORK_REQUEST: 15000,
  VALIDATION: 20000,
  DOCUMENT_GENERATION: 120000
} as const;

/**
 * Rate Limits
 */
export const RATE_LIMITS = {
  AI_REQUESTS_PER_MINUTE: 60,
  API_REQUESTS_PER_MINUTE: 100,
  DOCUMENT_GENERATIONS_PER_HOUR: 50,
  VALIDATIONS_PER_MINUTE: 30
} as const;

/**
 * File Size Limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  TEMPLATE: 1 * 1024 * 1024,  // 1MB
  CONFIG: 100 * 1024,         // 100KB
  LOG: 50 * 1024 * 1024       // 50MB
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  PROJECT_NAME_MIN_LENGTH: 3,
  PROJECT_NAME_MAX_LENGTH: 100,
  BUSINESS_PROBLEM_MIN_LENGTH: 20,
  BUSINESS_PROBLEM_MAX_LENGTH: 2000,
  STAKEHOLDER_NAME_MIN_LENGTH: 2,
  STAKEHOLDER_NAME_MAX_LENGTH: 50,
  DOCUMENT_MIN_WORD_COUNT: 50,
  DOCUMENT_MAX_WORD_COUNT: 10000
} as const;

/**
 * Default Templates
 */
export const DEFAULT_TEMPLATES = {
  PROJECT_CHARTER: 'project-charter-default',
  STAKEHOLDER_REGISTER: 'stakeholder-register-default',
  RISK_MANAGEMENT_PLAN: 'risk-management-plan-default',
  SCOPE_MANAGEMENT_PLAN: 'scope-management-plan-default',
  QUALITY_MANAGEMENT_PLAN: 'quality-management-plan-default'
} as const;

/**
 * Environment Variable Names
 */
export const ENV_VARS = {
  // AI Provider Configuration
  GOOGLE_AI_API_KEY: 'GOOGLE_AI_API_KEY',
  AZURE_OPENAI_API_KEY: 'AZURE_OPENAI_API_KEY',
  AZURE_OPENAI_ENDPOINT: 'AZURE_OPENAI_ENDPOINT',
  GITHUB_TOKEN: 'GITHUB_TOKEN',
  OLLAMA_HOST: 'OLLAMA_HOST',
  
  // SDK Configuration
  RGA_AI_PROVIDER: 'RGA_AI_PROVIDER',
  RGA_API_KEY: 'RGA_API_KEY',
  RGA_ENDPOINT: 'RGA_ENDPOINT',
  RGA_OUTPUT_DIR: 'RGA_OUTPUT_DIR',
  RGA_DEBUG: 'RGA_DEBUG',
  RGA_TIMEOUT: 'RGA_TIMEOUT',
  RGA_MAX_RETRIES: 'RGA_MAX_RETRIES',
  
  // Integration Configuration
  CONFLUENCE_URL: 'CONFLUENCE_URL',
  CONFLUENCE_TOKEN: 'CONFLUENCE_TOKEN',
  CONFLUENCE_USERNAME: 'CONFLUENCE_USERNAME',
  CONFLUENCE_SPACE_KEY: 'CONFLUENCE_SPACE_KEY',
  
  SHAREPOINT_SITE_URL: 'SHAREPOINT_SITE_URL',
  SHAREPOINT_CLIENT_ID: 'SHAREPOINT_CLIENT_ID',
  SHAREPOINT_CLIENT_SECRET: 'SHAREPOINT_CLIENT_SECRET',
  SHAREPOINT_TENANT_ID: 'SHAREPOINT_TENANT_ID',
  SHAREPOINT_LIBRARY_NAME: 'SHAREPOINT_LIBRARY_NAME',
  
  JIRA_URL: 'JIRA_URL',
  JIRA_TOKEN: 'JIRA_TOKEN',
  JIRA_USERNAME: 'JIRA_USERNAME',
  JIRA_PROJECT_KEY: 'JIRA_PROJECT_KEY'
} as const;

/**
 * Plugin Hooks
 */
export const PLUGIN_HOOKS = [
  'beforeDocumentGeneration',
  'afterDocumentGeneration',
  'beforeValidation',
  'afterValidation',
  'beforePublish',
  'afterPublish',
  'beforeAnalysis',
  'afterAnalysis'
] as const;

export type PluginHook = typeof PLUGIN_HOOKS[number];

/**
 * Log Levels
 */
export const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'debug',
  'trace'
] as const;

export type LogLevel = typeof LOG_LEVELS[number];

/**
 * Cache Keys
 */
export const CACHE_KEYS = {
  AI_RESPONSES: 'ai_responses',
  TEMPLATES: 'templates',
  VALIDATION_RESULTS: 'validation_results',
  PROJECT_ANALYSIS: 'project_analysis',
  INTEGRATION_STATUS: 'integration_status'
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  AI_RESPONSES: 3600,      // 1 hour
  TEMPLATES: 86400,        // 24 hours
  VALIDATION_RESULTS: 1800, // 30 minutes
  PROJECT_ANALYSIS: 7200,   // 2 hours
  INTEGRATION_STATUS: 300   // 5 minutes
} as const;

/**
 * Regex Patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SEMANTIC_VERSION: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  MARKDOWN_HEADING: /^(#+)\s+(.+)$/,
  TEMPLATE_VARIABLE: /\{\{(\w+)\}\}/g,
  PLACEHOLDER_TEXT: /\[(placeholder|todo|tbd|insert[^\]]*)\]/gi
} as const;

/**
 * MIME Types
 */
export const MIME_TYPES = {
  MARKDOWN: 'text/markdown',
  HTML: 'text/html',
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JSON: 'application/json',
  XML: 'application/xml',
  PLAIN_TEXT: 'text/plain'
} as const;

/**
 * File Extensions
 */
export const FILE_EXTENSIONS = {
  MARKDOWN: '.md',
  HTML: '.html',
  PDF: '.pdf',
  DOCX: '.docx',
  JSON: '.json',
  XML: '.xml',
  TEXT: '.txt'
} as const;