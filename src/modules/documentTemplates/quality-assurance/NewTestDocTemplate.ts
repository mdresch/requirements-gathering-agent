import type { ProjectContext } from '../../ai/types';

/**
 * NewTestDoc Template generates the content for the NewTestDoc document.
 */
export class NewTestDocTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for NewTestDoc
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return `# NewTestDoc\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `- Replace this with your checklist items or sections`;
  }
}
