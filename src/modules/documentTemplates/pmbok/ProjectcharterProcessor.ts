import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ProjectcharterTemplate } from '../pmbok/ProjectcharterTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Projectcharter document.
 */
export class ProjectcharterProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      
      // Use enhanced messages with few-shot learning examples
      const { getFewShotExamples, formatExamplesForPrompt } = await import('../../ai/few-shot-examples.js');
      const examples = getFewShotExamples('project-charter');
      const selectedExamples = examples.slice(0, 1); // Use one example to avoid token limits
      
      let systemPrompt = 'You are an expert consultant specializing in PMBOK documentation. Generate comprehensive, professional content based on the project context following PMBOK 7th Edition standards.';
      
      if (selectedExamples.length > 0) {
        systemPrompt += `\n\nStudy this example of a high-quality project charter and follow its structure and level of detail:\n\n${formatExamplesForPrompt(selectedExamples)}`;
      }
      
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], 3000).then(res => typeof res === 'string' ? res : res.content); // Increased token limit

      await this.validateOutput(content);
      
      return {
        title: 'Projectcharter',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Projectcharter processing:', error.message);
        throw new Error(`Failed to generate Projectcharter: ${error.message}`);
      } else {
        console.error('Unexpected error in Projectcharter processing:', error);
        throw new Error('An unexpected error occurred while generating Projectcharter');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ProjectcharterTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Projectcharter document.

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
