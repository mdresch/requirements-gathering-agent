/**
 * Interactive Provider Selection Menu Implementation
 * 
 * Provides an interactive CLI-based menu for selecting and configuring
 * AI providers for the Requirements Gathering Agent.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created June 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\interactive-menu.ts
 */

import * as readline from 'readline';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CONFIG_FILENAME } from '../../constants.js';
import { PROVIDER_DEFINITIONS, getProviderById } from './provider-definitions.js';
import { 
  EnhancedProviderConfig, 
  ProviderStatus, 
  InteractiveMenuOptions,
  ValidationResult,
  ConnectionTestResult,
  MenuAction
} from './enhanced-types.js';

export class InteractiveProviderMenu {
  private readline: readline.Interface;
  private providers: Map<string, EnhancedProviderConfig> = new Map();
  private options: InteractiveMenuOptions;

  constructor(options: InteractiveMenuOptions = {}) {
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.options = {
      showMetrics: false,
      allowExit: true,
      autoRefresh: false,
      refreshInterval: 30000,
      ...options
    };

    // Initialize providers map
    for (const provider of PROVIDER_DEFINITIONS) {
      this.providers.set(provider.id, provider);
    }
  }
  /**
   * Show the main interactive provider selection menu
   */
  async showMenu(): Promise<string | null> {
    while (true) {
      await this.clearScreen();
      await this.displayMenu();
      
      const choice = await this.getUserInput('\nEnter your choice: ');
      const result = await this.handleMenuChoice(choice);
      
      if (result === 'EXIT') {
        return null; // User chose to exit
      }
      
      if (result && result !== 'EXIT') {
        return result; // Provider selected
      }
      
      // Continue menu loop for invalid choices or menu actions (result === null)
    }
  }

  /**
   * Display the formatted provider menu
   */
  private async displayMenu(): Promise<void> {
    console.log('🤖 AI Provider Selection Menu\n');
    console.log('Choose your AI provider for Requirements Gathering Agent:\n');

    // Get all providers sorted by priority
    const providers = Array.from(this.providers.values())
      .sort((a, b) => a.priority - b.priority);

    // Display each provider with status
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const status = await provider.getStatus();
      const statusIcon = this.getStatusIcon(status);
      const statusText = this.getStatusText(status);
      
      console.log(`  ${i + 1}. ${statusIcon} ${provider.displayName} - ${statusText}`);
      console.log(`     └─ ${provider.description}`);
      
      // Show detailed configuration status
      const configStatus = await this.getDetailedConfigStatus(provider);
      if (configStatus) {
        console.log(`     └─ 🔧 Configuration: ${configStatus}`);
      }
      
      if (provider.recommendation) {
        console.log(`     └─ 💡 ${provider.recommendation}`);
      }
      
      if (this.options.showMetrics && status.metrics) {
        console.log(`     └─ 📊 Avg response: ${status.metrics.averageResponseTime}ms`);
      }
      
      if (provider.setupGuide && !status.configured) {
        console.log(`     └─ ⏱️  Setup time: ~${provider.setupGuide.estimatedTime}`);
      }
      
      console.log('');
    }

    // Menu options
    const menuOffset = providers.length;
    console.log(`  ${menuOffset + 1}. 🔧 Configure New Provider`);
    console.log(`  ${menuOffset + 2}. 📊 View Provider Status & Metrics`);
    console.log(`  ${menuOffset + 3}. ❓ Help & Documentation`);
    
    if (this.options.allowExit) {
      console.log(`  ${menuOffset + 4}. 🚫 Exit Menu`);
    }
  }
  /**
   * Handle user menu selection
   */
  private async handleMenuChoice(choice: string): Promise<string | null | 'EXIT'> {
    const choiceNum = parseInt(choice);
    const providers = Array.from(this.providers.values())
      .sort((a, b) => a.priority - b.priority);

    // Handle provider selection (1-N)
    if (choiceNum >= 1 && choiceNum <= providers.length) {
      const selectedProvider = providers[choiceNum - 1];
      return await this.handleProviderSelection(selectedProvider);
    }

    // Handle menu options
    const menuOffset = providers.length;
    switch (choiceNum) {
      case menuOffset + 1: // Configure New Provider
        return await this.configureNewProvider();
      
      case menuOffset + 2: // View Status & Metrics
        await this.showProviderMetrics();
        break;
      
      case menuOffset + 3: // Help & Documentation
        await this.showHelp();
        break;
      
      case menuOffset + 4: // Exit
        if (this.options.allowExit) {
          return 'EXIT';
        }
        break;
      
      case 0: // Hidden exit option
        return 'EXIT';
      
      default:
        console.log('❌ Invalid choice. Please try again.');
        await this.pause();
    }

    return null; // Continue menu loop
  }
  /**
   * Handle selection of a specific provider
   */
  private async handleProviderSelection(provider: EnhancedProviderConfig): Promise<string | null> {
    const status = await provider.getStatus();

    if (status.configured && status.available && status.connected) {
      // Provider ready - confirm selection
      console.log(`\n✅ ${provider.displayName} is ready!`);
      console.log(`   Features: ${provider.features.join(', ')}`);
      
      const confirm = await this.getUserInput('Use this provider? (y/n): ');
      
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        return provider.id;
      }
    } else if (status.available && !status.configured) {
      // Provider available but needs setup
      console.log(`\n🔧 ${provider.displayName} needs configuration.`);
      console.log(`   Setup difficulty: ${provider.setupGuide.difficulty}`);
      console.log(`   Estimated time: ${provider.setupGuide.estimatedTime}`);
      
      const setup = await this.getUserInput('Start setup now? (y/n): ');
      
      if (setup.toLowerCase() === 'y' || setup.toLowerCase() === 'yes') {
        const configured = await this.runProviderSetup(provider);
        if (configured) {
          return provider.id;
        }
      }
    } else {
      // Provider not available
      console.log(`\n❌ ${provider.displayName} is not available.`);
      if (status.error) {
        console.log(`   Error: ${status.error}`);
      }
      console.log('   Please check the setup requirements and try again.');
      await this.pause();
    }

    return null; // Continue menu
  }

  /**
   * Run interactive setup for a provider
   */
  private async runProviderSetup(provider: EnhancedProviderConfig): Promise<boolean> {
    console.log(`\n🚀 Setting up ${provider.displayName}\n`);
    
    // Display setup guide
    console.log(`📋 Setup Guide (${provider.setupGuide.difficulty} - ~${provider.setupGuide.estimatedTime})\n`);
    
    for (let i = 0; i < provider.setupGuide.steps.length; i++) {
      const step = provider.setupGuide.steps[i];
      console.log(`${i + 1}. ${step.title}`);
      if (step.description) {
        console.log(`   ${step.description}`);
      }
      if (step.command) {
        console.log(`   Command: ${step.command}`);
      }
      console.log('');
    }

    // Show help links
    if (provider.setupGuide.helpLinks.length > 0) {
      console.log('📚 Helpful Links:');
      for (const link of provider.setupGuide.helpLinks) {
        console.log(`   • ${link.title}: ${link.url}`);
      }
      console.log('');
    }

    // Interactive configuration
    const config: Record<string, string> = {};
    
    console.log('🔧 Configuration:');
    
    // Required configuration
    for (const envVar of provider.requiredEnvVars) {
      const template = provider.configTemplate[envVar];
      let prompt = `Enter ${envVar}`;
      
      if (template) {
        prompt += ` (example: ${template})`;
      }
      prompt += ': ';
      
      const value = await this.getUserInput(prompt);
      if (!value.trim()) {
        console.log('❌ Required field cannot be empty.');
        return false;
      }
      
      config[envVar] = value.trim();
    }

    // Optional configuration
    for (const envVar of provider.optionalEnvVars) {
      const template = provider.configTemplate[envVar];
      let prompt = `Enter ${envVar} (optional)`;
      
      if (template) {
        prompt += ` (default: ${template})`;
      }
      prompt += ': ';
      
      const value = await this.getUserInput(prompt);
      if (value.trim()) {
        config[envVar] = value.trim();
      } else if (template) {
        config[envVar] = template;
      }
    }

    // Validate and save configuration
    try {
      await this.saveProviderConfiguration(provider.id, config);
      
      // Test connection
      console.log('\n🔄 Testing connection...');
      const testResult = await this.testProviderConnection(provider.id);
      
      if (testResult.success) {
        console.log('✅ Connection successful!');
        return true;
      } else {
        console.log(`❌ Connection failed: ${testResult.error}`);
        console.log('Configuration saved but connection test failed.');
        console.log('You can try again later or check your configuration.');
        await this.pause();
        return false;
      }    } catch (error) {
      console.log(`❌ Configuration failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Save provider configuration to .env file
   */
  private async saveProviderConfiguration(providerId: string, config: Record<string, string>): Promise<void> {
    const envPath = join(process.cwd(), '.env');
    
    // Read existing .env file or create new content
    let existingContent = '';
    try {
      existingContent = await fs.readFile(envPath, 'utf8');
    } catch {
      // File doesn't exist, will create new
    }

    // Update environment variables
    let updatedContent = existingContent;
    
    for (const [key, value] of Object.entries(config)) {
      const envLine = `${key}=${value}`;
      const envRegex = new RegExp(`^${key}=.*$`, 'm');
      
      if (envRegex.test(updatedContent)) {
        // Update existing line
        updatedContent = updatedContent.replace(envRegex, envLine);
      } else {
        // Add new line
        if (updatedContent && !updatedContent.endsWith('\n')) {
          updatedContent += '\n';
        }
        updatedContent += envLine + '\n';
      }
    }
    // Also persist CURRENT_PROVIDER to .env
    const currentProviderLine = `CURRENT_PROVIDER=${providerId}`;
    const currentProviderRegex = /^CURRENT_PROVIDER=.*$/m;
    if (currentProviderRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(currentProviderRegex, currentProviderLine);
    } else {
      if (updatedContent && !updatedContent.endsWith('\n')) {
        updatedContent += '\n';
      }
      updatedContent += currentProviderLine + '\n';
    }
    // Write updated content
    await fs.writeFile(envPath, updatedContent, 'utf8');
    // Update process.env
    for (const [key, value] of Object.entries(config)) {
      process.env[key] = value;
    }
    process.env.CURRENT_PROVIDER = providerId;

    // Write to config-rga.json (create if missing, update if exists)
    const configPath = join(process.cwd(), CONFIG_FILENAME);
    let userConfig: any = {};
    try {
      const raw = await fs.readFile(configPath, 'utf8');
      userConfig = JSON.parse(raw);
    } catch {
      // File does not exist or is invalid, start fresh
      userConfig = {};
    }
    userConfig.currentProvider = providerId;
    await fs.writeFile(configPath, JSON.stringify(userConfig, null, 2), 'utf8');
  }

  /**
   * Test provider connection
   */
  private async testProviderConnection(providerId: string): Promise<ConnectionTestResult> {
    const provider = getProviderById(providerId);
    if (!provider) {
      return {
        success: false,
        error: 'Provider not found'
      };
    }

    try {
      const startTime = Date.now();
      
      // Perform basic connectivity test
      const status = await provider.getStatus();
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: status.connected,
        responseTime,
        error: status.error
      };    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Configure a new provider (placeholder for future extension)
   */
  private async configureNewProvider(): Promise<string | null> {
    console.log('\n🔧 Custom Provider Configuration');
    console.log('This feature allows you to configure additional providers.');
    console.log('Currently supported providers are shown in the main menu.');
    console.log('For custom configurations, please edit your .env file manually.');
    await this.pause();
    return null;
  }

  /**
   * Show provider metrics and status details
   */
  private async showProviderMetrics(): Promise<void> {
    console.log('\n📊 Provider Status & Metrics\n');
    
    for (const provider of this.providers.values()) {
      const status = await provider.getStatus();
      
      console.log(`${provider.icon} ${provider.displayName}:`);
      console.log(`   Status: ${this.getStatusIcon(status)} ${this.getStatusText(status)}`);
      console.log(`   Category: ${provider.category}`);
      console.log(`   Token Limit: ${provider.tokenLimit.toLocaleString()}`);
      console.log(`   Features: ${provider.features.join(', ')}`);
      
      if (status.metrics) {
        console.log(`   Metrics: ${status.metrics.totalCalls} calls, ${status.metrics.averageResponseTime}ms avg`);
      }
      
      if (status.error) {
        console.log(`   Error: ${status.error}`);
      }
      
      console.log('');
    }
    
    await this.pause();
  }

  /**
   * Show help and documentation
   */
  private async showHelp(): Promise<void> {
    console.log('\n❓ Help & Documentation\n');
    
    console.log('🎯 Provider Selection Tips:');
    console.log('   • Start with Google AI Studio for free tier');
    console.log('   • Use GitHub AI if you have a GitHub account');
    console.log('   • Choose Azure OpenAI for enterprise features');
    console.log('   • Try Ollama for offline/local processing');
    
    console.log('\n🔧 Configuration Help:');
    console.log('   • API keys are stored in your .env file');
    console.log('   • Configuration is automatically tested');
    console.log('   • You can switch providers anytime');
    
    console.log('\n📚 Documentation:');
    console.log('   • GitHub: https://github.com/mdresch/requirements-gathering-agent');
    console.log('   • Run with --help for CLI options');
    console.log('   • Check generated documents for examples');
    
    await this.pause();
  }

  /**
   * Get status icon for provider status
   */
  private getStatusIcon(status: ProviderStatus): string {
    if (status.configured && status.available && status.connected) {
      return '✅';
    } else if (status.available && !status.configured) {
      return '⚠️';
    } else if (!status.available) {
      return '❌';
    } else {
      return '🔄';
    }
  }

  /**
   * Get status text for provider status
   */
  private getStatusText(status: ProviderStatus): string {
    if (status.configured && status.available && status.connected) {
      return 'READY';
    } else if (status.available && !status.configured) {
      return 'NEEDS SETUP';
    } else if (!status.available) {
      return 'NOT AVAILABLE';
    } else {
      return 'CHECKING';
    }
  }

  /**
   * Get detailed configuration status for a provider
   */
  private async getDetailedConfigStatus(provider: EnhancedProviderConfig): Promise<string | null> {
    const missingVars: string[] = [];
    const partialVars: string[] = [];

    // Check required variables
    for (const envVar of provider.requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      } else if (envVar.includes('ENDPOINT') && !process.env[envVar]?.includes('http')) {
        partialVars.push(`${envVar} (invalid URL)`);
      }
    }

    // Check optional variables
    for (const envVar of provider.optionalEnvVars) {
      if (process.env[envVar] && envVar.includes('ENDPOINT') && !process.env[envVar]?.includes('http')) {
        partialVars.push(`${envVar} (invalid URL)`);
      }
    }

    if (missingVars.length > 0) {
      return `Missing: ${missingVars.join(', ')}`;
    } else if (partialVars.length > 0) {
      return `Warning: ${partialVars.join(', ')}`;
    }

    return null;
  }

  // Helper methods
  private async getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.readline.question(prompt, (answer: string) => {
        resolve(answer.trim());
      });
    });
  }

  private async clearScreen(): Promise<void> {
    // Check if we're in a TTY environment
    if (process.stdout.isTTY) {
      console.clear();
    } else {
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }

  private async pause(): Promise<void> {
    await this.getUserInput('\nPress Enter to continue...');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.readline.close();
  }
}
