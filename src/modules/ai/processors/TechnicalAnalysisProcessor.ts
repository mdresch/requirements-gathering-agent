/**
 * Technical Analysis Processor
 * Handles AI functions related to technical analysis and architecture
 * 
 * @class TechnicalAnalysisProcessor
 * @description Specialized processor for generating technical documentation
 * including data models, tech stack analysis, architecture suggestions,
 * and integration recommendations.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
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
            return getAIProcessor().extractContent(response);
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
            return getAIProcessor().extractContent(response);
        }, 'Tech Stack Analysis Generation', 'tech-stack-analysis');
    }

    /**
     * Generates Risk Analysis for technical aspects
     */
    async getRiskAnalysis(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a risk management expert with technical expertise. Analyze the project for technical and business risks.",
                `Based on the project context below, provide a comprehensive risk analysis:

Project Context:
${context}

Include in your risk analysis:
- Technical risks (architecture, technology choices, integration challenges)
- Business risks (market, competitive, financial)
- Operational risks (team, process, timeline)
- Security risks (data protection, compliance, vulnerabilities)
- Risk probability and impact assessment
- Risk mitigation strategies
- Risk monitoring approaches
- Contingency planning recommendations

Format as a structured risk register with clear categorization and actionable mitigation strategies.`
            );
            
            const response = await getAIProcessor().makeAICall(messages, 1800);
            return getAIProcessor().extractContent(response);
        }, 'Risk Analysis Generation', 'risk-analysis');
    }

    /**
     * Generates Compliance Considerations
     */
    async getComplianceConsiderations(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a compliance expert with knowledge of regulatory requirements across industries. Analyze compliance needs for this project.",
                `Based on the project context below, provide comprehensive compliance considerations:

Project Context:
${context}

Include in your compliance analysis:
- Regulatory frameworks that may apply (GDPR, CCPA, HIPAA, SOX, etc.)
- Data protection and privacy requirements
- Industry-specific compliance needs
- Security and audit requirements
- Documentation and reporting obligations
- Compliance implementation strategies
- Ongoing monitoring and maintenance needs
- Cost and resource implications

Focus on practical, actionable compliance guidance that can be integrated into the development process.`
            );
            
            const response = await getAIProcessor().makeAICall(messages, 1600);
            return getAIProcessor().extractContent(response);
        }, 'Compliance Considerations Generation', 'compliance-considerations');
    }

    /**
     * Generates UI/UX Considerations
     */
    async getUiUxConsiderations(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a UX/UI expert with extensive experience in user-centered design. Analyze the project for UI/UX considerations.",
                `Based on the project context below, provide comprehensive UI/UX considerations:

Project Context:
${context}

Include in your UI/UX analysis:
- User experience strategy and principles
- User interface design guidelines
- Accessibility requirements (WCAG, Section 508)
- Mobile and responsive design considerations
- User journey mapping recommendations
- Information architecture suggestions
- Interaction design patterns
- Visual design and branding considerations
- Usability testing strategies
- Performance and optimization for UX
- Content strategy recommendations
- Internationalization and localization needs

Focus on creating user-centered design recommendations that align with business objectives and technical constraints.`
            );
            
            const response = await getAIProcessor().makeAICall(messages, 1700);
            return getAIProcessor().extractContent(response);
        }, 'UI/UX Considerations Generation', 'ui-ux-considerations');
    }
}
