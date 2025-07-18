import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for the Data Architecture & Quality document.
 * @param context Project context and relationships
 * @returns Markdown string for the Data Architecture & Quality document
 */
export function generateContent(context: ProjectContext): string {
  return `# Data Architecture & Quality for ${context.projectName}

## Introduction
- Purpose and Scope
- Alignment with Enterprise Architecture
- Stakeholders

## Data Architecture Principles
- Core Principles
- Reference Architectures
- Standards and Guidelines

## Current State Assessment
- Existing Data Architecture
- Data Flows and Integration Points
- Gaps and Challenges

## Target Data Architecture
- Future State Vision
- Technology Stack
- Data Models and Schemas
- Integration Architecture

## Data Quality Management
- Data Quality Dimensions
- Data Profiling and Assessment
- Data Cleansing and Enrichment
- Data Quality Metrics and KPIs

## Governance and Compliance
- Data Governance Structure
- Policies and Standards
- Regulatory and Compliance Requirements

## Implementation Roadmap
- Phased Approach
- Key Milestones
- Resource Requirements
- Success Metrics

## Appendices
- Glossary
- Reference Models
- Tools and Technologies
- Case Studies
- References
`;
}
