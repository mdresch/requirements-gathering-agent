/**
 * Project Management Processor
 * Handles top-level project management functions and integration
 * 
 * @class ProjectManagementProcessor
 * @description Manages core project management document generation including
 * summaries, user stories, and risk analysis.
 * 
 * @version 1.0.0
 * @since 3.1.0
 */

import { ChatMessage } from "../types";
import { AIProcessor } from "../AIProcessor";
import type { ContextManager } from "../../contextManager";
import { BaseAIProcessor } from "./BaseAIProcessor";

const aiProcessor = AIProcessor.getInstance();

let _contextManager: any = null;
const getContextManager = async () => {
    if (!_contextManager) {
        const { ContextManager } = await import("../../contextManager");
        _contextManager = new ContextManager();
    }
    return _contextManager;
};

export class ProjectManagementProcessor extends BaseAIProcessor {
    /**
     * Gets project summary and goals
     */
    async getSummaryAndGoals(context: string): Promise<string | null> {        return this.handleAICall(async () => {
                const messages = this.createStandardMessages(
                    "You are a senior business analyst experienced in extracting key project information. Create a comprehensive project summary and goals document following PMBOK standards.",
                    `Based on the provided project context, create a comprehensive summary and goals document:

Project Context:
${context}

Include the following sections:

### Project Summary
- Project name and purpose
- Business problem being solved
- Target users and stakeholders
- Key features and capabilities
- Technical approach overview

### Business Goals
- Primary business objectives
- User-centric outcomes
- Technical/architectural goals
- Success criteria and metrics

### Strategic Alignment
- Business strategy alignment
- Market considerations
- Innovation aspects
- Key differentiators`
                );
                const response = await aiProcessor.makeAICall(messages, 1500);
                return aiProcessor.extractContent(response);
            }, 
            "Project Summary and Goals Generation", 
            "project-summary"
        );
    }

    /**
     * Gets user stories
     */
    async getUserStories(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    "Generate user stories following agile best practices.",
                    `Based on the following context, generate comprehensive user stories: ${context}`
                );
                return ""; // Implement actual AI call
            },
            "User Stories Generation"
        );
    }

    /**
     * Gets risk analysis
     */
    async getRiskAnalysis(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    "Generate a risk analysis document following PMBOK standards.",
                    `Based on the following context, generate a comprehensive risk analysis: ${context}`
                );
                return ""; // Implement actual AI call
            },
            "Risk Analysis Generation"
        );
    }

    /**
     * Gets schedule network diagram
     */
    async getScheduleNetworkDiagram(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    "Generate a schedule network diagram following PMBOK standards.",
                    `Based on the following context, generate a network diagram: ${context}`
                );
                return ""; // Implement actual AI call
            },
            "Schedule Network Diagram Generation"
        );
    }

    /**
     * Gets milestone list
     */
    async getMilestoneList(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    "Generate a milestone list following PMBOK standards.",
                    `Based on the following context, generate a milestone list: ${context}`
                );
                return ""; // Implement actual AI call
            },
            "Milestone List Generation"
        );
    }

    /**
     * Gets schedule development input
     */
    async getDevelopScheduleInput(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    "Generate schedule development input following PMBOK standards.",
                    `Based on the following context, generate schedule development input: ${context}`
                );
                return ""; // Implement actual AI call
            },
            "Schedule Development Input Generation"
        );
    }
}
