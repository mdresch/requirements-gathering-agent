/**
 * Format Generators Module for Requirements Gathering Agent
 * 
 * Exports functionality for generating documents in various formats beyond markdown.
 * Currently supports Word (.docx) and planned PowerPoint (.pptx) generation.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created December 2024
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\formatGenerators\index.ts
 */

export { PandocGenerator } from './PandocGenerator.js';

/**
 * Version information for the format generators module
 */
export const formatGeneratorsVersion = '1.0.0';

/**
 * Available export formats
 */
export const SUPPORTED_FORMATS = {
    MARKDOWN: 'markdown',
    DOCX: 'docx',
    PPTX: 'pptx' // Now available with Pandoc!
} as const;

export type SupportedFormat = typeof SUPPORTED_FORMATS[keyof typeof SUPPORTED_FORMATS];
