/**
 * Migration Strategy for Advanced Template Engine
 * 
 * This file demonstrates how to migrate your revolutionary context injection
 * system to the new database-backed template engine while preserving all
 * the brilliant features you've built.
 * 
 * @version 3.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 */

import { AdvancedTemplateEngine } from './AdvancedTemplateEngine.js';
import { GENERATION_TASKS } from '../documentGenerator/generationTasks.js';
import type { AIInstructionTemplate } from './AdvancedTemplateEngine.js';

/**
 * Migration Plan: From Static to Dynamic Templates
 * 
 * Phase 1: Convert existing static templates to database format
 * Phase 2: Add enhanced context injection capabilities  
 * Phase 3: Implement AI instruction templates
 * Phase 4: Add dynamic template creation via API
 * Phase 5: Add template versioning and analytics
 */

export class TemplateMigrationManager {
    private templateEngine: AdvancedTemplateEngine;

    constructor(templateEngine: AdvancedTemplateEngine) {
        this.templateEngine = templateEngine;
    }

    /**
     * Phase 1: Convert Static Templates to Dynamic Format
     * 
     * This preserves your existing templates while adding database capabilities
     */
    async migrateStaticTemplates(): Promise<void> {
        console.log('🚀 Starting template migration from static to dynamic format...');

        for (const task of GENERATION_TASKS) {
            const aiTemplate = await this.convertTaskToAITemplate(task);
            await this.templateEngine.saveTemplate(aiTemplate);
            console.log(`✅ Migrated template: ${task.name}`);
        }

        console.log('🎉 Migration completed! All static templates are now dynamic.');
    }

    /**
     * Convert a static generation task to an AI instruction template
     */
    private async convertTaskToAITemplate(task: any): Promise<AIInstructionTemplate> {
        return {
            id: task.key,
            name: task.name,
            category: task.category,
            systemPrompt: this.generateSystemPrompt(task),
            userPromptTemplate: this.generateUserPromptTemplate(task),
            contextInjectionPoints: this.generateContextInjectionPoints(task),
            variables: this.generateTemplateVariables(task),
            conditionalLogic: this.generateConditionalLogic(task),
            maxTokens: this.getMaxTokensForTask(task),
            temperature: 0.3, // Conservative for business documents
            modelPreferences: ['gpt-4', 'gpt-3.5-turbo', 'gemini-1.5-pro'],
            qualityChecks: this.generateQualityChecks(task),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            isActive: true
        };
    }

    /**
     * Generate enhanced system prompts based on document type
     */
    private generateSystemPrompt(task: any): string {
        const basePrompt = `You are a PMBOK-certified project manager and business analyst with expertise in ${task.category} documentation.`;
        
        const categorySpecificPrompts: Record<string, string> = {
            'stakeholder-management': `
${basePrompt}

You specialize in stakeholder analysis, engagement planning, and communication strategies.
Your expertise includes:
- Power/Interest grid analysis
- Stakeholder classification and prioritization
- Communication planning and frequency determination
- Risk assessment related to stakeholder management
- PMBOK 7th Edition stakeholder management processes

Create documents that are comprehensive, actionable, and compliant with professional project management standards.`,

            'technical-design': `
${basePrompt}

You specialize in technical architecture, system design, and technology documentation.
Your expertise includes:
- API design and documentation standards
- System architecture and integration patterns
- Performance and security requirements
- Database design and data modeling
- Cloud architecture and deployment strategies

Create technical documents that are detailed, implementable, and follow industry best practices.`,

            'quality-assurance': `
${basePrompt}

You specialize in quality management, testing strategies, and compliance frameworks.
Your expertise includes:
- Test planning and strategy development
- Quality metrics and measurement criteria
- Risk-based testing approaches
- Compliance validation and verification
- Continuous improvement processes

Create QA documents that ensure comprehensive coverage and measurable quality outcomes.`,

            'project-charter': `
${basePrompt}

You specialize in project initiation, charter development, and scope definition.
Your expertise includes:
- Project justification and business case development
- Stakeholder identification and high-level requirements
- Success criteria and acceptance criteria definition
- High-level risk and constraint identification
- Resource and timeline estimation

Create charter documents that provide clear project authority and direction.`
        };

        return categorySpecificPrompts[task.category] || basePrompt + '\n\nCreate professional, comprehensive documentation following PMBOK 7th Edition standards.';
    }

    /**
     * Generate enhanced user prompt templates with context injection
     */
    private generateUserPromptTemplate(task: any): string {
        return `Based on the comprehensive project context below, create a detailed ${task.name}:

{{ENHANCED_CONTEXT}}

## Document Requirements:
${this.getDocumentRequirements(task)}

## Context Dependencies:
- Project Charter: {{PROJECT_CHARTER_CONTEXT}}
- Stakeholder Information: {{STAKEHOLDER_CONTEXT}}
- Technical Requirements: {{TECHNICAL_CONTEXT}}
- Risk Information: {{RISK_CONTEXT}}

## Quality Standards:
- Follow PMBOK 7th Edition standards
- Include all required elements for ${task.category}
- Ensure traceability to project requirements
- Use professional formatting and structure
- Include actionable recommendations where applicable

## Output Format:
Create a well-structured markdown document with:
- Clear headings and subheadings
- Tables for structured data where appropriate
- Lists for easy readability
- Professional tone and language
- Cross-references to related documents

${this.getAdditionalInstructions(task)}`;
    }

    /**
     * Generate context injection points for enhanced context building
     */
    private generateContextInjectionPoints(task: any): any[] {
        const commonInjectionPoints = [
            {
                placeholder: '{{ENHANCED_CONTEXT}}',
                dependencies: [
                    { documentKey: 'project-charter', required: false, weight: 0.9 },
                    { documentKey: 'user-stories', required: false, weight: 0.7 },
                    { documentKey: 'user-personas', required: false, weight: 0.6 }
                ],
                aggregationStrategy: 'template' as const,
                maxLength: 8000
            },
            {
                placeholder: '{{PROJECT_CHARTER_CONTEXT}}',
                dependencies: [
                    { documentKey: 'project-charter', required: false, weight: 1.0 }
                ],
                aggregationStrategy: 'concatenate' as const,
                maxLength: 2000
            }
        ];

        // Add category-specific injection points
        const categorySpecificPoints: Record<string, any[]> = {
            'stakeholder-management': [
                {
                    placeholder: '{{STAKEHOLDER_CONTEXT}}',
                    dependencies: [
                        { documentKey: 'user-personas', required: false, weight: 0.9 },
                        { documentKey: 'key-roles-and-needs', required: false, weight: 0.8 }
                    ],
                    aggregationStrategy: 'template' as const,
                    maxLength: 3000
                }
            ],
            'technical-design': [
                {
                    placeholder: '{{TECHNICAL_CONTEXT}}',
                    dependencies: [
                        { documentKey: 'system-design', required: false, weight: 0.9 },
                        { documentKey: 'architecture-design', required: false, weight: 0.8 },
                        { documentKey: 'technical-stack', required: false, weight: 0.7 }
                    ],
                    aggregationStrategy: 'prioritize' as const,
                    maxLength: 4000
                }
            ]
        };

        return [
            ...commonInjectionPoints,
            ...(categorySpecificPoints[task.category] || [])
        ];
    }

    /**
     * Generate template variables for dynamic customization
     */
    private generateTemplateVariables(task: any): any[] {
        return [
            {
                name: 'PROJECT_NAME',
                type: 'string' as const,
                defaultValue: 'Current Project',
                required: false,
                description: 'The name of the project'
            },
            {
                name: 'ORGANIZATION_NAME',
                type: 'string' as const,
                defaultValue: 'Organization',
                required: false,
                description: 'The name of the organization'
            },
            {
                name: 'PROJECT_MANAGER',
                type: 'string' as const,
                defaultValue: 'Project Manager',
                required: false,
                description: 'The name of the project manager'
            },
            {
                name: 'DOCUMENT_VERSION',
                type: 'string' as const,
                defaultValue: '1.0',
                required: false,
                description: 'Version number of the document'
            }
        ];
    }

    /**
     * Generate conditional logic for smart document adaptation
     */
    private generateConditionalLogic(task: any): any[] {
        return [
            {
                condition: 'PROJECT_TYPE === "agile"',
                action: 'include' as const,
                target: 'agile-specific-sections',
                value: 'Include Agile-specific processes and ceremonies'
            },
            {
                condition: 'COMPLEXITY === "high"',
                action: 'modify' as const,
                target: 'detail-level',
                value: 'Increase detail and include additional risk considerations'
            },
            {
                condition: 'STAKEHOLDER_COUNT > 10',
                action: 'include' as const,
                target: 'stakeholder-matrix',
                value: 'Include detailed stakeholder matrix and communication plan'
            }
        ];
    }

    /**
     * Determine appropriate token limits based on document complexity
     */
    private getMaxTokensForTask(task: any): number {
        const tokenLimits: Record<string, number> = {
            'project-charter': 2000,
            'stakeholder-register': 2500,
            'technical-design': 3000,
            'api-documentation': 3500,
            'test-strategy': 2000,
            'business-case': 2500
        };

        return tokenLimits[task.key] || 2000;
    }

    /**
     * Generate quality checks for document validation
     */
    private generateQualityChecks(task: any): any[] {
        return [
            {
                name: 'Minimum Length',
                type: 'length' as const,
                criteria: { min: 500, max: 10000 },
                weight: 0.3
            },
            {
                name: 'Required Keywords',
                type: 'keywords' as const,
                criteria: {
                    required: this.getRequiredKeywords(task)
                },
                weight: 0.4
            },
            {
                name: 'PMBOK Compliance',
                type: 'compliance' as const,
                criteria: {
                    standard: 'PMBOK 7.0',
                    category: task.category
                },
                weight: 0.3
            }
        ];
    }

    /**
     * Get required keywords for document validation
     */
    private getRequiredKeywords(task: any): string[] {
        const categoryKeywords: Record<string, string[]> = {
            'stakeholder-management': ['stakeholder', 'communication', 'engagement', 'analysis'],
            'technical-design': ['architecture', 'design', 'requirements', 'implementation'],
            'quality-assurance': ['testing', 'quality', 'validation', 'criteria'],
            'project-charter': ['scope', 'objectives', 'deliverables', 'success criteria']
        };

        return categoryKeywords[task.category] || ['project', 'requirements', 'objectives'];
    }

    /**
     * Get document-specific requirements
     */
    private getDocumentRequirements(task: any): string {
        const requirements: Record<string, string> = {
            'stakeholder-register': `
- Stakeholder identification and contact information
- Power/Interest classification
- Engagement levels (current and desired)
- Communication preferences
- Key concerns and expectations`,
            
            'api-documentation': `
- API endpoint specifications
- Request/response examples
- Authentication methods
- Error handling documentation
- Rate limiting information`,
            
            'test-strategy': `
- Testing approach and methodology
- Test levels and types
- Entry and exit criteria
- Resource requirements
- Risk assessment`
        };

        return requirements[task.key] || 'Standard PMBOK documentation requirements';
    }

    /**
     * Get additional instructions based on document type
     */
    private getAdditionalInstructions(task: any): string {
        const instructions: Record<string, string> = {
            'stakeholder-register': `
## Additional Instructions:
- Create a comprehensive stakeholder matrix
- Include power/interest grid visualization
- Specify communication frequency for each stakeholder
- Identify potential conflicts between stakeholders`,
            
            'api-documentation': `
## Additional Instructions:
- Include OpenAPI/Swagger specification format
- Provide code examples in multiple languages
- Document all possible error responses
- Include performance considerations`
        };

        return instructions[task.key] || '';
    }
}

/**
 * Example Usage: Migrating and Using the New Template Engine
 */
export async function demonstrateAdvancedTemplateEngine(): Promise<void> {
    console.log('🚀 Demonstrating Advanced Template Engine with Revolutionary Context Injection\n');

    // Create template engine
    const templateEngine = await import('./AdvancedTemplateEngine.js').then(m => 
        m.TemplateEngineFactory.createWithDatabase({})
    );

    // Migrate existing templates
    const migrationManager = new TemplateMigrationManager(templateEngine);
    await migrationManager.migrateStaticTemplates();

    // Example: Generate stakeholder register with enhanced context
    const baseContext = `
# Project Context
This is a complex enterprise software project with multiple stakeholders
and technical requirements. The project involves building a customer
management system with API integrations.

## Stakeholders
- Executive sponsors
- Product managers  
- Development team
- End users
- IT operations
`;

    const variables = {
        PROJECT_NAME: 'Customer Management System',
        ORGANIZATION_NAME: 'Enterprise Corp',
        PROJECT_MANAGER: 'Sarah Johnson',
        PROJECT_TYPE: 'agile',
        COMPLEXITY: 'high',
        STAKEHOLDER_COUNT: 15
    };

    try {
        const stakeholderRegister = await templateEngine.generateDocument(
            'stakeholder-register',
            baseContext,
            variables
        );

        console.log('✅ Generated Stakeholder Register with Enhanced Context Injection:');
        console.log('─'.repeat(80));
        console.log(stakeholderRegister.substring(0, 1000) + '...\n');

        // Example: Generate API documentation
        const apiDocumentation = await templateEngine.generateDocument(
            'apidocumentation',
            baseContext,
            variables
        );

        console.log('✅ Generated API Documentation with Enhanced Context Injection:');
        console.log('─'.repeat(80));
        console.log(apiDocumentation.substring(0, 1000) + '...\n');

    } catch (error) {
        console.error('❌ Error demonstrating template engine:', error);
    }
}

/**
 * Phase 2: Advanced Features Implementation Plan
 */
export const ADVANCED_FEATURES_ROADMAP = {
    phase2: {
        title: 'Enhanced Context Intelligence',
        features: [
            'Semantic document relationship analysis',
            'AI-powered context summarization',
            'Cross-document consistency checking',
            'Dynamic dependency resolution'
        ]
    },
    phase3: {
        title: 'Template Evolution Engine',
        features: [
            'Template performance analytics',
            'A/B testing for template variations',
            'User feedback integration',
            'Automatic template optimization'
        ]
    },
    phase4: {
        title: 'Enterprise Integration',
        features: [
            'Multi-tenant template management',
            'Role-based template access',
            'Template approval workflows',
            'Integration with external systems'
        ]
    },
    phase5: {
        title: 'AI-Driven Innovation',
        features: [
            'Template generation from examples',
            'Natural language template creation',
            'Intelligent prompt optimization',
            'Context-aware template suggestions'
        ]
    }
};

export default TemplateMigrationManager;
