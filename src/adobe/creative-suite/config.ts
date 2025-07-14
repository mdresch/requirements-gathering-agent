/**
 * Adobe Creative Suite Configuration
 * 
 * Configuration management for Adobe Creative Suite APIs including
 * InDesign Server, Illustrator, Photoshop, and Document Generation APIs.
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface CreativeSuiteConfig {
    authentication: {
        clientId: string;
        clientSecret: string;
        scopes: string[];
    };
    apis: {
        indesign: {
            endpoint: string;
            version: string;
        };
        illustrator: {
            endpoint: string;
            version: string;
        };
        photoshop: {
            endpoint: string;
            version: string;
        };
        documentGeneration: {
            endpoint: string;
            version: string;
        };
    };
    templates: {
        baseDirectory: string;
        cacheDirectory: string;
        supportedFormats: string[];
    };
    branding: {
        brandGuidelinesPath: string;
        colorPalettePath: string;
        typographyStylesPath: string;
        logoDirectory: string;
    };
    output: {
        formats: string[];
        quality: 'standard' | 'high' | 'print-ready';
        compression: boolean;
    };
}

export class CreativeSuiteConfigManager {
    private config: CreativeSuiteConfig;

    constructor() {
        this.config = this.loadConfiguration();
    }

    private loadConfiguration(): CreativeSuiteConfig {
        return {
            authentication: {
                clientId: process.env.ADOBE_CLIENT_ID || '',
                clientSecret: process.env.ADOBE_CLIENT_SECRET || '',
                scopes: [
                    'creative_sdk',
                    'indesign_api',
                    'illustrator_api',
                    'photoshop_api',
                    'document_generation'
                ]
            },
            apis: {
                indesign: {
                    endpoint: process.env.ADOBE_INDESIGN_API_ENDPOINT || 'https://api.adobe.io/indesign/v1',
                    version: 'v1'
                },
                illustrator: {
                    endpoint: process.env.ADOBE_ILLUSTRATOR_API_ENDPOINT || 'https://api.adobe.io/illustrator/v1',
                    version: 'v1'
                },
                photoshop: {
                    endpoint: process.env.ADOBE_PHOTOSHOP_API_ENDPOINT || 'https://api.adobe.io/photoshop/v1',
                    version: 'v1'
                },
                documentGeneration: {
                    endpoint: process.env.ADOBE_DOCUMENT_GEN_API_ENDPOINT || 'https://api.adobe.io/documentgeneration/v1',
                    version: 'v1'
                }
            },
            templates: {
                baseDirectory: './templates/adobe-creative',
                cacheDirectory: './cache/adobe-templates',
                supportedFormats: ['.indd', '.ai', '.psd', '.indt']
            },
            branding: {
                brandGuidelinesPath: './assets/branding/brand-guidelines.json',
                colorPalettePath: './assets/branding/color-palette.json',
                typographyStylesPath: './assets/branding/typography-styles.json',
                logoDirectory: './assets/branding/logos'
            },
            output: {
                formats: ['pdf', 'pdf-print', 'html', 'png', 'jpg'],
                quality: 'high',
                compression: false
            }
        };
    }

    getConfig(): CreativeSuiteConfig {
        return this.config;
    }

    validateConfiguration(): ConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate authentication
        if (!this.config.authentication.clientId) {
            errors.push('Adobe Creative Suite Client ID is required');
        }
        if (!this.config.authentication.clientSecret) {
            errors.push('Adobe Creative Suite Client Secret is required');
        }

        // Validate API endpoints
        Object.entries(this.config.apis).forEach(([apiName, apiConfig]) => {
            if (!apiConfig.endpoint) {
                warnings.push(`${apiName} API endpoint not configured`);
            }
        });

        // Validate directories
        if (!this.config.templates.baseDirectory) {
            warnings.push('Templates base directory not configured');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    updateConfig(updates: Partial<CreativeSuiteConfig>): void {
        this.config = { ...this.config, ...updates };
    }
}

export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Export singleton instance
export const creativeSuiteConfig = new CreativeSuiteConfigManager();
