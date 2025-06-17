import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class PerformIntegratedChangeControlProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project manager with expertise in change management and PMBOK processes.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Perform Integrated Change Control Process',
        content
      };
    } catch (error) {
      console.error('Error processing Perform Integrated Change Control Process:', error);
      throw new Error(`Failed to generate Perform Integrated Change Control Process: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Perform Integrated Change Control Process document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

This PMBOK process document should include:
1. Process Overview and Purpose
2. Process Inputs
3. Tools and Techniques
4. Process Outputs
5. Change Request Evaluation
6. Change Control Board Procedures
7. Impact Assessment Methods
8. Configuration Management
9. Change Log Maintenance
10. Process Flow and Decision Points

Requirements:
1. Align with PMBOK standards
2. Include process flows
3. Define roles and responsibilities
4. Provide templates and forms
5. Address change evaluation criteria`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for integrated change control process');
    }
  }
}
