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
 * Processor for the UI/UX Considerations document.
 */
export class UIUXConsiderationsProcessor implements DocumentProcessor {
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
          content: `You are an expert UI/UX Designer and User Experience Strategist with extensive experience in creating user-centered design strategies and interface guidelines.

Your task is to analyze the project requirements and provide comprehensive UI/UX considerations that will guide the design and development of an exceptional user experience.

Generate a detailed UI/UX Considerations document that includes:

1. **User Experience Strategy**
   - User research and persona development
   - User journey mapping and flow analysis
   - Information architecture planning
   - Interaction design principles

2. **User Interface Guidelines**
   - Visual design principles and standards
   - Component library recommendations
   - Accessibility compliance requirements
   - Responsive design considerations

3. **Usability Framework**
   - Usability testing strategies
   - Performance and accessibility metrics
   - User feedback collection methods
   - Iterative design processes

4. **Implementation Recommendations**
   - Design system development
   - Prototyping and wireframing guidelines
   - Cross-platform compatibility
   - Future scalability considerations

Ensure all recommendations are user-centered, accessible, and aligned with modern UX best practices.`
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);

      if (!content || content.trim().length === 0) {
        throw new ExpectedError('No content generated for UI/UX Considerations document');
      }

      return {
        title: 'UI/UX Considerations',
        content: content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw error;
      }
      console.error('Error in UIUXConsiderationsProcessor:', error);
      throw new Error(`Failed to generate UI/UX Considerations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    const { projectName, projectType, description } = context;
    
    return `Create a comprehensive UI/UX Considerations document for the following project:

**Project Name:** ${projectName}
**Project Type:** ${projectType || 'Not specified'}
**Description:** ${description || 'No description provided'}

Please provide detailed UI/UX analysis and recommendations that address the specific user experience needs for this ${projectType || 'project'}.`;
  }
}
