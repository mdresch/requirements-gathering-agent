import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Control Scope Process document
 * Scope control process following PMBOK guidelines
 */
export class ControlscopeTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Process Overview',
      'Change Control System',
      'Performance Monitoring',
      'Variance Analysis',
      'Change Management',
      'Corrective Actions',
      'Reporting and Communication'
    ];
  }

  getMetadata() {
    return {
      title: 'Control Scope Process',
      description: 'Comprehensive scope control process document',
      version: '1.0.0',
      category: 'scope-management'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Control Scope Process document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Control Scope Process

## 1. Introduction
- Purpose of scope control
- Integration with change control
- Relationship to performance monitoring

## 2. Process Overview
- Control methodology
- Monitoring procedures
- Change management integration
- Performance measurement

## 3. Change Control System
- Change request procedures
- Impact assessment process
- Approval workflows
- Implementation procedures

## 4. Performance Monitoring
- Scope performance indicators
- Measurement methods
- Reporting frequency
- Threshold definitions

## 5. Variance Analysis
- Variance identification methods
- Root cause analysis
- Impact assessment
- Trend analysis

## 6. Corrective and Preventive Actions
- Action planning process
- Implementation procedures
- Effectiveness monitoring
- Continuous improvement

## 7. Communication and Reporting
- Status reporting procedures
- Stakeholder communication
- Escalation procedures
- Documentation requirements

## 8. Tools and Techniques
- Performance measurement tools
- Analysis techniques
- Reporting systems
- Change control tools

**Instructions:**
- Use professional project management language
- Include specific control procedures
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make procedures actionable and measurable`;
  }

  generateContent(): string {
    return `# Control Scope Process

## 1. Introduction

The Control Scope process monitors the status of the project scope and manages changes to the scope baseline, ensuring project deliverables remain aligned with approved requirements.

## 2. Process Overview

### Key Objectives:
- Monitor scope performance
- Control scope changes
- Ensure baseline integrity
- Manage stakeholder expectations

### Control Activities:
- Performance measurement
- Variance analysis
- Change evaluation
- Corrective action implementation

## 3. Change Control System

### Change Request Process:
1. Change identification
2. Request documentation
3. Impact assessment
4. Review and approval
5. Implementation
6. Baseline update

### Approval Authority:
- Minor changes: Project Manager
- Moderate changes: Steering Committee
- Major changes: Sponsor approval
- Scope reduction: Customer approval

## 4. Performance Monitoring

### Key Performance Indicators:
- Scope completion percentage
- Deliverable acceptance rate
- Change request frequency
- Scope variance percentage

### Measurement Methods:
- Earned value analysis
- Milestone tracking
- Deliverable status reporting
- Work package completion

### Monitoring Frequency:
- Daily: Work package progress
- Weekly: Deliverable status
- Monthly: Scope performance review
- Quarterly: Baseline assessment

## 5. Variance Analysis

### Variance Types:
- Schedule variance
- Scope variance
- Quality variance
- Resource variance

### Analysis Process:
1. Variance identification
2. Root cause analysis
3. Impact assessment
4. Trend analysis
5. Recommendation development

### Threshold Management:
- Green: ±5% variance
- Yellow: ±10% variance
- Red: >±10% variance

## 6. Change Management

### Change Categories:
- Scope additions
- Scope reductions
- Quality modifications
- Acceptance criteria changes

### Impact Assessment:
- Schedule impact
- Cost implications
- Resource requirements
- Risk assessment
- Quality impact

### Documentation Requirements:
- Change request form
- Impact analysis report
- Approval documentation
- Implementation plan
- Lessons learned

## 7. Corrective Actions

### Action Types:
- Process adjustments
- Resource reallocation
- Schedule modifications
- Quality improvements

### Implementation Process:
1. Action planning
2. Resource allocation
3. Timeline establishment
4. Implementation monitoring
5. Effectiveness evaluation

## 8. Communication Framework

### Reporting Structure:
- Daily stand-ups
- Weekly status reports
- Monthly performance dashboards
- Quarterly scope reviews

### Stakeholder Communication:
- Scope status updates
- Change notifications
- Performance alerts
- Milestone achievements

### Escalation Procedures:
- Level 1: Project team resolution
- Level 2: Project manager intervention
- Level 3: Steering committee review
- Level 4: Sponsor escalation

## 9. Tools and Techniques

### Monitoring Tools:
- Project management software
- Earned value management systems
- Performance dashboards
- Variance analysis tools

### Analysis Techniques:
- Trend analysis
- Root cause analysis
- What-if scenarios
- Risk assessment

## 10. Continuous Improvement

### Process Enhancement:
- Regular process reviews
- Stakeholder feedback
- Lessons learned integration
- Best practice adoption

### Performance Optimization:
- Process automation
- Tool enhancement
- Training programs
- Knowledge management`;
  }
}
