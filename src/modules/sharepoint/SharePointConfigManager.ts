/**
 * SharePoint Configuration Manager
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Manages SharePoint integration configuration, including environment variables,
 * configuration file management, and validation for enterprise deployments.
 * 
 * Features:
 * - Configuration file management with schema validation
 * - Environment variable integration and fallbacks
 * - Multi-tenant and authentication method support
 * - Configuration validation and health checks
 * - Secure credential handling recommendations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CONFIG_FILENAME } from '../../constants.js';
import { SharePointConfig } from './types.js';

export interface SharePointConfigFile {
    sharepoint?: {
        // Authentication Configuration
        authMethod: 'oauth2' | 'service-principal' | 'certificate';
        tenantId: string;
        clientId: string;
        
        // SharePoint Configuration
        siteUrl: string;
        documentLibrary: string;
        rootFolderPath?: string;
        
        // OAuth2 Configuration
        oauth2?: {
            redirectUri: string;
            scopes: string[];
            authority?: string;
        };
        
        // Publishing Options
        publishingOptions?: {
            enableVersioning?: boolean;
            createFolders?: boolean;
            overwriteExisting?: boolean;
            addMetadata?: boolean;
            maxConcurrency?: number;
        };
        
        // Default Tags and Metadata
        defaultTags?: string[];
        defaultMetadata?: Record<string, any>;
        
        // Retention and Compliance
        retentionDays?: number;
        enableAuditLog?: boolean;
    };
}

export interface ConfigurationStatus {
    configured: boolean;
    valid: boolean;
    errors: string[];
    warnings: string[];
    envVarsSet: string[];
    envVarsMissing: string[];
    recommendedScopes: string[];
}

/**
 * SharePoint Configuration Manager class
 */
export class SharePointConfigManager {
    private configPath: string;
    private config: SharePointConfigFile;

    constructor(configPath?: string) {
        this.configPath = configPath || join(process.cwd(), CONFIG_FILENAME);
        this.config = this.loadConfiguration();
    }

    /**
     * Initialize SharePoint configuration
     */
    async initializeConfiguration(): Promise<{ success: boolean; message: string; configPath: string }> {
        try {
            console.log('⚙️ Initializing SharePoint configuration...');
            
            // Load existing configuration or create new one
            let config = this.loadConfiguration();
            
            // Initialize SharePoint section if it doesn't exist
            if (!config.sharepoint) {
                config.sharepoint = {
                    authMethod: 'oauth2',
                    tenantId: process.env.SHAREPOINT_TENANT_ID || process.env.AZURE_TENANT_ID || '',
                    clientId: process.env.SHAREPOINT_CLIENT_ID || process.env.AZURE_CLIENT_ID || '',
                    siteUrl: process.env.SHAREPOINT_SITE_URL || '',
                    documentLibrary: process.env.SHAREPOINT_DOCUMENT_LIBRARY || 'Documents',
                    oauth2: {
                        redirectUri: process.env.SHAREPOINT_REDIRECT_URI || 'http://localhost:3000/auth/callback',
                        scopes: [
                            'https://graph.microsoft.com/Sites.ReadWrite.All',
                            'https://graph.microsoft.com/Files.ReadWrite.All',
                            'https://graph.microsoft.com/User.Read'
                        ]
                    },
                    publishingOptions: {
                        enableVersioning: true,
                        createFolders: true,
                        overwriteExisting: true,
                        addMetadata: true,
                        maxConcurrency: 3
                    },
                    defaultTags: [
                        'adpa-generated',
                        'project-management',
                        'documentation'
                    ]
                };
                
                // Save the updated configuration
                this.saveConfiguration(config);
                this.config = config;
                
                return {
                    success: true,
                    message: 'SharePoint configuration template created. Please update with your SharePoint details.',
                    configPath: this.configPath
                };
            }
            
            return {
                success: true,
                message: 'SharePoint configuration already exists.',
                configPath: this.configPath
            };
            
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to initialize configuration: ${error.message}`,
                configPath: this.configPath
            };
        }
    }

    /**
     * Get SharePoint configuration with environment variable fallbacks
     */
    getSharePointConfig(): SharePointConfig {
        const spConfig = this.config.sharepoint;
        
        if (!spConfig) {
            throw new Error('SharePoint configuration not found. Run sharepoint init first.');
        }

        // Build configuration with environment variable fallbacks
        const config: SharePointConfig = {
            authMethod: spConfig.authMethod,
            tenantId: process.env.SHAREPOINT_TENANT_ID || process.env.AZURE_TENANT_ID || spConfig.tenantId,
            clientId: process.env.SHAREPOINT_CLIENT_ID || process.env.AZURE_CLIENT_ID || spConfig.clientId,
            clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET,
            certificatePath: process.env.SHAREPOINT_CERTIFICATE_PATH,
            siteUrl: process.env.SHAREPOINT_SITE_URL || spConfig.siteUrl,
            documentLibrary: process.env.SHAREPOINT_DOCUMENT_LIBRARY || spConfig.documentLibrary,
            rootFolderPath: process.env.SHAREPOINT_ROOT_FOLDER || spConfig.rootFolderPath,
            enableVersioning: spConfig.publishingOptions?.enableVersioning,
            retentionDays: spConfig.retentionDays
        };

        // Add OAuth2 configuration if using OAuth2
        if (spConfig.authMethod === 'oauth2' && spConfig.oauth2) {
            config.oauth2 = {
                redirectUri: process.env.SHAREPOINT_REDIRECT_URI || spConfig.oauth2.redirectUri,
                scopes: spConfig.oauth2.scopes,
                authority: spConfig.oauth2.authority || `https://login.microsoftonline.com/${config.tenantId}`
            };
        }

        return config;
    }

    /**
     * Validate current configuration
     */
    validateConfiguration(): { valid: boolean; errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        const spConfig = this.config.sharepoint;
        
        if (!spConfig) {
            errors.push('SharePoint configuration section is missing');
            return { valid: false, errors, warnings };
        }

        // Required configuration checks
        if (!spConfig.tenantId && !process.env.SHAREPOINT_TENANT_ID && !process.env.AZURE_TENANT_ID) {
            errors.push('Tenant ID is required (set SHAREPOINT_TENANT_ID or configure in config file)');
        }

        if (!spConfig.clientId && !process.env.SHAREPOINT_CLIENT_ID && !process.env.AZURE_CLIENT_ID) {
            errors.push('Client ID is required (set SHAREPOINT_CLIENT_ID or configure in config file)');
        }

        if (!spConfig.siteUrl && !process.env.SHAREPOINT_SITE_URL) {
            errors.push('Site URL is required (set SHAREPOINT_SITE_URL or configure in config file)');
        }

        if (!spConfig.documentLibrary && !process.env.SHAREPOINT_DOCUMENT_LIBRARY) {
            errors.push('Document library name is required');
        }

        // Authentication method specific validation
        if (spConfig.authMethod === 'oauth2') {
            if (!spConfig.oauth2) {
                errors.push('OAuth2 configuration is required when using oauth2 auth method');
            } else {
                if (!spConfig.oauth2.redirectUri && !process.env.SHAREPOINT_REDIRECT_URI) {
                    errors.push('OAuth2 redirect URI is required');
                }
                
                if (!spConfig.oauth2.scopes || spConfig.oauth2.scopes.length === 0) {
                    errors.push('OAuth2 scopes are required');
                }
            }
        }

        if (spConfig.authMethod === 'service-principal') {
            if (!process.env.SHAREPOINT_CLIENT_SECRET && !process.env.AZURE_CLIENT_SECRET) {
                errors.push('Client secret is required for service principal authentication (set SHAREPOINT_CLIENT_SECRET)');
            }
        }

        if (spConfig.authMethod === 'certificate') {
            if (!process.env.SHAREPOINT_CERTIFICATE_PATH) {
                errors.push('Certificate path is required for certificate authentication (set SHAREPOINT_CERTIFICATE_PATH)');
            }
        }

        // Warnings for best practices
        if (spConfig.authMethod === 'oauth2' && !process.env.SHAREPOINT_CLIENT_SECRET) {
            warnings.push('Consider using service principal authentication for automated scenarios');
        }

        if (!spConfig.publishingOptions?.enableVersioning) {
            warnings.push('Document versioning is disabled - consider enabling for better document management');
        }

        if (!spConfig.defaultTags || spConfig.defaultTags.length === 0) {
            warnings.push('No default tags configured - consider adding tags for better document organization');
        }

        // URL validation
        if (spConfig.siteUrl || process.env.SHAREPOINT_SITE_URL) {
            const siteUrl = process.env.SHAREPOINT_SITE_URL || spConfig.siteUrl;
            try {
                const url = new URL(siteUrl);
                if (!url.hostname.includes('sharepoint.com')) {
                    warnings.push('Site URL should be a SharePoint Online URL (sharepoint.com domain)');
                }
            } catch {
                errors.push('Site URL is not a valid URL');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get configuration status for display
     */
    getConfigurationStatus(): ConfigurationStatus {
        const validation = this.validateConfiguration();
        const spConfig = this.config.sharepoint;

        // Check environment variables
        const envVarsToCheck = [
            'SHAREPOINT_TENANT_ID',
            'SHAREPOINT_CLIENT_ID',
            'SHAREPOINT_CLIENT_SECRET',
            'SHAREPOINT_SITE_URL',
            'SHAREPOINT_DOCUMENT_LIBRARY',
            'SHAREPOINT_REDIRECT_URI'
        ];

        const envVarsSet = envVarsToCheck.filter(varName => process.env[varName]);
        const envVarsMissing = envVarsToCheck.filter(varName => !process.env[varName]);

        // Recommended scopes based on configuration
        const recommendedScopes = [
            'https://graph.microsoft.com/Sites.ReadWrite.All',
            'https://graph.microsoft.com/Files.ReadWrite.All',
            'https://graph.microsoft.com/User.Read'
        ];

        if (spConfig?.publishingOptions?.addMetadata) {
            recommendedScopes.push('https://graph.microsoft.com/Sites.Manage.All');
        }

        return {
            configured: !!spConfig,
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings,
            envVarsSet,
            envVarsMissing,
            recommendedScopes
        };
    }

    /**
     * Get publishing options with defaults
     */
    getPublishingOptions(): NonNullable<SharePointConfigFile['sharepoint']>['publishingOptions'] {
        const options = this.config.sharepoint?.publishingOptions || {};
        
        return {
            enableVersioning: options.enableVersioning ?? true,
            createFolders: options.createFolders ?? true,
            overwriteExisting: options.overwriteExisting ?? true,
            addMetadata: options.addMetadata ?? true,
            maxConcurrency: options.maxConcurrency ?? 3
        };
    }

    /**
     * Get default tags for publishing
     */
    getDefaultTags(): string[] {
        const defaultTags = this.config.sharepoint?.defaultTags || [];
        
        // Always include ADPA-specific tags
        const adpaTags = ['adpa-generated', 'requirements-gathering', 'auto-generated'];
        
        return [...new Set([...defaultTags, ...adpaTags])];
    }

    /**
     * Get default metadata template
     */
    getDefaultMetadata(): Record<string, any> {
        return {
            GeneratedBy: 'ADPA v2.1.3',
            GeneratedDate: new Date().toISOString(),
            DocumentType: 'Project Documentation',
            ...this.config.sharepoint?.defaultMetadata
        };
    }

    /**
     * Update SharePoint configuration
     */
    updateConfiguration(updates: Partial<SharePointConfigFile['sharepoint']>): void {
        if (!this.config.sharepoint) {
            this.config.sharepoint = {
                authMethod: 'oauth2',
                tenantId: '',
                clientId: '',
                siteUrl: '',
                documentLibrary: 'Documents'
            };
        }

        // Merge updates with existing configuration
        this.config.sharepoint = {
            ...this.config.sharepoint,
            ...updates
        };

        this.saveConfiguration(this.config);
    }

    /**
     * Load configuration from file
     */
    private loadConfiguration(): SharePointConfigFile {
        try {
            if (existsSync(this.configPath)) {
                const configData = readFileSync(this.configPath, 'utf-8');
                return JSON.parse(configData);
            }
        } catch (error) {
            console.warn('⚠️ Could not load configuration file, using defaults');
        }
        
        return {};
    }

    /**
     * Save configuration to file
     */
    private saveConfiguration(config: SharePointConfigFile): void {
        try {
            const configData = JSON.stringify(config, null, 2);
            writeFileSync(this.configPath, configData, 'utf-8');
        } catch (error: any) {
            throw new Error(`Failed to save configuration: ${error.message}`);
        }
    }

    /**
     * Generate environment variables template
     */
    generateEnvTemplate(): string {
        return `
# SharePoint Integration Configuration
# Copy these values to your .env file and update with your actual values

# Required: Azure AD Configuration
SHAREPOINT_TENANT_ID=your-tenant-id-here
SHAREPOINT_CLIENT_ID=your-client-id-here

# Required for Service Principal auth (recommended for automation)
SHAREPOINT_CLIENT_SECRET=your-client-secret-here

# Required: SharePoint Site Configuration
SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/yoursite
SHAREPOINT_DOCUMENT_LIBRARY=Documents

# Optional: OAuth2 Configuration (for interactive auth)
SHAREPOINT_REDIRECT_URI=http://localhost:3000/auth/callback

# Optional: Advanced Configuration
SHAREPOINT_ROOT_FOLDER=ADPA-Generated-Documents
SHAREPOINT_CERTIFICATE_PATH=/path/to/certificate.pem

# Alternative: Use existing Azure environment variables
# AZURE_TENANT_ID=your-tenant-id-here
# AZURE_CLIENT_ID=your-client-id-here
# AZURE_CLIENT_SECRET=your-client-secret-here
        `.trim();
    }

    /**
     * Generate setup instructions
     */
    generateSetupInstructions(): string {
        return `
# SharePoint Integration Setup Instructions

## 1. Azure AD App Registration

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Click "New registration"
3. Name: "ADPA SharePoint Integration"
4. Supported account types: "Accounts in this organizational directory only"
5. Redirect URI: "Web" → "http://localhost:3000/auth/callback"
6. Click "Register"

## 2. Configure API Permissions

1. Go to "API permissions" in your app registration
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Delegated permissions" (for OAuth2) or "Application permissions" (for service principal)
5. Add these permissions:
   - Sites.ReadWrite.All
   - Files.ReadWrite.All
   - User.Read (for OAuth2 only)
6. Click "Grant admin consent"

## 3. Configure Authentication

### For OAuth2 (Interactive):
1. Go to "Authentication" → "Platform configurations"
2. Add "Web" platform with redirect URI: http://localhost:3000/auth/callback
3. Enable "Access tokens" and "ID tokens"

### For Service Principal (Automated):
1. Go to "Certificates & secrets"
2. Create a new client secret
3. Copy the secret value (you won't see it again!)

## 4. Environment Configuration

Create or update your .env file with the following variables:

${this.generateEnvTemplate()}

## 5. SharePoint Site Setup

1. Ensure you have access to the SharePoint site
2. Verify the document library exists (create if necessary)
3. Grant appropriate permissions to your app or service principal

## 6. Test the Connection

Run the following command to test your configuration:
\`\`\`bash
npm run sharepoint:test
\`\`\`

## 7. Start Publishing

Once configured, you can publish documents with:
\`\`\`bash
npm run sharepoint:publish
\`\`\`

For more information, see the SharePoint integration documentation.
        `.trim();
    }
}

/**
 * Factory function to create SharePointConfigManager instance
 */
export function createSharePointConfigManager(configPath?: string): SharePointConfigManager {
    return new SharePointConfigManager(configPath);
}
