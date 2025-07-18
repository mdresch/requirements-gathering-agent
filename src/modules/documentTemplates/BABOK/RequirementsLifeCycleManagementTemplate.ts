import { ProjectContext } from '../../../index.js';

/**
 * RequirementsLifeCycleManagementTemplate
 * Template for BABOK Requirements Life Cycle Management document.
 * Provides structure and default content for the document.
 */
export class RequirementsLifeCycleManagementTemplate {
  /**
   * Generate the default content for the Requirements Life Cycle Management document.
   * @param context ProjectContext for dynamic content population
   * @returns Markdown string for the document
   */
  generateContent(context: ProjectContext): string {
    return `# Requirements Life Cycle Management

This document describes the processes and tasks for managing requirements throughout their life cycle, as defined in BABOK.

## Purpose
- Define how requirements are traced, maintained, prioritized, and approved.
- Ensure requirements are aligned with business objectives and stakeholder needs.

## Key Sections
- Trace Requirements
- Maintain Requirements
- Prioritize Requirements
- Assess Requirements Changes
- Approve Requirements

## Approach
Describe the approach for each of the above sections, referencing project context as needed.

---
*This document is generated based on the project context and BABOK best practices.*
`;
  }
}
