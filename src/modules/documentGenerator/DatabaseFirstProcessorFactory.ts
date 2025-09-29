/**
 * Database-First Processor Factory
 * 
 * Creates document processors using templates from the database instead of
 * TypeScript files. This ensures the system uses the latest template content
 * and AI instructions from the database.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 */

import { TemplateModel } from '../../models/Template.model.js';
import { AIProcessor } from '../ai/AIProcessor.js';
import type { DocumentProcessor, DocumentOutput } from './types.js';
import type { ProjectContext } from '../ai/types.js';

/**
 * Database-First Document Processor
 * Uses template data from database instead of hardcoded TypeScript files
 */
class DatabaseFirstProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private templateData: any;

  constructor(templateData: any) {
    this.aiProcessor = AIProcessor.getInstance();
    this.templateData = templateData;
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      console.log(`🚀 Database-First Processor: Generating ${this.templateData.name}`);
      console.log(`📋 Using template from database (ID: ${this.templateData._id})`);
      
      // Create prompt using database template content
      const prompt = this.createPromptFromDatabase(context);
      
      // Use AI instructions from database
      const systemPrompt = this.templateData.ai_instructions || 
        'You are a project management expert. Create comprehensive project documentation following best practices.';
      
      console.log(`🤖 AI Instructions from database: ${systemPrompt.substring(0, 100)}...`);
      
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: this.templateData.name,
        content
      };
    } catch (error) {
      console.error(`❌ Database-First Processor error for ${this.templateData.name}:`, error);
      throw new Error(`Failed to generate ${this.templateData.name}: ${error.message}`);
    }
  }

  private createPromptFromDatabase(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    // Use template content from database if available
    const templateContent = this.templateData.content || 
      `Generate a comprehensive ${this.templateData.name} document.`;
    
    // Use prompt template from database if available
    const promptTemplate = this.templateData.prompt_template || 
      `Based on the following project context, generate a comprehensive ${this.templateData.name} document.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create a detailed document that follows best practices and includes all necessary sections.`;

    return `${promptTemplate}

${templateContent}

Make the content specific to the project context provided and use markdown formatting for proper structure.
Focus on creating actionable insights that enable effective project management and success.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    
    if (!content.includes(this.templateData.name)) {
      console.warn(`⚠️ Generated content may not be a valid ${this.templateData.name}`);
    }
  }
}

/**
 * Database-First Processor Factory
 * Creates processors using database templates instead of TypeScript files
 */
export class DatabaseFirstProcessorFactory {
  private static instance: DatabaseFirstProcessorFactory;

  public static getInstance(): DatabaseFirstProcessorFactory {
    if (!DatabaseFirstProcessorFactory.instance) {
      DatabaseFirstProcessorFactory.instance = new DatabaseFirstProcessorFactory();
    }
    return DatabaseFirstProcessorFactory.instance;
  }

  /**
   * Create a processor using template data from the database
   * @param documentKey The document key to look up in the database
   * @returns Promise<DocumentProcessor>
   */
  async createProcessor(documentKey: string): Promise<DocumentProcessor> {
    try {
      console.log(`🔍 Database-First Factory: Looking up template for key: ${documentKey}`);
      
      // First try to find template by exact documentKey
      let template = await TemplateModel.findOne({ 
        documentKey: documentKey,
        is_deleted: false,
        is_active: true 
      });

      // If not found by exact key, try to find by name-based key
      if (!template) {
        console.log(`🔍 Database-First Factory: No exact match for "${documentKey}", trying name-based search...`);
        
        // Try to find by name that would generate this documentKey
        const nameBasedKey = documentKey.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        template = await TemplateModel.findOne({ 
          name: { $regex: new RegExp(nameBasedKey, 'i') },
          is_deleted: false,
          is_active: true 
        });
      }

      // If still not found, try to find any template with similar name
      if (!template) {
        console.log(`🔍 Database-First Factory: No name-based match, trying fuzzy search...`);
        
        // Try fuzzy search for stakeholder-related templates
        if (documentKey.includes('stakeholder')) {
          template = await TemplateModel.findOne({ 
            $or: [
              { name: { $regex: /stakeholder/i } },
              { category: { $regex: /stakeholder/i } },
              { documentKey: { $regex: /stakeholder/i } }
            ],
            is_deleted: false,
            is_active: true 
          });
        }
      }

      // If still not found, try to use mock template data
      if (!template) {
        console.log(`🔍 Database-First Factory: No database template found, using mock template for ${documentKey}`);
        template = this.getMockTemplate(documentKey);
      }

      if (!template) {
        console.warn(`⚠️ No template found (database or mock) for key: ${documentKey}`);
        throw new Error(`No template found for key: ${documentKey}`);
      }

      console.log(`✅ Database-First Factory: Found template "${template.name}" (${template._id ? `ID: ${template._id}` : 'Mock Template'})`);
      console.log(`📊 Template metadata:`, {
        documentKey: template.documentKey,
        category: template.category,
        template_type: template.template_type,
        hasContent: !!(template as any).content,
        hasAIInstructions: !!template.ai_instructions,
        hasPromptTemplate: !!template.prompt_template
      });

      return new DatabaseFirstProcessor(template);
    } catch (error) {
      console.error(`❌ Database-First Factory error for ${documentKey}:`, error);
      throw error;
    }
  }

  /**
   * Get mock template data when database is not available
   * @param documentKey The document key to get mock template for
   * @returns Mock template data or null
   */
  private getMockTemplate(documentKey: string): any {
    const mockTemplates: Record<string, any> = {
      'stakeholder-analysis': {
        _id: 'mock-stakeholder-analysis',
        name: 'Stakeholder Analysis Template',
        description: 'Comprehensive stakeholder identification, analysis, and engagement strategy',
        category: 'Stakeholder Management',
        documentKey: 'stakeholder-analysis',
        template_type: 'system',
        ai_instructions: 'You are a project management expert specializing in stakeholder analysis and engagement strategies. Create comprehensive stakeholder assessments that identify, analyze, and provide actionable engagement strategies. Focus on creating detailed stakeholder profiles, power/interest grids, communication plans, and risk mitigation strategies. Generate content that includes stakeholder identification, assessment matrices, engagement strategies, and monitoring plans.',
        prompt_template: `Based on the following project context, generate a comprehensive Stakeholder Analysis document.

Project Context:
- Name: {{projectName}}
- Type: {{projectType}}
- Description: {{description}}

Create a detailed stakeholder analysis that identifies, assesses, and provides engagement strategies for all project stakeholders.

# Stakeholder Analysis

## Executive Summary
- Purpose and scope of stakeholder analysis
- Key stakeholder insights and recommendations
- Critical engagement priorities

## Stakeholder Identification

### Internal Stakeholders
| Stakeholder | Role/Title | Department | Interest Level | Influence Level |
|-------------|------------|------------|----------------|-----------------|
| [Name/Role] | [Title] | [Dept] | [High/Med/Low] | [High/Med/Low] |

### External Stakeholders
| Stakeholder | Organization | Relationship | Interest Level | Influence Level |
|-------------|--------------|--------------|----------------|-----------------|
| [Name/Role] | [Org] | [Type] | [High/Med/Low] | [High/Med/Low] |

## Stakeholder Assessment

### Power/Interest Grid
**High Power, High Interest (Manage Closely)**
- [Stakeholder 1]: [Brief description and key concerns]
- [Stakeholder 2]: [Brief description and key concerns]

**High Power, Low Interest (Keep Satisfied)**
- [Stakeholder 1]: [Brief description and engagement approach]
- [Stakeholder 2]: [Brief description and engagement approach]

**Low Power, High Interest (Keep Informed)**
- [Stakeholder 1]: [Brief description and information needs]
- [Stakeholder 2]: [Brief description and information needs]

**Low Power, Low Interest (Monitor)**
- [Stakeholder 1]: [Brief description and monitoring approach]
- [Stakeholder 2]: [Brief description and monitoring approach]

## Engagement Strategies

### Communication Plan
| Stakeholder | Frequency | Method | Content Type | Responsible |
|-------------|-----------|--------|--------------|-------------|
| [Name] | [Frequency] | [Method] | [Type] | [Person] |

### Risk Mitigation
**Stakeholder Risks:**
| Risk | Stakeholder | Impact | Probability | Mitigation Strategy |
|------|-------------|--------|-------------|-------------------|
| [Risk] | [Who] | [H/M/L] | [H/M/L] | [Strategy] |

## Recommendations

### Immediate Actions
1. [Action 1]: [Description and timeline]
2. [Action 2]: [Description and timeline]
3. [Action 3]: [Description and timeline]

### Long-term Strategies
1. [Strategy 1]: [Description and implementation approach]
2. [Strategy 2]: [Description and implementation approach]
3. [Strategy 3]: [Description and implementation approach]

Make the content specific to the project context provided and use markdown formatting for proper structure.
Focus on creating actionable insights that enable effective stakeholder engagement and project success.`,
        generation_function: 'generateStakeholderAnalysis',
        contextPriority: 'high',
        version: 1,
        is_active: true,
        is_system: true,
        created_by: 'ADPA-System',
        created_at: new Date(),
        updated_at: new Date(),
        contextRequirements: ['stakeholder information', 'organizational structure', 'project context'],
        is_deleted: false
      },
      'business-case': {
        _id: 'mock-business-case',
        name: 'Business Case Template',
        description: 'Strategic justification and financial analysis for project initiation',
        category: 'Strategic Planning',
        documentKey: 'business-case',
        template_type: 'system',
        ai_instructions: 'Generate a comprehensive business case document following standard business analysis practices. Include executive summary, problem statement, solution overview, financial analysis, and recommendations.',
        prompt_template: `Based on the following project context, generate a comprehensive Business Case document.

Project Context:
- Name: {{projectName}}
- Type: {{projectType}}
- Description: {{description}}

Create a detailed business case that provides strategic justification and financial analysis for project initiation.

# Business Case

## Executive Summary
- Project overview and strategic importance
- Key benefits and value proposition
- Financial summary and ROI

## Problem Statement
- Current situation and challenges
- Business impact of not addressing the problem
- Root causes and contributing factors

## Solution Overview
- Proposed solution description
- How the solution addresses the problem
- Key features and capabilities

## Financial Analysis
- Cost-benefit analysis
- Return on investment (ROI)
- Payback period
- Risk-adjusted financial projections

## Recommendations
- Recommended course of action
- Implementation timeline
- Success criteria and metrics

Make the content specific to the project context provided and use markdown formatting for proper structure.
Focus on creating actionable insights that enable effective business decision-making.`,
        generation_function: 'generateBusinessCase',
        contextPriority: 'critical',
        version: 1,
        is_active: true,
        is_system: true,
        created_by: 'ADPA-System',
        created_at: new Date(),
        updated_at: new Date(),
        contextRequirements: ['business objectives', 'financial data', 'stakeholder input'],
        is_deleted: false
      }
    };

    return mockTemplates[documentKey] || null;
  }

  /**
   * Check if a template exists in the database
   * @param documentKey The document key to check
   * @returns Promise<boolean>
   */
  async templateExists(documentKey: string): Promise<boolean> {
    try {
      const template = await TemplateModel.findOne({ 
        documentKey: documentKey,
        is_deleted: false,
        is_active: true 
      });
      return !!template;
    } catch (error) {
      console.error(`❌ Error checking template existence for ${documentKey}:`, error);
      return false;
    }
  }

  /**
   * Get all available template keys from database
   * @returns Promise<string[]>
   */
  async getAvailableTemplateKeys(): Promise<string[]> {
    try {
      const templates = await TemplateModel.find({ 
        is_deleted: false,
        is_active: true 
      }).select('documentKey name');
      
      return templates.map(t => t.documentKey).filter(key => key);
    } catch (error) {
      console.error('❌ Error getting available template keys:', error);
      return [];
    }
  }
}

/**
 * Main factory function for backward compatibility
 * @param documentKey The document key to create processor for
 * @returns Promise<DocumentProcessor>
 */
export async function createDatabaseFirstProcessor(documentKey: string): Promise<DocumentProcessor> {
  const factory = DatabaseFirstProcessorFactory.getInstance();
  return await factory.createProcessor(documentKey);
}
