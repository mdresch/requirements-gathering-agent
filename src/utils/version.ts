/**
 * Version utilities for centralized version management
 * 
 * Provides utilities to access package.json version dynamically
 * as recommended in CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 4
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created July 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\utils\version.ts
 */

// Node.js built-ins
import { createRequire } from 'module';

// Dynamic package.json import
const require = createRequire(import.meta.url);

/**
 * Get the current package version from package.json
 * @returns The version string from package.json
 */
export function getPackageVersion(): string {
  try {
    const { version } = require('../../package.json');
    return version;
  } catch (error) {
    console.warn('Warning: Could not read version from package.json:', error);
    return 'unknown';
  }
}

/**
 * Get formatted version string with 'v' prefix
 * @returns Formatted version string (e.g., "v2.1.3")
 */
export function getFormattedVersion(): string {
  const version = getPackageVersion();
  return version.startsWith('v') ? version : `v${version}`;
}

/**
 * Get the application name and version for display
 * @returns Formatted application name and version
 */
export function getAppDisplayName(): string {
  return `🚀 Advanced Document Processing Agent (ADPA) ${getFormattedVersion()}`;
}

/**
 * Get legacy RGA display name for backwards compatibility
 * @returns Formatted legacy name and version
 */
export function getLegacyDisplayName(): string {
  return `🚀 Requirements Gathering Agent ${getFormattedVersion()}`;
}
