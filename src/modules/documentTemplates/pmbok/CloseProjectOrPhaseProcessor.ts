import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class CloseProjectOrPhaseProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project manager with expertise in project closure and PMBOK processes.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Close Project or Phase Process',
        content
      };
    } catch (error) {
      console.error('Error processing Close Project or Phase Process:', error);
      throw new Error(`Failed to generate Close Project or Phase Process: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Close Project or Phase Process document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

This PMBOK process document should include:
1. Process Overview and Purpose
2. Process Inputs
3. Tools and Techniques
4. Process Outputs
5. Administrative Closure Procedures
6. Contract Closure Activities
7. Final Product/Service Transition
8. Lessons Learned Collection
9. Resource Release Procedures
10. Final Reporting and Documentation

Requirements:
1. Align with PMBOK standards
2. Include closure checklists
3. Define acceptance criteria
4. Provide closure templates
5. Address knowledge transfer`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for close project process');
    }
  }
}
