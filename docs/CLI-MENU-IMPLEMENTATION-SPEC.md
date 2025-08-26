# CLI Interactive Menu Implementation Specification

## Overview

This document provides the technical implementation specification for the interactive CLI menu system based on the design outlined in `CLI-INTERACTIVE-MENU-DESIGN.md`.

## Architecture

### Core Components

```typescript
interface MenuSystem {
  menuRenderer: MenuRenderer;
  navigationManager: NavigationManager;
  stateManager: StateManager;
  inputHandler: InputHandler;
  contextProvider: ContextProvider;
}
```

### 1. Menu Renderer
**Responsibility**: Display menus and handle visual presentation

```typescript
interface MenuRenderer {
  renderMainMenu(): Promise<void>;
  renderSubMenu(menuConfig: MenuConfig): Promise<void>;
  renderBreadcrumb(path: string[]): void;
  renderStatusIndicators(status: SystemStatus): void;
  clearScreen(): void;
  showSpinner(message: string): void;
  hideSpinner(): void;
}

interface MenuConfig {
  title: string;
  items: MenuItem[];
  showBreadcrumb: boolean;
  showStatusBar: boolean;
}

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  description?: string;
  enabled: boolean;
  badge?: string;
  action: MenuAction;
}
```

### 2. Navigation Manager
**Responsibility**: Handle menu navigation and routing

```typescript
interface NavigationManager {
  navigateTo(menuId: string, params?: any): Promise<void>;
  goBack(): Promise<void>;
  goHome(): Promise<void>;
  getCurrentPath(): string[];
  canGoBack(): boolean;
  registerRoute(route: MenuRoute): void;
}

interface MenuRoute {
  id: string;
  path: string;
  handler: MenuHandler;
  parent?: string;
  children?: string[];
}

type MenuHandler = (params?: any) => Promise<MenuResult>;

interface MenuResult {
  action: 'continue' | 'back' | 'home' | 'exit';
  data?: any;
}
```

### 3. State Manager
**Responsibility**: Manage application state and context

```typescript
interface StateManager {
  getProjectState(): ProjectState;
  getSystemState(): SystemState;
  getUserPreferences(): UserPreferences;
  updateState(updates: Partial<AppState>): void;
  saveState(): Promise<void>;
  loadState(): Promise<void>;
}

interface ProjectState {
  initialized: boolean;
  configurationComplete: boolean;
  documentsGenerated: string[];
  lastActivity: Date;
  projectType?: string;
}

interface SystemState {
  aiProviderConfigured: boolean;
  integrationsConfigured: IntegrationStatus;
  lastHealthCheck: Date;
  errors: SystemError[];
}

interface UserPreferences {
  defaultProvider: string;
  outputDirectory: string;
  recentTemplates: string[];
  favoriteActions: string[];
  menuMode: 'beginner' | 'advanced';
}
```

### 4. Input Handler
**Responsibility**: Handle user input and validation

```typescript
interface InputHandler {
  promptForChoice(options: ChoiceOptions): Promise<string>;
  promptForText(prompt: TextPrompt): Promise<string>;
  promptForConfirmation(message: string): Promise<boolean>;
  promptForMultiSelect(options: MultiSelectOptions): Promise<string[]>;
  handleKeyboardInput(): Promise<KeyboardEvent>;
}

interface ChoiceOptions {
  message: string;
  choices: Choice[];
  default?: string;
  allowCancel?: boolean;
}

interface Choice {
  key: string;
  label: string;
  description?: string;
  enabled?: boolean;
}
```

### 5. Context Provider
**Responsibility**: Provide context-aware information

```typescript
interface ContextProvider {
  getAvailableTemplates(): Promise<TemplateInfo[]>;
  getSystemStatus(): Promise<SystemStatus>;
  getRecommendations(): Promise<Recommendation[]>;
  getRecentActions(): Promise<RecentAction[]>;
  validatePrerequisites(action: string): Promise<ValidationResult>;
}

interface SystemStatus {
  aiProvider: ProviderStatus;
  integrations: IntegrationStatus;
  workspace: WorkspaceStatus;
  health: HealthStatus;
}

interface Recommendation {
  type: 'template' | 'action' | 'configuration';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}
```

## Menu Definitions

### Main Menu Configuration

```typescript
const MAIN_MENU: MenuConfig = {
  title: 'ADPA Interactive CLI',
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
      badge: getTemplateCount(),
      action: { type: 'navigate', target: 'document-generation' }
    },
    {
      key: '3',
      label: 'AI Configuration',
      icon: '🤖',
      description: 'Configure AI providers',
      enabled: true,
      badge: getProviderStatus(),
      action: { type: 'navigate', target: 'ai-configuration' }
    },
    // ... additional menu items
  ],
  showBreadcrumb: false,
  showStatusBar: true
};
```

### Sub-Menu Configurations

```typescript
const DOCUMENT_GENERATION_MENU: MenuConfig = {
  title: 'Document Generation',
  items: [
    {
      key: '1',
      label: 'Browse by Category',
      icon: '📚',
      description: 'Browse templates organized by category',
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
    // ... additional items
  ],
  showBreadcrumb: true,
  showStatusBar: true
};
```

## Implementation Classes

### 1. Interactive Menu System

```typescript
export class InteractiveMenuSystem {
  private renderer: MenuRenderer;
  private navigation: NavigationManager;
  private state: StateManager;
  private input: InputHandler;
  private context: ContextProvider;

  constructor() {
    this.renderer = new ConsoleMenuRenderer();
    this.navigation = new MenuNavigationManager();
    this.state = new FileBasedStateManager();
    this.input = new InquirerInputHandler();
    this.context = new SystemContextProvider();
  }

  async start(): Promise<void> {
    await this.state.loadState();
    await this.navigation.navigateTo('main-menu');
  }

  async stop(): Promise<void> {
    await this.state.saveState();
  }
}
```

### 2. Console Menu Renderer

```typescript
export class ConsoleMenuRenderer implements MenuRenderer {
  private currentMenu?: MenuConfig;

  async renderMainMenu(): Promise<void> {
    this.clearScreen();
    this.renderHeader();
    await this.renderMenu(MAIN_MENU);
  }

  async renderSubMenu(menuConfig: MenuConfig): Promise<void> {
    this.clearScreen();
    if (menuConfig.showBreadcrumb) {
      this.renderBreadcrumb(this.navigation.getCurrentPath());
    }
    await this.renderMenu(menuConfig);
  }

  private renderHeader(): void {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    ADPA Interactive CLI                     │');
    console.log('│                     Version 2.1.3                          │');
    console.log('├─────────────────────────────────────────────────────────────┤');
  }

  private async renderMenu(config: MenuConfig): Promise<void> {
    this.currentMenu = config;
    
    for (const item of config.items) {
      const status = item.enabled ? '' : ' (disabled)';
      const badge = item.badge ? ` [${item.badge}]` : '';
      console.log(`│  ${item.key}. ${item.icon} ${item.label}${badge}${status}`);
    }
    
    console.log('└─────────────────────────────────────────────────────────────┘');
  }

  renderBreadcrumb(path: string[]): void {
    const breadcrumb = path.join(' > ');
    console.log(`📍 ${breadcrumb}\n`);
  }

  clearScreen(): void {
    console.clear();
  }

  showSpinner(message: string): void {
    // Implementation for spinner
  }

  hideSpinner(): void {
    // Implementation to hide spinner
  }
}
```

### 3. Menu Navigation Manager

```typescript
export class MenuNavigationManager implements NavigationManager {
  private routes: Map<string, MenuRoute> = new Map();
  private navigationStack: string[] = [];
  private currentRoute?: string;

  constructor() {
    this.registerDefaultRoutes();
  }

  async navigateTo(menuId: string, params?: any): Promise<void> {
    const route = this.routes.get(menuId);
    if (!route) {
      throw new Error(`Route not found: ${menuId}`);
    }

    this.navigationStack.push(menuId);
    this.currentRoute = menuId;

    const result = await route.handler(params);
    await this.handleMenuResult(result);
  }

  async goBack(): Promise<void> {
    if (this.canGoBack()) {
      this.navigationStack.pop(); // Remove current
      const previous = this.navigationStack.pop(); // Get previous
      if (previous) {
        await this.navigateTo(previous);
      }
    }
  }

  async goHome(): Promise<void> {
    this.navigationStack = [];
    await this.navigateTo('main-menu');
  }

  getCurrentPath(): string[] {
    return this.navigationStack.map(routeId => {
      const route = this.routes.get(routeId);
      return route?.path || routeId;
    });
  }

  canGoBack(): boolean {
    return this.navigationStack.length > 1;
  }

  private async handleMenuResult(result: MenuResult): Promise<void> {
    switch (result.action) {
      case 'back':
        await this.goBack();
        break;
      case 'home':
        await this.goHome();
        break;
      case 'exit':
        process.exit(0);
        break;
      case 'continue':
        // Stay in current menu
        break;
    }
  }

  private registerDefaultRoutes(): void {
    // Register all menu routes
    this.registerRoute({
      id: 'main-menu',
      path: 'Main Menu',
      handler: this.handleMainMenu.bind(this)
    });

    this.registerRoute({
      id: 'quick-start',
      path: 'Quick Start',
      handler: this.handleQuickStart.bind(this),
      parent: 'main-menu'
    });

    // ... register all other routes
  }

  private async handleMainMenu(): Promise<MenuResult> {
    const choice = await this.input.promptForChoice({
      message: 'Select an option:',
      choices: MAIN_MENU.items.map(item => ({
        key: item.key,
        label: `${item.icon} ${item.label}`,
        description: item.description
      }))
    });

    const selectedItem = MAIN_MENU.items.find(item => item.key === choice);
    if (selectedItem?.action.type === 'navigate') {
      await this.navigateTo(selectedItem.action.target);
    }

    return { action: 'continue' };
  }
}
```

## Integration Points

### 1. Existing CLI Commands
The interactive menu system should integrate with existing CLI commands:

```typescript
interface CommandIntegration {
  executeCommand(command: string, args: string[]): Promise<CommandResult>;
  getCommandStatus(command: string): Promise<CommandStatus>;
  validateCommand(command: string, args: string[]): Promise<ValidationResult>;
}
```

### 2. Configuration System
Integration with existing configuration:

```typescript
interface ConfigurationIntegration {
  loadConfiguration(): Promise<Configuration>;
  saveConfiguration(config: Configuration): Promise<void>;
  validateConfiguration(): Promise<ValidationResult>;
  getConfigurationStatus(): Promise<ConfigurationStatus>;
}
```

### 3. Document Generation
Integration with document generation system:

```typescript
interface DocumentGenerationIntegration {
  getAvailableTemplates(): Promise<TemplateInfo[]>;
  generateDocument(templateKey: string, options: GenerationOptions): Promise<GenerationResult>;
  getGenerationHistory(): Promise<GenerationHistory[]>;
  validateTemplate(templateKey: string): Promise<ValidationResult>;
}
```

## Error Handling

### 1. Menu-Level Error Handling

```typescript
interface MenuErrorHandler {
  handleNavigationError(error: NavigationError): Promise<void>;
  handleInputError(error: InputError): Promise<void>;
  handleSystemError(error: SystemError): Promise<void>;
  showErrorMessage(message: string, recoverable: boolean): Promise<void>;
}
```

### 2. Recovery Strategies

```typescript
interface ErrorRecovery {
  recoverFromNavigationError(): Promise<void>;
  recoverFromConfigurationError(): Promise<void>;
  recoverFromSystemError(): Promise<void>;
  resetToSafeState(): Promise<void>;
}
```

## Testing Strategy

### 1. Unit Tests
- Test individual menu components
- Test navigation logic
- Test state management
- Test input validation

### 2. Integration Tests
- Test menu flow end-to-end
- Test integration with existing commands
- Test error handling scenarios
- Test configuration management

### 3. User Experience Tests
- Test menu usability
- Test navigation efficiency
- Test accessibility features
- Test performance under load

## Performance Considerations

### 1. Lazy Loading
- Load menu configurations on demand
- Cache frequently accessed data
- Minimize startup time

### 2. Async Operations
- Non-blocking menu rendering
- Background status checks
- Parallel data loading where possible

### 3. Memory Management
- Clean up unused menu states
- Limit navigation history size
- Efficient string handling for large menus

## Deployment and Rollout

### 1. Feature Flags
- Gradual rollout of interactive menu
- Fallback to existing CLI interface
- A/B testing capabilities

### 2. Migration Strategy
- Maintain backward compatibility
- Provide migration path for existing users
- Documentation and training materials

### 3. Monitoring
- Track menu usage patterns
- Monitor performance metrics
- Collect user feedback

This implementation specification provides a comprehensive foundation for building the interactive CLI menu system while maintaining integration with the existing ADPA functionality.