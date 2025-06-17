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
 * Processor for the Tech Stack Analysis document.
 */
export class TechStackAnalysisProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are an expert Technology Architect and Solution Designer with extensive experience in evaluating and recommending technology stacks for various types of projects.

Your task is to analyze the project requirements and provide comprehensive technology stack recommendations that align with the project goals, scalability needs, and industry best practices.

Generate a detailed Tech Stack Analysis document that includes:

1. **Technology Assessment**
   - Current technology landscape analysis
   - Technology requirements evaluation
   - Scalability and performance considerations
   - Integration requirements assessment

2. **Stack Recommendations**
   - Frontend technology recommendations
   - Backend framework suggestions
   - Database technology selection
   - Infrastructure and deployment options

3. **Evaluation Criteria**
   - Technical feasibility analysis
   - Cost-benefit assessment
   - Learning curve considerations
   - Community support and documentation

4. **Implementation Roadmap**
   - Technology adoption strategy
   - Migration considerations
   - Risk mitigation approaches
   - Performance optimization guidelines

Ensure all recommendations are practical, well-justified, and aligned with modern development practices.`
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);

      if (!content || content.trim().length === 0) {
        throw new ExpectedError('No content generated for Tech Stack Analysis document');
      }

      return {
        title: 'Tech Stack Analysis',
        content: content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw error;
      }
      console.error('Error in TechStackAnalysisProcessor:', error);
      throw new Error(`Failed to generate Tech Stack Analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    const { projectName, projectType, description } = context;
    
    return `Create a comprehensive Tech Stack Analysis document for the following project:

**Project Name:** ${projectName}
**Project Type:** ${projectType || 'Not specified'}
**Description:** ${description || 'No description provided'}

Please provide detailed technology stack recommendations that address the specific needs of this ${projectType || 'project'}.`;
  }
}
