/**
 * Legacy llmProcessor module
 * Provides backward compatibility exports
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
//# sourceMappingURL=llmProcessor.js.map