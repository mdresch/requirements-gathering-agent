import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { MissionVisionCoreValuesTemplate } from '../strategic-statements/MissionVisionCoreValuesTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the MissionVisionCoreValues document.
 */
export class MissionVisionCoreValuesProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a strategic planning consultant with expertise in organizational mission, vision, and values development. You help organizations articulate their purpose, aspirations, and core principles.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Mission, Vision, and Core Values',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Mission Vision Core Values processing:', error.message);
        throw new Error(`Failed to generate Mission Vision Core Values: ${error.message}`);
      } else {
        console.error('Unexpected error in Mission Vision Core Values processing:', error);
        throw new Error('An unexpected error occurred while generating Mission Vision Core Values');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new MissionVisionCoreValuesTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Mission, Vision, and Core Values document.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Requirements:
1. Create a mission statement that defines the fundamental purpose and reason for existence
2. Develop a vision statement that describes the desired future state and long-term aspirations
3. Define 3-5 core values that represent the fundamental beliefs and principles
4. Include implementation guidelines for living these values
5. Provide measurement and accountability suggestions

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Important Instructions:
- Make the mission, vision, and values specific to the project context provided
- Ensure the language is professional and inspiring
- Include practical implementation guidance
- Focus on what makes this project/organization unique
- Use markdown formatting for proper structure
- Keep content concise but comprehensive`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    const requiredSections = [
      'Mission Statement',
      'Vision Statement', 
      'Core Values',
      'Implementation Guidelines'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      throw new ExpectedError(`Missing required section: ${missingSection}`);
    }
  }
}
