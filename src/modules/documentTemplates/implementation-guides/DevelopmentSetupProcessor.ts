import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class DevelopmentSetupProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in development environment setup.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Development Setup Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Development Setup Guide:', error);
      throw new Error(`Failed to generate Development Setup Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Development Setup Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Prerequisites and Dependencies
2. Development Environment Setup
3. Required Tools and Software
4. IDE Configuration
5. Database Setup (if applicable)
6. Local Server Setup
7. Configuration Files
8. Environment Variables
9. Testing Setup
10. Troubleshooting Common Issues

Requirements:
1. Step-by-step instructions
2. Platform-specific guidance
3. Include examples
4. Address common issues
5. Provide verification steps`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for development setup guide');
    }
  }
}
