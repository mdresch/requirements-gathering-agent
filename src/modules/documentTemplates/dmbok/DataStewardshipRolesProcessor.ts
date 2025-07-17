import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { DataStewardshipRolesTemplate } from './DataStewardshipRolesTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class DataStewardshipRolesProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataStewardshipRolesTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { 
        role: 'system' as const, 
        content: 'You are an expert in data governance, data stewardship, and DMBOK 2.0. Generate a comprehensive Data Stewardship and Roles & Responsibilities Framework that defines clear roles, responsibilities, RACI matrices, and governance processes for effective data management. Focus on practical implementation and organizational alignment.' 
      },
      { role: 'user' as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Data Stewardship and Roles & Responsibilities Framework',
      content
    };
  }
}
