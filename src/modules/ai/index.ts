/**
 * AI Module Entry Point for Requirements Gathering Agent
 * 
 * Central export hub for all AI-related functionality including processors,
 * client managers, configuration, and type definitions.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Clean modular exports for AI functionality
 * - Centralized access to all AI components
 * - Type-safe imports and exports
 * - Organized module structure
 * - Easy consumption by other modules
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\index.ts
 */

export { ConfigurationManager } from './ConfigurationManager.js';
export { MetricsManager } from './MetricsManager.js';
export { AIClientManager } from './AIClientManager.js';
export { AIProcessor } from './AIProcessor.js';
export { RetryManager } from './RetryManager.js';

// Main processor exports
export * from './processors/index.js';
export * from './types.js';
