/**
 * Advanced Template Engine for Requirements Gathering Agent
 * 
 * Revolutionary context injection and AI instruction system with database backing.
 * Preserves the brilliant context building and injection architecture while adding
 * dynamic, database-driven template management.
 * 
 * @version 3.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 * 
 * Key Revolutionary Features:
 * - Dynamic context building with dependency resolution
 * - AI instruction templates with variable injection
 * - Large context management and intelligent chunking
 * - Database-backed template versioning and evolution
 * - Cross-document relationship analysis
 * - Context inheritance and composition
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\templates\AdvancedTemplateEngine.ts
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Template, TemplateContext, ContextualAIInstruction, EnhancedTemplate, ContextInjectionPoint, TemplateVariable, ConditionalRule, EnrichmentRule, ValidationRule } from './types/template.types.js';
import { AIProcessor } from '../ai/AIProcessor.js';
import { ContextManager } from '../contextManager.js';
import type { ChatMessage } from '../ai/types.js';
import { TemplateRepository } from '../../repositories/TemplateRepository.js';
import { database } from '../../config/database.js';

export interface ContextDependency {
    documentKey: string;
    required: boolean;
    weight: number; // 0-1, importance in context building
    maxAge?: number; // Cache TTL in milliseconds
    contextTransform?: (content: string) => string;
}

export interface AIInstructionTemplate {
    id: string;
    name: string;
    category: string;
    systemPrompt: string;
    userPromptTemplate: string;
    contextInjectionPoints: ContextInjectionPoint[];
    variables: TemplateVariable[];
    conditionalLogic: ConditionalRule[];
    maxTokens: number;
    temperature: number;
    modelPreferences: string[];
    qualityChecks: QualityCheck[];
    createdAt: Date;
    updatedAt: Date;
    version: string;
    isActive: boolean;
}

export interface QualityCheck {
    name: string;
    type: 'length' | 'keywords' | 'structure' | 'compliance' | 'custom';
    criteria: any;
    weight: number;
}

export interface ContextRepository {
    getDocument(key: string): Promise<string | null>;
    getRelatedDocuments(key: string): Promise<string[]>;
    getDocumentMetadata(key: string): Promise<DocumentMetadata | null>;
    searchDocuments(query: string): Promise<SearchResult[]>;
    cacheContext(key: string, context: string, ttl: number): Promise<void>;
    getCachedContext(key: string): Promise<string | null>;
}

export interface DocumentMetadata {
    key: string;
    title: string;
    category: string;
    lastModified: Date;
    dependencies: string[];
    tags: string[];
    contentHash: string;
    wordCount: number;
    quality: number;
}

export interface SearchResult {
    key: string;
    title: string;
    relevance: number;
    excerpt: string;
}

export class AdvancedTemplateEngine {
    private aiProcessor: AIProcessor;
    private contextManager: ContextManager;
    private contextRepository: ContextRepository;
    private templateRepository: TemplateRepository;
    private templates: Map<string, AIInstructionTemplate> = new Map();
    private contextCache: Map<string, { content: string; timestamp: number; ttl: number }> = new Map();

    constructor(
        contextRepository: ContextRepository,
        aiProcessor?: AIProcessor,
        contextManager?: ContextManager,
        templateRepository?: TemplateRepository
    ) {
        this.contextRepository = contextRepository;
        this.templateRepository = templateRepository || new TemplateRepository(database);
        this.aiProcessor = aiProcessor || AIProcessor.getInstance();
        this.contextManager = contextManager || new ContextManager();
    }

    /**
     * Revolutionary Context Building with Smart Dependency Resolution
     * 
     * This method implements the brilliant context injection architecture
     * but with database backing and intelligent dependency management.
     */
    async buildEnhancedContext(
        templateId: string,
        baseContext: string,
        variables: Record<string, any> = {}
    ): Promise<string> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        let enrichedContext = baseContext;

        // Process each context injection point
        for (const injectionPoint of template.contextInjectionPoints) {
            const contextSegment = await this.buildContextSegment(injectionPoint, variables);
            enrichedContext = enrichedContext.replace(injectionPoint.placeholder, contextSegment);
        }

        // Apply conditional logic
        enrichedContext = await this.applyConditionalLogic(enrichedContext, template.conditionalLogic, variables);

        // Perform final context optimization
        enrichedContext = await this.optimizeContext(enrichedContext, template.maxTokens);

        return enrichedContext;
    }

    /**
     * Build Context Segment with Intelligent Dependency Resolution
     * 
     * This preserves your revolutionary dependency-based context building
     * while adding database-backed dynamic resolution.
     */
    private async buildContextSegment(
        injectionPoint: ContextInjectionPoint,
        variables: Record<string, any>
    ): Promise<string> {
        const contextSegments: { content: string; weight: number }[] = [];

        // Resolve dependencies with intelligent caching
        for (const dependency of injectionPoint.dependencies) {
            const cacheKey = `${dependency.documentKey}_${JSON.stringify(variables)}`;
            let content = await this.getCachedContext(cacheKey);

            if (!content) {
                content = await this.resolveDependency(dependency, variables);
                if (content && dependency.maxAge) {
                    await this.cacheContext(cacheKey, content, dependency.maxAge);
                }
            }

            if (content) {
                // Apply context transformation if specified
                if (dependency.contextTransform) {
                    content = dependency.contextTransform(content);
                }

                contextSegments.push({
                    content,
                    weight: dependency.weight
                });
            } else if (dependency.required) {
                throw new Error(`Required dependency not found: ${dependency.documentKey}`);
            }
        }

        // Apply aggregation strategy
        return await this.aggregateContextSegments(contextSegments, injectionPoint.aggregationStrategy, injectionPoint.maxLength);
    }

    /**
     * Revolutionary Dependency Resolution with Cross-Document Intelligence
     */
    private async resolveDependency(
        dependency: ContextDependency,
        variables: Record<string, any>
    ): Promise<string | null> {
        // First, try direct document retrieval
        let content = await this.contextRepository.getDocument(dependency.documentKey);

        if (!content) {
            // Try semantic search if direct lookup fails
            const searchResults = await this.contextRepository.searchDocuments(dependency.documentKey);
            if (searchResults.length > 0) {
                content = await this.contextRepository.getDocument(searchResults[0].key);
            }
        }

        if (!content) {
            // Try to find related documents
            const relatedDocs = await this.contextRepository.getRelatedDocuments(dependency.documentKey);
            if (relatedDocs.length > 0) {
                const relatedContent = await Promise.all(
                    relatedDocs.slice(0, 3).map(key => this.contextRepository.getDocument(key))
                );
                content = relatedContent.filter(Boolean).join('\n\n---\n\n');
            }
        }

        return content;
    }

    /**
     * Intelligent Context Aggregation with Multiple Strategies
     */
    private async aggregateContextSegments(
        segments: { content: string; weight: number }[],
        strategy: string,
        maxLength?: number
    ): Promise<string> {
        switch (strategy) {
            case 'concatenate':
                return this.concatenateSegments(segments, maxLength);
            
            case 'summarize':
                return await this.summarizeSegments(segments, maxLength);
            
            case 'prioritize':
                return this.prioritizeSegments(segments, maxLength);
            
            case 'template':
                return this.templateAggregation(segments, maxLength);
            
            default:
                return this.concatenateSegments(segments, maxLength);
        }
    }

    /**
     * AI-Powered Context Summarization for Large Context Management
     */
    private async summarizeSegments(
        segments: { content: string; weight: number }[],
        maxLength?: number
    ): Promise<string> {
        const combinedContent = segments
            .sort((a, b) => b.weight - a.weight)
            .map(s => s.content)
            .join('\n\n---\n\n');

        if (!maxLength || combinedContent.length <= maxLength) {
            return combinedContent;
        }        // Use AI to intelligently summarize while preserving key information
        const messages: ChatMessage[] = [
            {
                role: 'system' as const,
                content: 'You are an expert at summarizing project documentation while preserving all critical information and context.'
            },
            {
                role: 'user' as const,
                content: `Summarize the following project documentation, preserving all critical information, key requirements, and important details. Target length: approximately ${maxLength} characters.\n\n${combinedContent}`
            }
        ];

        const response = await this.aiProcessor.makeAICall(messages, Math.min(maxLength * 2, 4000));
        return this.aiProcessor.extractContent(response) || combinedContent.substring(0, maxLength);
    }

    /**
     * Priority-Based Context Assembly
     */
    private prioritizeSegments(
        segments: { content: string; weight: number }[],
        maxLength?: number
    ): Promise<string> {
        const sortedSegments = segments.sort((a, b) => b.weight - a.weight);
        let result = '';
        let currentLength = 0;

        for (const segment of sortedSegments) {
            if (maxLength && currentLength + segment.content.length > maxLength) {
                // Try to fit a truncated version
                const remainingSpace = maxLength - currentLength;
                if (remainingSpace > 100) { // Only include if meaningful space remains
                    result += segment.content.substring(0, remainingSpace - 3) + '...';
                }
                break;
            }
            
            result += (result ? '\n\n---\n\n' : '') + segment.content;
            currentLength = result.length;
        }

        return Promise.resolve(result);
    }

    /**
     * Template-Based Context Assembly
     */
    private templateAggregation(
        segments: { content: string; weight: number }[],
        maxLength?: number
    ): Promise<string> {
        // Create a structured template based on segment weights and content
        const template = `
# Context Overview

## Primary Context (High Priority)
${segments.filter(s => s.weight >= 0.8).map(s => s.content).join('\n\n')}

## Supporting Context (Medium Priority)  
${segments.filter(s => s.weight >= 0.5 && s.weight < 0.8).map(s => s.content).join('\n\n')}

## Additional Context (Low Priority)
${segments.filter(s => s.weight < 0.5).map(s => s.content).join('\n\n')}
`.trim();

        if (maxLength && template.length > maxLength) {
            return this.prioritizeSegments(segments, maxLength);
        }

        return Promise.resolve(template);
    }

    /**
     * Simple concatenation with length management
     */
    private concatenateSegments(
        segments: { content: string; weight: number }[],
        maxLength?: number
    ): Promise<string> {
        const result = segments
            .sort((a, b) => b.weight - a.weight)
            .map(s => s.content)
            .join('\n\n---\n\n');

        if (maxLength && result.length > maxLength) {
            return this.prioritizeSegments(segments, maxLength);
        }

        return Promise.resolve(result);
    }

    /**
     * Apply Conditional Logic to Template Content
     */
    private async applyConditionalLogic(
        content: string,
        rules: ConditionalRule[],
        variables: Record<string, any>
    ): Promise<string> {
        let processedContent = content;

        for (const rule of rules) {
            try {
                // Create a safe evaluation context
                const evalContext = { ...variables, content: processedContent };
                const conditionResult = this.evaluateCondition(rule.condition, evalContext);

                if (conditionResult) {
                    switch (rule.action) {
                        case 'include':
                            // Content already included, no action needed
                            break;
                        case 'exclude':
                            processedContent = this.removeSection(processedContent, rule.target);
                            break;
                        case 'modify':
                            processedContent = this.modifySection(processedContent, rule.target, rule.value);
                            break;
                    }
                }
            } catch (error) {
                console.warn(`Error applying conditional rule: ${rule.condition}`, error);
            }
        }

        return processedContent;
    }

    /**
     * Safe condition evaluation (simplified for security)
     */
    private evaluateCondition(condition: string, context: Record<string, any>): boolean {
        // This is a simplified implementation. In production, use a proper expression evaluator
        // that prevents code injection
        try {
            // Basic variable substitution for common patterns
            let evaluableCondition = condition;
            
            // Replace variable references
            for (const [key, value] of Object.entries(context)) {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                evaluableCondition = evaluableCondition.replace(regex, JSON.stringify(value));
            }

            // Only allow safe operations
            if (!/^[a-zA-Z0-9_.$"\s>=<!=&|()]+$/.test(evaluableCondition)) {
                console.warn('Unsafe condition detected:', condition);
                return false;
            }

            return Function(`"use strict"; return (${evaluableCondition})`)();
        } catch {
            return false;
        }
    }

    /**
     * Context Optimization for Large Context Management
     */
    private async optimizeContext(content: string, maxTokens: number): Promise<string> {
        // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
        const estimatedTokens = content.length / 4;
        
        if (estimatedTokens <= maxTokens) {
            return content;
        }

        // Intelligent truncation while preserving structure
        const targetLength = maxTokens * 4;
        
        // Try to preserve section headers and important content
        const sections = content.split(/\n#{1,6}\s/);
        let optimizedContent = '';
        let currentLength = 0;

        for (const section of sections) {
            if (currentLength + section.length <= targetLength) {
                optimizedContent += (optimizedContent ? '\n# ' : '') + section;
                currentLength = optimizedContent.length;
            } else {
                // Add truncated section if space allows
                const remainingSpace = targetLength - currentLength;
                if (remainingSpace > 200) {
                    optimizedContent += (optimizedContent ? '\n# ' : '') + 
                        section.substring(0, remainingSpace - 100) + '\n\n[Content truncated...]';
                }
                break;
            }
        }

        return optimizedContent;
    }

    /**
     * Generate Document with Revolutionary Context Injection
     * 
     * This is the main method that brings together all the revolutionary features
     */
    async generateDocument(
        templateId: string,
        baseContext: string,
        variables: Record<string, any> = {}
    ): Promise<string> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        // Build enhanced context with dependency resolution
        const enhancedContext = await this.buildEnhancedContext(templateId, baseContext, variables);

        // Process variables in user prompt template
        let userPrompt = template.userPromptTemplate;
        for (const [key, value] of Object.entries(variables)) {
            userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }

        // Replace remaining context placeholders
        userPrompt = userPrompt.replace(/{{ENHANCED_CONTEXT}}/g, enhancedContext);        // Create AI messages
        const messages: ChatMessage[] = [
            { role: 'system' as const, content: template.systemPrompt },
            { role: 'user' as const, content: userPrompt }
        ];

        // Generate content with template preferences
        const response = await this.aiProcessor.makeAICall(messages, template.maxTokens);

        const generatedContent = this.aiProcessor.extractContent(response);
        
        if (!generatedContent) {
            throw new Error('Failed to generate content from AI');
        }

        // Apply quality checks
        await this.performQualityChecks(generatedContent, template.qualityChecks);

        return generatedContent;
    }    /**
     * Template Management Methods
     */
    async saveTemplate(template: AIInstructionTemplate): Promise<void> {
        // Save to in-memory cache for quick access
        this.templates.set(template.id, template);
        
        // Convert AIInstructionTemplate to DatabaseTemplate format and save to database
        try {
            const databaseTemplate = {
                name: template.name,
                description: `AI Instruction Template: ${template.name}`,
                category: template.category || 'General',
                template_type: 'ai_instruction',
                ai_instructions: template.systemPrompt || '',
                prompt_template: template.userPromptTemplate || '',
                generation_function: 'getAiGenericDocument',
                metadata: {
                    id: template.id,
                    variables: template.variables || [],
                    conditionalLogic: template.conditionalLogic || [],
                    contextInjectionPoints: template.contextInjectionPoints || [],
                    maxTokens: template.maxTokens || 4000,
                    temperature: template.temperature || 0.7,
                    modelPreferences: template.modelPreferences || [],
                    qualityChecks: template.qualityChecks || [],
                    emoji: '🤖',
                    priority: 100
                },
                version: parseInt(template.version) || 1,
                is_active: template.isActive !== false,
                is_system: true,
                created_by: 'system'
            };

            await this.templateRepository.createTemplate(databaseTemplate);
            console.log(`Template saved: ${template.id}`);
        } catch (error) {
            console.warn(`Failed to save template to database: ${template.id}`, error);
            // Continue with in-memory storage even if database fails
        }
    }

    async loadTemplate(templateId: string): Promise<AIInstructionTemplate | null> {
        return this.templates.get(templateId) || null;
    }

    async loadAllTemplates(): Promise<AIInstructionTemplate[]> {
        return Array.from(this.templates.values());
    }

    /**
     * Cache Management
     */
    private async getCachedContext(key: string): Promise<string | null> {
        const cached = this.contextCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.content;
        }
        this.contextCache.delete(key);
        return null;
    }

    private async cacheContext(key: string, content: string, ttl: number): Promise<void> {
        this.contextCache.set(key, {
            content,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Utility Methods
     */
    private removeSection(content: string, target: string): string {
        // Remove specified section from content
        const regex = new RegExp(`## ${target}[\\s\\S]*?(?=## |$)`, 'i');
        return content.replace(regex, '');
    }

    private modifySection(content: string, target: string, value: any): string {
        // Modify specified section in content
        const regex = new RegExp(`(## ${target}[\\s\\S]*?)(?=## |$)`, 'i');
        return content.replace(regex, `## ${target}\n${value}\n\n`);
    }

    private async performQualityChecks(content: string, checks: QualityCheck[]): Promise<void> {
        for (const check of checks) {
            // Implement quality checks based on type
            switch (check.type) {
                case 'length':
                    if (content.length < check.criteria.min || content.length > check.criteria.max) {
                        console.warn(`Quality check failed: ${check.name} - Length: ${content.length}`);
                    }
                    break;
                case 'keywords':
                    const hasRequiredKeywords = check.criteria.required.every((keyword: string) =>
                        content.toLowerCase().includes(keyword.toLowerCase())
                    );
                    if (!hasRequiredKeywords) {
                        console.warn(`Quality check failed: ${check.name} - Missing required keywords`);
                    }
                    break;
                // Add more quality check types as needed
            }
        }
    }
}

/**
 * Factory for creating template engine with database repository
 */
export class TemplateEngineFactory {
    static async createWithDatabase(
        databaseConfig: any,
        aiProcessor?: AIProcessor,
        contextManager?: ContextManager
    ): Promise<AdvancedTemplateEngine> {
        // In a real implementation, create database-backed context repository
        const contextRepository = new MockContextRepository();
        return new AdvancedTemplateEngine(contextRepository, aiProcessor, contextManager);
    }
}

/**
 * Mock implementation for development
 */
class MockContextRepository implements ContextRepository {
    private documents = new Map<string, string>();
    private metadata = new Map<string, DocumentMetadata>();

    async getDocument(key: string): Promise<string | null> {
        return this.documents.get(key) || null;
    }

    async getRelatedDocuments(key: string): Promise<string[]> {
        // Mock implementation - in real version, use semantic similarity
        return Array.from(this.documents.keys()).filter(k => k !== key).slice(0, 3);
    }

    async getDocumentMetadata(key: string): Promise<DocumentMetadata | null> {
        return this.metadata.get(key) || null;
    }

    async searchDocuments(query: string): Promise<SearchResult[]> {
        // Mock implementation - in real version, use vector search
        const results: SearchResult[] = [];
        for (const [key, content] of this.documents) {
            if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    key,
                    title: key,
                    relevance: 0.8,
                    excerpt: content.substring(0, 200)
                });
            }
        }
        return results;
    }

    async cacheContext(key: string, context: string, ttl: number): Promise<void> {
        // Mock implementation
    }

    async getCachedContext(key: string): Promise<string | null> {
        // Mock implementation
        return null;
    }
}
