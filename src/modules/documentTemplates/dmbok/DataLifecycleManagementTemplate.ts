import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for a Data Lifecycle Management Policy document based on project context.
 */
export default class DataLifecycleManagementTemplate {
    private context: ProjectContext;

    constructor(context: ProjectContext) {
        this.context = context;
    }

    generateContent(): string {
        const { projectName = 'Project', projectType = '', description = '' } = this.context;
        
        return `# Data Lifecycle Management Policy

## 1. Introduction

### 1.1 Purpose
This document outlines the Data Lifecycle Management (DLM) policy for ${projectName}, ensuring that data is properly managed from creation through archival and eventual disposal in accordance with organizational requirements and regulatory standards.

### 1.2 Scope
This policy applies to all data assets within the ${projectName} project, including structured and unstructured data, regardless of format or storage location.

## 2. Data Lifecycle Phases

### 2.1 Data Creation and Collection
- Guidelines for data creation and collection methods
- Data quality requirements at point of entry
- Metadata capture requirements

### 2.2 Data Storage and Maintenance
- Storage standards and requirements
- Data retention schedules
- Backup and recovery procedures
- Data quality monitoring and maintenance

### 2.3 Data Usage and Sharing
- Access control policies
- Data sharing agreements
- Usage monitoring and auditing

### 2.4 Data Archival
- Criteria for data archival
- Archival formats and storage
- Access to archived data

### 2.5 Data Disposal
- Secure data disposal methods
- Documentation requirements
- Verification of disposal

## 3. Roles and Responsibilities

### 3.1 Data Owners
- Define data classification
- Approve access requests
- Determine retention periods
- Oversee data quality and compliance

### 3.2 Data Stewards
- Implement data governance policies
- Monitor data quality metrics
- Resolve data quality issues
- Enforce compliance requirements
- Maintain data documentation

### 3.3 IT Operations
- Implement data storage and backup solutions
- Ensure system availability and performance
- Execute data archival and disposal procedures
- Maintain DLM infrastructure
- Monitor system health and performance

### 3.4 Business Users
- Follow data handling procedures
- Report data quality issues
- Adhere to data security policies
- Participate in data governance activities
- Complete required training

## 4. Implementation Guidelines

### 4.1 Data Classification
- Classification categories and criteria
- Handling requirements for each category
- Labeling and marking standards
- Classification review process

### 4.2 Data Quality Management
- Data quality dimensions and metrics
- Monitoring and improvement processes
- Data quality issue resolution workflow
- Data quality tools and technologies

### 4.3 Security and Privacy
- Data protection requirements
- Access control measures
- Encryption standards
- Privacy compliance measures
- Data masking and anonymization

### 4.4 Compliance and Auditing
- Regulatory requirements mapping
- Audit procedures and schedules
- Documentation requirements
- Compliance monitoring and reporting
- Remediation processes

## 5. Review and Update

### 5.1 Policy Review
- Review frequency and process
- Roles and responsibilities
- Stakeholder engagement
- Review documentation

### 5.2 Change Management
- Process for updating the policy
- Version control and history
- Communication of changes
- Training and awareness
- Implementation tracking

### 5.3 Metrics and Reporting
- Key performance indicators
- Reporting requirements
- Dashboard and visualization
- Performance benchmarks
- Continuous improvement initiatives
- Industry best practices`;
    }
}

// Export the class directly for proper instantiation
