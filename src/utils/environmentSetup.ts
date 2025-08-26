/**
 * Environment Setup and Configuration Validation Utility
 * 
 * Provides comprehensive environment configuration validation, setup guidance,
 * and automatic configuration optimization for AI providers.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * Key Features:
 * - Environment validation and setup
 * - Provider configuration verification
 * - Automatic optimization recommendations
 * - Interactive setup wizard
 * - Configuration health monitoring
 * 
 * @filepath src/utils/environmentSetup.ts
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AIProvider } from '../modules/ai/types.js';
import { PROVIDER_DEFINITIONS, getProviderById } from '../modules/ai/provider-definitions.js';

export interface EnvironmentValidationResult {
    isValid: boolean;
    configuredProviders: AIProvider[];
    availableProviders: AIProvider[];
    missingRequiredVars: string[];
    recommendations: string[];
    warnings: string[];
    errors: string[];
    optimizations: string[];
}

export interface ProviderSetupStatus {
    provider: AIProvider;
    configured: boolean;
    available: boolean;
    connected: boolean;
    missingVars: string[];
    setupComplexity: 'easy' | 'medium' | 'advanced';
    estimatedSetupTime: string;
    recommendation: string;
}

export class EnvironmentSetup {
    private static instance: EnvironmentSetup;
    
    private constructor() {}

    public static getInstance(): EnvironmentSetup {
        if (!EnvironmentSetup.instance) {
            EnvironmentSetup.instance = new EnvironmentSetup();
        }
        return EnvironmentSetup.instance;
    }

    /**
     * Validate the current environment configuration
     */
    public async validateEnvironment(): Promise<EnvironmentValidationResult> {
        console.log('🔍 Validating environment configuration...');
        
        const result: EnvironmentValidationResult = {
            isValid: false,
            configuredProviders: [],
            availableProviders: [],
            missingRequiredVars: [],
            recommendations: [],
            warnings: [],
            errors: [],
            optimizations: []
        };

        // Check each provider
        for (const providerDef of PROVIDER_DEFINITIONS) {
            const status = await this.checkProviderStatus(providerDef.id as AIProvider);
            
            if (status.configured) {
                result.configuredProviders.push(providerDef.id as AIProvider);
            }
            
            if (status.available) {
                result.availableProviders.push(providerDef.id as AIProvider);
            }
            
            result.missingRequiredVars.push(...status.missingVars);
        }

        // Generate recommendations
        result.recommendations = this.generateRecommendations(result);
        result.warnings = this.generateWarnings(result);
        result.errors = this.generateErrors(result);
        result.optimizations = this.generateOptimizations(result);

        // Determine if configuration is valid
        result.isValid = result.configuredProviders.length > 0 && result.errors.length === 0;

        return result;
    }

    /**
     * Check the status of a specific provider
     */
    public async checkProviderStatus(providerId: AIProvider): Promise<ProviderSetupStatus> {
        const providerDef = getProviderById(providerId);
        if (!providerDef) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        const missingVars: string[] = [];
        
        // Check required environment variables
        for (const envVar of providerDef.requiredEnvVars) {
            if (!process.env[envVar]) {
                missingVars.push(envVar);
            }
        }

        const configured = await providerDef.check();
        const available = configured ? await providerDef.isAvailable() : false;
        const connected = configured && available;

        return {
            provider: providerId,
            configured,
            available,
            connected,
            missingVars,
            setupComplexity: providerDef.setupGuide.difficulty,
            estimatedSetupTime: providerDef.setupGuide.estimatedTime,
            recommendation: providerDef.recommendation ?? ''
        };
    }

    /**
     * Generate setup recommendations based on current configuration
     */
    private generateRecommendations(result: EnvironmentValidationResult): string[] {
        const recommendations: string[] = [];

        // No providers configured
        if (result.configuredProviders.length === 0) {
            recommendations.push(
                '🚀 Quick Start: Configure Google AI Studio for free tier access with generous limits'
            );
            recommendations.push(
                '💡 Alternative: Set up GitHub AI if you have a GitHub account for free GPT-4o-mini access'
            );
        }

        // Only one provider configured
        if (result.configuredProviders.length === 1) {
            recommendations.push(
                '🔄 Reliability: Configure a second provider for automatic fallback support'
            );
            recommendations.push(
                '⚡ Performance: Enable provider fallback to maximize uptime'
            );
        }

        // No fallback enabled
        if (result.configuredProviders.length > 1 && process.env.ENABLE_PROVIDER_FALLBACK !== 'true') {
            recommendations.push(
                '🔧 Enable automatic provider fallback by setting ENABLE_PROVIDER_FALLBACK=true'
            );
        }

        // Performance optimizations
        if (!process.env.ENABLE_REQUEST_CACHING) {
            recommendations.push(
                '⚡ Enable request caching for better performance: ENABLE_REQUEST_CACHING=true'
            );
        }

        if (!process.env.ENABLE_METRICS) {
            recommendations.push(
                '📊 Enable metrics collection for monitoring: ENABLE_METRICS=true'
            );
        }

        return recommendations;
    }

    /**
     * Generate warnings based on current configuration
     */
    private generateWarnings(result: EnvironmentValidationResult): string[] {
        const warnings: string[] = [];

        // High timeout values
        const aiTimeout = parseInt(process.env.AI_TIMEOUT || '60000');
        if (aiTimeout > 120000) {
            warnings.push(
                `⚠️ AI_TIMEOUT is very high (${aiTimeout}ms). Consider reducing for better responsiveness`
            );
        }

        // Debug logging in production
        if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_LOGGING === 'true') {
            warnings.push(
                '⚠️ Debug logging is enabled in production. This may impact performance and security'
            );
        }

        // Logging AI requests
        if (process.env.LOG_AI_REQUESTS === 'true') {
            warnings.push(
                '⚠️ AI request logging is enabled. This may log sensitive data'
            );
        }

        // No health monitoring
        if (result.configuredProviders.length > 1 && !process.env.PROVIDER_HEALTH_CHECK_INTERVAL) {
            warnings.push(
                '⚠️ Provider health monitoring is not configured. Set PROVIDER_HEALTH_CHECK_INTERVAL'
            );
        }

        return warnings;
    }

    /**
     * Generate errors based on current configuration
     */
    private generateErrors(result: EnvironmentValidationResult): string[] {
        const errors: string[] = [];

        // No providers configured
        if (result.configuredProviders.length === 0) {
            errors.push(
                '❌ No AI providers are configured. At least one provider must be set up'
            );
        }

        // Invalid fallback order
        const fallbackOrder = process.env.PROVIDER_FALLBACK_ORDER;
        if (fallbackOrder) {
            const providers = fallbackOrder.split(',').map(p => p.trim());
            const invalidProviders = providers.filter(p => !PROVIDER_DEFINITIONS.find(def => def.id === p));
            if (invalidProviders.length > 0) {
                errors.push(
                    `❌ Invalid providers in PROVIDER_FALLBACK_ORDER: ${invalidProviders.join(', ')}`
                );
            }
        }

        // Missing primary provider
        const primaryProvider = process.env.PRIMARY_AI_PROVIDER;
        if (primaryProvider && !result.configuredProviders.includes(primaryProvider as AIProvider)) {
            errors.push(
                `❌ Primary provider ${primaryProvider} is not configured`
            );
        }

        return errors;
    }

    /**
     * Generate optimization suggestions
     */
    private generateOptimizations(result: EnvironmentValidationResult): string[] {
        const optimizations: string[] = [];

        // Suggest optimal provider order
        if (result.configuredProviders.length > 1) {
            const optimalOrder = this.getOptimalProviderOrder(result.configuredProviders);
            optimizations.push(
                `🎯 Optimal provider order: ${optimalOrder.join(' → ')}`
            );
        }

        // Suggest performance settings
        const healthCheckInterval = parseInt(process.env.PROVIDER_HEALTH_CHECK_INTERVAL || '300000');
        if (healthCheckInterval > 600000) {
            optimizations.push(
                '⚡ Consider reducing PROVIDER_HEALTH_CHECK_INTERVAL for faster failure detection'
            );
        }

        // Suggest caching settings
        const cacheEnabled = process.env.ENABLE_REQUEST_CACHING === 'true';
        const cacheTtl = parseInt(process.env.CACHE_TTL || '3600000');
        if (cacheEnabled && cacheTtl > 7200000) {
            optimizations.push(
                '🔄 Consider reducing CACHE_TTL for fresher responses in dynamic environments'
            );
        }

        return optimizations;
    }

    /**
     * Get optimal provider order based on performance characteristics
     */
    private getOptimalProviderOrder(configuredProviders: AIProvider[]): AIProvider[] {
        // Priority order based on performance and reliability
        const priorityOrder: AIProvider[] = [
            'google-ai',        // Free tier, large context, fast
            'github-ai',        // Free for GitHub users, reliable
            'azure-openai-entra', // Enterprise reliability
            'azure-openai-key', // Good reliability, simpler setup
            'ollama'            // Local, privacy-focused
        ];

        return priorityOrder.filter(provider => configuredProviders.includes(provider));
    }

    /**
     * Create environment file from template
     */
    public createEnvironmentFile(
        template: 'production' | 'development' = 'development',
        outputPath: string = '.env'
    ): void {
        const templatePath = `.env.${template}.template`;
        
        if (!existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templatePath}`);
        }

        if (existsSync(outputPath)) {
            const backup = `${outputPath}.backup.${Date.now()}`;
            console.log(`📋 Backing up existing .env to ${backup}`);
            const content = readFileSync(outputPath, 'utf-8');
            writeFileSync(backup, content);
        }

        const templateContent = readFileSync(templatePath, 'utf-8');
        writeFileSync(outputPath, templateContent);
        
        console.log(`✅ Created ${outputPath} from ${templatePath}`);
        console.log('📝 Please edit the file and add your API keys and configuration');
    }

    /**
     * Interactive setup wizard
     */
    public async runSetupWizard(): Promise<void> {
        console.log('🧙 Starting ADPA Environment Setup Wizard...\n');

        const validation = await this.validateEnvironment();
        
        // Display current status
        this.displayValidationResults(validation);

        // Provide setup guidance
        if (!validation.isValid) {
            console.log('\n🚀 Setup Recommendations:');
            console.log('=' .repeat(50));
            
            // Recommend easiest provider to set up
            const easyProviders = PROVIDER_DEFINITIONS
                .filter(p => p.setupGuide.difficulty === 'easy')
                .sort((a, b) => a.priority - b.priority);

            if (easyProviders.length > 0) {
                const recommended = easyProviders[0];
                console.log(`\n1. 🎯 Recommended: ${recommended.displayName}`);
                console.log(`   ${recommended.description}`);
                console.log(`   Setup time: ${recommended.setupGuide.estimatedTime}`);
                console.log(`   Required: ${recommended.requiredEnvVars.join(', ')}`);
                
                if (recommended.setupGuide.helpLinks.length > 0) {
                    console.log('   Help links:');
                    recommended.setupGuide.helpLinks.forEach(link => {
                        console.log(`   - ${link.title}: ${link.url}`);
                    });
                }
            }

            console.log('\n2. 📋 Create environment file:');
            console.log('   Run: npm run setup:env');
            console.log('   Or manually copy .env.development.template to .env');

            console.log('\n3. 🔧 Configure your providers:');
            console.log('   Edit .env file with your API keys');

            console.log('\n4. ✅ Validate setup:');
            console.log('   Run: npm run validate:env');
        }
    }

    /**
     * Display validation results in a formatted way
     */
    public displayValidationResults(result: EnvironmentValidationResult): void {
        console.log('📊 Environment Configuration Status');
        console.log('=' .repeat(50));
        
        // Overall status
        const statusIcon = result.isValid ? '✅' : '❌';
        const statusText = result.isValid ? 'VALID' : 'INVALID';
        console.log(`${statusIcon} Overall Status: ${statusText}\n`);

        // Configured providers
        console.log('🔧 Configured Providers:');
        if (result.configuredProviders.length > 0) {
            result.configuredProviders.forEach(provider => {
                const providerDef = getProviderById(provider);
                console.log(`  ✅ ${providerDef?.displayName || provider}`);
            });
        } else {
            console.log('  ❌ No providers configured');
        }

        // Available providers
        console.log('\n🌐 Available Providers:');
        if (result.availableProviders.length > 0) {
            result.availableProviders.forEach(provider => {
                const providerDef = getProviderById(provider);
                console.log(`  ✅ ${providerDef?.displayName || provider}`);
            });
        } else {
            console.log('  ❌ No providers available');
        }

        // Errors
        if (result.errors.length > 0) {
            console.log('\n❌ Errors:');
            result.errors.forEach(error => console.log(`  ${error}`));
        }

        // Warnings
        if (result.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            result.warnings.forEach(warning => console.log(`  ${warning}`));
        }

        // Recommendations
        if (result.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            result.recommendations.forEach(rec => console.log(`  ${rec}`));
        }

        // Optimizations
        if (result.optimizations.length > 0) {
            console.log('\n⚡ Optimizations:');
            result.optimizations.forEach(opt => console.log(`  ${opt}`));
        }
    }

    /**
     * Generate configuration report
     */
    public async generateConfigurationReport(): Promise<string> {
        const validation = await this.validateEnvironment();
        const timestamp = new Date().toISOString();
        
        let report = `# ADPA Environment Configuration Report\n\n`;
        report += `Generated: ${timestamp}\n\n`;
        
        report += `## Overall Status\n`;
        report += `- **Valid**: ${validation.isValid ? 'Yes' : 'No'}\n`;
        report += `- **Configured Providers**: ${validation.configuredProviders.length}\n`;
        report += `- **Available Providers**: ${validation.availableProviders.length}\n\n`;
        
        report += `## Provider Details\n\n`;
        for (const providerId of PROVIDER_DEFINITIONS.map(p => p.id as AIProvider)) {
            const status = await this.checkProviderStatus(providerId);
            const providerDef = getProviderById(providerId);
            
            report += `### ${providerDef?.displayName || providerId}\n`;
            report += `- **Configured**: ${status.configured ? 'Yes' : 'No'}\n`;
            report += `- **Available**: ${status.available ? 'Yes' : 'No'}\n`;
            report += `- **Connected**: ${status.connected ? 'Yes' : 'No'}\n`;
            
            if (status.missingVars.length > 0) {
                report += `- **Missing Variables**: ${status.missingVars.join(', ')}\n`;
            }
            
            report += `- **Setup Complexity**: ${status.setupComplexity}\n`;
            report += `- **Estimated Setup Time**: ${status.estimatedSetupTime}\n\n`;
        }
        
        if (validation.recommendations.length > 0) {
            report += `## Recommendations\n\n`;
            validation.recommendations.forEach(rec => {
                report += `- ${rec.replace(/[🚀💡🔄⚡📊]/g, '').trim()}\n`;
            });
            report += '\n';
        }
        
        if (validation.warnings.length > 0) {
            report += `## Warnings\n\n`;
            validation.warnings.forEach(warning => {
                report += `- ${warning.replace(/⚠️/g, '').trim()}\n`;
            });
            report += '\n';
        }
        
        if (validation.errors.length > 0) {
            report += `## Errors\n\n`;
            validation.errors.forEach(error => {
                report += `- ${error.replace(/❌/g, '').trim()}\n`;
            });
            report += '\n';
        }
        
        return report;
    }
}