import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { ProjectStatusReportTemplate } from './ProjectStatusReportTemplate.js';

/**
 * Project Status Report Document Processor
 * Uses AIProcessor to synthesize status report content from template and context.
 */
export class ProjectStatusReportProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const prompt = ProjectStatusReportTemplate.buildPrompt(context);
    const content = await this.aiProcessor.makeAICall([
      { role: 'system', content: 'You are a senior project manager. Synthesize a comprehensive Project Status Report based on the template and context.' },
      { role: 'user', content: prompt }
    ]).then(res => typeof res === 'string' ? res : res.content);
    return {
      title: 'Project Status Report',
      content
    };
  }
}
