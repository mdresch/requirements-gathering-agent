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
 * Processor for the Technical Recommendations document.
 * Generates comprehensive technical recommendations that align with PMBOK standards
 * and provide valuable insights for technology stack decisions.
 */
export class TechnicalRecommendationsProcessor implements DocumentProcessor {
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
          content: `You are a senior technical architect and project management expert with extensive experience in technology selection and PMBOK standards.

Your task is to generate comprehensive technical recommendations that align with PMBOK project management principles and support informed technology stack decisions.

Generate a detailed Technical Recommendations document that includes:

1. **Executive Summary**
   - Key technical recommendations overview
   - Strategic alignment with project objectives
   - PMBOK process group alignment

2. **Technology Architecture Recommendations**
   - Overall system architecture approach
   - Technology stack recommendations with justification
   - Integration patterns and approaches
   - Scalability and performance considerations

3. **Risk Management (PMBOK 11.0)**
   - Technical risk identification and assessment
   - Risk probability and impact analysis
   - Risk mitigation strategies and contingency plans
   - Risk monitoring and control recommendations

4. **Quality Management (PMBOK 8.0)**
   - Quality standards and technical criteria
   - Testing and validation strategies
   - Code quality and technical debt management
   - Performance and reliability requirements

5. **Resource Management (PMBOK 9.0)**
   - Technical skill requirements and team composition
   - Training and development needs
   - Tool and infrastructure requirements
   - Vendor and third-party service considerations

6. **Cost Management (PMBOK 7.0)**
   - Technology cost analysis and budgeting
   - Total cost of ownership (TCO) considerations
   - Cost-benefit analysis for technology choices
   - Budget allocation recommendations

7. **Implementation Roadmap**
   - Phased implementation approach
   - Technology implementation timeline
   - Critical path considerations
   - Success metrics and KPIs

Ensure all recommendations are practical, well-justified, and aligned with PMBOK standards and modern development practices.`
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);

      if (!content || content.trim().length === 0) {
        throw new ExpectedError('No content generated for Technical Recommendations document');
      }

      return {
        title: 'Technical Recommendations',
        content: content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw error;
      }
      console.error('Error in TechnicalRecommendationsProcessor:', error);
      throw new Error(`Failed to generate Technical Recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    const { projectName, projectType, description } = context;
    
    return `Create a comprehensive Technical Recommendations document for the following project:

**Project Name:** ${projectName}
**Project Type:** ${projectType || 'Not specified'}
**Description:** ${description || 'No description provided'}

Please provide detailed technical recommendations that align with PMBOK standards and address the specific needs of this ${projectType || 'project'}.

Focus on providing actionable recommendations that support informed technology stack decisions and align with project management best practices.`;
  }
}