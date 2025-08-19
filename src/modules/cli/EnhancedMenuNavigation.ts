/**
 * Enhanced CLI Menu Navigation System
 * 
 * Provides an improved interactive CLI interface using inquirer for better UX.
 * This enhances the existing menu system with arrow key navigation, better prompts,
 * and improved error handling.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import inquirer from 'inquirer';
import { EventEmitter } from 'events';
import { CommandIntegrationService } from './CommandIntegration.js';
import { InputValidationService, ValidationResult } from './InputValidationService.js';
import { InteractiveErrorHandler, ErrorContext, InteractiveError } from './InteractiveErrorHandler.js';

// Enhanced types for inquirer-based navigation
export interface EnhancedMenuItem {
  name: string;
  value: string;
  short?: string;
  disabled?: boolean | string;
  checked?: boolean;
}

export interface MenuChoice {
  type: 'list' | 'checkbox' | 'input' | 'confirm' | 'password';
  name: string;
  message: string;
  choices?: EnhancedMenuItem[];
  default?: any;
  validate?: (input: any) => boolean | string;
  filter?: (input: any) => any;
  when?: (answers: any) => boolean;
  pageSize?: number;
}

export interface NavigationStep {
  id: string;
  title: string;
  description?: string;
  choices: MenuChoice[];
  onComplete?: (answers: any) => Promise<NavigationResult>;
  onBack?: () => Promise<void>;
  allowBack?: boolean;
  allowExit?: boolean;
}

export interface NavigationResult {
  action: 'continue' | 'back' | 'exit' | 'restart' | 'navigate';
  data?: any;
  nextStep?: string;
  message?: string;
}

export interface NavigationFlow {
  id: string;
  title: string;
  description?: string;
  steps: NavigationStep[];
  startStep?: string;
  onComplete?: (results: any) => Promise<void>;
  onCancel?: () => Promise<void>;
}

export interface NavigationState {
  currentFlow?: string;
  currentStep?: string;
  stepHistory: string[];
  flowData: { [key: string]: any };
  globalData: { [key: string]: any };
}

/**
 * Enhanced Menu Navigation System using Inquirer
 */
export class EnhancedMenuNavigation extends EventEmitter {
  private flows: Map<string, NavigationFlow> = new Map();
  private state: NavigationState;
  private commandIntegration: CommandIntegrationService;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.state = {
      stepHistory: [],
      flowData: {},
      globalData: {}
    };
    this.commandIntegration = new CommandIntegrationService();
    this.initializeFlows();
  }

  /**
   * Start the enhanced navigation system
   */
  async start(flowId: string = 'main-menu'): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Navigation system is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Enhanced ADPA Interactive CLI...\n');
    
    try {
      await this.navigateToFlow(flowId);
    } catch (error) {
      await this.handleNavigationError(error as Error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the navigation system
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('\n👋 Thank you for using ADPA Interactive CLI!');
  }

  /**
   * Navigate to a specific flow
   */
  async navigateToFlow(flowId: string, stepId?: string): Promise<void> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    this.state.currentFlow = flowId;
    this.state.flowData[flowId] = this.state.flowData[flowId] || {};
    
    const startStep = stepId || flow.startStep || flow.steps[0]?.id;
    if (startStep) {
      await this.navigateToStep(startStep);
    }
  }

  /**
   * Navigate to a specific step within the current flow
   */
  async navigateToStep(stepId: string): Promise<void> {
    if (!this.state.currentFlow) {
      throw new Error('No current flow set');
    }

    const flow = this.flows.get(this.state.currentFlow);
    if (!flow) {
      throw new Error(`Current flow not found: ${this.state.currentFlow}`);
    }

    const step = flow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    // Add to history if not going back
    if (this.state.currentStep !== stepId) {
      this.state.stepHistory.push(stepId);
    }
    
    this.state.currentStep = stepId;

    try {
      await this.executeStep(step, flow);
    } catch (error) {
      await this.handleStepError(error as Error, step);
    }
  }

  /**
   * Go back to the previous step
   */
  async goBack(): Promise<void> {
    if (this.state.stepHistory.length <= 1) {
      // If no history or only current step, go to main menu
      await this.navigateToFlow('main-menu');
      return;
    }

    // Remove current step and go to previous
    this.state.stepHistory.pop();
    const previousStep = this.state.stepHistory[this.state.stepHistory.length - 1];
    
    if (previousStep) {
      this.state.currentStep = previousStep;
      await this.navigateToStep(previousStep);
    }
  }

  /**
   * Execute a navigation step
   */
  private async executeStep(step: NavigationStep, flow: NavigationFlow): Promise<void> {
    // Clear screen and show header
    console.clear();
    this.renderStepHeader(step, flow);

    // Process each choice in the step
    const answers: any = {};
    
    for (const choice of step.choices) {
      // Check if this choice should be shown
      if (choice.when && !choice.when(answers)) {
        continue;
      }

      try {
        const answer = await this.promptChoice(choice, answers);
        answers[choice.name] = answer;
      } catch (error) {
        if (error instanceof Error && error.message === 'USER_CANCELLED') {
          await this.handleUserCancellation(step);
          return;
        }
        throw error;
      }
    }

    // Process the step completion
    let result: NavigationResult;
    
    if (step.onComplete) {
      result = await step.onComplete(answers);
    } else {
      result = { action: 'continue', data: answers };
    }

    // Store step data
    this.state.flowData[flow.id] = {
      ...this.state.flowData[flow.id],
      [step.id]: answers
    };

    // Handle the result
    await this.handleNavigationResult(result, step, flow);
  }

  /**
   * Prompt user with a choice using inquirer
   */
  private async promptChoice(choice: MenuChoice, previousAnswers: any): Promise<any> {
    const prompt = {
      ...choice,
      validate: choice.validate || this.getDefaultValidator(choice.type),
      filter: choice.filter || this.getDefaultFilter(choice.type)
    };

    // Add navigation options for list choices
    if (choice.type === 'list' && choice.choices) {
      const enhancedChoices = [...choice.choices];
      
      // Add separator and navigation options
      enhancedChoices.push(
        { name: '─────────────────────', value: '__separator__', disabled: true },
        { name: '← Back', value: '__back__', short: 'Back' },
        { name: '🏠 Main Menu', value: '__home__', short: 'Home' },
        { name: '❓ Help', value: '__help__', short: 'Help' },
        { name: '🚪 Exit', value: '__exit__', short: 'Exit' }
      );
      
      prompt.choices = enhancedChoices;
    }

    const answers = await inquirer.prompt([prompt]);
    const answer = answers[choice.name];

    // Handle special navigation commands
    if (typeof answer === 'string') {
      switch (answer) {
        case '__separator__':
          // Separator was selected, prompt again
          return this.promptChoice(choice, previousAnswers);
        case '__back__':
          await this.goBack();
          throw new Error('USER_CANCELLED');
        case '__home__':
          await this.navigateToFlow('main-menu');
          throw new Error('USER_CANCELLED');
        case '__help__':
          await this.showContextualHelp();
          return this.promptChoice(choice, previousAnswers);
        case '__exit__':
          await this.confirmExit();
          throw new Error('USER_CANCELLED');
      }
    }

    return answer;
  }

  /**
   * Handle navigation result
   */
  private async handleNavigationResult(
    result: NavigationResult, 
    step: NavigationStep, 
    flow: NavigationFlow
  ): Promise<void> {
    switch (result.action) {
      case 'continue':
        // Find next step or complete flow
        const currentIndex = flow.steps.findIndex(s => s.id === step.id);
        if (currentIndex < flow.steps.length - 1) {
          await this.navigateToStep(flow.steps[currentIndex + 1].id);
        } else {
          await this.completeFlow(flow, result.data);
        }
        break;

      case 'back':
        await this.goBack();
        break;

      case 'navigate':
        if (result.nextStep) {
          await this.navigateToStep(result.nextStep);
        }
        break;

      case 'exit':
        await this.stop();
        process.exit(0);
        break;

      case 'restart':
        await this.navigateToFlow(flow.id);
        break;
    }
  }

  /**
   * Complete a navigation flow
   */
  private async completeFlow(flow: NavigationFlow, data?: any): Promise<void> {
    if (flow.onComplete) {
      await flow.onComplete(data);
    }

    // Show completion message
    console.log(`\n✅ ${flow.title} completed successfully!`);
    
    // Return to main menu
    await this.pause();
    await this.navigateToFlow('main-menu');
  }

  /**
   * Render step header
   */
  private renderStepHeader(step: NavigationStep, flow: NavigationFlow): void {
    const width = 70;
    
    // Flow title
    console.log('┌' + '─'.repeat(width - 2) + '┐');
    console.log(`│ ${flow.title.padEnd(width - 4)} │`);
    console.log('├' + '─'.repeat(width - 2) + '┤');
    
    // Step title
    console.log(`│ ${step.title.padEnd(width - 4)} │`);
    
    if (step.description) {
      console.log('├' + '─'.repeat(width - 2) + '┤');
      const lines = this.wrapText(step.description, width - 4);
      lines.forEach(line => {
        console.log(`│ ${line.padEnd(width - 4)} │`);
      });
    }
    
    console.log('└' + '─'.repeat(width - 2) + '┘');
    console.log();
  }

  /**
   * Wrap text to fit within specified width
   */
  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Get default validator for choice type
   */
  private getDefaultValidator(type: string): (input: any) => boolean | string {
    switch (type) {
      case 'input':
        return (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'This field is required';
          }
          return true;
        };
      case 'password':
        return (input: string) => {
          if (!input || input.length < 3) {
            return 'Password must be at least 3 characters';
          }
          return true;
        };
      default:
        return () => true;
    }
  }

  /**
   * Get default filter for choice type
   */
  private getDefaultFilter(type: string): (input: any) => any {
    switch (type) {
      case 'input':
        return (input: string) => input.trim();
      default:
        return (input: any) => input;
    }
  }

  /**
   * Show contextual help
   */
  private async showContextualHelp(): Promise<void> {
    console.clear();
    console.log('❓ Navigation Help');
    console.log('─'.repeat(50));
    console.log();
    console.log('🧭 Navigation:');
    console.log('  • Use arrow keys to navigate menu options');
    console.log('  • Press Enter to select an option');
    console.log('  • Use "← Back" to go to previous step');
    console.log('  • Use "🏠 Main Menu" to return to main menu');
    console.log('  • Use "🚪 Exit" to quit the application');
    console.log();
    console.log('💡 Tips:');
    console.log('  • Look for disabled options - they show requirements');
    console.log('  • Use Ctrl+C to force quit at any time');
    console.log('  • Check system status for configuration issues');
    console.log();
    
    await this.pause();
  }

  /**
   * Confirm exit
   */
  private async confirmExit(): Promise<void> {
    const answer = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmExit',
      message: 'Are you sure you want to exit?',
      default: false
    }]);

    if (answer.confirmExit) {
      await this.stop();
      process.exit(0);
    }
  }

  /**
   * Handle user cancellation
   */
  private async handleUserCancellation(step: NavigationStep): Promise<void> {
    if (step.allowBack !== false) {
      await this.goBack();
    } else {
      await this.navigateToFlow('main-menu');
    }
  }

  /**
   * Handle navigation errors
   */
  private async handleNavigationError(error: Error): Promise<void> {
    const context: ErrorContext = {
      operation: 'navigation',
      timestamp: new Date()
    };

    const interactiveError = InteractiveErrorHandler.handleUnknownError(error, context);
    await InteractiveErrorHandler.displayError(interactiveError);
    
    // Try to recover by going to main menu
    try {
      await this.navigateToFlow('main-menu');
    } catch (recoveryError) {
      console.error('❌ Failed to recover from navigation error');
      await this.stop();
      process.exit(1);
    }
  }

  /**
   * Handle step execution errors
   */
  private async handleStepError(error: Error, step: NavigationStep): Promise<void> {
    const context: ErrorContext = {
      operation: `execute step ${step.id}`,
      timestamp: new Date()
    };

    const interactiveError = InteractiveErrorHandler.handleUnknownError(error, context);
    await InteractiveErrorHandler.displayError(interactiveError);
    
    // Offer recovery options
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'recovery',
      message: 'How would you like to proceed?',
      choices: [
        { name: 'Try Again', value: 'retry' },
        { name: 'Go Back', value: 'back' },
        { name: 'Main Menu', value: 'home' },
        { name: 'Exit', value: 'exit' }
      ]
    }]);

    switch (answer.recovery) {
      case 'retry':
        await this.navigateToStep(step.id);
        break;
      case 'back':
        await this.goBack();
        break;
      case 'home':
        await this.navigateToFlow('main-menu');
        break;
      case 'exit':
        await this.stop();
        process.exit(0);
        break;
    }
  }

  /**
   * Pause execution and wait for user input
   */
  private async pause(): Promise<void> {
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...',
      validate: () => true
    }]);
  }

  /**
   * Initialize navigation flows
   */
  private initializeFlows(): void {
    // Main Menu Flow
    this.flows.set('main-menu', {
      id: 'main-menu',
      title: 'ADPA Interactive CLI - Main Menu',
      description: 'Welcome to the Automated Document Processing & Analysis system',
      steps: [{
        id: 'main-selection',
        title: 'Main Menu',
        description: 'Select an option to get started',
        choices: [{
          type: 'list',
          name: 'mainChoice',
          message: 'What would you like to do?',
          pageSize: 12,
          choices: [
            { name: '🚀 Quick Start - Get started quickly', value: 'quick-start' },
            { name: '📝 Document Generation - Generate project documents', value: 'document-generation' },
            { name: '🤖 AI Configuration - Configure AI providers', value: 'ai-configuration' },
            { name: '📊 Project Management - Project analysis tools', value: 'project-management' },
            { name: '🔗 Integrations - External system integrations', value: 'integrations' },
            { name: '📈 Analytics & Feedback - Document analytics', value: 'analytics' },
            { name: '⚙️ System Configuration - System settings', value: 'system-config' },
            { name: '🔍 Workspace Analysis - Analyze current workspace', value: 'workspace-analysis' },
            { name: '❓ Help & Documentation - User assistance', value: 'help' }
          ]
        }],
        onComplete: async (answers) => {
          await this.navigateToFlow(answers.mainChoice);
          return { action: 'continue' };
        }
      }]
    });

    // Quick Start Flow
    this.flows.set('quick-start', {
      id: 'quick-start',
      title: 'Quick Start Wizard',
      description: 'Get up and running with ADPA in just a few steps',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Quick Start',
          description: 'This wizard will help you set up ADPA and generate your first documents',
          choices: [{
            type: 'list',
            name: 'action',
            message: 'What would you like to do first?',
            choices: [
              { name: '🔧 Environment Setup - Configure your development environment', value: 'setup' },
              { name: '📋 Generate Core Documents - Create essential project documents', value: 'generate-core' },
              { name: '🏗️ Project Charter Wizard - Step-by-step charter creation', value: 'project-charter' },
              { name: '👥 Stakeholder Analysis - Analyze project stakeholders', value: 'stakeholder-analysis' },
              { name: '📊 Risk Assessment - Perform risk analysis', value: 'risk-assessment' },
              { name: '📚 Browse Templates - View available templates', value: 'browse-templates' }
            ]
          }],
          onComplete: async (answers) => {
            return { action: 'navigate', nextStep: answers.action };
          }
        },
        {
          id: 'setup',
          title: 'Environment Setup',
          description: 'Configure your ADPA environment',
          choices: [{
            type: 'confirm',
            name: 'runSetup',
            message: 'Would you like to run the interactive setup wizard?',
            default: true
          }],
          onComplete: async (answers) => {
            if (answers.runSetup) {
              console.log('\n🔄 Starting environment setup...');
              const result = await this.commandIntegration.executeCommand('setup', []);
              if (result.success) {
                console.log('✅ Environment setup completed successfully!');
              } else {
                console.log('❌ Environment setup failed. Please check the configuration.');
              }
              await this.pause();
            }
            return { action: 'back' };
          }
        },
        {
          id: 'generate-core',
          title: 'Generate Core Documents',
          description: 'Generate essential project documents to get started',
          choices: [{
            type: 'checkbox',
            name: 'documents',
            message: 'Select documents to generate:',
            choices: [
              { name: 'Project Charter', value: 'project-charter', checked: true },
              { name: 'Stakeholder Register', value: 'stakeholder-register', checked: true },
              { name: 'Risk Management Plan', value: 'risk-management-plan', checked: true },
              { name: 'Business Case', value: 'business-case', checked: false },
              { name: 'Project Scope Statement', value: 'project-scope-statement', checked: false }
            ]
          }],
          onComplete: async (answers) => {
            if (answers.documents && answers.documents.length > 0) {
              console.log('\n🔄 Generating selected documents...');
              for (const doc of answers.documents) {
                console.log(`📝 Generating ${doc}...`);
                const result = await this.commandIntegration.executeCommand('generate', [doc]);
                if (result.success) {
                  console.log(`✅ ${doc} generated successfully`);
                } else {
                  console.log(`❌ Failed to generate ${doc}`);
                }
              }
              await this.pause();
            }
            return { action: 'back' };
          }
        }
      ]
    });

    // Document Generation Flow
    this.flows.set('document-generation', {
      id: 'document-generation',
      title: 'Document Generation',
      description: 'Generate professional project documents using AI',
      steps: [{
        id: 'generation-options',
        title: 'Document Generation Options',
        description: 'Choose how you want to generate documents',
        choices: [{
          type: 'list',
          name: 'option',
          message: 'Select generation method:',
          choices: [
            { name: '📚 Browse by Category - Browse templates by category', value: 'browse-categories' },
            { name: '🔍 Search Templates - Search for specific templates', value: 'search-templates' },
            { name: '⚡ Generate Single Document - Generate one document', value: 'single-document' },
            { name: '📦 Generate Category - Generate all documents in a category', value: 'category-generation' },
            { name: '🌟 Generate All Documents - Generate all available documents', value: 'generate-all' },
            { name: '🎯 Custom Generation - Custom generation options', value: 'custom-generation' }
          ]
        }],
        onComplete: async (answers) => {
          switch (answers.option) {
            case 'search-templates':
              await this.searchTemplatesInteractive();
              break;
            case 'single-document':
              await this.singleDocumentGeneration();
              break;
            case 'generate-all':
              await this.generateAllDocuments();
              break;
            default:
              console.log(`🚧 ${answers.option} is not yet implemented in this enhanced interface`);
              await this.pause();
          }
          return { action: 'back' };
        }
      }]
    });

    // AI Configuration Flow
    this.flows.set('ai-configuration', {
      id: 'ai-configuration',
      title: 'AI Provider Configuration',
      description: 'Configure AI providers for document generation',
      steps: [{
        id: 'provider-selection',
        title: 'AI Provider Selection',
        description: 'Choose and configure your AI provider',
        choices: [{
          type: 'list',
          name: 'provider',
          message: 'Select AI provider to configure:',
          choices: [
            { name: '🤖 Google AI (Gemini) - Recommended for most users', value: 'google-ai' },
            { name: '🧠 OpenAI - GPT models', value: 'openai' },
            { name: '☁️ Azure OpenAI - Enterprise Azure integration', value: 'azure-openai' },
            { name: '🔍 Test Current Provider - Test existing configuration', value: 'test-provider' },
            { name: '📊 Provider Status - View provider status and metrics', value: 'provider-status' }
          ]
        }],
        onComplete: async (answers) => {
          switch (answers.provider) {
            case 'test-provider':
              console.log('\n🔄 Testing AI provider connection...');
              const result = await this.commandIntegration.executeCommand('validate', ['--ai-connection']);
              if (result.success) {
                console.log('✅ AI provider connection successful!');
              } else {
                console.log('❌ AI provider connection failed. Please check configuration.');
              }
              await this.pause();
              break;
            default:
              console.log('\n🔄 Configuring AI provider...');
              const setupResult = await this.commandIntegration.executeCommand('setup', ['--provider', answers.provider]);
              if (setupResult.success) {
                console.log('✅ AI provider configured successfully!');
              } else {
                console.log('❌ AI provider configuration failed.');
              }
              await this.pause();
          }
          return { action: 'back' };
        }
      }]
    });
  }

  /**
   * Interactive template search
   */
  private async searchTemplatesInteractive(): Promise<void> {
    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'searchTerm',
      message: 'Enter search term (or press Enter to see all templates):',
      validate: (input) => true // Allow empty input
    }]);

    console.log('\n🔍 Searching templates...');
    
    // This would integrate with the actual template system
    console.log('\n📋 Available Templates:');
    console.log('• Project Charter (project-charter)');
    console.log('• Stakeholder Register (stakeholder-register)');
    console.log('• Risk Management Plan (risk-management-plan)');
    console.log('• Business Case (business-case)');
    console.log('• ... and 116 more templates');
    
    await this.pause();
  }

  /**
   * Single document generation
   */
  private async singleDocumentGeneration(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'templateName',
        message: 'Enter template name:',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Template name is required';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'context',
        message: 'Enter context (optional):',
        validate: () => true
      }
    ]);

    console.log('\n🔄 Generating document...');
    const args = [answers.templateName];
    if (answers.context) {
      args.push('--context', answers.context);
    }

    const result = await this.commandIntegration.executeCommand('generate', args);
    if (result.success) {
      console.log('✅ Document generated successfully!');
    } else {
      console.log('❌ Document generation failed.');
    }
    
    await this.pause();
  }

  /**
   * Generate all documents
   */
  private async generateAllDocuments(): Promise<void> {
    const confirm = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmGenerate',
      message: 'This will generate all 120+ templates. This may take several minutes. Continue?',
      default: false
    }]);

    if (confirm.confirmGenerate) {
      console.log('\n🔄 Generating all documents...');
      const result = await this.commandIntegration.executeCommand('generate-all', []);
      if (result.success) {
        console.log('✅ All documents generated successfully!');
      } else {
        console.log('❌ Document generation failed.');
      }
      await this.pause();
    }
  }
}

/**
 * Factory function to create and start the enhanced navigation system
 */
export async function startEnhancedNavigation(): Promise<void> {
  const navigation = new EnhancedMenuNavigation();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    await navigation.stop();
    process.exit(0);
  });

  try {
    await navigation.start();
  } catch (error) {
    console.error('❌ Error starting enhanced navigation:', error);
    await navigation.stop();
    process.exit(1);
  }
}

export default EnhancedMenuNavigation;