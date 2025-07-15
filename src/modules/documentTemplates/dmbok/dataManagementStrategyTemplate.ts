import { ProjectContext } from '../../ai/types';

export class DataManagementStrategyTemplate {
  generateContent(context: ProjectContext): string {
    return `# Data Management Strategy\n\n**Project:** ${context.projectName || 'Unknown Project'}\n\n## 1. Introduction\nDescribe the purpose and scope of the data management strategy.\n\n## 2. Data Management Objectives\n- Objective 1\n- Objective 2\n\n## 3. Alignment with Business Goals\nDescribe how data management supports business objectives.\n\n## 4. Data Governance Principles\n- Principle 1\n- Principle 2\n\n## 5. Roles and Responsibilities\n- Data Owner: ...\n- Data Steward: ...\n- Data Custodian: ...\n\n## 6. Data Management Processes\n- Data Collection\n- Data Storage\n- Data Usage\n- Data Archival and Disposal\n\n## 7. Compliance and Standards\nList relevant standards (DMBOK, GDPR, etc.) and compliance requirements.\n\n## 8. Monitoring and Continuous Improvement\nDescribe how data management effectiveness will be measured and improved.\n`;
  }
}
