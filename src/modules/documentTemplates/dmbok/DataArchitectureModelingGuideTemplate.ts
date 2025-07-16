import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for generating a Data Architecture & Modeling Guide (DMBOK)
 */
export class DataArchitectureModelingGuideTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  /**
   * Returns the skeletal markdown structure that the LLM will flesh out.
   */
  generateContent(): string {
    return `
# Data Architecture & Modeling Guide for ${this.context.projectName}

## 1. Introduction
- Purpose and scope of the guide
- Alignment with organisational data strategy

## 2. Architectural Principles
- Core data architecture principles
- Technology stack overview

## 3. Current vs Target Architecture
### 3.1 Current State
### 3.2 Target State
### 3.3 Gap Analysis

## 4. Data Modeling Standards
- Naming conventions
- Normalisation / denormalisation guidelines
- Modelling notation (e.g.
  Crow’s Foot, IDEF1X)

## 5. Logical Data Model
- Domain entities and relationships
- Key attributes and constraints

## 6. Physical Data Model
- Schema per environment
- Indexing & partitioning
- Performance considerations

## 7. Master & Reference Data Considerations

## 8. Governance & Stewardship
- Roles and responsibilities
- Change-control process for data models

## 9. Tooling & Repository Management
- Modelling tools
- Version control strategy

## 10. Implementation Roadmap
- Phased approach & milestones

## 11. Approval
`;
  }
}
