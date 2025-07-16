import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { MasterDataManagementStrategyTemplate } from './MasterDataManagementStrategyTemplate.js';

export class MasterDataManagementStrategyProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new MasterDataManagementStrategyTemplate(context);
    const promptContent = template.generateContent();

    const prompt = `Based on the following project context, generate a comprehensive Master Data Management (MDM) Strategy.\n\n${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a data management expert specializing in Master Data Management. Generate a comprehensive MDM Strategy document.' },
        { role: 'user', content: prompt },
    ]);

    return {
        title: `Master Data Management (MDM) Strategy for ${context.projectName}`,
        content: response.content,
    };
  }
}
