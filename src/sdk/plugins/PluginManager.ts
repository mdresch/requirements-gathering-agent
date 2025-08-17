/**
 * Plugin Manager
 * 
 * Manages the plugin system for the Requirements Gathering Agent SDK.
 * Provides plugin loading, lifecycle management, and hook execution.
 */

import { EventEmitter } from 'events';
import { Plugin, PluginHooks } from '../types/index.js';
import { PluginError } from '../errors/index.js';

/**
 * Plugin Manager
 * 
 * Handles plugin system operations including:
 * - Plugin discovery and loading
 * - Plugin lifecycle management
 * - Hook execution and event handling
 * - Plugin dependency resolution
 * - Plugin configuration management
 */
export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private pluginInstances: Map<string, any> = new Map();
  private hooks: Map<string, Array<{ plugin: string; handler: Function }>> = new Map();
  private initialized = false;

  constructor() {
    super();
  }

  /**
   * Load all available plugins
   */
  async loadPlugins(): Promise<void> {
    try {
      // Load plugins from default locations
      await this.loadPluginsFromDirectory('./plugins');
      await this.loadPluginsFromNodeModules();
      
      // Initialize loaded plugins
      await this.initializePlugins();
      
      this.initialized = true;
      this.emit('plugins-loaded');
    } catch (error) {
      throw new PluginError(`Failed to load plugins: ${error.message}`);
    }
  }

  /**
   * Install a plugin
   */
  async installPlugin(pluginName: string, config?: any): Promise<void> {
    try {
      // Load plugin
      const plugin = await this.loadPlugin(pluginName);
      
      // Validate plugin
      this.validatePlugin(plugin);
      
      // Check dependencies
      await this.checkDependencies(plugin);
      
      // Register plugin
      this.plugins.set(plugin.name, plugin);
      
      // Initialize plugin
      await this.initializePlugin(plugin, config);
      
      // Register hooks
      this.registerPluginHooks(plugin);
      
      this.emit('plugin-installed', plugin);
    } catch (error) {
      throw new PluginError(`Failed to install plugin ${pluginName}: ${error.message}`, pluginName);
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginName: string): Promise<void> {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new PluginError(`Plugin ${pluginName} not found`, pluginName);
      }
      
      // Cleanup plugin
      await this.cleanupPlugin(plugin);
      
      // Unregister hooks
      this.unregisterPluginHooks(plugin);
      
      // Remove from registry
      this.plugins.delete(pluginName);
      this.pluginInstances.delete(pluginName);
      
      this.emit('plugin-uninstalled', plugin);
    } catch (error) {
      throw new PluginError(`Failed to uninstall plugin ${pluginName}: ${error.message}`, pluginName);
    }
  }

  /**
   * Get installed plugins
   */
  getInstalledPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Execute a hook
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const hookHandlers = this.hooks.get(hookName) || [];
    const results: any[] = [];
    
    for (const { plugin, handler } of hookHandlers) {
      try {
        const result = await handler(...args);
        results.push(result);
        
        this.emit('hook-executed', { hookName, plugin, result });
      } catch (error) {
        this.emit('hook-error', { hookName, plugin, error });
        
        // Continue with other hooks unless it's a critical error
        if (error.critical) {
          throw new PluginError(`Critical error in plugin ${plugin} hook ${hookName}: ${error.message}`, plugin, undefined, hookName);
        }
      }
    }
    
    return results;
  }

  /**
   * Check if a hook has handlers
   */
  hasHook(hookName: string): boolean {
    const handlers = this.hooks.get(hookName);
    return handlers !== undefined && handlers.length > 0;
  }

  /**
   * Get available hooks
   */
  getAvailableHooks(): string[] {
    return Array.from(this.hooks.keys());
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new PluginError(`Plugin ${pluginName} not found`, pluginName);
    }
    
    try {
      await this.initializePlugin(plugin);
      this.registerPluginHooks(plugin);
      
      this.emit('plugin-enabled', plugin);
    } catch (error) {
      throw new PluginError(`Failed to enable plugin ${pluginName}: ${error.message}`, pluginName);
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new PluginError(`Plugin ${pluginName} not found`, pluginName);
    }
    
    try {
      await this.cleanupPlugin(plugin);
      this.unregisterPluginHooks(plugin);
      
      this.emit('plugin-disabled', plugin);
    } catch (error) {
      throw new PluginError(`Failed to disable plugin ${pluginName}: ${error.message}`, pluginName);
    }
  }

  /**
   * Get plugin status
   */
  getPluginStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [name, plugin] of this.plugins.entries()) {
      const instance = this.pluginInstances.get(name);
      
      status[name] = {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        author: plugin.author,
        enabled: !!instance,
        hooks: plugin.hooks ? Object.keys(plugin.hooks) : [],
        dependencies: plugin.dependencies || []
      };
    }
    
    return status;
  }

  /**
   * Cleanup all plugins
   */
  async cleanup(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await this.cleanupPlugin(plugin);
      } catch (error) {
        this.emit('plugin-cleanup-error', { plugin: plugin.name, error });
      }
    }
    
    this.plugins.clear();
    this.pluginInstances.clear();
    this.hooks.clear();
    this.initialized = false;
  }

  // === Private Methods ===

  private async loadPluginsFromDirectory(directory: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if directory exists
      try {
        await fs.access(directory);
      } catch {
        // Directory doesn't exist, skip
        return;
      }
      
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(directory, entry.name);
          try {
            const plugin = await this.loadPluginFromPath(pluginPath);
            if (plugin) {
              this.plugins.set(plugin.name, plugin);
            }
          } catch (error) {
            this.emit('plugin-load-error', { path: pluginPath, error });
          }
        }
      }
    } catch (error) {
      // Directory loading failed, but this is not critical
      this.emit('plugin-directory-error', { directory, error });
    }
  }

  private async loadPluginsFromNodeModules(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      
      try {
        await fs.access(nodeModulesPath);
      } catch {
        return; // No node_modules directory
      }
      
      const entries = await fs.readdir(nodeModulesPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('rga-plugin-')) {
          const pluginPath = path.join(nodeModulesPath, entry.name);
          try {
            const plugin = await this.loadPluginFromPath(pluginPath);
            if (plugin) {
              this.plugins.set(plugin.name, plugin);
            }
          } catch (error) {
            this.emit('plugin-load-error', { path: pluginPath, error });
          }
        }
      }
    } catch (error) {
      this.emit('plugin-node-modules-error', { error });
    }
  }

  private async loadPluginFromPath(pluginPath: string): Promise<Plugin | null> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Look for package.json
      const packageJsonPath = path.join(pluginPath, 'package.json');
      
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        
        // Check if it's an RGA plugin
        if (!packageJson.keywords?.includes('rga-plugin')) {
          return null;
        }
        
        // Load the main module
        const mainPath = path.join(pluginPath, packageJson.main || 'index.js');
        const pluginModule = await import(mainPath);
        
        // Extract plugin definition
        const plugin: Plugin = {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          author: packageJson.author,
          dependencies: packageJson.dependencies ? Object.keys(packageJson.dependencies) : [],
          hooks: pluginModule.hooks,
          config: pluginModule.config || {}
        };
        
        return plugin;
      } catch (error) {
        throw new Error(`Failed to load plugin from ${pluginPath}: ${error.message}`);
      }
    } catch (error) {
      return null;
    }
  }

  private async loadPlugin(pluginName: string): Promise<Plugin> {
    try {
      // Try to load from node_modules
      const pluginModule = await import(pluginName);
      
      if (!pluginModule.plugin) {
        throw new Error('Plugin module must export a "plugin" object');
      }
      
      return pluginModule.plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin ${pluginName}: ${error.message}`);
    }
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    
    if (!plugin.version) {
      throw new Error('Plugin must have a version');
    }
    
    // Validate hooks if present
    if (plugin.hooks) {
      const validHooks = [
        'beforeDocumentGeneration',
        'afterDocumentGeneration',
        'beforeValidation',
        'afterValidation',
        'beforePublish',
        'afterPublish'
      ];
      
      for (const hookName of Object.keys(plugin.hooks)) {
        if (!validHooks.includes(hookName)) {
          throw new Error(`Invalid hook name: ${hookName}`);
        }
        
        if (typeof plugin.hooks[hookName as keyof PluginHooks] !== 'function') {
          throw new Error(`Hook ${hookName} must be a function`);
        }
      }
    }
  }

  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) {
      return;
    }
    
    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin dependency not found: ${dependency}`);
      }
    }
  }

  private async initializePlugins(): Promise<void> {
    // Sort plugins by dependencies
    const sortedPlugins = this.topologicalSort(Array.from(this.plugins.values()));
    
    for (const plugin of sortedPlugins) {
      try {
        await this.initializePlugin(plugin);
        this.registerPluginHooks(plugin);
      } catch (error) {
        this.emit('plugin-init-error', { plugin: plugin.name, error });
      }
    }
  }

  private async initializePlugin(plugin: Plugin, config?: any): Promise<void> {
    try {
      // Create plugin instance if it has an initializer
      const pluginModule = await import(plugin.name);
      
      if (pluginModule.initialize) {
        const instance = await pluginModule.initialize(config || plugin.config);
        this.pluginInstances.set(plugin.name, instance);
      }
      
      this.emit('plugin-initialized', plugin);
    } catch (error) {
      throw new Error(`Failed to initialize plugin ${plugin.name}: ${error.message}`);
    }
  }

  private async cleanupPlugin(plugin: Plugin): Promise<void> {
    try {
      const instance = this.pluginInstances.get(plugin.name);
      
      if (instance && typeof instance.cleanup === 'function') {
        await instance.cleanup();
      }
      
      this.pluginInstances.delete(plugin.name);
      
      this.emit('plugin-cleaned-up', plugin);
    } catch (error) {
      throw new Error(`Failed to cleanup plugin ${plugin.name}: ${error.message}`);
    }
  }

  private registerPluginHooks(plugin: Plugin): void {
    if (!plugin.hooks) {
      return;
    }
    
    for (const [hookName, handler] of Object.entries(plugin.hooks)) {
      if (!this.hooks.has(hookName)) {
        this.hooks.set(hookName, []);
      }
      
      this.hooks.get(hookName)!.push({
        plugin: plugin.name,
        handler: handler as Function
      });
    }
  }

  private unregisterPluginHooks(plugin: Plugin): void {
    if (!plugin.hooks) {
      return;
    }
    
    for (const hookName of Object.keys(plugin.hooks)) {
      const handlers = this.hooks.get(hookName);
      if (handlers) {
        const filtered = handlers.filter(h => h.plugin !== plugin.name);
        if (filtered.length === 0) {
          this.hooks.delete(hookName);
        } else {
          this.hooks.set(hookName, filtered);
        }
      }
    }
  }

  private topologicalSort(plugins: Plugin[]): Plugin[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: Plugin[] = [];
    const pluginMap = new Map(plugins.map(p => [p.name, p]));
    
    const visit = (plugin: Plugin) => {
      if (visiting.has(plugin.name)) {
        throw new Error(`Circular dependency detected involving plugin: ${plugin.name}`);
      }
      
      if (visited.has(plugin.name)) {
        return;
      }
      
      visiting.add(plugin.name);
      
      // Visit dependencies first
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          const dependency = pluginMap.get(depName);
          if (dependency) {
            visit(dependency);
          }
        }
      }
      
      visiting.delete(plugin.name);
      visited.add(plugin.name);
      result.push(plugin);
    };
    
    for (const plugin of plugins) {
      if (!visited.has(plugin.name)) {
        visit(plugin);
      }
    }
    
    return result;
  }
}