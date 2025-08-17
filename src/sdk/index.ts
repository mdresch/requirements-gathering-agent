/**
 * Requirements Gathering Agent SDK
 * 
 * Developer-friendly TypeScript SDK for easy integration and extension
 * of the Requirements Gathering Agent within existing technology stacks.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2025
 * 
 * Key Features:
 * - Simple, intuitive API for document generation
 * - AI-powered content analysis and creation
 * - PMBOK compliance validation
 * - Template management and customization
 * - Multi-provider AI integration
 * - Extensible plugin architecture
 * 
 * @example
 * ```typescript
 * import { RequirementsGatheringAgent } from '@requirements-gathering-agent/sdk';
 * 
 * const agent = new RequirementsGatheringAgent({
 *   aiProvider: 'google-ai',
 *   apiKey: 'your-api-key'
 * });
 * 
 * const result = await agent.generateProjectCharter({
 *   projectName: 'My Project',
 *   businessProblem: 'Need to automate manual processes',
 *   technologyStack: ['React', 'Node.js', 'PostgreSQL']
 * });
 * ```
 */

// Core SDK exports
export { RequirementsGatheringAgent } from './RequirementsGatheringAgent.js';
export { DocumentGenerationClient } from './DocumentGenerationClient.js';
export { AIProcessingClient } from './AIProcessingClient.js';
export { TemplateManagementClient } from './TemplateManagementClient.js';
export { ProjectAnalysisClient } from './ProjectAnalysisClient.js';
export { ValidationClient } from './ValidationClient.js';
export { IntegrationClient } from './IntegrationClient.js';

// Configuration and utilities
export { SDKConfiguration } from './configuration/SDKConfiguration.js';
export { PluginManager } from './plugins/PluginManager.js';
export * from './utilities/index.js';

// Type definitions
export * from './types/index.js';

// Error classes
export * from './errors/index.js';

// Constants
export * from './constants.js';

// Version information
export const SDK_VERSION = '2.1.3';
export const SDK_NAME = 'requirements-gathering-agent-sdk';