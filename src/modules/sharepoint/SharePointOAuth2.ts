/**
 * SharePoint OAuth2 Authentication Handler
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Handles OAuth 2.0 authentication flow for Microsoft Graph API and SharePoint access.
 * Implements MSAL (Microsoft Authentication Library) for secure token management.
 * 
 * Features:
 * - Interactive authentication flow
 * - Token refresh and caching
 * - Multi-tenant support
 * - Device code flow for headless environments
 * - Secure token storage
 */

import { 
    PublicClientApplication, 
    Configuration, 
    AuthenticationResult, 
    AccountInfo,
    DeviceCodeRequest,
    SilentFlowRequest,
    InteractiveRequest
} from '@azure/msal-node';
import { TokenResponse, OAuth2Config } from './types.js';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { URL } from 'url';

export class SharePointOAuth2 {
    private config: OAuth2Config;
    private msalApp: PublicClientApplication;
    private tokenCache: Map<string, TokenResponse> = new Map();
    private cacheFilePath: string;

    constructor(config: OAuth2Config) {
        this.config = config;
        this.cacheFilePath = config.cacheLocation || path.join(process.cwd(), '.sharepoint-cache.json');
          // Configure MSAL
        const msalConfig: Configuration = {
            auth: {
                clientId: config.clientId,
                authority: config.authority || `https://login.microsoftonline.com/${config.tenantId}`,
                knownAuthorities: [`${config.tenantId}.b2clogin.com`]
            },
            system: {
                loggerOptions: {
                    loggerCallback: (level, message, containsPii) => {
                        if (!containsPii) {
                            console.log(`[MSAL ${level}] ${message}`);
                        }
                    },
                    piiLoggingEnabled: false,
                    logLevel: 3 // Info level
                }
            }
        };

        this.msalApp = new PublicClientApplication(msalConfig);
        this.loadTokenCache();
    }

    /**
     * Start interactive OAuth2 authentication flow
     * @returns Promise with authentication result
     */    async startInteractiveFlow(): Promise<AuthenticationResult> {
        try {
            console.log('🔐 Starting device code authentication (recommended for CLI)...');
            return await this.startDeviceCodeFlow();

        } catch (error: any) {
            console.error('❌ Authentication failed:', error.message);
            throw error;
        }
    }

    /**
     * Start device code authentication flow (for headless environments)
     * @returns Promise with authentication result
     */
    async startDeviceCodeFlow(): Promise<AuthenticationResult> {
        try {
            const request: DeviceCodeRequest = {
                scopes: this.config.scopes,
                deviceCodeCallback: (response) => {
                    console.log('\n🔑 Device Code Authentication');
                    console.log(`   Go to: ${response.verificationUri}`);
                    console.log(`   Enter code: ${response.userCode}`);
                    console.log('   Waiting for authentication...\n');
                }
            };

            console.log('🔐 Starting device code authentication...');
            
            const authResult = await this.msalApp.acquireTokenByDeviceCode(request);
            
            if (authResult) {
                await this.saveTokenCache(authResult);
                console.log('✅ Device code authentication successful');
                return authResult;
            } else {
                throw new Error('Device code authentication failed');
            }

        } catch (error: any) {
            console.error('❌ Device code authentication failed:', error.message);
            throw error;
        }
    }

    /**
     * Get valid access token (handles refresh automatically)
     * @returns Valid access token
     */
    async getValidAccessToken(): Promise<string> {
        try {            // Try to get cached account
            const accounts = await this.msalApp.getTokenCache().getAllAccounts();
            
            if (accounts.length === 0) {
                throw new Error('No cached accounts found. Please authenticate first.');
            }

            const account = accounts[0];
            
            // Try silent token acquisition
            const silentRequest: SilentFlowRequest = {
                scopes: this.config.scopes,
                account: account
            };

            try {
                const result = await this.msalApp.acquireTokenSilent(silentRequest);
                if (result?.accessToken) {
                    return result.accessToken;
                }
            } catch (silentError) {
                console.log('⚠️ Silent token acquisition failed, trying refresh...');
            }

            // If silent acquisition fails, try interactive flow
            console.log('🔄 Refreshing authentication...');
            const authResult = await this.startInteractiveFlow();
            return authResult.accessToken;

        } catch (error: any) {
            console.error('❌ Failed to get valid access token:', error.message);
            throw error;
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns Boolean indicating authentication status
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const accounts = await this.msalApp.getTokenCache().getAllAccounts();
            return accounts.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current user account information
     * @returns Account information or null
     */
    async getCurrentAccount(): Promise<AccountInfo | null> {
        try {
            const accounts = await this.msalApp.getTokenCache().getAllAccounts();
            return accounts.length > 0 ? accounts[0] : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
        try {
            const accounts = await this.msalApp.getTokenCache().getAllAccounts();
            
            for (const account of accounts) {
                await this.msalApp.getTokenCache().removeAccount(account);
            }
            
            // Clear local cache
            this.tokenCache.clear();
            if (fs.existsSync(this.cacheFilePath)) {
                fs.unlinkSync(this.cacheFilePath);
            }
            
            console.log('✅ Successfully signed out');
        } catch (error: any) {
            console.error('❌ Sign out error:', error.message);
            throw error;
        }
    }    /**
     * Load token cache from file
     */
    private loadTokenCache(): void {
        try {
            if (fs.existsSync(this.cacheFilePath)) {
                const cacheData = fs.readFileSync(this.cacheFilePath, 'utf-8');
                const cache = JSON.parse(cacheData);
                this.tokenCache = new Map(Object.entries(cache));
                console.log('✅ Token cache loaded');
            }
        } catch (error) {
            console.log('⚠️ Could not load token cache, starting fresh');
            this.tokenCache = new Map();
        }
    }

    /**
     * Save token cache to file
     * @param authResult Authentication result to cache
     */
    private async saveTokenCache(authResult: AuthenticationResult): Promise<void> {        try {
            const cacheData = {
                accessToken: authResult.accessToken,
                expiresOn: authResult.expiresOn?.toISOString(),
                account: authResult.account
            };
            
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(cacheData, null, 2));
            console.log('✅ Token cache saved');
        } catch (error: any) {
            console.warn('⚠️ Could not save token cache:', error.message);
        }
    }
}
