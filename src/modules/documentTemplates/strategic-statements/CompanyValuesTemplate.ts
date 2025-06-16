import type { ProjectContext } from '../../ai/types';

/**
 * CompanyValues Template generates the content for the CompanyValues document.
 */
export class CompanyValuesTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for CompanyValues
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# CompanyValues\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
