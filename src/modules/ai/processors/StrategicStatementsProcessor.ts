/**
 * Strategic Statements Processor
 * Handles generation of comprehensive strategic planning artifacts including
 * mission, vision, core values, strategic alignment, benefits realization,
 * value proposition, success metrics, and strategic roadmap documents
 */
import { BaseAIProcessor } from './BaseAIProcessor.js';

export class StrategicStatementsProcessor extends BaseAIProcessor {
    /**
     * Generate mission, vision, and core values document
     */
    async getAiMissionVisionAndCoreValues(context: string): Promise<string> {
        const prompt = `As a professional project manager, create a comprehensive Mission, Vision, and Core Values document for the following project:

Project Context:
${context}

Requirements:
1. Create a clear and inspiring mission statement
2. Define a compelling vision for the project's future
3. Establish 3-5 core values that will guide the project
4. Ensure alignment with PMBOK 7.0 principles
5. Make content specific to this project
6. Use professional language and formatting

Please structure the document as follows:

# Mission, Vision, and Core Values

## Mission Statement
[Clear, concise statement of the project's purpose]

## Vision Statement
[Inspiring description of the project's desired future state]

## Core Values
1. [Value 1]
   - Description
   - How it guides the project

2. [Value 2]
   - Description
   - How it guides the project

3. [Value 3]
   - Description
   - How it guides the project

## Implementation
[How these elements will be integrated into the project]

## Alignment with Project Goals
[How the mission, vision, and values support project objectives]`;

        return await this.handleAICall(
            async () => prompt,
            'mission-vision-core-values-generation'
        ) ?? '';
    }

    /**
     * Generate project purpose document
     */
    async getAiProjectPurpose(context: string): Promise<string> {
        const prompt = `As a professional project manager, create a comprehensive Project Purpose document for the following project:

Project Context:
${context}

Requirements:
1. Define the project's fundamental purpose
2. Explain why the project is necessary
3. Describe the expected impact and benefits
4. Ensure alignment with PMBOK 7.0 principles
5. Make content specific to this project
6. Use professional language and formatting

Please structure the document as follows:

# Project Purpose

## Executive Summary
[Brief overview of the project's purpose and importance]

## Project Background
[Context and history leading to the project]

## Purpose Statement
[Clear statement of why this project exists]

## Strategic Importance
[How this project supports organizational goals]

## Expected Impact
[What changes or benefits the project will bring]

## Success Criteria
[How we will know the project has achieved its purpose]

## Stakeholder Benefits
[How different stakeholders will benefit]

## Alignment with Strategy
[How this project fits into broader strategic initiatives]`;

        return await this.handleAICall(
            async () => prompt,
            'project-purpose-generation'
        ) ?? '';
    }

    /**
     * Generate strategic alignment document
     */
    async getAiStrategicAlignment(context: string): Promise<string> {
        const prompt = `As a professional strategic planning consultant, create a comprehensive Strategic Alignment document for the following project:

Project Context:
${context}

Requirements:
1. Demonstrate clear alignment with organizational strategy
2. Map project outcomes to strategic objectives
3. Identify strategic drivers and business case alignment
4. Define stakeholder strategic interests
5. Establish strategic success criteria and KPIs
6. Ensure alignment with PMBOK 7.0 principles
7. Use professional language and formatting

Please structure the document to show clear line of sight from project deliverables to strategic value.`;

        return await this.handleAICall(
            async () => prompt,
            'strategic-alignment-generation'
        ) ?? '';
    }

    /**
     * Generate benefits realization plan
     */
    async getAiBenefitsRealizationPlan(context: string): Promise<string> {
        const prompt = `As a professional benefits management consultant, create a comprehensive Benefits Realization Plan for the following project:

Project Context:
${context}

Requirements:
1. Identify and categorize all expected benefits
2. Provide quantified benefit estimates where possible
3. Create measurement framework with specific KPIs
4. Establish benefits realization timeline
5. Map benefits to stakeholder groups
6. Include financial analysis with ROI calculations
7. Address risks to benefit realization
8. Ensure alignment with PMBOK 7.0 benefits management principles
9. Use professional language and formatting

Focus on creating measurable, achievable benefits that deliver real value.`;

        return await this.handleAICall(
            async () => prompt,
            'benefits-realization-plan-generation'
        ) ?? '';
    }

    /**
     * Generate value proposition document
     */
    async getAiValueProposition(context: string): Promise<string> {
        const prompt = `As a professional business strategy consultant, create a compelling Value Proposition document for the following project:

Project Context:
${context}

Requirements:
1. Create a clear, memorable value proposition statement
2. Identify and quantify problems the project solves
3. Articulate unique differentiators and competitive advantages
4. Provide detailed value quantification across multiple dimensions
5. Map value propositions to different stakeholder groups
6. Include competitive analysis and investment justification
7. Address risks to value delivery
8. Use persuasive, business-focused language

The value proposition should motivate stakeholders to support the project.`;

        return await this.handleAICall(
            async () => prompt,
            'value-proposition-generation'
        ) ?? '';
    }

    /**
     * Generate strategic success metrics document
     */
    async getAiStrategicSuccessMetrics(context: string): Promise<string> {
        const prompt = `As a professional performance management consultant, create a comprehensive Strategic Success Metrics document for the following project:

Project Context:
${context}

Requirements:
1. Define what strategic success means for this project
2. Create SMART KPIs that align with strategic objectives
3. Organize metrics across financial, operational, strategic, and stakeholder dimensions
4. Establish measurement framework with data collection plans
5. Create realistic timelines for success achievement
6. Define governance structure for success monitoring
7. Address risks to success achievement
8. Ensure alignment with PMBOK 7.0 performance management principles
9. Use professional language and formatting

Focus on outcomes and strategic impact rather than just project outputs.`;

        return await this.handleAICall(
            async () => prompt,
            'strategic-success-metrics-generation'
        ) ?? '';
    }

    /**
     * Generate strategic roadmap document
     */
    async getAiStrategicRoadmap(context: string): Promise<string> {
        const prompt = `As a professional strategic planning consultant and program manager, create a comprehensive Strategic Roadmap for the following project:

Project Context:
${context}

Requirements:
1. Articulate clear strategic vision and destination
2. Develop logical strategic phases with realistic timelines
3. Define major strategic milestones with success criteria
4. Map value delivery throughout the roadmap timeline
5. Include resource and investment planning across phases
6. Address risks to the roadmap with contingency plans
7. Map stakeholder engagement throughout the journey
8. Define governance and decision points
9. Ensure alignment with PMBOK 7.0 schedule management principles
10. Use professional language and formatting

Create a roadmap that provides clear strategic direction and builds confidence in execution.`;

        return await this.handleAICall(
            async () => prompt,
            'strategic-roadmap-generation'
        ) ?? '';
    }
} 