/**
 * Legacy llmProcessor module
 * Provides backward compatibility exports
 */

import type { ProjectAnalysis } from './projectAnalyzer.js';
import { ChatMessage } from './ai/types.js';

/**
 * Populates enhanced context from project analysis
 * @param analysis - Project analysis data
 */
export async function populateEnhancedContextFromAnalysis(analysis: ProjectAnalysis): Promise<void> {
    // Legacy function - implementation moved to new architecture
    console.log('populateEnhancedContextFromAnalysis called with analysis:', analysis.packageJson?.name || 'Unknown Project');
}

/**
 * Get model configuration
 */
export function getModel(): any {
    // Legacy function - implementation moved to new architecture
    return {};
}

/**
 * Get AI summary and goals (legacy compatibility)
 */
export async function getAiSummaryAndGoals(context: string): Promise<string | null> {
    const { getAiSummaryAndGoals: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}

/**
 * Get AI key roles and needs (legacy compatibility)
 */
export async function getAiKeyRolesAndNeeds(context: string): Promise<string | null> {
    const { getAiKeyRolesAndNeeds: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}

/**
 * Create messages array (legacy compatibility)
 */
export function createMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
}

/**
 * Get AI user stories (legacy compatibility)
 */
export async function getAiUserStories(context: string): Promise<string | null> {
    const { getAiUserStories: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}