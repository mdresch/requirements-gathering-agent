/**
 * Requirements Processor
 * Handles AI functions related to requirements gathering and analysis
 * 
 * @class RequirementsProcessor
 * @description Specialized processor for generating requirements documentation
 * including user stories, acceptance criteria, requirements matrices,
 * and other requirements-related artifacts.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * @since 3.1.0
 */

import { ChatMessage } from "../types.js";
import { AIProcessor, getAIProcessor } from "../AIProcessor.js";
import type { ContextManager } from "../../contextManager.js";
import { BaseAIProcessor } from "./BaseAIProcessor.js";

const aiProcessor = AIProcessor.getInstance();

let _contextManager: any = null;
const getContextManager = async () => {
    if (!_contextManager) {
        const { ContextManager } = await import("../../contextManager.js");
        _contextManager = new ContextManager();
    }
    return _contextManager;
};

export class RequirementsProcessor extends BaseAIProcessor {

    /**
     * Generates user stories based on project context 
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} User stories or null if generation fails
     */    async getUserStories(context: string): Promise<string | null> {
        return await this.handleAICallWithFallback(
            'user-stories',
            context,
            async () => {
                const messages = this.createStandardMessages(
                    "You are an expert agile business analyst. Generate comprehensive user stories for a project based on the provided context.",
                    `Based on the comprehensive project context below, generate detailed user stories:

Project Context:
${context}

Generate user stories following the format:
"As a [user role], I want [goal/desire] so that [benefit]."

Each story should include:
- User role (who wants the feature)
- Goal or desire (what they want to accomplish)
- Benefit (why they want it / the value it provides)
- Priority (Must Have, Should Have, Could Have, Won't Have this time)
- Acceptance criteria (3-5 specific conditions that must be met)
- Notes on dependencies or constraints

Group stories by user role or feature area. Ensure stories are:
- Independent
- Negotiable
- Valuable
- Estimable
- Small
- Testable

Include stories covering core functionality, edge cases, and non-functional requirements.`
                );
                const response = await aiProcessor.makeAICall(messages, 2000);
                return getAIProcessor().extractContent(response);
            }, 
            'User Stories Generation',
            { 
                maxResponseTokens: 2500,
                qualityValidation: {
                    minLength: 400,
                    requiredSections: ['As a', 'I want', 'so that']
                }
            }
        );
    }    async getUserPersonas(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are an expert UX researcher with deep experience in persona development. Create comprehensive user personas based on the project context.",
                `Based on the comprehensive project context below, create detailed user personas:

Project Context:
${context}

For each identified persona, include:
- Name and role
- Demographics (age, occupation, location, etc.)
- Technical expertise level
- Goals and motivations
- Pain points and frustrations
- Typical behaviors and preferences
- Usage context and environment
- Quotes that represent their mindset
- Key needs from the solution

Ensure personas:
- Are realistic and evidence-based
- Represent distinct user groups
- Cover the spectrum of target users
- Include primary and secondary personas
- Highlight meaningful differences between user types

Format as a well-structured markdown document with proper headers and organization.`
            );
            const response = await aiProcessor.makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'User Personas Generation', 'user-personas');
    }
    
    async getAcceptanceCriteria(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // Use enhanced context with user stories
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('acceptance-criteria', [
                'user-stories', 
                'project-charter',
                'requirements-documentation'
            ]);
            const fullContext = enhancedContext || context;
              const messages = this.createStandardMessages(
                "You are an expert test engineer and business analyst. Create detailed acceptance criteria for a project based on the provided context.",
                `Based on the comprehensive project context below, create detailed acceptance criteria:

Project Context:
${fullContext}

For each major feature or requirement, provide acceptance criteria that include:
- Clear, testable conditions that must be met
- Expected behavior under normal conditions
- Expected behavior under edge cases
- Performance or non-functional criteria
- Specific business rules or validation requirements
- Data conditions or state requirements

Format the acceptance criteria using the Given-When-Then format:
- GIVEN [precondition or initial context]
- WHEN [action or event occurs]
- THEN [expected outcome or result]

Group criteria by feature, user story, or requirement. Ensure criteria are:
- Specific and unambiguous
- Testable and verifiable
- Realistic and achievable
- Complete (covering all conditions)
- Consistent with requirements

Consider both functional and non-functional requirements in your criteria.`
            );
            const response = await aiProcessor.makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Acceptance Criteria Generation', 'acceptance-criteria');
    }    async getKeyRolesAndNeeds(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a senior business analyst with expertise in roles and responsibilities analysis. Create a comprehensive analysis of key roles and their needs for the project.",
                `Based on the comprehensive project context below, analyze and document key roles and their needs:

Project Context:
${context}

For each key role identified, include:
- Role title and description
- Primary responsibilities
- Key tasks and activities
- Skills and competencies required
- Tools and resources needed
- Information requirements
- Decision-making authority
- Interactions with other roles
- Success metrics for the role
- Key challenges and pain points

Consider roles across different areas:
- Project management roles
- Development and technical roles
- Business and stakeholder roles
- End-user roles
- Support and maintenance roles

For each role, clearly articulate:
- What they need to accomplish their work
- How the system/project supports their objectives
- Critical features or capabilities for their success
- Potential areas of friction or resistance

Format as a well-structured markdown document with clear headers and organization.`
            );
            const response = await aiProcessor.makeAICall(messages, 2000);
            return getAIProcessor().extractContent(response);
        }, 'Key Roles and Needs Analysis', 'key-roles-and-needs');
    }    async getSummaryAndGoals(readmeContent: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a senior business analyst experienced in extracting key project information. Analyze the provided README content and generate a clear summary and goals statement.",
                `Based on the README content below, provide a comprehensive project summary and clearly articulated goals:

${readmeContent}

Your analysis should include:

### Project Summary
- Project name and high-level description
- Purpose and primary function
- Target users and stakeholders
- Key features and capabilities
- Technical approach overview

### Project Goals
- Primary business objectives
- User-centric goals and outcomes
- Technical and architectural goals
- Quality and performance targets
- Success criteria and metrics

### Strategic Alignment
- How the project aligns with broader business strategy
- Key business drivers
- Market or competitive considerations
- Innovation aspects

Format as a well-structured markdown document with clear sections.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Project Summary and Goals Generation', 'summary-and-goals');
    }

    async getRequirementsDocumentation(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // Use enhanced context management for requirements documentation
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('requirements-documentation', [
                'project-charter', 
                'user-stories', 
                'stakeholder-register', 
                'requirements-management-plan', 
                'collect-requirements'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified business analyst. Generate comprehensive Requirements Documentation for a software project, following PMBOK 7th Edition standards.",
                `Based on the comprehensive project context below, create detailed Requirements Documentation as a markdown document.

Project Context:
${fullContext}

Your documentation should include (as sections):
- Introduction and purpose
- Functional requirements (detailed list)
- Non-functional requirements (performance, security, usability, etc.)
- Stakeholder requirements
- Business requirements
- Assumptions and constraints
- Requirements prioritization
- Requirements traceability (reference to RTM)
- Approval and sign-off section

Ensure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Requirements Documentation Generation', 'requirements-documentation');
    }

    async getRequirementsTraceabilityMatrix(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // Use enhanced context management for RTM
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('requirements-traceability-matrix', [
                'requirements-documentation',
                'user-stories',
                'acceptance-criteria',
                'stakeholder-register',
                'requirements-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified business analyst. Generate a comprehensive Requirements Traceability Matrix (RTM) for a software project, following PMBOK 7th Edition standards.",
                `Based on the comprehensive project context below, create a detailed Requirements Traceability Matrix (RTM) as a markdown document.

Project Context:
${fullContext}

Your RTM should include the following columns:
- Requirement ID
- Requirement Description
- Requirement Type (Functional, Non-functional, Business, etc.)
- Priority
- Source (Stakeholder, Document, etc.)
- Success Criteria
- Test Case Reference
- Verification Method
- Status

Format the RTM as a markdown table with proper alignment and organization.
Include at least 10-15 key requirements to demonstrate the structure and approach.
Ensure traceability from source to verification is clear and comprehensive.

Follow PMBOK standards and best practices for requirements traceability.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Requirements Traceability Matrix Generation', 'requirements-traceability-matrix');
    }

    /**
     * Generates Requirements Management Plan based on project context
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Requirements Management Plan or null if generation fails
     */
    async getRequirementsManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('requirements-management-plan', [
                'project-charter',
                'scope-management-plan',
                'stakeholder-register'
            ]);
            const fullContext = enhancedContext || context;

            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager with expertise in requirements management. Create a comprehensive Requirements Management Plan following PMBOK standards.",
                `Based on the comprehensive project context below, create a detailed Requirements Management Plan:

Project Context:
${fullContext}

Generate a comprehensive Requirements Management Plan with the following sections:

## Requirements Management Plan

### Overview
- Purpose and scope of requirements management
- Alignment with project management plan
- Integration with scope management processes

### Requirements Planning
- Requirements gathering approach and methodology
- Stakeholder involvement strategy
- Requirements categories and types
- Requirements prioritization criteria

### Requirements Analysis
- Analysis techniques and tools
- Requirements validation methods
- Acceptance criteria definition
- Requirements decomposition approach

### Requirements Documentation
- Documentation standards and templates
- Requirements attributes and metadata
- Traceability requirements
- Version control and configuration management

### Requirements Communication
- Stakeholder communication plan
- Requirements review and approval process
- Change communication procedures
- Status reporting and metrics

### Requirements Change Management
- Change request process
- Impact analysis procedures
- Change approval authority
- Change implementation procedures

### Requirements Verification and Validation
- Verification methods and criteria
- Validation approach and schedule
- Acceptance testing strategy
- Quality assurance procedures

### Requirements Traceability
- Traceability matrix development
- Traceability maintenance procedures
- Relationship mapping requirements
- Coverage analysis methods

### Tools and Techniques
- Requirements management tools
- Analysis and modeling techniques
- Documentation and collaboration tools
- Metrics and measurement tools

### Roles and Responsibilities
- Requirements team structure
- Stakeholder roles and responsibilities
- Approval and decision-making authority
- Communication responsibilities

Format as professional markdown suitable for project teams and stakeholders. Follow PMBOK requirements management best practices.`
            );
            const response = await aiProcessor.makeAICall(messages, 2000);
            return getAIProcessor().extractContent(response);
        }, 'Requirements Management Plan Generation', 'requirements-management-plan');
    }

    /**
     * Generates Collect Requirements Process document based on project context
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Collect Requirements Process or null if generation fails
     */
    async getCollectRequirementsProcess(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('collect-requirements', [
                'requirements-management-plan',
                'project-charter',
                'stakeholder-register'
            ]);
            const fullContext = enhancedContext || context;

            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager specializing in requirements gathering processes. Create a comprehensive Collect Requirements Process document following PMBOK standards.",
                `Based on the comprehensive project context below, create a detailed Collect Requirements Process document:

Project Context:
${fullContext}

Generate a comprehensive Collect Requirements Process document with the following sections:

## Collect Requirements Process

### Process Overview
- Purpose and objectives of requirements collection
- Process scope and boundaries
- Integration with other project processes
- PMBOK process group and knowledge area alignment

### Process Inputs
- Project charter and business case
- Requirements management plan
- Stakeholder register and analysis
- Other relevant project documents

### Tools and Techniques
- Data gathering techniques (interviews, focus groups, surveys)
- Data analysis techniques (document analysis, benchmarking)
- Decision-making techniques (voting, prioritization)
- Data representation techniques (prototyping, storyboarding)
- Interpersonal and team skills (facilitation, negotiation)

### Process Outputs
- Requirements documentation
- Requirements traceability matrix
- Process updates and refinements

### Requirements Collection Activities
- Stakeholder identification and engagement
- Requirements elicitation sessions
- Requirements analysis and validation
- Requirements documentation and approval

### Quality Considerations
- Requirements quality criteria
- Validation and verification methods
- Review and approval processes
- Continuous improvement approaches

### Process Metrics
- Requirements collection metrics
- Quality measurements
- Progress tracking methods
- Performance indicators

### Risk Management
- Requirements-related risks
- Risk mitigation strategies
- Contingency planning
- Risk monitoring procedures

### Communication Management
- Stakeholder communication plan
- Requirements communication methods
- Feedback and collaboration processes
- Status reporting procedures

### Process Integration
- Integration with scope management
- Connection to design and development
- Alignment with testing and validation
- Relationship to change management

Format as professional markdown suitable for project teams and process documentation. Follow PMBOK process documentation standards.`
            );
            const response = await aiProcessor.makeAICall(messages, 2200);
            return getAIProcessor().extractContent(response);
        }, 'Collect Requirements Process Generation', 'collect-requirements');
    }
}
