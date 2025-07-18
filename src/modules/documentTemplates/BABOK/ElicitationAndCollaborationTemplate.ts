import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Elicitation & Collaboration (BABOK)
 * Returns a structured markdown outline for the document.
 */
export class ElicitationAndCollaborationTemplate {
  generateContent(context: ProjectContext): string {
    return `# Elicitation & Collaboration

**Purpose:** Define the tasks and techniques used to elicit requirements and foster collaboration among stakeholders.

## 1. Introduction
- Purpose and scope of elicitation & collaboration
- Key stakeholders

## 2. Elicitation Preparation
- Identify stakeholders and sources
- Select elicitation techniques
- Prepare materials and logistics

## 3. Conduct Elicitation
- Execute elicitation activities (workshops, interviews, surveys, etc.)
- Capture and document information

## 4. Confirm Elicitation Results
- Validate findings with stakeholders
- Address gaps and ambiguities

## 5. Collaboration & Communication
- Ongoing stakeholder engagement
- Communication methods and frequency

## 6. Revision History
- Date, author, summary of changes
`;
  }
}
