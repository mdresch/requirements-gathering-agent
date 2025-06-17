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
 * Security Design Processor generates comprehensive security design documentation
 * with threat modeling, security controls, and compliance requirements.
 */
export class SecurityDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a security architect with expertise in application security design.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Security Design Document',
        content
      };
    } catch (error) {
      console.error('Error processing Security Design Document:', error);
      throw new Error(`Failed to generate Security Design Document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Security Design Document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Security Overview
2. Authentication Design
3. Authorization Framework
4. Data Protection
5. Network Security
6. Security Controls
7. Threat Modeling
8. Security Testing Strategy
9. Incident Response Plan
10. Compliance Requirements

Requirements:
1. Follow security best practices
2. Address common vulnerabilities
3. Include security patterns
4. Consider regulatory compliance
5. Define security monitoring`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a security design document');
    }
  }
}
