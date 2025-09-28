export async function populateEnhancedContextFromAnalysis(analysis) {
    try {
        console.log('🔧 Populating enhanced context from project analysis...');
        const { ContextManager } = await import('./contextManager.js');
        const contextManager = ContextManager.getInstance();
        await contextManager.loadExistingGeneratedDocuments();
        if (analysis.projectContext) {
            contextManager.addEnrichedContext('project-overview', analysis.projectContext);
            console.log('✅ Added project overview context');
        }
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
        if (analysis.additionalMarkdownFiles?.length > 0) {
            for (const file of analysis.additionalMarkdownFiles) {
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
    }
}
export function getModel() {
    return {};
}
export async function getAiSummaryAndGoals(context) {
    const { getAiSummaryAndGoals: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}
export async function getAiKeyRolesAndNeeds(context) {
    const { getAiKeyRolesAndNeeds: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}
export function createMessages(systemPrompt, userPrompt) {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
}
export async function getAiUserStories(context) {
    const { getAiUserStories: newFunc } = await import('./llmProcessor-migration.js');
    return newFunc(context);
}
