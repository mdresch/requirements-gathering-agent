import type { ProjectContext } from '../../ai/types';

/**
 * Corevalues Template generates the content for the Corevalues document.
 */
export class CorevaluesTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Corevalues
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# Corevalues\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
