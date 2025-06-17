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
 * Processor for the Data Model Suggestions document.
 */
export class DataModelSuggestionsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are an expert Data Architect and Database Designer with extensive experience in creating comprehensive data models and database designs.

Your task is to analyze the project requirements and create detailed data model suggestions that will serve as the foundation for database design and data architecture decisions.

Generate a comprehensive Data Model Suggestions document that includes:

1. **Entity Relationship Analysis**
   - Core business entities
   - Entity relationships and cardinality
   - Key attributes for each entity
   - Primary and foreign key identification

2. **Data Model Recommendations**
   - Logical data model structure
   - Physical implementation considerations
   - Normalization recommendations
   - Index strategy suggestions

3. **Database Design Guidelines**
   - Table structure recommendations
   - Data type selections
   - Constraint definitions
   - Performance optimization strategies

4. **Data Governance Framework**
   - Data quality standards
   - Data validation rules
   - Data security considerations
   - Backup and recovery strategies

Ensure all recommendations are practical, scalable, and aligned with industry best practices.`
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);

      if (!content || content.trim().length === 0) {
        throw new ExpectedError('No content generated for Data Model Suggestions document');
      }

      return {
        title: 'Data Model Suggestions',
        content: content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw error;
      }
      console.error('Error in DataModelSuggestionsProcessor:', error);
      throw new Error(`Failed to generate Data Model Suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  private createPrompt(context: ProjectContext): string {
    const { projectName, projectType, description } = context;
    
    return `Create a comprehensive Data Model Suggestions document for the following project:

**Project Name:** ${projectName}
**Project Type:** ${projectType || 'Not specified'}
**Description:** ${description || 'No description provided'}

Please provide detailed data modeling recommendations that address the specific needs of this ${projectType || 'project'}.`;
  }
}
