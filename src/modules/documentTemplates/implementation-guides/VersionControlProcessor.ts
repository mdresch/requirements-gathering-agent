import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class VersionControlProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior developer with expertise in version control and Git workflows.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Version Control Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Version Control Guide:', error);
      throw new Error(`Failed to generate Version Control Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Version Control Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Git Workflow Strategy
2. Branching Model
3. Commit Message Standards
4. Pull Request Process
5. Code Review Guidelines
6. Repository Structure
7. Git Hooks and Automation
8. Release Branching
9. Conflict Resolution
10. Version Tagging Strategy

Requirements:
1. Clear workflow guidelines
2. Team collaboration rules
3. Include examples
4. Address common scenarios
5. Define approval process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for version control guide');
    }
  }
}
