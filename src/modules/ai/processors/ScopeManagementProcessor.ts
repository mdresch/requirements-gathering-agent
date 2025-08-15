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

export class ScopeManagementProcessor extends BaseAIProcessor {
    
    /**
     * Analyze scope change for potential scope creep
     * 
     * @param {string} changeDescription - Description of the scope change
     * @param {any} projectContext - Current project context
     * @returns {Promise<any>} Scope creep analysis result
     */
    async analyzeScopeCreep(changeDescription: string, projectContext: any): Promise<any> {
        return this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                `You are a PMBOK-certified project manager specializing in scope creep detection and analysis. Analyze scope changes for potential scope creep indicators.`,
                `Analyze the following scope change for potential scope creep:

Change Description: ${changeDescription}

Project Context:
${JSON.stringify(projectContext, null, 2)}

Provide analysis including:
1. Scope creep risk level (low/medium/high/critical)
2. Indicators of scope creep
3. Impact on project objectives
4. Recommended mitigation strategies
5. PMBOK compliance assessment
6. Stakeholder communication requirements

Format your response as a structured analysis with clear recommendations.`
            );
            const response = await aiProcessor.makeAICall(messages, 1000);
            return getAIProcessor().extractContent(response);
        }, 'Scope Creep Analysis', 'scope-creep-analysis');
    }

    /**
     * Generate adaptive scope control recommendations
     * 
     * @param {any} projectMetrics - Current project metrics
     * @param {any[]} recentChanges - Recent scope changes
     * @returns {Promise<string|null>} Adaptive control recommendations
     */
    async generateAdaptiveControlRecommendations(projectMetrics: any, recentChanges: any[]): Promise<string | null> {
        return this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                `You are an expert project manager specializing in adaptive scope control mechanisms. Generate intelligent recommendations based on project metrics and change patterns.`,
                `Based on the following project metrics and recent scope changes, provide adaptive scope control recommendations:

Project Metrics:
${JSON.stringify(projectMetrics, null, 2)}

Recent Scope Changes:
${JSON.stringify(recentChanges, null, 2)}

Provide recommendations for:
1. Adaptive threshold adjustments
2. Monitoring frequency optimization
3. Stakeholder engagement strategies
4. Risk mitigation approaches
5. Process improvements
6. PMBOK compliance enhancements
7. Predictive analytics insights

Format as actionable recommendations with priority levels.`
            );
            const response = await aiProcessor.makeAICall(messages, 1200);
            return getAIProcessor().extractContent(response);
        }, 'Adaptive Control Recommendations', 'adaptive-control-recommendations');
    }

    /**
     * Validate scope change against PMBOK standards
     * 
     * @param {any} scopeChange - Scope change details
     * @returns {Promise<any>} PMBOK validation result
     */
    async validateScopeChangePMBOK(scopeChange: any): Promise<any> {
        return this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                `You are a PMBOK 7th Edition expert specializing in scope management validation. Validate scope changes against PMBOK standards and best practices.`,
                `Validate the following scope change against PMBOK 7th Edition standards:

Scope Change Details:
${JSON.stringify(scopeChange, null, 2)}

Validate against PMBOK requirements:
1. Scope change control process (Section 5.6)
2. Impact analysis completeness
3. Stakeholder involvement requirements
4. Documentation standards
5. Approval workflow compliance
6. Risk assessment adequacy
7. Communication plan alignment

Provide:
- Compliance score (0-100)
- Non-compliance issues
- Required improvements
- PMBOK section references
- Recommended actions`
            );
            const response = await aiProcessor.makeAICall(messages, 1000);
            return getAIProcessor().extractContent(response);
        }, 'PMBOK Scope Validation', 'pmbok-scope-validation');
    }

    /**
     * Generate scope baseline recommendations
     * 
     * @param {string} context - Project context
     * @returns {Promise<string|null>} Scope baseline recommendations
     */
    async generateScopeBaseline(context: string): Promise<string | null> {
        return this.generateScopeOutput(
            'scope-baseline',
            context,
            ['project-charter', 'requirements-documentation', 'stakeholder-register', 'work-breakdown-structure']
        );
    }

    /**
     * Generate scope change impact analysis
     * 
     * @param {string} context - Project context
     * @param {any} changeDetails - Scope change details
     * @returns {Promise<string|null>} Impact analysis
     */
    async generateScopeChangeImpactAnalysis(context: string, changeDetails: any): Promise<string | null> {
        return this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                `You are a project management expert specializing in scope change impact analysis. Generate comprehensive impact assessments following PMBOK standards.`,
                `Generate a comprehensive scope change impact analysis:

Project Context:
${context}

Scope Change Details:
${JSON.stringify(changeDetails, null, 2)}

Provide detailed analysis of:
1. Schedule Impact
   - Timeline changes
   - Critical path effects
   - Milestone adjustments
   
2. Cost Impact
   - Budget implications
   - Resource cost changes
   - ROI considerations
   
3. Resource Impact
   - Additional resources needed
   - Skill requirements
   - Availability constraints
   
4. Quality Impact
   - Quality standards effects
   - Testing implications
   - Acceptance criteria changes
   
5. Risk Impact
   - New risks introduced
   - Risk mitigation strategies
   - Contingency planning
   
6. Stakeholder Impact
   - Affected stakeholders
   - Communication requirements
   - Approval needs

Format as a comprehensive impact assessment with quantified metrics where possible.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Scope Change Impact Analysis', 'scope-change-impact-analysis');
    }

    protected async generateScopeOutput(documentType: string, context: string, additionalContext: string[] = []): Promise<string | null> {
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
