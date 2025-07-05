/**
 * Confluence Command Handler
 * Handles Confluence integration commands
 */

// 1. Node.js built-ins (none in this file)

// 2. Third-party dependencies (none in this file)

// 3. Internal modules
import { 
  initConfluenceConfig,
  testConfluenceConnection,
  publishToConfluence,
  showConfluenceStatus,
  confluenceOAuth2Login,
  confluenceOAuth2Status,
  confluenceDebugOAuth2
} from '../modules/confluence/ConfluenceCLI.js';

export interface ConfluenceInitOptions {
  quiet?: boolean;
}

export interface ConfluenceTestOptions {
  quiet?: boolean;
}

export interface ConfluencePublishOptions {
  documentsPath?: string;
  parentPageTitle?: string;
  labelPrefix?: string;
  dryRun?: boolean;
  force?: boolean;
  quiet?: boolean;
}

export interface ConfluenceOAuth2Options {
  quiet?: boolean;
}

export interface ConfluenceStatusOptions {
  quiet?: boolean;
}

/**
 * Handler for 'confluence init' command
 */
export async function handleConfluenceInitCommand(options: ConfluenceInitOptions = {}): Promise<void> {
  const { quiet } = options;
  
  if (!quiet) {
    console.log('🔧 Initializing Confluence configuration...');
  }
  
  await initConfluenceConfig();
  
  if (!quiet) {
    console.log('✅ Confluence configuration initialized');
  }
}

/**
 * Handler for 'confluence test' command
 */
export async function handleConfluenceTestCommand(options: ConfluenceTestOptions = {}): Promise<void> {
  const { quiet } = options;
  
  if (!quiet) {
    console.log('🔍 Testing Confluence connection...');
  }
  
  await testConfluenceConnection();
  
  if (!quiet) {
    console.log('✅ Confluence connection test complete');
  }
}

/**
 * Handler for 'confluence publish' command
 */
export async function handleConfluencePublishCommand(options: ConfluencePublishOptions = {}): Promise<void> {
  const { documentsPath, parentPageTitle, labelPrefix, dryRun, force, quiet } = options;
  
  if (!quiet) {
    console.log('📤 Publishing documents to Confluence...');
  }
  
  await publishToConfluence(documentsPath, {
    parentPageTitle,
    labelPrefix,
    dryRun,
    force
  });
  
  if (!quiet) {
    console.log('✅ Confluence publishing complete');
  }
}

/**
 * Handler for 'confluence status' command
 */
export async function handleConfluenceStatusCommand(options: ConfluenceStatusOptions = {}): Promise<void> {
  await showConfluenceStatus();
}

/**
 * Handler for 'confluence oauth2 login' command
 */
export async function handleConfluenceOAuth2LoginCommand(options: ConfluenceOAuth2Options = {}): Promise<void> {
  const { quiet } = options;
  
  if (!quiet) {
    console.log('🔐 Starting Confluence OAuth2 authentication...');
  }
  
  await confluenceOAuth2Login();
  
  if (!quiet) {
    console.log('✅ Confluence OAuth2 authentication complete');
  }
}

/**
 * Handler for 'confluence oauth2 status' command
 */
export async function handleConfluenceOAuth2StatusCommand(options: ConfluenceOAuth2Options = {}): Promise<void> {
  await confluenceOAuth2Status();
}

/**
 * Handler for 'confluence oauth2 debug' command
 */
export async function handleConfluenceOAuth2DebugCommand(options: ConfluenceOAuth2Options = {}): Promise<void> {
  await confluenceDebugOAuth2();
}
