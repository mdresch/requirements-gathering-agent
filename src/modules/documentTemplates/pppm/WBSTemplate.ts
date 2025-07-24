import type { ProjectContext } from '../../ai/types';

/**
 * Work Breakdown Structure (WBS) Template
 * Generates comprehensive WBS documentation following PMBOK standards
 */
export class WBSTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the prompt for AI-generated WBS content
   * @returns Structured prompt for WBS document generation
   */
  buildPrompt(): string {
    const projectName = this.context.projectName || 'Project';
    const projectDescription = this.context.description || 'No description provided';
    
    return `
# Work Breakdown Structure (WBS) Generation Request

## Project Context
**Project Name:** ${projectName}
**Project Description:** ${projectDescription}

## Document Requirements
Generate a comprehensive Work Breakdown Structure (WBS) document that follows PMBOK standards and includes:

### 1. Project Management
- Project initiation activities
- Planning and coordination tasks
- Monitoring and control processes
- Project closure activities

### 2. Requirements & Design
- Requirements gathering and analysis
- System design and architecture
- Technical specifications
- Design validation and approval

### 3. Implementation
- Development activities
- Configuration and setup
- Integration tasks
- Quality assurance and testing

### 4. Deployment & Training
- Deployment planning and execution
- User training and documentation
- Go-live support
- Post-implementation review

## WBS Structure Requirements
1. **Hierarchical Decomposition**: Break down work into manageable work packages
2. **100% Rule**: Ensure all project work is captured
3. **Mutually Exclusive**: No overlap between work packages
4. **Outcome-Oriented**: Focus on deliverables, not activities
5. **Appropriate Level of Detail**: 8-80 hour work packages

## Output Format
Please structure the WBS as follows:

### Work Breakdown Structure for ${projectName}

#### 1.0 Project Management
- 1.1 Project Initiation
  - 1.1.1 Project Charter Development
  - 1.1.2 Stakeholder Identification
  - 1.1.3 Initial Risk Assessment
- 1.2 Project Planning
  - 1.2.1 Scope Management Plan
  - 1.2.2 Schedule Development
  - 1.2.3 Resource Planning
- 1.3 Project Monitoring & Control
  - 1.3.1 Progress Tracking
  - 1.3.2 Change Management
  - 1.3.3 Quality Control
- 1.4 Project Closure
  - 1.4.1 Final Deliverable Acceptance
  - 1.4.2 Lessons Learned
  - 1.4.3 Project Documentation

#### 2.0 Requirements & Design
[Continue with detailed breakdown...]

#### 3.0 Implementation
[Continue with detailed breakdown...]

#### 4.0 Deployment & Training
[Continue with detailed breakdown...]

## Additional Context
${JSON.stringify(this.context, null, 2)}

Please ensure the WBS is:
- Comprehensive and covers all project phases
- Appropriately detailed for project management
- Aligned with PMBOK best practices
- Tailored to the specific project context provided
- Formatted in clear markdown with proper hierarchy
`;
  }
}
