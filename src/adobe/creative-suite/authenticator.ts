/**
 * Adobe Creative Suite Authenticator
 * 
 * Handles authentication for Adobe Creative Suite APIs using OAuth 2.0
 * client credentials flow and JWT-based authentication.
 */

import { creativeSuiteConfig, type CreativeSuiteConfig } from './config.js';

export interface AuthenticationResult {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    scope: string[];
    issuedAt: Date;
}

export interface APICredentials {
    clientId: string;
    clientSecret: string;
    privateKey?: string;
    scopes: string[];
}

export class CreativeSuiteAuthenticator {
    private config: CreativeSuiteConfig;
    private cachedToken: AuthenticationResult | null = null;

    constructor() {
        this.config = creativeSuiteConfig.getConfig();
    }

    /**
     * Authenticate with Adobe Creative Suite APIs using client credentials flow
     */
    async authenticate(): Promise<AuthenticationResult> {
        // Check if we have a valid cached token
        if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
            return this.cachedToken;
        }

        try {
            // Validate configuration
            const validation = creativeSuiteConfig.validateConfiguration();
            if (!validation.isValid) {
                throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
            }

            // Perform OAuth 2.0 client credentials authentication
            const authResult = await this.performClientCredentialsAuth();
            
            // Cache the token
            this.cachedToken = authResult;
            
            return authResult;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
            throw new Error(`Adobe Creative Suite authentication failed: ${errorMessage}`);
        }
    }

    /**
     * Perform OAuth 2.0 client credentials authentication
     */
    private async performClientCredentialsAuth(): Promise<AuthenticationResult> {
        const tokenEndpoint = 'https://ims-na1.adobelogin.com/ims/token/v3';
        
        const requestBody = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.config.authentication.clientId,
            client_secret: this.config.authentication.clientSecret,
            scope: this.config.authentication.scopes.join(' ')
        });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: requestBody.toString()
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Authentication request failed: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const tokenData = await response.json() as {
            access_token: string;
            token_type?: string;
            expires_in?: number;
            scope?: string;
        };

        return {
            accessToken: tokenData.access_token,
            tokenType: tokenData.token_type || 'Bearer',
            expiresIn: tokenData.expires_in || 3600,
            scope: tokenData.scope ? tokenData.scope.split(' ') : this.config.authentication.scopes,
            issuedAt: new Date()
        };
    }

    /**
     * Check if a token is still valid
     */
    private isTokenValid(token: AuthenticationResult): boolean {
        const now = new Date();
        const expirationTime = new Date(token.issuedAt.getTime() + (token.expiresIn * 1000));
        
        // Consider token invalid if it expires within 5 minutes
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        return expirationTime.getTime() - now.getTime() > bufferTime;
    }

    /**
     * Get authentication headers for API requests
     */
    async getAuthHeaders(): Promise<Record<string, string>> {
        const authResult = await this.authenticate();
        
        return {
            'Authorization': `${authResult.tokenType} ${authResult.accessToken}`,
            'X-API-Key': this.config.authentication.clientId,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Validate current authentication status
     */
    async validateAuthentication(): Promise<AuthenticationValidationResult> {
        try {
            const authResult = await this.authenticate();
            
            return {
                isAuthenticated: true,
                tokenInfo: {
                    expiresAt: new Date(authResult.issuedAt.getTime() + (authResult.expiresIn * 1000)),
                    scopes: authResult.scope,
                    tokenType: authResult.tokenType
                },
                message: 'Authentication successful'
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
            return {
                isAuthenticated: false,
                error: errorMessage,
                message: 'Authentication failed'
            };
        }
    }

    /**
     * Clear cached authentication token
     */
    clearCache(): void {
        this.cachedToken = null;
    }

    /**
     * Test API connectivity with authenticated request
     */
    async testAPIConnectivity(): Promise<APIConnectivityResult> {
        try {
            const headers = await this.getAuthHeaders();
            const results: Record<string, boolean> = {};

            // Test each API endpoint
            const apis = [
                { name: 'indesign', endpoint: this.config.apis.indesign.endpoint },
                { name: 'illustrator', endpoint: this.config.apis.illustrator.endpoint },
                { name: 'photoshop', endpoint: this.config.apis.photoshop.endpoint },
                { name: 'documentGeneration', endpoint: this.config.apis.documentGeneration.endpoint }
            ];

            for (const api of apis) {
                try {
                    const response = await fetch(`${api.endpoint}/health`, {
                        method: 'GET',
                        headers
                    });
                    results[api.name] = response.ok;
                } catch (error) {
                    results[api.name] = false;
                }
            }

            const allConnected = Object.values(results).every(connected => connected);

            return {
                allAPIsConnected: allConnected,
                apiStatus: results,
                message: allConnected ? 'All APIs connected successfully' : 'Some APIs failed to connect'
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown connectivity error';
            return {
                allAPIsConnected: false,
                apiStatus: {},
                error: errorMessage,
                message: 'API connectivity test failed'
            };
        }
    }
}

export interface AuthenticationValidationResult {
    isAuthenticated: boolean;
    tokenInfo?: {
        expiresAt: Date;
        scopes: string[];
        tokenType: string;
    };
    error?: string;
    message: string;
}

export interface APIConnectivityResult {
    allAPIsConnected: boolean;
    apiStatus: Record<string, boolean>;
    error?: string;
    message: string;
}

// Export singleton instance
export const creativeSuiteAuth = new CreativeSuiteAuthenticator();
