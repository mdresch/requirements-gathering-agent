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
    const prompt = WBSTemplate.buildPrompt(context);
    const content = await this.aiProcessor.makeAICall([
      { role: 'system', content: 'You are a senior project manager. Synthesize a hierarchical Work Breakdown Structure (WBS) for the project based on the template and context.' },
      { role: 'user', content: prompt }
    ]).then(res => typeof res === 'string' ? res : res.content);
    return {
      title: 'Work Breakdown Structure (WBS)',
      content
    };
  }
}
