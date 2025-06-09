/**
 * Legacy LLM Processor Module for Requirements Gathering Agent
 *
 * Provides backward compatibility exports and enhanced context population
 * for maintaining compatibility with existing implementations.
 *
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 *
 * Key Features:
 * - Legacy compatibility exports for backward compatibility
 * - Enhanced context population from project analysis
 * - Integration with modern AI processor architecture
 * - Transition support for migration to new structure
 *
 * @deprecated Consider migrating to the new AI processor modules
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\llmProcessor.ts
 */
/**
 * Populates enhanced context from project analysis
 * @param analysis - Project analysis data
 */
export async function populateEnhancedContextFromAnalysis(analysis) {
    // Legacy function - implementation moved to new architecture
    console.log('populateEnhancedContextFromAnalysis called with analysis:', analysis.packageJson?.name || 'Unknown Project');
}
/**
 * Get model configuration
 */
export function getModel() {
    // Legacy function - implementation moved to new architecture
    return {};
}
/**
 * Get AI summary and goals (legacy compatibility)
 */
export async function getAiSummaryAndGoals(context) {
    const { getAiSummaryAndGoals: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}
/**
 * Get AI key roles and needs (legacy compatibility)
 */
export async function getAiKeyRolesAndNeeds(context) {
    const { getAiKeyRolesAndNeeds: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}
/**
 * Create messages array (legacy compatibility)
 */
export function createMessages(systemPrompt, userPrompt) {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
}
/**
 * Get AI user stories (legacy compatibility)
 */
export async function getAiUserStories(context) {
    const { getAiUserStories: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}
//# sourceMappingURL=llmProcessor.js.map