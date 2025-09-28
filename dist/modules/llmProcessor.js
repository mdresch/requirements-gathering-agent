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
    try {
        console.log('🔧 Populating enhanced context from project analysis...');
        // Import ContextManager dynamically to avoid circular dependencies
        const { ContextManager } = await import('./contextManager.js');
        const contextManager = ContextManager.getInstance();
        // STEP 1: Load existing generated documents as highest priority
        await contextManager.loadExistingGeneratedDocuments();
        // STEP 2: Add the comprehensive project context as core
        if (analysis.projectContext) {
            contextManager.addEnrichedContext('project-overview', analysis.projectContext);
            console.log('✅ Added project overview context');
        }
        // STEP 3: Add package.json information
        if (analysis.packageJson) {
            const packageInfo = `
# Project Information
- Name: ${analysis.packageJson.name || 'Unknown'}
- Version: ${analysis.packageJson.version || 'Unknown'}
- Description: ${analysis.packageJson.description || 'No description'}
- Dependencies: ${Object.keys(analysis.packageJson.dependencies || {}).join(', ') || 'None'}
- Scripts: ${Object.keys(analysis.packageJson.scripts || {}).join(', ') || 'None'}
            `.trim();
            contextManager.addEnrichedContext('project-metadata', packageInfo);
            console.log('✅ Added project metadata context');
        }
        // STEP 4: Process and categorize additional markdown files
        if (analysis.additionalMarkdownFiles?.length > 0) {
            for (const file of analysis.additionalMarkdownFiles) {
                // Skip files that are in generated-documents (already loaded as priority)
                if (file.filePath.includes('generated-documents')) {
                    continue;
                }
                const contextKey = `${file.category}-${file.fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const contextContent = `
# ${file.fileName} (Score: ${file.relevanceScore})
**Category:** ${file.category}
**Path:** ${file.filePath}

${file.content}
                `.trim();
                contextManager.addEnrichedContext(contextKey, contextContent);
            }
            console.log(`✅ Added ${analysis.additionalMarkdownFiles.length} additional markdown files to context`);
        }
        // STEP 5: Add suggested sources as high-priority context
        if (analysis.suggestedSources?.length > 0) {
            const suggestedSourcesContent = `
# High-Priority Sources
The following sources have been identified as particularly valuable for this project:
${analysis.suggestedSources.map(source => `- ${source}`).join('\n')}
            `.trim();
            contextManager.addEnrichedContext('suggested-sources', suggestedSourcesContent);
            console.log('✅ Added suggested sources context');
        }
        console.log('🎯 Enhanced context population completed successfully');
    }
    catch (error) {
        console.error('❌ Failed to populate enhanced context:', error);
        // Don't throw - allow the system to continue with basic context
    }
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