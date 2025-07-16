import type { ProjectContext } from '../../../index.js';

export class MetadataManagementFrameworkTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  generateContent(): string {
    return `
# Metadata Management Framework for ${this.context.projectName}

## 1. Introduction
- Purpose and Scope
- Alignment with Data Strategy
- Key Drivers and Business Benefits

## 2. Metadata Principles and Policies
- Core principles for metadata management
- Policies for metadata creation, storage, and access
- Data Stewardship and Ownership

## 3. Metadata Architecture
- Overview of the metadata repository
- Integration with data sources and tools
- Metadata discovery and harvesting mechanisms

## 4. Metadata Standards
- Business Metadata Standards (e.g., business glossary, data dictionary)
- Technical Metadata Standards (e.g., schemas, data lineage, mappings)
- Operational Metadata Standards (e.g., job execution logs, data quality metrics)

## 5. Roles and Responsibilities
- Data Stewards
- Data Owners
- Metadata Analysts
- IT and Data Management Teams

## 6. Processes and Workflows
- Metadata Capture and Registration
- Metadata Curation and Enrichment
- Change Management for Metadata
- Metadata Quality Assurance

## 7. Tooling and Technology
- Metadata Management Tools (e.g., data catalog, repository)
- Integration with other data management tools
- Version control and repository management

## 8. Implementation Roadmap
- Phased approach for implementation
- Key milestones and deliverables
- Training and communication plan

## 9. Governance and Monitoring
- Metrics and KPIs for metadata management
- Auditing and compliance checks
- Continuous improvement process

## 10. Approval

`;
  }
}
