import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { DataGovernanceFrameworkTemplate } from './DataGovernanceFrameworkTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class DataGovernanceFrameworkProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataGovernanceFrameworkTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: 'system' as const, content: 'You are an expert in data governance and DMBOK. Generate a comprehensive Data Governance Framework based on the project context.' },
      { role: 'user' as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Data Governance Framework',
      content
    };
  }
}
