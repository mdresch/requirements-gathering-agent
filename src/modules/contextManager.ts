/**
 * Enhanced Context Manager for Requirements Gathering Agent
 * Version: 2.1.2
 */

import { getModel, createAISummary } from './llmProcessor';

function createMessages(systemPrompt: string, userPrompt: string) {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
}

async function makeAICall(messages: any, maxTokens: number) {
    // Stub: In production, this would call the LLM. Here, just join the prompts.
    return messages.map((m: any) => m.content).join('\n');
}

function extractContent(response: any) {
    // Stub: In production, this would extract the LLM's response content.
    return typeof response === 'string' ? response : JSON.stringify(response);
}

export class ContextManager {
    private maxContextTokens: number;
    private coreContext: string = '';
    public enrichedContext: Map<string, string> = new Map();
    private contextCache: Map<string, string> = new Map();
    private documentRelationships: Map<string, string[]> = new Map();
    private modelTokenLimits: Map<string, number> = new Map();

    constructor(maxTokens: number = 4000) {
        this.maxContextTokens = maxTokens;
        this.initializeDocumentRelationships();
        this.initializeModelTokenLimits();
        // Auto-adjust based on current AI provider and model
        this.autoAdjustTokenLimits();
    }

    private initializeModelTokenLimits() {
        this.modelTokenLimits.set('gemini-1.5-flash', 1048576); // 1M tokens
        this.modelTokenLimits.set('gemini-1.5-pro', 2097152); // 2M tokens
        this.modelTokenLimits.set('gemini-2.0-flash-exp', 1048576); // 1M tokens
        this.modelTokenLimits.set('gpt-4', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4-turbo', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4o', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4o-mini', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4.1-mini', 8000); // 8k tokens
        this.modelTokenLimits.set('gpt-4.1', 8000); // 8k tokens
        this.modelTokenLimits.set('gpt-3.5-turbo', 16385); // 16k tokens
        this.modelTokenLimits.set('claude-3-opus', 200000); // 200k tokens
        this.modelTokenLimits.set('claude-3-sonnet', 200000); // 200k tokens
        this.modelTokenLimits.set('claude-3-haiku', 200000); // 200k tokens
        this.modelTokenLimits.set('llama3.1', 131072); // 128k tokens (Ollama)
        this.modelTokenLimits.set('llama3.2', 131072); // 128k tokens (Ollama)
        this.modelTokenLimits.set('qwen2.5', 131072); // 128k tokens (Ollama)
        this.modelTokenLimits.set('phi3', 131072); // 128k tokens (Ollama)
    }

    private autoAdjustTokenLimits() {
        try {
            const currentModel = typeof getModel === 'function' ? getModel().toLowerCase() : '';
            // Find the best match for the current model
            let modelLimit = 4000; // Default fallback
            for (const [modelName, limit] of this.modelTokenLimits) {
                if (currentModel.includes(modelName.toLowerCase())) {
                    modelLimit = limit;
                    break;
                }
            }
            // Reserve 20% for response tokens and system prompts
            const contextLimit = Math.floor(modelLimit * 0.7);
            // Enforce strict context for gpt-4.1 and gpt-4.1-mini
            if (currentModel.includes('gpt-4.1')) {
                this.maxContextTokens = modelLimit; // 8k as defined
            } else if (contextLimit > this.maxContextTokens) {
                this.maxContextTokens = contextLimit;
            }
        } catch (error) {
            // Fallback: do nothing
        }
    }

    private supportsLargeContext(): boolean {
        return this.maxContextTokens > 50000;
    }

    private getEffectiveTokenLimit(operation: 'core' | 'enriched' | 'full'): number {
        const baseLimit = this.maxContextTokens;
        switch (operation) {
            case 'core':
                return Math.floor(baseLimit * 0.3);
            case 'enriched':
                return Math.floor(baseLimit * 0.6);
            case 'full':
                return Math.floor(baseLimit * 0.9);
            default:
                return baseLimit;
        }
    }

    private initializeDocumentRelationships() {
        this.documentRelationships.set('user-stories', ['personas', 'summary', 'key-roles']);
        this.documentRelationships.set('project-charter', ['summary', 'scope-plan', 'stakeholder-register']);
        this.documentRelationships.set('risk-management-plan', ['project-charter', 'scope-plan', 'tech-stack', 'quality-plan']);
        this.documentRelationships.set('quality-management-plan', ['requirements', 'tech-stack', 'user-stories', 'acceptance-criteria']);
        this.documentRelationships.set('stakeholder-register', ['project-charter', 'communication-plan', 'stakeholder-analysis']);
        this.documentRelationships.set('scope-management-plan', ['project-charter', 'user-stories', 'wbs', 'requirements']);
        this.documentRelationships.set('wbs', ['scope-management', 'activity-list', 'resource-estimates']);
        this.documentRelationships.set('wbs-dictionary', ['wbs', 'scope-management', 'project-charter']);
        this.documentRelationships.set('activity-list', ['wbs', 'wbs-dictionary', 'scope-management']);
        this.documentRelationships.set('activity-duration-estimates', ['activity-list', 'wbs', 'resource-estimates']);
        this.documentRelationships.set('activity-resource-estimates', ['activity-list', 'wbs', 'tech-stack', 'resource-management']);
        this.documentRelationships.set('schedule-network-diagram', ['activity-list', 'duration-estimates', 'wbs']);
        this.documentRelationships.set('milestone-list', ['activity-list', 'wbs', 'project-charter', 'scope-management']);
        this.documentRelationships.set('schedule-development-input', ['activity-list', 'duration-estimates', 'resource-estimates', 'milestone-list', 'network-diagram']);
        this.documentRelationships.set('communication-plan', ['stakeholder-register', 'stakeholder-analysis', 'project-charter']);
        this.documentRelationships.set('communication-management-plan', ['stakeholder-register', 'project-charter', 'stakeholder-engagement']);
        this.documentRelationships.set('cost-management-plan', ['project-charter', 'resource-estimates', 'wbs', 'activity-list']);
        this.documentRelationships.set('resource-management-plan', ['project-charter', 'resource-estimates', 'activity-list', 'stakeholder-register']);
        this.documentRelationships.set('procurement-management-plan', ['project-charter', 'resource-estimates', 'tech-stack', 'cost-management']);
        this.documentRelationships.set('stakeholder-engagement-plan', ['stakeholder-register', 'communication-management', 'project-charter']);
        this.documentRelationships.set('tech-stack-analysis', ['data-model', 'user-stories', 'compliance', 'ui-ux', 'project-charter']);
        this.documentRelationships.set('data-model-suggestions', ['tech-stack', 'user-stories', 'compliance', 'project-charter']);
        this.documentRelationships.set('risk-analysis', ['project-charter', 'tech-stack', 'scope-management', 'stakeholder-register']);
        this.documentRelationships.set('acceptance-criteria', ['user-stories', 'quality-management', 'compliance', 'project-charter']);
        this.documentRelationships.set('compliance-considerations', ['project-charter', 'tech-stack', 'data-model', 'stakeholder-register']);
        this.documentRelationships.set('ui-ux-considerations', ['user-stories', 'personas', 'tech-stack', 'acceptance-criteria']);
        this.documentRelationships.set('user-personas', ['summary', 'project-charter', 'key-roles']);
        this.documentRelationships.set('key-roles-and-needs', ['summary', 'project-charter', 'stakeholder-register', 'user-stories']);
    }

    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 3.5);
    }

    async createCoreContext(readmeContent: string): Promise<string> {
        const cacheKey = `core_${this.hashString(readmeContent)}`;
        if (this.contextCache.has(cacheKey)) {
            this.coreContext = this.contextCache.get(cacheKey)!;
            return this.coreContext;
        }
        const estimatedTokens = this.estimateTokens(readmeContent);
        const coreTokenLimit = this.getEffectiveTokenLimit('core');
        if (this.supportsLargeContext()) {
            if (estimatedTokens <= coreTokenLimit) {
                this.coreContext = readmeContent;
            } else {
                const targetTokens = Math.min(coreTokenLimit, 8000);
                const summary = typeof createAISummary === 'function' ? await createAISummary(readmeContent, targetTokens) : null;
                this.coreContext = summary || readmeContent.substring(0, targetTokens * 3.5);
            }
        } else {
            if (estimatedTokens > 1200) {
                const summary = typeof createAISummary === 'function' ? await createAISummary(readmeContent, 1000) : null;
                this.coreContext = summary || readmeContent.substring(0, 4000);
            } else {
                this.coreContext = readmeContent;
            }
        }
        this.contextCache.set(cacheKey, this.coreContext);
        return this.coreContext;
    }

    buildContextForDocument(documentType: string, additionalContext?: string[]): string {
        const cacheKey = `${documentType}_${this.hashString(this.coreContext)}_${additionalContext?.join('|') || ''}`;
        if (this.contextCache.has(cacheKey)) {
            return this.contextCache.get(cacheKey)!;
        }
        let context = this.coreContext;
        const isLargeContext = this.supportsLargeContext();
        let remainingTokens = this.getEffectiveTokenLimit('enriched') - this.estimateTokens(context);
        const relevantContext = this.getRelevantContext(documentType);
        if (additionalContext) {
            relevantContext.push(...additionalContext);
        }
        if (isLargeContext) {
            const directlyRelated = relevantContext.filter((key: string) => this.enrichedContext.has(key));
            const sortedDirect = directlyRelated.sort((a: string, b: string) => {
                const aRelations = this.documentRelationships.get(a)?.length || 0;
                const bRelations = this.documentRelationships.get(b)?.length || 0;
                return bRelations - aRelations;
            });
            for (const contextKey of sortedDirect) {
                const contextPart = this.enrichedContext.get(contextKey)!;
                const tokens = this.estimateTokens(contextPart);
                if (tokens <= remainingTokens) {
                    context += `\n\n## Related Context: ${contextKey}\n${contextPart}`;
                    remainingTokens -= tokens;
                }
            }
            if (this.maxContextTokens > 200000 && remainingTokens > 50000) {
                const remainingKeys = Array.from(this.enrichedContext.keys())
                    .filter((key: string) => !relevantContext.includes(key));
                for (const contextKey of remainingKeys) {
                    const contextPart = this.enrichedContext.get(contextKey)!;
                    const tokens = this.estimateTokens(contextPart);
                    if (tokens <= remainingTokens) {
                        context += `\n\n## Additional Context: ${contextKey}\n${contextPart}`;
                        remainingTokens -= tokens;
                    } else if (remainingTokens > 20000) {
                        const maxChars = Math.max((remainingTokens - 10000) * 3, 2000);
                        const truncated = contextPart.substring(0, maxChars) + '\n...\n[Context partially included for token optimization]';
                        context += `\n\n## Additional Context: ${contextKey} (Partial)\n${truncated}`;
                        break;
                    }
                }
            } else if (remainingTokens > 5000) {
                const supplementaryKeys = Array.from(this.enrichedContext.keys())
                    .filter((key: string) => !relevantContext.includes(key))
                    .slice(0, 3);
                for (const contextKey of supplementaryKeys) {
                    const contextPart = this.enrichedContext.get(contextKey)!;
                    const tokens = this.estimateTokens(contextPart);
                    if (tokens <= remainingTokens - 2000) {
                        context += `\n\n## Supplementary Context: ${contextKey}\n${contextPart}`;
                        remainingTokens -= tokens;
                    } else if (remainingTokens > 3000) {
                        const maxChars = Math.max((remainingTokens - 2000) * 3, 1000);
                        const truncated = contextPart.substring(0, maxChars) + '\n...\n[Supplementary context truncated]';
                        context += `\n\n## Supplementary Context: ${contextKey} (Partial)\n${truncated}`;
                        break;
                    }
                }
            }
        } else {
            const sortedContext = relevantContext.sort((a: string, b: string) => {
                const aRelations = this.documentRelationships.get(a)?.length || 0;
                const bRelations = this.documentRelationships.get(b)?.length || 0;
                return bRelations - aRelations;
            });
            for (const contextKey of sortedContext) {
                const contextPart = this.enrichedContext.get(contextKey);
                if (!contextPart) continue;
                const tokens = this.estimateTokens(contextPart);
                if (tokens <= remainingTokens) {
                    context += `\n\n## Related Context: ${contextKey}\n${contextPart}`;
                    remainingTokens -= tokens;
                } else {
                    const maxChars = Math.max(remainingTokens * 3 - 100, 200);
                    if (maxChars > 200) {
                        const truncated = contextPart.substring(0, maxChars) + '...\n[Content truncated due to token limits]';
                        context += `\n\n## Related Context: ${contextKey} (Truncated)\n${truncated}`;
                        break;
                    }
                }
            }
        }
        const finalTokens = this.estimateTokens(context);
        this.contextCache.set(cacheKey, context);
        return context;
    }

    private getRelevantContext(documentType: string): string[] {
        const directRelations = this.documentRelationships.get(documentType) || ['summary'];
        const reverseRelations: string[] = [];
        for (const [key, relations] of this.documentRelationships) {
            if (relations.includes(documentType) && !directRelations.includes(key)) {
                reverseRelations.push(key);
            }
        }
        return [...directRelations, ...reverseRelations]
            .map(key => this.enrichedContext.has(key) ? key : null)
            .filter(Boolean) as string[];
    }

    addEnrichedContext(key: string, content: string) {
        this.enrichedContext.set(key, content);
        this.clearRelatedCache(key);
    }

    private clearRelatedCache(key: string) {
        const keysToDelete: string[] = [];
        for (const cacheKey of this.contextCache.keys()) {
            if (cacheKey.includes(key)) {
                keysToDelete.push(cacheKey);
            }
        }
        keysToDelete.forEach(k => this.contextCache.delete(k));
    }

    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    getMetrics() {
        return {
            coreContextTokens: this.estimateTokens(this.coreContext),
            enrichedContextCount: this.enrichedContext.size,
            cacheSize: this.contextCache.size,
            maxTokens: this.maxContextTokens
        };
    }

    getContextUtilizationReport(): string {
        const isLargeContext = this.supportsLargeContext();
        const coreTokens = this.estimateTokens(this.coreContext);
        const totalEnrichedTokens = Array.from(this.enrichedContext.values())
            .reduce((sum, content) => sum + this.estimateTokens(content), 0);
        const availableTokens = this.getEffectiveTokenLimit('enriched');
        const totalProjectTokens = coreTokens + totalEnrichedTokens;
        const utilizationPercentage = (totalProjectTokens / this.maxContextTokens) * 100;
        let report = `# Context Manager Performance Report\n\n`;
        report += `- **Core Context Tokens**: ${coreTokens.toLocaleString()}\n`;
        report += `- **Enriched Context Items**: ${this.enrichedContext.size}\n`;
        report += `- **Total Enriched Tokens**: ${totalEnrichedTokens.toLocaleString()}\n`;
        report += `- **Cache Size**: ${this.contextCache.size}\n`;
        report += `- **Max Token Limit**: ${this.maxContextTokens.toLocaleString()}\n`;
        report += `- **Available for Context**: ${availableTokens.toLocaleString()}\n`;
        report += `- **Model Type**: ${isLargeContext ? 'Large Context (>50k)' : 'Standard Context'}\n`;
        report += `- **Context Utilization**: ${utilizationPercentage.toFixed(2)}%\n`;
        report += `- **Cache Efficiency**: ${this.contextCache.size > 0 ? 'Active' : 'Inactive'}\n\n`;
        if (isLargeContext) {
            if (utilizationPercentage < 10) {
                report += `## 🔍 Optimization Recommendations\n`;
                report += `- **Ultra-low utilization**: Consider adding more comprehensive project context\n`;
                report += `- **Potential for enhancement**: Include additional documentation sources\n`;
                report += `- **Large model benefit**: This model can handle ${Math.floor(this.maxContextTokens / 1000)}x more context\n\n`;
            } else if (utilizationPercentage < 30) {
                report += `## ✅ Good Performance\n`;
                report += `- **Moderate utilization**: Good balance of context and efficiency\n`;
                report += `- **Room for growth**: Can include ${Math.floor((this.maxContextTokens - totalProjectTokens) / 1000)}k more tokens\n\n`;
            } else {
                report += `## 🌟 Excellent Utilization\n`;
                report += `- **High utilization**: Making good use of large context capabilities\n`;
                report += `- **Optimal performance**: Well-suited for comprehensive documentation\n\n`;
            }
        }
        return report;
    }

    analyzeDocumentContext(documentType: string): {
        totalTokens: number;
        utilizationPercentage: number;
        includedContexts: string[];
        potentialContexts: string[];
        recommendations: string[];
    } {
        const context = this.buildContextForDocument(documentType);
        const totalTokens = this.estimateTokens(context);
        const utilizationPercentage = (totalTokens / this.maxContextTokens) * 100;
        const relevantContext = this.getRelevantContext(documentType);
        const includedContexts = relevantContext.filter(key => 
            context.includes(`## Related Context: ${key}`) || 
            context.includes(`## Additional Context: ${key}`) ||
            context.includes(`## Supplementary Context: ${key}`)
        );
        const allAvailableContexts = Array.from(this.enrichedContext.keys());
        const potentialContexts = allAvailableContexts.filter(key => 
            !includedContexts.includes(key) && !relevantContext.includes(key)
        );
        const recommendations: string[] = [];
        if (this.supportsLargeContext()) {
            if (utilizationPercentage < 5) {
                recommendations.push("Very low context utilization - consider adding more comprehensive background");
                recommendations.push("Large model can handle much more context for better accuracy");
            }
            if (potentialContexts.length > 0) {
                recommendations.push(`${potentialContexts.length} additional context sources available for inclusion`);
            }
        }
        return {
            totalTokens,
            utilizationPercentage,
            includedContexts,
            potentialContexts,
            recommendations
        };
    }
}

// Version export for tracking
export const contextManagerVersion = '2.1.2';