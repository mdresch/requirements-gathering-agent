import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../../index.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { DataIntegrationInteroperabilityStrategyTemplate } from './DataIntegrationInteroperabilityStrategyTemplate.js';

export class DataIntegrationInteroperabilityStrategyProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataIntegrationInteroperabilityStrategyTemplate(context);
    const promptContent = template.generateContent();

    const prompt = `Based on the following project context, generate a comprehensive Data Integration & Interoperability Strategy.

${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content:
          'You are an expert data architect specializing in data integration, interoperability, and DMBOK 2.0. Generate a thorough Data Integration & Interoperability Strategy aligned with modern best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Data Integration & Interoperability Strategy for ${context.projectName}`,
      content: response.content
    };
  }
}
