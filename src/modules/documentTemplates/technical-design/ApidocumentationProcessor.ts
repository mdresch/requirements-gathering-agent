import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * API Documentation Processor generates comprehensive API documentation
 * following OpenAPI/Swagger standards and RESTful service best practices.
 */
export class APIDocumentationProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an API documentation specialist with expertise in RESTful services.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'API Documentation',
        content
      };
    } catch (error) {
      console.error('Error processing API Documentation:', error);
      throw new Error(`Failed to generate API Documentation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive API Documentation.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. API Overview
2. Authentication Methods
3. Endpoint Definitions
4. Request/Response Formats
5. Error Codes
6. Rate Limiting
7. Versioning Strategy
8. Security Considerations
9. Example Usage
10. Testing Guidelines

Requirements:
1. Follow OpenAPI/Swagger standards
2. Include clear examples
3. Document all error scenarios
4. Address security concerns
5. Provide usage guidelines`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for API documentation');
    }
  }
}
