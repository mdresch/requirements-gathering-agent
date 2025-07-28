import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ProgramRiskRegisterTemplate } from '../pppm/ProgramRiskRegisterTemplate.js';

class ExpectedError extends Error {}

/**
 * Program Risk Register Processor
 *
 * Generates a PMO/PMBOK-compliant Program Risk Register using AI-powered synthesis.
 * The scope is broader than a project risk register, covering cross-project, strategic, and enterprise risks.
 */
export class ProgramRiskRegisterProcessor implements DocumentProcessor {
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
          content: `You are a Senior Program Risk Management Professional and PMO Director. Generate a comprehensive, PMO/PMBOK-compliant Program Risk Register by synthesizing information from all available program documents, cross-project dependencies, and organizational context. Focus on strategic, cross-project, and enterprise risks that could impact program objectives, value delivery, or organizational strategy.`
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);

      return {
        title: 'Program Risk Register',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Program Risk Register processing:', error.message);
        throw new Error(`Failed to generate Program Risk Register: ${error.message}`);
      } else {
        console.error('Unexpected error in Program Risk Register processing:', error);
        throw new Error('An unexpected error occurred while generating Program Risk Register');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const template = new ProgramRiskRegisterTemplate(context);
    return template.generateContent();
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (!content.includes('# Program Risk Register')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
    if (!content.includes('Risk ID') || !content.includes('Risk Score')) {
      throw new ExpectedError('Generated content lacks proper risk register table structure');
    }
    if (content.includes('[AI_TO_POPULATE]')) {
      throw new ExpectedError('Generated content contains unfilled placeholders - risk identification incomplete');
    }
  }
}
