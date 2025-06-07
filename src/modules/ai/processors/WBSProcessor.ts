/**
 * Work Breakdown Structure Processor
 * Handles AI functions related to Work Breakdown Structure (WBS) and related elements
 * 
 * @class WBSProcessor
 * @description Specialized processor for generating WBS, WBS Dictionary, and other
 * scope decomposition artifacts following PMBOK standards
 * 
 * @version 1.0.0
 * @since 3.1.0
 */

import { ChatMessage } from "../types";
import { AIProcessor } from "../AIProcessor";
import type { ContextManager } from "../../contextManager";
import { BaseAIProcessor } from "./BaseAIProcessor";

// Use lazy initialization to resolve circular dependency
const aiProcessor = AIProcessor.getInstance();
let _contextManager: any = null;

// Lazy initialization function for contextManager
function getContextManager(): any {
    if (!_contextManager) {
        // Import dynamically to avoid circular dependency
        const { ContextManager } = require("../../contextManager");
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
            const enhancedContext = getContextManager().buildContextForDocument('work-breakdown-structure', [
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
            return aiProcessor.extractContent(response);
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
            const enhancedContext = getContextManager().buildContextForDocument('wbs-dictionary', [
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
            return aiProcessor.extractContent(response);
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
            const enhancedContext = getContextManager().buildContextForDocument('scope-baseline', [
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
            return aiProcessor.extractContent(response);
        }, 'Scope Baseline Generation', 'scope-baseline');
    }
}
