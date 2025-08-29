/**
 * Confluence OAuth 2.0 (3LO) Authentication Handler
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Handles OAuth 2.0 authentication flow for Confluence Cloud
 * Features:
 * - Authorization URL generation
 * - Token exchange and refresh
 * - Secure token storage
 * - Automatic token refresh
 */

import axios from 'axios';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface OAuth2Config {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    baseUrl?: string;
}

export interface OAuth2Tokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    expires_at?: number;
}

export interface AccessibleResource {
    id: string;
    name: string;
    url: string;
    scopes: string[];
    avatarUrl?: string;
}

/**
 * OAuth 2.0 Authentication Handler for Confluence
 */
export class ConfluenceOAuth2 {
    private config: OAuth2Config;
    private tokens: OAuth2Tokens | null = null;
    private tokenFilePath: string;

    constructor(config: OAuth2Config) {
        this.config = config;
        this.tokenFilePath = join(process.cwd(), '.confluence-tokens.json');
        this.loadStoredTokens();
    }

    /**
     * Generate authorization URL for OAuth 2.0 flow
     */    getAuthorizationUrl(): string {
        const state = this.generateState();
        const params = new URLSearchParams({
            audience: 'api.atlassian.com',
            client_id: this.config.clientId,
            scope: this.config.scopes.join(' '),
            redirect_uri: this.config.redirectUri,
            state: state,
            response_type: 'code',
            prompt: 'consent'
        });

        const authUrl = `https://auth.atlassian.com/authorize?${params.toString()}`;
        
        // Log the generated URL for debugging
        console.log('\n🔗 OAuth 2.0 Authorization URL Generated:');
        console.log('━'.repeat(60));
        console.log(`URL: ${authUrl}`);
        console.log(`Client ID: ${this.config.clientId}`);
        console.log(`Redirect URI: ${this.config.redirectUri}`);
        console.log(`Scopes: ${this.config.scopes.join(', ')}`);
        console.log(`State: ${state}`);
        console.log('━'.repeat(60));
        console.log('📋 Next Steps:');
        console.log('1. Click the URL above or copy it to your browser');
        console.log('2. Log in to your Atlassian account');
        console.log('3. Grant permissions to the application');
        console.log('4. You will be redirected back to the callback URL');
        console.log('━'.repeat(60));

        return authUrl;
    }

    /**
     * Start OAuth 2.0 authorization flow with local server
     */
    async startAuthorizationFlow(): Promise<OAuth2Tokens> {
        return new Promise((resolve, reject) => {
            const app = express();
            const server = createServer(app);
            
            // Handle the OAuth callback
            app.get('/callback', async (req: Request, res: Response) => {
                try {
                    const { code, state } = req.query;
                    
                    if (!code) {
                        throw new Error('Authorization code not received');
                    }

                    // Exchange code for tokens
                    const tokens = await this.exchangeCodeForTokens(code as string);
                    
                    res.send(`
                        <html>
                            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                <h1 style="color: green;">✅ Authorization Successful!</h1>
                                <p>ADPA now has access to your Confluence. You can close this window.</p>
                                <p>Return to your terminal to continue.</p>
                            </body>
                        </html>
                    `);
                    
                    server.close();
                    resolve(tokens);
                    
                } catch (error: any) {
                    res.send(`
                        <html>
                            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                <h1 style="color: red;">❌ Authorization Failed</h1>
                                <p>Error: ${error.message}</p>
                                <p>Please try again or check your configuration.</p>
                            </body>
                        </html>
                    `);
                    server.close();
                    reject(error);
                }
            });

            // Start server
            const port = new URL(this.config.redirectUri).port || '3000';
            server.listen(parseInt(port), () => {
                const authUrl = this.getAuthorizationUrl();
                console.log(`🔗 Please open this URL in your browser to authorize ADPA:`);
                console.log(`\n${authUrl}\n`);
                console.log(`⏳ Waiting for authorization...`);
                
                // Auto-open browser (optional)
                (async () => {
                    try {
                        const cp = await import('child_process');
                        cp.exec(`start "" "${authUrl}"`); // Windows
                    } catch (e) {
                        // Ignore if can't auto-open
                    }
                })();
            });

            // Timeout after 5 minutes
            setTimeout(() => {
                server.close();
                reject(new Error('Authorization timeout - please try again'));
            }, 5 * 60 * 1000);
        });
    }

    /**
     * Exchange authorization code for access tokens
     */
    async exchangeCodeForTokens(code: string): Promise<OAuth2Tokens> {
        try {
            const response = await axios.post('https://auth.atlassian.com/oauth/token', {
                grant_type: 'authorization_code',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                code: code,
                redirect_uri: this.config.redirectUri
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const tokens: OAuth2Tokens = response.data;
            tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
            
            this.tokens = tokens;
            this.saveTokens();
            
            return tokens;
            
        } catch (error: any) {
            throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Get valid access token (refresh if needed)
     */
    async getValidAccessToken(): Promise<string> {
        if (!this.tokens) {
            throw new Error('No tokens available - please authorize first');
        }

        // Check if token is expired (refresh 5 minutes before expiry)
        const expiresAt = this.tokens.expires_at || 0;
        const refreshThreshold = Date.now() + (5 * 60 * 1000); // 5 minutes

        if (expiresAt < refreshThreshold) {
            await this.refreshTokens();
        }

        return this.tokens.access_token;
    }    /**
     * Refresh access tokens using rotating refresh token
     * Follows Atlassian's rotating refresh token implementation
     */
    async refreshTokens(): Promise<OAuth2Tokens> {
        if (!this.tokens?.refresh_token) {
            throw new Error('No refresh token available - please re-authorize');
        }

        try {
            console.log('🔄 Refreshing access token with rotating refresh token...');
            
            const response = await fetch('https://auth.atlassian.com/oauth/token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  grant_type: 'refresh_token',
                  client_id: this.config.clientId,
                  client_secret: this.config.clientSecret,
                  refresh_token: this.tokens.refresh_token
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Token refresh failed: ${response.status} ${errorData}`);
            }            const json: any = await response.json();
            
            // Update access token
            this.tokens.access_token = json.access_token;
            this.tokens.token_type = json.token_type || 'Bearer';
            this.tokens.expires_in = json.expires_in;
            this.tokens.expires_at = Date.now() + (json.expires_in * 1000);
            this.tokens.scope = json.scope;
            
            // CRITICAL: Replace old refresh token with new rotating refresh token
            if (json.refresh_token) { 
                console.log('🔄 Updating to new rotating refresh token');
                this.tokens.refresh_token = json.refresh_token;
            }
            
            // Save updated tokens with new rotating refresh token
            this.saveTokens();
            
            console.log('✅ Access token refreshed successfully');
            console.log('   New token expires in:', json.expires_in, 'seconds');
            console.log('   New refresh token received:', !!json.refresh_token);
            
            return this.tokens;
            
        } catch (error: any) {
            // If refresh fails, clear tokens and require re-authorization
            this.clearTokens();
            throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Get accessible Confluence resources
     */
    async getAccessibleResources(): Promise<AccessibleResource[]> {
        const accessToken = await this.getValidAccessToken();
        
        try {
            const response = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            return response.data;
            
        } catch (error: any) {
            throw new Error(`Failed to get accessible resources: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Find Cloud ID for a specific site URL
     */
    async findCloudId(siteUrl: string): Promise<string | null> {
        const resources = await this.getAccessibleResources();
        const resource = resources.find(r => r.url === siteUrl);
        return resource?.id || null;
    }

    /**
     * Check if currently authorized
     */
    isAuthorized(): boolean {
        return this.tokens !== null && this.tokens.access_token !== undefined;
    }

    /**
     * Check if tokens are expired
     */
    isTokenExpired(): boolean {
        if (!this.tokens?.expires_at) return true;
        return Date.now() >= this.tokens.expires_at;
    }

    /**
     * Get current token status
     */
    getTokenStatus(): {
        authorized: boolean;
        expired: boolean;
        expiresIn: number | null;
        scopes: string[];
    } {
        return {
            authorized: this.isAuthorized(),
            expired: this.isTokenExpired(),
            expiresIn: this.tokens?.expires_at ? Math.max(0, this.tokens.expires_at - Date.now()) : null,
            scopes: this.tokens?.scope?.split(' ') || []
        };
    }

    /**
     * Revoke tokens and clear storage
     */
    async revokeAuthorization(): Promise<void> {
        if (this.tokens?.access_token) {
            try {
                await axios.post('https://auth.atlassian.com/oauth/token/revoke', {
                    token: this.tokens.access_token
                }, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                // Ignore revoke errors - clear tokens anyway
            }
        }
        
        this.clearTokens();
    }

    /**
     * Load stored tokens from disk
     */
    private loadStoredTokens(): void {
        try {
            if (existsSync(this.tokenFilePath)) {
                const tokenData = readFileSync(this.tokenFilePath, 'utf-8');
                this.tokens = JSON.parse(tokenData);
            }
        } catch (error) {
            // Ignore loading errors - will require re-authorization
            this.tokens = null;
        }
    }

    /**
     * Save tokens to disk
     */
    private saveTokens(): void {
        try {
            if (this.tokens) {
                writeFileSync(this.tokenFilePath, JSON.stringify(this.tokens, null, 2), 'utf-8');
            }
        } catch (error) {
            console.warn('Failed to save tokens to disk:', error);
        }
    }

    /**
     * Clear tokens from memory and disk
     */
    private clearTokens(): void {
        this.tokens = null;
        try {
            if (existsSync(this.tokenFilePath)) {
                require('fs').unlinkSync(this.tokenFilePath);
            }
        } catch (error) {
            // Ignore file deletion errors
        }
    }

    /**
     * Generate random state parameter for OAuth security
     */
    private generateState(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

/**
 * Factory function to create OAuth 2.0 handler from environment variables
 */
export function createConfluenceOAuth2(): ConfluenceOAuth2 {
    const config: OAuth2Config = {
        clientId: process.env.CONFLUENCE_CLIENT_ID || '',
        clientSecret: process.env.CONFLUENCE_CLIENT_SECRET || '',
        redirectUri: process.env.CONFLUENCE_REDIRECT_URI || 'http://localhost:3000/callback',
        scopes: (process.env.CONFLUENCE_SCOPES || 'read:confluence-content.all,write:confluence-content,read:confluence-space.summary,read:confluence-user').split(','),
        baseUrl: process.env.CONFLUENCE_BASE_URL
    };

    if (!config.clientId || !config.clientSecret) {
        throw new Error('OAuth 2.0 configuration incomplete. Please set CONFLUENCE_CLIENT_ID and CONFLUENCE_CLIENT_SECRET environment variables.');
    }

    return new ConfluenceOAuth2(config);
}
