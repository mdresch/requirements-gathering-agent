import { getAIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput } from '../../documentGenerator/types.js';
import { DataGovernancePlanTemplate } from './DataGovernancePlanTemplate.js';


export class DataGovernancePlanProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataGovernancePlanTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: 'system' as const, content: 'You are an expert in data governance and DMBOK. Generate a comprehensive Data Governance Framework based on the project context.' },
      { role: 'user' as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Data Governance Plan',
      content
    };
  }
}
