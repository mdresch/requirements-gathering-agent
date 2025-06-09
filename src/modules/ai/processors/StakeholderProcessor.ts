/**
 * Stakeholder Management Processor for Requirements Gathering Agent
 * 
 * Specialized AI processor for stakeholder management and analysis, handling
 * stakeholder registers, engagement plans, and communication requirements.
 * 
 * @class StakeholderProcessor
 * @description Handles AI functions related to stakeholder management and stakeholder analysis
 * including stakeholder registers, analysis, engagement plans and communication requirements.
 * Uses enhanced context management for improved document generation.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * @since 3.1.0
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\processors\StakeholderProcessor.ts
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

export class StakeholderProcessor extends BaseAIProcessor {

    /**
     * Generates a PMBOK-compliant stakeholder register based on project context
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Stakeholder register document or null if generation fails
     */
    async getStakeholderRegister(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {            // Use enhanced context management for better results
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('stakeholder-register', [
                'project-charter',
                'user-stories',
                'user-personas',
                'stakeholder-analysis'
            ]);
            const fullContext = enhancedContext || context;
              const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive Stakeholder Register following PMBOK 7th Edition standards.",
                `Based on the comprehensive project context below, create a detailed Stakeholder Register:

Project Context:
${fullContext}

Create a Stakeholder Register that includes:
- Identification information (name, position, role in project)
- Contact information
- Assessment information (requirements, expectations, influence level)
- Stakeholder classification
- Power/Interest assessment
- Engagement level (current and desired)
- Communication preferences and frequency
- Key concerns and interests
- Potential impact on project success

Follow PMBOK 7th Edition standards and best practices. Format as a well-structured markdown document with proper headers, tables, and organization.`
            );
            const response = await aiProcessor.makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Stakeholder Register Generation', 'stakeholder-register');
    }    /**
     * Generates a detailed stakeholder analysis document with power/interest grid
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Stakeholder analysis document or null if generation fails
     */    async getStakeholderAnalysis(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive stakeholder analysis document following PMBOK 7th Edition standards.",
                `Based on the following project context, generate a comprehensive PMBOK stakeholder analysis document.

Project Context:
${context}

Please create a detailed stakeholder analysis that includes:

## Stakeholder Analysis

### 1. Stakeholder Identification
- List all project stakeholders
- Categorize stakeholders (internal, external, primary, secondary)
- Identify stakeholder groups and individuals

### 2. Stakeholder Assessment
- Power/Interest Grid analysis
- Influence/Impact matrix
- Stakeholder attitudes (supportive, neutral, resistant)
- Current engagement levels

### 3. Stakeholder Prioritization
- High priority stakeholders requiring active management
- Medium priority stakeholders requiring regular monitoring
- Low priority stakeholders requiring minimal effort

### 4. Stakeholder Requirements and Expectations
- Business requirements by stakeholder group
- Success criteria from each stakeholder perspective
- Potential conflicts between stakeholder interests

### 5. Communication Preferences
- Preferred communication methods by stakeholder
- Frequency of communication needed
- Information requirements and reporting needs

### 6. Engagement Strategies
- Specific strategies for high-influence stakeholders
- Approaches for managing resistant stakeholders
- Methods to maintain support from champions

### 7. Risk Assessment
- Stakeholder-related risks
- Mitigation strategies for stakeholder risks
- Contingency plans for stakeholder issues

Follow PMBOK 7th Edition standards and best practices. Be specific and actionable.`
            );
            const response = await aiProcessor.makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Stakeholder Analysis Generation', 'stakeholder-analysis');
    }

    async getStakeholderEngagementPlan(context: string): Promise<string | null> {        return await this.handleAICall(async () => {
            // Use enhanced context management for stakeholder engagement plan
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('stakeholder-engagement-plan', [
                'stakeholder-register',
                'stakeholder-analysis',
                'project-charter',
                'communication-management-plan'
            ]);
            const fullContext = enhancedContext || context;
            
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive Stakeholder Engagement Plan following PMBOK 7th Edition standards.",
                `Based on the comprehensive project context below, create a detailed Stakeholder Engagement Plan:

Project Context:
${fullContext}

Create a Stakeholder Engagement Plan that includes:
- Current and desired stakeholder engagement levels
- Scope and impact of change on stakeholders
- Identified interrelationships and potential overlaps between stakeholders
- Communication requirements for the current project phase
- Information to be distributed to stakeholders (format, content, level of detail)
- Reason for the distribution of that information
- Timeframe and frequency for the distribution of required information
- Method for updating and refining the stakeholder engagement plan as the project progresses

Follow PMBOK 7th Edition standards and best practices. Format as a well-structured markdown document with proper headers, tables, and organization.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Stakeholder Engagement Plan Generation', 'stakeholder-engagement-plan');
    }
}
