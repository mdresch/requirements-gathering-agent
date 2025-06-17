import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class CodeDocumentationProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a technical writer with expertise in code documentation and developer experience.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Code Documentation Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Code Documentation Guide:', error);
      throw new Error(`Failed to generate Code Documentation Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Code Documentation Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Documentation Standards
2. Code Comments Guidelines
3. API Documentation
4. README Best Practices
5. Inline Documentation
6. Architecture Documentation
7. Setup and Usage Guides
8. Troubleshooting Documentation
9. Change Log Maintenance
10. Documentation Tools and Automation

Requirements:
1. Clear documentation standards
2. Examples and templates
3. Tool recommendations
4. Maintenance procedures
5. Quality criteria`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for code documentation guide');
    }
  }
}
