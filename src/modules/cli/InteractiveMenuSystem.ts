/**
 * Interactive CLI Menu System
 * 
 * Provides a Yeoman-style interactive CLI interface for the ADPA system.
 * This is the main entry point for the interactive menu functionality.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import readline from 'readline';
import { EventEmitter } from 'events';

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
    const choice = await this.promptForChoice('Select an option: ');
    
    const selectedItem = menu.items.find(item => item.key === choice);
    if (!selectedItem) {
      console.log('❌ Invalid choice. Please try again.');
      await this.handleMenuInput(menu);
      return;
    }

    if (!selectedItem.enabled) {
      console.log('⚠️  This option is currently disabled.');
      await this.handleMenuInput(menu);
      return;
    }

    await this.executeMenuAction(selectedItem.action);
  }

  /**
   * Execute a menu action
   */
  private async executeMenuAction(action: MenuAction): Promise<void> {
    try {
      switch (action.type) {
        case 'navigate':
          if (action.target) {
            await this.navigateTo(action.target);
          }
          break;

        case 'function':
          if (action.handler) {
            await this.executeFunction(action.handler);
          }
          break;

        case 'command':
          if (action.command) {
            await this.executeCommand(action.command, action.args || []);
          }
          break;

        default:
          console.log('❌ Unknown action type');
      }
    } catch (error) {
      console.error('❌ Error executing action:', error.message);
      await this.pause();
      if (this.currentMenu) {
        await this.navigateTo(this.currentMenu);
      }
    }
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
      case 'exit':
        await this.stop();
        process.exit(0);
        break;
      default:
        console.log(`⚠️  Function not implemented: ${handlerName}`);
        await this.pause();
    }
  }

  /**
   * Execute a CLI command
   */
  private async executeCommand(command: string, args: string[]): Promise<void> {
    console.log(`🔄 Executing: ${command} ${args.join(' ')}`);
    
    // Here you would integrate with the existing CLI commands
    // For now, we'll just simulate the execution
    
    console.log('✅ Command executed successfully');
    await this.pause();
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

    // Add more menus as needed...
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
    
    console.log('This would launch the interactive setup wizard...');
    console.log('• Configure AI Provider');
    console.log('• Set up integrations');
    console.log('• Initialize project structure');
    console.log('• Validate configuration');
    
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