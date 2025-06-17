import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class DevelopmentWorkflowProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a development team lead with expertise in agile workflows and team collaboration.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Development Workflow Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Development Workflow Guide:', error);
      throw new Error(`Failed to generate Development Workflow Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Development Workflow Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Development Methodology
2. Sprint Planning Process
3. Task Management
4. Code Review Workflow
5. Testing Workflow
6. Deployment Process
7. Communication Protocols
8. Meeting Cadence
9. Documentation Requirements
10. Quality Assurance Process

Requirements:
1. Clear workflow steps
2. Role definitions
3. Timeline expectations
4. Tool integration
5. Metrics and KPIs`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for development workflow guide');
    }
  }
}
