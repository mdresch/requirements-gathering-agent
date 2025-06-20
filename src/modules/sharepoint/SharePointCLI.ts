/**
 * SharePoint CLI Commands (Corrected Version)
 * 
 * Implements command-line interface for SharePoint document publishing
 * with enterprise-grade authentication and metadata management.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 * 
 * Key Features:
 * - Initialize SharePoint configuration
 * - Test SharePoint connectivity
 * - OAuth2 authentication management
 * - Document publishing to SharePoint
 * - Status monitoring and diagnostics
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\sharepoint\SharePointCLI.ts
 */

import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { SharePointConfigManager } from './SharePointConfigManager.js';
import { SharePointPublisher } from './SharePointPublisher.js';
import { SharePointOAuth2 } from './SharePointOAuth2.js';
import { SharePointConfig, SharePointPublishOptions, SharePointDocument, OAuth2Config } from './types.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

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
 * Initialize SharePoint configuration
 */
export async function initSharePointConfig(): Promise<void> {
  console.log(chalk.blue('🔧 Initializing SharePoint Configuration'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    // Check if config already exists
    const status = configManager.getConfigurationStatus();
    if (status.configured) {
      const overwrite = await question(
        chalk.yellow('⚠️ SharePoint configuration already exists. Overwrite? (y/N): ')
      );
      if (overwrite.toLowerCase() !== 'y') {
        console.log(chalk.blue('ℹ️ Configuration initialization cancelled.'));
        rl.close();
        return;
      }
    }
    
    console.log(chalk.blue('\n📝 Please provide SharePoint configuration details:'));
    
    // Collect configuration details
    const tenantId = await question(chalk.cyan('Azure Tenant ID: '));
    const clientId = await question(chalk.cyan('Azure App Registration Client ID: '));
    const siteUrl = await question(chalk.cyan('SharePoint Site URL (e.g., https://contoso.sharepoint.com/sites/documents): '));
    const libraryName = await question(chalk.cyan('Document Library Name (default: Documents): ')) || 'Documents';
    
    // Advanced options
    console.log(chalk.blue('\n🔧 Advanced Configuration (optional, press Enter to skip):'));
    const folderPath = await question(chalk.cyan('Default Folder Path (e.g., /Projects/Documentation): '));
    const labelPrefix = await question(chalk.cyan('Label Prefix for Metadata (default: adpa): ')) || 'adpa';
    
    // Update configuration
    configManager.updateConfiguration({
      tenantId,
      clientId,
      siteUrl,
      documentLibrary: libraryName,
      authMethod: 'oauth2',
      rootFolderPath: folderPath || undefined,
      oauth2: {
        redirectUri: 'http://localhost:3000/auth/callback',
        scopes: [
          'https://graph.microsoft.com/Sites.ReadWrite.All',
          'https://graph.microsoft.com/Files.ReadWrite.All',
          'https://graph.microsoft.com/User.Read'
        ],
        authority: `https://login.microsoftonline.com/${tenantId}`
      },
      publishingOptions: {
        enableVersioning: true,
        createFolders: true,
        overwriteExisting: false,
        addMetadata: true
      }
    });
    
    console.log(chalk.green('\n✅ SharePoint configuration saved successfully!'));
    console.log(chalk.blue('\n📋 Next Steps:'));
    console.log(chalk.white('1. Run: npm run sharepoint:oauth2:login'));
    console.log(chalk.white('2. Test connection: npm run sharepoint:test'));
    console.log(chalk.white('3. Publish documents: npm run sharepoint:publish'));
    
    // Generate .env template
    const envTemplate = configManager.generateEnvTemplate();
    await writeFile('.env.sharepoint.template', envTemplate);
    console.log(chalk.blue('\n📄 Generated .env.sharepoint.template for environment variables'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to initialize SharePoint configuration:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  } finally {
    rl.close();
  }
}

/**
 * Test SharePoint connection
 */
export async function testSharePointConnection(): Promise<void> {
  console.log(chalk.blue('🔍 Testing SharePoint Connection'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    const status = configManager.getConfigurationStatus();
    if (!status.configured) {
      console.log(chalk.red('❌ SharePoint configuration not found'));
      console.log(chalk.yellow('💡 Run: npm run sharepoint:init'));
      return;
    }
    
    const config = configManager.getSharePointConfig();
    console.log(chalk.blue(`📍 Site URL: ${config.siteUrl}`));
    console.log(chalk.blue(`📚 Library: ${config.documentLibrary}`));
    console.log(chalk.blue(`🔐 Auth Method: ${config.authMethod}`));
      // Test authentication
    console.log(chalk.blue('\n🔐 Testing Authentication...'));
    if (config.oauth2) {
      const oauth2Config: OAuth2Config = {
        ...config.oauth2,
        tenantId: config.tenantId,
        clientId: config.clientId
      };
      const oauth2 = new SharePointOAuth2(oauth2Config);
      const isAuth = await oauth2.isAuthenticated();
      
      if (!isAuth) {
        console.log(chalk.red('❌ Authentication failed'));
        console.log(chalk.yellow('💡 Run: npm run sharepoint:oauth2:login'));
        return;
      }
      
      console.log(chalk.green('✅ Authentication successful'));
      
      // Test SharePoint API access
      console.log(chalk.blue('\n📡 Testing SharePoint API Access...'));
      const publisher = new SharePointPublisher(config);
      await publisher.initialize();
      
      const testResult = await publisher.testConnection();
      if (testResult.success) {
        console.log(chalk.green('✅ SharePoint connection test successful!'));
        if (testResult.siteInfo) {
          console.log(chalk.blue(`📊 Site: ${testResult.siteInfo.displayName}`));
        }
        if (testResult.driveInfo) {
          console.log(chalk.blue(`📁 Drive: ${testResult.driveInfo.name}`));
        }
      } else {
        console.log(chalk.red('❌ SharePoint connection test failed'));
        console.log(chalk.red(testResult.error || 'Unknown error'));
      }
    }
    
    console.log(chalk.green('\n🎉 SharePoint connection test completed!'));
    console.log(chalk.blue('💡 Ready to publish documents'));
    
  } catch (error) {
    console.error(chalk.red('❌ SharePoint connection test failed:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    
    if (error instanceof Error && error.message.includes('authentication')) {
      console.log(chalk.yellow('\n💡 Authentication may have expired. Try:'));
      console.log(chalk.white('npm run sharepoint:oauth2:login'));
    }
  }
}

/**
 * Start SharePoint OAuth2 authentication flow
 */
export async function sharePointOAuth2Login(): Promise<void> {
  console.log(chalk.blue('🔐 SharePoint OAuth2 Authentication'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    const status = configManager.getConfigurationStatus();
    if (!status.configured) {
      console.log(chalk.red('❌ SharePoint configuration not found'));
      console.log(chalk.yellow('💡 Run: npm run sharepoint:init'));
      return;
    }
    
    const config = configManager.getSharePointConfig();
    if (!config.oauth2) {
      console.log(chalk.red('❌ OAuth2 configuration not found'));
      return;
    }    
    const oauth2 = new SharePointOAuth2(createOAuth2Config(config));
      console.log(chalk.blue('🚀 Starting OAuth2 device code flow...'));
    console.log(chalk.yellow('⏳ This will open a browser for authentication'));
    
    const result = await oauth2.startDeviceCodeFlow();
    
    if (result.accessToken) {
      console.log(chalk.green('✅ OAuth2 authentication successful!'));
      console.log(chalk.blue('🔑 Access token cached for future use'));
      console.log(chalk.blue('💡 Test connection: npm run sharepoint:test'));
    } else {
      console.log(chalk.red('❌ OAuth2 authentication failed'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ OAuth2 login failed:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Check SharePoint OAuth2 authentication status
 */
export async function sharePointOAuth2Status(): Promise<void> {
  console.log(chalk.blue('🔍 SharePoint OAuth2 Status'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    const status = configManager.getConfigurationStatus();
    if (!status.configured) {
      console.log(chalk.red('❌ SharePoint configuration not found'));
      console.log(chalk.yellow('💡 Run: npm run sharepoint:init'));
      return;
    }
    
    const config = configManager.getSharePointConfig();
    if (!config.oauth2) {
      console.log(chalk.red('❌ OAuth2 configuration not found'));
      return;
    }
      const oauth2 = new SharePointOAuth2(createOAuth2Config(config));
    
    console.log(chalk.blue('📊 Authentication Status:'));
    const isAuth = await oauth2.isAuthenticated();
    console.log(chalk.blue(`🔐 Is Authenticated: ${isAuth ? '✅' : '❌'}`));
    
    const account = await oauth2.getCurrentAccount();
    if (account) {
      console.log(chalk.blue(`👤 Account: ${account.username}`));
    }
    
    if (!isAuth) {
      console.log(chalk.yellow('\n💡 Authentication required:'));
      console.log(chalk.white('npm run sharepoint:oauth2:login'));
    } else {
      console.log(chalk.green('\n🎉 Authentication is active and valid!'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to check OAuth2 status:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Debug SharePoint OAuth2 configuration
 */
export async function sharePointDebugOAuth2(): Promise<void> {
  console.log(chalk.blue('🔧 SharePoint OAuth2 Debug'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    const status = configManager.getConfigurationStatus();
    if (!status.configured) {
      console.log(chalk.red('❌ SharePoint configuration not found'));
      return;
    }
    
    const config = configManager.getSharePointConfig();
    
    console.log(chalk.blue('📋 Configuration Details:'));
    console.log(chalk.blue(`🏢 Tenant ID: ${config.tenantId}`));
    console.log(chalk.blue(`🆔 Client ID: ${config.clientId}`));
    console.log(chalk.blue(`🌐 Site URL: ${config.siteUrl}`));
    console.log(chalk.blue(`📚 Library: ${config.documentLibrary}`));
      console.log(chalk.blue('\n🔑 Authentication Info:'));
    if (config.oauth2) {
      const oauth2 = new SharePointOAuth2(createOAuth2Config(config));
      const isAuth = await oauth2.isAuthenticated();
      console.log(chalk.blue(`🔐 Is Authenticated: ${isAuth}`));
      
      const account = await oauth2.getCurrentAccount();
      if (account) {
        console.log(chalk.blue(`👤 Account: ${account.username}`));
      }
    }
    
    console.log(chalk.blue('\n🌐 Environment Variables:'));
    const envVars = [
      'SHAREPOINT_TENANT_ID',
      'SHAREPOINT_CLIENT_ID',
      'SHAREPOINT_SITE_URL',
      'SHAREPOINT_DOCUMENT_LIBRARY'
    ];
    
    for (const envVar of envVars) {
      const value = process.env[envVar];
      console.log(chalk.blue(`${envVar}: ${value ? '✅ Set' : '❌ Not set'}`));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Debug failed:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Publish documents to SharePoint
 */
export async function publishToSharePoint(
  documentsPath: string,
  options: Partial<SharePointPublishOptions> = {}
): Promise<void> {
  console.log(chalk.blue('📤 Publishing Documents to SharePoint'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    const status = configManager.getConfigurationStatus();
    if (!status.configured) {
      console.log(chalk.red('❌ SharePoint configuration not found'));
      console.log(chalk.yellow('💡 Run: npm run sharepoint:init'));
      return;
    }
    
    const config = configManager.getSharePointConfig();
    
    // Test authentication first
    console.log(chalk.blue('🔐 Verifying authentication...'));
    if (!config.oauth2) {
      console.log(chalk.red('❌ OAuth2 configuration not found'));
      return;    }
    
    const oauth2 = new SharePointOAuth2(createOAuth2Config(config));
    const isAuth = await oauth2.isAuthenticated();
    
    if (!isAuth) {
      console.log(chalk.red('❌ Authentication failed'));
      console.log(chalk.yellow('💡 Run: npm run sharepoint:oauth2:login'));
      return;
    }
    
    console.log(chalk.green('✅ Authentication verified'));
    
    // Initialize publisher
    const publisher = new SharePointPublisher(config);
    await publisher.initialize();
    
    // Check if documents directory exists
    if (!existsSync(documentsPath)) {
      console.log(chalk.red(`❌ Documents directory not found: ${documentsPath}`));
      return;
    }
    
    console.log(chalk.blue(`📂 Documents Path: ${documentsPath}`));
    console.log(chalk.blue(`🎯 Target Library: ${config.documentLibrary}`));
    
    if (options.folderPath) {
      console.log(chalk.blue(`📁 Target Folder: ${options.folderPath}`));
    }
    
    // Prepare publish options
    const publishOptions = {
      ...options,
      dryRun: options.dryRun || false,
      force: options.force || false
    };
    
    if (publishOptions.dryRun) {
      console.log(chalk.yellow('🔍 DRY RUN MODE - No documents will be published'));
    }    // Scan for documents
    console.log(chalk.blue('\n📋 Scanning for documents...'));
    const globModule = await import('glob');
    const documentFiles = await globModule.glob('**/*.{md,pdf,docx,txt}', {
      cwd: documentsPath,
      absolute: true
    });
    
    if (documentFiles.length === 0) {
      console.log(chalk.yellow('⚠️ No documents found to publish'));
      return;
    }
    
    console.log(chalk.blue(`📄 Found ${documentFiles.length} documents`));
    
    // Prepare documents for publishing
    const documents: SharePointDocument[] = [];
    
    for (const filePath of documentFiles) {
      const fileName = filePath.split(/[/\\]/).pop()!;
      const content = await readFile(filePath, 'utf-8');
      
      documents.push({
        title: fileName.replace(/\.[^.]+$/, ''), // Remove extension
        content,
        fileName,
        category: fileName.includes('project') ? 'project' : 'documentation',
        metadata: {
          GeneratedBy: 'ADPA v2.1.3',
          GeneratedDate: new Date().toISOString(),
          DocumentType: 'Project Documentation'
        },
        folderPath: options.folderPath
      });
    }
    
    // Publish documents
    console.log(chalk.blue(`\n🚀 Publishing ${documents.length} documents...`));
    
    const results = await publisher.publishDocuments(documentsPath, publishOptions);
    
    // Report results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(chalk.green(`\n✅ Published: ${successful} documents`));
    if (failed > 0) {
      console.log(chalk.red(`❌ Failed: ${failed} documents`));
      
      // Show failed documents
      const failedResults = results.filter(r => !r.success);
      for (const result of failedResults) {
        console.log(chalk.red(`  • ${result.fileName}: ${result.error}`));
      }
    }
    
    if (successful > 0) {
      console.log(chalk.blue('\n🔗 SharePoint Links:'));
      const successfulResults = results.filter(r => r.success && r.webUrl);
      for (const result of successfulResults) {
        console.log(chalk.white(`  • ${result.fileName}: ${result.webUrl}`));
      }
    }
    
    console.log(chalk.green('\n🎉 SharePoint publishing completed!'));
    
  } catch (error) {
    console.error(chalk.red('❌ SharePoint publishing failed:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Show SharePoint integration status
 */
export async function showSharePointStatus(): Promise<void> {
  console.log(chalk.blue('📊 SharePoint Integration Status'));
  console.log(chalk.gray('='.repeat(50)));
  
  try {
    const configManager = new SharePointConfigManager();
    
    // Configuration status
    console.log(chalk.blue('⚙️ Configuration:'));
    const status = configManager.getConfigurationStatus();
    
    if (!status.configured) {
      console.log(chalk.red('  ❌ Not configured'));
      console.log(chalk.yellow('  💡 Run: npm run sharepoint:init'));
      return;
    }
    
    console.log(chalk.green('  ✅ Configuration found'));
    
    const config = configManager.getSharePointConfig();
    console.log(chalk.blue(`  🌐 Site: ${config.siteUrl}`));
    console.log(chalk.blue(`  📚 Library: ${config.documentLibrary}`));
    console.log(chalk.blue(`  🔐 Auth: ${config.authMethod}`));
      // Authentication status
    console.log(chalk.blue('\n🔐 Authentication:'));
    if (config.oauth2) {
      const oauth2 = new SharePointOAuth2(createOAuth2Config(config));
      const isAuth = await oauth2.isAuthenticated();
      
      if (isAuth) {
        console.log(chalk.green('  ✅ Authenticated'));
        const account = await oauth2.getCurrentAccount();
        if (account) {
          console.log(chalk.blue(`  👤 Account: ${account.username}`));
        }
      } else {
        console.log(chalk.red('  ❌ Not authenticated'));
        console.log(chalk.yellow('  💡 Run: npm run sharepoint:oauth2:login'));
      }
    }
    
    // Connection test
    console.log(chalk.blue('\n📡 Connectivity:'));
    try {
      const publisher = new SharePointPublisher(config);
      await publisher.initialize();
      
      const testResult = await publisher.testConnection();
      if (testResult.success) {
        console.log(chalk.green('  ✅ Connection test successful'));
        if (testResult.siteInfo) {
          console.log(chalk.blue(`  📊 Site: ${testResult.siteInfo.displayName}`));
        }
      } else {
        console.log(chalk.red('  ❌ Connection test failed'));
        console.log(chalk.red(`  ${testResult.error || 'Unknown error'}`));
      }
      
    } catch (error) {
      console.log(chalk.red('  ❌ Connection failed'));
      console.log(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
    }
    
    // Environment variables
    console.log(chalk.blue('\n🌐 Environment Variables:'));
    const envVars = [
      'SHAREPOINT_TENANT_ID',
      'SHAREPOINT_CLIENT_ID', 
      'SHAREPOINT_SITE_URL',
      'SHAREPOINT_DOCUMENT_LIBRARY'
    ];
    
    for (const envVar of envVars) {
      const isSet = !!process.env[envVar];
      console.log(chalk.blue(`  ${envVar}: ${isSet ? '✅' : '❌'}`));
    }
    
    console.log(chalk.blue('\n📚 Available Commands:'));
    console.log(chalk.white('  npm run sharepoint:init          - Initialize configuration'));
    console.log(chalk.white('  npm run sharepoint:test          - Test connection'));
    console.log(chalk.white('  npm run sharepoint:oauth2:login  - Authenticate'));
    console.log(chalk.white('  npm run sharepoint:publish       - Publish documents'));
    console.log(chalk.white('  npm run sharepoint:status        - Show this status'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to get SharePoint status:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}
