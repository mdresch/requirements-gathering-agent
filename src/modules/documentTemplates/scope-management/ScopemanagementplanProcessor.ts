import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { TemplateRepository } from '../../../repositories/TemplateRepository.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Scope Management Plan document.
 */
export class ScopemanagementplanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private templateRepository: TemplateRepository;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    this.templateRepository = new TemplateRepository();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = await this.createPrompt(context);
      const systemPrompt = 'You are an expert project manager specializing in scope management and PMBOK standards. Generate comprehensive, professional scope management plans based on the project context. Focus on practical implementation guidance, stakeholder engagement, and robust change control processes. Ensure all content follows PMBOK best practices and provides actionable frameworks for scope planning, definition, verification, and control.';
      
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Scope Management Plan',
        content,
        contextData: {
          systemPrompt,
          userPrompt: prompt,
          projectContext: JSON.stringify(context),
          template: await this.getTemplateContent()
        }
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Scope Management Plan processing:', error.message);
        throw new Error(`Failed to generate Scope Management Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Scope Management Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Scope Management Plan');
      }
    }
  }

  private async createPrompt(context: ProjectContext): Promise<string> {
    // Fetch the template from the database
    const templateId = '68cfa8fd8c7ab32ee7fc3a93'; // Scope Management Plan template ID
    const template = await this.templateRepository.getTemplateById(templateId);
    
    if (!template) {
      throw new ExpectedError('Scope Management Plan template not found in database');
    }

    // Get the template content from the database
    // The enhanced template content is stored in templateData.content
    const templateContent = (template as any).templateData?.content || template.prompt_template || '';
    
    if (!templateContent) {
      throw new ExpectedError('Template content is empty in database');
    }

    return `You are an expert project manager specializing in scope management and PMBOK standards. 

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}
- Program: ${context.programName || 'Not specified'}

IMPORTANT: You must follow the EXACT template structure provided below. Replace the template variables with project-specific content, but maintain the exact same structure, sections, and formatting. Do not add new sections or remove existing ones.

Template Structure to Follow:

${templateContent}

Instructions:
1. Replace template variables (like {{projectName}}, {{projectType}}, etc.) with the actual project context provided above
2. Customize the content within each section to be specific to this project
3. Maintain the exact same markdown structure, headers, and formatting
4. Ensure all sections are included and properly filled with project-specific content
5. Use professional, clear language appropriate for project documentation
6. Make the content immediately usable by project teams

Generate the Scope Management Plan following this template structure exactly.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains scope management specific content
    if (!content.toLowerCase().includes('scope')) {
      throw new ExpectedError('Generated content does not appear to contain scope management content');
    }
  }

  private async getTemplateContent(): Promise<string> {
    try {
      const templateId = '68cfa8fd8c7ab32ee7fc3a93'; // Scope Management Plan template ID
      const template = await this.templateRepository.getTemplateById(templateId);
      return (template as any)?.content || '';
    } catch (error) {
      console.warn('Failed to fetch template content for context tracking:', error);
      return '';
    }
  }
}
