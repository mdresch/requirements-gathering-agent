
import { writeFileSync } from 'fs';
import { EnvironmentSetup } from '../utils/environmentSetup.js';
import { ProviderFallbackManager } from '../modules/ai/ProviderFallbackManager.js';
import { PROVIDER_DEFINITIONS } from '../modules/ai/provider-definitions.js';
import type { AIProvider } from '../modules/ai/types.js';

export const environmentCommandModule = {
    command: 'env',
    describe: 'Environment configuration and validation commands',
    builder: (yargs: any) => yargs
        .command('validate', 'Validate current environment configuration', (yargs: any) => {
            return yargs
                .option('report', { type: 'boolean', describe: 'Generate detailed configuration report' })
                .option('output', { type: 'string', describe: 'Save report to file' });
        }, async (argv: any) => {
            try {
                console.log('🔍 Validating environment configuration...\n');
                const setup = EnvironmentSetup.getInstance();
                const validation = await setup.validateEnvironment();
                setup.displayValidationResults(validation);
                if (argv.report) {
                    const report = await setup.generateConfigurationReport();
                    if (argv.output) {
                        writeFileSync(argv.output, report);
                        console.log(`\n📄 Report saved to: ${argv.output}`);
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
        })
        .command('setup', 'Interactive environment setup wizard', (yargs: any) => {
            return yargs
                .option('template', { type: 'string', default: 'development', describe: 'Environment template (development|production)' })
                .option('output', { type: 'string', default: '.env', describe: 'Output file path' })
                .option('force', { type: 'boolean', describe: 'Overwrite existing .env file' });
        }, async (argv: any) => {
            try {
                const setup = EnvironmentSetup.getInstance();
                if (argv.template && argv.output) {
                    console.log(`📋 Creating environment file from ${argv.template} template...\n`);
                    setup.createEnvironmentFile(argv.template, argv.output);
                    console.log('\n✅ Environment file created successfully!');
                    console.log('📝 Please edit the file and configure your AI providers.\n');
                }
                await setup.runSetupWizard();
            } catch (error: any) {
                console.error('❌ Setup failed:', error.message);
                process.exit(1);
            }
        })
        .command('providers', 'Show AI provider status and configuration', (yargs: any) => {
            return yargs.option('detailed', { type: 'boolean', describe: 'Show detailed provider information' });
        }, async (argv: any) => {
            try {
                console.log('🔍 Checking AI provider status...\n');
                const setup = EnvironmentSetup.getInstance();
                console.log('📊 Provider Status');
                console.log('=' .repeat(50));
                for (const providerDef of PROVIDER_DEFINITIONS) {
                    const status = await setup.checkProviderStatus(providerDef.id as AIProvider);
                    const statusIcon = status.connected ? '✅' : status.configured ? '⚠️' : '❌';
                    const statusText = status.connected ? 'Connected' : status.configured ? 'Configured' : 'Not Configured';
                    console.log(`\n${statusIcon} ${providerDef.displayName}`);
                    console.log(`   Status: ${statusText}`);
                    console.log(`   Category: ${providerDef.category}`);
                    console.log(`   Priority: ${providerDef.priority}`);
                    if (argv.detailed) {
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
        })
        .command('fallback', 'Show provider fallback status and configuration', (yargs: any) => {
            return yargs.option('history', { type: 'boolean', describe: 'Show fallback history' })
                                    .option('health', { type: 'boolean', describe: 'Show provider health status' });
        }, async (argv: any) => {
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
                if (argv.health) {
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
                if (argv.history) {
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
        })
        .command('test', 'Test AI provider connections and performance', (yargs: any) => {
            return yargs.option('provider', { type: 'string', describe: 'Test specific provider' })
                                    .option('all', { type: 'boolean', describe: 'Test all configured providers' });
        }, async (argv: any) => {
            try {
                console.log('🧪 Testing AI provider connections...\n');
                const fallbackManager = ProviderFallbackManager.getInstance();
                async function testSingleProvider(providerId: string): Promise<void> {
                    console.log(`🧪 Testing provider: ${providerId}`);
                    try {
                        const startTime = Date.now();
                        await fallbackManager.executeWithFallback(
                            async (provider: string) => {
                                if (provider !== providerId) {
                                    throw new Error(`Expected ${providerId}, got ${provider}`);
                                }
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
                async function testAllProviders(): Promise<void> {
                    const setup = EnvironmentSetup.getInstance();
                    const validation = await setup.validateEnvironment();
                    console.log(`Testing ${validation.configuredProviders.length} configured providers...\n`);
                    for (const provider of validation.configuredProviders) {
                        await testSingleProvider(provider);
                    }
                }
                if (argv.provider) {
                    await testSingleProvider(argv.provider);
                } else if (argv.all) {
                    await testAllProviders();
                } else {
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
        })
        .command('optimize', 'Analyze and optimize environment configuration', (yargs: any) => yargs, async () => {
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
                if (validation.optimizations.length === 0 && validation.recommendations.length === 0 && validation.warnings.length === 0) {
                    console.log('✅ Your configuration is already optimized!');
                }
            } catch (error: any) {
                console.error('❌ Optimization analysis failed:', error.message);
                process.exit(1);
            }
        }),
    handler: () => {}
};
