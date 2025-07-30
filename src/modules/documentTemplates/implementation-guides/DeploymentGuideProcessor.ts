
import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';
import { DeploymentGuideTemplate } from './DeploymentGuideTemplate.js';

export class DeploymentGuideProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private template: DeploymentGuideTemplate;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    // Template now expects context in constructor
    this.template = null as any;
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      // Extract only minimal deployment context fields
      const minimalContext = {
        projectName: context.projectName || 'ADPA - Advanced Document Processing & Automation Framework',
        projectType: context.projectType || 'Enterprise Automation Platform',
        description: context.description || 'Application deployment guide and procedures',
      };

      // Always use the template for the base document
      this.template = new DeploymentGuideTemplate(minimalContext);
      let templateContent = this.template.generateContent();

      // Generate AI insights for deployment guide
      const aiInsights = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in application deployment and infrastructure management.' },
        { role: 'user', content: this.createPrompt(minimalContext) }
      ]).then(res => typeof res === 'string' ? res : res.content);

      // Inject AI insights at the {{AI_INSIGHTS}} placeholder
      let finalContent = templateContent;
      if (finalContent.includes('{{AI_INSIGHTS}}')) {
        finalContent = finalContent.replace('{{AI_INSIGHTS}}', aiInsights);
      } else {
        finalContent += '\n\n' + aiInsights;
      }

      await this.validateOutput(finalContent);

      return {
        title: 'Deployment Guide',
        content: finalContent
      };
    } catch (error) {
      console.error('Error processing Deployment Guide:', error);
      throw new Error(`Failed to generate Deployment Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Removed enhanceWithAI; now handled directly in process()

  private createPrompt(context: { projectName: string; projectType: string; description: string }): string {
    return `Based on the following project context, generate project-specific deployment guidance and insights.\n\nProject Context:\n- Name: ${context.projectName}\n- Type: ${context.projectType}\n- Description: ${context.description}\n\nPlease provide:\n1. Step-by-step procedures for each deployment section\n2. Environment-specific configuration recommendations\n3. Security best practices\n4. Disaster recovery plans\n5. Performance considerations\n\nFormat as markdown with clear sections.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for deployment guide');
    }
    if (!content.includes('# Deployment Guide')) {
      console.warn('Generated content may be missing the main heading');
    }
  }
}
