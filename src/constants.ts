// Centralized constants for CLI and commands
export const CONFIG_FILENAME: string = 'config-rga.json';

// Output directories and file names
export const DEFAULT_OUTPUT_DIR: string = 'generated-documents';
export const COMPLIANCE_REPORT_FILENAME: string = 'compliance-report.md';
export const PROMPT_ADJUSTMENT_REPORT_FILENAME: string = 'prompt-adjustment-report.txt';

// Project file names
export const PACKAGE_JSON_FILENAME: string = 'package.json';
export const TSCONFIG_JSON_FILENAME: string = 'tsconfig.json';
export const README_FILENAME: string = 'README.md';
export const PROCESSOR_CONFIG_FILENAME: string = 'src/modules/documentGenerator/processor-config.json';
export const TEMPLATES_FILENAME: string = 'templates.json';

// Retry and timing constants
export const DEFAULT_RETRY_COUNT: number = 0;
export const DEFAULT_RETRY_BACKOFF: number = 1000;
export const DEFAULT_RETRY_MAX_DELAY: number = 25000;

// Supported output formats
export const SUPPORTED_FORMATS = ['markdown', 'json', 'yaml'] as const;
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

// Version reading utility (use dynamic import from package.json instead of hardcoded values)
// For version information, import it dynamically from package.json in your modules:
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const { version } = require('../package.json');

// File extensions
export const MARKDOWN_EXTENSION: string = '.md';
export const JSON_EXTENSION: string = '.json';
export const YAML_EXTENSION: string = '.yaml';

// Required files for status check
export const REQUIRED_FILES = [
  { name: PACKAGE_JSON_FILENAME, required: true },
  { name: 'src/', required: true },
  { name: TSCONFIG_JSON_FILENAME, required: false },
  { name: CONFIG_FILENAME, required: false },
  { name: 'generated-documents/', required: false },
] as const;

// Files to analyze
export const ANALYZE_FILES = [
  PACKAGE_JSON_FILENAME,
  TSCONFIG_JSON_FILENAME,
  'src/',
  README_FILENAME,
  'data/',
  'docs/',
  CONFIG_FILENAME,
  PROCESSOR_CONFIG_FILENAME,
] as const;
