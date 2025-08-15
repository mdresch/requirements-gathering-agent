/**
 * Prompt Manager for AI Document Generation
 * 
 * Manages prompt selection, context building, and prompt customization
 * for tailored AI content generation across different document types.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * Key Features:
 * - Intelligent prompt selection based on document type
 * - Context-aware prompt building
 * - Dynamic prompt customization
 * - Performance optimization and caching
 * 
 * @filepath src/modules/ai/prompts/PromptManager.ts
 */

import { PromptRegistry, PromptTemplate, PromptContext } from './PromptRegistry.js';
import { ChatMessage } from '../types.js';

export interface PromptSelectionCriteria {
    /** Document type to generate */
    documentType: string;
    /** Category preference */
    category?: string;
    /** Required tags */
    requiredTags?: string[];
    /** Preferred tags for scoring */
    preferredTags?: string[];
    /** Maximum tokens allowed */
    maxTokens?: number;
    /** Priority threshold */
    minPriority?: number;
}

export interface PromptBuildOptions {
    /** Include enhanced context from related documents */
    includeRelatedContext?: boolean;
    /** Maximum context length */
    maxContextLength?: number;
    /** Custom context variables */
    customVariables?: Record<string, string>;
    /** Override default structure instructions */
    customStructure?: string;
    /** Override default quality criteria */
    customQuality?: string;
}

export interface PromptMetrics {
    /** Prompt selection time in milliseconds */
    selectionTime: number;
    /** Context building time in milliseconds */
    contextBuildTime: number;
    /** Final prompt length in characters */
    promptLength: number;
    /** Number of context sources used */
    contextSources: number;
    /** Prompt template version used */
    templateVersion: string;
}

/**
 * Manages AI prompt selection, building, and optimization
 */
export class PromptManager {
    private static instance: PromptManager;
    private promptRegistry: PromptRegistry;
    private contextCache: Map<string, any> = new Map();
    private promptMetrics: Map<string, PromptMetrics> = new Map();

    private constructor() {
        this.promptRegistry = PromptRegistry.getInstance();
    }

    public static getInstance(): PromptManager {
        if (!PromptManager.instance) {
            PromptManager.instance = new PromptManager();
        }
        return PromptManager.instance;
    }

    /**
     * Build complete prompt for document generation
     */
    public async buildPromptForDocument(
        documentType: string,
        projectContext: string,
        options: PromptBuildOptions = {}
    ): Promise<{ messages: ChatMessage[]; metrics: PromptMetrics } | null> {
        const startTime = Date.now();
        
        try {
            // Select appropriate prompt template
            const template = await this.selectPromptTemplate({
                documentType,
                maxTokens: options.maxContextLength
            });

            if (!template) {
                console.warn(`No prompt template found for document type: ${documentType}`);
                return null;
            }

            // Build context
            const contextStartTime = Date.now();
            const context = await this.buildPromptContext(
                documentType,
                projectContext,
                options
            );
            const contextBuildTime = Date.now() - contextStartTime;

            // Build final prompt
            const promptResult = this.promptRegistry.buildPrompt(template.id, context);
            if (!promptResult) {
                console.warn(`Failed to build prompt for template: ${template.id}`);
                return null;
            }

            // Create messages
            const messages: ChatMessage[] = [
                { role: 'system', content: promptResult.systemPrompt },
                { role: 'user', content: promptResult.userPrompt }
            ];

            // Calculate metrics
            const totalTime = Date.now() - startTime;
            const metrics: PromptMetrics = {
                selectionTime: totalTime - contextBuildTime,
                contextBuildTime,
                promptLength: promptResult.systemPrompt.length + promptResult.userPrompt.length,
                contextSources: this.countContextSources(context),
                templateVersion: template.version
            };

            // Cache metrics for analysis
            this.promptMetrics.set(`${documentType}-${Date.now()}`, metrics);

            return { messages, metrics };

        } catch (error) {
            console.error(`Error building prompt for document type ${documentType}:`, error);
            return null;
        }
    }

    /**
     * Select the best prompt template for given criteria
     */
    public async selectPromptTemplate(criteria: PromptSelectionCriteria): Promise<PromptTemplate | null> {
        // First try exact document type match
        let template = this.promptRegistry.getPromptByDocumentType(criteria.documentType);
        if (template) {
            return template;
        }

        // Try category-based selection
        if (criteria.category) {
            const categoryPrompts = this.promptRegistry.getPromptsByCategory(criteria.category);
            if (categoryPrompts.length > 0) {
                return this.selectBestPromptFromCandidates(categoryPrompts, criteria);
            }
        }

        // Try tag-based selection
        if (criteria.requiredTags && criteria.requiredTags.length > 0) {
            const tagPrompts = this.promptRegistry.searchPromptsByTags(criteria.requiredTags);
            if (tagPrompts.length > 0) {
                return this.selectBestPromptFromCandidates(tagPrompts, criteria);
            }
        }

        // Fallback to generic prompt if available
        return this.getGenericPromptForDocumentType(criteria.documentType);
    }

    /**
     * Build comprehensive context for prompt
     */
    private async buildPromptContext(
        documentType: string,
        projectContext: string,
        options: PromptBuildOptions
    ): Promise<PromptContext> {
        const context: PromptContext = {
            projectContext
        };

        // Add related documents context if requested
        if (options.includeRelatedContext) {
            context.relatedDocuments = await this.getRelatedDocumentsContext(documentType);
        }

        // Add stakeholder context
        context.stakeholders = await this.getStakeholderContext(projectContext);

        // Add business domain context
        context.businessDomain = await this.getBusinessDomainContext(projectContext);

        // Add technical context
        context.technicalContext = await this.getTechnicalContext(projectContext);

        // Apply custom variables
        if (options.customVariables) {
            Object.assign(context, options.customVariables);
        }

        return context;
    }

    /**
     * Select best prompt from candidates based on criteria
     */
    private selectBestPromptFromCandidates(
        candidates: PromptTemplate[],
        criteria: PromptSelectionCriteria
    ): PromptTemplate | null {
        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];

        // Score each candidate
        const scoredCandidates = candidates.map(candidate => ({
            template: candidate,
            score: this.scorePromptTemplate(candidate, criteria)
        }));

        // Sort by score (highest first)
        scoredCandidates.sort((a, b) => b.score - a.score);

        return scoredCandidates[0].template;
    }

    /**
     * Score a prompt template based on selection criteria
     */
    private scorePromptTemplate(template: PromptTemplate, criteria: PromptSelectionCriteria): number {
        let score = 0;

        // Document type exact match (highest priority)
        if (template.documentType === criteria.documentType) {
            score += 100;
        }

        // Category match
        if (criteria.category && template.category === criteria.category) {
            score += 50;
        }

        // Required tags match
        if (criteria.requiredTags) {
            const matchedRequiredTags = criteria.requiredTags.filter(tag => 
                template.tags.includes(tag)
            ).length;
            score += matchedRequiredTags * 20;
        }

        // Preferred tags match
        if (criteria.preferredTags) {
            const matchedPreferredTags = criteria.preferredTags.filter(tag => 
                template.tags.includes(tag)
            ).length;
            score += matchedPreferredTags * 10;
        }

        // Priority score
        score += template.priority * 5;

        // Token limit compliance
        if (criteria.maxTokens && template.maxTokens <= criteria.maxTokens) {
            score += 15;
        }

        // Recency bonus (newer templates get slight preference)
        const daysSinceUpdate = (Date.now() - template.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30) {
            score += 5;
        }

        return score;
    }

    /**
     * Get generic prompt for document type as fallback
     */
    private getGenericPromptForDocumentType(documentType: string): PromptTemplate | null {
        // Create a basic generic prompt template
        return {
            id: `generic-${documentType}`,
            documentType,
            category: 'generic',
            systemPrompt: `You are an expert business analyst and technical writer. Create comprehensive, professional documentation that follows industry best practices and standards.`,
            userPromptTemplate: `Based on the project context below, create a detailed {{documentType}} document:

Project Context:
{{projectContext}}

Ensure your document is:
- Well-structured and professionally formatted
- Comprehensive and actionable
- Aligned with industry best practices
- Tailored to the specific project needs
- Clear and easy to understand`,
            structureInstructions: 'Structure your document with clear sections, headings, and logical flow.',
            qualityCriteria: 'Ensure high quality, accuracy, and professional presentation.',
            maxTokens: 2000,
            priority: 1,
            tags: ['generic'],
            version: '1.0.0',
            lastUpdated: new Date()
        };
    }

    /**
     * Get related documents context
     */
    private async getRelatedDocumentsContext(documentType: string): Promise<string[]> {
        // This would integrate with the context manager to get related documents
        // For now, return empty array
        return [];
    }

    /**
     * Extract stakeholder context from project context
     */
    private async getStakeholderContext(projectContext: string): Promise<string> {
        // Extract stakeholder information from project context
        const stakeholderKeywords = ['stakeholder', 'user', 'customer', 'sponsor', 'team', 'role'];
        const lines = projectContext.split('\n');
        const stakeholderLines = lines.filter(line => 
            stakeholderKeywords.some(keyword => 
                line.toLowerCase().includes(keyword)
            )
        );
        
        return stakeholderLines.join('\n');
    }

    /**
     * Extract business domain context
     */
    private async getBusinessDomainContext(projectContext: string): Promise<string> {
        // Extract business domain information
        const businessKeywords = ['business', 'domain', 'industry', 'market', 'customer', 'revenue'];
        const lines = projectContext.split('\n');
        const businessLines = lines.filter(line => 
            businessKeywords.some(keyword => 
                line.toLowerCase().includes(keyword)
            )
        );
        
        return businessLines.join('\n');
    }

    /**
     * Extract technical context
     */
    private async getTechnicalContext(projectContext: string): Promise<string> {
        // Extract technical information
        const techKeywords = ['technology', 'technical', 'system', 'architecture', 'platform', 'api', 'database'];
        const lines = projectContext.split('\n');
        const techLines = lines.filter(line => 
            techKeywords.some(keyword => 
                line.toLowerCase().includes(keyword)
            )
        );
        
        return techLines.join('\n');
    }

    /**
     * Count context sources used
     */
    private countContextSources(context: PromptContext): number {
        let count = 0;
        if (context.projectContext) count++;
        if (context.documentContext) count++;
        if (context.relatedDocuments && context.relatedDocuments.length > 0) count++;
        if (context.stakeholders) count++;
        if (context.businessDomain) count++;
        if (context.technicalContext) count++;
        return count;
    }

    /**
     * Get prompt performance metrics
     */
    public getPromptMetrics(documentType?: string): PromptMetrics[] {
        if (documentType) {
            return Array.from(this.promptMetrics.entries())
                .filter(([key]) => key.startsWith(documentType))
                .map(([, metrics]) => metrics);
        }
        return Array.from(this.promptMetrics.values());
    }

    /**
     * Clear metrics cache
     */
    public clearMetrics(): void {
        this.promptMetrics.clear();
    }

    /**
     * Get available document types
     */
    public getAvailableDocumentTypes(): string[] {
        const categories = this.promptRegistry.getCategories();
        const documentTypes: string[] = [];
        
        for (const category of categories) {
            const prompts = this.promptRegistry.getPromptsByCategory(category);
            for (const prompt of prompts) {
                if (!documentTypes.includes(prompt.documentType)) {
                    documentTypes.push(prompt.documentType);
                }
            }
        }
        
        return documentTypes.sort();
    }

    /**
     * Validate prompt template
     */
    public validatePromptTemplate(template: PromptTemplate): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!template.id) errors.push('Template ID is required');
        if (!template.documentType) errors.push('Document type is required');
        if (!template.category) errors.push('Category is required');
        if (!template.systemPrompt) errors.push('System prompt is required');
        if (!template.userPromptTemplate) errors.push('User prompt template is required');
        if (template.maxTokens <= 0) errors.push('Max tokens must be positive');
        if (template.priority < 0) errors.push('Priority must be non-negative');

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}