// ProcessorFactory: single function to create processors based on processor-config.json
import { readFileSync } from 'fs';
import * as path from 'path';
import { PROCESSOR_CONFIG_FILENAME } from '../../constants.js';
import type { DocumentProcessor } from './types.js';

// Load the runtime JSON config from source folder
const configPath = path.resolve(process.cwd(), PROCESSOR_CONFIG_FILENAME);
const processorConfig: Record<string, { module: string }> = JSON.parse(
  readFileSync(configPath, 'utf-8')
);

/**
 * Dynamically loads and returns a processor instance for the given task key.
 * @param key Document key as defined in processor-config.json
 * @throws Error if no entry or class cannot be found
 */
export async function createProcessor(key: string): Promise<DocumentProcessor> {
  const entry = processorConfig[key];
  if (!entry || !entry.module) {
    throw new Error(`No processor registered for key "${key}"`);
  }
  const [rawPath, className] = entry.module.split('#');
  if (!rawPath || !className) {
    throw new Error(`Invalid module entry for key "${key}": ${entry.module}`);
  }
  // Strip .ts extension for runtime
  const withoutExt = rawPath.replace(/\.ts$/, '');
  const moduleUrl = new URL(withoutExt + '.js', import.meta.url).href;
  const mod = await import(moduleUrl);
  const ProcessorClass = mod[className];
  if (typeof ProcessorClass !== 'function') {
    throw new Error(`Processor class ${className} not found in module ${moduleUrl}`);
  }
  return new ProcessorClass();
}
