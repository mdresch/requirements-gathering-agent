/**
 * Enhanced Context Manager Module for Requirements Gathering Agent
 * 
 * Provides advanced context management capabilities including project analysis integration,
 * AI-powered content enhancement, and comprehensive document context building.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Enhanced project context creation with multi-source integration
 * - AI-powered content analysis and enhancement
 * - Intelligent content prioritization and relevance scoring
 * - Context validation and consistency checking
 * - Large context handling with token management
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\contextManager.ts
 */

import { AIProcessor } from './ai/AIProcessor.js';
import { findRelevantMarkdownFiles } from './projectAnalyzer.js';
import { readFileSync } from 'fs';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ContextWindowValidationService } from '../services/ContextWindowValidationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the ProjectMarkdownFile type locally to avoid circular dependencies
interface ProjectMarkdownFile {
    fileName: string;
    filePath: string;
    content: string;
    relevanceScore: number;
    category: 'primary' | 'documentation' | 'planning' | 'development' | 'other';
}

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
    /**
     * Static accessor for compliance findings for a given document key
     * Returns an array of findings (criteria, recommendation, severity, etc.)
     */
    public static async getComplianceFindings(documentKey: string): Promise<any[]> {
        // Use singleton instance to access findings
        const instance = ContextManager.getInstance();
        // Ensure findings are loaded
        if (!instance.complianceFindings || instance.complianceFindings.length === 0) {
            await instance.parseComplianceReviewReports();
        }
        // Filter findings for the requested document key
        return instance.complianceFindings.filter(f => f.document === documentKey);
    }
    /**
     * Applies compliance findings to a document's context, auto-flagging and inserting recommendations
     * Returns improved context string
     */
    public async applyComplianceImprovements(documentType: string, context: string): Promise<string> {
        // Ensure findings are loaded
        if (this.complianceFindings.length === 0) {
            await this.parseComplianceReviewReports();
        }
        // Filter findings relevant to this document type
        const findings = this.complianceFindings.filter(f => f.document === documentType);
        if (findings.length === 0) return context;

        let improvedContext = context;
        let improvementSummary = `\n\n---\n## Compliance-Driven Improvements (Auto-Generated)\n`;
        for (const finding of findings) {
            // Auto-flag section (simple: prepend note)
            const flagNote = `\n> ⚠️ Compliance Issue: ${finding.criteria}\n> Recommendation: ${finding.recommendation}\n> Severity: ${finding.severity}\n> Source: ${path.basename(finding.sourceFile)} (${finding.date})\n`;
            // Insert flag at top of context (could be improved to target section)
            improvedContext = flagNote + improvedContext;
            improvementSummary += `- [${finding.criteria}] ${finding.recommendation} (Severity: ${finding.severity})\n`;
        }
        // Append summary of improvements
        improvedContext += improvementSummary;
        return improvedContext;
    }
    private static instance: ContextManager | null = null;
    private maxContextTokens: number;
    private coreContext: string = '';
    public enrichedContext: Map<string, string> = new Map();
    private contextCache: Map<string, string> = new Map();
    private documentRelationships: Map<string, string[]> = new Map();
    private modelTokenLimits: Map<string, number> = new Map();
    private autoConfigDone: boolean = false;
    private contextWindowValidator: ContextWindowValidationService;

        /**
         * Stores parsed compliance findings for use in auto-improvement
         */
        private complianceFindings: Array<{
            document: string;
            criteria: string;
            recommendation: string;
            affectedSection: string;
            severity: string;
            score?: string;
            sourceFile: string;
            date: string;
        }> = [];

    constructor(maxTokens: number = 4000) {
        this.maxContextTokens = maxTokens;
        this.contextWindowValidator = ContextWindowValidationService.getInstance();
        this.initializeDocumentRelationships();
        this.initializeModelTokenLimits();
        // Auto-adjust based on current AI provider and model
        this.autoAdjustTokenLimits();
            // Optionally, parse compliance findings at startup
            // this.parseComplianceReviewReports();
    }

        /**
         * Parses compliance review markdown files and extracts actionable findings
         * Stores results in this.complianceFindings
         */
        public async parseComplianceReviewReports(reportDir: string = 'generated-documents/compliance-reports'): Promise<void> {
            const reportPath = path.resolve(reportDir);
            let files: string[] = [];
            try {
                files = await fs.readdir(reportPath);
            } catch (err) {
                console.warn('No compliance review directory found:', reportPath);
                return;
            }
            for (const file of files) {
                if (!file.endsWith('.md')) continue;
                const filePath = path.join(reportPath, file);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    // Extract document name
                    const docMatch = content.match(/\*\*Document:\*\*\s*(.+)/);
                    const document = docMatch ? docMatch[1].trim() : file.replace('-compliance.md', '');
                    // Extract validation date
                    const dateMatch = content.match(/\*\*Validation Date:\*\*\s*(.+)/);
                    const date = dateMatch ? dateMatch[1].trim() : '';
                    // Extract compliance score
                    const scoreMatch = content.match(/\*\*Compliance Score:\*\*\s*(.+)/);
                    const score = scoreMatch ? scoreMatch[1].trim() : '';
                    // Extract failed criteria and recommendations
                    const findingsRegex = /- \*\*([\w\s'-]+)\*\*\s*\n\s*- Severity: ([A-Z]+)\n\s*- Impact: ([A-Z]+)\n\s*- Remediation: ([^\n]+)(?:\n\s*- Timeline: ([^\n]+))?/g;
                    let match;
                    while ((match = findingsRegex.exec(content)) !== null) {
                        this.complianceFindings.push({
                            document,
                            criteria: match[1].trim(),
                            recommendation: match[4].trim(),
                            affectedSection: '', // Can be improved by section mapping
                            severity: match[2].trim(),
                            score,
                            sourceFile: filePath,
                            date
                        });
                        console.log(`✅ Compliance finding added: [${document}] ${match[1].trim()} (Severity: ${match[2].trim()}, Source: ${filePath})`);
                    }
                } catch (err) {
                    console.warn('Could not parse compliance report:', filePath, err);
                }
            }
        }
    
    /**
     * Get singleton instance of ContextManager
     */
    public static getInstance(): ContextManager {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager();
        }
        return ContextManager.instance;
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
            const currentModel = ''; // Legacy function no longer available
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

    public supportsLargeContext(): boolean {
        return this.maxContextTokens > 50000;
    }

    public getEffectiveTokenLimit(operation: 'core' | 'enriched' | 'full'): number {
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
        
        // Load relationships from processor-config.json using ESM-compatible path resolution
    const configPath = path.resolve(process.cwd(), 'processor-config.json');
        let processorConfigRaw = '{}';
        try {
            processorConfigRaw = readFileSync(configPath, 'utf-8');
        } catch (e) {
            console.warn('Could not read processor-config.json:', e);
        }
        let processorConfig: Record<string, any> = {};
        try {
            processorConfig = JSON.parse(processorConfigRaw);
        } catch (e) {
            console.warn('Could not parse processor-config.json:', e);
        }
        Object.keys(processorConfig).forEach(key => {
            if (key !== 'lastSetup') {
                const entry = processorConfig[key];
                if (entry && entry.dependencies && Array.isArray(entry.dependencies)) {
                    this.documentRelationships.set(key, entry.dependencies);
                } else {
                    this.documentRelationships.set(key, []);
                }
            }
        });
        
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

    /**
     * Validate context window availability before building context
     */
    async validateContextWindowBeforeBuild(documentType: string, additionalContext?: string[]): Promise<boolean> {
        try {
            // Estimate token requirements for this document type
            const estimatedTokens = this.estimateTokens(this.coreContext);
            const additionalTokens = additionalContext ? 
                additionalContext.reduce((sum, ctx) => sum + this.estimateTokens(ctx), 0) : 0;
            const totalEstimatedTokens = estimatedTokens + additionalTokens;

            // Determine document complexity
            const complexity = this.determineDocumentComplexity(documentType);

            // Validate context window
            const validation = await this.contextWindowValidator.validateBeforeGeneration(
                documentType,
                totalEstimatedTokens,
                undefined
            );

            if (!validation.isValid) {
                console.error(`❌ Context window validation failed for ${documentType}:`);
                console.error(`  - ${validation.reason}`);
                if (validation.recommendations) {
                    console.log(`💡 Recommendations:`);
                    validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
                }
                return false;
            }

            if (validation.recommendations && validation.recommendations.length > 0) {
                console.warn(`⚠️ Context window recommendations for ${documentType}:`);
                validation.recommendations.forEach(rec => console.warn(`  - ${rec}`));
            }

            console.log(`✅ Context window validation passed for ${documentType}: ${validation.availableTokens} tokens available`);
            return true;

        } catch (error) {
            console.error(`❌ Error validating context window for ${documentType}:`, error);
            return false;
        }
    }

    /**
     * Determine document complexity based on document type
     */
    private determineDocumentComplexity(documentType: string): 'low' | 'medium' | 'high' | 'very-high' {
        const complexityMap: Record<string, 'low' | 'medium' | 'high' | 'very-high'> = {
            'user-stories': 'low',
            'acceptance-criteria': 'low',
            'project-charter': 'medium',
            'risk-register': 'medium',
            'stakeholder-register': 'medium',
            'requirements-specification': 'high',
            'technical-specification': 'high',
            'architecture-document': 'high',
            'benefits-realization-plan': 'high',
            'strategic-business-case': 'high',
            'comprehensive-project-plan': 'very-high',
            'detailed-analysis-report': 'very-high'
        };
        
        return complexityMap[documentType] || 'medium';
    }

    buildContextForDocument(documentType: string, additionalContext?: string[]): string {
            const cacheKey = `${documentType}_${this.hashString(this.coreContext)}_${additionalContext?.join('|') || ''}`;
            if (this.contextCache.has(cacheKey)) {
                return this.contextCache.get(cacheKey)!;
            }

            let context = this.coreContext;
            const isLargeContext = this.supportsLargeContext();
            let remainingTokens = this.getEffectiveTokenLimit('enriched') - this.estimateTokens(context);

            // --- NEW: Load dependencies from processor-config.json and prioritize them ---
            let processorConfig;
            try {
                const configPath = path.resolve(process.cwd(), 'processor-config.json');
                const configRaw = readFileSync(configPath, 'utf-8');
                processorConfig = JSON.parse(configRaw);
            } catch (err) {
                processorConfig = {};
            }
            let dependencyKeys: string[] = [];
            if (processorConfig[documentType] && Array.isArray(processorConfig[documentType].dependencies)) {
                dependencyKeys = processorConfig[documentType].dependencies.map((dep: string) => dep.trim());
            }
            // Prioritize dependencies (just below user-modified docs)
            for (const depKey of dependencyKeys) {
                if (this.enrichedContext.has(depKey)) {
                    const depContent = this.enrichedContext.get(depKey)!;
                    const depTokens = this.estimateTokens(depContent);
                    if (depTokens <= remainingTokens - 1000) {
                        context += `\n\n## 🔗 PRIORITY DEPENDENCY: ${depKey}\n${depContent}`;
                        remainingTokens -= depTokens;
                    }
                }
            }
        
        // HIGHEST PRIORITY: Add existing generated documents first
        const existingDocsKeys = Array.from(this.enrichedContext.keys())
            .filter(key => key.startsWith('PRIORITY-EXISTING-'))
            .sort(); // Sort to ensure consistent ordering
        
        console.log(`🎯 Processing ${existingDocsKeys.length} existing documents as priority context`);
        
        for (const contextKey of existingDocsKeys) {
            const contextPart = this.enrichedContext.get(contextKey)!;
            const tokens = this.estimateTokens(contextPart);
            if (tokens <= remainingTokens - 1000) { // Reserve some tokens for other context
                context += `\n\n## 🔥 PRIORITY CONTEXT (User Modified): ${contextKey.replace('PRIORITY-EXISTING-', '')}\n${contextPart}`;
                remainingTokens -= tokens;
                console.log(`✅ Added priority context: ${contextKey}`);
            } else {
                console.log(`⚠️ Skipping priority context due to token limit: ${contextKey}`);
            }
        }
        
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
        }        return {
            totalTokens,
            utilizationPercentage,
            includedContexts,
            potentialContexts,
            recommendations
        };
    }

    /**
     * Centralized compliance scoring logic
     * If PII or Financial data is detected in project design, require corresponding compliance document in compliance folder
     * Returns compliance score for the project or document set
     */
    public async getCentralizedComplianceScore(): Promise<{score: string, missing: string[]}> {
        // Example: scan enrichedContext for PII/Financial keywords
        const sensitiveTypes = ["PII", "Personal Data", "Financial", "Finance", "Payment", "Bank", "SSN", "Credit Card"];
        let detected: string[] = [];
        for (const [key, content] of this.enrichedContext.entries()) {
            for (const type of sensitiveTypes) {
                if (content.toLowerCase().includes(type.toLowerCase())) {
                    detected.push(type);
                }
            }
        }
        // Map detected types to required compliance docs
        const requiredDocs = [];
        if (detected.some(t => ["PII", "Personal Data"].includes(t))) requiredDocs.push("gdpr-compliance-template.md");
        if (detected.some(t => ["Financial", "Finance", "Payment", "Bank", "SSN", "Credit Card"].includes(t))) requiredDocs.push("sox-compliance-template.md");
        // Check compliance folder for required docs
        const complianceFolder = path.resolve("generated-documents/compliance");
        let missing: string[] = [];
        for (const doc of requiredDocs) {
            if (!fsSync.existsSync(path.join(complianceFolder, doc))) {
                missing.push(doc);
            }
        }
        let score = missing.length === 0 ? "Compliant" : `Missing: ${missing.join(", ")}`;
        return {score, missing};
    }

    /**
     * Direct Context Injection - Automatically discovers and injects high-relevance markdown files
     * @param projectPath - The root directory of the project to analyze
     * @param minRelevanceScore - Minimum relevance score for injection (default: 75)
     * @param maxFiles - Maximum number of files to inject (default: 10)
     * @returns Promise<number> - Number of files successfully injected
     */
    async injectHighRelevanceMarkdownFiles(
        projectPath: string, 
        minRelevanceScore: number = 75, 
        maxFiles: number = 10
    ): Promise<number> {
        try {
            console.log(`🔍 Discovering high-relevance markdown files (score >= ${minRelevanceScore})...`);
            
            // Discover markdown files using projectAnalyzer
            const markdownFiles = await findRelevantMarkdownFiles(projectPath);
            
            // Filter by relevance score and limit count
            const highRelevanceFiles = markdownFiles
                .filter(file => file.relevanceScore >= minRelevanceScore)
                .slice(0, maxFiles);
            
            if (highRelevanceFiles.length === 0) {
                console.log('ℹ️ No high-relevance markdown files found for injection');
                return 0;
            }
            
            console.log(`📄 Found ${highRelevanceFiles.length} high-relevance files for injection:`);
            
            let injectedCount = 0;
            const enrichedTokenLimit = this.getEffectiveTokenLimit('enriched');
            let currentTokens = this.estimateTokens(this.coreContext);
            
            for (const file of highRelevanceFiles) {
                const contextKey = `injected-${file.category}-${path.basename(file.fileName, '.md')}`;
                const fileTokens = this.estimateTokens(file.content);
                
                // Check if we have enough token budget remaining
                if (currentTokens + fileTokens > enrichedTokenLimit) {
                    console.log(`⚠️ Token limit reached, stopping injection at ${injectedCount} files`);
                    break;
                }
                
                // Create enriched context entry with metadata
                const enrichedContent = this.formatInjectedContent(file);
                this.enrichedContext.set(contextKey, enrichedContent);
                
                console.log(`✅ Injected: ${file.fileName} (score: ${file.relevanceScore}, tokens: ~${fileTokens})`);
                injectedCount++;
                currentTokens += fileTokens;
            }
            
            console.log(`🎯 Successfully injected ${injectedCount} high-relevance markdown files`);
            return injectedCount;
            
        } catch (error) {
            console.error('❌ Error during direct context injection:', error);
            return 0;
        }
    }

    /**
     * Inject specific markdown files by file paths
     * @param filePaths - Array of absolute file paths to inject
     * @param projectRoot - Project root directory for relative path calculation
     * @returns Promise<number> - Number of files successfully injected
     */
    async injectSpecificMarkdownFiles(filePaths: string[], projectRoot: string): Promise<number> {
        try {
            console.log(`🎯 Injecting ${filePaths.length} specific markdown files...`);
            
            let injectedCount = 0;
            const enrichedTokenLimit = this.getEffectiveTokenLimit('enriched');
            let currentTokens = this.estimateTokens(this.coreContext);
            
            for (const filePath of filePaths) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const fileName = path.basename(filePath);
                    const relativePath = path.relative(projectRoot, filePath);
                    
                    // Skip if file is too small or is README
                    if (content.length < 50 || fileName.toLowerCase() === 'readme.md') {
                        continue;
                    }
                    
                    const fileTokens = this.estimateTokens(content);
                    
                    // Check token budget
                    if (currentTokens + fileTokens > enrichedTokenLimit) {
                        console.log(`⚠️ Token limit reached, stopping injection at ${injectedCount} files`);
                        break;
                    }
                    
                    const contextKey = `injected-specific-${path.basename(fileName, '.md')}`;
                    const enrichedContent = `## Injected File: ${relativePath}\n\n${content}`;
                    
                    this.enrichedContext.set(contextKey, enrichedContent);
                    
                    console.log(`✅ Injected: ${fileName} (tokens: ~${fileTokens})`);
                    injectedCount++;
                    currentTokens += fileTokens;
                    
                } catch (error) {
                    console.warn(`⚠️ Could not inject file ${filePath}:`, error);
                }
            }
            
            console.log(`🎯 Successfully injected ${injectedCount} specific markdown files`);
            return injectedCount;
            
        } catch (error) {
            console.error('❌ Error during specific file injection:', error);
            return 0;
        }
    }

    /**
     * Format injected markdown content with metadata
     * @param file - ProjectMarkdownFile to format
     * @returns Formatted content string
     */
    private formatInjectedContent(file: ProjectMarkdownFile): string {
        return `## Injected Document: ${file.fileName}
**Source**: ${file.filePath}
**Category**: ${file.category}
**Relevance Score**: ${file.relevanceScore}/100

${file.content}`;
    }

    /**
     * Get statistics about injected content
     * @returns Object with injection statistics
     */
    getInjectionStatistics(): {
        totalInjected: number;
        injectedKeys: string[];
        totalTokensInjected: number;
        remainingTokenBudget: number;
    } {
        const injectedKeys = Array.from(this.enrichedContext.keys())
            .filter(key => key.startsWith('injected-'));
        
        const totalTokensInjected = injectedKeys.reduce((total, key) => {
            const content = this.enrichedContext.get(key) || '';
            return total + this.estimateTokens(content);
        }, 0);
        
        const enrichedTokenLimit = this.getEffectiveTokenLimit('enriched');
        const currentTokens = this.estimateTokens(this.coreContext);
        const remainingTokenBudget = enrichedTokenLimit - currentTokens - totalTokensInjected;
        
        return {
            totalInjected: injectedKeys.length,
            injectedKeys,
            totalTokensInjected,
            remainingTokenBudget: Math.max(0, remainingTokenBudget)
        };
    }

    /**
     * Clear all injected context
     */
    clearInjectedContext(): void {
        const injectedKeys = Array.from(this.enrichedContext.keys())
            .filter(key => key.startsWith('injected-'));
        
        for (const key of injectedKeys) {
            this.enrichedContext.delete(key);
        }
        
        console.log(`🧹 Cleared ${injectedKeys.length} injected context entries`);
    }

    private autoAdjustConfig() {
        // Use current model name to adjust config
        if (!this.autoConfigDone) {
            const currentModel = ''; // Legacy function no longer available

            // Set base token limits
            let tokenLimit = 4000;
            let documentTokensMax = 800;

            // Adjust for different model capabilities
            if (currentModel.includes('gemini')) {
                tokenLimit = currentModel.includes('pro') ? 2000000 : 1000000; // 2M or 1M tokens
                documentTokensMax = Math.floor(tokenLimit * 0.4);
            } else if (currentModel.includes('gpt-4')) {
                tokenLimit = currentModel.includes('32k') ? 32000 : 8000;
                documentTokensMax = Math.floor(tokenLimit * 0.3);
            }

            // Set adjusted values (values returned by autoAdjustConfig)
            return {
                tokenLimit,
                documentTokensMax
            };
        }

        this.autoConfigDone = true;
        return null; // Config already done
    }

    /**
     * Loads existing generated documents as highest priority context
     * This ensures manual edits and existing content are respected by the LLM
     */
    async loadExistingGeneratedDocuments(generatedDocsPath: string = 'generated-documents'): Promise<void> {
        try {
            console.log('🔍 Scanning for existing generated documents...');
            
            // Check if generated-documents directory exists
            const docsPath = path.resolve(generatedDocsPath);
            try {
                await fs.access(docsPath);
            } catch {
                console.log('📁 No generated-documents directory found, skipping existing docs injection');
                return;
            }
            
            const existingDocs = await this.scanGeneratedDocuments(docsPath);
            
            if (existingDocs.length === 0) {
                console.log('📄 No existing generated documents found');
                return;
            }
            
            console.log(`📚 Found ${existingDocs.length} existing generated documents`);
            
            // Add each document as highest priority context
            for (const doc of existingDocs) {
                const contextKey = `PRIORITY-EXISTING-${doc.category}-${doc.name}`;
                const contextContent = `
# EXISTING DOCUMENT (USER MODIFIED) - HIGHEST PRIORITY
**Document:** ${doc.name}
**Category:** ${doc.category}
**Path:** ${doc.filePath}
**Last Modified:** ${doc.lastModified}

⚠️ **IMPORTANT**: This document may contain manual user modifications. 
When generating similar documents, prioritize consistency with this content and respect user changes.

## Content:
${doc.content}
                `.trim();
                
                // Add with highest priority prefix to ensure it's used first
                this.enrichedContext.set(contextKey, contextContent);
                    console.log(`✅ Priority context added: [${doc.name}] (Category: ${doc.category}, Path: ${doc.filePath})`);
            }
            
            console.log('🎯 Existing generated documents loaded as highest priority context');
            
        } catch (error) {
            console.warn('⚠️ Failed to load existing generated documents:', error);
            // Don't throw - allow system to continue
        }
    }
    
    /**
     * Recursively scans the generated-documents directory for existing documents
     */
    private async scanGeneratedDocuments(docsPath: string): Promise<Array<{
        name: string;
        category: string;
        filePath: string;
        content: string;
        lastModified: Date;
    }>> {
        const documents: Array<{
            name: string;
            category: string;
            filePath: string;
            content: string;
            lastModified: Date;
        }> = [];
        
        const scanDirectory = async (dirPath: string, category: string = 'general'): Promise<void> => {
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    
                    if (entry.isDirectory()) {
                        // Recursively scan subdirectories
                        await scanDirectory(fullPath, entry.name);
                    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
                        try {
                            const content = await fs.readFile(fullPath, 'utf-8');
                            const stats = await fs.stat(fullPath);
                            
                            // Only include documents that look like they were generated by this tool
                            if (content.includes('Generated by Requirements Gathering Agent') || 
                                content.includes('PMBOK') ||
                                content.length > 100) { // Basic content length check
                                
                                documents.push({
                                    name: entry.name.replace('.md', ''),
                                    category: category,
                                    filePath: fullPath,
                                    content: content,
                                    lastModified: stats.mtime
                                });
                            }
                        } catch (error) {
                            console.warn(`⚠️ Could not read document: ${fullPath}`, error);
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Could not scan directory: ${dirPath}`, error);
            }
        };
        
        await scanDirectory(docsPath);
        
        // Sort by last modified (newest first) to prioritize recent changes
        documents.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        
        return documents;
    }

    /**
     * Integrate centralized compliance score into document generation workflow
     * Call this before finalizing or publishing documents
     * Notifies user in console logs
     */
    public async validateComplianceBeforePublish(documentType: string): Promise<void> {
        const { score, missing } = await this.getCentralizedComplianceScore();
        if (score !== "Compliant") {
            console.warn(`⚠️ Compliance check failed for ${documentType}: ${score}`);
            console.warn(`Please add the following compliance documents to 'generated-documents/compliance': ${missing.join(", ")}`);
            // Optionally, throw error or halt publish
            throw new Error(`Compliance requirements not met. Missing: ${missing.join(", ")}`);
        } else {
            console.log(`✅ Compliance check passed for ${documentType}. All required compliance documents are present.`);
        }
    }
}

// Version export for tracking
export const contextManagerVersion = '2.1.2';

// Export missing functions required by llmProcessor.ts
export async function createAISummary(text: string, maxTokens: number): Promise<string | null> {
    try {
        const messages = createMessages(
            "You are an expert technical writer. Create a comprehensive but concise summary of the following project information, preserving all key technical details, requirements, and business context.",
            `Please summarize this project information in approximately ${maxTokens} tokens while preserving all essential details:\n\n${text}`
        );
        
        const response = await makeAICall(messages, maxTokens);
        return extractContent(response);
    } catch (error) {
        console.error('Error creating AI summary:', error);
        return null;
    }
}

export function analyzeDocumentContextUtilization(documentType: string): any {
    // Create a default context manager instance for analysis
    const contextManager = new ContextManager();
    return contextManager.analyzeDocumentContext(documentType);
}

export function addProjectContext(key: string, content: string): void {
    // This is a utility function that would normally add to a global context manager
    // For now, just log the addition
    console.log(`Adding project context: ${key}`);
}

// Enhanced Context Manager type for compatibility
export type EnhancedContextManager = ContextManager;