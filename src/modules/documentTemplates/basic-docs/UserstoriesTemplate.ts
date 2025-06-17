import type { ProjectContext } from '../../ai/types';

/**
 * Userstories Template generates the content for the Userstories document.
 */
export class UserstoriesTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Userstories
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# Userstories\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
