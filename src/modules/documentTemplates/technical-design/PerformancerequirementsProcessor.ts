import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Performance Requirements Processor generates comprehensive performance requirements
 * with measurable metrics and optimization guidelines.
 */
export class PerformanceRequirementsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a performance engineering expert with expertise in system optimization.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Performance Requirements',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Performance Requirements processing:', error.message);
        throw new Error(`Failed to generate Performance Requirements: ${error.message}`);
      } else {
        console.error('Unexpected error in Performance Requirements processing:', error);
        throw new Error('An unexpected error occurred while generating Performance Requirements');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Performance Requirements.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Performance Goals
2. Response Time Requirements
3. Throughput Expectations
4. Scalability Requirements
5. Resource Utilization
6. Load Handling
7. Caching Strategy
8. Performance Metrics
9. Monitoring Requirements
10. Performance Testing Plan

Requirements:
1. Define measurable metrics
2. Include baseline requirements
3. Specify monitoring needs
4. Address scalability
5. Consider resource constraints`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for performance requirements');
    }
  }
}
