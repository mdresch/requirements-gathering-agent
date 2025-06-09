/**
 * Work Breakdown Structure Processor
 * Handles AI functions related to Work Breakdown Structure (WBS) and related elements
 * 
 * @class WBSProcessor
 * @description Specialized processor for generating WBS, WBS Dictionary, and other
 * scope decomposition artifacts following PMBOK standards
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

// Use lazy initialization to resolve circular dependency
const aiProcessor = AIProcessor.getInstance();
let _contextManager: any = null;

// Lazy initialization function for contextManager
async function getContextManager(): Promise<any> {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = await import("../../contextManager.js");
        _contextManager = new ContextManager();
    }
    return _contextManager;
}

export class WBSProcessor extends BaseAIProcessor {
    /**
     * Generates a Work Breakdown Structure following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Work Breakdown Structure or null if generation fails
     */
    async getWorkBreakdownStructure(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('work-breakdown-structure', [
                'project-charter',
                'scope-management-plan',
                'user-stories',
                'stakeholder-register'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Work Breakdown Structure (WBS) following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed Work Breakdown Structure (WBS):

Project Context:
${fullContext}

Your Work Breakdown Structure should:
- Follow the 100% rule (all work in the project must be included)
- Have a hierarchical structure with at least 3 levels of decomposition
- Use a noun-based naming convention for work packages
- Include all major project deliverables and project management activities
- Be organized by project phases or major deliverables
- Include work packages that are estimable, manageable, and independent
- Use a clear numbering system (e.g., 1.1, 1.1.1, etc.)

Format as a well-structured markdown document with proper indentation for each level. Include a brief introduction explaining the purpose of the WBS and how it will be used.`
            );
            const response = await aiProcessor.makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Work Breakdown Structure Generation', 'work-breakdown-structure');
    }

    /**
     * Generates a WBS Dictionary following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} WBS Dictionary or null if generation fails
     */
    async getWBSDictionary(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('wbs-dictionary', [
                'work-breakdown-structure',
                'scope-management-plan',
                'project-charter'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive WBS Dictionary following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed WBS Dictionary:

Project Context:
${fullContext}

Your WBS Dictionary should include these elements for each work package:
- Work package identifier (WBS code)
- Work package name
- Description of work
- Responsible organization/individual
- Required resources
- Estimated duration
- Acceptance criteria
- Dependencies
- Quality requirements
- Assumptions and constraints

Format as a well-structured markdown document, organized by WBS code, with proper headers, tables for each work package, and clear descriptions.`
            );
            const response = await aiProcessor.makeAICall(messages, 2000);
            return getAIProcessor().extractContent(response);
        }, 'WBS Dictionary Generation', 'wbs-dictionary');
    }

    /**
     * Generates a Scope Baseline document following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Scope Baseline or null if generation fails
     */
    async getScopeBaseline(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager(); const enhancedContext = contextManager.buildContextForDocument('scope-baseline', [
                'project-scope-statement',
                'work-breakdown-structure',
                'wbs-dictionary',
                'project-charter'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager. Create a comprehensive Scope Baseline document following PMBOK guidelines for a software project.",
                `Based on the comprehensive project context below, create a detailed Scope Baseline document:

Project Context:
${fullContext}

Your Scope Baseline document should:
- Summarize the approved Project Scope Statement
- Include or reference the approved Work Breakdown Structure
- Include or reference the approved WBS Dictionary
- Describe how the scope baseline will be used for performance measurement
- Explain the process for scope baseline maintenance and updates
- Define the relationship between the scope baseline and other project baselines

Format as a well-structured markdown document with proper headers, sections, and clear explanations. This document should serve as the foundation for scope control throughout the project.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Scope Baseline Generation', 'scope-baseline');
    }

    /**
     * Generates a Create WBS Process document following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Create WBS Process or null if generation fails
     */
    async getCreateWbsProcess(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('create-wbs-process', [
                'project-scope-statement',
                'requirements-documentation',
                'scope-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager specializing in scope management. Create a comprehensive Create WBS Process document following PMBOK standards.",
                `Based on the comprehensive project context below, create a detailed Create WBS Process document:

Project Context:
${fullContext}

Generate a comprehensive Create WBS Process document with the following sections:

## Create WBS Process

### Process Overview
- Purpose and objectives of WBS creation
- Process scope and boundaries
- Integration with scope management processes
- PMBOK process group and knowledge area alignment

### Process Inputs
- Project scope statement
- Requirements documentation
- Enterprise environmental factors
- Organizational process assets

### Tools and Techniques
- Decomposition techniques
- Expert judgment
- Templates and historical information
- Rolling wave planning approaches

### Process Outputs
- Scope baseline (WBS, WBS Dictionary, Project Scope Statement)
- Project documents updates
- Lessons learned and process improvements

### WBS Development Activities
- Scope decomposition approach
- Work package definition criteria
- Hierarchical structure development
- 100% rule application

### Quality Considerations
- WBS quality criteria and standards
- Review and validation processes
- Stakeholder approval procedures
- Documentation requirements

### Process Guidelines
- WBS creation best practices
- Common decomposition patterns
- Work package sizing guidelines
- Numbering and coding standards

### Integration Points
- Connection to schedule development
- Resource planning integration
- Cost estimation alignment
- Risk identification support

### Process Metrics
- WBS quality measurements
- Development efficiency metrics
- Stakeholder satisfaction indicators
- Process improvement measures

### Risk Management
- WBS-related risks and mitigation
- Quality assurance procedures
- Review and approval processes
- Change control considerations

Format as professional markdown suitable for process documentation and team guidance. Follow PMBOK process documentation standards.`
            );
            const response = await aiProcessor.makeAICall(messages, 2200);
            return getAIProcessor().extractContent(response);
        }, 'Create WBS Process Generation', 'create-wbs-process');
    }
}

