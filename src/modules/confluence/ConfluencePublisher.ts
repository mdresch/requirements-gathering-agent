/**
 * Confluence Publisher Module
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Handles publishing generated documents to Confluence Cloud
 * Features:
 * - API-based publishing to Confluence spaces
 * - OAuth 2.0 (3LO) and API token authentication
 * - Automatic page creation and updates
 * - Hierarchical document organization
 * - Metadata preservation and tagging
 * - Error handling and retry logic
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { ConfluenceOAuth2, OAuth2Config } from './ConfluenceOAuth2.js';

export interface ConfluenceConfig {
    // Authentication - OAuth 2.0 (preferred) or API token (legacy)
    authMethod: 'oauth2' | 'api-token';
    
    // For OAuth 2.0 authentication
    oauth2?: OAuth2Config;
    
    // For API token authentication (legacy)
    baseUrl?: string;         // e.g., 'https://your-domain.atlassian.net'
    email?: string;           // Your Atlassian account email
    apiToken?: string;        // API token from Atlassian
    
    // Common configuration
    spaceKey: string;         // Target Confluence space key
    parentPageId?: string;    // Optional parent page ID for organization
    cloudId?: string;         // Cloud ID for Confluence Cloud API
}

export interface ConfluencePage {
    id?: string;
    title: string;
    content: string;
    spaceKey: string;
    parentId?: string;
    labels?: string[];
    metadata?: Record<string, any>;
}

export interface PublishResult {
    success: boolean;
    pageId?: string;
    pageUrl?: string;
    error?: string;
    title: string;
}

/**
 * Main Confluence Publisher class
 * Handles all interactions with Confluence Cloud API
 */
export class ConfluencePublisher {
    private client: AxiosInstance = axios.create(); // Initialize with default client
    private config: ConfluenceConfig;
    private oauth2Handler?: ConfluenceOAuth2;

    constructor(config: ConfluenceConfig) {
        this.config = config;
        
        if (config.authMethod === 'oauth2') {
            if (!config.oauth2) {
                throw new Error('OAuth2 configuration is required when authMethod is oauth2');
            }
            this.oauth2Handler = new ConfluenceOAuth2(config.oauth2);
            // Initialize client asynchronously - will be set up during first API call
            this.client = this.createPlaceholderClient();
        } else {
            this.initializeApiTokenClient();
        }
    }

    /**
     * Create a placeholder client for OAuth2 initialization
     */
    private createPlaceholderClient(): AxiosInstance {
        return axios.create({
            baseURL: 'https://api.atlassian.com',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }

    /**
     * Initialize or refresh OAuth2 client
     */
    private async ensureOAuth2Client(): Promise<void> {
        if (!this.oauth2Handler) {
            throw new Error('OAuth2 handler not initialized');
        }

        // Check if we need to authenticate
        if (!this.oauth2Handler.isAuthorized()) {
            throw new Error('OAuth2 authentication required. Please run the OAuth2 login flow first.');
        }        // Get valid access token (handles refresh automatically)
        const accessToken = await this.oauth2Handler.getValidAccessToken();
        
        console.log('🔍 Debug - OAuth2 Token:');
        console.log('   Token length:', accessToken?.length || 'undefined');
        console.log('   Token start:', accessToken?.substring(0, 20) || 'undefined');        // Get accessible resources to find cloud ID if not set
        if (!this.config.cloudId) {
            const resources = await this.oauth2Handler.getAccessibleResources();
            const confluenceResource = resources.find(r => 
                r.scopes.some(scope => scope.includes(':confluence')) || // Check for any confluence-related scope
                r.scopes.includes('read:confluence-content.all') || 
                r.scopes.includes('read:confluence-space.summary') // Check for classic scopes
            );
            
            if (!confluenceResource) {
                throw new Error('No Confluence resources found. Please check your OAuth2 permissions and ensure your app is configured with Confluence API scopes.');
            }

            this.config.cloudId = confluenceResource.id;
        }        // Determine API endpoint based on scopes
        const hasGranularScopes = this.config.oauth2?.scopes?.includes('read:content:confluence') || 
                                  this.config.oauth2?.scopes?.includes('write:content:confluence');
        
        const baseURL = hasGranularScopes 
            ? `https://api.atlassian.com/ex/confluence/${this.config.cloudId}/v2`  // New API v2 for granular scopes
            : `${this.config.baseUrl}/wiki/rest/api`;  // Classic API for classic scopes

        // Create or update authenticated Axios client using OAuth 2.0 Bearer token
        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Atlassian-Token': 'nocheck'  // Add this header which might be required
            },
            timeout: 30000
        });
    }

    /**
     * Initialize client for API token authentication (legacy)
     */
    private initializeApiTokenClient(): void {
        if (!this.config.baseUrl || !this.config.email || !this.config.apiToken) {
            throw new Error('baseUrl, email, and apiToken are required for API token authentication');
        }

        const baseURL = this.config.cloudId && this.config.baseUrl === 'https://api.atlassian.com'
            ? `https://api.atlassian.com/ex/confluence/${this.config.cloudId}/rest/api`
            : `${this.config.baseUrl}/wiki/rest/api`;

        this.client = axios.create({
            baseURL,
            auth: {
                username: this.config.email,
                password: this.config.apiToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }    /**
     * Ensure client is properly configured before making API calls
     */
    private async ensureClient(): Promise<void> {
        if (this.config.authMethod === 'oauth2') {
            await this.ensureOAuth2Client();
        }
        // API token client is initialized in constructor
    }

    /**
     * Start OAuth2 authentication flow (for OAuth2 method)
     * @returns Promise with OAuth2 tokens
     */
    async startOAuth2Login(): Promise<{ success: boolean; tokens?: any; error?: string }> {
        if (this.config.authMethod !== 'oauth2' || !this.oauth2Handler) {
            return {
                success: false,
                error: 'OAuth2 authentication is not configured'
            };
        }

        try {
            const tokens = await this.oauth2Handler.startAuthorizationFlow();
            return {
                success: true,
                tokens
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }    /**
     * Check if OAuth2 is authorized
     * @returns Boolean indicating authorization status
     */
    isOAuth2Authorized(): boolean {
        if (this.config.authMethod !== 'oauth2' || !this.oauth2Handler) {
            return false;
        }
        return this.oauth2Handler.isAuthorized();
    }/**
     * Test connectivity to Confluence API
     * @returns Promise with connection status
     */
    async testConnection(): Promise<{ success: boolean; error?: string; userInfo?: any; cloudId?: string }> {
        try {            // Ensure client is properly configured
            await this.ensureClient();              console.log('🔍 Debug - Configuration:');
            console.log('   Auth Method:', this.config.authMethod);
            console.log('   Cloud ID:', this.config.cloudId);
            console.log('   Base URL:', this.client.defaults.baseURL);
            const authHeader = this.client.defaults.headers['Authorization'] || this.client.defaults.headers.common['Authorization'];
            console.log('   Authorization Header:', typeof authHeader === 'string' ? authHeader.substring(0, 20) + '...' : authHeader);
            console.log('   All Headers:', JSON.stringify(this.client.defaults.headers, null, 2));            // Test connection with spaces list endpoint to avoid specific space requirements
            const response = await this.client.get('/space', {
                params: {
                    limit: 10
                }
            });

            return {
                success: true,
                userInfo: { 
                    availableSpaces: response.data.results?.length || 0,
                    spaces: response.data.results?.map((space: any) => ({
                        key: space.key,
                        name: space.name,
                        type: space.type
                    })) || [],
                    configuredSpace: this.config.spaceKey
                },
                cloudId: this.config.cloudId
            };
        } catch (error: any) {
            console.log('🔍 Debug - Error details:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
            console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
            
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }/**
     * Get space information
     * @param spaceKey Space key to query
     * @returns Space information or null if not found
     */
    async getSpace(spaceKey?: string): Promise<any | null> {
        try {
            await this.ensureClient();
            
            const key = spaceKey || this.config.spaceKey;
            const response = await this.client.get(`/space/${key}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Create a new page in Confluence
     * @param page Page data to create
     * @returns Created page information
     */
    async createPage(page: ConfluencePage): Promise<PublishResult> {
        try {
            await this.ensureClient();
            
            const pageData = {
                type: 'page',
                title: page.title,
                space: {
                    key: page.spaceKey || this.config.spaceKey
                },
                body: {
                    storage: {
                        value: this.convertMarkdownToConfluence(page.content),
                        representation: 'storage'
                    }
                },
                ...(page.parentId && {
                    ancestors: [{ id: page.parentId }]
                })
            };

            const response = await this.client.post('/content', pageData);
            const createdPage = response.data;

            // Add labels if provided
            if (page.labels && page.labels.length > 0) {
                await this.addLabelsToPage(createdPage.id, page.labels);
            }

            // Generate page URL based on authentication method
            const pageUrl = this.generatePageUrl(createdPage._links.webui);

            return {
                success: true,
                pageId: createdPage.id,
                pageUrl,
                title: page.title
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                title: page.title
            };
        }
    }

    /**
     * Update an existing page in Confluence
     * @param pageId Page ID to update
     * @param page Updated page data
     * @returns Update result
     */
    async updatePage(pageId: string, page: ConfluencePage): Promise<PublishResult> {
        try {
            await this.ensureClient();
            
            // Get current page version
            const currentPage = await this.client.get(`/content/${pageId}`);
            const currentVersion = currentPage.data.version.number;

            const pageData = {
                type: 'page',
                title: page.title,
                body: {
                    storage: {
                        value: this.convertMarkdownToConfluence(page.content),
                        representation: 'storage'
                    }
                },
                version: {
                    number: currentVersion + 1
                }
            };

            const response = await this.client.put(`/content/${pageId}`, pageData);
            const updatedPage = response.data;

            // Update labels if provided
            if (page.labels && page.labels.length > 0) {
                await this.replaceLabelsOnPage(pageId, page.labels);
            }

            // Generate page URL based on authentication method
            const pageUrl = this.generatePageUrl(updatedPage._links.webui);

            return {
                success: true,
                pageId: updatedPage.id,
                pageUrl,
                title: page.title
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                title: page.title
            };
        }
    }

    /**
     * Find page by title in the configured space
     * @param title Page title to search for
     * @returns Page data or null if not found
     */
    async findPageByTitle(title: string): Promise<any | null> {
        try {
            await this.ensureClient();
            
            const response = await this.client.get('/content', {
                params: {
                    title: title,
                    spaceKey: this.config.spaceKey,
                    expand: 'version'
                }
            });

            const results = response.data.results;
            return results.length > 0 ? results[0] : null;

        } catch (error: any) {
            console.error('Error finding page:', error.message);
            return null;
        }
    }

    /**
     * Publish or update a page (create if doesn't exist, update if it does)
     * @param page Page data to publish
     * @returns Publish result
     */
    async publishPage(page: ConfluencePage): Promise<PublishResult> {
        try {
            // Check if page already exists
            const existingPage = await this.findPageByTitle(page.title);
            
            if (existingPage) {
                // Update existing page
                return await this.updatePage(existingPage.id, page);
            } else {
                // Create new page
                return await this.createPage(page);
            }

        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                title: page.title
            };
        }
    }

    /**
     * Publish multiple documents from a directory
     * @param documentsPath Path to generated documents
     * @param options Publishing options
     * @returns Array of publish results
     */
    async publishDocuments(
        documentsPath: string, 
        options: {
            parentPageTitle?: string;
            labelPrefix?: string;
            includeMetadata?: boolean;
        } = {}
    ): Promise<PublishResult[]> {
        const results: PublishResult[] = [];
        
        if (!existsSync(documentsPath)) {
            throw new Error(`Documents path does not exist: ${documentsPath}`);
        }

        // Get parent page ID if specified
        let parentPageId: string | undefined;
        if (options.parentPageTitle) {
            const parentPage = await this.findPageByTitle(options.parentPageTitle);
            parentPageId = parentPage?.id;
        }

        // Process markdown files in the directory
        const fs = await import('fs');
        const files = fs.readdirSync(documentsPath);
        
        for (const file of files) {
            if (file.endsWith('.md')) {
                const filePath = join(documentsPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                
                // Extract title from filename (remove .md extension)
                const title = file.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                
                // Prepare labels
                const labels = [];
                if (options.labelPrefix) {
                    labels.push(`${options.labelPrefix}-generated`);
                }
                labels.push('adpa-generated', 'auto-generated');

                const page: ConfluencePage = {
                    title: title,
                    content: content,
                    spaceKey: this.config.spaceKey,
                    parentId: parentPageId,
                    labels: labels
                };

                const result = await this.publishPage(page);
                results.push(result);

                // Add delay between requests to avoid rate limiting
                await this.delay(1000);
            }
        }

        return results;
    }

    /**
     * Add labels to a page
     * @param pageId Page ID
     * @param labels Array of label names
     */
    private async addLabelsToPage(pageId: string, labels: string[]): Promise<void> {
        try {
            for (const label of labels) {
                await this.client.post(`/content/${pageId}/label`, {
                    name: label
                });
            }
        } catch (error: any) {
            console.warn('Error adding labels:', error.message);
        }
    }

    /**
     * Replace all labels on a page
     * @param pageId Page ID
     * @param labels New labels array
     */
    private async replaceLabelsOnPage(pageId: string, labels: string[]): Promise<void> {
        try {
            // Get current labels
            const currentLabels = await this.client.get(`/content/${pageId}/label`);
            
            // Remove existing labels
            for (const label of currentLabels.data.results) {
                await this.client.delete(`/content/${pageId}/label/${label.name}`);
            }

            // Add new labels
            await this.addLabelsToPage(pageId, labels);

        } catch (error: any) {
            console.warn('Error replacing labels:', error.message);
        }
    }

    /**
     * Convert Markdown content to Confluence Storage Format
     * Basic conversion - can be enhanced for more complex formatting
     * @param markdown Markdown content
     * @returns Confluence storage format HTML
     */
    private convertMarkdownToConfluence(markdown: string): string {
        // Basic markdown to Confluence conversion
        let confluence = markdown;

        // Headers
        confluence = confluence.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        confluence = confluence.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        confluence = confluence.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Bold and italic
        confluence = confluence.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        confluence = confluence.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code blocks
        confluence = confluence.replace(/```([\s\S]*?)```/g, '<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[$1]]></ac:plain-text-body></ac:structured-macro>');
        
        // Inline code
        confluence = confluence.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Lists
        confluence = confluence.replace(/^\* (.*$)/gm, '<li>$1</li>');
        confluence = confluence.replace(/^- (.*$)/gm, '<li>$1</li>');
        confluence = confluence.replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');

        // Wrap lists in ul/ol tags
        confluence = confluence.replace(/(<li>.*?<\/li>)/gs, (match) => {
            return `<ul>${match}</ul>`;
        });

        // Line breaks
        confluence = confluence.replace(/\n\n/g, '<br/><br/>');
        confluence = confluence.replace(/\n/g, '<br/>');

        return confluence;
    }

    /**
     * Utility method to add delays between API calls
     * @param ms Milliseconds to delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }    /**
     * Generate page URL based on authentication method
     * @param webuiPath Web UI path from Confluence response
     * @returns Full page URL
     */
    private generatePageUrl(webuiPath: string): string {
        if (this.config.authMethod === 'oauth2' && this.config.cloudId) {
            // For OAuth2, construct URL using cloud ID
            const baseUrl = `https://api.atlassian.com/ex/confluence/${this.config.cloudId}`;
            return `${baseUrl}${webuiPath}`.replace('/rest/api', '');
        } else if (this.config.baseUrl) {
            // For API token, use the original base URL
            return `${this.config.baseUrl}/wiki${webuiPath}`;
        } else {
            // Fallback
            return webuiPath;
        }
    }

    /**
     * Get publishing statistics
     * @returns Statistics object
     */
    async getPublishingStats(): Promise<{
        totalPages: number;
        spaceInfo: any;
        lastUpdated: string;
    }> {
        try {
            await this.ensureClient();
            
            const spaceInfo = await this.getSpace();
            const response = await this.client.get('/content', {
                params: {
                    spaceKey: this.config.spaceKey,
                    limit: 1000
                }
            });

            return {
                totalPages: response.data.size,
                spaceInfo: spaceInfo,
                lastUpdated: new Date().toISOString()
            };

        } catch (error: any) {
            throw new Error(`Failed to get publishing stats: ${error.message}`);
        }
    }    /**
     * Detect if we need Cloud API and try to get Cloud ID automatically (legacy API token method)
     * @returns Promise with detection result
     */
    async detectAndConfigureCloudApi(): Promise<{ success: boolean; cloudId?: string; error?: string }> {
        try {
            // Only works for API token authentication
            if (this.config.authMethod !== 'api-token' || !this.config.baseUrl || !this.config.email || !this.config.apiToken) {
                return {
                    success: false,
                    error: 'Auto-detection only works with API token authentication'
                };
            }

            // First, try the traditional domain-based API
            const response = await this.client.get('/user/current');
            if (response.status === 200) {
                return { success: true };
            }

            // If traditional API fails, try to get Cloud ID
            if (this.config.baseUrl.includes('.atlassian.net')) {
                // Extract domain from baseUrl
                const domain = this.config.baseUrl.replace('https://', '').replace('.atlassian.net', '');
                
                // Try to get accessible resources using basic auth
                try {
                    const response = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
                        auth: {
                            username: this.config.email,
                            password: this.config.apiToken
                        },
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    // Find the matching site
                    const sites = response.data;
                    const matchingSite = sites.find((site: any) => 
                        site.url.includes(domain) || site.name.toLowerCase().includes(domain.toLowerCase())
                    );

                    if (matchingSite) {
                        // Update configuration to use Cloud API
                        this.config.cloudId = matchingSite.id;
                        
                        // Recreate client with Cloud API URL
                        this.client = axios.create({
                            baseURL: `https://api.atlassian.com/ex/confluence/${matchingSite.id}/rest/api`,
                            auth: {
                                username: this.config.email,
                                password: this.config.apiToken
                            },
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            timeout: 30000
                        });

                        return { 
                            success: true, 
                            cloudId: matchingSite.id 
                        };
                    }
                } catch (cloudError: any) {
                    // OAuth endpoint might not work with basic auth
                    return {
                        success: false,
                        error: `Cloud ID detection failed: ${cloudError.message}. You may need to configure OAuth 2.0 or provide the Cloud ID manually.`
                    };
                }
            }

            return {
                success: false,
                error: 'Could not detect Cloud ID automatically. Please configure OAuth 2.0 or provide Cloud ID manually.'
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * Factory function to create ConfluencePublisher instance
 * @param config Confluence configuration
 * @returns ConfluencePublisher instance
 */
export function createConfluencePublisher(config: ConfluenceConfig): ConfluencePublisher {
    return new ConfluencePublisher(config);
}

/**
 * Utility function to validate Confluence configuration
 * @param config Configuration to validate
 * @returns Validation result
 */
export function validateConfluenceConfig(config: Partial<ConfluenceConfig>): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!config.authMethod) {
        errors.push('authMethod is required (oauth2 or api-token)');
    } else if (!['oauth2', 'api-token'].includes(config.authMethod)) {
        errors.push('authMethod must be "oauth2" or "api-token"');
    }

    if (!config.spaceKey) {
        errors.push('spaceKey is required');
    }

    if (config.authMethod === 'oauth2') {
        if (!config.oauth2) {
            errors.push('oauth2 configuration is required when authMethod is oauth2');
        } else {
            if (!config.oauth2.clientId) {
                errors.push('oauth2.clientId is required');
            }
            if (!config.oauth2.clientSecret) {
                errors.push('oauth2.clientSecret is required');
            }
            if (!config.oauth2.redirectUri) {
                errors.push('oauth2.redirectUri is required');
            }
            if (!config.oauth2.scopes || config.oauth2.scopes.length === 0) {
                errors.push('oauth2.scopes is required');
            }
        }
    } else if (config.authMethod === 'api-token') {
        if (!config.baseUrl) {
            errors.push('baseUrl is required for API token authentication');
        } else if (!config.baseUrl.startsWith('https://')) {
            errors.push('baseUrl must be a valid HTTPS URL');
        }

        if (!config.email) {
            errors.push('email is required for API token authentication');
        } else if (!config.email.includes('@')) {
            errors.push('email must be a valid email address');
        }

        if (!config.apiToken) {
            errors.push('apiToken is required for API token authentication');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
