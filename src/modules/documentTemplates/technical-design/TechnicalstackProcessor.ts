import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Technical Stack Processor generates comprehensive technical stack documentation
 * following modern technology stack selection and documentation best practices.
 */
export class TechnicalStackProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a technical architect with expertise in modern technology stacks.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Technical Stack Overview',
        content
      };
    } catch (error) {
      console.error('Error processing Technical Stack Overview:', error);
      throw new Error(`Failed to generate Technical Stack Overview: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Technical Stack Overview.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Technology Stack Overview
2. Frontend Technologies
3. Backend Technologies
4. Database Technologies
5. Infrastructure Components
6. Development Tools
7. Testing Tools
8. Monitoring Tools
9. Deployment Tools
10. Version Control and CI/CD

Requirements:
1. Justify technology choices
2. Consider scalability needs
3. Address maintainability
4. Include version information
5. Document dependencies`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for technical stack overview');
    }
  }
}
