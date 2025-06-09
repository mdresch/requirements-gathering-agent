/**
 * Strategic Statements Processor
 * Handles generation of mission, vision, core values, and project purpose documents
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
} 