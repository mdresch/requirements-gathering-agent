import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Error Handling Processor generates comprehensive error handling guidelines
 * covering error handling strategies, logging, recovery, and monitoring.
 */
export class ErrorHandlingProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a software architect with expertise in error handling and system reliability.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Error Handling Guidelines',
        content
      };
    } catch (error) {
      console.error('Error processing Error Handling Guidelines:', error);
      throw new Error(`Failed to generate Error Handling Guidelines: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Error Handling Guidelines.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Error Handling Strategy
2. Error Categories
3. Error Logging
4. Error Reporting
5. Recovery Procedures
6. Retry Mechanisms
7. Circuit Breakers
8. User Error Messages
9. Monitoring and Alerts
10. Troubleshooting Guide

Requirements:
1. Define error handling patterns
2. Include logging standards
3. Address user experience
4. Consider monitoring
5. Document recovery procedures`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for error handling guidelines');
    }
  }
}
