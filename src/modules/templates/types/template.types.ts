/**
 * Type definitions for the Advanced Template Engine
 * 
 * @version 3.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 */

export interface Template {
    id: string;
    name: string;
    category: string;
    description: string;
    content: string;
    variables: TemplateVariable[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    version: string;
}

export interface EnhancedTemplate extends Template {
    dependencies: string[];
    contextInjectionPoints: ContextInjectionPoint[];
    aiInstructions: ContextualAIInstruction[];
}

export interface TemplateContext {
    baseContext: string;
    variables: Record<string, any>;
    dependencies: Record<string, string>;
    metadata: ContextMetadata;
}

export interface ContextualAIInstruction {
    id: string;
    type: 'system' | 'user' | 'preprocessing';
    content: string;
    contextDependencies: string[];
    conditionalLogic?: ConditionalRule[];
}

export interface ContextMetadata {
    projectType: string;
    industry: string;
    complexity: 'low' | 'medium' | 'high';
    stakeholderCount: number;
    customFields: Record<string, any>;
}

export interface ContextInjectionPoint {
    placeholder: string;
    dependencies: ContextDependency[];
    aggregationStrategy: 'concatenate' | 'summarize' | 'prioritize' | 'template';
    maxLength?: number;
    enrichmentRules?: EnrichmentRule[];
}

export interface ContextDependency {
    documentKey: string;
    required: boolean;
    weight: number;
    maxAge?: number;
    contextTransform?: (content: string) => string;
}

export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    defaultValue?: any;
    required: boolean;
    description: string;
    validation?: ValidationRule;
}

export interface ConditionalRule {
    condition: string;
    action: 'include' | 'exclude' | 'modify';
    target: string;
    value?: any;
}

export interface ValidationRule {
    type: 'regex' | 'range' | 'enum' | 'custom';
    value: any;
    message: string;
}

export interface EnrichmentRule {
    type: 'crossReference' | 'summarize' | 'extract' | 'transform';
    source: string;
    target: string;
    transformation: string;
}
