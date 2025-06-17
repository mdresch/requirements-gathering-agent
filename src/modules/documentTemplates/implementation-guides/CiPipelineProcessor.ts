import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class CiPipelineProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in CI/CD pipeline design and implementation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'CI/CD Pipeline Guide',
        content
      };
    } catch (error) {
      console.error('Error processing CI/CD Pipeline Guide:', error);
      throw new Error(`Failed to generate CI/CD Pipeline Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive CI/CD Pipeline Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Pipeline Architecture Overview
2. Build Stage Configuration
3. Testing Automation
4. Code Quality Gates
5. Security Scanning
6. Deployment Strategies
7. Environment Management
8. Monitoring and Alerting
9. Rollback Procedures
10. Performance Optimization

Requirements:
1. Step-by-step setup
2. Platform-specific configs
3. Include examples
4. Address failure scenarios
5. Define success criteria`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for CI/CD pipeline guide');
    }
  }
}
