import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for a Data Quality Management Plan document based on project context.
 */
export class DataQualityManagementPlanTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    return `# Data Quality Management Plan\n\n**Project:** ${projectName}\n\n## 1. Introduction\n- Purpose, scope, and objectives of the Data Quality Management Plan.\n\n## 2. Data Quality Roles and Responsibilities\n- Data Owners, Data Stewards, Data Quality Analysts.\n\n## 3. Data Quality Dimensions\n- Definitions for Accuracy, Completeness, Consistency, Timeliness, Uniqueness, Validity.\n\n## 4. Data Quality Assessment\n- Processes for profiling, monitoring, and measuring data quality.\n\n## 5. Data Quality Issue Management\n- Procedures for identifying, logging, and remediating data quality issues.\n\n## 6. Data Quality Tools and Technology\n- Description of tools used for data quality management.\n\n## 7. Data Quality Metrics and Reporting\n- Key Performance Indicators (KPIs) and dashboards.\n`;
  }
}
