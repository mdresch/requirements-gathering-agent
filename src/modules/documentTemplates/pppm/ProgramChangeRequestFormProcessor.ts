import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { ProgramChangeRequestFormTemplate } from './ProgramChangeRequestFormTemplate.js';

class ExpectedError extends Error {}

/**
 * Program Change Request Form Processor
 *
 * Generates a PMO/PMBOK-compliant Program Change Request Form using AI-powered synthesis.
 * The scope is program-level, covering changes that impact multiple projects or program objectives.
 */
export class ProgramChangeRequestFormProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        {
          role: 'system',
          content: `You are a Senior Program Manager and PMO Director. Generate a comprehensive, PMO/PMBOK-compliant Program Change Request Form by synthesizing information from all available program documents, cross-project dependencies, and organizational context. Focus on changes that could impact program objectives, value delivery, or cross-project dependencies.`
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);

      return {
        title: 'Program Change Request Form',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Program Change Request Form processing:', error.message);
        throw new Error(`Failed to generate Program Change Request Form: ${error.message}`);
      } else {
        console.error('Unexpected error in Program Change Request Form processing:', error);
        throw new Error('An unexpected error occurred while generating Program Change Request Form');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const template = new ProgramChangeRequestFormTemplate(context);
    return template.generateContent();
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (!content.includes('# Program Change Request Form')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
    if (!content.includes('Change Request ID')) {
      throw new ExpectedError('Generated content lacks proper change request structure');
    }
  }
}
