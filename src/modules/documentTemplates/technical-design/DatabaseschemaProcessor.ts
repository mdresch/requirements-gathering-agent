import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Database Schema Processor generates comprehensive database schema design documentation
 * with entity relationships, table definitions, and optimization strategies.
 */
export class DatabaseSchemaProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a database architect with expertise in schema design and optimization.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Database Schema Design',
        content
      };
    } catch (error) {
      console.error('Error processing Database Schema Design:', error);
      throw new Error(`Failed to generate Database Schema Design: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Database Schema Design document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Database Overview
2. Entity Relationships
3. Table Definitions
4. Data Types
5. Indexes and Keys
6. Constraints
7. Normalization Strategy
8. Performance Considerations
9. Data Migration Strategy
10. Backup and Recovery

Requirements:
1. Follow database design best practices
2. Include ERD diagram placeholders
3. Define clear relationships
4. Consider scalability
5. Address data integrity`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a database schema document');
    }
  }
}
