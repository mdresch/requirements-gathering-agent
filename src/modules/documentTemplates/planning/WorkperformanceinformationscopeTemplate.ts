import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Work Performance Information (Scope) document
 * Scope-related work performance information following PMBOK guidelines
 */
export class WorkperformanceinformationscopeTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Scope Performance Metrics',
      'Deliverable Status',
      'Change Requests',
      'Variance Analysis',
      'Recommendations',
      'Next Steps'
    ];
  }

  getMetadata() {
    return {
      title: 'Work Performance Information (Scope)',
      description: 'Comprehensive scope-related work performance information document',
      version: '1.0.0',
      category: 'management-plans'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Work Performance Information (Scope) document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Work Performance Information (Scope)

## 1. Executive Summary
- Current scope performance status
- Key achievements and deliverables
- Critical issues and risks

## 2. Scope Performance Metrics
- Scope completion percentage
- Deliverable acceptance rates
- Work package completion status
- Schedule performance indicators

## 3. Deliverable Status
- Completed deliverables
- In-progress deliverables
- Pending deliverables
- Quality assessment results

## 4. Change Management
- Approved scope changes
- Pending change requests
- Impact assessment
- Change implementation status

## 5. Variance Analysis
- Planned vs. actual scope
- Performance deviations
- Root cause analysis
- Corrective actions taken

## 6. Stakeholder Feedback
- Client acceptance status
- Stakeholder satisfaction
- Feedback incorporation
- Communication effectiveness

## 7. Recommendations
- Process improvements
- Resource adjustments
- Risk mitigation strategies
- Next period planning

**Instructions:**
- Use professional project management language
- Include specific metrics and KPIs
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make recommendations actionable`;
  }

  generateContent(): string {
    return `# Work Performance Information (Scope)

## 1. Executive Summary

This document provides comprehensive work performance information related to project scope management and deliverable completion.

## 2. Scope Performance Metrics

### Key Performance Indicators:
- **Scope Completion**: 75%
- **Deliverable Acceptance Rate**: 92%
- **Work Package Completion**: 68%
- **Schedule Performance Index**: 0.95

## 3. Deliverable Status

### Completed Deliverables:
- Requirements documentation
- System design specifications
- Initial prototype development

### In-Progress Deliverables:
- User interface development
- Database implementation
- Integration testing

## 4. Change Management

### Recent Changes:
- **CR-001**: Additional reporting features
- **CR-002**: Enhanced security requirements
- **CR-003**: Modified user interface design

## 5. Performance Analysis

### Variance Summary:
- Minor schedule delays in testing phase
- Budget within approved limits
- Quality metrics exceeding targets

## 6. Recommendations

### Immediate Actions:
1. Accelerate testing activities
2. Enhance communication protocols
3. Implement additional quality checks
4. Prepare for next phase deliverables`;
  }
}
