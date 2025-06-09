/**
 * Activity Processor
 * Handles AI functions related to project activities, sequencing, and resource assignment
 * 
 * @class ActivityProcessor
 * @description Specialized processor for generating Activity Lists, Activity Attributes,
 * Activity Sequencing, and Activity Resource assignments following PMBOK standards
 * 
 * @version 1.0.0
 * @since 3.1.0
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

// Lazy initialization function for contextManager
let _contextManager: any = null;
async function getContextManager(): Promise<any> {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = await import("../../contextManager.js");
        _contextManager = new ContextManager();
    }
    return _contextManager;
}

export class ActivityProcessor extends BaseAIProcessor {
    /**
     * Generates an Activity List following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Activity List or null if generation fails
     */
    async getActivityList(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('activity-list', [
                'work-breakdown-structure',
                'scope-management-plan',
                'schedule-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Activity List following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed Activity List:

Project Context:
${fullContext}

Your Activity List should:
- Identify all activities needed to complete the project
- Map activities to their corresponding WBS work packages
- Include activity identifiers
- Provide brief descriptions of each activity
- Follow a logical organization by project phase or WBS component
- Include an appropriate level of detail (not too granular, not too high-level)
- Include project management activities (planning, monitoring, closing, etc.)

Format as a well-structured markdown table with columns for Activity ID, Activity Name, Description, and WBS Reference. Include a brief introduction explaining the purpose and usage of the Activity List.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Activity List Generation', 'activity-list');
    }

    /**
     * Generates Activity Attributes following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Activity Attributes or null if generation fails
     */
    async getActivityAttributes(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('activity-attributes', [
                'activity-list',
                'work-breakdown-structure',
                'schedule-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create comprehensive Activity Attributes following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create detailed Activity Attributes:

Project Context:
${fullContext}

Your Activity Attributes document should include for each activity:
- Activity identifier (matching the Activity List)
- Activity name
- Detailed activity description
- Predecessors and successors
- Logical relationships
- Leads and lags (if applicable)
- Resource requirements
- Duration estimates
- Constraints
- Assumptions
- Required skillsets
- Activity type/category
- Responsible person/team
- Geographic location (if relevant)

Format as a well-structured markdown document with sections for each activity, including all relevant attributes. Activities should be organized in a logical sequence.`
            );
            const response = await getAIProcessor().makeAICall(messages, 2000);
            return getAIProcessor().extractContent(response);
        }, 'Activity Attributes Generation', 'activity-attributes');
    }

    /**
     * Generates an Activity Sequencing Diagram (Network Diagram) following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Activity Sequencing or null if generation fails
     */
    async getActivitySequencing(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('activity-sequencing', [
                'activity-list',
                'activity-attributes',
                'schedule-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Activity Sequencing document (for a Network Diagram) following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed Activity Sequencing document:

Project Context:
${fullContext}

Your Activity Sequencing document should:
- List all activities with their dependencies (predecessors and successors)
- Specify the dependency type for each relationship (FS, SS, FF, SF)
- Include any leads or lags in the dependencies
- Explain the logical basis for each dependency
- Identify mandatory vs. discretionary dependencies
- Identify external vs. internal dependencies
- Include a description of the critical path
- Note any constraints that affect sequencing

Format as a well-structured markdown document with tables showing the dependency relationships. Include an explanation of how to interpret the sequencing information and how it will be used in schedule development.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Activity Sequencing Generation', 'activity-sequencing');
    }

    /**
     * Generates Resource Requirements for project activities following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Resource Requirements or null if generation fails
     */
    async getResourceRequirements(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('resource-requirements', [
                'activity-list',
                'activity-attributes',
                'resource-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create comprehensive Resource Requirements following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create detailed Resource Requirements:

Project Context:
${fullContext}

Your Resource Requirements document should include:
- Resource types needed (people, equipment, materials, facilities)
- Skill sets required for each activity
- Quantity of resources needed
- When resources are needed (timing)
- Duration of resource needs
- Geographic location requirements
- Special conditions or constraints for resources
- Resource assumptions
- Resource availability considerations
- Team composition requirements
- Key technical skills required

Format as a well-structured markdown document with tables organizing resources by type and activity. Include an introduction explaining how resource requirements were determined and how they will be used in resource planning.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Resource Requirements Generation', 'resource-requirements');
    }

    /**
     * Generates Schedule Network Diagram following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Schedule Network Diagram or null if generation fails
     */
    async getScheduleNetworkDiagram(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('schedule-network-diagram', [
                'activity-list',
                'activity-sequencing',
                'activity-attributes'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Schedule Network Diagram following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed Schedule Network Diagram:

Project Context:
${fullContext}

Your Schedule Network Diagram document should include:
- Network diagram representation (textual description with paths)
- Activity nodes and their relationships
- Critical path identification
- Dependencies and constraints
- Float/slack calculations where applicable
- Predecessor and successor relationships
- Network logic validation
- Milestone integration points
- Risk considerations in sequencing

Format as a well-structured markdown document with clear descriptions of the network paths, critical activities, and sequencing logic. Include tables showing activity relationships and explanations of the network flow.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1600);
            return getAIProcessor().extractContent(response);
        }, 'Schedule Network Diagram Generation', 'schedule-network-diagram');
    }

    /**
     * Generates Milestone List following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Milestone List or null if generation fails
     */
    async getMilestoneList(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('milestone-list', [
                'project-scope-statement',
                'work-breakdown-structure',
                'schedule-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Milestone List following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed Milestone List:

Project Context:
${fullContext}

Your Milestone List document should include:
- Key project milestones with dates
- Deliverable completion milestones
- Phase gate milestones
- External dependency milestones
- Regulatory or compliance milestones
- Milestone descriptions and acceptance criteria
- Milestone owners and stakeholders
- Risk mitigation milestones
- Quality gates and review milestones

Format as a well-structured markdown document with tables organizing milestones by phase, type, and priority. Include explanations of milestone significance and dependencies.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1400);
            return getAIProcessor().extractContent(response);
        }, 'Milestone List Generation', 'milestone-list');
    }

    /**
     * Generates inputs for developing the project schedule following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Develop Schedule Input or null if generation fails
     */
    async getDevelopScheduleInput(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('develop-schedule-input', [
                'activity-list',
                'activity-attributes',
                'activity-sequencing',
                'resource-requirements',
                'schedule-network-diagram'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create comprehensive inputs for developing the project schedule following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create detailed inputs for the Develop Schedule process:

Project Context:
${fullContext}

Your Develop Schedule Input document should include:
- Activity duration estimates and basis of estimates
- Resource calendars and availability
- Project calendars and working times
- Schedule constraints and assumptions
- Risk considerations affecting schedule
- Schedule baseline requirements
- Schedule management approach
- Resource optimization considerations
- Schedule compression techniques to consider
- Quality considerations affecting timing
- Integration with other project plans

Format as a well-structured markdown document with clear sections for each input type. Include tables organizing the information and explanations of how these inputs will be used in schedule development.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1700);
            return getAIProcessor().extractContent(response);
        }, 'Develop Schedule Input Generation', 'develop-schedule-input');
    }

    /**
     * Generates Activity Duration Estimates following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Activity Duration Estimates or null if generation fails
     */
    async getActivityDurationEstimates(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('activity-duration-estimates', [
                'activity-list',
                'activity-attributes',
                'work-breakdown-structure',
                'resource-requirements'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager with expertise in schedule estimation. Create comprehensive Activity Duration Estimates following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create detailed Activity Duration Estimates:

Project Context:
${fullContext}

Generate a comprehensive Activity Duration Estimates document with the following sections:

## Activity Duration Estimates

### Overview
- Purpose and scope of duration estimation
- Estimation methodology and approach
- Assumptions and constraints
- Review and approval process

### Estimation Methodology
- Estimation techniques used (expert judgment, analogous, parametric, three-point)
- Historical data sources and benchmarks
- Resource productivity factors
- Quality and complexity considerations

### Activity Duration Estimates Table
Create a detailed table with the following columns:
- Activity ID
- Activity Name
- WBS Reference
- Estimation Method
- Optimistic Duration (Best Case)
- Most Likely Duration
- Pessimistic Duration (Worst Case)
- Expected Duration (PERT calculation)
- Basis of Estimate
- Resource Requirements
- Assumptions
- Risk Factors

### Estimation Categories
- Development activities (coding, testing, documentation)
- Project management activities (planning, monitoring, reporting)
- Quality assurance activities (reviews, audits, testing)
- Infrastructure and environment setup
- Training and knowledge transfer

### Risk and Uncertainty
- Risk factors affecting duration estimates
- Contingency considerations
- Schedule buffer recommendations
- Sensitivity analysis results

### Quality Considerations
- Review and validation procedures
- Expert judgment application
- Historical data validation
- Continuous improvement processes

### Supporting Information
- Resource skill level assumptions
- Technology and tool considerations
- Dependencies and constraints
- Environmental factors

Format as professional markdown with clear tables and sections. Include at least 15-20 representative activities covering all major project phases. Follow PMBOK duration estimation best practices.`
            );
            const response = await getAIProcessor().makeAICall(messages, 2500);
            return getAIProcessor().extractContent(response);
        }, 'Activity Duration Estimates Generation', 'activity-duration-estimates');
    }

    /**
     * Generates Activity Resource Estimates following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Activity Resource Estimates or null if generation fails
     */
    async getActivityResourceEstimates(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('activity-resource-estimates', [
                'activity-list',
                'activity-duration-estimates',
                'work-breakdown-structure',
                'resource-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager with expertise in resource estimation. Create comprehensive Activity Resource Estimates following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create detailed Activity Resource Estimates:

Project Context:
${fullContext}

Generate a comprehensive Activity Resource Estimates document with the following sections:

## Activity Resource Estimates

### Overview
- Purpose and scope of resource estimation
- Resource estimation methodology
- Resource categories and types
- Review and approval process

### Resource Estimation Methodology
- Estimation techniques and approaches
- Historical data and benchmarks
- Expert judgment application
- Resource productivity assumptions

### Human Resource Estimates
Create detailed tables for:
- Project Manager and Leadership roles
- Software Developers (by skill level)
- Quality Assurance Engineers
- Business Analysts
- Technical Writers
- DevOps Engineers
- UI/UX Designers
- Database Administrators

### Resource Estimates Table
Create a comprehensive table with columns:
- Activity ID
- Activity Name
- Resource Type
- Resource Role/Skill Level
- Quantity Required
- Duration Needed
- Total Effort (person-hours)
- Peak Resource Requirement
- Resource Availability Requirements
- Cost Estimate
- Assumptions
- Risk Factors

### Technology and Equipment Resources
- Development hardware requirements
- Software licenses and tools
- Infrastructure and cloud resources
- Testing environments and tools
- Security and compliance tools

### Facilities and Support Resources
- Office space and facilities
- Communication and collaboration tools
- Training and development resources
- Administrative and support services

### Resource Optimization
- Resource leveling considerations
- Alternative resource options
- Make vs. buy decisions
- Outsourcing considerations

### Risk and Contingency
- Resource availability risks
- Skill gap analysis
- Contingency resource planning
- Backup resource strategies

### Cost Analysis
- Resource cost estimates by category
- Budget allocation recommendations
- Cost optimization opportunities
- Financial risk considerations

### Quality Considerations
- Resource qualification requirements
- Training and certification needs
- Performance standards and metrics
- Quality assurance procedures

Format as professional markdown with detailed tables and clear organization. Include comprehensive resource estimates for all major activity categories. Follow PMBOK resource estimation best practices.`
            );
            const response = await getAIProcessor().makeAICall(messages, 2800);
            return getAIProcessor().extractContent(response);
        }, 'Activity Resource Estimates Generation', 'activity-resource-estimates');
    }
}

