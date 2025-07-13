/*
 * Adobe.io Environment Configuration
 * Loads Adobe.io credentials and settings from environment variables
 */

/**
 * Adobe.io configuration loaded from environment variables
 */
export interface AdobeConfig {
  clientId: string;
  clientSecret: string;
  organizationId: string;
  imsTokenUrl: string;
  pdfServicesUrl: string;
  documentGenerationUrl: string;
  scopes: string;
  pdfTimeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  debugMode: boolean;
  logRequests: boolean;
}

/**
 * Load Adobe.io configuration from environment variables
 * Call this function to get your Adobe.io settings
 */
export function loadAdobeConfig(): AdobeConfig {
  // Check if we're in Node.js environment (server-side)
  const isNode = typeof process !== 'undefined' && process.env;
  
  if (!isNode) {
    throw new Error('Adobe.io environment variables are only available in Node.js environment. ' +
      'For client-side Office Add-ins, you may need to pass credentials directly or use a server endpoint.');
  }

  // Load required environment variables
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;
  const organizationId = process.env.ADOBE_ORGANIZATION_ID;

  // Validate required variables
  if (!clientId || !clientSecret || !organizationId) {
    throw new Error(
      'Missing required Adobe.io environment variables. Please check your .env file:\n' +
      `- ADOBE_CLIENT_ID: ${clientId ? '✓' : '✗'}\n` +
      `- ADOBE_CLIENT_SECRET: ${clientSecret ? '✓' : '✗'}\n` +
      `- ADOBE_ORGANIZATION_ID: ${organizationId ? '✓' : '✗'}\n\n` +
      'Get these values from your Adobe Developer Console: https://developer.adobe.com/console'
    );
  }

  return {
    clientId,
    clientSecret,
    organizationId,
    imsTokenUrl: process.env.ADOBE_IMS_TOKEN_URL || 'https://ims-na1.adobelogin.com/ims/token',
    pdfServicesUrl: process.env.ADOBE_PDF_SERVICES_URL || 'https://pdf-services.adobe.io',
    documentGenerationUrl: process.env.ADOBE_DOCUMENT_GENERATION_URL || 'https://documentgeneration.adobe.io',
    scopes: process.env.ADOBE_SCOPES || 'openid,AdobeID,session,additional_info.projectedProductContext,additional_info.roles',
    pdfTimeoutMs: parseInt(process.env.ADOBE_PDF_TIMEOUT_MS || '300000'),
    maxRetries: parseInt(process.env.ADOBE_MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.ADOBE_RETRY_DELAY_MS || '5000'),
    debugMode: process.env.ADOBE_DEBUG_MODE === 'true',
    logRequests: process.env.ADOBE_LOG_REQUESTS === 'true'
  };
}

/**
 * Get Adobe.io credentials for client-side use (Office Add-in)
 * Note: Only use this pattern for development. In production, use a server endpoint.
 */
export function getAdobeCredentialsForClient(): { clientId: string; clientSecret: string; organizationId: string } {
  // WARNING: This exposes credentials to the client-side
  // Only use for development/testing purposes
  // In production, make Adobe API calls from a server endpoint
  
  // STEP 1: Replace these with your actual Adobe.io credentials
  // Get them from: https://developer.adobe.com/console
  const clientId = 'your_adobe_client_id_here';  // Your Adobe.io Client ID
  const clientSecret = 'your_adobe_client_secret_here';  // Your Adobe.io Client Secret
  const organizationId = 'your_adobe_organization_id_here';  // Your Adobe.io Organization ID

  // STEP 2: If you have environment variables set, they will override the above
  return {
    clientId: process.env.ADOBE_CLIENT_ID || clientId,
    clientSecret: process.env.ADOBE_CLIENT_SECRET || clientSecret,
    organizationId: process.env.ADOBE_ORGANIZATION_ID || organizationId
  };
}

/**
 * Validate Adobe.io configuration
 */
export function validateAdobeConfig(config: AdobeConfig): boolean {
  const requiredFields = ['clientId', 'clientSecret', 'organizationId'];
  
  for (const field of requiredFields) {
    if (!config[field as keyof AdobeConfig]) {
      console.error(`Adobe.io configuration missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate URLs
  const urlFields = ['imsTokenUrl', 'pdfServicesUrl', 'documentGenerationUrl'];
  for (const field of urlFields) {
    const url = config[field as keyof AdobeConfig] as string;
    if (!url.startsWith('https://')) {
      console.error(`Adobe.io configuration invalid URL for ${field}: ${url}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Log Adobe.io configuration (without sensitive data)
 */
export function logAdobeConfig(config: AdobeConfig): void {
  console.log('Adobe.io Configuration:', {
    clientId: config.clientId ? `${config.clientId.substring(0, 8)}...` : 'NOT_SET',
    organizationId: config.organizationId ? `${config.organizationId.substring(0, 8)}...` : 'NOT_SET',
    imsTokenUrl: config.imsTokenUrl,
    pdfServicesUrl: config.pdfServicesUrl,
    debugMode: config.debugMode,
    scopes: config.scopes
  });
}
