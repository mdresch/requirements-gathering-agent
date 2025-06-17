import type { ProjectContext } from '../../ai/types';

/**
 * Projectpurpose Template generates the content for the Projectpurpose document.
 */
export class ProjectpurposeTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Projectpurpose
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# Projectpurpose\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
