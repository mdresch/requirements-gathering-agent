import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Plan Scope Management document
 * Scope management planning process following PMBOK guidelines
 */
export class PlanscopemanagementTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Scope Management Approach',
      'Roles and Responsibilities',
      'Scope Definition Process',
      'Scope Validation Process',
      'Scope Control Process',
      'Documentation Requirements',
      'Communication Plan'
    ];
  }

  getMetadata() {
    return {
      title: 'Plan Scope Management',
      description: 'Comprehensive scope management planning document',
      version: '1.0.0',
      category: 'scope-management'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Plan Scope Management document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Plan Scope Management

## 1. Introduction
- Purpose and objectives of scope management
- Alignment with project management plan
- Integration with other knowledge areas

## 2. Scope Management Approach
- Methodology for scope planning
- Tools and techniques to be used
- Scope management lifecycle

## 3. Roles and Responsibilities
- Project manager responsibilities
- Stakeholder involvement
- Team member roles
- Authority levels and decision-making

## 4. Scope Definition Process
- Requirements gathering approach
- Scope statement development
- WBS creation methodology
- Acceptance criteria definition

## 5. Scope Validation Process
- Deliverable acceptance procedures
- Formal validation methods
- Stakeholder sign-off process
- Quality assurance integration

## 6. Scope Control Process
- Change control procedures
- Impact assessment methods
- Approval workflows
- Configuration management

## 7. Communication and Reporting
- Scope status reporting
- Stakeholder communication plan
- Documentation standards
- Meeting schedules and protocols

**Instructions:**
- Use professional project management language
- Include specific procedures and workflows
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make procedures actionable and clear`;
  }

  generateContent(): string {
    return `# Plan Scope Management

## 1. Introduction

This document establishes the comprehensive approach for planning, defining, validating, and controlling project scope throughout the project lifecycle.

## 2. Scope Management Approach

### Methodology:
- Requirements-driven scope definition
- Iterative scope refinement process
- Stakeholder-centric validation approach
- Change-controlled scope management

### Key Principles:
- Clear scope boundaries
- Stakeholder alignment
- Documented acceptance criteria
- Proactive change management

## 3. Roles and Responsibilities

### Project Manager:
- Overall scope management accountability
- Scope change approval authority
- Stakeholder communication coordination

### Business Analyst:
- Requirements gathering and analysis
- Scope documentation
- Impact assessment support

### Stakeholders:
- Requirements definition
- Scope validation and acceptance
- Change request initiation

## 4. Scope Definition Process

### Requirements Gathering:
1. Stakeholder interviews
2. Requirements workshops
3. Document analysis
4. Prototyping sessions

### Scope Documentation:
- Project scope statement
- Work breakdown structure
- Acceptance criteria
- Assumptions and constraints

## 5. Validation and Control

### Validation Methods:
- Formal deliverable reviews
- Stakeholder sign-off procedures
- Quality gate assessments

### Control Procedures:
- Change request workflow
- Impact assessment process
- Approval authority matrix
- Configuration management`;
  }
}
