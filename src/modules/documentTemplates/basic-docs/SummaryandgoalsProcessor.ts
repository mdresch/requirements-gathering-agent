import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { SummaryandgoalsTemplate } from '../basic-docs/SummaryandgoalsTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Summaryandgoals document.
 */
export class SummaryandgoalsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert consultant specializing in basic docs documentation. Generate comprehensive, professional content based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Summaryandgoals',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Summaryandgoals processing:', error.message);
        throw new Error(`Failed to generate Summaryandgoals: ${error.message}`);
      } else {
        console.error('Unexpected error in Summaryandgoals processing:', error);
        throw new Error('An unexpected error occurred while generating Summaryandgoals');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new SummaryandgoalsTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Summaryandgoals document.

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
}
