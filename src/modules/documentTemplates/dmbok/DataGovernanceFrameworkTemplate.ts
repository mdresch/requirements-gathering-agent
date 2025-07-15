// Update the import path to the correct location of ProjectContext, or define it if missing
import { ProjectContext } from '../../ai/types';
// If '../../ai/types' is not correct, adjust the path as needed based on your project structure.
// If ProjectContext does not exist, define it here as a temporary fix:
// export interface ProjectContext {
//   projectName: string;
//   // add other properties as needed
// }

export class DataGovernanceFrameworkTemplate {
  buildPrompt(context: ProjectContext): string {
    const today = new Date().toISOString().split('T')[0];
    return `# Data Governance Framework for the ${context.projectName}

Document ID: DG-FRM-001  
Version: 1.0  
Status: Proposed  
Date: ${today}

## 1. Introduction & Purpose
### 1.1 Purpose
This document establishes the formal Data Governance Framework for the ${context.projectName}. It operationalizes the principles outlined in the Data Management Strategy by defining the specific roles, responsibilities, policies, standards, and decision-making processes that govern the platform's data assets.

The primary purpose of this framework is to ensure that all data created, managed, and processed by ${context.projectName} is treated as a strategic asset—one that is secure, trustworthy, high-quality, and managed in a compliant and consistent manner. This framework is a core component of DMBOK 2.0 implementation and a prerequisite for achieving "Fortune 500 Ready" status.

### 1.2 Scope
This framework applies to all data domains within the ${context.projectName} ecosystem, including:
- **Generated Data**: All documents produced by the framework (e.g., Project Charters, Business Cases, Requirements Documents).
- **Reference Data & Templates**: The documentTemplates that define the structure and standards for generated documents.
- **Configuration & Security Data**: API keys, OAuth credentials, user roles, and system configurations stored in .env files or a future secrets management system.
- **Metadata**: Data lineage, usage logs, performance metrics, and any other data describing the context of data creation and processing.

## 2. Governance Principles
Our governance approach is guided by the following principles, which extend those defined in the Data Management Strategy:
- **Governance is a Shared Responsibility**: Every user of the ${context.projectName}, from developers to business analysts, has a role to play in upholding data quality and security.
- **Governance Must be Practical and Enabling**: The policies and processes defined here are designed to enable efficient, high-quality work, not to create unnecessary bureaucracy. We will favor automation and integration over manual checks where possible.
- **Decisions are Transparent and Traceable**: All governance decisions, especially those concerning policies and standards, will be documented and communicated. The "why" behind a decision is as important as the "what."
- **Security and Compliance are Non-Negotiable**: The framework will enforce the security controls and standards necessary to meet enterprise and regulatory requirements (e.g., GDPR, SOX, PCI DSS) by default.
- **Continuous Improvement is Embedded**: This framework is a living document. It will be actively monitored, measured, and refined based on feedback and the evolving needs of the ${context.projectName} platform.

## 3. Roles & Responsibilities
Clear roles are essential for effective governance. The following roles are formally established for the ${context.projectName} project.

| Role | Definition | Key Responsibilities within ${context.projectName} |
|------|------------|-----------------------------------------------|
| Data Governance Council (DGC) | A cross-functional group of senior stakeholders accountable for the overall direction and effectiveness of the data governance program. | - Approve and ratify all data policies.<br>- Resolve escalated data-related conflicts.<br>- Secure resources for data management initiatives.<br>- Review and approve the data management roadmap. |
| Data Steward | Subject matter experts responsible for the day-to-day management of a specific data domain, ensuring it meets quality and policy requirements. | - Template Steward: Manages the lifecycle of documentTemplates (e.g., BABOK, PMBOK). Ensures they are compliant with external standards.<br>- Security Steward: Manages policies related to API keys, authentication, and access control. |
| Data Custodian | The IT or DevOps team responsible for the technical environment where data is stored, moved, and processed. | - Manages the infrastructure running the ${context.projectName} REST API and Admin Interface.<br>- Implements and maintains data security controls (e.g., encryption, backups).<br>- Manages the Azure, Confluence, and SharePoint integrations at a technical level. |
| Data Owner | A business leader accountable for the quality, security, and use of data within their functional area. | A Project Director or Head of Business Analysis who relies on ${context.projectName} to produce documentation for their teams. They are accountable for the ultimate fitness-for-purpose of the generated assets. |

### RACI Matrix for Key Data Activities

| Activity | Data Governance Council (DGC) | Data Owner | Data Steward | Data Custodian |
|----------|-------------------------------|------------|--------------|----------------|
| Approving a new Document Template | A | C | R | I |
| Managing API Keys & Secrets | A | I | C | R |
| Defining Data Quality Rules | A | C | R | I |
| Resolving a Data Quality Issue | A | C | R | C |
| Defining Data Retention Policy | A | C | R | I |
| Implementing Access Controls | A | I | C | R |
| Responding to a Data Breach | A | I | R | R |

## 4. Data Policies & Standards
The following policies are hereby established. Each policy will have detailed standards and procedures developed as part of its implementation.

### 4.1 Template Governance Policy
**Policy Statement:** All document templates used by ${context.projectName} must be version-controlled, validated against external standards (where applicable), and approved by the designated Data Steward before being deployed to production.

**Key Standards:**
- Templates must be stored in the src/modules/documentTemplates/ directory and follow a consistent naming convention.
- Each template requires a metadata block defining its name, version, description, and dmbokRef or equivalent standard.
- A formal review process (e.g., a GitHub Pull Request) is required for all changes to production templates.

### 4.2 Data Security & Access Control Policy
**Policy Statement:** Access to ${context.projectName} data and functions will be granted based on the principle of least privilege. Sensitive data, including credentials and user information, must be encrypted both in transit and at rest.

**Key Standards:**
- Sensitive credentials (e.g., OPENAI_API_KEY) must not be committed to version control and should be managed via a centralized secret manager (e.g., Azure Key Vault).
- The REST API must enforce authentication and authorization on all endpoints.
- Role-Based Access Control (RBAC) will be implemented for the Admin UI and collaborative features, aligning with the roles defined in this framework.

### 4.3 Metadata Management Policy
**Policy Statement:** All critical data assets generated or managed by ${context.projectName} must be accompanied by a standard set of metadata to ensure traceability, context, and auditability.

**Key Standards:**
- Every document generated must include a metadata block containing at least: documentId, templateId, templateVersion, generationTimestamp, aiProviderUsed, and userId (when available).
- This metadata must be persisted when documents are published to external systems like SharePoint or Confluence, using native features like columns or labels.

### 4.4 Data Lifecycle Management Policy
**Policy Statement:** All data within the ${context.projectName} ecosystem will have a defined lifecycle, from creation to archival and final disposition, to manage costs and reduce risk.

**Key Standards:**
- Generated Documents: Default retention of 7 years, then archived.
- Operational Logs: Retained for 90 days in a hot state, then archived for 1 year.
- Inactive Templates: Marked as "deprecated" after 1 year of inactivity and archived after 2 years.

## 5. Decision Rights & Escalation
Clear decision rights prevent ambiguity and delays. The following process will be used to resolve data-related issues and make decisions.

| Decision Type | Primary Decision Maker | Escalation Path |
|---------------|-----------------------|-----------------|
| Operational Issue (e.g., data quality error in a single document) | Data Steward | If unresolved, escalate to the relevant Data Owner. |
| New Template Request | Data Steward (for the relevant domain) | If the request is contentious or has major resource implications, it is escalated to the Data Governance Council (DGC) for prioritization. |
| Policy Exception Request | Data Steward | Any request for an exception to a formal policy must be approved by the Data Governance Council (DGC). |
| Conflict Between Stewards | The respective Data Stewards should attempt to resolve first. | If no agreement can be reached, the conflict is escalated to the Data Governance Council (DGC) for a binding decision. |

## 6. Compliance & Regulatory Alignment
This framework provides the necessary controls to help ${context.projectName} and its users comply with key regulations.

| Regulation / Standard | How This Framework Provides Support |
|----------------------|-------------------------------------|
| DMBOK 2.0 | This entire document is a foundational artifact for the Data Governance knowledge area, establishing the necessary structures and processes. |
| GDPR | - Roles & Responsibilities: Clearly defines accountability for personal data.<br/>- Data Security Policy: Enforces technical measures for data protection.<br/>- Data Lifecycle Policy: Ensures data is not kept longer than necessary. |
| SOX, FINRA, MiFID II | - Metadata Policy: Guarantees auditability and traceability of financial and governance documents.<br/>- RACI Matrix: Establishes clear accountability, a key requirement for internal controls. |
| HIPAA | The Data Security & Access Control Policy is critical for protecting any potential PHI processed by the framework, ensuring encrypted transit and strict access controls. |

## 7. Monitoring & Continuous Improvement
The effectiveness of this framework will be measured and improved through the following mechanisms:

### 7.1 Governance Metrics
A dashboard will be maintained by the Data Governance Council to track key metrics, including:
- Policy Adherence: % of new templates that follow the Template Governance Policy.
- Data Quality: # of data quality issues reported and resolved per quarter.
- Decision Velocity: Average time to resolve an escalated governance issue.
- Framework Maturity: Annual self-assessment against the DMBOK Data Governance maturity model.

### 7.2 Review Cadence
- **Data Steward Sync (Monthly):** A meeting for Data Stewards to discuss operational issues, ongoing improvements, and challenges.
- **Data Governance Council Meeting (Quarterly):** A formal meeting to review governance metrics, ratify new policies, and address escalated issues.
- **Framework Review (Annually):** A comprehensive review and update of this Data Governance Framework document to ensure it remains relevant and effective.`;
    }
  }