import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Integration Design Processor generates comprehensive integration design documentation
 * following enterprise integration patterns and best practices.
 */
export class IntegrationDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a systems integration architect with expertise in enterprise integration patterns.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Integration Design',
        content
      };
    } catch (error) {
      console.error('Error processing Integration Design:', error);
      throw new Error(`Failed to generate Integration Design: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Integration Design document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Integration Overview
2. Integration Patterns
3. System Interfaces
4. Data Flow Design
5. Error Handling
6. Integration Points
7. Message Formats
8. Integration Security
9. Performance Considerations
10. Monitoring Strategy

Requirements:
1. Follow integration best practices
2. Define clear interfaces
3. Address error scenarios
4. Consider scalability
5. Document dependencies`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for integration design');
    }
  }
}
