/**
 * Confluence Integration Module
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Complete Confluence integration for publishing generated documents
 * 
 * Features:
 * - Confluence Cloud API integration
 * - Automatic page creation and updates
 * - Configuration management
 * - CLI commands for testing and publishing
 * - Markdown to Confluence conversion
 * - Hierarchical document organization
 * - Metadata and tagging support
 */

// Core Publisher
export {
    ConfluencePublisher,
    createConfluencePublisher,
    validateConfluenceConfig,
    type ConfluenceConfig,
    type ConfluencePage,
    type PublishResult
} from './ConfluencePublisher.js';

// Configuration Management
export {
    ConfluenceConfigManager,
    createConfluenceConfigManager,
    type ConfluenceConfigFile
} from './ConfluenceConfigManager.js';

// CLI Commands
export {
    testConfluenceConnection,
    initConfluenceConfig,
    publishToConfluence,
    showConfluenceStatus
} from './ConfluenceCLI.js';

/**
 * Quick start function for Confluence integration
 * Provides a simple interface to get started with Confluence publishing
 */
export async function quickStartConfluence(): Promise<{
    success: boolean;
    message: string;
    nextSteps: string[];
}> {
    try {
        const { ConfluenceConfigManager } = await import('./ConfluenceConfigManager');
        const configManager = new ConfluenceConfigManager();
        
        // Initialize configuration
        const initResult = await configManager.initializeConfiguration();
        
        if (initResult.success) {
            const status = configManager.getConfigurationStatus();
            
            const nextSteps = [
                'Update config-rga.json with your Confluence details',
                'Set environment variables (especially CONFLUENCE_API_TOKEN)',
                'Run "npm run confluence:test" to verify connection',
                'Use "npm run confluence:publish" to publish documents'
            ];
            
            return {
                success: true,
                message: 'Confluence integration initialized successfully',
                nextSteps
            };
        } else {
            return {
                success: false,
                message: initResult.message,
                nextSteps: ['Check the error message and try again']
            };
        }
        
    } catch (error: any) {
        return {
            success: false,
            message: `Failed to initialize Confluence integration: ${error.message}`,
            nextSteps: ['Check your environment and try again']
        };
    }
}

/**
 * Confluence integration constants
 */
export const CONFLUENCE_CONSTANTS = {
    DEFAULT_LABELS: ['adpa-generated', 'requirements-gathering', 'auto-generated'],
    RATE_LIMIT_DELAY: 1000,
    MAX_RETRIES: 3,
    SUPPORTED_FORMATS: ['markdown', 'md'],
    CONFLUENCE_STORAGE_FORMAT: 'storage'
};

/**
 * Confluence integration version
 */
export const CONFLUENCE_VERSION = '2.1.3';
