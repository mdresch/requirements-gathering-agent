/**
 * Configuration Command for Requirements Gathering Agent
 * 
 * Provides comprehensive environment configuration management with
 * interactive setup, validation, and optimization features.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created December 2024
 * 
 * Features:
 * - Interactive configuration wizard
 * - Environment template generation
 * - Configuration validation and optimization
 * - Provider health monitoring and diagnostics
 * - Automatic fallback testing
 * 
 * @filepath src/commands/configure.ts
 */

import { Command } from 'commander';
import { writeFile, readFile, existsSync } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
// Using readline for prompts instead of inquirer
import readline from 'readline';
// Simple console styling instead of chalk
const chalk = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  white: (text: string) => `\x1b[37m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`
};
// Simple spinner implementation instead of ora
class SimpleSpinner {
  private message: string;
  private interval: NodeJS.Timeout | null = null;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;

  constructor(message: string) {
    this.message = message;
  }

  start() {
    process.stdout.write(`${this.frames[0]} ${this.message}`);
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.frames[this.frameIndex]} ${this.message}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 100);
    return this;
  }

  succeed(message?: string) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r✅ ${message || this.message}\n`);
  }

  fail(message?: string) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r❌ ${message || this.message}\n`);
  }

  warn(message?: string) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r⚠️  ${message || this.message}\n`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write('\r');
  }
}

// Simple prompt function
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Simple confirm function
async function confirm(question: string, defaultValue = false): Promise<boolean> {
  const answer = await prompt(`${question} ${defaultValue ? '(Y/n)' : '(y/N)'}: `);
  if (!answer) return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

// Simple select function
async function select(message: string, choices: Array<{name: string, value: string}>): Promise<string> {
  console.log(message);
  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.name}`);
  });
  
  while (true) {
    const answer = await prompt('Select an option (number): ');
    const index = parseInt(answer) - 1;
    if (index >= 0 && index < choices.length) {
      return choices[index].value;
    }
    console.log(chalk.red('Invalid selection. Please try again.'));
  }
}

// Simple checkbox function
async function checkbox(message: string, choices: Array<{name: string, value: string}>): Promise<string[]> {
  console.log(message);
  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.name}`);
  });
  
  const answer = await prompt('Select options (comma-separated numbers): ');
  const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
  return indices
    .filter(index => index >= 0 && index < choices.length)
    .map(index => choices[index].value);
}
import EnvironmentConfigManager from '../modules/ai/EnvironmentConfigManager.js';
import { PROVIDER_DEFINITIONS } from '../modules/ai/provider-definitions.js';
import { AIProvider } from '../modules/ai/types.js';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

interface ConfigurationOptions {
  interactive?: boolean;
  template?: 'development' | 'production' | 'testing';
  validate?: boolean;
  optimize?: boolean;
  reset?: boolean;
  export?: string;
  import?: string;
  monitor?: boolean;
  test?: boolean;
}

export function createConfigureCommand(): Command {
  const command = new Command('configure');
  
  command
    .description('Configure AI providers and environment settings')
    .option('-i, --interactive', 'Run interactive configuration wizard')
    .option('-t, --template <type>', 'Generate configuration template (development|production|testing)')
    .option('-v, --validate', 'Validate current configuration')
    .option('-o, --optimize', 'Optimize configuration for performance')
    .option('-r, --reset', 'Reset configuration to defaults')
    .option('-e, --export <file>', 'Export configuration to file')
    .option('--import <file>', 'Import configuration from file')
    .option('-m, --monitor', 'Monitor provider health in real-time')
    .option('--test', 'Test all configured providers')
    .action(async (options: ConfigurationOptions) => {
      try {
        await handleConfigureCommand(options);
      } catch (error) {
        console.error(chalk.red('❌ Configuration failed:'), error);
        process.exit(1);
      }
    });

  return command;
}

async function handleConfigureCommand(options: ConfigurationOptions): Promise<void> {
  const configManager = EnvironmentConfigManager.getInstance();

  console.log(chalk.blue.bold('\n🔧 Requirements Gathering Agent - Configuration Manager\n'));

  // Handle specific options
  if (options.template) {
    await generateTemplate(options.template);
    return;
  }

  if (options.validate) {
    await validateConfiguration(configManager);
    return;
  }

  if (options.optimize) {
    await optimizeConfiguration(configManager);
    return;
  }

  if (options.reset) {
    await resetConfiguration(configManager);
    return;
  }

  if (options.export) {
    await exportConfiguration(configManager, options.export);
    return;
  }

  if (options.import) {
    await importConfiguration(configManager, options.import);
    return;
  }

  if (options.monitor) {
    await monitorProviders(configManager);
    return;
  }

  if (options.test) {
    await testProviders(configManager);
    return;
  }

  if (options.interactive) {
    await runInteractiveWizard(configManager);
    return;
  }

  // Default: show configuration status
  await showConfigurationStatus(configManager);
}

async function generateTemplate(templateType: 'development' | 'production' | 'testing'): Promise<void> {
  const spinner = new SimpleSpinner('Generating configuration template...').start();
  
  try {
    const configManager = EnvironmentConfigManager.getInstance();
    const template = configManager.generateConfigurationTemplate();
    
    const filename = `.env.${templateType}.template`;
    const outputPath = join(process.cwd(), filename);
    
    // Read the appropriate template file
    let templateContent = template;
    const templatePath = join(process.cwd(), filename);
    
    if (existsSync(templatePath)) {
      templateContent = await readFileAsync(templatePath, 'utf-8');
    }
    
    await writeFileAsync(join(process.cwd(), '.env.example'), templateContent);
    
    spinner.succeed(`Configuration template generated: .env.example`);
    
    console.log(chalk.green('\n✅ Template generated successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white('1. Copy .env.example to .env'));
    console.log(chalk.white('2. Configure your API keys and settings'));
    console.log(chalk.white('3. Run "rga configure --validate" to verify your setup'));
    
  } catch (error) {
    spinner.fail('Failed to generate template');
    throw error;
  }
}

async function validateConfiguration(configManager: EnvironmentConfigManager): Promise<void> {
  const spinner = new SimpleSpinner('Validating configuration...').start();
  
  try {
    const validation = await configManager.validateConfiguration();
    
    spinner.stop();
    
    console.log(chalk.blue.bold('\n📋 Configuration Validation Report\n'));
    
    if (validation.valid) {
      console.log(chalk.green('✅ Configuration is valid!'));
    } else {
      console.log(chalk.red('❌ Configuration has issues'));
    }
    
    if (validation.errors.length > 0) {
      console.log(chalk.red.bold('\n🚨 Errors:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  Warnings:'));
      validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }
    
    if (validation.recommendations.length > 0) {
      console.log(chalk.blue.bold('\n💡 Recommendations:'));
      validation.recommendations.forEach(recommendation => {
        console.log(chalk.blue(`  • ${recommendation}`));
      });
    }
    
    // Show provider status
    console.log(chalk.blue.bold('\n🔍 Provider Status:'));
    const healthMap = configManager.getProviderHealth() as Map<AIProvider, any>;
    
    for (const [provider, health] of healthMap) {
      const statusIcon = health.status === 'healthy' ? '🟢' : 
                        health.status === 'degraded' ? '🟡' : '🔴';
      const circuitIcon = health.circuitBreakerState === 'closed' ? '🔒' : 
                         health.circuitBreakerState === 'half-open' ? '🔓' : '🔴';
      
      console.log(chalk.white(`  ${statusIcon} ${provider}: ${health.status} ${circuitIcon} (${Math.round(health.successRate * 100)}% success)`));
    }
    
  } catch (error) {
    spinner.fail('Validation failed');
    throw error;
  }
}

async function optimizeConfiguration(configManager: EnvironmentConfigManager): Promise<void> {
  const spinner = new SimpleSpinner('Optimizing configuration...').start();
  
  try {
    const currentConfig = configManager.getConfiguration();
    const healthMap = configManager.getProviderHealth() as Map<AIProvider, any>;
    
    // Find the best performing provider
    let bestProvider = currentConfig.primaryProvider;
    let bestScore = 0;
    
    for (const [provider, health] of healthMap) {
      const score = health.successRate * (1 - health.errorRate) * 
                   (health.responseTime > 0 ? 1000 / health.responseTime : 1);
      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    }
    
    // Optimize settings based on performance data
    const optimizedConfig = {
      ...currentConfig,
      primaryProvider: bestProvider,
      performanceThresholds: {
        ...currentConfig.performanceThresholds,
        maxResponseTime: Math.max(5000, Math.min(15000, 
          Array.from(healthMap.values()).reduce((avg, h) => avg + h.responseTime, 0) / healthMap.size * 2
        ))
      }
    };
    
    await configManager.updateConfiguration(optimizedConfig);
    
    spinner.succeed('Configuration optimized');
    
    console.log(chalk.green('\n✅ Configuration optimized!'));
    console.log(chalk.white(`Primary provider: ${bestProvider}`));
    console.log(chalk.white(`Max response time: ${optimizedConfig.performanceThresholds.maxResponseTime}ms`));
    
  } catch (error) {
    spinner.fail('Optimization failed');
    throw error;
  }
}

async function resetConfiguration(configManager: EnvironmentConfigManager): Promise<void> {
  const confirmReset = await confirm('Are you sure you want to reset configuration to defaults?', false);
  
  if (!confirmReset) {
    console.log(chalk.yellow('Reset cancelled'));
    return;
  }
  
  const spinner = new SimpleSpinner('Resetting configuration...').start();
  
  try {
    // Reset to default configuration
    await configManager.updateConfiguration({
      primaryProvider: 'google-ai',
      fallbackProviders: ['azure-openai', 'github-ai', 'ollama'],
      autoFallbackEnabled: true,
      healthCheckInterval: 30000,
      performanceThresholds: {
        maxResponseTime: 10000,
        minSuccessRate: 0.95,
        maxErrorRate: 0.05,
        healthCheckTimeout: 5000
      }
    });
    
    // Reset provider health
    configManager.resetProviderHealth();
    
    spinner.succeed('Configuration reset to defaults');
    console.log(chalk.green('\n✅ Configuration reset successfully!'));
    
  } catch (error) {
    spinner.fail('Reset failed');
    throw error;
  }
}

async function exportConfiguration(configManager: EnvironmentConfigManager, filename: string): Promise<void> {
  const spinner = new SimpleSpinner('Exporting configuration...').start();
  
  try {
    const config = configManager.getConfiguration();
    const healthMap = configManager.getProviderHealth() as Map<AIProvider, any>;
    const fallbackHistory = configManager.getFallbackHistory();
    
    const exportData = {
      configuration: config,
      providerHealth: Object.fromEntries(healthMap),
      fallbackHistory,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await writeFileAsync(filename, JSON.stringify(exportData, null, 2));
    
    spinner.succeed(`Configuration exported to ${filename}`);
    console.log(chalk.green('\n✅ Configuration exported successfully!'));
    
  } catch (error) {
    spinner.fail('Export failed');
    throw error;
  }
}

async function importConfiguration(configManager: EnvironmentConfigManager, filename: string): Promise<void> {
  const spinner = new SimpleSpinner('Importing configuration...').start();
  
  try {
    if (!existsSync(filename)) {
      throw new Error(`Configuration file not found: ${filename}`);
    }
    
    const importData = JSON.parse(await readFileAsync(filename, 'utf-8'));
    
    if (!importData.configuration) {
      throw new Error('Invalid configuration file format');
    }
    
    await configManager.updateConfiguration(importData.configuration);
    
    spinner.succeed(`Configuration imported from ${filename}`);
    console.log(chalk.green('\n✅ Configuration imported successfully!'));
    
  } catch (error) {
    spinner.fail('Import failed');
    throw error;
  }
}

async function monitorProviders(configManager: EnvironmentConfigManager): Promise<void> {
  console.log(chalk.blue.bold('\n📊 Real-time Provider Health Monitor'));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const updateDisplay = () => {
    // Clear screen
    process.stdout.write('\x1B[2J\x1B[0f');
    
    console.log(chalk.blue.bold('📊 Provider Health Monitor - ' + new Date().toLocaleTimeString()));
    console.log(chalk.gray('─'.repeat(80)));
    
    const healthMap = configManager.getProviderHealth() as Map<AIProvider, any>;
    const config = configManager.getConfiguration();
    
    console.log(chalk.white.bold(`Primary Provider: ${config.primaryProvider}`));
    console.log(chalk.white.bold(`Auto Fallback: ${config.autoFallbackEnabled ? 'Enabled' : 'Disabled'}`));
    console.log('');
    
    for (const [provider, health] of healthMap) {
      const statusColor = health.status === 'healthy' ? chalk.green : 
                         health.status === 'degraded' ? chalk.yellow : chalk.red;
      const isPrimary = provider === config.primaryProvider ? ' (PRIMARY)' : '';
      
      console.log(statusColor.bold(`${provider.toUpperCase()}${isPrimary}`));
      console.log(`  Status: ${health.status}`);
      console.log(`  Success Rate: ${Math.round(health.successRate * 100)}%`);
      console.log(`  Error Rate: ${Math.round(health.errorRate * 100)}%`);
      console.log(`  Response Time: ${health.responseTime}ms`);
      console.log(`  Circuit Breaker: ${health.circuitBreakerState}`);
      console.log(`  Last Checked: ${health.lastChecked.toLocaleTimeString()}`);
      console.log('');
    }
    
    const fallbackHistory = configManager.getFallbackHistory();
    if (fallbackHistory.length > 0) {
      console.log(chalk.yellow.bold('Recent Fallbacks:'));
      fallbackHistory.slice(-3).forEach(event => {
        const statusIcon = event.success ? '✅' : '❌';
        console.log(`  ${statusIcon} ${event.fromProvider} → ${event.toProvider} (${event.reason})`);
      });
    }
  };
  
  // Initial display
  updateDisplay();
  
  // Update every 5 seconds
  const interval = setInterval(updateDisplay, 5000);
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(chalk.yellow('\n\nMonitoring stopped'));
    process.exit(0);
  });
}

async function testProviders(configManager: EnvironmentConfigManager): Promise<void> {
  console.log(chalk.blue.bold('\n🧪 Testing All Configured Providers\n'));
  
  const config = configManager.getConfiguration();
  const allProviders = [config.primaryProvider, ...config.fallbackProviders];
  
  for (const provider of allProviders) {
    const spinner = new SimpleSpinner(`Testing ${provider}...`).start();
    
    try {
      const providerConfig = PROVIDER_DEFINITIONS.find(p => p.id === provider);
      if (!providerConfig) {
        spinner.fail(`Provider ${provider} not found`);
        continue;
      }
      
      const isConfigured = await providerConfig.check();
      if (!isConfigured) {
        spinner.warn(`Provider ${provider} not configured`);
        continue;
      }
      
      const status = await providerConfig.getStatus();
      const startTime = Date.now();
      
      // Test with a simple operation
      await configManager.executeWithFallback(async (testProvider) => {
        if (testProvider !== provider) {
          throw new Error('Wrong provider selected');
        }
        return 'test successful';
      }, `Test ${provider}`);
      
      const responseTime = Date.now() - startTime;
      
      if (status.connected) {
        spinner.succeed(`${provider} - Connected (${responseTime}ms)`);
      } else {
        spinner.fail(`${provider} - Connection failed`);
      }
      
    } catch (error) {
      spinner.fail(`${provider} - ${error.message}`);
    }
  }
  
  console.log(chalk.green('\n✅ Provider testing completed!'));
}

async function runInteractiveWizard(configManager: EnvironmentConfigManager): Promise<void> {
  console.log(chalk.blue(chalk.bold('\n🧙 Interactive Configuration Wizard\n')));
  
  // Environment selection
  const environment = await select('What environment are you setting up?', [
    { name: 'Development (Free tiers, local testing)', value: 'development' },
    { name: 'Production (High availability, enterprise)', value: 'production' },
    { name: 'Testing (CI/CD, automated testing)', value: 'testing' }
  ]);
  
  // Primary provider selection
  const primaryProvider = await select('Choose your primary AI provider:', 
    PROVIDER_DEFINITIONS.map(p => ({
      name: `${p.displayName} - ${p.description}`,
      value: p.id
    }))
  );
  
  // Fallback providers selection
  const fallbackProviders = await checkbox('Select fallback providers (recommended for reliability):',
    PROVIDER_DEFINITIONS.map(p => ({
      name: `${p.displayName} - ${p.description}`,
      value: p.id
    }))
  );
  
  // Auto fallback confirmation
  const autoFallback = await confirm('Enable automatic fallback when primary provider fails?', true);
  
  // Health check interval
  let healthCheckInterval = 30;
  while (true) {
    const intervalStr = await prompt('Health check interval (seconds) [30]: ');
    if (!intervalStr) {
      healthCheckInterval = 30;
      break;
    }
    const interval = parseInt(intervalStr);
    if (interval > 0) {
      healthCheckInterval = interval;
      break;
    }
    console.log(chalk.red('Must be greater than 0'));
  }
  
  const answers = {
    environment,
    primaryProvider,
    fallbackProviders,
    autoFallback,
    healthCheckInterval
  };
  
  const spinner = new SimpleSpinner('Applying configuration...').start();
  
  try {
    await configManager.updateConfiguration({
      primaryProvider: answers.primaryProvider,
      fallbackProviders: answers.fallbackProviders.filter(p => p !== answers.primaryProvider),
      autoFallbackEnabled: answers.autoFallback,
      healthCheckInterval: answers.healthCheckInterval * 1000
    });
    
    spinner.succeed('Configuration applied successfully!');
    
    console.log(chalk.green('\n✅ Configuration wizard completed!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white('1. Configure your API keys in .env file'));
    console.log(chalk.white('2. Run "rga configure --validate" to verify setup'));
    console.log(chalk.white('3. Run "rga configure --test" to test all providers'));
    
  } catch (error) {
    spinner.fail('Configuration failed');
    throw error;
  }
}

async function showConfigurationStatus(configManager: EnvironmentConfigManager): Promise<void> {
  console.log(chalk.blue.bold('📋 Current Configuration Status\n'));
  
  const config = configManager.getConfiguration();
  const healthMap = configManager.getProviderHealth() as Map<AIProvider, any>;
  
  console.log(chalk.white.bold('Configuration:'));
  console.log(`  Primary Provider: ${config.primaryProvider}`);
  console.log(`  Fallback Providers: ${config.fallbackProviders.join(', ')}`);
  console.log(`  Auto Fallback: ${config.autoFallbackEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  Health Check Interval: ${config.healthCheckInterval / 1000}s`);
  
  console.log(chalk.white.bold('\nProvider Health:'));
  for (const [provider, health] of healthMap) {
    const statusIcon = health.status === 'healthy' ? '🟢' : 
                      health.status === 'degraded' ? '🟡' : '🔴';
    console.log(`  ${statusIcon} ${provider}: ${health.status} (${Math.round(health.successRate * 100)}% success)`);
  }
  
  console.log(chalk.yellow('\nAvailable commands:'));
  console.log(chalk.white('  rga configure --interactive    Run configuration wizard'));
  console.log(chalk.white('  rga configure --validate       Validate current setup'));
  console.log(chalk.white('  rga configure --test           Test all providers'));
  console.log(chalk.white('  rga configure --monitor        Monitor provider health'));
  console.log(chalk.white('  rga configure --optimize       Optimize configuration'));
}

export default createConfigureCommand;