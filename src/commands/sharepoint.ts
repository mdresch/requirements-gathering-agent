/**
 * SharePoint Command Handler
 * Handles SharePoint integration commands
 */

// 1. Node.js built-ins (none in this file)

// 2. Third-party dependencies (none in this file)

// 3. Internal modules
import {
  initSharePointConfig,
  testSharePointConnection,
  publishToSharePoint,
  showSharePointStatus,
  sharePointOAuth2Login,
  sharePointOAuth2Status,
  sharePointDebugOAuth2
} from '../modules/sharepoint/SharePointCLI.js';

export interface SharePointInitOptions {
  quiet?: boolean;
}

export interface SharePointTestOptions {
  quiet?: boolean;
}

export interface SharePointPublishOptions {
  documentsPath?: string;
  folderPath?: string;
  labelPrefix?: string;
  dryRun?: boolean;
  force?: boolean;
  quiet?: boolean;
}

export interface SharePointOAuth2Options {
  quiet?: boolean;
}

export interface SharePointStatusOptions {
  quiet?: boolean;
}

/**
 * Handler for 'sharepoint init' command
 */
export async function handleSharePointInitCommand(options: SharePointInitOptions = {}): Promise<void> {
  const { quiet } = options;
  
  if (!quiet) {
    console.log('🔧 Initializing SharePoint configuration...');
  }
  
  await initSharePointConfig();
  
  if (!quiet) {
    console.log('✅ SharePoint configuration initialized');
  }
}

/**
 * Handler for 'sharepoint test' command
 */
export async function handleSharePointTestCommand(options: SharePointTestOptions = {}): Promise<void> {
  const { quiet } = options;
  
  if (!quiet) {
    console.log('🔍 Testing SharePoint connection...');
  }
  
  await testSharePointConnection();
  
  if (!quiet) {
    console.log('✅ SharePoint connection test complete');
  }
}

/**
 * Handler for 'sharepoint publish' command
 */
export async function handleSharePointPublishCommand(options: SharePointPublishOptions = {}): Promise<void> {
  const { documentsPath = 'generated-documents', folderPath, labelPrefix, dryRun, force, quiet } = options;
  
  if (!quiet) {
    console.log('📤 Publishing documents to SharePoint...');
  }
  
  await publishToSharePoint(documentsPath, {
    folderPath,
    labelPrefix,
    dryRun,
    force
  });
  
  if (!quiet) {
    console.log('✅ SharePoint publishing complete');
  }
}

/**
 * Handler for 'sharepoint status' command
 */
export async function handleSharePointStatusCommand(options: SharePointStatusOptions = {}): Promise<void> {
  await showSharePointStatus();
}

/**
 * Handler for 'sharepoint oauth2 login' command
 */
export async function handleSharePointOAuth2LoginCommand(options: SharePointOAuth2Options = {}): Promise<void> {
  const { quiet } = options;
  
  if (!quiet) {
    console.log('🔐 Starting SharePoint OAuth2 authentication...');
  }
  
  await sharePointOAuth2Login();
  
  if (!quiet) {
    console.log('✅ SharePoint OAuth2 authentication complete');
  }
}

/**
 * Handler for 'sharepoint oauth2 status' command
 */
export async function handleSharePointOAuth2StatusCommand(options: SharePointOAuth2Options = {}): Promise<void> {
  await sharePointOAuth2Status();
}

/**
 * Handler for 'sharepoint oauth2 debug' command
 */
export async function handleSharePointOAuth2DebugCommand(options: SharePointOAuth2Options = {}): Promise<void> {
  await sharePointDebugOAuth2();
}
