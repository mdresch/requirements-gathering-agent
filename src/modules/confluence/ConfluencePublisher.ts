/**
 * Confluence Publisher Module
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Handles publishing generated documents to Confluence Cloud
 * Features:
 * - API-based publishing to Confluence spaces
 * - Automatic page creation and updates
 * - Hierarchical document organization
 * - Metadata preservation and tagging
 * - Error handling and retry logic
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface ConfluenceConfig {
    baseUrl: string;          // e.g., 'https://your-domain.atlassian.net'
    email: string;            // Your Atlassian account email
    apiToken: string;         // API token from Atlassian
    spaceKey: string;         // Target Confluence space key
    parentPageId?: string;    // Optional parent page ID for organization
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
    private client: AxiosInstance;
    private config: ConfluenceConfig;

    constructor(config: ConfluenceConfig) {
        this.config = config;
        
        // Create authenticated Axios client
        this.client = axios.create({
            baseURL: `${config.baseUrl}/wiki/rest/api`,
            auth: {
                username: config.email,
                password: config.apiToken
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
    }

    /**
     * Test connectivity to Confluence API
     * @returns Promise with connection status
     */
    async testConnection(): Promise<{ success: boolean; error?: string; userInfo?: any }> {
        try {
            const response = await this.client.get('/user/current');
            return {
                success: true,
                userInfo: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get space information
     * @param spaceKey Space key to query
     * @returns Space information or null if not found
     */
    async getSpace(spaceKey?: string): Promise<any | null> {
        try {
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

            return {
                success: true,
                pageId: createdPage.id,
                pageUrl: `${this.config.baseUrl}/wiki${createdPage._links.webui}`,
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

            return {
                success: true,
                pageId: updatedPage.id,
                pageUrl: `${this.config.baseUrl}/wiki${updatedPage._links.webui}`,
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
        const fs = require('fs');
        const files = fs.readdirSync(documentsPath);
        
        for (const file of files) {
            if (file.endsWith('.md')) {
                const filePath = join(documentsPath, file);
                const content = readFileSync(filePath, 'utf-8');
                
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

    if (!config.baseUrl) {
        errors.push('baseUrl is required');
    } else if (!config.baseUrl.startsWith('https://')) {
        errors.push('baseUrl must be a valid HTTPS URL');
    }

    if (!config.email) {
        errors.push('email is required');
    } else if (!config.email.includes('@')) {
        errors.push('email must be a valid email address');
    }

    if (!config.apiToken) {
        errors.push('apiToken is required');
    }

    if (!config.spaceKey) {
        errors.push('spaceKey is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
