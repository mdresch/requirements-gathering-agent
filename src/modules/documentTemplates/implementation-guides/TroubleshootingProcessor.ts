import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';

export class TroubleshootingProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior developer with expertise in debugging and troubleshooting complex systems.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Troubleshooting Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Troubleshooting Guide:', error);
      throw new Error(`Failed to generate Troubleshooting Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Troubleshooting Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Common Issues and Solutions
2. Debugging Methodologies
3. Logging and Monitoring
4. Error Analysis Techniques
5. Performance Troubleshooting
6. Environment-Specific Issues
7. Tool Recommendations
8. Escalation Procedures
9. Knowledge Base Maintenance
10. Prevention Strategies

Requirements:
1. Systematic approach
2. Clear problem categories
3. Step-by-step solutions
4. Tool usage examples
5. When to escalate`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for troubleshooting guide');
    }
  }
}
