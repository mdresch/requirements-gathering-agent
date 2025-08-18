/**
 * Integration Client
 * 
 * Specialized client for third-party integrations.
 * Provides connectivity to Confluence, SharePoint, and other platforms.
 */

import { EventEmitter } from 'events';
import { SDKConfiguration } from './configuration/SDKConfiguration.js';
import { 
  PublishOptions, 
  PublishResult, 
  IntegrationType,
  IntegrationConfig
} from './types/index.js';
import { IntegrationError } from './errors/index.js';

/**
 * Integration Client
 * 
 * Handles all third-party integrations including:
 * - Confluence publishing
 * - SharePoint document management
 * - JIRA integration
 * - GitHub/Azure DevOps integration
 * - Custom webhook integrations
 */
export class IntegrationClient extends EventEmitter {
  private config: SDKConfiguration;
  private integrations: Map<IntegrationType, IntegrationConfig> = new Map();
  private initialized = false;

  constructor(config: SDKConfiguration) {
    super();
    this.config = config;
  }

  /**
   * Initialize the integration client
   */
  async initialize(): Promise<void> {
    try {
      await this.loadIntegrationConfigs();
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      throw new IntegrationError(`Failed to initialize integration client: ${error.message}`);
    }
  }

  /**
   * Publish documents to Confluence
   */
  async publishToConfluence(
    documentPaths: string[], 
    options: PublishOptions
  ): Promise<PublishResult[]> {
    this.ensureInitialized();
    
    const confluenceConfig = this.integrations.get('confluence');
    if (!confluenceConfig || !confluenceConfig.enabled) {
      throw new IntegrationError('Confluence integration not configured or disabled', 'confluence');
    }
    
    try {
      const results: PublishResult[] = [];
      
      for (const documentPath of documentPaths) {
        const result = await this.publishSingleDocumentToConfluence(documentPath, options, confluenceConfig);
        results.push(result);
        
        this.emit('document-published', { 
          integration: 'confluence', 
          documentPath, 
          result 
        });
      }
      
      return results;
    } catch (error) {
      throw new IntegrationError(`Failed to publish to Confluence: ${error.message}`, 'confluence');
    }
  }

  /**
   * Publish documents to SharePoint
   */
  async publishToSharePoint(
    documentPaths: string[], 
    options: PublishOptions
  ): Promise<PublishResult[]> {
    this.ensureInitialized();
    
    const sharepointConfig = this.integrations.get('sharepoint');
    if (!sharepointConfig || !sharepointConfig.enabled) {
      throw new IntegrationError('SharePoint integration not configured or disabled', 'sharepoint');
    }
    
    try {
      const results: PublishResult[] = [];
      
      for (const documentPath of documentPaths) {
        const result = await this.publishSingleDocumentToSharePoint(documentPath, options, sharepointConfig);
        results.push(result);
        
        this.emit('document-published', { 
          integration: 'sharepoint', 
          documentPath, 
          result 
        });
      }
      
      return results;
    } catch (error) {
      throw new IntegrationError(`Failed to publish to SharePoint: ${error.message}`, 'sharepoint');
    }
  }

  /**
   * Sync with version control system
   */
  async syncWithVCS(options: any): Promise<any> {
    this.ensureInitialized();
    
    try {
      const vcsType = options.type || 'git';
      
      switch (vcsType) {
        case 'git':
          return await this.syncWithGit(options);
        case 'azure-devops':
          return await this.syncWithAzureDevOps(options);
        case 'github':
          return await this.syncWithGitHub(options);
        default:
          throw new IntegrationError(`Unsupported VCS type: ${vcsType}`);
      }
    } catch (error) {
      throw new IntegrationError(`Failed to sync with VCS: ${error.message}`);
    }
  }

  /**
   * Create JIRA issues from project analysis
   */
  async createJiraIssues(projectAnalysis: any, options: any = {}): Promise<any[]> {
    this.ensureInitialized();
    
    const jiraConfig = this.integrations.get('jira');
    if (!jiraConfig || !jiraConfig.enabled) {
      throw new IntegrationError('JIRA integration not configured or disabled', 'jira');
    }
    
    try {
      const issues: any[] = [];
      
      // Create issues from risks
      if (projectAnalysis.risks && projectAnalysis.risks.risks) {
        for (const risk of projectAnalysis.risks.risks) {
          const issue = await this.createJiraIssue({
            summary: `Risk: ${risk.description}`,
            description: `Risk identified during project analysis.\n\nProbability: ${risk.probability}\nImpact: ${risk.impact}`,
            issueType: 'Risk',
            priority: this.mapRiskPriorityToJira(risk.probability * risk.impact)
          }, jiraConfig);
          
          issues.push(issue);
        }
      }
      
      // Create issues from recommendations
      if (projectAnalysis.recommendations) {
        for (const [category, recommendations] of Object.entries(projectAnalysis.recommendations)) {
          if (Array.isArray(recommendations)) {
            for (const recommendation of recommendations) {
              const issue = await this.createJiraIssue({
                summary: `Recommendation: ${category}`,
                description: recommendation,
                issueType: 'Task',
                priority: 'Medium'
              }, jiraConfig);
              
              issues.push(issue);
            }
          }
        }
      }
      
      return issues;
    } catch (error) {
      throw new IntegrationError(`Failed to create JIRA issues: ${error.message}`, 'jira');
    }
  }

  /**
   * Send webhook notifications
   */
  async sendWebhookNotification(webhookUrl: string, payload: any): Promise<PublishResult> {
    this.ensureInitialized();
    
    try {
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return {
        success: true,
        url: webhookUrl,
        publishedAt: new Date(),
        warnings: [],
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        url: webhookUrl,
        publishedAt: new Date(),
        warnings: [],
        errors: [error.message]
      };
    }
  }

  /**
   * Configure integration
   */
  async configureIntegration(type: IntegrationType, config: IntegrationConfig): Promise<void> {
    this.ensureInitialized();
    
    try {
      // Validate configuration
      await this.validateIntegrationConfig(type, config);
      
      // Test connection
      await this.testIntegrationConnection(type, config);
      
      // Store configuration
      this.integrations.set(type, config);
      
      this.emit('integration-configured', { type, config });
    } catch (error) {
      throw new IntegrationError(`Failed to configure ${type} integration: ${error.message}`, type);
    }
  }

  /**
   * Test integration connection
   */
  async testIntegrationConnection(type: IntegrationType, config?: IntegrationConfig): Promise<boolean> {
    this.ensureInitialized();
    
    const integrationConfig = config || this.integrations.get(type);
    if (!integrationConfig) {
      throw new IntegrationError(`No configuration found for ${type} integration`, type);
    }
    
    try {
      switch (type) {
        case 'confluence':
          return await this.testConfluenceConnection(integrationConfig);
        case 'sharepoint':
          return await this.testSharePointConnection(integrationConfig);
        case 'jira':
          return await this.testJiraConnection(integrationConfig);
        case 'github':
          return await this.testGitHubConnection(integrationConfig);
        case 'azure-devops':
          return await this.testAzureDevOpsConnection(integrationConfig);
        default:
          throw new IntegrationError(`Unsupported integration type: ${type}`, type);
      }
    } catch (error) {
      throw new IntegrationError(`Connection test failed for ${type}: ${error.message}`, type);
    }
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(): Promise<Record<IntegrationType, any>> {
    this.ensureInitialized();
    
    const status: Record<string, any> = {};
    
    for (const [type, config] of this.integrations.entries()) {
      try {
        const isConnected = await this.testIntegrationConnection(type, config);
        status[type] = {
          enabled: config.enabled,
          connected: isConnected,
          lastTested: new Date()
        };
      } catch (error) {
        status[type] = {
          enabled: config.enabled,
          connected: false,
          error: error.message,
          lastTested: new Date()
        };
      }
    }
    
    return status as Record<IntegrationType, any>;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<string> {
    if (!this.initialized) {
      return 'unhealthy';
    }
    
    try {
      const status = await this.getIntegrationStatus();
      const enabledIntegrations = Object.values(status).filter((s: any) => s.enabled);
      
      if (enabledIntegrations.length === 0) {
        return 'healthy'; // No integrations configured is OK
      }
      
      const connectedIntegrations = enabledIntegrations.filter((s: any) => s.connected);
      
      if (connectedIntegrations.length === enabledIntegrations.length) {
        return 'healthy';
      } else if (connectedIntegrations.length > 0) {
        return 'degraded';
      } else {
        return 'unhealthy';
      }
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.integrations.clear();
    this.initialized = false;
    this.emit('cleanup');
  }

  // === Private Methods ===

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new IntegrationError('Integration client not initialized');
    }
  }

  private async loadIntegrationConfigs(): Promise<void> {
    // Load integration configurations from environment or config files
    // This would be implemented based on the configuration storage mechanism
    
    // Example: Load from environment variables
    if (process.env.CONFLUENCE_URL && process.env.CONFLUENCE_TOKEN) {
      this.integrations.set('confluence', {
        type: 'confluence',
        enabled: true,
        credentials: {
          apiKey: process.env.CONFLUENCE_TOKEN,
          username: process.env.CONFLUENCE_USERNAME
        },
        settings: {
          baseUrl: process.env.CONFLUENCE_URL,
          spaceKey: process.env.CONFLUENCE_SPACE_KEY
        }
      });
    }
    
    if (process.env.SHAREPOINT_SITE_URL && process.env.SHAREPOINT_CLIENT_ID) {
      this.integrations.set('sharepoint', {
        type: 'sharepoint',
        enabled: true,
        credentials: {
          clientId: process.env.SHAREPOINT_CLIENT_ID,
          clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
          tenantId: process.env.SHAREPOINT_TENANT_ID
        },
        settings: {
          siteUrl: process.env.SHAREPOINT_SITE_URL,
          libraryName: process.env.SHAREPOINT_LIBRARY_NAME
        }
      });
    }
  }

  private async publishSingleDocumentToConfluence(
    documentPath: string, 
    options: PublishOptions, 
    config: IntegrationConfig
  ): Promise<PublishResult> {
    try {
      // Read document content
      const fs = await import('fs/promises');
      const content = await fs.readFile(documentPath, 'utf-8');
      
      // Convert markdown to Confluence format if needed
      const confluenceContent = this.convertMarkdownToConfluence(content);
      
      // Create or update page
      const pageTitle = this.extractTitleFromDocument(content) || this.getFilenameFromPath(documentPath);
      
      // Use Confluence API to publish
      const result = await this.callConfluenceAPI('POST', '/rest/api/content', {
        type: 'page',
        title: pageTitle,
        space: { key: config.settings?.spaceKey },
        body: {
          storage: {
            value: confluenceContent,
            representation: 'storage'
          }
        }
      }, config);
      
      return {
        success: true,
        url: `${config.settings?.baseUrl}/pages/viewpage.action?pageId=${result.id}`,
        id: result.id,
        publishedAt: new Date(),
        warnings: [],
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        publishedAt: new Date(),
        warnings: [],
        errors: [error.message]
      };
    }
  }

  private async publishSingleDocumentToSharePoint(
    documentPath: string, 
    options: PublishOptions, 
    config: IntegrationConfig
  ): Promise<PublishResult> {
    try {
      // Read document content
      const fs = await import('fs/promises');
      const content = await fs.readFile(documentPath, 'utf-8');
      
      // Get filename
      const filename = this.getFilenameFromPath(documentPath);
      
      // Upload to SharePoint using Microsoft Graph API
      const result = await this.callSharePointAPI('PUT', 
        `/sites/${config.settings?.siteId}/drive/root:/${options.destination || ''}/${filename}:/content`,
        content,
        config
      );
      
      return {
        success: true,
        url: result.webUrl,
        id: result.id,
        publishedAt: new Date(),
        warnings: [],
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        publishedAt: new Date(),
        warnings: [],
        errors: [error.message]
      };
    }
  }

  private async syncWithGit(options: any): Promise<any> {
    try {
      const { execSync } = await import('child_process');
      
      // Basic git operations
      if (options.commit) {
        execSync('git add .', { cwd: options.workingDirectory });
        execSync(`git commit -m "${options.message || 'Update documents'}"`, { cwd: options.workingDirectory });
      }
      
      if (options.push) {
        execSync(`git push ${options.remote || 'origin'} ${options.branch || 'main'}`, { cwd: options.workingDirectory });
      }
      
      return {
        success: true,
        message: 'Git sync completed successfully'
      };
    } catch (error) {
      throw new Error(`Git sync failed: ${error.message}`);
    }
  }

  private async syncWithAzureDevOps(options: any): Promise<any> {
    // Azure DevOps API integration would be implemented here
    throw new Error('Azure DevOps integration not yet implemented');
  }

  private async syncWithGitHub(options: any): Promise<any> {
    // GitHub API integration would be implemented here
    throw new Error('GitHub integration not yet implemented');
  }

  private async createJiraIssue(issueData: any, config: IntegrationConfig): Promise<any> {
    try {
      const result = await this.callJiraAPI('POST', '/rest/api/2/issue', {
        fields: {
          project: { key: config.settings?.projectKey },
          summary: issueData.summary,
          description: issueData.description,
          issuetype: { name: issueData.issueType },
          priority: { name: issueData.priority }
        }
      }, config);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to create JIRA issue: ${error.message}`);
    }
  }

  private async validateIntegrationConfig(type: IntegrationType, config: IntegrationConfig): Promise<void> {
    switch (type) {
      case 'confluence':
        if (!config.credentials?.apiKey || !config.settings?.baseUrl) {
          throw new Error('Confluence integration requires API key and base URL');
        }
        break;
      case 'sharepoint':
        if (!config.credentials?.clientId || !config.credentials?.clientSecret) {
          throw new Error('SharePoint integration requires client ID and secret');
        }
        break;
      case 'jira':
        if (!config.credentials?.apiKey || !config.settings?.baseUrl) {
          throw new Error('JIRA integration requires API key and base URL');
        }
        break;
    }
  }

  private async testConfluenceConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      await this.callConfluenceAPI('GET', '/rest/api/space', {}, config);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async testSharePointConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      await this.callSharePointAPI('GET', '/sites', {}, config);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async testJiraConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      await this.callJiraAPI('GET', '/rest/api/2/myself', {}, config);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async testGitHubConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${config.credentials?.token}`,
          'User-Agent': 'Requirements-Gathering-Agent'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async testAzureDevOpsConnection(config: IntegrationConfig): Promise<boolean> {
    // Azure DevOps connection test would be implemented here
    return false;
  }

  private async callConfluenceAPI(method: string, endpoint: string, data: any, config: IntegrationConfig): Promise<any> {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${config.settings?.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${config.credentials?.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`Confluence API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async callSharePointAPI(method: string, endpoint: string, data: any, config: IntegrationConfig): Promise<any> {
    const fetch = (await import('node-fetch')).default;
    
    // Get access token first
    const accessToken = await this.getSharePointAccessToken(config);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`SharePoint API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async callJiraAPI(method: string, endpoint: string, data: any, config: IntegrationConfig): Promise<any> {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${config.settings?.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${config.credentials?.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`JIRA API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async getSharePointAccessToken(config: IntegrationConfig): Promise<string> {
    // OAuth2 flow for SharePoint access token
    // This would be implemented based on the specific authentication method
    throw new Error('SharePoint access token retrieval not implemented');
  }

  private convertMarkdownToConfluence(markdown: string): string {
    // Convert markdown to Confluence storage format
    // This is a simplified conversion - a full implementation would use a proper converter
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br/>');
  }

  private extractTitleFromDocument(content: string): string | null {
    const titleMatch = content.match(/^# (.+)$/m);
    return titleMatch ? titleMatch[1] : null;
  }

  private getFilenameFromPath(path: string): string {
    return path.split('/').pop() || path.split('\\').pop() || 'document';
  }

  private mapRiskPriorityToJira(riskScore: number): string {
    if (riskScore >= 4) return 'Highest';
    if (riskScore >= 3) return 'High';
    if (riskScore >= 2) return 'Medium';
    if (riskScore >= 1) return 'Low';
    return 'Lowest';
  }
}