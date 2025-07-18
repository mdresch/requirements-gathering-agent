// Custom error for expected validation failures
class ExpectedError extends Error {}
import type { ProjectContext } from '../../../index.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';
import { SolutionEvaluationTemplate } from './SolutionEvaluationTemplate.js';

/**
 * SolutionEvaluationProcessor
 * Implements the DocumentProcessor interface for Solution Evaluation documents.
 * Uses AIProcessor for enhanced content, with fallback to the template.
 */
export class SolutionEvaluationProcessor implements DocumentProcessor {
  private aiProcessor = getAIProcessor();
  private template = new SolutionEvaluationTemplate();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a business analysis expert. Generate a comprehensive Solution Evaluation document using BABOK best practices.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      return {
        title: 'Solution Evaluation',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw new Error(`Failed to generate Solution Evaluation: ${error instanceof Error ? error.message : String(error)}`);
      } else {
        // Fallback to static template
        const fallbackContent = this.template.generateContent(context);
        return {
          title: 'Solution Evaluation',
          content: fallbackContent
        };
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const exampleStructure = this.template.generateContent(context);
    return `Based on the following project context, generate a comprehensive Solution Evaluation document.\n\nProject Context:\n- Name: ${context.projectName || 'Untitled Project'}\n- Business Problem: ${context.businessProblem || 'No business problem provided'}\n- Technology Stack: ${(context.technologyStack && context.technologyStack.join(', ')) || 'Not specified'}\n\nUse this structure as a reference (customize for the project):\n\n${exampleStructure}\n\nInstructions:\n- Make the content specific to the project context provided\n- Ensure professional, clear, and actionable language\n- Use markdown formatting for structure\n- Keep content concise but comprehensive.`;
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
