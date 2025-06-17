import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class DeploymentGuideProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in application deployment and infrastructure management.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Deployment Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Deployment Guide:', error);
      throw new Error(`Failed to generate Deployment Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Deployment Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Deployment Architecture
2. Environment Setup
3. Infrastructure Requirements
4. Deployment Strategies
5. Configuration Management
6. Security Considerations
7. Monitoring and Health Checks
8. Backup and Recovery
9. Scaling Procedures
10. Maintenance and Updates

Requirements:
1. Step-by-step procedures
2. Environment-specific configs
3. Security best practices
4. Disaster recovery plans
5. Performance considerations`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for deployment guide');
    }
  }
}
