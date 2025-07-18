import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for the Enterprise Data Dictionary document.
 * @param context Project context and relationships
 * @returns Markdown string for the Enterprise Data Dictionary
 */
export function generateContent(context: ProjectContext): string {
  return `# Enterprise Data Dictionary for ${context.projectName}

## Introduction
- Purpose and Scope
- How to Use This Dictionary
- Update and Maintenance Process

## Business Glossary
- Business Terms and Definitions
- Business Rules
- Related Terms
- Business Owners

## Technical Dictionary
- Database Tables and Views
- Data Elements and Attributes
- Data Types and Formats
- Relationships and Dependencies

## Data Lineage
- Source to Target Mappings
- Transformation Rules
- Data Flow Diagrams
- Impact Analysis

## Data Quality Rules
- Validation Rules
- Quality Metrics
- Data Quality Issues
- Improvement Initiatives

## Security and Compliance
- Data Classification
- Access Controls
- Privacy Requirements
- Audit Trails

## Appendices
- Data Dictionary Standards
- Naming Conventions
- Change History
- Contact Information
`;
}
