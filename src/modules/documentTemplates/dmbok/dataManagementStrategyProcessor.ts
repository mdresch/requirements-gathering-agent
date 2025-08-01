
import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { DataManagementStrategyTemplate } from './dataManagementStrategyTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class DataManagementStrategyProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataManagementStrategyTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: 'system' as const, content: 'You are an expert in data management and DMBOK. Generate a comprehensive Data Management Strategy based on the project context.' },
      { role: 'user' as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Data Management Strategy',
      content
    };
  }
}
