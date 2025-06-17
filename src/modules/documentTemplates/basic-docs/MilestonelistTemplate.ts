import type { ProjectContext } from '../../ai/types';

/**
 * Milestonelist Template generates the content for the Milestonelist document.
 */
export class MilestonelistTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Milestonelist
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# Milestonelist\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
