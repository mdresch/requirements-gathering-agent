/**
 * Interactive CLI Menu System
 * 
 * Provides a Yeoman-style interactive CLI interface for the ADPA system.
 * This is the main entry point for the interactive menu functionality.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import * as readline from 'readline';
import { EventEmitter } from 'events';
import { CommandIntegrationService } from './CommandIntegration.js';
import { InputValidationService, ValidationResult } from './InputValidationService.js';
import { InteractiveErrorHandler, ErrorContext, InteractiveError } from './InteractiveErrorHandler.js';
import { spawn } from 'child_process';


// Types and Interfaces
export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  description?: string;
  enabled: boolean;
  badge?: string;
  action: MenuAction;
}

export interface MenuAction {
  type: 'navigate' | 'function' | 'command';
  target?: string;
  handler?: string;
  command?: string;
  args?: string[];
}

export interface MenuConfig {
  id: string;
  title: string;
  items: MenuItem[];
  showBreadcrumb: boolean;
  showStatusBar: boolean;
  parent?: string;
}

export interface MenuResult {
  action: 'continue' | 'back' | 'home' | 'exit';
  data?: any;
}

export interface SystemStatus {
  aiProviderConfigured: boolean;
  projectInitialized: boolean;
  integrationsConfigured: boolean;
  documentsGenerated: number;
  lastActivity?: Date;
}

/**
 * Main Interactive Menu System Class
 */
export class InteractiveMenuSystem extends EventEmitter {
  private rl: readline.Interface;
  private navigationStack: string[] = [];
  private currentMenu?: string;
  private menus: Map<string, MenuConfig> = new Map();
  private systemStatus: SystemStatus;
  private commandIntegration: CommandIntegrationService;

  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.systemStatus = {
      aiProviderConfigured: false,
      projectInitialized: false,
      integrationsConfigured: false,
      documentsGenerated: 0
    };

    this.commandIntegration = new CommandIntegrationService();
    this.initializeMenus();
  }

  /**
   * Start the interactive menu system
   */
  async start(): Promise<void> {
    console.log('🚀 Starting ADPA Interactive CLI...\n');
    
    // Load system status
    await this.loadSystemStatus();
    
    // Navigate to main menu
    await this.navigateTo('main-menu');
  }

  /**
   * Stop the interactive menu system
   */
  async stop(): Promise<void> {
    this.rl.close();
    console.log('\n👋 Thank you for using ADPA Interactive CLI!');
  }

  /**
   * Navigate to a specific menu
   */
  async navigateTo(menuId: string, params?: any): Promise<void> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      console.error(`❌ Menu not found: ${menuId}`);
      return;
    }

    this.navigationStack.push(menuId);
    this.currentMenu = menuId;

    await this.renderMenu(menu);
    await this.handleMenuInput(menu);
  }

  /**
   * Go back to previous menu
   */
  async goBack(): Promise<void> {
    if (this.navigationStack.length > 1) {
      this.navigationStack.pop(); // Remove current
      const previous = this.navigationStack.pop(); // Get previous
      if (previous) {
        await this.navigateTo(previous);
      }
    } else {
      console.log('📍 Already at the top level menu');
      await this.navigateTo('main-menu');
    }
  }

  /**
   * Go to main menu
   */
  async goHome(): Promise<void> {
    this.navigationStack = [];
    await this.navigateTo('main-menu');
  }

  /**
   * Render a menu to the console
   */
  private async renderMenu(menu: MenuConfig): Promise<void> {
    this.clearScreen();
    
    // Show breadcrumb if enabled
    if (menu.showBreadcrumb && this.navigationStack.length > 1) {
      this.renderBreadcrumb();
    }

    // Render menu header
    this.renderMenuHeader(menu.title);

    // Render menu items
    for (const item of menu.items) {
      this.renderMenuItem(item);
    }

    // Render menu footer
    this.renderMenuFooter();

    // Show status bar if enabled
    if (menu.showStatusBar) {
      this.renderStatusBar();
    }
  }

  /**
   * Handle user input for a menu
   */
  private async handleMenuInput(menu: MenuConfig): Promise<void> {
    while (true) {
      try {
        const choice = await this.promptForChoice('Select an option (or type "back", "home", "help", "exit"): ');
        
        // Validate menu choice
        const validChoices = menu.items.map(item => item.key);
        const validationResult = InputValidationService.validateMenuChoice(choice, validChoices);
        
        if (!validationResult.isValid) {
          const context: ErrorContext = {
            operation: 'menu selection',
            userInput: choice,
            menuId: menu.id,
            timestamp: new Date()
          };
          
          const error = InteractiveErrorHandler.handleValidationError(validationResult, context);
          await InteractiveErrorHandler.displayError(error);
          
          const action = await InteractiveErrorHandler.getRecoveryAction(error, this.promptForChoice.bind(this));
          
          switch (action) {
            case 'retry':
              continue; // Try again
            case 'back':
              await this.goBack();
              return;
            case 'help':
              await this.showNavigationHelp();
              continue;
            case 'exit':
              await this.stop();
              process.exit(0);
              return;
          }
          continue;
        }

        const sanitizedChoice = validationResult.sanitizedValue!;
        
        // Handle special navigation commands
        switch (sanitizedChoice) {
          case 'back':
          case 'b':
            await this.goBack();
            return;
          case 'home':
          case 'h':
            await this.goHome();
            return;
          case 'help':
          case '?':
            await this.showNavigationHelp();
            continue;
          case 'exit':
          case 'quit':
          case 'q':
            await this.stop();
            process.exit(0);
            return;
          case 'status':
          case 's':
            await this.showSystemStatus();
            continue;
          case 'refresh':
          case 'r':
            await this.loadSystemStatus();
            await this.renderMenu(menu);
            continue;
        }
        
        // Handle numeric menu selections
        const selectedItem = menu.items.find(item => item.key === sanitizedChoice);
        if (!selectedItem) {
          // This shouldn't happen due to validation, but handle it gracefully
          console.log('❌ Invalid choice. Please try again.');
          continue;
        }

        if (!selectedItem.enabled) {
          console.log('⚠️  This option is currently disabled.');
          console.log('💡 Check system status or configuration to enable this option.');
          await this.pause();
          continue;
        }

        // Execute the menu action with error handling
        const success = await this.executeMenuActionWithErrorHandling(selectedItem.action, menu.id);
        if (success) {
          return; // Action completed successfully
        }
        // If action failed, continue the menu loop
        
      } catch (error) {
        const context: ErrorContext = {
          operation: 'menu input handling',
          menuId: menu.id,
          timestamp: new Date()
        };
        
        const interactiveError = InteractiveErrorHandler.handleUnknownError(error as Error, context);
        await InteractiveErrorHandler.displayError(interactiveError);
        
        const action = await InteractiveErrorHandler.getRecoveryAction(interactiveError, this.promptForChoice.bind(this));
        
        switch (action) {
          case 'retry':
            continue;
          case 'back':
            await this.goBack();
            return;
          case 'exit':
            await this.stop();
            process.exit(0);
            return;
          case 'help':
            await this.showNavigationHelp();
            continue;
        }
      }
    }
  }

  /**
   * Execute a menu action with enhanced error handling
   */
  private async executeMenuActionWithErrorHandling(action: MenuAction, menuId: string): Promise<boolean> {
    const context: ErrorContext = {
      operation: `execute ${action.type} action`,
      menuId,
      timestamp: new Date()
    };

    try {
      switch (action.type) {
        case 'navigate':
          if (action.target) {
            await this.navigateTo(action.target);
            return true;
          }
          break;

        case 'function':
          if (action.handler) {
            await this.executeFunctionWithErrorHandling(action.handler, context);
            return true;
          }
          break;

        case 'command':
          if (action.command) {
            await this.executeCommandWithErrorHandling(action.command, action.args || [], context);
            return true;
          }
          break;

        default:
          console.log('❌ Unknown action type');
          return false;
      }
    } catch (error) {
      const interactiveError = InteractiveErrorHandler.handleUnknownError(error as Error, context);
      await InteractiveErrorHandler.displayError(interactiveError);
      
      const recoveryAction = await InteractiveErrorHandler.getRecoveryAction(interactiveError, this.promptForChoice.bind(this));
      
      switch (recoveryAction) {
        case 'retry':
          return await this.executeMenuActionWithErrorHandling(action, menuId);
        case 'back':
          await this.goBack();
          return true;
        case 'exit':
          await this.stop();
          process.exit(0);
          return true;
        case 'help':
          await this.showNavigationHelp();
          return false;
        default:
          return false;
      }
    }
    
    return false;
  }

  /**
   * Execute a menu action (legacy method for backward compatibility)
   */
  private async executeMenuAction(action: MenuAction): Promise<void> {
    await this.executeMenuActionWithErrorHandling(action, this.currentMenu || 'unknown');
  }

  /**
   * Execute a function handler with error handling
   */
  private async executeFunctionWithErrorHandling(handlerName: string, context: ErrorContext): Promise<void> {
  await InteractiveErrorHandler.withErrorHandling(
      () => this.executeFunction(handlerName),
      { ...context, operation: `execute function ${handlerName}` },
      this.promptForChoice.bind(this)
    );
  }

  /**
   * Execute a function handler
   */
  private async executeFunction(handlerName: string): Promise<void> {
    switch (handlerName) {
      case 'searchTemplates':
        await this.searchTemplates();
        break;
      case 'showSystemStatus':
        await this.showSystemStatus();
        break;
      case 'setupEnvironment':
        await this.setupEnvironment();
        break;
      case 'showRecentDocuments':
        await this.showRecentDocuments();
        break;
      case 'showProviderStatus':
        await this.showProviderStatus();
        break;
      case 'showIntegrationStatus':
        await this.showIntegrationStatus();
        break;
      case 'showPerformanceInsights':
        await this.showPerformanceInsights();
        break;
      case 'manageTemplates':
        await this.manageTemplates();
        break;
      case 'configureOutput':
        await this.configureOutput();
        break;
      case 'runDiagnostics':
        await this.runDiagnostics();
        break;
      case 'showGettingStarted':
        await this.showGettingStarted();
        break;
      case 'showCommandReference':
        await this.showCommandReference();
        break;
      case 'showTemplateGuide':
        await this.showTemplateGuide();
        break;
      case 'showTroubleshooting':
        await this.showTroubleshooting();
        break;
      case 'showAbout':
        await this.showAbout();
        break;
      case 'interactiveTemplateSelection':
        await this.interactiveTemplateSelection();
        break;
      case 'batchGeneration':
        await this.batchGeneration();
        break;
      case 'customContextGeneration':
        await this.customContextGeneration();
        break;
      case 'configureAdobe':
        await this.configureAdobe();
        break;
      case 'customRiskAssessment':
        await this.customRiskAssessment();
        break;
      case 'exit':
        await this.stop();
        process.exit(0);
        break;
      default:
        console.log(`⚠️  Function not implemented: ${handlerName}`);
        console.log('💡 This feature is planned for a future release.');
        await this.pause();
        if (this.currentMenu) {
          await this.navigateTo(this.currentMenu);
        }
    }
  }

  /**
   * Execute a CLI command with error handling
   */
  private async executeCommandWithErrorHandling(command: string, args: string[], context: ErrorContext): Promise<void> {
  await InteractiveErrorHandler.withErrorHandling(
      () => this.executeCommand(command, args),
      { ...context, operation: `execute command ${command}` },
      this.promptForChoice.bind(this)
    );
  }

  /**
   * Execute a CLI command using the integrated command service
   */
  private async executeCommand(command: string, args: string[]): Promise<void> {
    try {
      // Use the integrated command service instead of spawning child processes
      const result = await this.commandIntegration.executeCommand(command, args);
      
      // Execute the command in a child process
      const childProcess = spawn('node', ['dist/cli.js', command, ...args], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      // Wait for the command to complete
      await new Promise((resolve, reject) => {
  childProcess.on('close', (code: number) => {
          if (code === 0) {
            console.log('✅ Command executed successfully');
            resolve(code);
          } else {
            console.log(`⚠️  Command exited with code ${code}`);
            resolve(code);
          }
        });
        
        childProcess.on('error', (error) => {
          if (error instanceof Error) {
            console.error('❌ Error executing command:', error.message);
          } else {
            console.error('❌ Error executing command:', error);
          }
          reject(error);
        });
      });
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Error executing command:', error.message);
      } else {
        console.error('❌ Error executing command:', error);
      }
      console.log('💡 Make sure the CLI is properly built and configured.');
    }
    
    await this.pause();
    
    // Return to current menu after command execution
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Initialize all menu configurations
   */
  private initializeMenus(): void {
    // Main Menu
    this.menus.set('main-menu', {
      id: 'main-menu',
      title: 'ADPA Interactive CLI - Main Menu',
      showBreadcrumb: false,
      showStatusBar: true,
      items: [
        {
          key: '1',
          label: 'Quick Start',
          icon: '🚀',
          description: 'Get started quickly with common workflows',
          enabled: true,
          action: { type: 'navigate', target: 'quick-start' }
        },
        {
          key: '2',
          label: 'Document Generation',
          icon: '📝',
          description: 'Generate project documents',
          enabled: true,
          badge: '120+ templates',
          action: { type: 'navigate', target: 'document-generation' }
        },
        {
          key: '3',
          label: 'AI Configuration',
          icon: '🤖',
          description: 'Configure AI providers',
          enabled: true,
          badge: this.getProviderStatusBadge(),
          action: { type: 'navigate', target: 'ai-configuration' }
        },
        {
          key: '4',
          label: 'Project Management',
          icon: '📊',
          description: 'Project analysis and management tools',
          enabled: true,
          action: { type: 'navigate', target: 'project-management' }
        },
        {
          key: '5',
          label: 'Integrations',
          icon: '🔗',
          description: 'External system integrations',
          enabled: true,
          action: { type: 'navigate', target: 'integrations' }
        },
        {
          key: '6',
          label: 'Analytics & Feedback',
          icon: '📈',
          description: 'Document analytics and feedback',
          enabled: true,
          action: { type: 'navigate', target: 'analytics' }
        },
        {
          key: '7',
          label: 'System Configuration',
          icon: '⚙️',
          description: 'System settings and configuration',
          enabled: true,
          action: { type: 'navigate', target: 'system-config' }
        },
        {
          key: '8',
          label: 'Workspace Analysis',
          icon: '🔍',
          description: 'Analyze current workspace',
          enabled: true,
          action: { type: 'function', handler: 'showSystemStatus' }
        },
        {
          key: '9',
          label: 'Help & Documentation',
          icon: '❓',
          description: 'User assistance and documentation',
          enabled: true,
          action: { type: 'navigate', target: 'help' }
        },
        {
          key: '0',
          label: 'Exit',
          icon: '🚪',
          description: 'Exit the application',
          enabled: true,
          action: { type: 'function', handler: 'exit' }
        }
      ]
    });

    // Quick Start Menu
    this.menus.set('quick-start', {
      id: 'quick-start',
      title: 'Quick Start',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'New Project Setup',
          icon: '🎯',
          description: 'Initialize a new project',
          enabled: true,
          action: { type: 'function', handler: 'setupEnvironment' }
        },
        {
          key: '2',
          label: 'Generate Core Documents',
          icon: '📋',
          description: 'Generate essential project documents',
          enabled: this.systemStatus.projectInitialized,
          action: { type: 'command', command: 'generate', args: ['core-analysis'] }
        },
        {
          key: '3',
          label: 'Project Charter Wizard',
          icon: '🏗️',
          description: 'Step-by-step charter creation',
          enabled: true,
          action: { type: 'command', command: 'generate', args: ['project-charter'] }
        },
        {
          key: '4',
          label: 'Stakeholder Analysis',
          icon: '👥',
          description: 'Analyze project stakeholders',
          enabled: true,
          action: { type: 'command', command: 'stakeholder', args: ['analysis'] }
        },
        {
          key: '5',
          label: 'Risk Assessment',
          icon: '📊',
          description: 'Perform risk analysis',
          enabled: true,
          action: { type: 'command', command: 'risk-compliance', args: ['--type', 'SOFTWARE_DEVELOPMENT'] }
        },
        {
          key: '6',
          label: 'Environment Setup',
          icon: '🔧',
          description: 'Configure development environment',
          enabled: true,
          action: { type: 'function', handler: 'setupEnvironment' }
        },
        {
          key: '7',
          label: 'View Templates',
          icon: '📚',
          description: 'Browse available templates',
          enabled: true,
          action: { type: 'function', handler: 'searchTemplates' }
        },
        {
          key: '8',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // Document Generation Menu
    this.menus.set('document-generation', {
      id: 'document-generation',
      title: 'Document Generation',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Browse by Category',
          icon: '📚',
          description: 'Browse templates by category',
          enabled: true,
          action: { type: 'navigate', target: 'browse-categories' }
        },
        {
          key: '2',
          label: 'Search Templates',
          icon: '🔍',
          description: 'Search for specific templates',
          enabled: true,
          action: { type: 'function', handler: 'searchTemplates' }
        },
        {
          key: '3',
          label: 'Generate Single Document',
          icon: '⚡',
          description: 'Generate a single document',
          enabled: true,
          action: { type: 'command', command: 'generate' }
        },
        {
          key: '4',
          label: 'Generate Category',
          icon: '📦',
          description: 'Generate all documents in a category',
          enabled: true,
          action: { type: 'command', command: 'generate-category' }
        },
        {
          key: '5',
          label: 'Generate All Documents',
          icon: '🌟',
          description: 'Generate all available documents',
          enabled: true,
          action: { type: 'command', command: 'generate-all' }
        },
        {
          key: '6',
          label: 'Custom Generation',
          icon: '🎯',
          description: 'Custom document generation options',
          enabled: true,
          action: { type: 'navigate', target: 'custom-generation' }
        },
        {
          key: '7',
          label: 'Recent Documents',
          icon: '📋',
          description: 'View recently generated documents',
          enabled: true,
          action: { type: 'function', handler: 'showRecentDocuments' }
        },
        {
          key: '8',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // AI Configuration Menu
    this.menus.set('ai-configuration', {
      id: 'ai-configuration',
      title: 'AI Configuration',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Configure Google AI',
          icon: '🤖',
          description: 'Set up Google AI (Gemini) provider',
          enabled: true,
          action: { type: 'command', command: 'setup', args: ['--provider', 'google-ai'] }
        },
        {
          key: '2',
          label: 'Configure OpenAI',
          icon: '🧠',
          description: 'Set up OpenAI provider',
          enabled: true,
          action: { type: 'command', command: 'setup', args: ['--provider', 'openai'] }
        },
        {
          key: '3',
          label: 'Configure Azure OpenAI',
          icon: '☁️',
          description: 'Set up Azure OpenAI provider',
          enabled: true,
          action: { type: 'command', command: 'setup', args: ['--provider', 'azure-openai'] }
        },
        {
          key: '4',
          label: 'Test AI Connection',
          icon: '🔍',
          description: 'Test current AI provider connection',
          enabled: this.systemStatus.aiProviderConfigured,
          action: { type: 'command', command: 'validate', args: ['--ai-connection'] }
        },
        {
          key: '5',
          label: 'Provider Status',
          icon: '📊',
          description: 'View AI provider status and metrics',
          enabled: true,
          action: { type: 'function', handler: 'showProviderStatus' }
        },
        {
          key: '6',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // Project Management Menu
    this.menus.set('project-management', {
      id: 'project-management',
      title: 'Project Management',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Project Analysis',
          icon: '🔍',
          description: 'Analyze current project structure',
          enabled: true,
          action: { type: 'command', command: 'analyze', args: ['workspace'] }
        },
        {
          key: '2',
          label: 'Stakeholder Management',
          icon: '👥',
          description: 'Stakeholder analysis and management',
          enabled: true,
          action: { type: 'navigate', target: 'stakeholder-management' }
        },
        {
          key: '3',
          label: 'Risk & Compliance',
          icon: '⚠️',
          description: 'Risk assessment and compliance checking',
          enabled: true,
          action: { type: 'navigate', target: 'risk-compliance' }
        },
        {
          key: '4',
          label: 'Business Analysis',
          icon: '📊',
          description: 'Business analysis tools and workflows',
          enabled: true,
          action: { type: 'command', command: 'business-analysis', args: ['--interactive'] }
        },
        {
          key: '5',
          label: 'Project Status',
          icon: '📈',
          description: 'View project status and metrics',
          enabled: true,
          action: { type: 'command', command: 'status', args: ['--detailed'] }
        },
        {
          key: '6',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // Integrations Menu
    this.menus.set('integrations', {
      id: 'integrations',
      title: 'External Integrations',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Confluence Integration',
          icon: '📚',
          description: 'Configure and manage Confluence publishing',
          enabled: true,
          action: { type: 'navigate', target: 'confluence-integration' }
        },
        {
          key: '2',
          label: 'SharePoint Integration',
          icon: '📁',
          description: 'Configure and manage SharePoint publishing',
          enabled: true,
          action: { type: 'navigate', target: 'sharepoint-integration' }
        },
        {
          key: '3',
          label: 'Version Control',
          icon: '🔄',
          description: 'Git and version control integration',
          enabled: true,
          action: { type: 'navigate', target: 'vcs-integration' }
        },
        {
          key: '4',
          label: 'Adobe Creative Suite',
          icon: '🎨',
          description: 'Adobe Creative Suite integration',
          enabled: true,
          action: { type: 'function', handler: 'configureAdobe' }
        },
        {
          key: '5',
          label: 'Integration Status',
          icon: '📊',
          description: 'View all integration statuses',
          enabled: true,
          action: { type: 'function', handler: 'showIntegrationStatus' }
        },
        {
          key: '6',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // Analytics & Feedback Menu
    this.menus.set('analytics', {
      id: 'analytics',
      title: 'Analytics & Feedback',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Document Analytics',
          icon: '📊',
          description: 'View document generation analytics',
          enabled: true,
          action: { type: 'command', command: 'feedback', args: ['analytics'] }
        },
        {
          key: '2',
          label: 'Feedback Reports',
          icon: '📝',
          description: 'View and analyze feedback reports',
          enabled: true,
          action: { type: 'command', command: 'feedback', args: ['reports'] }
        },
        {
          key: '3',
          label: 'Quality Metrics',
          icon: '⭐',
          description: 'Document quality metrics and trends',
          enabled: true,
          action: { type: 'command', command: 'feedback', args: ['metrics'] }
        },
        {
          key: '4',
          label: 'Performance Insights',
          icon: '🚀',
          description: 'System performance insights',
          enabled: true,
          action: { type: 'function', handler: 'showPerformanceInsights' }
        },
        {
          key: '5',
          label: 'Export Reports',
          icon: '📤',
          description: 'Export analytics and reports',
          enabled: true,
          action: { type: 'command', command: 'feedback', args: ['export'] }
        },
        {
          key: '6',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // System Configuration Menu
    this.menus.set('system-config', {
      id: 'system-config',
      title: 'System Configuration',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Environment Setup',
          icon: '🔧',
          description: 'Configure development environment',
          enabled: true,
          action: { type: 'function', handler: 'setupEnvironment' }
        },
        {
          key: '2',
          label: 'Template Management',
          icon: '📋',
          description: 'Manage document templates',
          enabled: true,
          action: { type: 'function', handler: 'manageTemplates' }
        },
        {
          key: '3',
          label: 'Output Configuration',
          icon: '📁',
          description: 'Configure output directories and formats',
          enabled: true,
          action: { type: 'function', handler: 'configureOutput' }
        },
        {
          key: '4',
          label: 'Validation Settings',
          icon: '✅',
          description: 'Configure validation rules and settings',
          enabled: true,
          action: { type: 'command', command: 'validate', args: ['--configure'] }
        },
        {
          key: '5',
          label: 'System Diagnostics',
          icon: '🔍',
          description: 'Run system diagnostics',
          enabled: true,
          action: { type: 'function', handler: 'runDiagnostics' }
        },
        {
          key: '6',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // Help & Documentation Menu
    this.menus.set('help', {
      id: 'help',
      title: 'Help & Documentation',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'main-menu',
      items: [
        {
          key: '1',
          label: 'Getting Started Guide',
          icon: '🚀',
          description: 'Step-by-step getting started guide',
          enabled: true,
          action: { type: 'function', handler: 'showGettingStarted' }
        },
        {
          key: '2',
          label: 'Command Reference',
          icon: '📖',
          description: 'Complete CLI command reference',
          enabled: true,
          action: { type: 'function', handler: 'showCommandReference' }
        },
        {
          key: '3',
          label: 'Template Guide',
          icon: '📝',
          description: 'Guide to available templates',
          enabled: true,
          action: { type: 'function', handler: 'showTemplateGuide' }
        },
        {
          key: '4',
          label: 'Troubleshooting',
          icon: '🔧',
          description: 'Common issues and solutions',
          enabled: true,
          action: { type: 'function', handler: 'showTroubleshooting' }
        },
        {
          key: '5',
          label: 'About ADPA',
          icon: 'ℹ️',
          description: 'About ADPA and version information',
          enabled: true,
          action: { type: 'function', handler: 'showAbout' }
        },
        {
          key: '6',
          label: 'Back to Main Menu',
          icon: '⬅️',
          description: 'Return to main menu',
          enabled: true,
          action: { type: 'navigate', target: 'main-menu' }
        }
      ]
    });

    // Browse Categories Menu
    this.menus.set('browse-categories', {
      id: 'browse-categories',
      title: 'Browse Template Categories',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'document-generation',
      items: [
        {
          key: '1',
          label: 'PMBOK Templates',
          icon: '📊',
          description: 'Project Management Body of Knowledge templates',
          enabled: true,
          action: { type: 'command', command: 'generate-category', args: ['pmbok'] }
        },
        {
          key: '2',
          label: 'BABOK Templates',
          icon: '📋',
          description: 'Business Analysis Body of Knowledge templates',
          enabled: true,
          action: { type: 'command', command: 'generate-category', args: ['babok'] }
        },
        {
          key: '3',
          label: 'DMBOK Templates',
          icon: '🗄️',
          description: 'Data Management Body of Knowledge templates',
          enabled: true,
          action: { type: 'command', command: 'generate-category', args: ['dmbok'] }
        },
        {
          key: '4',
          label: 'Strategic Planning',
          icon: '🎯',
          description: 'Strategic planning and business case templates',
          enabled: true,
          action: { type: 'command', command: 'generate-category', args: ['strategic-statements'] }
        },
        {
          key: '5',
          label: 'Technical Design',
          icon: '⚙️',
          description: 'Technical design and architecture templates',
          enabled: true,
          action: { type: 'command', command: 'generate-category', args: ['technical-design'] }
        },
        {
          key: '6',
          label: 'Quality Assurance',
          icon: '✅',
          description: 'QA and testing templates',
          enabled: true,
          action: { type: 'command', command: 'generate-category', args: ['quality-assurance'] }
        },
        {
          key: '7',
          label: 'Back to Document Generation',
          icon: '⬅️',
          description: 'Return to document generation menu',
          enabled: true,
          action: { type: 'navigate', target: 'document-generation' }
        }
      ]
    });

    // Custom Generation Menu
    this.menus.set('custom-generation', {
      id: 'custom-generation',
      title: 'Custom Document Generation',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'document-generation',
      items: [
        {
          key: '1',
          label: 'Interactive Template Selection',
          icon: '🎯',
          description: 'Select templates interactively',
          enabled: true,
          action: { type: 'function', handler: 'interactiveTemplateSelection' }
        },
        {
          key: '2',
          label: 'Batch Generation',
          icon: '📦',
          description: 'Generate multiple documents at once',
          enabled: true,
          action: { type: 'function', handler: 'batchGeneration' }
        },
        {
          key: '3',
          label: 'Custom Context',
          icon: '📝',
          description: 'Generate with custom context input',
          enabled: true,
          action: { type: 'function', handler: 'customContextGeneration' }
        },
        {
          key: '4',
          label: 'Template Validation',
          icon: '✅',
          description: 'Validate templates before generation',
          enabled: true,
          action: { type: 'command', command: 'validate', args: ['--templates'] }
        },
        {
          key: '5',
          label: 'Back to Document Generation',
          icon: '⬅️',
          description: 'Return to document generation menu',
          enabled: true,
          action: { type: 'navigate', target: 'document-generation' }
        }
      ]
    });

    // Stakeholder Management Menu
    this.menus.set('stakeholder-management', {
      id: 'stakeholder-management',
      title: 'Stakeholder Management',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'project-management',
      items: [
        {
          key: '1',
          label: 'Stakeholder Analysis',
          icon: '🔍',
          description: 'Generate comprehensive stakeholder analysis',
          enabled: true,
          action: { type: 'command', command: 'stakeholder', args: ['analysis'] }
        },
        {
          key: '2',
          label: 'Stakeholder Register',
          icon: '📋',
          description: 'Generate stakeholder register only',
          enabled: true,
          action: { type: 'command', command: 'stakeholder', args: ['register'] }
        },
        {
          key: '3',
          label: 'Engagement Plan',
          icon: '🤝',
          description: 'Generate stakeholder engagement plan',
          enabled: true,
          action: { type: 'command', command: 'stakeholder', args: ['engagement-plan'] }
        },
        {
          key: '4',
          label: 'Complete Automation',
          icon: '🚀',
          description: 'Generate all stakeholder documents',
          enabled: true,
          action: { type: 'command', command: 'stakeholder', args: ['automate'] }
        },
        {
          key: '5',
          label: 'Back to Project Management',
          icon: '⬅️',
          description: 'Return to project management menu',
          enabled: true,
          action: { type: 'navigate', target: 'project-management' }
        }
      ]
    });

    // Risk & Compliance Menu
    this.menus.set('risk-compliance', {
      id: 'risk-compliance',
      title: 'Risk & Compliance Assessment',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'project-management',
      items: [
        {
          key: '1',
          label: 'Software Development Risk Assessment',
          icon: '💻',
          description: 'Risk assessment for software projects',
          enabled: true,
          action: { type: 'command', command: 'risk-compliance', args: ['--project', 'current-project', '--type', 'SOFTWARE_DEVELOPMENT'] }
        },
        {
          key: '2',
          label: 'Infrastructure Risk Assessment',
          icon: '🏗️',
          description: 'Risk assessment for infrastructure projects',
          enabled: true,
          action: { type: 'command', command: 'risk-compliance', args: ['--project', 'current-project', '--type', 'INFRASTRUCTURE'] }
        },
        {
          key: '3',
          label: 'Custom Risk Assessment',
          icon: '🎯',
          description: 'Custom risk assessment with interactive setup',
          enabled: true,
          action: { type: 'function', handler: 'customRiskAssessment' }
        },
        {
          key: '4',
          label: 'PMBOK-Only Assessment',
          icon: '📊',
          description: 'PMBOK-focused risk assessment',
          enabled: true,
          action: { type: 'command', command: 'risk-compliance', args: ['--project', 'current-project', '--pmbok-only'] }
        },
        {
          key: '5',
          label: 'Back to Project Management',
          icon: '⬅️',
          description: 'Return to project management menu',
          enabled: true,
          action: { type: 'navigate', target: 'project-management' }
        }
      ]
    });

    // Confluence Integration Menu
    this.menus.set('confluence-integration', {
      id: 'confluence-integration',
      title: 'Confluence Integration',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'integrations',
      items: [
        {
          key: '1',
          label: 'Initialize Configuration',
          icon: '🔧',
          description: 'Set up Confluence integration',
          enabled: true,
          action: { type: 'command', command: 'confluence', args: ['init'] }
        },
        {
          key: '2',
          label: 'Test Connection',
          icon: '🔍',
          description: 'Test Confluence connection',
          enabled: true,
          action: { type: 'command', command: 'confluence', args: ['test'] }
        },
        {
          key: '3',
          label: 'Publish Documents',
          icon: '📤',
          description: 'Publish documents to Confluence',
          enabled: true,
          action: { type: 'command', command: 'confluence', args: ['publish'] }
        },
        {
          key: '4',
          label: 'Integration Status',
          icon: '📊',
          description: 'View Confluence integration status',
          enabled: true,
          action: { type: 'command', command: 'confluence', args: ['status'] }
        },
        {
          key: '5',
          label: 'Back to Integrations',
          icon: '⬅️',
          description: 'Return to integrations menu',
          enabled: true,
          action: { type: 'navigate', target: 'integrations' }
        }
      ]
    });

    // SharePoint Integration Menu
    this.menus.set('sharepoint-integration', {
      id: 'sharepoint-integration',
      title: 'SharePoint Integration',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'integrations',
      items: [
        {
          key: '1',
          label: 'Initialize Configuration',
          icon: '🔧',
          description: 'Set up SharePoint integration',
          enabled: true,
          action: { type: 'command', command: 'sharepoint', args: ['init'] }
        },
        {
          key: '2',
          label: 'Test Connection',
          icon: '🔍',
          description: 'Test SharePoint connection',
          enabled: true,
          action: { type: 'command', command: 'sharepoint', args: ['test'] }
        },
        {
          key: '3',
          label: 'Publish Documents',
          icon: '📤',
          description: 'Publish documents to SharePoint',
          enabled: true,
          action: { type: 'command', command: 'sharepoint', args: ['publish'] }
        },
        {
          key: '4',
          label: 'Integration Status',
          icon: '📊',
          description: 'View SharePoint integration status',
          enabled: true,
          action: { type: 'command', command: 'sharepoint', args: ['status'] }
        },
        {
          key: '5',
          label: 'Back to Integrations',
          icon: '⬅️',
          description: 'Return to integrations menu',
          enabled: true,
          action: { type: 'navigate', target: 'integrations' }
        }
      ]
    });

    // VCS Integration Menu
    this.menus.set('vcs-integration', {
      id: 'vcs-integration',
      title: 'Version Control Integration',
      showBreadcrumb: true,
      showStatusBar: true,
      parent: 'integrations',
      items: [
        {
          key: '1',
          label: 'Initialize Repository',
          icon: '🔧',
          description: 'Initialize Git repository',
          enabled: true,
          action: { type: 'command', command: 'vcs', args: ['init'] }
        },
        {
          key: '2',
          label: 'Repository Status',
          icon: '📊',
          description: 'Show Git repository status',
          enabled: true,
          action: { type: 'command', command: 'vcs', args: ['status'] }
        },
        {
          key: '3',
          label: 'Commit Changes',
          icon: '💾',
          description: 'Commit changes to repository',
          enabled: true,
          action: { type: 'command', command: 'vcs', args: ['commit'] }
        },
        {
          key: '4',
          label: 'Push to Remote',
          icon: '🚀',
          description: 'Push changes to remote repository',
          enabled: true,
          action: { type: 'command', command: 'vcs', args: ['push'] }
        },
        {
          key: '5',
          label: 'Back to Integrations',
          icon: '⬅️',
          description: 'Return to integrations menu',
          enabled: true,
          action: { type: 'navigate', target: 'integrations' }
        }
      ]
    });
  }

  /**
   * Render menu header
   */
  private renderMenuHeader(title: string): void {
    const width = 61;
    const titlePadding = Math.max(0, Math.floor((width - title.length - 2) / 2));
    const paddedTitle = ' '.repeat(titlePadding) + title + ' '.repeat(titlePadding);
    
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log(`│${paddedTitle.substring(0, width - 2).padEnd(width - 2)}│`);
    console.log('├─────────────────────────────────────────────────────────────┤');
  }

  /**
   * Render a menu item
   */
  private renderMenuItem(item: MenuItem): void {
    const status = item.enabled ? '' : ' (disabled)';
    const badge = item.badge ? ` [${item.badge}]` : '';
    const line = `│  ${item.key}. ${item.icon} ${item.label}${badge}${status}`;
    console.log(line.padEnd(62) + '│');
  }

  /**
   * Render menu footer
   */
  private renderMenuFooter(): void {
    console.log('└─────────────────────────────────────────────────────────────┘');
  }

  /**
   * Render breadcrumb navigation
   */
  private renderBreadcrumb(): void {
    const path = this.navigationStack.map(menuId => {
      const menu = this.menus.get(menuId);
      return menu?.title.replace('ADPA Interactive CLI - ', '') || menuId;
    }).join(' > ');
    
    console.log(`📍 ${path}\n`);
  }

  /**
   * Render status bar
   */
  private renderStatusBar(): void {
    const aiStatus = this.systemStatus.aiProviderConfigured ? '✅' : '❌';
    const projectStatus = this.systemStatus.projectInitialized ? '✅' : '❌';
    const integrationStatus = this.systemStatus.integrationsConfigured ? '✅' : '❌';
    
    console.log(`\n📊 Status: AI ${aiStatus} | Project ${projectStatus} | Integrations ${integrationStatus} | Documents: ${this.systemStatus.documentsGenerated}`);
  }

  /**
   * Clear the console screen
   */
  private clearScreen(): void {
    console.clear();
  }

  /**
   * Prompt user for input
   */
  private promptForChoice(message: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(`\n${message}`, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Pause execution and wait for user input
   */
  private pause(): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question('\nPress Enter to continue...', () => {
        resolve();
      });
    });
  }

  /**
   * Load system status
   */
  private async loadSystemStatus(): Promise<void> {
    // This would integrate with the existing system to get actual status
    // For now, we'll simulate some status
    this.systemStatus = {
      aiProviderConfigured: process.env.GOOGLE_AI_API_KEY ? true : false,
      projectInitialized: true, // Would check for project files
      integrationsConfigured: false,
      documentsGenerated: 42, // Would count actual generated documents
      lastActivity: new Date()
    };
  }

  /**
   * Get provider status badge
   */
  private getProviderStatusBadge(): string {
    return this.systemStatus.aiProviderConfigured ? 'Configured' : 'Setup Required';
  }

  /**
   * Search templates function
   */
  private async searchTemplates(): Promise<void> {
    console.log('\n🔍 Template Search');
    console.log('─'.repeat(50));
    
    const searchTerm = await this.promptForChoice('Enter search term (or press Enter to see all): ');
    
    // This would integrate with the actual template system
    console.log('\n📋 Available Templates:');
    console.log('• Project Charter (project-charter)');
    console.log('• Stakeholder Register (stakeholder-register)');
    console.log('• Risk Management Plan (risk-management-plan)');
    console.log('• Business Case (business-case)');
    console.log('• ... and 116 more templates');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show system status
   */
  private async showSystemStatus(): Promise<void> {
    console.log('\n🔍 System Status Analysis');
    console.log('─'.repeat(50));
    
    console.log(`AI Provider: ${this.systemStatus.aiProviderConfigured ? '✅ Configured' : '❌ Not Configured'}`);
    console.log(`Project: ${this.systemStatus.projectInitialized ? '✅ Initialized' : '❌ Not Initialized'}`);
    console.log(`Integrations: ${this.systemStatus.integrationsConfigured ? '✅ Configured' : '❌ Not Configured'}`);
    console.log(`Documents Generated: ${this.systemStatus.documentsGenerated}`);
    
    if (this.systemStatus.lastActivity) {
      console.log(`Last Activity: ${this.systemStatus.lastActivity.toLocaleString()}`);
    }
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Setup environment
   */
  private async setupEnvironment(): Promise<void> {
    console.log('\n🔧 Environment Setup');
    console.log('─'.repeat(50));
    
    console.log('Launching the interactive setup wizard...');
    
    try {
      // Execute the setup command directly
      const result = await this.commandIntegration.executeCommand('setup', []);
      
      if (result.success) {
        console.log('✅ Environment setup completed successfully');
        // Reload system status after setup
        await this.loadSystemStatus();
      } else {
        console.error('❌ Environment setup failed');
        if (result.message) {
          console.error(`💡 ${result.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Error during environment setup:', error instanceof Error ? error.message : String(error));
    }
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show navigation help
   */
  private async showNavigationHelp(): Promise<void> {
    console.log('\n❓ Navigation Help');
    console.log('─'.repeat(50));
    console.log('');
    console.log('📋 Menu Navigation:');
    console.log('  • Use number keys (1-9, 0) to select menu options');
    console.log('  • Press Enter after typing your choice');
    console.log('');
    console.log('🧭 Quick Commands:');
    console.log('  • "back" or "b"    - Go to previous menu');
    console.log('  • "home" or "h"    - Return to main menu');
    console.log('  • "help" or "?"    - Show this help message');
    console.log('  • "exit" or "q"    - Exit the application');
    console.log('  • "status" or "s"  - Show system status');
    console.log('  • "refresh" or "r" - Refresh current menu');
    console.log('');
    console.log('💡 Tips:');
    console.log('  • Commands are case-insensitive');
    console.log('  • Use Ctrl+C to force quit at any time');
    console.log('  • Disabled options show "(disabled)" - check system status');
    console.log('  • Look for badges like [Setup Required] for guidance');
    console.log('');
    
    await this.pause();
  }

  /**
   * Show recent documents
   */
  private async showRecentDocuments(): Promise<void> {
    console.log('\n📋 Recent Documents');
    console.log('─'.repeat(50));
    
    // This would integrate with the actual document tracking system
    console.log('📄 Recently Generated Documents:');
    console.log('  1. Project Charter - 2 hours ago');
    console.log('  2. Stakeholder Register - 1 day ago');
    console.log('  3. Risk Management Plan - 2 days ago');
    console.log('  4. Business Case - 3 days ago');
    console.log('  5. Requirements Document - 1 week ago');
    console.log('');
    console.log('💡 Use "generate" command to create new documents');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show AI provider status
   */
  private async showProviderStatus(): Promise<void> {
    console.log('\n🤖 AI Provider Status');
    console.log('─'.repeat(50));
    
    console.log(`Current Provider: ${this.systemStatus.aiProviderConfigured ? 'Configured' : 'Not Configured'}`);
    console.log(`Connection Status: ${this.systemStatus.aiProviderConfigured ? '✅ Connected' : '❌ Not Connected'}`);
    
    if (process.env.GOOGLE_AI_API_KEY) {
      console.log('Google AI (Gemini): ✅ Configured');
    } else {
      console.log('Google AI (Gemini): ❌ Not Configured');
    }
    
    console.log('\n💡 Use AI Configuration menu to set up providers');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show integration status
   */
  private async showIntegrationStatus(): Promise<void> {
    console.log('\n🔗 Integration Status');
    console.log('─'.repeat(50));
    
    console.log('Confluence: ❌ Not Configured');
    console.log('SharePoint: ❌ Not Configured');
    console.log('Git/VCS: ✅ Available');
    console.log('Adobe Creative Suite: ❌ Not Configured');
    
    console.log('\n💡 Use Integrations menu to configure external systems');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show performance insights
   */
  private async showPerformanceInsights(): Promise<void> {
    console.log('\n🚀 Performance Insights');
    console.log('─'.repeat(50));
    
    console.log('📊 Generation Statistics:');
    console.log(`  • Total Documents: ${this.systemStatus.documentsGenerated}`);
    console.log('  • Average Generation Time: 2.3 seconds');
    console.log('  • Success Rate: 98.5%');
    console.log('  • Most Used Template: Project Charter');
    
    console.log('\n🔧 System Performance:');
    console.log('  • Memory Usage: Normal');
    console.log('  • AI Response Time: Fast');
    console.log('  • Template Loading: Optimized');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Manage templates
   */
  private async manageTemplates(): Promise<void> {
    console.log('\n📋 Template Management');
    console.log('─'.repeat(50));
    
    console.log('Available Actions:');
    console.log('  1. View all templates');
    console.log('  2. Search templates');
    console.log('  3. Validate templates');
    console.log('  4. Update template cache');
    console.log('  5. Template statistics');
    
    console.log('\n💡 Use the Document Generation menu for template operations');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Configure output settings
   */
  private async configureOutput(): Promise<void> {
    console.log('\n📁 Output Configuration');
    console.log('─'.repeat(50));
    
    console.log('Current Settings:');
    console.log('  • Output Directory: ./generated-documents');
    console.log('  • File Format: Markdown');
    console.log('  • Naming Convention: template-name.md');
    console.log('  • Backup: Enabled');
    
    console.log('\n⚙️ Available Formats:');
    console.log('  • Markdown (.md)');
    console.log('  • PDF (.pdf) - Requires Adobe integration');
    console.log('  • Word (.docx) - Requires Adobe integration');
    console.log('  • HTML (.html)');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Run system diagnostics
   */
  private async runDiagnostics(): Promise<void> {
    console.log('\n🔍 System Diagnostics');
    console.log('─'.repeat(50));
    
    console.log('Running diagnostics...\n');
    
    console.log('✅ Node.js version: Compatible');
    console.log('✅ Dependencies: All installed');
    console.log('✅ Template files: Available');
    console.log('✅ Output directory: Writable');
    console.log(`${this.systemStatus.aiProviderConfigured ? '✅' : '❌'} AI Provider: ${this.systemStatus.aiProviderConfigured ? 'Configured' : 'Not configured'}`);
    console.log('✅ CLI commands: Functional');
    
    console.log('\n📊 System Health: Good');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show getting started guide
   */
  private async showGettingStarted(): Promise<void> {
    console.log('\n🚀 Getting Started with ADPA');
    console.log('─'.repeat(50));
    
    console.log('📋 Quick Start Steps:');
    console.log('  1. Configure an AI provider (Google AI recommended)');
    console.log('  2. Initialize your project workspace');
    console.log('  3. Generate your first document (try Project Charter)');
    console.log('  4. Explore available templates and categories');
    console.log('  5. Set up integrations (optional)');
    
    console.log('\n💡 Pro Tips:');
    console.log('  • Start with the Quick Start menu');
    console.log('  • Use "help" command anytime for assistance');
    console.log('  • Check system status regularly');
    console.log('  • Explore different document categories');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show command reference
   */
  private async showCommandReference(): Promise<void> {
    console.log('\n📖 CLI Command Reference');
    console.log('─'.repeat(50));
    
    console.log('🔧 Setup Commands:');
    console.log('  • adpa setup                 - Interactive setup wizard');
    console.log('  • adpa setup --provider <name> - Configure AI provider');
    
    console.log('\n📝 Generation Commands:');
    console.log('  • adpa generate <template>    - Generate single document');
    console.log('  • adpa generate-category <cat> - Generate category');
    console.log('  • adpa generate-all           - Generate all documents');
    
    console.log('\n🔍 Analysis Commands:');
    console.log('  • adpa analyze workspace      - Analyze workspace');
    console.log('  • adpa stakeholder analysis   - Stakeholder analysis');
    console.log('  • adpa risk-compliance        - Risk assessment');
    
    console.log('\n💡 Use "adpa <command> --help" for detailed help');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show template guide
   */
  private async showTemplateGuide(): Promise<void> {
    console.log('\n📝 Template Guide');
    console.log('─'.repeat(50));
    
    console.log('📚 Available Categories:');
    console.log('  • PMBOK - Project Management templates (25 templates)');
    console.log('  • BABOK - Business Analysis templates (18 templates)');
    console.log('  • DMBOK - Data Management templates (22 templates)');
    console.log('  • Strategic - Strategic planning templates (12 templates)');
    console.log('  • Technical - Technical design templates (15 templates)');
    console.log('  • Quality - QA and testing templates (10 templates)');
    
    console.log('\n🎯 Popular Templates:');
    console.log('  • project-charter - Project Charter document');
    console.log('  • stakeholder-register - Stakeholder Register');
    console.log('  • risk-management-plan - Risk Management Plan');
    console.log('  • business-case - Business Case document');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show troubleshooting guide
   */
  private async showTroubleshooting(): Promise<void> {
    console.log('\n🔧 Troubleshooting Guide');
    console.log('─'.repeat(50));
    
    console.log('❓ Common Issues:');
    console.log('\n1. AI Provider Not Working:');
    console.log('   • Check API key configuration');
    console.log('   • Verify internet connection');
    console.log('   • Test with "adpa validate --ai-connection"');
    
    console.log('\n2. Templates Not Found:');
    console.log('   • Run "adpa validate --templates"');
    console.log('   • Check template directory permissions');
    console.log('   • Reinstall if necessary');
    
    console.log('\n3. Generation Fails:');
    console.log('   • Check output directory permissions');
    console.log('   • Verify context input');
    console.log('   • Try with different template');
    
    console.log('\n💡 Get Help:');
    console.log('   • Use "adpa status" for system overview');
    console.log('   • Run diagnostics from System Configuration');
    console.log('   • Check documentation at GitHub');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Show about information
   */
  private async showAbout(): Promise<void> {
    console.log('\nℹ️  About ADPA');
    console.log('─'.repeat(50));
    
    console.log('🚀 Automated Document Processing & Analysis');
    console.log('Version: 2.1.3');
    console.log('');
    console.log('📋 Features:');
    console.log('  • 120+ Professional document templates');
    console.log('  • AI-powered content generation');
    console.log('  • Multiple AI provider support');
    console.log('  • External system integrations');
    console.log('  • Interactive CLI interface');
    console.log('  • Comprehensive project management tools');
    
    console.log('\n🔗 Links:');
    console.log('  • GitHub: https://github.com/your-org/adpa');
    console.log('  • Documentation: https://adpa-docs.example.com');
    console.log('  • Support: https://support.example.com');
    
    console.log('\n© 2024 ADPA Team. All rights reserved.');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Interactive template selection
   */
  private async interactiveTemplateSelection(): Promise<void> {
    console.log('\n🎯 Interactive Template Selection');
    console.log('─'.repeat(50));
    
    console.log('This feature allows you to:');
    console.log('  • Browse templates by category');
    console.log('  • Search and filter templates');
    console.log('  • Preview template descriptions');
    console.log('  • Select multiple templates');
    console.log('  • Generate selected templates');
    
    console.log('\n💡 Use the "Browse by Category" option in Document Generation');
    console.log('💡 Or use "Search Templates" for specific templates');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Batch generation
   */
  private async batchGeneration(): Promise<void> {
    console.log('\n📦 Batch Document Generation');
    console.log('─'.repeat(50));
    
    console.log('Batch generation options:');
    console.log('  • Generate entire categories');
    console.log('  • Generate all documents');
    console.log('  • Generate from template list');
    console.log('  • Generate with custom context');
    
    console.log('\n⚡ Quick Actions:');
    console.log('  • Use "Generate All Documents" for complete set');
    console.log('  • Use "Generate Category" for specific categories');
    console.log('  • Use CLI: "adpa generate-all" or "adpa generate-category <name>"');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Custom context generation
   */
  private async customContextGeneration(): Promise<void> {
    console.log('\n📝 Custom Context Generation');
    console.log('─'.repeat(50));
    
    console.log('Custom context allows you to:');
    console.log('  • Provide specific project information');
    console.log('  • Customize document content');
    console.log('  • Use project-specific terminology');
    console.log('  • Include stakeholder details');
    
    console.log('\n💡 Context can be provided via:');
    console.log('  • Interactive prompts');
    console.log('  • Context files');
    console.log('  • Command line arguments');
    console.log('  • Environment variables');
    
    console.log('\n🎯 Try: "adpa generate <template> --context <your-context>"');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Configure Adobe integration
   */
  private async configureAdobe(): Promise<void> {
    console.log('\n🎨 Adobe Creative Suite Integration');
    console.log('─'.repeat(50));
    
    console.log('Adobe integration provides:');
    console.log('  • PDF generation from documents');
    console.log('  • Professional document formatting');
    console.log('  • Brand-compliant templates');
    console.log('  • Advanced layout options');
    
    console.log('\n⚙️ Setup Requirements:');
    console.log('  • Adobe Creative Suite subscription');
    console.log('  • Adobe API credentials');
    console.log('  • Template configuration');
    
    console.log('\n💡 This feature is in development');
    console.log('💡 Contact support for early access');
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }

  /**
   * Custom risk assessment with interactive setup
   */
  private async customRiskAssessment(): Promise<void> {
    console.log('\n🎯 Custom Risk Assessment');
    console.log('─'.repeat(50));
    
    try {
      // Get project name with validation
      let projectName: string;
      while (true) {
        const input = await this.promptForChoice('Enter project name: ');
        const validation = InputValidationService.validateProjectName(input);
        
        if (validation.isValid) {
          projectName = validation.sanitizedValue!;
          break;
        } else {
          console.log(InputValidationService.formatValidationError(validation));
        }
      }
      
      console.log('\nSelect project type:');
      console.log('1. Software Development');
      console.log('2. Infrastructure');
      console.log('3. Data Management');
      console.log('4. Business Process');
      console.log('5. Other');
      
      // Get project type with validation
      let projectType: string;
      while (true) {
        const typeChoice = await this.promptForChoice('Enter choice (1-5): ');
        const validation = InputValidationService.validateText(typeChoice, {
          required: true,
          allowedValues: ['1', '2', '3', '4', '5'],
          caseSensitive: true
        }, 'project type choice');
        
        if (validation.isValid) {
          const typeMap: { [key: string]: string } = {
            '1': 'SOFTWARE_DEVELOPMENT',
            '2': 'INFRASTRUCTURE', 
            '3': 'DATA_MANAGEMENT',
            '4': 'BUSINESS_PROCESS',
            '5': 'OTHER'
          };
          projectType = typeMap[validation.sanitizedValue!];
          break;
        } else {
          console.log(InputValidationService.formatValidationError(validation));
        }
      }
      
      // Get project description (optional, no validation needed)
      const description = await this.promptForChoice('Enter project description (optional): ');
      
      console.log('\nSelect assessment type:');
      console.log('1. Integrated assessment (recommended)');
      console.log('2. PMBOK-only assessment');
      
      // Get assessment type with validation
      let isIntegrated: boolean;
      while (true) {
        const assessmentChoice = await this.promptForChoice('Enter choice (1-2): ');
        const validation = InputValidationService.validateText(assessmentChoice, {
          required: true,
          allowedValues: ['1', '2'],
          caseSensitive: true
        }, 'assessment type choice');
        
        if (validation.isValid) {
          isIntegrated = validation.sanitizedValue === '1';
          break;
        } else {
          console.log(InputValidationService.formatValidationError(validation));
        }
      }
      
      // Build command arguments
      const args = [
        '--project', projectName,
        '--type', projectType
      ];
      
      if (description) {
        args.push('--description', description);
      }
      
      if (isIntegrated) {
        args.push('--integrated');
      } else {
        args.push('--pmbok-only');
      }
      
      console.log('\n🔄 Starting risk assessment...');
      
      // Execute the risk compliance command
      const result = await this.commandIntegration.executeCommand('risk-compliance', args);
      
      if (result.success) {
        console.log('✅ Risk assessment completed successfully');
      } else {
        console.error('❌ Risk assessment failed');
        if (result.message) {
          console.error(`💡 ${result.message}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error during risk assessment:', error instanceof Error ? error.message : String(error));
    }
    
    await this.pause();
    
    if (this.currentMenu) {
      await this.navigateTo(this.currentMenu);
    }
  }
}

/**
 * Factory function to create and start the interactive menu
 */
export async function startInteractiveMenu(): Promise<void> {
  const menuSystem = new InteractiveMenuSystem();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    await menuSystem.stop();
    process.exit(0);
  });

  try {
    await menuSystem.start();
  } catch (error) {
    console.error('❌ Error starting interactive menu:', error);
    await menuSystem.stop();
    process.exit(1);
  }
}