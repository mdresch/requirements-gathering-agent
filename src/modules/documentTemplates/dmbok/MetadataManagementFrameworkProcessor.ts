import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../../index.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { MetadataManagementFrameworkTemplate } from './MetadataManagementFrameworkTemplate.js';

export class MetadataManagementFrameworkProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new MetadataManagementFrameworkTemplate(context);
    const promptContent = template.generateContent();

    const prompt = `Based on the following project context, generate a comprehensive Metadata Management Framework.

${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content:
          'You are an expert data management consultant specializing in DMBOK 2.0. Generate a thorough Metadata Management Framework aligned with DMBOK best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Metadata Management Framework for ${context.projectName}`,
      content: response.content
    };
  }
}
