import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { DataGovernancePlanTemplate } from './DataGovernancePlanTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Data Governance Plan document.
 */
export class DataGovernancePlanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a data governance expert. Generate a comprehensive Data Governance Plan based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      return {
        title: 'Data Governance Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Data Governance Plan processing:', error.message);
        throw new Error(`Failed to generate Data Governance Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Data Governance Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Data Governance Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const template = new DataGovernancePlanTemplate(context);
    const exampleStructure = template.generateContent();
    return `Based on the following project context, generate a comprehensive Data Governance Plan.\n\nProject Context:\n- Name: ${context.projectName || 'Untitled Project'}\n- Type: ${context.projectType || 'Not specified'}\n- Description: ${context.description || 'No description provided'}\n\nUse this structure as a reference (but customize the content for the specific project):\n\n${exampleStructure}\n\nImportant Instructions:\n- Make the content specific to the project context provided\n- Ensure the language is professional and appropriate for the document type\n- Include practical guidance where applicable\n- Use markdown formatting for proper structure\n- Keep content concise but comprehensive`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}
