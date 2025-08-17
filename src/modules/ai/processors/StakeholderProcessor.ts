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
     * Generates a comprehensive automated stakeholder analysis package
     * 
     * @param {string} context - Project context information
     * @returns {Promise<{analysis: string, register: string, engagementPlan: string}|null>} Complete stakeholder package or null if generation fails
     */
    async generateComprehensiveStakeholderPackage(context: string): Promise<{
        analysis: string | null,
        register: string | null,
        engagementPlan: string | null
    }> {
        console.log('🚀 Generating comprehensive stakeholder analysis package...');
        
        try {
            // Generate all three documents in parallel for efficiency
            const [analysis, register, engagementPlan] = await Promise.all([
                this.getStakeholderAnalysis(context),
                this.getStakeholderRegister(context),
                this.getStakeholderEngagementPlan(context)
            ]);

            return {
                analysis,
                register,
                engagementPlan
            };
        } catch (error) {
            console.error('❌ Failed to generate comprehensive stakeholder package:', error);
            return {
                analysis: null,
                register: null,
                engagementPlan: null
            };
        }
    }

    /**
     * Generates automated stakeholder identification from project context
     * 
     * @param {string} context - Project context information
     * @returns {Promise<string|null>} Stakeholder identification analysis or null if generation fails
     */
    async generateAutomatedStakeholderIdentification(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const messages = this.createStandardMessages(
                "You are a PMBOK-certified project manager specializing in automated stakeholder identification. Analyze project context to identify all potential stakeholders.",
                `Based on the following project context, perform automated stakeholder identification:

Project Context:
${context}

Perform comprehensive stakeholder identification that includes:

## Automated Stakeholder Identification

### 1. Primary Stakeholder Analysis
- Project sponsors and executive stakeholders
- Direct users and beneficiaries
- Project team members and key roles
- Customer representatives

### 2. Secondary Stakeholder Analysis  
- Regulatory and compliance stakeholders
- Vendor and supplier stakeholders
- Support and maintenance teams
- Organizational change stakeholders

### 3. External Stakeholder Analysis
- Industry partners and competitors
- Government and regulatory bodies
- Community and public stakeholders
- Media and communication stakeholders

### 4. Internal Stakeholder Analysis
- Department heads and functional managers
- IT and technical support teams
- Finance and procurement teams
- Legal and compliance teams

### 5. Stakeholder Relationship Mapping
- Stakeholder interdependencies
- Influence networks and hierarchies
- Communication pathways
- Decision-making authorities

### 6. Risk-Based Stakeholder Identification
- High-risk stakeholders (potential project blockers)
- Critical success stakeholders (project enablers)
- Neutral stakeholders requiring engagement
- Unknown stakeholders requiring investigation

Follow PMBOK 7th Edition standards for stakeholder identification. Provide specific, actionable stakeholder lists with clear categorization and rationale.`
            );
            const response = await aiProcessor.makeAICall(messages, 1500);
            return getAIProcessor().extractContent(response);
        }, 'Automated Stakeholder Identification', 'stakeholder-identification');
    }

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
            // Use enhanced context management for better stakeholder analysis
            const contextManager = await getContextManager();
            const enhancedContext = contextManager.buildContextForDocument('stakeholder-analysis', [
                'project-charter',
                'user-stories',
                'user-personas',
                'business-case',
                'project-scope-statement'
            ]);
            const fullContext = enhancedContext || context;

            const messages = this.createStandardMessages(
                "You are a PMBOK-certified Senior Project Manager and Stakeholder Management Expert specializing in automated stakeholder analysis. Create a comprehensive, PMBOK 7th Edition compliant stakeholder analysis with advanced automation features.",
                `Based on the comprehensive project context below, generate an advanced automated stakeholder analysis document:

Project Context:
${fullContext}

Create a comprehensive stakeholder analysis that includes:

## Automated Stakeholder Analysis (PMBOK 7.0 Compliant)

### 1. Executive Summary
- Project stakeholder landscape overview
- Key stakeholder insights and recommendations
- Critical success factors for stakeholder management
- Automated analysis methodology and confidence levels

### 2. Stakeholder Identification & Classification
- **Primary Stakeholders** (Direct project impact)
  - Project sponsors and executive leadership
  - Direct users and beneficiaries
  - Project team and key contributors
  - Customer and client representatives
- **Secondary Stakeholders** (Indirect project impact)
  - Regulatory and compliance bodies
  - Vendor and supplier networks
  - Support and operational teams
  - Organizational change agents
- **External Stakeholders** (Environmental factors)
  - Industry partners and competitors
  - Government and regulatory entities
  - Community and public interest groups
  - Media and communication channels
- **Internal Stakeholders** (Organizational ecosystem)
  - Department heads and functional managers
  - IT and technical infrastructure teams
  - Finance, procurement, and legal teams
  - Human resources and training teams

### 3. Advanced Stakeholder Assessment Matrix
- **Power/Interest Grid Analysis**
  - High Power, High Interest (Manage Closely)
  - High Power, Low Interest (Keep Satisfied)
  - Low Power, High Interest (Keep Informed)
  - Low Power, Low Interest (Monitor)
- **Influence/Impact Assessment**
  - Decision-making authority levels
  - Project outcome influence capacity
  - Resource control and allocation power
  - Change resistance or support potential
- **Stakeholder Attitude Analysis**
  - Champions and advocates (Supportive)
  - Neutral parties (Requires engagement)
  - Skeptics and critics (Resistant)
  - Unknown attitudes (Requires investigation)

### 4. Stakeholder Requirements & Expectations Analysis
- **Business Requirements by Stakeholder Group**
  - Functional requirements and success criteria
  - Performance expectations and quality standards
  - Timeline and delivery expectations
  - Budget and resource constraints
- **Success Criteria Mapping**
  - Individual stakeholder success definitions
  - Conflicting requirements identification
  - Priority ranking and trade-off analysis
  - Alignment with project objectives

### 5. Communication & Engagement Preferences
- **Communication Channel Analysis**
  - Preferred communication methods (email, meetings, reports)
  - Frequency requirements (daily, weekly, monthly, milestone-based)
  - Information detail levels (executive summary, detailed reports)
  - Escalation pathways and protocols
- **Engagement Style Preferences**
  - Formal vs. informal communication styles
  - Individual vs. group engagement preferences
  - Proactive vs. reactive communication needs
  - Decision-making involvement levels

### 6. Strategic Engagement Approaches
- **High-Influence Stakeholder Strategies**
  - Executive sponsor engagement protocols
  - Key decision-maker influence tactics
  - Resource controller relationship management
  - Change champion development approaches
- **Resistance Management Strategies**
  - Skeptic conversion techniques
  - Concern addressing methodologies
  - Benefit demonstration approaches
  - Gradual engagement escalation plans
- **Champion Maintenance Strategies**
  - Advocate empowerment techniques
  - Success story amplification methods
  - Continuous value demonstration
  - Recognition and reward systems

### 7. Risk Assessment & Mitigation
- **Stakeholder-Related Risk Analysis**
  - High-risk stakeholders (project blockers)
  - Critical dependency stakeholders
  - Resource withdrawal risks
  - Scope creep and change request risks
- **Mitigation Strategy Framework**
  - Early warning indicator systems
  - Contingency engagement plans
  - Alternative stakeholder pathways
  - Escalation and resolution protocols
- **Monitoring & Control Mechanisms**
  - Stakeholder satisfaction tracking
  - Engagement effectiveness metrics
  - Relationship health indicators
  - Proactive issue identification systems

### 8. PMBOK Process Alignment
- **13.1 Identify Stakeholders** - Comprehensive identification completed
- **13.2 Plan Stakeholder Engagement** - Strategic engagement planning included
- **13.3 Manage Stakeholder Engagement** - Tactical management approaches defined
- **13.4 Monitor Stakeholder Engagement** - Monitoring frameworks established

### 9. Automation & Continuous Improvement
- **Automated Monitoring Recommendations**
  - Stakeholder feedback collection systems
  - Engagement effectiveness tracking
  - Relationship health dashboards
  - Predictive risk analysis tools
- **Continuous Improvement Framework**
  - Regular stakeholder analysis updates
  - Engagement strategy refinement processes
  - Lessons learned integration
  - Best practice documentation and sharing

### 10. Implementation Roadmap
- **Phase 1: Foundation** (Weeks 1-2)
  - Stakeholder validation and confirmation
  - Initial engagement plan execution
  - Communication channel establishment
- **Phase 2: Engagement** (Weeks 3-8)
  - Active stakeholder management implementation
  - Regular communication rhythm establishment
  - Feedback collection and analysis
- **Phase 3: Optimization** (Ongoing)
  - Engagement strategy refinement
  - Relationship deepening initiatives
  - Continuous monitoring and improvement

Follow PMBOK 7th Edition standards and best practices. Provide specific, actionable recommendations with clear implementation guidance and success metrics.`
            );
            const response = await aiProcessor.makeAICall(messages, 2500);
            return getAIProcessor().extractContent(response);
        }, 'Advanced Stakeholder Analysis Generation', 'stakeholder-analysis');
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
