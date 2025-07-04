import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { WorkperformanceinformationscopeTemplate } from '../planning/WorkperformanceinformationscopeTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Work Performance Information (Scope) document.
 */
export class WorkperformanceinformationscopeProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert consultant specializing in planning documentation. Generate comprehensive, professional content based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Work Performance Information (Scope)',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Work Performance Information (Scope) processing:', error.message);
        throw new Error(`Failed to generate Work Performance Information (Scope): ${error.message}`);
      } else {
        console.error('Unexpected error in Work Performance Information (Scope) processing:', error);
        throw new Error('An unexpected error occurred while generating Work Performance Information (Scope)');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new WorkperformanceinformationscopeTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Work Performance Information (Scope) document.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Important Instructions:
- Make the content specific to the project context provided
- Ensure the language is professional and appropriate for the document type
- Include practical guidance where applicable
- Focus on what makes this project unique
- Use markdown formatting for proper structure
- Keep content concise but comprehensive`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has some structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }

  getRequiredContext(): string[] {
    return [
      'projectScope',
      'deliverables',
      'workPackages',
      'requirements',
      'stakeholders'
    ];
  }

  getName(): string {
    return 'Work Performance Information (Scope)';
  }

  getDescription(): string {
    return 'Generates a comprehensive Work Performance Information (Scope) document following PMBOK guidelines';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDependencies(): string[] {
    return [];
  }
}
