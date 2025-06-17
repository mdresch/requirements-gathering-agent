import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class CodingStandardsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior developer with expertise in coding standards and best practices.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Coding Standards Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Coding Standards Guide:', error);
      throw new Error(`Failed to generate Coding Standards Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Coding Standards Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Code Style Guidelines
2. Naming Conventions
3. File Organization
4. Code Documentation
5. Error Handling
6. Testing Requirements
7. Performance Guidelines
8. Security Guidelines
9. Code Review Process
10. Best Practices

Requirements:
1. Clear coding standards
2. Language-specific rules
3. Include examples
4. Address maintainability
5. Define review process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for coding standards guide');
    }
  }
}
