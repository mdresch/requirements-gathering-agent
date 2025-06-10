import { AIProcessor } from '../ai/AIProcessor.js';
import { ProjectContext } from '../types.js';
import { MissionVisionCoreValuesTemplate, ProjectPurposeTemplate, StrategicStatementsConfig } from '../documentTemplates/strategic-statements/strategicStatements.js';

export class MissionVisionCoreValuesProcessor {
  constructor(
    private aiProcessor: AIProcessor,
    private context: ProjectContext
  ) {}

  async processDocument(config: StrategicStatementsConfig = { detailLevel: 'detailed' }): Promise<string> {
    try {
      const template = new MissionVisionCoreValuesTemplate(this.context, config);
      const initialContent = await template.generateContent();
      const aiPrompt = this.createAIPrompt(initialContent);
      const enhancedContent = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a professional project manager and PMBOK expert.' },
        { role: 'user', content: aiPrompt }
      ]).then(res => (typeof res === 'string' ? res : (res as any).content));
      await this.validateOutput(enhancedContent);
      return enhancedContent;
    } catch (error) {
      console.error('Error processing Mission, Vision & Core Values:', error);
      throw new Error(`Failed to generate Mission, Vision & Core Values: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createAIPrompt(initialContent: string): string {
    return `You are a professional project manager and PMBOK expert. Please enhance and expand the following Mission, Vision & Core Values template with detailed, actionable content based on the project context.\n\nProject Context:\n- Name: ${this.context.projectName}\n- Type: ${this.context.projectType}\n- Description: ${this.context.description}\n\nRequirements:\n1. Ensure PMBOK 7.0 compliance\n2. Make content specific to this project\n3. Include actionable recommendations\n4. Use professional language and formatting\n5. Add relevant examples where appropriate\n\nDocument Template:\n${initialContent}\n\nPlease provide a comprehensive, enhanced version of this document.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 200) {
      console.warn('Generated content seems unusually short');
    }
  }
}

export class ProjectPurposeProcessor {
  constructor(
    private aiProcessor: AIProcessor,
    private context: ProjectContext
  ) {}

  async processDocument(config: StrategicStatementsConfig = { detailLevel: 'detailed' }): Promise<string> {
    try {
      const template = new ProjectPurposeTemplate(this.context, config);
      const initialContent = await template.generateContent();
      const aiPrompt = this.createAIPrompt(initialContent);
      const enhancedContent = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a professional project manager and PMBOK expert.' },
        { role: 'user', content: aiPrompt }
      ]).then(res => (typeof res === 'string' ? res : (res as any).content));
      await this.validateOutput(enhancedContent);
      return enhancedContent;
    } catch (error) {
      console.error('Error processing Project Purpose:', error);
      throw new Error(`Failed to generate Project Purpose: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createAIPrompt(initialContent: string): string {
    return `You are a professional project manager and PMBOK expert. Please enhance and expand the following Project Purpose template with detailed, actionable content based on the project context.\n\nProject Context:\n- Name: ${this.context.projectName}\n- Type: ${this.context.projectType}\n- Description: ${this.context.description}\n\nRequirements:\n1. Ensure PMBOK 7.0 compliance\n2. Make content specific to this project\n3. Include actionable recommendations\n4. Use professional language and formatting\n5. Add relevant examples where appropriate\n\nDocument Template:\n${initialContent}\n\nPlease provide a comprehensive, enhanced version of this document.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 200) {
      console.warn('Generated content seems unusually short');
    }
  }
}
