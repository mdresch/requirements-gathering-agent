/**
 * Enhanced Context Manager for Requirements Gathering Agent
 * Version: 2.1.2
 */

export class ContextManager {
    private maxContextTokens: number;
    private coreContext: string = '';
    private enrichedContext: Map<string, string> = new Map();
    private generatedDocuments: Set<string> = new Set();
    private lastContextUpdate: number = 0;

    constructor(maxTokens: number = 3000) {
        this.maxContextTokens = maxTokens;
    }

    // Track newly generated documents
    async trackGeneratedDocument(documentPath: string, content: string): Promise<void> {
        const documentKey = this.getDocumentKey(documentPath);
        this.generatedDocuments.add(documentKey);
        this.addEnrichedContext(documentKey, content);
        this.lastContextUpdate = Date.now();
    }

    // Extract document key from path
    private getDocumentKey(path: string): string {
        const filename = path.split('/').pop() || '';
        return filename.replace('.md', '').toLowerCase();
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

    // Build context for specific document type with smart truncation and dynamic updates
    buildContextForDocument(documentType: string, additionalContext?: string[]): string {
        // Start with core context
        let context = this.coreContext;
        let remainingTokens = this.maxContextTokens - this.estimateTokens(context);
        
        // Add metadata about context freshness
        context += `\n\nContext last updated: ${new Date(this.lastContextUpdate).toISOString()}`;
        context += `\nAvailable generated documents: ${Array.from(this.generatedDocuments).join(', ')}`;

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
        // Dynamic context mapping based on document relationships and available content
        const baseContextMap: { [key: string]: string[] } = {
            'user-stories': ['personas', 'summary', 'requirements', 'project-summary'],
            'risk-management': ['project-charter', 'scope-plan', 'tech-stack', 'stakeholder-register'],
            'quality-plan': ['requirements', 'tech-stack', 'user-stories', 'project-charter'],
            'stakeholder-register': ['project-charter', 'communication-plan', 'project-summary'],
            'project-charter': ['stakeholder-register', 'project-summary', 'requirements'],
            'scope-management': ['project-charter', 'requirements', 'user-stories'],
            'communication-plan': ['stakeholder-register', 'project-charter'],
            'requirements': ['user-stories', 'project-summary', 'tech-stack'],
        };

        // Get base context keys
        let contextKeys = baseContextMap[documentType] || ['summary'];
        
        // Add relevant generated documents that might provide additional context
        this.generatedDocuments.forEach(docKey => {
            if (this.isRelevantForContext(documentType, docKey)) {
                contextKeys.push(docKey);
            }
        });

        // Deduplicate and get content
        return [...new Set(contextKeys)]
            .map(key => this.enrichedContext.get(key))
            .filter(Boolean) as string[];
    }

    private isRelevantForContext(targetDoc: string, sourceDoc: string): boolean {
        // Define relationships between documents
        const relationships: { [key: string]: string[] } = {
            'project-charter': ['stakeholder-register', 'project-summary', 'requirements'],
            'user-stories': ['requirements', 'personas', 'project-summary'],
            'risk-management': ['project-charter', 'tech-stack', 'requirements'],
            'quality-plan': ['requirements', 'user-stories', 'tech-stack'],
            'scope-management': ['project-charter', 'requirements', 'user-stories'],
            'communication-plan': ['stakeholder-register', 'project-charter'],
            'stakeholder-register': ['project-charter', 'communication-plan'],
        };

        // Check if source document is relevant for target document
        return relationships[targetDoc]?.includes(sourceDoc) || false;
    }

    // Summarize text if too large (fallback: truncation)
    async summarizeText(text: string, maxTokens: number): Promise<string> {
        // Use AI to create intelligent summaries when context is too large
        return text.substring(0, maxTokens * 4); // Fallback truncation
    }
}

// Version export for tracking
export const contextManagerVersion = '2.1.2';