import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Validate Scope Process document
 * Scope validation process following PMBOK guidelines
 */
export class ValidatescopeTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Process Overview',
      'Validation Approach',
      'Acceptance Criteria',
      'Validation Activities',
      'Stakeholder Involvement',
      'Documentation Requirements',
      'Sign-off Procedures'
    ];
  }

  getMetadata() {
    return {
      title: 'Validate Scope Process',
      description: 'Comprehensive scope validation process document',
      version: '1.0.0',
      category: 'scope-management'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Validate Scope Process document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Validate Scope Process

## 1. Introduction
- Purpose of scope validation
- Relationship to quality control
- Integration with project deliverables

## 2. Process Overview
- Validation methodology
- Key activities and milestones
- Process triggers and timing

## 3. Validation Approach
- Inspection techniques
- Review procedures
- Testing methodologies
- Acceptance protocols

## 4. Acceptance Criteria
- Functional acceptance criteria
- Quality standards
- Performance requirements
- Completion definitions

## 5. Validation Activities
- Deliverable inspections
- Stakeholder reviews
- Compliance verification
- Documentation validation

## 6. Stakeholder Involvement
- Customer participation
- User acceptance procedures
- Sponsor approval process
- Team validation responsibilities

## 7. Documentation and Records
- Validation checklists
- Acceptance documentation
- Issue tracking
- Sign-off records

## 8. Non-conformance Handling
- Rejection procedures
- Rework processes
- Issue resolution
- Re-validation requirements

**Instructions:**
- Use professional project management language
- Include specific validation procedures
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make procedures actionable and measurable`;
  }

  generateContent(): string {
    return `# Validate Scope Process

## 1. Introduction

The Validate Scope process formalizes acceptance of completed project deliverables through systematic review and approval by stakeholders.

## 2. Process Overview

### Key Objectives:
- Ensure deliverable completeness
- Verify acceptance criteria fulfillment
- Obtain formal stakeholder acceptance
- Document validation results

### Process Timing:
- Milestone-based validation
- Phase gate reviews
- Deliverable completion points
- Project closure validation

## 3. Validation Approach

### Inspection Methods:
- Visual inspections
- Functional testing
- Performance verification
- Documentation review

### Review Techniques:
- Structured walkthroughs
- Peer reviews
- Expert evaluations
- Customer demonstrations

## 4. Acceptance Criteria

### Functional Criteria:
- Feature completeness
- Business requirement satisfaction
- User story acceptance
- System integration verification

### Quality Criteria:
- Performance standards
- Reliability requirements
- Usability benchmarks
- Security compliance

### Documentation Criteria:
- Technical documentation
- User documentation
- Training materials
- Support documentation

## 5. Validation Activities

### Pre-validation:
- Deliverable readiness assessment
- Quality control verification
- Documentation completeness check
- Stakeholder notification

### Validation Execution:
- Systematic inspection
- Acceptance testing
- Stakeholder review sessions
- Issue identification and tracking

### Post-validation:
- Acceptance documentation
- Issue resolution tracking
- Re-validation scheduling
- Lessons learned capture

## 6. Stakeholder Roles

### Customer/Sponsor:
- Final acceptance authority
- Business validation
- Strategic alignment verification
- Formal sign-off

### End Users:
- Functional validation
- Usability testing
- Operational readiness
- Training adequacy

### Project Team:
- Technical validation
- Quality verification
- Documentation support
- Issue resolution

## 7. Documentation Framework

### Validation Checklists:
- Acceptance criteria verification
- Quality standard compliance
- Documentation completeness
- Performance benchmark achievement

### Acceptance Records:
- Formal acceptance certificates
- Sign-off documentation
- Issue logs and resolutions
- Validation evidence

## 8. Non-conformance Management

### Rejection Process:
1. Issue identification
2. Impact assessment
3. Corrective action planning
4. Rework authorization
5. Re-validation scheduling

### Issue Resolution:
- Root cause analysis
- Corrective measures
- Process improvements
- Prevention strategies

## 9. Continuous Improvement

### Process Enhancement:
- Validation effectiveness review
- Stakeholder feedback incorporation
- Process optimization
- Best practice identification`;
  }
}
