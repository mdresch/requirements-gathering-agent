/**
 * Scope Management Processor
 * Handles AI functions related to scope definition, validation, and control
 * 
 * @class ScopeManagementProcessor
 * @description Specialized processor for scope management processes following PMBOK standards
 * 
 * @version 1.0.0
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

export class ScopeManagementProcessor extends BaseAIProcessor {    protected async generateScopeOutput(documentType: string, context: string, additionalContext: string[] = []): Promise<string | null> {
        const contextManager = await getContextManager();
        const enhancedContext = contextManager.buildContextForDocument(documentType, additionalContext);
        const fullContext = enhancedContext || context;

        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                `You are a PMBOK-certified project manager specializing in scope management. Generate a comprehensive ${documentType} following PMBOK 7th Edition standards.`,
                `Based on the project context below, create a well-structured ${documentType}:

Project Context:
${fullContext}

Follow PMBOK standards and ensure the document is clear, comprehensive, and tailored to the project's needs.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, `${documentType} Generation`, documentType);
    }

    /**
     * Generates a Scope Management Plan following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Scope Management Plan or null if generation fails
     */
    async getScopeManagementPlan(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'scope-management-plan',
            context,
            ['project-charter', 'stakeholder-register', 'user-stories']
        );
    }

    /**
     * Generates a Project Scope Statement following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Project Scope Statement or null if generation fails
     */
    async getProjectScopeStatement(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'project-scope-statement',
            context,
            ['project-charter', 'scope-management-plan', 'user-stories', 'stakeholder-register']
        );
    }

    /**
     * Generates Requirements Documentation following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Requirements Documentation or null if generation fails
     */
    async getRequirementsDocumentation(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'requirements-documentation',
            context,
            ['user-stories', 'project-charter', 'scope-management-plan', 'stakeholder-register']
        );
    }

    /**
     * Generates a Requirements Traceability Matrix following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Requirements Traceability Matrix or null if generation fails
     */
    async getRequirementsTraceabilityMatrix(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'requirements-traceability-matrix',
            context,
            ['requirements-documentation', 'project-scope-statement', 'work-breakdown-structure']
        );
    }

    /**
     * Generates a Plan Scope Management process document following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Plan Scope Management process or null if generation fails
     */
    async getPlanScopeManagement(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'plan-scope-management',
            context,
            ['project-charter', 'project-management-plan', 'stakeholder-register']
        );
    }

    /**
     * Generates a Define Scope Process document following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Define Scope Process or null if generation fails
     */
    async getDefineScopeProcess(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'define-scope-process',
            context,
            ['requirements-documentation', 'scope-management-plan', 'project-charter']
        );
    }

    /**
     * Generates Work Performance Information (Scope) document following PMBOK standards
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Work Performance Information (Scope) or null if generation fails
     */
    async getWorkPerformanceInformationScope(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'work-performance-information-scope',
            context,
            ['scope-baseline', 'project-management-plan', 'validate-scope', 'control-scope']
        );
    }
}
