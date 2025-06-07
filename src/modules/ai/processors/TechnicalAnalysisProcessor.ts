/**
 * Technical Analysis Processor
 * Handles AI functions related to technical analysis and architecture
 * 
 * @class TechnicalAnalysisProcessor
 * @description Specialized processor for generating technical documentation
 * including data models, tech stack analysis, architecture suggestions,
 * and integration recommendations.
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

export class TechnicalAnalysisProcessor extends BaseAIProcessor {

    /**
     * Generates data model suggestions based on project requirements
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Data model suggestions or null if generation fails
     */
    async getDataModelSuggestions(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a senior solution architect and database expert. Analyze the project requirements and suggest an optimal data model architecture.",
                `Based on the comprehensive project context below, provide detailed data model suggestions:

Project Context:
${context}

Your analysis should include:
- Core entities and their relationships
- Key attributes and data types
- Primary and foreign key recommendations
- Indexing recommendations
- Data integrity constraints
- Normalization level recommendations
- Entity-relationship diagrams (as text/ascii representation)
- Database technology recommendations (SQL, NoSQL, hybrid)
- Scalability and performance considerations
- Data security and privacy recommendations

Focus on creating a data model that is scalable, maintainable, and aligned with modern best practices. Consider performance, security, and flexibility in your recommendations.`
            );
            
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 1800);
            return aiProcessor.extractContent(response);
        }, 'Data Model Suggestions Generation', 'data-model-suggestions');
    }

    /**
     * Analyzes and recommends a technology stack based on project requirements
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Technology stack recommendations or null if generation fails
     */
    async getTechStackAnalysis(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a senior solution architect with expertise across multiple technology stacks. Analyze the project requirements and suggest an optimal technology stack architecture.",
                `Based on the project context below, provide a thorough technology stack analysis:

Project Context:
${context}

Include in your analysis:
- Frontend technology recommendations
- Backend technology recommendations
- Database recommendations
- DevOps and infrastructure recommendations
- Integration approaches
- API design recommendations
- Security considerations
- Scalability and performance considerations
- Development workflow recommendations
- Testing frameworks and strategies
- Monitoring and observability solutions
- Cost optimization approaches

For each technology recommendation:
- Justification for selection
- Key advantages and drawbacks
- Implementation considerations
- Considered alternatives

Focus on creating a cohesive technology ecosystem that is maintainable, scalable, and aligns with industry best practices.`
            );
            
            const aiProcessor = getAIProcessor();
            const response = await aiProcessor.makeAICall(messages, 2000);
            return aiProcessor.extractContent(response);
        }, 'Tech Stack Analysis Generation', 'tech-stack-analysis');
    }
}
