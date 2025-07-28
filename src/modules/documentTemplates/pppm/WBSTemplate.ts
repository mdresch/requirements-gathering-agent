import type { ProjectContext } from '../../ai/types';

/**
 * Work Breakdown Structure (WBS) Document Template
 * Hierarchical decomposition of project deliverables and work packages.
 */
export class WBSTemplate {
  static buildPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Project';
    return `# Work Breakdown Structure (WBS)\n\n` +
      `**Project:** ${projectName}\n\n` +
      `## 1. Project Management\n- Define management deliverables and work packages\n\n` +
      `## 2. Requirements & Design\n- List requirements gathering and design work packages\n\n` +
      `## 3. Implementation\n- Detail implementation phases and work packages\n\n` +
      `## 4. Deployment & Training\n- Outline deployment, training, and transition work packages\n`;
  }
}
