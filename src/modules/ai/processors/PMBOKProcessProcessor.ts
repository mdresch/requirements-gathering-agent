/**
 * PMBOK Process Processor
 * Handles AI functions related to PMBOK processes and process groups
 * 
 * @class PMBOKProcessProcessor
 * @description Specialized processor for generating PMBOK process documentation
 * including process descriptions, inputs, tools & techniques, outputs, and
 * integration points with other processes.
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

let _contextManager: any = null;
const getContextManager = async () => {
    if (!_contextManager) {
        const { ContextManager } = await import("../../contextManager.js");
        _contextManager = new ContextManager();
    }
    return _contextManager;
};

export class PMBOKProcessProcessor extends BaseAIProcessor {
    /**
     * Generates a comprehensive Project Management Plan following PMBOK standards
     */
    async getProjectManagementPlan(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'project-management-plan', 
            context,
            ['project-charter', 'stakeholder-register', 'user-stories', 'scope-management-plan']
        );
    }

    /**
     * Generates a Direct and Manage Project Work Process document
     */
    async getDirectAndManageProjectWork(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'direct-and-manage-project-work',
            context,
            ['project-management-plan', 'project-charter', 'scope-management-plan']
        );
    }

    protected async generatePMBOKOutput(pmbokSection: string, context: string, additionalContext: string[] = []): Promise<string | null> {
        const contextManager = await getContextManager();
        const enhancedContext = contextManager.buildContextForDocument(pmbokSection, additionalContext);
        const fullContext = enhancedContext || context;

        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                `You are a PMBOK-certified project manager. Generate a comprehensive ${pmbokSection} following PMBOK 7th Edition standards.`,
                `Based on the project context below, create a well-structured ${pmbokSection}:

Project Context:
${fullContext}

Follow PMBOK standards and ensure the document is clear, comprehensive, and tailored to the project's needs.`
            );
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, `${pmbokSection} Generation`, pmbokSection);
    }

    async getMonitorAndControlProjectWork(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'monitor-and-control-project-work',
            context,
            ['project-management-plan', 'project-charter', 'scope-management-plan', 'direct-and-manage-project-work']
        );
    }

    async getDevelopProjectCharter(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'develop-project-charter',
            context
        );
    }

    async getProjectCharter(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'project-charter',
            context,
            ['user-stories', 'stakeholder-register', 'cost-management-plan']
        );
    }

    /**
     * Generates an AI-enhanced Project Charter with detailed budget summary
     * following PMBOK standards
     */
    /**
     * Calculate appropriate token limit based on context complexity
     * @param context The project context
     * @param additionalContexts Array of additional context documents
     * @returns Calculated token limit
     */
    private calculateTokenLimit(context: string, additionalContexts: string[] = []): number {
        // Base token limit for minimal project charter
        const baseTokenLimit = 2000;
        
        // Calculate complexity factors
        const contextLength = context.length;
        const contextFactor = Math.ceil(contextLength / 1000) * 200; // Add 200 tokens per 1000 chars
        const additionalContextFactor = additionalContexts.length * 300; // Add 300 tokens per additional context
        
        // Calculate total token limit with bounds
        const calculatedLimit = baseTokenLimit + contextFactor + additionalContextFactor;
        const minTokenLimit = 2000;
        const maxTokenLimit = 8000;
        
        return Math.min(Math.max(calculatedLimit, minTokenLimit), maxTokenLimit);
    }

    async getAIProjectCharter(
        context: string,
        options: {
            tokenLimit?: number,
            additionalContexts?: string[]
        } = {}
    ): Promise<string | null> {
        try {
            // Validate input context
            if (!context || typeof context !== 'string') {
                throw new Error('Invalid context provided to getAIProjectCharter');
            }

            // Get context manager with error handling
            const contextManager = await getContextManager().catch(error => {
                throw new Error(`Failed to initialize context manager: ${error.message}`);
            });

            // Build enhanced context with required documents
            const enhancedContext = await Promise.resolve().then(() => {
                try {
                    return contextManager.buildContextForDocument('project-charter', 
                        ['user-stories', 'stakeholder-register', 'cost-management-plan']);
                } catch (error) {
                    const errorMsg = (error instanceof Error) ? error.message : String(error);
                    throw new Error(`Failed to build document context: ${errorMsg}`);
                }
            });

            const fullContext = enhancedContext || context;

            // Validate enhanced context
            if (!fullContext || fullContext.trim().length === 0) {
                throw new Error('Failed to generate valid context for project charter');
            }

            return await this.handleAICall(async () => {
                try {
                    const messages = this.createStandardMessages(
                        `You are a PMBOK-certified project manager with expertise in financial planning and budgeting. Generate a comprehensive project charter following PMBOK 7th Edition standards that includes all required core elements and a detailed budget summary.`,
                        `Based on the project context below, create a well-structured project charter that must include all the following sections:

Project Context:
${fullContext}

1. Project Purpose
   - Clear statement of why the project exists
   - Business case alignment
   - Strategic value and expected benefits
   - Problem or opportunity being addressed

2. Measurable Project Objectives
   Each objective must follow this structure:
   
   a) SMART Criteria Definition
      - Specific: Clear, unambiguous statement of what is to be achieved
      - Measurable: Quantifiable metrics with specific numbers/percentages
      - Achievable: Realistic within project constraints
      - Relevant: Aligned with business goals
      - Time-bound: Specific completion dates
   
   b) Quantifiable Metrics (for each objective)
      - Current baseline value
      - Target value
      - Measurement method
      - Measurement frequency
      - Data source
   
   c) Key Performance Indicators (KPIs)
      - Primary KPI with specific numeric targets
      - Secondary KPIs for tracking progress
      - Leading indicators
      - Lagging indicators
   
   d) Success Criteria
      - Minimum acceptable values
      - Target values
      - Stretch goals
      - Verification methods
   
   e) Timeline-based Milestones
      - Interim targets with dates
      - Progress checkpoints
      - Review periods
      - Final completion criteria
   
   f) Measurement Implementation
      - Tools and methods for tracking
      - Reporting frequency
      - Responsible parties
      - Data collection process
   
   Example Format for Each Objective:
   "Increase system performance by 40% (from current 2.5s to 1.5s response time) by Q4 2024, measured through automated performance testing conducted weekly, reported monthly, with interim targets of 2.0s by Q2 2024 and 1.7s by Q3 2024."

3. High-level Requirements
   - Business requirements
   - Stakeholder requirements
   - Technical requirements
   - Compliance and regulatory requirements
   - Quality requirements
   - Constraints and assumptions

4. Budget Summary
   - Total project cost estimate
   - Major cost categories and allocations
   - Key financial assumptions
   - Funding sources and constraints
   - Budget milestones and phasing
   - Financial risks and contingencies
   - Budget alignment with objectives

5. Integration Elements
   - Dependencies between objectives and requirements
   - Resource allocation alignment
   - Risk considerations across all areas
   - Stakeholder impact analysis

Follow PMBOK standards and ensure:
- All sections are clearly structured and labeled
- Each element contains specific, actionable information
- Requirements are traceable to objectives
- Budget aligns with scope and objectives
- Clear relationships between all charter components

Specific Requirements for Measurable Objectives:
1. Each objective MUST include:
   - Numeric targets with specific values
   - Current baseline measurements
   - Clear timeline with dates
   - Defined measurement method
   - Specific data sources
   - Responsible parties
   - Reporting frequency

2. Objectives must be written in this format:
   "Action + Metric + Target + Timeline + Measurement + Reporting"
   Example: "Reduce customer support tickets by 30% (from 1000 to 700 monthly) by Q3 2024, tracked through the support ticket system daily, reported bi-weekly to stakeholders"

3. Every objective requires:
   - Primary quantifiable metric
   - At least one secondary tracking metric
   - Minimum of 3 interim milestones
   - Clear success criteria with specific values
   - Defined measurement tools and methods

4. Measurement validation:
   - Each metric must have a defined data source
   - Collection methods must be specified
   - Frequency of measurement stated
   - Quality control measures identified
   - Verification process documented`
                    );

                    const aiProcessor = getAIProcessor();
                    if (!aiProcessor) {
                        throw new Error('Failed to initialize AI processor');
                    }

                    // Determine token limit
                    const calculatedTokenLimit = this.calculateTokenLimit(
                        fullContext,
                        options.additionalContexts || []
                    );
                    const tokenLimit = options.tokenLimit || calculatedTokenLimit;

                    // Validate token limit
                    if (tokenLimit < 2000 || tokenLimit > 8000) {
                        throw new Error('Token limit must be between 2000 and 8000');
                    }

                    const response: Awaited<ReturnType<AIProcessor["makeAICall"]>> = await (aiProcessor as AIProcessor).makeAICall(messages, tokenLimit)
                        .catch((error: Error) => {
                            throw new Error(`AI call failed: ${error.message}`);
                        });

                    if (!response) {
                        throw new Error('Received empty response from AI processor');
                    }

                    const content = getAIProcessor().extractContent(response);
                    if (!content) {
                        throw new Error('Failed to extract content from AI response');
                    }

                    return content;
                } catch (error) {
                    console.error('Error in AI project charter generation:', error);
                    const errorMsg = (error instanceof Error) ? error.message : String(error);
                    throw new Error(`Failed to generate project charter: ${errorMsg}`);
                }
            }, 'AI Project Charter Generation', 'project-charter');
        } catch (error) {
            console.error('Critical error in getAIProjectCharter:', error);
            throw error;
        }
    }

    /**
     * Generates a Validate Scope Process document following PMBOK standards
     */
    async getValidateScopeProcess(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'validate-scope-process',
            context,
            ['project-scope-statement', 'work-breakdown-structure', 'requirements-documentation']
        );
    }

    /**
     * Generates a Control Scope Process document following PMBOK standards
     */
    async getControlScopeProcess(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'control-scope-process',
            context,
            ['scope-management-plan', 'scope-baseline', 'project-management-plan']
        );
    }

    /**
     * Generates a Perform Integrated Change Control Process document following PMBOK standards
     */
    async getPerformIntegratedChangeControlProcess(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'perform-integrated-change-control',
            context,
            ['project-management-plan', 'project-charter', 'scope-management-plan']
        );
    }

    /**
     * Generates a Close Project or Phase Process document following PMBOK standards
     */
    async getCloseProjectOrPhaseProcess(context: string): Promise<string | null> {
        return this.generatePMBOKOutput(
            'close-project-or-phase',
            context,
            ['project-management-plan', 'project-charter', 'scope-management-plan']
        );
    }
}
