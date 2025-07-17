import { ProjectContext } from '../../ai/types.js';

export class ReferenceDataManagementPlanTemplate {
  buildPrompt(context: ProjectContext): string {
    return `
# Reference Data Management Plan

## 1. Introduction

- **Purpose:** Define the strategy and framework for managing reference data across the enterprise to ensure consistency, accuracy, and accessibility.
- **Scope:** This plan applies to all critical reference data domains used within the organization.

## 2. Roles & Responsibilities

- **Data Stewards:** Responsible for the accuracy and completeness of specific reference data domains.
- **Data Owners:** Accountable for the overall governance and quality of reference data.
- **IT Department:** Manages the technical infrastructure supporting reference data management.

## 3. Reference Data Identification & Sourcing

- **Identification Process:** Describe how new reference data sets are identified and proposed.
- **Approved Sources:** List the authoritative sources for key reference data (e.g., ISO codes, industry standards).

## 4. Reference Data Storage & Modeling

- **Central Repository:** Detail the architecture of the central repository for reference data.
- **Data Model:** Explain the standard model for storing and relating reference data sets.

## 5. Reference Data Maintenance & Governance

- **Change Management:** Outline the process for requesting, approving, and implementing changes to reference data.
- **Versioning:** Describe the strategy for versioning reference data to support historical reporting and audit trails.

## 6. Reference Data Distribution & Access

- **Access Mechanisms:** Specify how consuming systems and users can access reference data (e.g., APIs, replication).
- **Security:** Define access controls and permissions for different user roles.

## 7. Quality & Compliance

- **Quality Metrics:** Define the key quality dimensions (e.g., accuracy, completeness, timeliness) and associated metrics.
- **Compliance:** Ensure the management of reference data complies with relevant regulations.

Based on the project context below, please populate this Reference Data Management Plan.

**Project Context:**
${JSON.stringify(context, null, 2)}
`;
  }
}
