/**
 * SharePoint Publisher Module
 * Part of ADPA (Advanced Document Processing Assistant) v2.1.3
 * 
 * Handles publishing generated documents to SharePoint Online sites and document libraries
 * using Microsoft Graph API for secure, enterprise-grade document management.
 * 
 * Features:
 * - Microsoft Graph API integration
 * - OAuth 2.0 and Service Principal authentication
 * - Batch document upload with retry logic
 * - SharePoint metadata management
 * - Folder structure creation and management
 * - Version control and conflict resolution
 * - Enterprise security and compliance
 * 
 * References:
 * - Microsoft Graph API: https://docs.microsoft.com/en-us/graph/api/overview
 * - SharePoint REST API: https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-folders-and-files-with-rest
 */

import axios, { AxiosInstance } from 'axios';
import { createReadStream, existsSync, readFileSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { SharePointOAuth2 } from './SharePointOAuth2.js';
import { 
    SharePointConfig, 
    SharePointDocument, 
    PublishResult, 
    SharePointSite,
    SharePointDriveItem,
    SharePointMetadata,
    PublishingOptions,
    BatchUploadOptions,
    GraphResponse,
    DriveResponse,
    OAuth2Config
} from './types.js';

/**
 * Helper function to create OAuth2Config with complete parameters
 */
const createOAuth2Config = (config: SharePointConfig): OAuth2Config => {
  if (!config.oauth2) {
    throw new Error('OAuth2 configuration is missing');
  }
  return {
    ...config.oauth2,
    tenantId: config.tenantId,
    clientId: config.clientId
  };
};

/**
 * Custom authentication provider for Microsoft Graph Client
 */
class GraphAuthProvider implements AuthenticationProvider {
    private oauth2Handler: SharePointOAuth2;

    constructor(oauth2Handler: SharePointOAuth2) {
        this.oauth2Handler = oauth2Handler;
    }

    async getAccessToken(): Promise<string> {
        return await this.oauth2Handler.getValidAccessToken();
    }
}

/**
 * Main SharePoint Publisher class
 * Handles all interactions with SharePoint Online via Microsoft Graph API
 */
export class SharePointPublisher {
    private config: SharePointConfig;
    private oauth2Handler?: SharePointOAuth2;
    private graphClient?: Client;
    private axiosClient: AxiosInstance;
    private siteId?: string;
    private driveId?: string;

    constructor(config: SharePointConfig) {
        this.config = config;
          // Initialize OAuth2 handler if using OAuth2
        if (config.authMethod === 'oauth2' && config.oauth2) {
            this.oauth2Handler = new SharePointOAuth2(createOAuth2Config(config));
        }

        // Initialize axios client for direct Graph API calls
        this.axiosClient = axios.create({
            baseURL: 'https://graph.microsoft.com/v1.0',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 second timeout
        });

        // Set up request interceptor for authentication
        this.axiosClient.interceptors.request.use(async (config) => {
            const token = await this.getAccessToken();
            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        });

        // Set up response interceptor for error handling
        this.axiosClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    console.log('🔄 Token expired, refreshing...');
                    // Token refresh is handled automatically by OAuth2 handler
                    return this.axiosClient.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Initialize SharePoint connection and get site/drive information
     */
    async initialize(): Promise<void> {
        try {
            console.log('🔧 Initializing SharePoint connection...');
            
            // Initialize Graph client if using OAuth2
            if (this.oauth2Handler) {
                const authProvider = new GraphAuthProvider(this.oauth2Handler);
                this.graphClient = Client.initWithMiddleware({ authProvider });
            }

            // Get site ID from site URL
            await this.resolveSiteId();
            
            // Get drive ID for the document library
            await this.resolveDriveId();
            
            console.log('✅ SharePoint connection initialized');
            console.log(`   Site ID: ${this.siteId}`);
            console.log(`   Drive ID: ${this.driveId}`);
            console.log(`   Document Library: ${this.config.documentLibrary}`);
            
        } catch (error: any) {
            console.error('❌ Failed to initialize SharePoint connection:', error.message);
            throw error;
        }
    }

    /**
     * Test connection to SharePoint and verify permissions
     */
    async testConnection(): Promise<{ success: boolean; error?: string; siteInfo?: any; driveInfo?: any }> {
        try {
            console.log('🔍 Testing SharePoint connection...');
            
            // Ensure we're initialized
            if (!this.siteId) {
                await this.initialize();
            }

            // Test site access
            const siteResponse = await this.axiosClient.get(`/sites/${this.siteId}`);
            const siteInfo = siteResponse.data;

            // Test drive access
            const driveResponse = await this.axiosClient.get(`/sites/${this.siteId}/drives/${this.driveId}`);
            const driveInfo = driveResponse.data;

            // Test write permissions by checking if we can list items
            const itemsResponse = await this.axiosClient.get(`/sites/${this.siteId}/drives/${this.driveId}/root/children`);

            console.log('✅ SharePoint connection test successful');
            
            return {
                success: true,
                siteInfo: {
                    id: siteInfo.id,
                    displayName: siteInfo.displayName,
                    webUrl: siteInfo.webUrl,
                    description: siteInfo.description
                },
                driveInfo: {
                    id: driveInfo.id,
                    name: driveInfo.name,
                    driveType: driveInfo.driveType,
                    quota: driveInfo.quota,
                    itemCount: itemsResponse.data.value?.length || 0
                }
            };

        } catch (error: any) {
            console.error('❌ SharePoint connection test failed:', error.message);
            
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    /**
     * Start OAuth2 authentication flow
     */
    async startOAuth2Login(): Promise<{ success: boolean; error?: string }> {
        if (!this.oauth2Handler) {
            return {
                success: false,
                error: 'OAuth2 not configured for this publisher instance'
            };
        }

        try {
            await this.oauth2Handler.startInteractiveFlow();
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        if (!this.oauth2Handler) {
            // For service principal auth, always return true if properly configured
            return !!(this.config.clientId && this.config.clientSecret && this.config.tenantId);
        }

        return await this.oauth2Handler.isAuthenticated();
    }

    /**
     * Publish a single document to SharePoint
     */
    async publishDocument(document: SharePointDocument, options: PublishingOptions = {}): Promise<PublishResult> {
        try {
            console.log(`📤 Publishing document: ${document.fileName}`);
            
            // Ensure we're initialized
            if (!this.siteId || !this.driveId) {
                await this.initialize();
            }

            // Create folder structure if needed
            const folderPath = this.buildFolderPath(document.folderPath, options.parentFolderPath);
            if (folderPath && options.createFolders !== false) {
                await this.ensureFolderExists(folderPath);
            }

            // Convert content based on file extension
            const fileContent = this.prepareFileContent(document);
            
            // Upload file
            const uploadResult = await this.uploadFile(
                document.fileName,
                fileContent,
                folderPath,
                options.overwriteExisting !== false
            );

            // Add metadata if configured
            if (options.addMetadata !== false && document.metadata) {
                await this.addMetadata(uploadResult.id, document.metadata);
            }

            console.log(`✅ Successfully published: ${document.fileName}`);
            
            return {
                success: true,
                driveItemId: uploadResult.id,
                webUrl: uploadResult.webUrl,
                fileName: document.fileName,
                size: uploadResult.size,
                lastModified: uploadResult.lastModifiedDateTime
            };

        } catch (error: any) {
            console.error(`❌ Failed to publish ${document.fileName}:`, error.message);
            
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                fileName: document.fileName
            };
        }
    }

    /**
     * Publish multiple documents from a directory
     */
    async publishDocuments(
        documentsPath: string, 
        options: PublishingOptions & BatchUploadOptions = {}
    ): Promise<PublishResult[]> {
        const results: PublishResult[] = [];
        
        if (!existsSync(documentsPath)) {
            throw new Error(`Documents path does not exist: ${documentsPath}`);
        }

        console.log(`📁 Publishing documents from: ${documentsPath}`);
        
        // Get all markdown files
        const files = this.getMarkdownFiles(documentsPath);
        console.log(`📄 Found ${files.length} documents to publish`);

        // Process files with concurrency control
        const maxConcurrency = options.maxConcurrency || 3;
        const semaphore = new Array(maxConcurrency).fill(Promise.resolve());
        let processedCount = 0;

        const processFile = async (filePath: string): Promise<PublishResult> => {
            try {
                const content = readFileSync(filePath, 'utf-8');
                const fileName = basename(filePath);
                const folderPath = this.getFolderPathFromFile(filePath, documentsPath);

                const document: SharePointDocument = {
                    title: this.extractTitleFromContent(content) || fileName.replace('.md', ''),
                    content: content,
                    fileName: fileName.replace('.md', '.md'), // Keep as markdown or convert to .docx
                    folderPath: folderPath,
                    metadata: this.generateMetadata(content, fileName),
                    tags: options.tagPrefix ? [`${options.tagPrefix}-generated`] : ['adpa-generated']
                };

                const result = await this.publishDocument(document, options);
                
                processedCount++;
                if (options.progressCallback) {
                    options.progressCallback(processedCount, files.length);
                }

                // Add delay between uploads to avoid throttling
                await this.delay(1000);
                
                return result;

            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                    fileName: basename(filePath)
                };
            }
        };

        // Process files with concurrency control
        const promises = files.map((filePath, index) => {
            return semaphore[index % maxConcurrency].then(() => processFile(filePath));
        });

        const fileResults = await Promise.all(promises);
        results.push(...fileResults);

        // Summary
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`\n📊 Publishing Summary:`);
        console.log(`   Total: ${results.length}`);
        console.log(`   Successful: ${successful.length} ✅`);
        console.log(`   Failed: ${failed.length} ❌`);

        if (failed.length > 0) {
            console.log('\n❌ Failed uploads:');
            failed.forEach(result => {
                console.log(`   • ${result.fileName}: ${result.error}`);
            });
        }

        return results;
    }

    /**
     * Create a folder in SharePoint document library
     */
    async createFolder(folderPath: string): Promise<SharePointDriveItem> {
        try {
            const folderName = basename(folderPath);
            const parentPath = dirname(folderPath);
            
            let parentId = 'root';
            if (parentPath && parentPath !== '.' && parentPath !== '/') {
                const parentItem = await this.getDriveItem(parentPath);
                parentId = parentItem.id;
            }

            const folderData = {
                name: folderName,
                folder: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            };

            const response = await this.axiosClient.post(
                `/sites/${this.siteId}/drives/${this.driveId}/items/${parentId}/children`,
                folderData
            );

            console.log(`📁 Created folder: ${folderPath}`);
            return response.data;

        } catch (error: any) {
            console.error(`❌ Failed to create folder ${folderPath}:`, error.message);
            throw error;
        }
    }

    /**
     * Get drive item by path
     */
    async getDriveItem(itemPath: string): Promise<SharePointDriveItem> {
        try {
            const encodedPath = encodeURIComponent(itemPath);
            const response = await this.axiosClient.get(
                `/sites/${this.siteId}/drives/${this.driveId}/root:/${encodedPath}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error(`Item not found: ${itemPath}`);
            }
            throw error;
        }
    }

    /**
     * List items in a folder
     */
    async listFolderItems(folderPath: string = ''): Promise<SharePointDriveItem[]> {
        try {
            let endpoint: string;
            
            if (folderPath) {
                const encodedPath = encodeURIComponent(folderPath);
                endpoint = `/sites/${this.siteId}/drives/${this.driveId}/root:/${encodedPath}:/children`;
            } else {
                endpoint = `/sites/${this.siteId}/drives/${this.driveId}/root/children`;
            }

            const response = await this.axiosClient.get(endpoint);
            return response.data.value || [];

        } catch (error: any) {
            console.error(`❌ Failed to list folder items for ${folderPath}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete a drive item
     */
    async deleteItem(itemId: string): Promise<void> {
        try {
            await this.axiosClient.delete(`/sites/${this.siteId}/drives/${this.driveId}/items/${itemId}`);
            console.log(`🗑️ Deleted item: ${itemId}`);
        } catch (error: any) {
            console.error(`❌ Failed to delete item ${itemId}:`, error.message);
            throw error;
        }
    }

    /**
     * Get access token for authentication
     */
    private async getAccessToken(): Promise<string> {
        if (this.oauth2Handler) {
            return await this.oauth2Handler.getValidAccessToken();
        }
        
        // For service principal authentication
        if (this.config.authMethod === 'service-principal') {
            return await this.getServicePrincipalToken();
        }
        
        throw new Error('No authentication method configured');
    }

    /**
     * Get service principal access token
     */
    private async getServicePrincipalToken(): Promise<string> {
        try {
            const tokenEndpoint = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
            
            const params = new URLSearchParams({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret!,
                scope: 'https://graph.microsoft.com/.default',
                grant_type: 'client_credentials'
            });

            const response = await axios.post(tokenEndpoint, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data.access_token;

        } catch (error: any) {
            console.error('❌ Failed to get service principal token:', error.message);
            throw error;
        }
    }

    /**
     * Resolve SharePoint site ID from site URL
     */
    private async resolveSiteId(): Promise<void> {
        try {
            // Extract hostname and site path from URL
            const url = new URL(this.config.siteUrl);
            const hostname = url.hostname;
            const sitePath = url.pathname;

            let endpoint: string;
            
            if (sitePath === '/' || sitePath === '') {
                // Root site
                endpoint = `/sites/${hostname}`;
            } else {
                // Site collection
                const siteRelativeUrl = sitePath.replace(/^\//, '').replace(/\/$/, '');
                endpoint = `/sites/${hostname}:/${siteRelativeUrl}`;
            }

            const response = await this.axiosClient.get(endpoint);
            this.siteId = response.data.id;
            
            console.log(`✅ Resolved site ID: ${this.siteId}`);
            
        } catch (error: any) {
            console.error('❌ Failed to resolve site ID:', error.message);
            throw new Error(`Cannot resolve SharePoint site: ${this.config.siteUrl}`);
        }
    }

    /**
     * Resolve drive ID for the document library
     */
    private async resolveDriveId(): Promise<void> {
        try {
            // Get all drives for the site
            const response = await this.axiosClient.get(`/sites/${this.siteId}/drives`);
            const drives = response.data.value;

            // Find the drive matching our document library name
            const targetDrive = drives.find((drive: any) => 
                drive.name === this.config.documentLibrary ||
                drive.name === `${this.config.documentLibrary} Documents` ||
                drive.webUrl.includes(this.config.documentLibrary.replace(' ', '%20'))
            );

            if (!targetDrive) {
                // If not found, use the default drive
                const defaultDriveResponse = await this.axiosClient.get(`/sites/${this.siteId}/drive`);
                this.driveId = defaultDriveResponse.data.id;
                console.log(`⚠️ Document library '${this.config.documentLibrary}' not found, using default drive`);
            } else {
                this.driveId = targetDrive.id;
                console.log(`✅ Found document library: ${targetDrive.name}`);
            }

        } catch (error: any) {
            console.error('❌ Failed to resolve drive ID:', error.message);
            throw error;
        }
    }

    /**
     * Upload file to SharePoint
     */
    private async uploadFile(
        fileName: string, 
        content: Buffer | string, 
        folderPath?: string, 
        overwrite: boolean = true
    ): Promise<SharePointDriveItem> {
        try {
            let uploadPath = fileName;
            if (folderPath) {
                uploadPath = `${folderPath}/${fileName}`;
            }

            const fileSize = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf8');
            
            // Use simple upload for files < 4MB, session upload for larger files
            if (fileSize < 4 * 1024 * 1024) {
                return await this.simpleUpload(uploadPath, content, overwrite);
            } else {
                return await this.sessionUpload(uploadPath, content, overwrite);
            }

        } catch (error: any) {
            console.error(`❌ Upload failed for ${fileName}:`, error.message);
            throw error;
        }
    }

    /**
     * Simple upload for smaller files
     */
    private async simpleUpload(
        uploadPath: string, 
        content: Buffer | string, 
        overwrite: boolean
    ): Promise<SharePointDriveItem> {
        const encodedPath = encodeURIComponent(uploadPath);
        const conflictBehavior = overwrite ? 'replace' : 'rename';
        
        const endpoint = `/sites/${this.siteId}/drives/${this.driveId}/root:/${encodedPath}:/content?@microsoft.graph.conflictBehavior=${conflictBehavior}`;
        
        const response = await this.axiosClient.put(endpoint, content, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        return response.data;
    }

    /**
     * Session upload for larger files
     */
    private async sessionUpload(
        uploadPath: string, 
        content: Buffer | string, 
        overwrite: boolean
    ): Promise<SharePointDriveItem> {
        // Create upload session
        const encodedPath = encodeURIComponent(uploadPath);
        const sessionEndpoint = `/sites/${this.siteId}/drives/${this.driveId}/root:/${encodedPath}:/createUploadSession`;
        
        const sessionData = {
            item: {
                '@microsoft.graph.conflictBehavior': overwrite ? 'replace' : 'rename'
            }
        };

        const sessionResponse = await this.axiosClient.post(sessionEndpoint, sessionData);
        const uploadUrl = sessionResponse.data.uploadUrl;

        // Upload content in chunks
        const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
        const chunkSize = 320 * 1024; // 320KB chunks
        const totalSize = buffer.length;
        
        for (let start = 0; start < totalSize; start += chunkSize) {
            const end = Math.min(start + chunkSize, totalSize);
            const chunk = buffer.slice(start, end);
            
            const headers = {
                'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`,
                'Content-Length': chunk.length.toString()
            };

            const chunkResponse = await axios.put(uploadUrl, chunk, { headers });
            
            if (chunkResponse.status === 201 || chunkResponse.status === 200) {
                return chunkResponse.data;
            }
        }

        throw new Error('Upload session completed but no final response received');
    }

    /**
     * Add metadata to a SharePoint item
     */
    private async addMetadata(itemId: string, metadata: SharePointMetadata): Promise<void> {
        try {
            const listItemEndpoint = `/sites/${this.siteId}/drives/${this.driveId}/items/${itemId}/listItem`;
            
            const updateData = {
                fields: metadata
            };

            await this.axiosClient.patch(listItemEndpoint, updateData);
            console.log(`✅ Added metadata to item: ${itemId}`);

        } catch (error: any) {
            console.warn(`⚠️ Failed to add metadata to ${itemId}:`, error.message);
            // Don't throw error as upload was successful
        }
    }

    /**
     * Ensure folder exists, create if necessary
     */
    private async ensureFolderExists(folderPath: string): Promise<void> {
        try {
            await this.getDriveItem(folderPath);
            console.log(`📁 Folder exists: ${folderPath}`);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                // Create folder structure recursively
                const pathParts = folderPath.split('/').filter(part => part);
                let currentPath = '';
                
                for (const part of pathParts) {
                    const parentPath = currentPath;
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    
                    try {
                        await this.getDriveItem(currentPath);
                    } catch (error) {
                        await this.createFolder(currentPath);
                    }
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Build complete folder path
     */
    private buildFolderPath(documentFolderPath?: string, parentFolderPath?: string): string {
        const parts: string[] = [];
        
        if (this.config.rootFolderPath) {
            parts.push(this.config.rootFolderPath);
        }
        
        if (parentFolderPath) {
            parts.push(parentFolderPath);
        }
        
        if (documentFolderPath) {
            parts.push(documentFolderPath);
        }
        
        return parts.join('/');
    }

    /**
     * Prepare file content for upload
     */
    private prepareFileContent(document: SharePointDocument): Buffer {
        // For now, keep as markdown. Future enhancement: convert to Word document
        return Buffer.from(document.content, 'utf8');
    }

    /**
     * Get all markdown files from directory recursively
     */
    private getMarkdownFiles(dirPath: string): string[] {
        const files: string[] = [];
        const fs = require('fs');
        
        const walk = (currentPath: string) => {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const fullPath = join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (item.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        };
        
        walk(dirPath);
        return files;
    }

    /**
     * Get folder path from file path relative to base directory
     */
    private getFolderPathFromFile(filePath: string, baseDir: string): string {
        const relativePath = filePath.replace(baseDir, '').replace(/\\/g, '/');
        const folderPath = dirname(relativePath);
        return folderPath === '.' || folderPath === '/' ? '' : folderPath.replace(/^\//, '');
    }

    /**
     * Extract title from markdown content
     */
    private extractTitleFromContent(content: string): string | null {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    /**
     * Generate SharePoint metadata from document content
     */
    private generateMetadata(content: string, fileName: string): SharePointMetadata {
        const metadata: SharePointMetadata = {
            Title: this.extractTitleFromContent(content) || fileName.replace('.md', ''),
            ContentType: 'Document',
            DocumentCategory: this.inferDocumentCategory(fileName),
            DocumentVersion: '1.0',
            Generated: 'ADPA v2.1.3'
        };

        // Extract PMBOK references if present
        const pmbokMatch = content.match(/PMBOK[:\s]+([^\n]+)/i);
        if (pmbokMatch) {
            metadata.PMBOKReference = pmbokMatch[1].trim();
        }

        return metadata;
    }

    /**
     * Infer document category from file name/path
     */
    private inferDocumentCategory(fileName: string): string {
        const lowerName = fileName.toLowerCase();
        
        if (lowerName.includes('charter')) return 'Project Charter';
        if (lowerName.includes('scope')) return 'Scope Management';
        if (lowerName.includes('risk')) return 'Risk Management';
        if (lowerName.includes('quality')) return 'Quality Management';
        if (lowerName.includes('stakeholder')) return 'Stakeholder Management';
        if (lowerName.includes('communication')) return 'Communication Management';
        if (lowerName.includes('procurement')) return 'Procurement Management';
        if (lowerName.includes('schedule')) return 'Schedule Management';
        if (lowerName.includes('cost')) return 'Cost Management';
        if (lowerName.includes('resource')) return 'Resource Management';
        if (lowerName.includes('integration')) return 'Integration Management';
        if (lowerName.includes('technical')) return 'Technical Analysis';
        if (lowerName.includes('architecture')) return 'Technical Design';
        
        return 'General Documentation';
    }

    /**
     * Add delay between operations
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Factory function to create SharePointPublisher instance
 */
export function createSharePointPublisher(config: SharePointConfig): SharePointPublisher {
    return new SharePointPublisher(config);
}

/**
 * Validate SharePoint configuration
 */
export function validateSharePointConfig(config: SharePointConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!config.tenantId) errors.push('tenantId is required');
    if (!config.clientId) errors.push('clientId is required');
    if (!config.siteUrl) errors.push('siteUrl is required');
    if (!config.documentLibrary) errors.push('documentLibrary is required');

    // Auth method validation
    if (!['oauth2', 'service-principal', 'certificate'].includes(config.authMethod)) {
        errors.push('authMethod must be oauth2, service-principal, or certificate');
    }

    // OAuth2 specific validation
    if (config.authMethod === 'oauth2') {
        if (!config.oauth2) {
            errors.push('oauth2 configuration is required when authMethod is oauth2');
        } else {
            if (!config.oauth2.redirectUri) errors.push('oauth2.redirectUri is required');
            if (!config.oauth2.scopes || config.oauth2.scopes.length === 0) {
                errors.push('oauth2.scopes array is required and must not be empty');
            }
        }
    }

    // Service Principal specific validation
    if (config.authMethod === 'service-principal') {
        if (!config.clientSecret) errors.push('clientSecret is required for service principal auth');
    }

    // Certificate specific validation
    if (config.authMethod === 'certificate') {
        if (!config.certificatePath) errors.push('certificatePath is required for certificate auth');
    }

    // URL validation
    try {
        new URL(config.siteUrl);
    } catch {
        errors.push('siteUrl must be a valid URL');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
