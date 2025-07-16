import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for a Data Governance Plan document based on project context.
 */
export class DataGovernancePlanTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    return `# Data Governance Plan\n\n**Project:** ${projectName}\n\n## 1. Introduction\n- Purpose and scope of the Data Governance Plan\n- Alignment with DMBOK and organizational objectives\n\n## 2. Governance Structure\n- Roles, responsibilities, and committees\n- Data governance council and escalation paths\n\n## 3. Data Policies, Standards, and Procedures\n- Key data policies and standards\n- Procedures for data management and quality\n\n## 4. Data Stewardship and Ownership\n- Assignment of data stewards and owners\n- Stewardship responsibilities\n\n## 5. Compliance, Risk Management, and Audit\n- Regulatory and compliance requirements\n- Risk management approach\n- Audit and review processes\n\n## 6. Communication and Training\n- Communication plan for governance activities\n- Training and awareness programs\n\n## 7. Metrics and Continuous Improvement\n- Metrics for monitoring governance effectiveness\n- Continuous improvement processes\n\n## 8. Appendices\n- Glossary, references, supporting documents\n`;
  }
}
