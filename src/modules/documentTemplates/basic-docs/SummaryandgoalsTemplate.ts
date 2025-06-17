import type { ProjectContext } from '../../ai/types';

/**
 * Summaryandgoals Template generates the content for the Summaryandgoals document.
 */
export class SummaryandgoalsTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Summaryandgoals
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# Summaryandgoals\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
