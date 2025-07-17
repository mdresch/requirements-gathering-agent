import { ProjectContext } from '../../ai/types';

export class DataSecurityPrivacyPlanTemplate {
  buildPrompt(context: ProjectContext): string {
    const today = new Date().toISOString().split('T')[0];
    return `# Data Security & Privacy Plan for ${context.projectName}

Document ID: DSEC-PLN-001
Version: 1.0
Status: Proposed
Date: ${today}

## 1. Introduction

### 1.1 Purpose
This document outlines the Data Security and Privacy Plan for the ${context.projectName}. It defines the policies, procedures, controls, and responsibilities required to protect data assets from unauthorized access, use, disclosure, alteration, or destruction, and to ensure compliance with privacy regulations.

### 1.2 Scope
This plan applies to all data processed, stored, or transmitted by the ${context.projectName}, including:
- Customer Data
- Employee Data
- Financial Data
- Intellectual Property
- System and operational data

## 2. Security Policies

### 2.1 Data Classification Policy
- **Policy:** Data will be classified based on its sensitivity (e.g., Public, Internal, Confidential, Restricted).
- **Controls:** Access controls will be enforced based on data classification.

### 2.2 Access Control Policy
- **Policy:** Access to data and systems will be granted based on the principle of least privilege and role-based access control (RBAC).
- **Controls:** Multi-factor authentication (MFA), strong password policies, and regular access reviews.

### 2.3 Encryption Policy
- **Policy:** Sensitive data must be encrypted at rest and in transit.
- **Controls:** Use of industry-standard encryption protocols (e.g., TLS 1.3, AES-256).

### 2.4 Incident Response Policy
- **Policy:** A formal incident response plan will be maintained to detect, respond to, and recover from security incidents.
- **Controls:** Incident response team, communication plan, and post-incident review process.

## 3. Privacy Policies

### 3.1 Data Minimization
- **Policy:** Only personal data that is strictly necessary for a specific, legitimate purpose will be collected and processed.

### 3.2 Purpose Limitation
- **Policy:** Personal data will be used only for the purposes for which it was collected.
	
### 3.3 Data Subject Rights
- **Policy:** Procedures will be in place to honor data subject rights, including the right to access, rectify, and erase their personal data (in line with GDPR, CCPA, etc.).

## 4. Roles & Responsibilities

| Role | Responsibilities |
|---|---|
| Chief Information Security Officer (CISO) | Overall responsibility for the information security program. |
| Data Protection Officer (DPO) | Ensures compliance with data protection regulations. |
| IT Security Team | Implements and manages security controls. |
| All Employees | Responsible for adhering to security and privacy policies. |

## 5. Compliance

This plan is designed to comply with the following regulations and standards:
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- ISO/IEC 27001
- SOC 2

## 6. Training and Awareness

All employees will receive regular training on data security and privacy best practices and their responsibilities under this plan.

## 7. Plan Review and Maintenance

This plan will be reviewed and updated at least annually, or in response to significant changes in the threat landscape, business operations, or regulatory requirements.
`;
  }
}
