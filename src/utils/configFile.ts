/**
 * Configuration File Support
 * Loads and manages configuration from .rga.config.js files
 */

// 1. Node.js built-ins
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { pathToFileURL } from 'url';

// 2. Third-party dependencies (none)

// 3. Internal modules (none)

// 4. Types
export interface RgaConfig {
  // Default options
  defaults?: {
    output?: string;
    format?: 'markdown' | 'json' | 'yaml';
    retries?: number;
    retryBackoff?: number;
    retryMaxDelay?: number;
    quiet?: boolean;
  };
  
  // AI Provider configuration
  ai?: {
    provider?: string;
    timeout?: number;
    maxTokens?: number;
  };
  
  // Integration settings
  integrations?: {
    confluence?: {
      spaceKey?: string;
      parentPageTitle?: string;
      labelPrefix?: string;
    };
    sharepoint?: {
      siteUrl?: string;
      libraryName?: string;
      folderPath?: string;
    };
    git?: {
      autoCommit?: boolean;
      commitMessage?: string;
      autoPush?: boolean;
    };
  };
  
  // Custom commands or aliases
  aliases?: Record<string, string[]>;
  
  // Plugin configuration
  plugins?: string[];
  
  // Advanced settings
  advanced?: {
    enablePerformanceMonitoring?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    cacheEnabled?: boolean;
    maxConcurrentOperations?: number;
  };
}

class ConfigManager {
  private config: RgaConfig = {};
  private configPath: string | null = null;

  /**
   * Load configuration from files
   */
  async loadConfig(searchPaths: string[] = [process.cwd()]): Promise<RgaConfig> {
    for (const searchPath of searchPaths) {
      const configFiles = [
        '.rga.config.js',
        '.rga.config.json',
        'rga.config.js',
        'rga.config.json'
      ];

      for (const configFile of configFiles) {
        const configPath = join(searchPath, configFile);
        
        if (existsSync(configPath)) {
          try {
            await this.loadConfigFile(configPath);
            this.configPath = configPath;
            return this.config;
          } catch (error) {
            console.warn(`⚠️  Failed to load config from ${configPath}:`, error instanceof Error ? error.message : error);
          }
        }
      }
    }

    return this.config;
  }

  /**
   * Load a specific config file
   */
  private async loadConfigFile(filePath: string): Promise<void> {
    if (filePath.endsWith('.json')) {
      await this.loadJsonConfig(filePath);
    } else if (filePath.endsWith('.js')) {
      await this.loadJsConfig(filePath);
    }
  }

  /**
   * Load JSON configuration
   */
  private async loadJsonConfig(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf8');
    this.config = JSON.parse(content);
  }

  /**
   * Load JavaScript configuration
   */
  private async loadJsConfig(filePath: string): Promise<void> {
    const fileUrl = pathToFileURL(filePath).href;
    const configModule = await import(fileUrl);
    this.config = configModule.default || configModule;
  }

  /**
   * Get current configuration
   */
  getConfig(): RgaConfig {
    return this.config;
  }

  /**
   * Get configuration path
   */
  getConfigPath(): string | null {
    return this.configPath;
  }

  /**
   * Get default value with config override
   */
  getDefault<T>(key: keyof RgaConfig['defaults'], fallback: T): T {
    return (this.config.defaults?.[key] as T) ?? fallback;
  }

  /**
   * Get AI configuration
   */
  getAiConfig(): RgaConfig['ai'] {
    return this.config.ai || {};
  }

  /**
   * Get integration configuration
   */
  getIntegrationConfig(): RgaConfig['integrations'] {
    return this.config.integrations || {};
  }

  /**
   * Get aliases
   */
  getAliases(): Record<string, string[]> {
    return this.config.aliases || {};
  }

  /**
   * Get advanced settings
   */
  getAdvancedConfig(): RgaConfig['advanced'] {
    return this.config.advanced || {};
  }

  /**
   * Check if performance monitoring is enabled
   */
  isPerformanceMonitoringEnabled(): boolean {
    return this.config.advanced?.enablePerformanceMonitoring ?? false;
  }

  /**
   * Get log level
   */
  getLogLevel(): string {
    return this.config.advanced?.logLevel ?? 'info';
  }

  /**
   * Merge with command line options
   */
  mergeWithCliOptions<T extends Record<string, any>>(cliOptions: T): T {
    const defaults = this.config.defaults || {};
    
    return {
      ...defaults,
      ...cliOptions
    } as T;
  }

  /**
   * Generate example config file
   */
  generateExampleConfig(): string {
    const exampleConfig: RgaConfig = {
      defaults: {
        output: 'generated-documents',
        format: 'markdown',
        retries: 3,
        retryBackoff: 1000,
        retryMaxDelay: 25000,
        quiet: false
      },
      ai: {
        provider: 'azure-openai',
        timeout: 60000,
        maxTokens: 4000
      },
      integrations: {
        confluence: {
          spaceKey: 'PROJECT',
          parentPageTitle: 'Documentation',
          labelPrefix: 'auto-generated'
        },
        sharepoint: {
          siteUrl: 'https://company.sharepoint.com/sites/project',
          libraryName: 'Documents',
          folderPath: 'Generated Documentation'
        },
        git: {
          autoCommit: true,
          commitMessage: 'docs: auto-generated documentation updates',
          autoPush: false
        }
      },
      aliases: {
        'gen': ['generate'],
        'docs': ['generate-all'],
        'quick': ['generate-core-analysis']
      },
      advanced: {
        enablePerformanceMonitoring: true,
        logLevel: 'info',
        cacheEnabled: true,
        maxConcurrentOperations: 3
      }
    };

    return `// RGA Configuration File
// Save as .rga.config.js in your project root

export default ${JSON.stringify(exampleConfig, null, 2)};

// Alternative CommonJS syntax:
// module.exports = ${JSON.stringify(exampleConfig, null, 2)};
`;
  }
}

// Global config manager instance
export const configManager = new ConfigManager();

/**
 * Initialize configuration
 */
export async function initializeConfig(): Promise<RgaConfig> {
  return await configManager.loadConfig();
}
