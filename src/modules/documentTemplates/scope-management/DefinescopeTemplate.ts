import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Define Scope Process document
 * Scope definition process following PMBOK guidelines
 */
export class DefinescopeTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Process Overview',
      'Inputs and Tools',
      'Scope Definition Activities',
      'Project Scope Statement',
      'Deliverables Definition',
      'Acceptance Criteria',
      'Outputs and Documentation'
    ];
  }

  getMetadata() {
    return {
      title: 'Define Scope Process',
      description: 'Comprehensive scope definition process document',
      version: '1.0.0',
      category: 'scope-management'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Define Scope Process document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Define Scope Process

## 1. Introduction
- Purpose of scope definition
- Integration with project charter
- Alignment with requirements management

## 2. Process Overview
- Scope definition methodology
- Key activities and milestones
- Process flow and decision points

## 3. Inputs and Prerequisites
- Project charter inputs
- Requirements documentation
- Stakeholder register
- Organizational process assets

## 4. Scope Definition Activities
- Requirements analysis and refinement
- Product scope vs. project scope
- Scope boundary identification
- Constraint and assumption analysis

## 5. Project Scope Statement Development
- Scope description
- Major deliverables identification
- Acceptance criteria definition
- Project exclusions and boundaries

## 6. Deliverables and Work Products
- Primary deliverables listing
- Supporting deliverables
- Quality requirements
- Performance criteria

## 7. Validation and Approval
- Stakeholder review process
- Approval workflow
- Sign-off procedures
- Change control integration

**Instructions:**
- Use professional project management language
- Include specific procedures and examples
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make procedures actionable`;
  }

  generateContent(): string {
    return `# Define Scope Process

## 1. Introduction

The Define Scope process establishes a detailed description of the project and product scope, creating the foundation for all project work and decision-making.

## 2. Process Overview

### Key Objectives:
- Develop detailed project scope statement
- Define project boundaries and exclusions
- Establish acceptance criteria
- Create scope baseline foundation

### Process Flow:
1. Requirements analysis
2. Scope statement development
3. Stakeholder validation
4. Scope approval and baseline

## 3. Inputs and Tools

### Primary Inputs:
- Project charter
- Requirements documentation
- Stakeholder register
- Enterprise environmental factors

### Tools and Techniques:
- Expert judgment
- Product analysis
- Alternative identification
- Facilitated workshops

## 4. Scope Definition Activities

### Requirements Analysis:
- Functional requirements review
- Non-functional requirements analysis
- Business rules identification
- Constraint analysis

### Scope Boundaries:
- What is included in the project
- What is explicitly excluded
- Interface definitions
- Dependencies identification

## 5. Project Scope Statement

### Core Components:
- Product scope description
- Project deliverables
- Acceptance criteria
- Project constraints
- Assumptions
- Project exclusions

## 6. Deliverables Framework

### Primary Deliverables:
- Main project outputs
- Supporting documentation
- Quality artifacts
- Acceptance deliverables

### Acceptance Criteria:
- Functional acceptance criteria
- Quality standards
- Performance benchmarks
- Completion definitions

## 7. Validation Process

### Review Activities:
- Stakeholder workshops
- Expert reviews
- Requirements traceability
- Impact assessment

### Approval Workflow:
1. Technical review
2. Business validation
3. Sponsor approval
4. Baseline establishment`;
  }
}
