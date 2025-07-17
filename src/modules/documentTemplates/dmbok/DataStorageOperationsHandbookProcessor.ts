import { ProjectContext } from '../../ai/types.js';
import { DocumentOutput } from '../../documentGenerator/types.js';
import { DataStorageOperationsHandbookTemplate } from './DataStorageOperationsHandbookTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class DataStorageOperationsHandbookProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataStorageOperationsHandbookTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { 
        role: 'system' as const, 
        content: 'You are an expert in database administration and data operations. Generate a comprehensive Data Storage & Operations Handbook based on the project context and DMBOK 2.0 guidelines. Provide detailed, practical guidance for database administrators and operations teams.'
      },
      { 
        role: 'user' as const, 
        content: prompt 
      }
    ];
    
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    
    return {
      title: 'Data Storage & Operations Handbook',
      content
    };
  }
}
