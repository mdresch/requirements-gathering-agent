/**
 * Planning Process Processor
 * Handles AI functions related to PMBOK planning processes and management plans
 * 
 * @class PlanningProcessor
 * @description Specialized processor for generating PMBOK management plan documentation
 * including scope, schedule, cost, quality, resource, communication, risk,
 * procurement, and stakeholder management plans.
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
function getContextManager(): any {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = require("../../contextManager");
        _contextManager = new ContextManager();
    }
    return _contextManager;
}

export class PlanningProcessor extends BaseAIProcessor {
    /**
     * Generates a Schedule Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Schedule Management Plan or null if generation fails
     */
    async getScheduleManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('schedule-management-plan', [
                'project-charter',
                'scope-management-plan',
                'project-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Schedule Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Schedule Management Plan:

Project Context:
${fullContext}

Your Schedule Management Plan should include:
- Introduction and purpose of the plan
- Schedule model and methodology (Agile, Waterfall, or hybrid)
- Schedule development process
- Level of accuracy and units of measure
- Schedule control procedures
- Control thresholds
- Schedule reporting formats
- Rules of performance measurement
- Release and iteration length
- Schedule change process
- Estimating approaches

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Schedule Management Plan Generation', 'schedule-management-plan');
    }

    /**
     * Generates a Cost Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Cost Management Plan or null if generation fails
     */
    async getCostManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('cost-management-plan', [
                'project-charter',
                'scope-management-plan',
                'project-management-plan',
                'schedule-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Cost Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Cost Management Plan:

Project Context:
${fullContext}

Your Cost Management Plan should include:
- Introduction and purpose of the plan
- Units of measure (e.g., staff hours, dollars)
- Level of precision and accuracy
- Organizational procedures links
- Control thresholds
- Rules of performance measurement (earned value management)
- Reporting formats
- Process descriptions
- Funding requirements
- Cost change control process
- Cost estimation methods and approach
- Cost tracking approach

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Cost Management Plan Generation', 'cost-management-plan');
    }

    /**
     * Generates a Quality Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Quality Management Plan or null if generation fails
     */
    async getQualityManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('quality-management-plan', [
                'project-charter',
                'scope-management-plan',
                'project-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Quality Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Quality Management Plan:

Project Context:
${fullContext}

Your Quality Management Plan should include:
- Introduction and purpose of the plan
- Quality standards to be used
- Quality objectives
- Quality roles and responsibilities
- Quality deliverables and processes
- Quality control activities
- Quality assurance activities
- Quality improvement approaches
- Quality tools and techniques
- Quality metrics and acceptance criteria
- Quality documentation requirements
- Verification and validation approach
- Testing strategy and procedures
- Quality control checklists

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Quality Management Plan Generation', 'quality-management-plan');
    }

    /**
     * Generates a Resource Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Resource Management Plan or null if generation fails
     */
    async getResourceManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('resource-management-plan', [
                'project-charter',
                'project-management-plan',
                'stakeholder-register',
                'scope-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Resource Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Resource Management Plan:

Project Context:
${fullContext}

Your Resource Management Plan should include:
- Introduction and purpose of the plan
- Roles and responsibilities
- Project organization charts
- Resource acquisition approach
- Resource breakdown structure
- Resource calendars
- Training needs
- Team development approach
- Recognition and rewards strategy
- Compliance requirements
- Safety considerations
- Resource control procedures
- Resource release plan
- Physical resource management

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Resource Management Plan Generation', 'resource-management-plan');
    }

    /**
     * Generates a Communication Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Communication Management Plan or null if generation fails
     */
    async getCommunicationManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('communication-management-plan', [
                'project-charter',
                'stakeholder-register',
                'stakeholder-engagement-plan',
                'project-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Communication Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Communication Management Plan:

Project Context:
${fullContext}

Your Communication Management Plan should include:
- Introduction and purpose of the plan
- Stakeholder communication requirements
- Information to be communicated
- Communication methods and technologies
- Communication flow diagrams
- Communication constraints
- Communication schedule and frequency
- Roles and responsibilities
- Communication approval process
- Communication storage, retrieval, and disposal
- Glossary of terms
- Communication matrix (who receives what, when, and how)
- Meeting schedules and formats
- Update approach and version control

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Communication Management Plan Generation', 'communication-management-plan');
    }

    /**
     * Generates a Risk Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Risk Management Plan or null if generation fails
     */
    async getRiskManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('risk-management-plan', [
                'project-charter',
                'project-management-plan',
                'stakeholder-register'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Risk Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Risk Management Plan:

Project Context:
${fullContext}

Your Risk Management Plan should include:
- Introduction and purpose of the plan
- Methodology and approach
- Roles and responsibilities
- Risk categories and breakdown structure
- Risk probability and impact definitions
- Risk tolerance thresholds
- Risk documentation approach
- Risk identification techniques
- Risk analysis approach (qualitative and quantitative)
- Risk response strategies
- Risk monitoring approach
- Risk communication plans
- Risk timing
- Risk tracking and auditing

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Risk Management Plan Generation', 'risk-management-plan');
    }

    /**
     * Generates a Procurement Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Procurement Management Plan or null if generation fails
     */
    async getProcurementManagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('procurement-management-plan', [
                'project-charter',
                'project-management-plan',
                'scope-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Procurement Management Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Procurement Management Plan:

Project Context:
${fullContext}

Your Procurement Management Plan should include:
- Introduction and purpose of the plan
- Procurement authority and roles
- Make-or-buy decisions process
- Contract types to be used
- Procurement requirements and constraints
- Independent cost estimates approach
- Procurement evaluation criteria
- Procurement documents to be used
- Risk management approach for procurements
- Procurement performance metrics
- Vendor management approach
- Procurement coordination with other project aspects
- Schedule and timing of procurement activities
- Contract change control process
- Contract closing procedures

Format as a well-structured markdown document with proper headers, lists, and organization. Ensure the plan is actionable, clear, and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Procurement Management Plan Generation', 'procurement-management-plan');
    }

    /**
     * Generates a Stakeholder Engagement Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Stakeholder Engagement Plan or null if generation fails
     */
    async getStakeholderEngagementPlan(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const enhancedContext = getContextManager().buildContextForDocument('stakeholder-engagement-plan', [
                'project-charter',
                'stakeholder-register',
                'communication-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Stakeholder Engagement Plan following PMBOK 7th Edition standards for a software project.",
                `Based on the comprehensive project context below, create a detailed Stakeholder Engagement Plan:

Project Context:
${fullContext}

Your Stakeholder Engagement Plan should include:
- Introduction and purpose of the plan
- Stakeholder engagement strategy and approach
- Stakeholder analysis and categorization
- Engagement levels (unaware, resistant, neutral, supportive, leading)
- Current and desired engagement levels
- Engagement methods and techniques
- Communication requirements and preferences
- Escalation procedures and protocols
- Change management considerations
- Cultural and organizational considerations
- Resource requirements for engagement
- Timing and frequency of engagement activities
- Monitoring and controlling approach
- Risk management for stakeholder engagement
- Success metrics and measurement

Format as a well-structured markdown document with proper headers, tables, and organization. Include stakeholder matrices and engagement strategies that are actionable and tailored to the Requirements Gathering Agent project.`
            );
            const response = await getAIProcessor().makeAICall(messages, 1600);
            return getAIProcessor().extractContent(response);
        }, 'Stakeholder Engagement Plan Generation', 'stakeholder-engagement-plan');
    }
}
