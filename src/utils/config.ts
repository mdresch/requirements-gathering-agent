/**
 * Configuration utilities for centralized configuration management
 * 
 * Provides utilities to access and manage application configuration
 * as recommended in CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 4
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created July 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\utils\config.ts
 */

// Node.js built-ins
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Internal modules
import { CONFIG_FILENAME, PROCESSOR_CONFIG_FILENAME } from '../constants.js';

/**
 * Interface for the main RGA configuration
 */
export interface RGAConfig {
  currentProvider?: string;
  defaultOutputDir?: string;
  providers?: Record<string, any>;
  docsVcs?: {
    enabled?: boolean;
    autoCommit?: boolean;
  };
  confluence?: {
    baseUrl?: string;
  };
  sharepoint?: {
    siteUrl?: string;
  };
}

/**
 * Read and parse the main RGA configuration file
 * @param projectRoot - Optional project root directory
 * @returns The parsed configuration object
 */
export async function loadRGAConfig(projectRoot: string = process.cwd()): Promise<RGAConfig> {
  const configPath = join(projectRoot, CONFIG_FILENAME);
  
  if (!existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  try {
    const configRaw = await readFile(configPath, 'utf-8');
    return JSON.parse(configRaw) as RGAConfig;
  } catch (error) {
    throw new Error(`Failed to parse configuration file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Read and parse the processor configuration file
 * @param projectRoot - Optional project root directory
 * @returns The parsed processor configuration object
 */
export async function loadProcessorConfig(projectRoot: string = process.cwd()): Promise<Record<string, any>> {
  const configPath = join(projectRoot, PROCESSOR_CONFIG_FILENAME);
  
  if (!existsSync(configPath)) {
    throw new Error(`Processor configuration file not found: ${configPath}`);
  }

  try {
    const configRaw = await readFile(configPath, 'utf-8');
    return JSON.parse(configRaw);
  } catch (error) {
    throw new Error(`Failed to parse processor configuration file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if the main configuration file exists
 * @param projectRoot - Optional project root directory
 * @returns True if configuration file exists
 */
export function hasRGAConfig(projectRoot: string = process.cwd()): boolean {
  const configPath = join(projectRoot, CONFIG_FILENAME);
  return existsSync(configPath);
}

/**
 * Check if the processor configuration file exists
 * @param projectRoot - Optional project root directory
 * @returns True if processor configuration file exists
 */
export function hasProcessorConfig(projectRoot: string = process.cwd()): boolean {
  const configPath = join(projectRoot, PROCESSOR_CONFIG_FILENAME);
  return existsSync(configPath);
}

/**
 * Get the current AI provider from configuration
 * @param projectRoot - Optional project root directory
 * @returns The current provider name or undefined
 */
export async function getCurrentProvider(projectRoot: string = process.cwd()): Promise<string | undefined> {
  try {
    const config = await loadRGAConfig(projectRoot);
    return config.currentProvider;
  } catch {
    return undefined;
  }
}

/**
 * Get the default output directory from configuration
 * @param projectRoot - Optional project root directory
 * @returns The default output directory or fallback value
 */
export async function getDefaultOutputDir(projectRoot: string = process.cwd()): Promise<string> {
  try {
    const config = await loadRGAConfig(projectRoot);
    return config.defaultOutputDir || 'generated-documents';
  } catch {
    return 'generated-documents';
  }
}
