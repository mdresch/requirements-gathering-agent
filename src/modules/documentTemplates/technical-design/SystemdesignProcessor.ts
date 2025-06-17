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
 * System Design Processor generates comprehensive system design specifications
 * with detailed technical architecture and implementation guidance.
 */
export class SystemDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior software architect with expertise in system design and documentation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'System Design Specification',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in System Design Specification processing:', error.message);
        throw new Error(`Failed to generate System Design Specification: ${error.message}`);
      } else {
        console.error('Unexpected error in System Design Specification processing:', error);
        throw new Error('An unexpected error occurred while generating System Design Specification');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a detailed System Design Specification.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. System Purpose and Scope
2. System Architecture
3. Module Descriptions
4. Interface Specifications
5. Data Structures
6. Processing Logic
7. Error Handling
8. Performance Requirements
9. System Constraints
10. Dependencies

Requirements:
1. Be specific to this project's needs
2. Include technical diagrams placeholders
3. Define clear interfaces
4. Specify error handling mechanisms
5. Document performance requirements`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a system design document');
    }
  }
}
