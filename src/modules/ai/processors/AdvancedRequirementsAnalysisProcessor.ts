/**
 * Advanced Requirements Analysis Processor
 * Specialized AI processor for sophisticated requirements analysis and modeling
 * 
 * @class AdvancedRequirementsAnalysisProcessor
 * @description Handles advanced requirements analysis including process modeling,
 * use case generation, business rules extraction, and impact analysis.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2025-01-27
 * 
 * @filepath src/modules/ai/processors/AdvancedRequirementsAnalysisProcessor.ts
 */

import { BaseAIProcessor } from './BaseAIProcessor.js';
import { AIProcessor } from '../AIProcessor.js';

export interface ProcessModel {
  modelType: 'BPMN' | 'Flowchart' | 'ValueStream' | 'Swimlane';
  processes: ProcessDefinition[];
  actors: Actor[];
  dataFlows: DataFlow[];
  businessRules: string[];
  metrics: ProcessMetric[];
}

export interface ProcessDefinition {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  inputs: string[];
  outputs: string[];
  owner: string;
  triggers: string[];
}

export interface ProcessStep {
  id: string;
  name: string;
  type: 'task' | 'decision' | 'gateway' | 'event';
  description: string;
  actor: string;
  duration: string;
  businessRules: string[];
  exceptions: string[];
}

export interface Actor {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  skills: string[];
}

export interface DataFlow {
  from: string;
  to: string;
  data: string;
  format: string;
  frequency: string;
}

export interface ProcessMetric {
  name: string;
  description: string;
  target: string;
  measurement: string;
}

export interface UseCaseModel {
  system: string;
  actors: UseCaseActor[];
  useCases: UseCase[];
  relationships: UseCaseRelationship[];
}

export interface UseCaseActor {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'system';
  description: string;
  goals: string[];
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  actor: string;
  preconditions: string[];
  postconditions: string[];
  mainFlow: string[];
  alternativeFlows: AlternativeFlow[];
  exceptionFlows: ExceptionFlow[];
  businessRules: string[];
  nonFunctionalRequirements: string[];
}

export interface AlternativeFlow {
  id: string;
  name: string;
  condition: string;
  steps: string[];
}

export interface ExceptionFlow {
  id: string;
  name: string;
  exception: string;
  handling: string[];
}

export interface UseCaseRelationship {
  type: 'include' | 'extend' | 'generalization';
  from: string;
  to: string;
  condition?: string;
}

export interface BusinessRulesCatalog {
  categories: BusinessRuleCategory[];
  rules: BusinessRule[];
  conflicts: RuleConflict[];
  dependencies: RuleDependency[];
}

export interface BusinessRuleCategory {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BusinessRule {
  id: string;
  name: string;
  category: string;
  description: string;
  statement: string;
  rationale: string;
  source: string;
  type: 'constraint' | 'derivation' | 'existence' | 'action';
  priority: 'mandatory' | 'important' | 'optional';
  testCriteria: string[];
}

export interface RuleConflict {
  rule1: string;
  rule2: string;
  conflictType: string;
  resolution: string;
}

export interface RuleDependency {
  dependentRule: string;
  prerequisiteRule: string;
  dependencyType: string;
}

export interface ImpactAnalysis {
  requirement: string;
  impactedAreas: ImpactArea[];
  riskAssessment: RiskAssessment;
  effortEstimate: EffortEstimate;
  recommendations: string[];
}

export interface ImpactArea {
  area: string;
  impactType: 'high' | 'medium' | 'low';
  description: string;
  affectedComponents: string[];
  mitigationActions: string[];
}

export interface RiskAssessment {
  risks: Risk[];
  overallRiskLevel: 'high' | 'medium' | 'low';
  mitigationStrategy: string;
}

export interface Risk {
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface EffortEstimate {
  analysisEffort: string;
  developmentEffort: string;
  testingEffort: string;
  totalEffort: string;
  assumptions: string[];
}

export class AdvancedRequirementsAnalysisProcessor extends BaseAIProcessor {
  private aiProcessor = AIProcessor.getInstance();

  /**
   * Generates process models from requirements
   */
  async generateProcessModel(
    requirements: string[],
    modelType: 'BPMN' | 'Flowchart' | 'ValueStream' | 'Swimlane',
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Process Analyst and Requirements Engineer. Create detailed process models from requirements.",
        `Generate a comprehensive ${modelType} process model based on the following requirements and context:

Model Type: ${modelType}

Requirements:
${requirements.join('\n- ')}

Project Context:
${projectContext}

Create a detailed process model that includes:

## Process Overview
- Process name and purpose
- Scope and boundaries
- Key stakeholders and actors
- Process objectives and success criteria

## Process Definition
- Process triggers and start events
- Main process flow with detailed steps
- Decision points and business rules
- End events and outcomes
- Exception handling and error flows

## Actors and Roles
For each actor involved:
- Role name and description
- Responsibilities in the process
- Required skills and authorities
- Interaction points with other actors

## Process Steps Detail
For each process step:
- Step name and description
- Actor responsible
- Inputs required
- Activities performed
- Outputs produced
- Duration and timing
- Business rules applied
- Exception scenarios

## Data Flow Analysis
- Data inputs to the process
- Data transformations within process
- Data outputs and destinations
- Data quality requirements
- Data security considerations

## Business Rules
- Validation rules
- Decision criteria
- Approval requirements
- Compliance rules
- Exception handling rules

## Process Metrics
- Key performance indicators
- Quality measures
- Efficiency metrics
- Customer satisfaction measures
- Compliance metrics

## Integration Points
- System integrations required
- External process dependencies
- Data exchange requirements
- API or interface needs

## Process Optimization Opportunities
- Bottlenecks and inefficiencies
- Automation opportunities
- Simplification possibilities
- Quality improvements

## Implementation Considerations
- Change management requirements
- Training needs
- Technology requirements
- Resource allocation

For ${modelType} specifically, include:
${this.getModelTypeSpecificGuidance(modelType)}

Format the output as structured markdown with clear sections, tables for complex data, and actionable implementation guidance.`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2500);
      return this.aiProcessor.extractContent(response);
    }, 'Process Model Generation', 'process-model');
  }

  /**
   * Creates comprehensive use case models
   */
  async createUseCaseModel(
    functionalRequirements: string[],
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Use Case Analyst and Requirements Engineer. Create comprehensive use case models from functional requirements.",
        `Generate a detailed use case model based on the following functional requirements:

Functional Requirements:
${functionalRequirements.join('\n- ')}

Project Context:
${projectContext}

Create a comprehensive use case model that includes:

## System Overview
- System name and purpose
- System boundaries and scope
- Key system capabilities
- External systems and interfaces

## Actor Identification
For each actor:
- Actor name and type (primary, secondary, system)
- Actor description and role
- Actor goals and motivations
- Relationship to the system
- Frequency of interaction

## Use Case Catalog
For each use case:

### Use Case Header
- Use Case ID and name
- Brief description
- Primary actor
- Secondary actors
- Stakeholders and interests
- Preconditions
- Success guarantee (postconditions)
- Trigger events

### Main Success Scenario
- Step-by-step main flow
- Actor actions
- System responses
- Data exchanges
- Business rule applications

### Alternative Flows
- Alternative paths and conditions
- Branching points
- Rejoining points
- Different success scenarios

### Exception Flows
- Error conditions
- System failures
- Invalid inputs
- Recovery procedures
- Rollback scenarios

### Special Requirements
- Performance requirements
- Security constraints
- Usability requirements
- Reliability needs
- Scalability considerations

### Technology and Data Variations
- Different technology platforms
- Data format variations
- Integration scenarios
- Mobile vs. desktop differences

## Use Case Relationships
- Include relationships (common functionality)
- Extend relationships (optional behavior)
- Generalization relationships (inheritance)
- Dependency relationships

## Use Case Prioritization
- Must-have use cases
- Should-have use cases
- Could-have use cases
- Won't-have use cases (this release)

## Traceability Matrix
- Requirements to use case mapping
- Use case to test case mapping
- Use case to design element mapping
- Actor to use case mapping

## Non-Functional Requirements
- Performance requirements per use case
- Security requirements per use case
- Usability requirements per use case
- Reliability requirements per use case

## Implementation Considerations
- Development complexity assessment
- Testing requirements
- Integration challenges
- User training needs

## Use Case Validation
- Review criteria
- Stakeholder validation approach
- Test scenario generation
- Acceptance criteria definition

Format as structured markdown with clear sections, numbered use cases, and comprehensive cross-references.`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2800);
      return this.aiProcessor.extractContent(response);
    }, 'Use Case Model Generation', 'use-case-model');
  }

  /**
   * Extracts and catalogs business rules from requirements
   */
  async extractBusinessRules(
    requirements: string[],
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Rules Analyst. Extract, categorize, and document business rules from requirements.",
        `Extract and catalog business rules from the following requirements:

Requirements:
${requirements.join('\n- ')}

Project Context:
${projectContext}

Create a comprehensive business rules catalog that includes:

## Business Rules Overview
- Purpose and scope of business rules
- Rule governance approach
- Rule maintenance strategy
- Rule validation methodology

## Rule Categories
Organize rules into categories such as:
- Data validation rules
- Business logic rules
- Authorization and security rules
- Workflow and process rules
- Calculation and derivation rules
- Constraint and limitation rules

## Business Rules Catalog

For each business rule:

### Rule Identification
- Rule ID (unique identifier)
- Rule name (descriptive title)
- Rule category
- Rule type (constraint, derivation, existence, action)
- Priority level (mandatory, important, optional)

### Rule Definition
- Rule statement (clear, unambiguous)
- Rule description (detailed explanation)
- Business rationale (why the rule exists)
- Rule source (who defined it)
- Effective date and version

### Rule Specification
- Formal rule expression (if applicable)
- Conditions and triggers
- Actions and consequences
- Exception conditions
- Error handling procedures

### Rule Context
- Business processes affected
- Systems and applications involved
- Data elements referenced
- Stakeholders impacted
- Compliance requirements

### Rule Testing
- Test criteria and scenarios
- Validation methods
- Acceptance criteria
- Performance requirements
- Error condition testing

## Rule Relationships
- Rule dependencies (prerequisite rules)
- Rule conflicts (contradictory rules)
- Rule hierarchies (parent-child relationships)
- Rule groups (related rule sets)

## Rule Implementation
- Implementation approach
- Technology considerations
- Integration requirements
- Performance implications
- Maintenance procedures

## Rule Governance
- Rule ownership and accountability
- Change management process
- Approval workflow
- Version control approach
- Audit and compliance tracking

## Rule Conflicts and Resolutions
- Identified conflicts between rules
- Conflict resolution strategies
- Priority and precedence rules
- Escalation procedures
- Decision criteria

## Rule Metrics and Monitoring
- Rule effectiveness measures
- Compliance monitoring
- Performance indicators
- Exception tracking
- Continuous improvement

## Implementation Roadmap
- Rule implementation priority
- Phased implementation approach
- Dependencies and prerequisites
- Resource requirements
- Timeline and milestones

Format as structured markdown with clear categorization, numbered rules, and comprehensive cross-references.`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2600);
      return this.aiProcessor.extractContent(response);
    }, 'Business Rules Extraction', 'business-rules');
  }

  /**
   * Performs comprehensive impact analysis for requirement changes
   */
  async analyzeRequirementImpact(
    requirement: string,
    existingRequirements: string[],
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Impact Analysis specialist and Requirements Engineer. Perform comprehensive impact analysis for requirement changes.",
        `Perform a detailed impact analysis for the following requirement change:

New/Changed Requirement:
${requirement}

Existing Requirements Context:
${existingRequirements.join('\n- ')}

Project Context:
${projectContext}

Generate a comprehensive impact analysis that includes:

## Impact Analysis Overview
- Requirement change summary
- Analysis scope and boundaries
- Analysis methodology
- Key assumptions made

## Requirement Analysis
- Requirement classification (new, modified, deleted)
- Requirement complexity assessment
- Requirement clarity and completeness
- Requirement priority and criticality

## Impact Assessment by Area

### Functional Impact
- Affected functional requirements
- New functionality required
- Modified functionality
- Deprecated functionality
- Integration impacts

### Technical Impact
- System architecture changes
- Database schema modifications
- API and interface changes
- Performance implications
- Security considerations

### Process Impact
- Business process changes
- Workflow modifications
- User experience changes
- Training requirements
- Documentation updates

### Data Impact
- Data model changes
- Data migration requirements
- Data quality implications
- Reporting and analytics impact
- Data governance considerations

### Integration Impact
- External system impacts
- Third-party service changes
- API modifications
- Data exchange impacts
- Interface updates

## Stakeholder Impact Analysis
- Affected stakeholder groups
- Impact on user roles
- Training and change management needs
- Communication requirements
- Approval and sign-off needs

## Risk Assessment
- Technical risks
- Business risks
- Schedule risks
- Resource risks
- Quality risks
- Mitigation strategies for each risk

## Effort Estimation
- Analysis effort required
- Design effort required
- Development effort required
- Testing effort required
- Deployment effort required
- Total effort estimate with confidence level

## Dependencies and Constraints
- Prerequisite requirements
- Dependent requirements
- Technical constraints
- Business constraints
- Timeline constraints

## Implementation Considerations
- Implementation approach options
- Phasing and sequencing
- Resource requirements
- Technology considerations
- Quality assurance needs

## Cost-Benefit Analysis
- Implementation costs
- Operational costs
- Expected benefits
- ROI calculation
- Break-even analysis

## Recommendations
- Recommended approach
- Alternative options
- Risk mitigation strategies
- Implementation timeline
- Success criteria

## Approval and Next Steps
- Required approvals
- Stakeholder sign-offs
- Next steps and actions
- Follow-up requirements
- Monitoring and tracking

Format as structured markdown with clear sections, risk matrices, effort estimates, and actionable recommendations.`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2400);
      return this.aiProcessor.extractContent(response);
    }, 'Impact Analysis', 'impact-analysis');
  }

  /**
   * Generates gap analysis between current and future state
   */
  async generateGapAnalysis(
    currentState: string,
    futureState: string,
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Analyst specializing in gap analysis and transformation planning.",
        `Perform a comprehensive gap analysis between current and future states:

Current State:
${currentState}

Future State:
${futureState}

Project Context:
${projectContext}

Generate a detailed gap analysis that includes:

## Executive Summary
- Gap analysis purpose and scope
- Key findings summary
- Critical gaps identified
- Recommended actions overview

## Current State Analysis
- Current capabilities assessment
- Existing processes and workflows
- Technology landscape
- Resource and skill inventory
- Performance baseline metrics

## Future State Vision
- Target capabilities definition
- Desired processes and workflows
- Target technology architecture
- Required resources and skills
- Performance targets and goals

## Gap Identification
- Capability gaps
- Process gaps
- Technology gaps
- Skill and resource gaps
- Performance gaps

## Gap Prioritization
- Critical gaps (must address)
- Important gaps (should address)
- Optional gaps (could address)
- Future gaps (will address later)

## Impact Assessment
- Business impact of each gap
- Technical complexity
- Resource requirements
- Timeline implications
- Risk factors

## Bridging Strategy
- Gap closure approach
- Implementation roadmap
- Resource allocation plan
- Timeline and milestones
- Success criteria

## Implementation Planning
- Phase 1: Quick wins and foundations
- Phase 2: Core capabilities
- Phase 3: Advanced features
- Phase 4: Optimization and enhancement

## Risk Management
- Implementation risks
- Business continuity risks
- Technology risks
- Resource risks
- Mitigation strategies

## Success Metrics
- Key performance indicators
- Success criteria
- Measurement approach
- Monitoring and reporting
- Continuous improvement

Format as structured markdown with clear gap identification, prioritization matrices, and actionable implementation plans.`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2200);
      return this.aiProcessor.extractContent(response);
    }, 'Gap Analysis', 'gap-analysis');
  }

  /**
   * Helper method to provide model-type specific guidance
   */
  private getModelTypeSpecificGuidance(modelType: string): string {
    switch (modelType) {
      case 'BPMN':
        return `- Use BPMN 2.0 notation and symbols
- Include start/end events, tasks, gateways, and flows
- Show message flows between participants
- Include pools and lanes for different actors
- Add annotations for business rules and exceptions`;
      
      case 'Flowchart':
        return `- Use standard flowchart symbols (rectangles, diamonds, ovals)
- Show clear decision points with yes/no branches
- Include process flow direction with arrows
- Add connector symbols for complex flows
- Include off-page connectors if needed`;
      
      case 'ValueStream':
        return `- Focus on value-adding vs. non-value-adding activities
- Include cycle times and wait times
- Show information flows alongside material flows
- Identify waste and improvement opportunities
- Include customer touchpoints and feedback loops`;
      
      case 'Swimlane':
        return `- Organize activities by responsible parties (lanes)
- Show handoffs between departments/roles clearly
- Include timing and dependencies between lanes
- Highlight bottlenecks and delays
- Show parallel activities and synchronization points`;
      
      default:
        return `- Follow industry standard notation
- Ensure clear visual representation
- Include all necessary details for implementation
- Show relationships and dependencies clearly`;
    }
  }
}