/**
 * Enhanced Context Manager for Requirements Gathering Agent
 * Version: 2.1.2
 */

export class ContextManager {
    private maxContextTokens: number;
    private coreContext: string = '';
    private enrichedContext: Map<string, string> = new Map();

    constructor(maxTokens: number = 3000) {
        this.maxContextTokens = maxTokens;
    }

    // Estimate token count (rough approximation: 4 chars = 1 token)
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    // Create core context summary from README
    async createCoreContext(readmeContent: string): Promise<string> {
        if (this.estimateTokens(readmeContent) > 1000) {
            // Summarize long README content
            const summary = await this.summarizeText(readmeContent, 800);
            this.coreContext = summary;
        } else {
            this.coreContext = readmeContent;
        }
        return this.coreContext;
    }

    // Add enriched context (e.g., from additional markdown files)
    addEnrichedContext(key: string, content: string): void {
        this.enrichedContext.set(key, content);
    }

    // Build context for specific document type with smart truncation
    buildContextForDocument(documentType: string, additionalContext?: string[]): string {
        let context = this.coreContext;
        let remainingTokens = this.maxContextTokens - this.estimateTokens(context);

        // Add relevant enriched context based on document type
        const relevantContext = this.getRelevantContext(documentType);

        for (const contextPart of relevantContext) {
            const tokens = this.estimateTokens(contextPart);
            if (tokens <= remainingTokens) {
                context += `\n\n${contextPart}`;
                remainingTokens -= tokens;
            } else {
                // Truncate to fit
                const maxChars = remainingTokens * 4 - 100; // Leave some buffer
                if (maxChars > 200) {
                    context += `\n\n${contextPart.substring(0, maxChars)}...`;
                }
                break;
            }
        }

        return context;
    }

    // Map document types to relevant context keys
    private getRelevantContext(documentType: string): string[] {
        const contextMap: { [key: string]: string[] } = {
            'user-stories': ['personas', 'summary'],
            'risk-management': ['project-charter', 'scope-plan', 'tech-stack'],
            'quality-plan': ['requirements', 'tech-stack', 'user-stories'],
            'stakeholder-register': ['project-charter', 'communication-plan'],
            // Add more mappings based on document relationships
        };

        return (contextMap[documentType] || ['summary'])
            .map(key => this.enrichedContext.get(key))
            .filter(Boolean) as string[];
    }

    // Summarize text if too large (fallback: truncation)
    async summarizeText(text: string, maxTokens: number): Promise<string> {
        // Use AI to create intelligent summaries when context is too large
        return text.substring(0, maxTokens * 4); // Fallback truncation
    }
}

// Version export for tracking
export const contextManagerVersion = '2.1.2';