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
 * Processor for the Work Breakdown Structure document.
 */
export class WorkbreakdownstructureProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive Work Breakdown Structures that ensure complete project scope coverage.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Work Breakdown Structure',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Work Breakdown Structure processing:', error.message);
        throw new Error(`Failed to generate Work Breakdown Structure: ${error.message}`);
      } else {
        console.error('Unexpected error in Work Breakdown Structure processing:', error);
        throw new Error('An unexpected error occurred while generating Work Breakdown Structure');
      }
    }
  }
  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectType = context.projectType || 'Not specified';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive Work Breakdown Structure (WBS) document.

Project Context:
- Name: ${projectName}
- Type: ${projectType}
- Description: ${projectDescription}

Requirements:
1. Create a hierarchical breakdown of all project work
2. Decompose the project into manageable work packages
3. Ensure 100% scope coverage (no missing work)
4. Use consistent decomposition levels (3-4 levels typical)
5. Include detailed work package descriptions
6. Assign unique WBS codes/identifiers
7. Ensure work packages are measurable and assignable
8. Include effort estimates and resource requirements
9. Define clear deliverables and acceptance criteria
10. Establish work package interdependencies

Structure your response as:
# Work Breakdown Structure

## Document Overview
- **Project:** ${projectName}
- **Project Type:** ${projectType}
- **WBS Purpose:** Hierarchical decomposition of project scope
- **Decomposition Approach:** [Deliverable-based/Phase-based/Hybrid]
- **WBS Dictionary Reference:** Companion document with detailed definitions

## WBS Development Methodology
- **100% Rule:** All project work is included, nothing extra
- **Mutually Exclusive:** No overlap between work packages
- **Outcome-Oriented:** Focus on deliverables, not activities
- **Decomposition Criteria:** Work packages are 8-80 hours of effort
- **Responsibility Assignment:** Each work package has a single owner

## WBS Hierarchy

### Level 1: Project
**1.0 ${projectName}**
- **Total Project Scope**
- **Project Manager:** [To be assigned]
- **Estimated Duration:** [To be determined]
- **Total Effort:** [To be estimated]

### Level 2: Major Deliverables/Phases
**1.1 Project Management**
- Project planning, monitoring, and control activities
- **Responsible:** Project Manager
- **Duration:** Full project lifecycle

**1.2 Requirements & Analysis**
- Requirements gathering, analysis, and documentation
- **Responsible:** Business Analyst
- **Dependencies:** Stakeholder availability

**1.3 Design & Architecture**
- System design, architecture, and technical specifications
- **Responsible:** Technical Lead/Architect
- **Dependencies:** Requirements completion

**1.4 Development & Implementation**
- Core development, coding, and implementation activities
- **Responsible:** Development Team
- **Dependencies:** Design approval

**1.5 Testing & Quality Assurance**
- Testing activities, quality control, and validation
- **Responsible:** QA Team
- **Dependencies:** Development completion

**1.6 Deployment & Go-Live**
- Production deployment and system go-live activities
- **Responsible:** DevOps/Deployment Team
- **Dependencies:** Testing sign-off

**1.7 Project Closure**
- Project closure activities and knowledge transfer
- **Responsible:** Project Manager
- **Dependencies:** Successful deployment

### Level 3: Work Packages

#### 1.1 Project Management
**1.1.1 Project Planning**
- Project charter, plans, and baseline establishment
- **Effort:** 40-60 hours
- **Deliverables:** Project charter, project management plan

**1.1.2 Project Monitoring & Control**
- Progress tracking, performance monitoring, change control
- **Effort:** 20% of project duration
- **Deliverables:** Status reports, performance metrics

**1.1.3 Stakeholder Management**
- Stakeholder engagement and communication management
- **Effort:** 15% of project duration
- **Deliverables:** Stakeholder register, communication plan

#### 1.2 Requirements & Analysis
**1.2.1 Requirements Gathering**
- Stakeholder interviews, workshops, and requirements elicitation
- **Effort:** 80-120 hours
- **Deliverables:** Requirements documentation

**1.2.2 Requirements Analysis**
- Requirements analysis, prioritization, and validation
- **Effort:** 60-80 hours
- **Deliverables:** Requirements specification, traceability matrix

**1.2.3 Business Process Analysis**
- Current state analysis and future state design
- **Effort:** 40-60 hours
- **Deliverables:** Process maps, gap analysis

#### 1.3 Design & Architecture
**1.3.1 System Architecture**
- High-level system architecture and design principles
- **Effort:** 60-80 hours
- **Deliverables:** Architecture document, design principles

**1.3.2 Detailed Design**
- Detailed technical design and specifications
- **Effort:** 100-150 hours
- **Deliverables:** Technical specifications, design documents

**1.3.3 Database Design**
- Database schema, data model, and data architecture
- **Effort:** 40-60 hours
- **Deliverables:** Database schema, data model

#### 1.4 Development & Implementation
**1.4.1 Development Environment Setup**
- Development infrastructure and environment configuration
- **Effort:** 20-30 hours
- **Deliverables:** Development environment, CI/CD pipeline

**1.4.2 Core Development**
- Primary development activities and coding
- **Effort:** 60-70% of development effort
- **Deliverables:** Source code, unit tests

**1.4.3 Integration Development**
- System integration and API development
- **Effort:** 20-30% of development effort
- **Deliverables:** Integration components, API documentation

#### 1.5 Testing & Quality Assurance
**1.5.1 Test Planning**
- Test strategy, test plans, and test case development
- **Effort:** 40-60 hours
- **Deliverables:** Test strategy, test plans, test cases

**1.5.2 System Testing**
- Functional, integration, and system testing
- **Effort:** 80-120 hours
- **Deliverables:** Test results, defect reports

**1.5.3 User Acceptance Testing**
- UAT coordination, execution, and sign-off
- **Effort:** 40-60 hours
- **Deliverables:** UAT results, acceptance sign-off

#### 1.6 Deployment & Go-Live
**1.6.1 Deployment Preparation**
- Production environment setup and deployment planning
- **Effort:** 30-40 hours
- **Deliverables:** Deployment plan, production environment

**1.6.2 Production Deployment**
- System deployment and go-live activities
- **Effort:** 20-30 hours
- **Deliverables:** Deployed system, deployment report

**1.6.3 Post-Deployment Support**
- Initial production support and issue resolution
- **Effort:** 40-60 hours
- **Deliverables:** Support documentation, issue resolution

#### 1.7 Project Closure
**1.7.1 Documentation & Knowledge Transfer**
- Final documentation and knowledge transfer activities
- **Effort:** 30-40 hours
- **Deliverables:** Final documentation, training materials

**1.7.2 Project Evaluation**
- Project evaluation, lessons learned, and closure activities
- **Effort:** 20-30 hours
- **Deliverables:** Project evaluation report, lessons learned

## Work Package Summary Matrix
| WBS Code | Work Package | Owner | Effort (hrs) | Dependencies | Critical Path |
|----------|--------------|-------|--------------|--------------|---------------|
| 1.1.1 | Project Planning | PM | 40-60 | None | Yes |
| 1.2.1 | Requirements Gathering | BA | 80-120 | Stakeholders | Yes |
| 1.3.1 | System Architecture | Architect | 60-80 | Requirements | Yes |
| 1.4.2 | Core Development | Dev Team | Variable | Design | Yes |
| 1.5.2 | System Testing | QA Team | 80-120 | Development | Yes |
| 1.6.2 | Production Deployment | DevOps | 20-30 | Testing | Yes |

## WBS Validation Checklist
- [ ] 100% scope coverage verified
- [ ] No overlapping work packages
- [ ] All work packages are outcome-oriented
- [ ] Work package size is appropriate (8-80 hours)
- [ ] Clear ownership assigned to each work package
- [ ] Dependencies identified and documented
- [ ] Effort estimates provided for all work packages
- [ ] Integration with project schedule confirmed

## WBS Maintenance Guidelines
- **Update Frequency:** Weekly during planning, monthly during execution
- **Change Control:** All WBS changes require change control approval
- **Version Control:** Maintain version history and change log
- **Integration:** Keep synchronized with project schedule and budget
- **Communication:** Share updates with all stakeholders

Focus on creating a logical, complete, and manageable breakdown specific to ${projectType} projects.
Ensure all work packages are clearly defined, measurable, and assignable to specific team members.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Work Breakdown Structure')) {
      throw new ExpectedError('Generated content does not appear to be a valid Work Breakdown Structure');
    }
  }
}
