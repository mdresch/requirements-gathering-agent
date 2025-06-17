import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class ApiIntegrationProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a solutions architect with expertise in API design and integration patterns.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'API Integration Guide',
        content
      };
    } catch (error) {
      console.error('Error processing API Integration Guide:', error);
      throw new Error(`Failed to generate API Integration Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive API Integration Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. API Design Principles
2. Integration Patterns
3. Authentication and Security
4. Error Handling Strategies
5. Rate Limiting and Throttling
6. Data Validation
7. Testing Approaches
8. Monitoring and Logging
9. Documentation Standards
10. Versioning Strategy

Requirements:
1. Best practice guidelines
2. Code examples
3. Security considerations
4. Performance optimization
5. Maintenance procedures`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for API integration guide');
    }
  }
}
