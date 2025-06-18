/**
 * Confluence Configuration Manager
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Manages Confluence integration configuration
 * Features:
 * - Configuration validation and storage
 * - Environment variable support
 * - Secure credential handling
 * - Configuration templates and defaults
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ConfluenceConfig, validateConfluenceConfig } from './ConfluencePublisher.js';

export interface ConfluenceConfigFile {
    confluence?: {
        baseUrl?: string;
        email?: string;
        spaceKey?: string;
        parentPageId?: string;
        defaultLabels?: string[];
        publishingOptions?: {
            createParentPages?: boolean;
            updateExisting?: boolean;
            includeMetadata?: boolean;
            rateLimitDelay?: number;
        };
    };
}

/**
 * Configuration manager for Confluence integration
 */
export class ConfluenceConfigManager {
    private configPath: string;
    private config: ConfluenceConfigFile;

    constructor(configPath?: string) {
        this.configPath = configPath || join(process.cwd(), 'config-rga.json');
        this.config = this.loadConfig();
    }

    /**
     * Load configuration from file
     * @returns Configuration object
     */
    private loadConfig(): ConfluenceConfigFile {
        try {
            if (existsSync(this.configPath)) {
                const content = readFileSync(this.configPath, 'utf-8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.warn('Failed to load configuration file, using defaults');
        }
        return {};
    }

    /**
     * Save configuration to file
     */
    saveConfig(): void {
        try {
            const content = JSON.stringify(this.config, null, 2);
            writeFileSync(this.configPath, content, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to save configuration: ${error}`);
        }
    }

    /**
     * Get Confluence configuration with environment variable fallbacks
     * @returns Complete Confluence configuration
     */
    getConfluenceConfig(): ConfluenceConfig {
        const confluenceConfig = this.config.confluence || {};
        
        // Get configuration with environment variable fallbacks
        const config: ConfluenceConfig = {
            baseUrl: confluenceConfig.baseUrl || 
                     process.env.CONFLUENCE_BASE_URL || 
                     process.env.ATLASSIAN_BASE_URL || '',
            email: confluenceConfig.email || 
                   process.env.CONFLUENCE_EMAIL || 
                   process.env.ATLASSIAN_EMAIL || '',
            apiToken: process.env.CONFLUENCE_API_TOKEN || 
                      process.env.ATLASSIAN_API_TOKEN || '',
            spaceKey: confluenceConfig.spaceKey || 
                      process.env.CONFLUENCE_SPACE_KEY || '',
            parentPageId: confluenceConfig.parentPageId || 
                          process.env.CONFLUENCE_PARENT_PAGE_ID
        };

        return config;
    }

    /**
     * Validate current Confluence configuration
     * @returns Validation result
     */
    validateConfiguration(): { valid: boolean; errors: string[]; warnings: string[] } {
        const config = this.getConfluenceConfig();
        const validation = validateConfluenceConfig(config);
        const warnings: string[] = [];

        // Add warnings for missing optional settings
        if (!config.parentPageId) {
            warnings.push('No parent page ID specified - pages will be created at root level');
        }

        if (!this.config.confluence?.defaultLabels?.length) {
            warnings.push('No default labels configured - pages will have minimal tagging');
        }

        return {
            valid: validation.valid,
            errors: validation.errors,
            warnings
        };
    }

    /**
     * Update Confluence configuration
     * @param updates Configuration updates
     */
    updateConfluenceConfig(updates: Partial<ConfluenceConfig>): void {
        if (!this.config.confluence) {
            this.config.confluence = {};
        }

        // Update non-sensitive fields only (API token handled via env vars)
        if (updates.baseUrl) this.config.confluence.baseUrl = updates.baseUrl;
        if (updates.email) this.config.confluence.email = updates.email;
        if (updates.spaceKey) this.config.confluence.spaceKey = updates.spaceKey;
        if (updates.parentPageId) this.config.confluence.parentPageId = updates.parentPageId;
    }

    /**
     * Set default labels for published documents
     * @param labels Array of default labels
     */
    setDefaultLabels(labels: string[]): void {
        if (!this.config.confluence) {
            this.config.confluence = {};
        }
        this.config.confluence.defaultLabels = labels;
    }

    /**
     * Update publishing options
     * @param options Publishing options
     */
    updatePublishingOptions(options: NonNullable<ConfluenceConfigFile['confluence']>['publishingOptions']): void {
        if (!this.config.confluence) {
            this.config.confluence = {};
        }
        this.config.confluence.publishingOptions = {
            ...this.config.confluence.publishingOptions,
            ...options
        };
    }

    /**
     * Get publishing options with defaults
     * @returns Publishing options
     */
    getPublishingOptions(): NonNullable<ConfluenceConfigFile['confluence']>['publishingOptions'] {
        const options = this.config.confluence?.publishingOptions || {};
        
        return {
            createParentPages: options.createParentPages ?? true,
            updateExisting: options.updateExisting ?? true,
            includeMetadata: options.includeMetadata ?? true,
            rateLimitDelay: options.rateLimitDelay ?? 1000
        };
    }

    /**
     * Get default labels for publishing
     * @returns Array of default labels
     */
    getDefaultLabels(): string[] {
        const defaultLabels = this.config.confluence?.defaultLabels || [];
        
        // Always include ADPA-specific labels
        const adpaLabels = ['adpa-generated', 'requirements-gathering', 'auto-generated'];
        
        return [...new Set([...defaultLabels, ...adpaLabels])];
    }

    /**
     * Create a configuration template for Confluence integration setup
     * @returns Configuration template
     */
    createConfigurationTemplate(): ConfluenceConfigFile {
        return {
            confluence: {
                baseUrl: "https://your-domain.atlassian.net",
                email: "your-email@domain.com",
                spaceKey: "YOURSPACE",
                parentPageId: "",
                defaultLabels: [
                    "project-management",
                    "requirements",
                    "documentation"
                ],
                publishingOptions: {
                    createParentPages: true,
                    updateExisting: true,
                    includeMetadata: true,
                    rateLimitDelay: 1000
                }
            }
        };
    }

    /**
     * Initialize Confluence configuration with guided setup
     * @param interactive Whether to run interactive setup
     * @returns Setup result
     */
    async initializeConfiguration(interactive: boolean = false): Promise<{
        success: boolean;
        message: string;
        configPath?: string;
    }> {
        try {
            // Check if configuration already exists
            const validation = this.validateConfiguration();
            
            if (validation.valid) {
                return {
                    success: true,
                    message: 'Confluence configuration is already valid and complete',
                    configPath: this.configPath
                };
            }

            // Create template configuration
            const template = this.createConfigurationTemplate();
            
            if (!this.config.confluence) {
                this.config.confluence = template.confluence;
                this.saveConfig();
            }

            return {
                success: true,
                message: `Configuration template created at ${this.configPath}. Please update with your Confluence details and set environment variables for API token.`,
                configPath: this.configPath
            };

        } catch (error: any) {
            return {
                success: false,
                message: `Failed to initialize configuration: ${error.message}`
            };
        }
    }

    /**
     * Get environment variable setup instructions
     * @returns Setup instructions
     */
    getEnvironmentSetupInstructions(): string {
        return `
Environment Variables Setup for Confluence Integration:

Required Environment Variables:
- CONFLUENCE_API_TOKEN or ATLASSIAN_API_TOKEN: Your Atlassian API token

Optional Environment Variables (if not set in config file):
- CONFLUENCE_BASE_URL: Your Confluence base URL (e.g., https://your-domain.atlassian.net)
- CONFLUENCE_EMAIL: Your Atlassian account email
- CONFLUENCE_SPACE_KEY: Target Confluence space key
- CONFLUENCE_PARENT_PAGE_ID: Parent page ID for organization

Windows PowerShell:
$env:CONFLUENCE_API_TOKEN="your-api-token"
$env:CONFLUENCE_BASE_URL="https://your-domain.atlassian.net"
$env:CONFLUENCE_EMAIL="your-email@domain.com"
$env:CONFLUENCE_SPACE_KEY="YOURSPACE"

Linux/macOS:
export CONFLUENCE_API_TOKEN="your-api-token"
export CONFLUENCE_BASE_URL="https://your-domain.atlassian.net"
export CONFLUENCE_EMAIL="your-email@domain.com"
export CONFLUENCE_SPACE_KEY="YOURSPACE"

For persistent setup, add these to your shell profile or .env file.
        `.trim();
    }

    /**
     * Display current configuration status
     * @returns Configuration status report
     */
    getConfigurationStatus(): {
        configured: boolean;
        valid: boolean;
        errors: string[];
        warnings: string[];
        envVarsSet: string[];
        envVarsMissing: string[];
    } {
        const validation = this.validateConfiguration();
        
        // Check environment variables
        const envVars = [
            'CONFLUENCE_API_TOKEN',
            'ATLASSIAN_API_TOKEN',
            'CONFLUENCE_BASE_URL',
            'CONFLUENCE_EMAIL',
            'CONFLUENCE_SPACE_KEY'
        ];
        
        const envVarsSet = envVars.filter(envVar => process.env[envVar]);
        const envVarsMissing = envVars.filter(envVar => !process.env[envVar]);
        
        return {
            configured: !!this.config.confluence,
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings,
            envVarsSet,
            envVarsMissing
        };
    }
}

/**
 * Factory function to create ConfluenceConfigManager
 * @param configPath Optional config file path
 * @returns ConfluenceConfigManager instance
 */
export function createConfluenceConfigManager(configPath?: string): ConfluenceConfigManager {
    return new ConfluenceConfigManager(configPath);
}
