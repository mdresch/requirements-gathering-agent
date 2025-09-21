import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { AIProcessor } from '../../ai/AIProcessor.js';
import { DatabaseTemplateService } from '../../../services/DatabaseTemplateService.js';
import { logger } from '../../../utils/logger.js';
import { BusinesscaseTemplate } from './BusinesscaseTemplate.js';

/**
 * Enhanced Business Case Processor
 * 
 * This processor can use both database templates and hardcoded templates,
 * providing a seamless transition and fallback mechanism.
 */
export class EnhancedBusinesscaseProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private templateService: DatabaseTemplateService;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    this.templateService = DatabaseTemplateService.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      logger.info('🚀 Starting enhanced business case generation...');

      // Try to get template from database first
      const dbTemplate = await this.getDatabaseTemplate();
      
      let prompt: string;
      let systemPrompt: string;

      if (dbTemplate) {
        logger.info('📋 Using database template for business case generation');
        prompt = this.createPromptFromDatabaseTemplate(context, dbTemplate);
        systemPrompt = this.createSystemPromptFromDatabaseTemplate(dbTemplate);
      } else {
        logger.info('📋 Using hardcoded template for business case generation (fallback)');
        prompt = this.createPromptFromHardcodedTemplate(context);
        systemPrompt = this.createSystemPromptFromHardcodedTemplate();
      }

      // Generate content using AI
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      // Validate and clean output
      await this.validateOutput(content);
      
      logger.info('✅ Business case generation completed successfully');

      return {
        title: 'Business Case',
        content: this.cleanContent(content)
      };
    } catch (error) {
      logger.error('❌ Error in enhanced business case generation:', error);
      throw new Error(`Business case generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get database template for business case
   */
  private async getDatabaseTemplate(): Promise<any | null> {
    try {
      // Try multiple possible identifiers for business case template
      const possibleIdentifiers = [
        'business-case',
        'business_case',
        'Business Case',
        'BusinessCase',
        'businesscase'
      ];

      for (const identifier of possibleIdentifiers) {
        const template = await this.templateService.getTemplate(identifier);
        if (template) {
          logger.debug(`✅ Found database template with identifier: ${identifier}`);
          return template;
        }
      }

      // If no exact match, search by category
      const templates = await this.templateService.searchTemplates({
        category: 'strategic-statements',
        namePattern: 'business',
        limit: 5
      });

      if (templates.length > 0) {
        logger.debug(`✅ Found ${templates.length} business-related templates, using first one`);
        return templates[0];
      }

      return null;
    } catch (error) {
      logger.error('❌ Error fetching database template:', error);
      return null;
    }
  }

  /**
   * Create prompt from database template
   */
  private createPromptFromDatabaseTemplate(context: ProjectContext, dbTemplate: any): string {
    const templateContent = dbTemplate.prompt_template || '';
    const aiInstructions = dbTemplate.ai_instructions || '';
    
    // Replace placeholders in template with context data
    let prompt = templateContent
      .replace(/\{\{projectName\}\}/g, context.projectName || 'Project')
      .replace(/\{\{projectDescription\}\}/g, (context as any).projectDescription || context.description || '')
      .replace(/\{\{businessObjective\}\}/g, (context as any).businessObjective || '')
      .replace(/\{\{stakeholders\}\}/g, this.formatStakeholders((context as any).stakeholders))
      .replace(/\{\{budget\}\}/g, (context as any).budget || 'TBD')
      .replace(/\{\{timeline\}\}/g, (context as any).timeline || 'TBD')
      .replace(/\{\{risks\}\}/g, this.formatRisks((context as any).risks));

    // Add AI instructions if available
    if (aiInstructions) {
      prompt = `${aiInstructions}\n\n${prompt}`;
    }

    // Add context information
    prompt += `\n\n## Project Context\n`;
    prompt += `**Project Name:** ${context.projectName || 'Not specified'}\n`;
    prompt += `**Project Description:** ${(context as any).projectDescription || context.description || 'Not specified'}\n`;
    prompt += `**Business Objective:** ${(context as any).businessObjective || 'Not specified'}\n`;
    prompt += `**Framework:** ${(context as any).framework || 'Not specified'}\n`;
    
    if ((context as any).stakeholders && (context as any).stakeholders.length > 0) {
      prompt += `**Key Stakeholders:** ${(context as any).stakeholders.join(', ')}\n`;
    }
    
    if ((context as any).budget) {
      prompt += `**Budget:** ${(context as any).budget}\n`;
    }
    
    if ((context as any).timeline) {
      prompt += `**Timeline:** ${(context as any).timeline}\n`;
    }

    return prompt;
  }

  /**
   * Create system prompt from database template
   */
  private createSystemPromptFromDatabaseTemplate(dbTemplate: any): string {
    const aiInstructions = dbTemplate.ai_instructions || '';
    
    if (aiInstructions) {
      return `${aiInstructions}\n\nRemove all instructional comments and placeholders from the final output.`;
    }

    // Fallback to default system prompt
    return this.createSystemPromptFromHardcodedTemplate();
  }

  /**
   * Create prompt from hardcoded template (fallback)
   */
  private createPromptFromHardcodedTemplate(context: ProjectContext): string {
    const template = new BusinesscaseTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the comprehensive project context below, generate a professional, investment-grade Business Case document. This document will be presented to senior executives for funding approval.

## Project Context:
- **Project Name:** ${context.projectName || 'Not specified'}
- **Project Description:** ${(context as any).projectDescription || context.description || 'Not specified'}
- **Business Objective:** ${(context as any).businessObjective || 'Not specified'}
- **Framework:** ${(context as any).framework || 'Not specified'}
- **Stakeholders:** ${(context as any).stakeholders?.join(', ') || 'Not specified'}
- **Budget:** ${(context as any).budget || 'TBD'}
- **Timeline:** ${(context as any).timeline || 'TBD'}
- **Risks:** ${(context as any).risks?.join(', ') || 'None identified'}

## Template Structure Reference:
${exampleStructure}

## Critical Instructions:
1. **Executive Focus:** Write for senior executives who need to make funding decisions
2. **Data-Driven:** Include specific metrics, costs, and benefits where possible
3. **Professional Tone:** Use formal business language appropriate for executive presentation
4. **Clear Structure:** Follow the template structure but adapt content to the specific project
5. **Actionable:** Include clear next steps and approval requirements

Generate the complete Business Case document now:`;
  }

  /**
   * Create system prompt from hardcoded template (fallback)
   */
  private createSystemPromptFromHardcodedTemplate(): string {
    return `You are an expert Management Consultant and acting Chief Financial Officer (CFO). Your core competency is building compelling, data-driven business cases to secure executive approval for high-impact projects.

Your expertise includes:
- Financial modeling and ROI analysis
- Risk assessment and mitigation strategies
- Executive communication and presentation
- Business case development and validation
- Strategic alignment and value proposition development

Remove all instructional comments and placeholders from the final output.`;
  }

  /**
   * Format stakeholders for display
   */
  private formatStakeholders(stakeholders: string[] | undefined): string {
    if (!stakeholders || stakeholders.length === 0) {
      return 'Not specified';
    }
    return stakeholders.join(', ');
  }

  /**
   * Format risks for display
   */
  private formatRisks(risks: string[] | undefined): string {
    if (!risks || risks.length === 0) {
      return 'None identified';
    }
    return risks.join(', ');
  }

  /**
   * Clean and validate the generated content
   */
  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }

    if (content.length < 500) {
      logger.warn('⚠️ Generated business case is quite short, may need more detail');
    }

    // Check for placeholder text that wasn't replaced
    const placeholders = content.match(/\{\{[^}]+\}\}/g);
    if (placeholders && placeholders.length > 0) {
      logger.warn(`⚠️ Found unreplaced placeholders: ${placeholders.join(', ')}`);
    }
  }

  /**
   * Clean the generated content
   */
  private cleanContent(content: string): string {
    // Remove any remaining instructional text
    let cleaned = content
      .replace(/\*\[Instruction:[^\]]+\]\*/g, '')
      .replace(/\*\[Instruction:[^\*]+\*/g, '')
      .replace(/\[Instruction:[^\]]+\]/g, '')
      .replace(/Instruction:[^\n]+\n/g, '')
      .trim();

    // Ensure proper markdown formatting
    cleaned = cleaned
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s*\n/gm, '') // Remove empty lines at start of lines
      .trim();

    return cleaned;
  }
}

export default EnhancedBusinesscaseProcessor;
