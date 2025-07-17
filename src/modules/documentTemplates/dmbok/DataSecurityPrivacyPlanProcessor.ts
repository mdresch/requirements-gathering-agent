import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { DataSecurityPrivacyPlanTemplate } from './DataSecurityPrivacyPlanTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class DataSecurityPrivacyPlanProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataSecurityPrivacyPlanTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: 'system' as const, content: 'You are an expert in data security, privacy, and compliance. Generate a comprehensive Data Security & Privacy Plan based on the project context.' },
      { role: 'user' as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Data Security & Privacy Plan',
      content
    };
  }
}
