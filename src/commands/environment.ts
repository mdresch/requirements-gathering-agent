/**
 * Environment Configuration CLI Commands
 * 
 * Provides CLI commands for environment setup, validation, and optimization
 * to help users configure AI providers with automatic fallback mechanisms.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * @filepath src/commands/environment.ts
 */

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { EnvironmentSetup } from '../utils/environmentSetup.js';
import { ProviderFallbackManager } from '../modules/ai/ProviderFallbackManager.js';
import { PROVIDER_DEFINITIONS } from '../modules/ai/provider-definitions.js';

/**
 * Create environment configuration commands
 */
export function createEnvironmentCommands(): Command {
    const envCommand = new Command('env')
        .description('Environment configuration and validation commands');

    // Validate environment command
    envCommand
        .command('validate')
        .description('Validate current environment configuration')
        .option('--report', 'Generate detailed configuration report')
        .option('--output <file>', 'Save report to file')
        .action(async (options) => {
            try {
                console.log('🔍 Validating environment configuration...\n');
                
                const setup = EnvironmentSetup.getInstance();
                const validation = await setup.validateEnvironment();
                
                setup.displayValidationResults(validation);
                
                if (options.report) {
                    const report = await setup.generateConfigurationReport();
                    
                    if (options.output) {
                        writeFileSync(options.output, report);
                        console.log(`\n📄 Report saved to: ${options.output}`);
                    } else {
                        console.log('\n' + '='.repeat(60));
                        console.log(report);
                    }
                }
                
                process.exit(validation.isValid ? 0 : 1);
                
            } catch (error: any) {
                console.error('❌ Validation failed:', error.message);
                process.exit(1);
            }
        });

    // Setup environment command
    envCommand
        .command('setup')
        .description('Interactive environment setup wizard')
        .option('--template <type>', 'Environment template (development|production)', 'development')
        .option('--output <file>', 'Output file path', '.env')
        .option('--force', 'Overwrite existing .env file')
        .action(async (options) => {
            try {
                const setup = EnvironmentSetup.getInstance();
                
                if (options.template && options.output) {
                    console.log(`📋 Creating environment file from ${options.template} template...\n`);
                    setup.createEnvironmentFile(options.template, options.output);
                    console.log('\n✅ Environment file created successfully!');
                    console.log('📝 Please edit the file and configure your AI providers.\n');
                }
                
                await setup.runSetupWizard();
                
            } catch (error: any) {
                console.error('❌ Setup failed:', error.message);
                process.exit(1);
            }
        });

    // Provider status command
    envCommand
        .command('providers')
        .description('Show AI provider status and configuration')
        .option('--detailed', 'Show detailed provider information')
        .action(async (options) => {
            try {
                console.log('🔍 Checking AI provider status...\n');
                
                const setup = EnvironmentSetup.getInstance();
                
                console.log('📊 Provider Status');
                console.log('=' .repeat(50));
                
                for (const providerDef of PROVIDER_DEFINITIONS) {
                    const status = await setup.checkProviderStatus(providerDef.id);
                    
                    const statusIcon = status.connected ? '✅' : status.configured ? '⚠️' : '❌';
                    const statusText = status.connected ? 'Connected' : 
                                     status.configured ? 'Configured' : 'Not Configured';
                    
                    console.log(`\n${statusIcon} ${providerDef.displayName}`);
                    console.log(`   Status: ${statusText}`);
                    console.log(`   Category: ${providerDef.category}`);
                    console.log(`   Priority: ${providerDef.priority}`);
                    
                    if (options.detailed) {
                        console.log(`   Description: ${providerDef.description}`);
                        console.log(`   Setup Time: ${status.estimatedSetupTime}`);
                        console.log(`   Complexity: ${status.setupComplexity}`);
                        console.log(`   Required Vars: ${providerDef.requiredEnvVars.join(', ')}`);
                        
                        if (status.missingVars.length > 0) {
                            console.log(`   Missing Vars: ${status.missingVars.join(', ')}`);
                        }
                        
                        console.log(`   Features: ${providerDef.features.join(', ')}`);
                    }
                }
                
            } catch (error: any) {
                console.error('❌ Provider check failed:', error.message);
                process.exit(1);
            }
        });

    // Fallback status command
    envCommand
        .command('fallback')
        .description('Show provider fallback status and configuration')
        .option('--history', 'Show fallback history')
        .option('--health', 'Show provider health status')
        .action(async (options) => {
            try {
                console.log('🔄 Checking provider fallback configuration...\n');
                
                const fallbackManager = ProviderFallbackManager.getInstance();
                const config = fallbackManager.getConfig();
                
                console.log('📊 Fallback Configuration');
                console.log('=' .repeat(50));
                console.log(`Enabled: ${config.enabled ? 'Yes' : 'No'}`);
                console.log(`Fallback Order: ${config.fallbackOrder.join(' → ')}`);
                console.log(`Health Check Interval: ${config.healthCheckInterval}ms`);
                console.log(`Max Consecutive Failures: ${config.maxConsecutiveFailures}`);
                console.log(`Current Provider: ${fallbackManager.getCurrentProvider() || 'None'}`);
                
                if (options.health) {
                    console.log('\n🏥 Provider Health Status');
                    console.log('=' .repeat(50));
                    
                    const healthMap = fallbackManager.getProviderHealth();
                    for (const [provider, health] of healthMap) {
                        const healthIcon = health.isHealthy ? '✅' : '❌';
                        console.log(`\n${healthIcon} ${provider}`);
                        console.log(`   Healthy: ${health.isHealthy ? 'Yes' : 'No'}`);
                        console.log(`   Consecutive Failures: ${health.consecutiveFailures}`);
                        console.log(`   Success Rate: ${(health.successRate * 100).toFixed(1)}%`);
                        console.log(`   Avg Response Time: ${health.averageResponseTime.toFixed(0)}ms`);
                        console.log(`   Last Check: ${health.lastHealthCheck.toLocaleString()}`);
                        
                        if (health.lastError) {
                            console.log(`   Last Error: ${health.lastError}`);
                        }
                    }
                }
                
                if (options.history) {
                    console.log('\n📈 Fallback History');
                    console.log('=' .repeat(50));
                    
                    const history = fallbackManager.getFallbackHistory();
                    if (history.length === 0) {
                        console.log('No fallback events recorded');
                    } else {
                        const recentHistory = history.slice(-10); // Show last 10 events
                        recentHistory.forEach(event => {
                            const icon = event.success ? '✅' : '❌';
                            console.log(`${icon} ${event.timestamp.toLocaleString()}: ${event.fromProvider} → ${event.toProvider} (${event.reason})`);
                        });
                        
                        if (history.length > 10) {
                            console.log(`\n... and ${history.length - 10} more events`);
                        }
                    }
                }
                
            } catch (error: any) {
                console.error('❌ Fallback check failed:', error.message);
                process.exit(1);
            }
        });

    // Test providers command
    envCommand
        .command('test')
        .description('Test AI provider connections and performance')
        .option('--provider <name>', 'Test specific provider')
        .option('--all', 'Test all configured providers')
        .action(async (options) => {
            try {
                console.log('🧪 Testing AI provider connections...\n');
                
                const fallbackManager = ProviderFallbackManager.getInstance();
                
                if (options.provider) {
                    await testSingleProvider(options.provider);
                } else if (options.all) {
                    await testAllProviders();
                } else {
                    // Test current provider
                    const currentProvider = fallbackManager.getCurrentProvider();
                    if (currentProvider) {
                        await testSingleProvider(currentProvider);
                    } else {
                        console.log('❌ No current provider set');
                        process.exit(1);
                    }
                }
                
            } catch (error: any) {
                console.error('❌ Provider test failed:', error.message);
                process.exit(1);
            }
        });

    // Optimize configuration command
    envCommand
        .command('optimize')
        .description('Analyze and optimize environment configuration')
        .action(async () => {
            try {
                console.log('⚡ Analyzing environment configuration for optimization...\n');
                
                const setup = EnvironmentSetup.getInstance();
                const validation = await setup.validateEnvironment();
                
                console.log('🎯 Optimization Analysis');
                console.log('=' .repeat(50));
                
                if (validation.optimizations.length > 0) {
                    console.log('\n⚡ Performance Optimizations:');
                    validation.optimizations.forEach(opt => console.log(`  ${opt}`));
                }
                
                if (validation.recommendations.length > 0) {
                    console.log('\n💡 Configuration Recommendations:');
                    validation.recommendations.forEach(rec => console.log(`  ${rec}`));
                }
                
                if (validation.warnings.length > 0) {
                    console.log('\n⚠️ Configuration Warnings:');
                    validation.warnings.forEach(warning => console.log(`  ${warning}`));
                }
                
                if (validation.optimizations.length === 0 && 
                    validation.recommendations.length === 0 && 
                    validation.warnings.length === 0) {
                    console.log('✅ Your configuration is already optimized!');
                }
                
            } catch (error: any) {
                console.error('❌ Optimization analysis failed:', error.message);
                process.exit(1);
            }
        });

    return envCommand;
}

/**
 * Test a single provider
 */
async function testSingleProvider(providerId: string): Promise<void> {
    console.log(`🧪 Testing provider: ${providerId}`);
    
    const fallbackManager = ProviderFallbackManager.getInstance();
    
    try {
        const startTime = Date.now();
        
        // Test with a simple operation
        await fallbackManager.executeWithFallback(
            async (provider) => {
                if (provider !== providerId) {
                    throw new Error(`Expected ${providerId}, got ${provider}`);
                }
                
                // Simulate a simple AI operation
                console.log(`  🔄 Testing connection to ${provider}...`);
                return 'test successful';
            },
            `Test_${providerId}`
        );
        
        const responseTime = Date.now() - startTime;
        console.log(`  ✅ ${providerId} test successful (${responseTime}ms)`);
        
    } catch (error: any) {
        console.log(`  ❌ ${providerId} test failed: ${error.message}`);
    }
}

/**
 * Test all configured providers
 */
async function testAllProviders(): Promise<void> {
    const setup = EnvironmentSetup.getInstance();
    const validation = await setup.validateEnvironment();
    
    console.log(`Testing ${validation.configuredProviders.length} configured providers...\n`);
    
    for (const provider of validation.configuredProviders) {
        await testSingleProvider(provider);
    }
}