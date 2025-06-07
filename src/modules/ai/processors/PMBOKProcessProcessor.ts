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

import { ChatMessage } from "../types";
import { AIProcessor } from "../AIProcessor";
import type { ContextManager } from "../../contextManager";
import { BaseAIProcessor } from "./BaseAIProcessor";

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
            return aiProcessor.extractContent(response);
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
            ['user-stories', 'stakeholder-register']
        );
    }
}
