/**
 * Technical Recommendations Processor
 * Handles AI functions related to generating comprehensive technical recommendations
 * 
 * @class TechnicalRecommendationsProcessor
 * @description Specialized processor for generating technical recommendations
 * that align with PMBOK standards and provide valuable insights for technology
 * stack decisions in project planning.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @since 3.2.0
 */

import { ChatMessage } from "../types.js";
import { AIProcessor } from "../AIProcessor.js";
import type { ContextManager } from "../../contextManager.js";
import { BaseAIProcessor } from "./BaseAIProcessor.js";

// Lazy initialization function for AIProcessor
let _aiProcessor: any = null;
const getAIProcessor = () => {
    if (!_aiProcessor) {
        _aiProcessor = AIProcessor.getInstance();
    }
    return _aiProcessor;
};

let _contextManager: any = null;
const getContextManager = async () => {
    if (!_contextManager) {
        const { ContextManager } = await import("../../contextManager");
        _contextManager = new ContextManager();
    }
    return _contextManager;
};

export class TechnicalRecommendationsProcessor extends BaseAIProcessor {

    /**
     * Generates comprehensive technical recommendations based on project requirements
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Technical recommendations or null if generation fails
     */
    async getTechnicalRecommendations(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createPMBOKMessages(
                `You are a senior technical architect and project management expert with extensive experience in technology selection and PMBOK standards. 
                
Your role is to provide comprehensive technical recommendations that align with PMBOK project management principles and support informed technology stack decisions.

Focus on:
- Technology selection criteria aligned with PMBOK planning processes
- Risk assessment and mitigation strategies (PMBOK Risk Management)
- Quality assurance and technical standards (PMBOK Quality Management)
- Resource planning and technical capacity considerations
- Integration management for technology components
- Stakeholder considerations for technical decisions
- Cost-benefit analysis for technology choices
- Timeline and schedule impact of technical decisions`,
                `Based on the comprehensive project context below, provide detailed technical recommendations that align with PMBOK standards:

Project Context:
${context}

Your technical recommendations should include:

## 1. Executive Summary
- Key technical recommendations overview
- Strategic alignment with project objectives
- PMBOK process group alignment

## 2. Technology Architecture Recommendations
- Overall system architecture approach
- Technology stack recommendations with PMBOK justification
- Integration patterns and approaches
- Scalability and performance considerations

## 3. Risk Management (PMBOK 11.0)
- Technical risk identification and assessment
- Risk probability and impact analysis
- Risk mitigation strategies and contingency plans
- Risk monitoring and control recommendations

## 4. Quality Management (PMBOK 8.0)
- Quality standards and technical criteria
- Testing and validation strategies
- Code quality and technical debt management
- Performance and reliability requirements

## 5. Resource Management (PMBOK 9.0)
- Technical skill requirements and team composition
- Training and development needs
- Tool and infrastructure requirements
- Vendor and third-party service considerations

## 6. Cost Management (PMBOK 7.0)
- Technology cost analysis and budgeting
- Total cost of ownership (TCO) considerations
- Cost-benefit analysis for technology choices
- Budget allocation recommendations

## 7. Schedule Management (PMBOK 6.0)
- Technology implementation timeline
- Critical path considerations for technical components
- Dependencies and sequencing recommendations
- Milestone and deliverable planning

## 8. Stakeholder Management (PMBOK 13.0)
- Technical stakeholder identification
- Communication strategies for technical decisions
- Change management for technology adoption
- Training and support requirements

## 9. Integration Management (PMBOK 4.0)
- Technology integration strategies
- API and interface design recommendations
- Data integration and migration planning
- System interoperability considerations

## 10. Implementation Roadmap
- Phased implementation approach
- Quick wins and early value delivery
- Long-term technology evolution strategy
- Success metrics and KPIs

Ensure all recommendations are:
- Aligned with PMBOK knowledge areas and process groups
- Practical and implementable within project constraints
- Supported by clear rationale and business justification
- Focused on delivering project value and success`
            );
            
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 2500);
            return getAIProcessor().extractContent(response);
        }, 'Technical Recommendations Generation', 'technical-recommendations');
    }

    /**
     * Generates technology selection criteria based on PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Technology selection criteria or null if generation fails
     */
    async getTechnologySelectionCriteria(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a technology selection expert with deep knowledge of PMBOK standards. Create comprehensive technology selection criteria that align with project management best practices.",
                `Based on the project context below, develop detailed technology selection criteria:

Project Context:
${context}

Create technology selection criteria that include:

## Technical Criteria
- Performance and scalability requirements
- Security and compliance standards
- Integration capabilities and APIs
- Reliability and availability requirements
- Maintainability and supportability

## Business Criteria
- Cost considerations (initial and ongoing)
- Time-to-market impact
- Strategic alignment with business goals
- Vendor stability and support
- License and legal considerations

## Project Management Criteria (PMBOK Aligned)
- Resource availability and skill requirements
- Risk factors and mitigation strategies
- Quality standards and testing requirements
- Schedule impact and implementation timeline
- Stakeholder acceptance and adoption factors

## Evaluation Framework
- Scoring methodology and weighting factors
- Decision matrix template
- Evaluation process and governance
- Documentation and approval requirements

Provide specific, measurable criteria that can be used to objectively evaluate technology options.`
            );
            
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Technology Selection Criteria Generation', 'technology-selection-criteria');
    }

    /**
     * Generates technical implementation roadmap aligned with PMBOK scheduling
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Technical implementation roadmap or null if generation fails
     */
    async getTechnicalImplementationRoadmap(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createPMBOKMessages(
                "You are a technical project manager and architect expert in creating implementation roadmaps that align with PMBOK schedule management and integration management principles.",
                `Based on the project context below, create a comprehensive technical implementation roadmap:

Project Context:
${context}

Develop a technical implementation roadmap that includes:

## Phase 1: Foundation and Planning (PMBOK Initiating & Planning)
- Infrastructure setup and environment preparation
- Tool selection and procurement
- Team onboarding and training
- Architecture design and validation
- Risk assessment and mitigation planning

## Phase 2: Core Development (PMBOK Executing)
- Core system development milestones
- Integration points and dependencies
- Quality gates and testing checkpoints
- Performance benchmarking
- Security implementation

## Phase 3: Integration and Testing (PMBOK Monitoring & Controlling)
- System integration activities
- End-to-end testing and validation
- Performance optimization
- Security testing and compliance validation
- User acceptance testing coordination

## Phase 4: Deployment and Transition (PMBOK Closing)
- Production deployment strategy
- Data migration and cutover planning
- User training and support
- Go-live activities and monitoring
- Post-implementation review and optimization

## Critical Success Factors
- Key dependencies and critical path items
- Resource allocation and capacity planning
- Risk mitigation strategies
- Quality assurance checkpoints
- Stakeholder communication and approval gates

## Timeline and Milestones
- Detailed timeline with key milestones
- Dependencies and sequencing
- Resource requirements by phase
- Budget allocation and cost tracking
- Success metrics and KPIs

Ensure the roadmap follows PMBOK best practices for schedule management, integration management, and quality management.`
            );
            
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 2200);
            return getAIProcessor().extractContent(response);
        }, 'Technical Implementation Roadmap Generation', 'technical-implementation-roadmap');
    }

    /**
     * Generates technology governance framework aligned with PMBOK governance principles
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Technology governance framework or null if generation fails
     */
    async getTechnologyGovernanceFramework(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a technology governance expert with extensive knowledge of PMBOK governance principles. Create a comprehensive technology governance framework.",
                `Based on the project context below, develop a technology governance framework:

Project Context:
${context}

Create a technology governance framework that includes:

## Governance Structure
- Technology steering committee composition
- Decision-making authority and escalation paths
- Roles and responsibilities matrix
- Reporting and communication protocols

## Technology Standards and Policies
- Technology architecture standards
- Security and compliance policies
- Development and deployment standards
- Data governance and management policies

## Decision-Making Processes
- Technology evaluation and selection process
- Change management and approval workflows
- Risk assessment and mitigation procedures
- Quality assurance and testing protocols

## Monitoring and Control
- Technology performance metrics and KPIs
- Compliance monitoring and reporting
- Risk monitoring and management
- Cost tracking and budget control

## Continuous Improvement
- Technology review and assessment cycles
- Lessons learned and knowledge management
- Innovation and emerging technology evaluation
- Training and capability development

Align all governance elements with PMBOK principles for project governance, stakeholder management, and integration management.`
            );
            
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 1900);
            return getAIProcessor().extractContent(response);
        }, 'Technology Governance Framework Generation', 'technology-governance-framework');
    }
}