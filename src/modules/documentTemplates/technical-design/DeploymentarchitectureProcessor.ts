import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Deployment Architecture Processor generates comprehensive deployment architecture documentation
 * following DevOps and infrastructure best practices.
 */
export class DeploymentArchitectureProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps architect with expertise in deployment architecture.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Deployment Architecture',
        content
      };
    } catch (error) {
      console.error('Error processing Deployment Architecture:', error);
      throw new Error(`Failed to generate Deployment Architecture: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Deployment Architecture document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Deployment Overview
2. Infrastructure Architecture
3. Environment Setup
4. Deployment Process
5. Configuration Management
6. Scaling Strategy
7. Monitoring Setup
8. Backup and Recovery
9. Disaster Recovery
10. Maintenance Procedures

Requirements:
1. Define deployment workflow
2. Include environment details
3. Address scalability
4. Consider security
5. Document dependencies`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for deployment architecture');
    }
  }
}
