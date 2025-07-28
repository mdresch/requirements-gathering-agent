import type { ProjectContext } from '../../ai/types';

/**
 * Project Status Report Document Template
 * Defines the structure for project status reporting.
 */
export class ProjectStatusReportTemplate {
  static buildPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Project';
    return `# Project Status Report\n\n` +
      `**Project:** ${projectName}\n\n` +
      `## 1. Executive Summary\n- Summarize overall project status and key highlights\n\n` +
      `## 2. Key Accomplishments\n- List major accomplishments since last report\n\n` +
      `## 3. Upcoming Milestones\n- List milestones expected in the next period\n\n` +
      `## 4. Progress Summary\n- Summarize progress against plan\n\n` +
      `## 5. Budget Status\n- Summarize budget performance and variances\n\n` +
      `## 6. Schedule Performance\n- Summarize schedule status and any delays\n\n` +
      `## 7. Key Issues & Risks\n- List critical issues and risks\n\n` +
      `## 8. Action Items\n- List open action items and owners\n\n` +
      `## 9. Next Period Focus\n- Outline priorities and focus areas for next period\n`;
  }
}
