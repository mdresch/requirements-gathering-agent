import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class ReleaseProcessProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a release manager with expertise in software release processes and change management.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Release Process Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Release Process Guide:', error);
      throw new Error(`Failed to generate Release Process Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Release Process Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Release Planning Process
2. Version Numbering Strategy
3. Release Criteria and Gates
4. Testing and Validation
5. Change Management
6. Deployment Procedures
7. Rollback Plans
8. Communication Strategy
9. Post-Release Activities
10. Release Retrospectives

Requirements:
1. Clear process flow
2. Decision criteria
3. Include templates
4. Address risk mitigation
5. Define roles and responsibilities`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for release process guide');
    }
  }
}
