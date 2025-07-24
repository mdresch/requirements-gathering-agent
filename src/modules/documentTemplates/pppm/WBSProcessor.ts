import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { WBSTemplate } from './WBSTemplate.js';
import { AIProcessor } from '../../ai/AIProcessor.js';

/**
 * Work Breakdown Structure (WBS) Processor
 * Implements DocumentProcessor interface for WBS document generation
 */
export class WBSProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  /**
   * Process the WBS document generation
   * @param context ProjectContext for dynamic content population
   * @returns DocumentOutput with generated WBS content
   */
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      // Create template instance and build prompt
      const template = new WBSTemplate(context);
      const prompt = template.buildPrompt();

      // Generate content using AI processor
      const content = await this.aiProcessor.makeAICall([
        {
          role: 'system',
          content: 'You are an expert project manager specializing in Work Breakdown Structure (WBS) development following PMBOK standards. Generate comprehensive, well-structured WBS documentation that breaks down project work into manageable components.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]).then((res: any) => typeof res === 'string' ? res : res.content);

      // Validate output
      await this.validateOutput(content);

      return {
        title: 'Work Breakdown Structure (WBS)',
        content
      };
    } catch (error) {
      console.error('Error processing Work Breakdown Structure:', error);
      throw new Error(`Failed to generate Work Breakdown Structure: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate the generated output
   * @param content Generated content to validate
   */
  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated WBS content is empty');
    }

    // Check for essential WBS components
    const requiredSections = [
      'Work Breakdown Structure',
      'Project Management',
      'Requirements',
      'Implementation',
      'Deployment'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      console.warn(`Warning: Generated WBS may be missing section: ${missingSection}`);
    }

    // Check for hierarchical structure indicators
    const hasHierarchy = /\d+\.\d+/.test(content) || content.includes('###') || content.includes('####');
    if (!hasHierarchy) {
      console.warn('Warning: Generated WBS may lack proper hierarchical structure');
    }
  }
}
