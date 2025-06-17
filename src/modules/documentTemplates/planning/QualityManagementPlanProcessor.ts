import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Quality Management Plan document.
 */
export class QualityManagementPlanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a quality management expert specializing in creating comprehensive Quality Management Plans that ensure project deliverables meet stakeholder expectations and quality standards.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Quality Management Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Quality Management Plan processing:', error.message);
        throw new Error(`Failed to generate Quality Management Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Quality Management Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Quality Management Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive Quality Management Plan.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create a detailed quality management plan that establishes quality standards, processes, and controls for the project.

# Quality Management Plan

## Executive Summary
- Quality management approach and philosophy
- Key quality objectives and success criteria
- Quality governance structure

## Quality Policy and Objectives

### Project Quality Policy
- Organizational quality policy alignment
- Project-specific quality commitments
- Quality culture and values

### Quality Objectives
| Objective | Measurement | Target | Responsible Party |
|-----------|-------------|--------|-------------------|
| [Objective 1] | [Metric] | [Target Value] | [Role/Name] |
| [Objective 2] | [Metric] | [Target Value] | [Role/Name] |

### Success Criteria
- Customer satisfaction targets
- Defect rate thresholds
- Performance standards
- Compliance requirements

## Quality Standards and Requirements

### Applicable Standards
**Industry Standards:**
- [Standard 1]: [Description and applicability]
- [Standard 2]: [Description and applicability]

**Organizational Standards:**
- [Standard 1]: [Description and requirements]
- [Standard 2]: [Description and requirements]

**Regulatory Requirements:**
- [Requirement 1]: [Description and compliance approach]
- [Requirement 2]: [Description and compliance approach]

### Quality Requirements by Deliverable
| Deliverable | Quality Standard | Acceptance Criteria | Verification Method |
|-------------|------------------|-------------------|-------------------|
| [Deliverable 1] | [Standard] | [Criteria] | [Method] |
| [Deliverable 2] | [Standard] | [Criteria] | [Method] |

## Quality Planning

### Quality Planning Process
1. **Requirements Analysis:** [Process for identifying quality requirements]
2. **Standards Selection:** [Process for selecting applicable standards]
3. **Quality Metrics Definition:** [Process for defining quality measures]
4. **Quality Assurance Planning:** [Process for planning QA activities]
5. **Quality Control Planning:** [Process for planning QC activities]

### Quality Management Approach
**Prevention vs. Inspection:** [Emphasis on prevention over detection]
**Continuous Improvement:** [Approach to ongoing quality enhancement]
**Customer Focus:** [Methods for understanding and meeting customer needs]
**Total Quality Management:** [Integration of quality across all processes]

### Quality Baseline
- Initial quality measurements
- Performance benchmarks
- Quality targets and thresholds
- Trend analysis parameters

## Quality Assurance (QA) Processes

### QA Activities
**Process Audits:**
- Audit Schedule: [Frequency and timing]
- Audit Scope: [What processes will be audited]
- Audit Criteria: [Standards and requirements to audit against]
- Audit Team: [Who will conduct audits]

**Process Reviews:**
- Review Schedule: [Regular review meetings]
- Review Participants: [Stakeholders involved]
- Review Criteria: [What to evaluate]
- Review Documentation: [How results are recorded]

**Process Improvement:**
- Improvement Identification: [How to identify improvement opportunities]
- Improvement Implementation: [Process for implementing changes]
- Improvement Tracking: [How to monitor improvement effectiveness]

### QA Deliverables
- QA Plans and Procedures
- Audit Reports and Findings
- Process Improvement Recommendations
- Quality Assessment Reports

### QA Roles and Responsibilities
| Role | Responsibilities | Qualifications |
|------|-----------------|----------------|
| Quality Manager | [Key responsibilities] | [Required qualifications] |
| QA Analyst | [Key responsibilities] | [Required qualifications] |
| Process Owner | [Key responsibilities] | [Required qualifications] |

## Quality Control (QC) Processes

### QC Activities
**Deliverable Inspections:**
- Inspection Schedule: [When inspections occur]
- Inspection Methods: [How inspections are conducted]
- Inspection Criteria: [What is inspected]
- Inspection Documentation: [How results are recorded]

**Testing Procedures:**
- Test Planning: [How tests are planned]
- Test Execution: [How tests are conducted]
- Test Documentation: [How results are documented]
- Test Environment: [Testing infrastructure requirements]

**Quality Measurements:**
- Measurement Schedule: [When measurements are taken]
- Measurement Methods: [How quality is measured]
- Measurement Tools: [Tools used for measurement]
- Measurement Analysis: [How results are analyzed]

### QC Deliverables
- Inspection Reports
- Test Results and Analysis
- Quality Metrics Dashboard
- Non-conformance Reports

### QC Tools and Techniques
**Statistical Tools:**
- Control Charts: [Application and interpretation]
- Pareto Analysis: [Use for problem prioritization]
- Histogram Analysis: [Data distribution analysis]
- Scatter Diagrams: [Correlation analysis]

**Quality Tools:**
- Checklists: [Standardized inspection items]
- Flowcharts: [Process visualization]
- Cause and Effect Diagrams: [Root cause analysis]
- Design of Experiments: [Systematic testing approach]

## Quality Metrics and Measurement

### Quality Metrics Framework
**Process Metrics:**
- Process Efficiency: [Measurement and targets]
- Process Effectiveness: [Measurement and targets]
- Process Compliance: [Measurement and targets]

**Product Metrics:**
- Defect Density: [Defects per unit of work]
- Customer Satisfaction: [Satisfaction scores and surveys]
- Performance Metrics: [System/product performance measures]
- Reliability Metrics: [System availability and reliability]

**Project Metrics:**
- Schedule Performance: [Quality-related schedule metrics]
- Cost of Quality: [Prevention, appraisal, and failure costs]
- Rework Rates: [Percentage of work requiring rework]

### Measurement and Analysis Process
1. **Data Collection:** [Methods and frequency of data collection]
2. **Data Analysis:** [Analysis techniques and tools]
3. **Trend Analysis:** [Identifying patterns and trends]
4. **Performance Reporting:** [How results are communicated]
5. **Corrective Action:** [Response to performance issues]

### Quality Dashboard
- Key performance indicators display
- Real-time quality metrics
- Trend analysis and alerts
- Exception reporting

## Quality Governance

### Quality Organization Structure
**Quality Steering Committee:**
- Membership: [Senior stakeholders and quality experts]
- Charter: [Purpose, authority, and responsibilities]
- Meeting Schedule: [Regular meeting cadence]

**Quality Review Board:**
- Membership: [Technical and quality experts]
- Charter: [Review and approval authority]
- Review Criteria: [Standards for quality decisions]

### Quality Decision Making
**Decision Authority:** [Who makes quality-related decisions]
**Escalation Path:** [Process for escalating quality issues]
**Approval Requirements:** [What requires formal approval]

### Quality Documentation
**Quality Management System:** [Document hierarchy and control]
**Quality Procedures:** [Standardized process documentation]
**Quality Records:** [Evidence of quality activities]

## Risk Management for Quality

### Quality Risk Identification
**Common Quality Risks:**
- Requirements ambiguity or change
- Resource skill gaps
- Technology limitations
- Schedule pressure impact on quality
- Supplier quality issues

**Risk Assessment Matrix:**
| Risk | Probability | Impact | Risk Level | Mitigation Strategy |
|------|-------------|--------|------------|-------------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [H/M/L] | [Strategy] |

### Quality Risk Response
**Prevention Strategies:** [Proactive measures to prevent quality issues]
**Mitigation Plans:** [Actions to reduce quality risk impact]
**Contingency Plans:** [Response to quality incidents]
**Recovery Procedures:** [How to recover from quality failures]

## Continuous Improvement

### Improvement Process
1. **Identify Opportunities:** [Methods for finding improvement areas]
2. **Analyze Root Causes:** [Techniques for understanding problems]
3. **Design Solutions:** [Approach to developing improvements]
4. **Implement Changes:** [Process for implementing improvements]
5. **Verify Effectiveness:** [Methods for validating improvements]

### Lessons Learned
- Collection Process: [How lessons are captured]
- Documentation: [How lessons are recorded]
- Knowledge Sharing: [How lessons are communicated]
- Application: [How lessons are applied to future work]

### Best Practices
- Internal best practices identification
- External best practices research
- Best practices implementation
- Best practices maintenance

## Quality Training and Competence

### Training Requirements
**Quality Awareness:** [General quality training for all team members]
**Role-Specific Training:** [Specialized training for quality roles]
**Tool Training:** [Training on quality tools and techniques]
**Standards Training:** [Training on applicable standards]

### Competence Management
- Competence Requirements: [Skills and knowledge needed]
- Competence Assessment: [Methods for evaluating competence]
- Competence Development: [Training and development plans]
- Competence Verification: [Ongoing competence validation]

## Supplier Quality Management

### Supplier Selection
- Quality criteria for supplier evaluation
- Supplier qualification requirements
- Supplier assessment process
- Supplier certification requirements

### Supplier Management
- Quality agreements and contracts
- Supplier performance monitoring
- Supplier quality audits
- Supplier corrective action process

## Resource Requirements

### Human Resources
| Role | Quantity | Skills Required | Duration |
|------|----------|----------------|----------|
| Quality Manager | [#] | [Skills] | [Period] |
| QA Analysts | [#] | [Skills] | [Period] |
| QC Inspectors | [#] | [Skills] | [Period] |

### Tools and Equipment
- Quality management software
- Testing and measurement equipment
- Statistical analysis tools
- Documentation systems

### Budget
- Quality management costs
- Testing and inspection costs
- Tool and equipment costs
- Training costs

## Implementation Plan

### Quality Management Implementation
**Phase 1 - Setup:** [Initial quality system establishment]
**Phase 2 - Execution:** [Ongoing quality activities]
**Phase 3 - Review:** [Quality system evaluation and improvement]

### Quality Activity Schedule
| Activity | Start Date | Duration | Dependencies | Responsible |
|----------|------------|----------|--------------|-------------|
| [Activity 1] | [Date] | [Duration] | [Dependencies] | [Who] |

## Quality Reporting

### Quality Reports
**Quality Status Reports:** [Regular status reporting]
**Quality Metrics Reports:** [Performance measurement reporting]
**Audit Reports:** [Quality audit findings and recommendations]
**Non-conformance Reports:** [Quality issue documentation]

### Communication Plan
- Stakeholder communication requirements
- Reporting frequency and format
- Distribution lists
- Escalation procedures

Make the content specific to the project context provided and use markdown formatting for proper structure.
Focus on creating a practical, implementable quality management approach that ensures project success.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Quality Management Plan')) {
      throw new ExpectedError('Generated content does not appear to be a valid Quality Management Plan');
    }
  }
}
