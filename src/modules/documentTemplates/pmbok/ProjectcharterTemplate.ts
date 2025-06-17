import type { ProjectContext } from '../../ai/types';

/**
 * Projectcharter Template generates the content for the Projectcharter document.
 */
export class ProjectcharterTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Projectcharter
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# Projectcharter\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
