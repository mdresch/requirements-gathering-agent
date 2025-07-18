
import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Business Analysis Planning & Monitoring (BABOK)
 * Returns a structured markdown outline for the document.
 */
export class BusinessAnalysisPlanningAndMonitoringTemplate {
  generateContent(context: ProjectContext): string {
    return `# Business Analysis Planning & Monitoring

**Purpose:** Define the tasks used to organize and coordinate business analysis efforts.

## 1. Introduction
- Purpose and scope of planning & monitoring
- Key stakeholders

## 2. Planning Approach
- Methodologies and deliverables
- Roles and responsibilities

## 3. Monitoring & Reporting
- Mechanisms for tracking progress
- Reporting structure

## 4. Review & Validation
- Stakeholder review process
- Approval workflow

## 5. Revision History
- Date, author, summary of changes
`;
  }
}
