
import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { getAIProcessor } from '../../ai/AIProcessor.js';
import { TemplateRepository } from '../../../repositories/TemplateRepository.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

export class UserpersonasProcessor {
  private aiProcessor = getAIProcessor();
  private templateRepository: TemplateRepository;

  constructor() {
    this.templateRepository = new TemplateRepository();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = await this.createPrompt(context);
      const messages = [
        { role: "system" as const, content: 'You are an expert business analyst. Generate a set of user personas based on the project context.' },
        { role: "user" as const, content: prompt }
      ];
      const aiResponse = await this.aiProcessor.makeAICall(messages);
      const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
      
      await this.validateOutput(content);
      
      return {
        title: 'User Personas',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in User Personas processing:', error.message);
        throw new Error(`Failed to generate User Personas: ${error.message}`);
      } else {
        console.error('Unexpected error in User Personas processing:', error);
        throw new Error('An unexpected error occurred while generating User Personas');
      }
    }
  }

  private async createPrompt(context: ProjectContext): Promise<string> {
    // Fetch the template from the database
    const templateId = '68cfa0be8c7ab32ee7fc39ef'; // User Personas template ID
    const template = await this.templateRepository.getTemplateById(templateId);
    
    if (!template) {
      throw new ExpectedError('User Personas template not found in database');
    }

    // Get the template content from the database
    // The enhanced template content is stored in templateData.content
    const templateContent = (template as any).templateData?.content || template.prompt_template || '';
    
    if (!templateContent) {
      throw new ExpectedError('Template content is empty in database');
    }

    return `Based on the following project context, generate comprehensive user personas following the template structure provided.

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
4. Generate realistic and detailed user personas based on the project context
5. Use professional, clear language appropriate for business analysis
6. Make the content immediately usable by development teams

Generate the User Personas following this template structure exactly.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains user persona specific content
    if (!content.toLowerCase().includes('persona') && !content.toLowerCase().includes('user')) {
      throw new ExpectedError('Generated content does not appear to contain user persona content');
    }
  }
}
