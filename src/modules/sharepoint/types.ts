/**
 * SharePoint Integration Type Definitions
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Defines TypeScript interfaces and types for SharePoint integration
 * with Microsoft Graph API and Microsoft 365 ecosystem.
 * 
 * Features:
 * - OAuth 2.0 and Service Principal authentication
 * - Microsoft Graph API integration
 * - SharePoint document library management
 * - Enterprise security and compliance
 */

export interface SharePointConfig {
    // Authentication method - OAuth2 preferred for interactive, Service Principal for automation
    authMethod: 'oauth2' | 'service-principal' | 'certificate';
    
    // Azure AD Configuration
    tenantId: string;           // Azure AD tenant ID
    clientId: string;           // Azure AD app registration client ID
    clientSecret?: string;      // Client secret (for service principal auth)
    certificatePath?: string;   // Certificate path (for certificate auth)
    
    // SharePoint Configuration
    siteUrl: string;           // SharePoint site URL (e.g., https://contoso.sharepoint.com/sites/projectdocs)
    documentLibrary: string;   // Document library name (e.g., "Documents" or "Shared Documents")
    
    // OAuth2 Configuration (for interactive auth)
    oauth2?: {
        redirectUri: string;    // OAuth redirect URI
        scopes: string[];      // Microsoft Graph scopes
        authority?: string;    // Azure AD authority URL
    };
    
    // Optional Configuration
    rootFolderPath?: string;   // Root folder path within document library
    enableVersioning?: boolean; // Enable SharePoint versioning
    retentionDays?: number;    // Document retention period
}

export interface SharePointDocument {
    title: string;             // Document title
    content: string;           // Document content (markdown or HTML)
    fileName: string;          // File name with extension
    contentType?: string;      // Content type metadata
    folderPath?: string;       // Folder path within library
    metadata?: Record<string, any>; // SharePoint metadata fields
    tags?: string[];           // Document tags
    category?: string;         // Document category
}

export interface PublishResult {
    success: boolean;
    driveItemId?: string;      // SharePoint drive item ID
    webUrl?: string;           // SharePoint web URL
    error?: string;           // Error message if failed
    fileName: string;         // Original file name
    size?: number;            // File size in bytes
    lastModified?: string;    // Last modified timestamp
}

export interface SharePointSite {
    id: string;               // Site ID
    displayName: string;      // Site display name
    name: string;             // Site name
    webUrl: string;           // Site web URL
    description?: string;     // Site description
}

export interface SharePointDriveItem {
    id: string;               // Item ID
    name: string;             // Item name
    webUrl: string;           // Item web URL
    size: number;             // Item size
    createdDateTime: string;  // Creation timestamp
    lastModifiedDateTime: string; // Last modified timestamp
    folder?: {                // Folder properties (if item is folder)
        childCount: number;
    };
    file?: {                  // File properties (if item is file)
        mimeType: string;
        hashes: {
            quickXorHash?: string;
            sha1Hash?: string;
        };
    };
}

export interface SharePointMetadata {
    // Standard SharePoint fields
    Title?: string;
    ContentType?: string;
    Author?: string;
    Created?: string;
    Modified?: string;
    
    // Custom PMBOK fields
    DocumentCategory?: string;
    ProjectPhase?: string;
    PMBOKReference?: string;
    DocumentVersion?: string;
    ReviewStatus?: string;
    ApprovalStatus?: string;
    
    // Custom metadata
    [key: string]: any;
}

export interface BatchUploadOptions {
    maxConcurrency?: number;   // Maximum concurrent uploads
    chunkSize?: number;        // Upload chunk size in bytes
    retryAttempts?: number;    // Number of retry attempts
    progressCallback?: (uploaded: number, total: number) => void;
}

export interface SharePointPermissions {
    read: boolean;            // Read permission
    write: boolean;           // Write permission
    delete: boolean;          // Delete permission
    manage: boolean;          // Manage permission
}

// OAuth2 Configuration
export interface OAuth2Config {
    tenantId: string;          // Azure AD tenant ID
    clientId: string;          // Application (client) ID
    redirectUri: string;       // Redirect URI
    scopes: string[];         // Microsoft Graph scopes
    authority?: string;       // Authority URL
    cacheLocation?: string;   // Token cache location
}

// Authentication token response
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    refresh_token?: string;
}

// Graph API error response
export interface GraphError {
    error: {
        code: string;
        message: string;
        innerError?: {
            date: string;
            'request-id': string;
            'client-request-id': string;
        };
    };
}

// Publishing options
export interface PublishingOptions {
    parentFolderPath?: string;   // Parent folder for organization
    enableVersioning?: boolean;  // Enable SharePoint versioning
    overwriteExisting?: boolean; // Overwrite existing files
    createFolders?: boolean;     // Create folder structure
    preserveTimestamps?: boolean; // Preserve original timestamps
    addMetadata?: boolean;       // Add PMBOK metadata
    tagPrefix?: string;          // Tag prefix for published documents
}

// SharePoint-specific publishing options
export interface SharePointPublishOptions {
    folderPath?: string;         // Target folder path
    labelPrefix?: string;        // Label prefix for metadata
    dryRun?: boolean;           // Preview mode without publishing
    force?: boolean;            // Force publish even if validation fails
    createFolders?: boolean;    // Create folder structure
    overwriteExisting?: boolean; // Overwrite existing files
    preserveMetadata?: boolean; // Preserve existing metadata
    enableVersioning?: boolean; // Enable SharePoint versioning
}

// Site creation options
export interface SiteCreationOptions {
    template?: string;           // Site template
    language?: number;           // Language code
    timeZone?: number;          // Time zone
    owners?: string[];          // Site owners
    members?: string[];         // Site members
}

// Search options
export interface SearchOptions {
    query?: string;             // Search query
    fileTypes?: string[];       // File type filters
    dateRange?: {               // Date range filter
        start: string;
        end: string;
    };
    sortBy?: 'name' | 'modified' | 'size'; // Sort criteria
    sortOrder?: 'asc' | 'desc'; // Sort order
    top?: number;              // Maximum results
}

// Microsoft Graph API response types
export interface GraphResponse<T> {
    '@odata.context'?: string;
    '@odata.nextLink'?: string;
    value?: T[];
}

export interface DriveResponse {
    id: string;
    driveType: string;
    name: string;
    webUrl: string;
    quota: {
        total: number;
        used: number;
        remaining: number;
    };
}
