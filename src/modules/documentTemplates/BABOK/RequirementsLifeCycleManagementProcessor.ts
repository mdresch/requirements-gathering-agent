import { ProjectContext } from '../../../index.js';
import { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';
import { RequirementsLifeCycleManagementTemplate } from './RequirementsLifeCycleManagementTemplate.js';

/**
 * RequirementsLifeCycleManagementProcessor
 * Processor for BABOK Requirements Life Cycle Management document.
 * Implements DocumentProcessor and uses AIProcessor for content generation.
 */
export class RequirementsLifeCycleManagementProcessor implements DocumentProcessor {
  /**
   * Generate the Requirements Life Cycle Management document output.
   * @param context ProjectContext for dynamic content population
   * @returns DocumentOutput with generated content
   */
  async generate(context: ProjectContext): Promise<DocumentOutput> {
    const template = new RequirementsLifeCycleManagementTemplate();
    const aiProcessor = getAIProcessor();
    let content: string;
    try {
      content = await aiProcessor.processAIRequest(
        async () => {
          // Simulate AI document generation using the template as a prompt
          // Replace with actual AI logic as needed
          return template.generateContent(context);
        },
        'generateRequirementsLifeCycleManagement'
      );
      if (!content || content.trim().length === 0) {
        throw new Error('AI returned empty content');
      }
    } catch (error) {
      // Fallback to template if AI fails
      content = template.generateContent(context);
    }
    return {
      title: 'Requirements Life Cycle Management',
      content
    };
  }

  process(context: ProjectContext): Promise<DocumentOutput> {
    return this.generate(context);
  }
}
