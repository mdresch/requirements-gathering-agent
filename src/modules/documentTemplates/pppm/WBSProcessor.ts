import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { WBSTemplate } from './WBSTemplate.js';

/**
 * Work Breakdown Structure (WBS) Document Processor
 * Uses AIProcessor to synthesize WBS content from template and context.
 */
export class WBSProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const aiMessages = this.buildAIMessages(context);
      const content = await this.aiProcessor.makeAICall(aiMessages)
        .then(res => typeof res === 'string' ? res : res.content);
      return {
        title: 'Work Breakdown Structure (WBS)',
        content
      };
    } catch (error) {
      console.error('Error generating Work Breakdown Structure (WBS):', error);
      return {
        title: 'Work Breakdown Structure (WBS)',
        content: this.getErrorMessage()
      };
    }
  }

  /**
   * Constructs the AI prompt messages for WBS synthesis.
   */
  private buildAIMessages(context: ProjectContext): import('../../ai/types').ChatMessage[] {
    return [
      {
        role: 'system' as const,
        content: 'You are a senior project manager. Synthesize a hierarchical Work Breakdown Structure (WBS) for the project based on the template and context.'
      },
      {
        role: 'user' as const,
        content: WBSTemplate.buildPrompt(context)
      }
    ];
  }

  /**
   * Returns a user-friendly error message for WBS generation failures.
   */
  private getErrorMessage(): string {
    return 'An error occurred while generating the Work Breakdown Structure (WBS). Please try again or check the logs for details.';
  }
}
