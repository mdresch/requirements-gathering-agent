import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Scope Baseline document
 * Project scope baseline following PMBOK guidelines
 */
export class ScopebaselineTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Project Scope Statement',
      'Work Breakdown Structure',
      'WBS Dictionary',
      'Scope Baseline Components',
      'Change Control Procedures',
      'Performance Measurement',
      'Baseline Maintenance'
    ];
  }

  getMetadata() {
    return {
      title: 'Scope Baseline',
      description: 'Comprehensive project scope baseline document',
      version: '1.0.0',
      category: 'scope-management'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Scope Baseline document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Scope Baseline

## 1. Introduction
- Purpose of the scope baseline
- Baseline components overview
- Integration with project management plan

## 2. Project Scope Statement
- Product scope description
- Project deliverables
- Acceptance criteria
- Project boundaries and exclusions
- Constraints and assumptions

## 3. Work Breakdown Structure (WBS)
- WBS hierarchy
- Work package decomposition
- WBS levels and structure
- Deliverable-oriented organization

## 4. WBS Dictionary
- Work package descriptions
- Responsible organizations
- Required resources
- Cost estimates
- Quality requirements
- Acceptance criteria per work package

## 5. Scope Baseline Management
- Baseline approval process
- Change control procedures
- Performance measurement methods
- Baseline maintenance procedures

## 6. Scope Verification
- Verification criteria
- Acceptance procedures
- Quality gates
- Stakeholder sign-off requirements

## 7. Performance Monitoring
- Scope performance indicators
- Variance analysis methods
- Reporting procedures
- Corrective action triggers

**Instructions:**
- Use professional project management language
- Include specific baselines and measurements
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make baselines measurable and trackable`;
  }

  generateContent(): string {
    return `# Scope Baseline

## 1. Introduction

The Scope Baseline consists of the approved project scope statement, work breakdown structure (WBS), and WBS dictionary, serving as the foundation for scope management and control.

## 2. Project Scope Statement

### Product Scope:
- Primary product or service deliverables
- Key features and functionality
- Performance and quality characteristics
- Technical specifications

### Project Scope:
- Work required to deliver the product
- Project management activities
- Supporting processes and procedures
- Documentation requirements

### Acceptance Criteria:
- Functional acceptance criteria
- Performance benchmarks
- Quality standards
- Completion definitions

## 3. Work Breakdown Structure

### Level 1: Project
- Overall project deliverable

### Level 2: Major Deliverables
- Primary project outputs
- Major work streams
- Core deliverable categories

### Level 3: Sub-deliverables
- Detailed deliverable components
- Work package groupings
- Manageable work units

### Level 4: Work Packages
- Lowest level of WBS
- Assignable work units
- Measurable outcomes

## 4. WBS Dictionary

### Work Package Components:
- Unique identifier
- Work package description
- Responsible organization
- Required resources
- Estimated duration
- Cost estimates
- Quality requirements
- Acceptance criteria

### Dependencies:
- Predecessor activities
- Successor activities
- External dependencies
- Resource dependencies

## 5. Baseline Control

### Change Control Process:
1. Change request submission
2. Impact analysis
3. Approval workflow
4. Baseline update
5. Communication

### Performance Measurement:
- Scope completion percentage
- Deliverable acceptance rates
- Quality metrics
- Variance analysis

## 6. Verification and Validation

### Verification Procedures:
- Technical reviews
- Quality inspections
- Compliance checks
- Standards verification

### Validation Process:
- Stakeholder acceptance
- User acceptance testing
- Business validation
- Formal sign-off

## 7. Baseline Maintenance

### Update Procedures:
- Approved change integration
- Version control
- Documentation updates
- Stakeholder communication

### Audit and Review:
- Regular baseline reviews
- Compliance audits
- Performance assessments
- Improvement recommendations`;
  }
}
