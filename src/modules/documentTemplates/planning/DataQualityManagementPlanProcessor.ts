import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { DataQualityManagementPlanTemplate } from './DataQualityManagementPlanTemplate.js';

/**
 * Processor for the Data Quality Management Plan document.
 */
export class DataQualityManagementPlanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataQualityManagementPlanTemplate(context);
    const promptContent = template.generateContent();

    const prompt = `Based on the project context, generate a comprehensive Data Quality Management Plan. Use this structure as a reference:\n\n${promptContent}`;

    const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a data management expert specializing in data quality. Generate a comprehensive Data Quality Management Plan.' },
        { role: 'user', content: prompt }
    ]).then(res => typeof res === 'string' ? res : res.content);

    return {
        title: 'Data Quality Management Plan',
        content
    };
  }
}
