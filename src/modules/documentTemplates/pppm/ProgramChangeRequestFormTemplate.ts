import type { ProjectContext } from '../../ai/types';

/**
 * Program Change Request Form Template
 *
 * This template provides a PMO/PMBOK-compliant change request form for program-level changes.
 * It is designed to capture, assess, and manage change requests that impact multiple projects, program objectives, or cross-project dependencies.
 */
export class ProgramChangeRequestFormTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Generate comprehensive Program Change Request Form content
   */
  generateContent(): string {
    const programName = this.context.programName || 'Program';
    const programManager = this.context.programManager || '[Program Manager]';
    const requestDate = new Date().toISOString().split('T')[0];
    return `# Program Change Request Form\n\n**Program Name:** ${programName}  \n**Program Manager:** ${programManager}  \n**Request Date:** ${requestDate}\n\n---\n\n## 1. Change Request Details\n\n- **Change Request ID:** [To be assigned]\n- **Submitted By:** [Name, Role]\n- **Affected Projects:** [List all impacted projects]\n- **Change Type:** [Scope / Schedule / Budget / Resource / Other]\n- **Priority:** [High / Medium / Low]\n- **Requested Change Description:**\n  - [Describe the requested change, rationale, and objectives]\n- **Reason for Change:**\n  - [Explain why this change is needed at the program level]\n- **Date Required:** [YYYY-MM-DD]\n\n---\n\n## 2. Impact Assessment\n\n- **Impact on Program Objectives:**\n  - [Describe how the change will affect program goals, deliverables, or value realization]\n- **Impact on Projects:**\n  - [List affected projects and describe specific impacts]\n- **Impact on Schedule:**\n  - [Summarize schedule changes, delays, or accelerations]\n- **Impact on Budget:**\n  - [Summarize budget changes, additional funding required, or cost savings]\n- **Impact on Resources:**\n  - [Describe resource reallocation, new resource needs, or skill gaps]\n- **Impact on Risks:**\n  - [Identify new or changed risks resulting from this change]\n- **Stakeholder Impact:**\n  - [Describe how stakeholders will be affected and communication needs]\n\n---\n\n## 3. Change Evaluation & Recommendation\n\n- **Evaluation by Program Manager:**\n  - [Program Manager's analysis and recommendation]\n- **Evaluation by PMO/Steering Committee:**\n  - [Committee review, comments, and recommendation]\n- **Alternatives Considered:**\n  - [List alternative solutions or approaches]\n- **Decision Criteria:**\n  - [List criteria used to evaluate the change request]\n\n---\n\n## 4. Approval & Authorization\n\n| Role                  | Name                | Signature         | Date         |\n|-----------------------|---------------------|-------------------|--------------|\n| Program Manager       | [Name]              |                   |              |\n| PMO Director          | [Name]              |                   |              |\n| Steering Committee    | [Name(s)]           |                   |              |\n\n---\n\n## 5. Implementation Plan\n\n- **Implementation Owner:** [Name]\n- **Implementation Steps:**\n  - [List key steps, milestones, and deliverables]\n- **Timeline:** [Start and end dates]\n- **Monitoring & Reporting:**\n  - [Describe how progress will be tracked and reported]\n\n---\n\n## 6. Change Log\n\n| Change Request ID | Date       | Description of Change | Status   |\n|-------------------|------------|----------------------|----------|\n| [ID]              | [YYYY-MM-DD] | [Description]        | [Open/Closed] |\n\n---\n\n*This Program Change Request Form is designed for program-level change management, ensuring all significant changes are evaluated, approved, and tracked in alignment with PMO/PMBOK best practices.*\n`;
  }
}
