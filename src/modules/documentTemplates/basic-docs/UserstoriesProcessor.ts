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
 * Processor for the Userstories document.
 */
export class UserstoriesProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private templateRepository: TemplateRepository;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    this.templateRepository = new TemplateRepository();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = await this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert consultant specializing in basic docs documentation. Generate comprehensive, professional content based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Userstories',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Userstories processing:', error.message);
        throw new Error(`Failed to generate Userstories: ${error.message}`);
      } else {
        console.error('Unexpected error in Userstories processing:', error);
        throw new Error('An unexpected error occurred while generating Userstories');
      }
    }
  }

  private async createPrompt(context: ProjectContext): Promise<string> {
    // Fetch the template from the database
    const templateId = '68cf9f7e0b991a497873ef9d'; // User Stories template ID
    const template = await this.templateRepository.getTemplateById(templateId);
    
    if (!template) {
      throw new ExpectedError('User Stories template not found in database');
    }

    // Get the template content from the database
    // The enhanced template content is stored in templateData.content
    const templateContent = (template as any).templateData?.content || template.prompt_template || '';
    
    if (!templateContent) {
      throw new ExpectedError('Template content is empty in database');
    }

    return `Based on the following project context, generate comprehensive user stories following the template structure provided.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}
- Program: ${context.programName || 'Not specified'}

IMPORTANT: You must follow the EXACT template structure provided below. Replace the template variables with project-specific content, but maintain the exact same structure, sections, and formatting.

Template Structure to Follow:

${templateContent}

Instructions:
1. Replace template variables (like {{projectName}}, {{projectType}}, etc.) with the actual project context provided above
2. Customize the content within each section to be specific to this project
3. Maintain the exact same markdown structure, headers, and formatting
4. Generate realistic and detailed user stories based on the project context
5. Use professional, clear language appropriate for agile development
6. Make the content immediately usable by development teams

Generate the User Stories following this template structure exactly.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains user story specific content
    if (!content.toLowerCase().includes('story') && !content.toLowerCase().includes('user')) {
      throw new ExpectedError('Generated content does not appear to contain user story content');
    }
  }
}
