/**
 * Base processor for common functionality across AI processors
 */

import { AIProcessor } from "../AIProcessor.js";
import { ChatMessage } from "../types.js";
import { getFewShotExamples, formatExamplesForPrompt, FewShotExample } from "../few-shot-examples.js";
import { 
    getFewShotConfig, 
    shouldUseFewShotLearning, 
    calculateOptimalExampleCount,
    FewShotConfig 
} from "../few-shot-config.js";

const aiProcessor = AIProcessor.getInstance();

export abstract class BaseAIProcessor {
    protected async handleAICall(
        operation: () => Promise<string | null>,
        operationName: string,
        cacheKey?: string
    ): Promise<string | null> {
        try {
            return await aiProcessor.processAIRequest(operation, operationName);
        } catch (error: any) {
            console.error(`AI operation failed: ${operationName}`, error.message);
            return null;
        }
    }

    protected createStandardMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }

    /**
     * Create enhanced messages with few-shot learning examples
     * @param systemPrompt Base system prompt
     * @param userPrompt User prompt with context
     * @param documentType Type of document for few-shot examples
     * @param tokenLimit Token limit for the AI call
     * @param config Few-shot learning configuration
     * @returns Array of chat messages including few-shot examples
     */
    protected createEnhancedMessages(
        systemPrompt: string, 
        userPrompt: string, 
        documentType: string,
        tokenLimit: number = 2500,
        config?: Partial<FewShotConfig>
    ): ChatMessage[] {
        const fewShotConfig = getFewShotConfig(undefined, config);
        
        // Check if we should use few-shot learning
        if (!shouldUseFewShotLearning(documentType, tokenLimit, fewShotConfig)) {
            return this.createStandardMessages(systemPrompt, userPrompt);
        }
        
        const examples = getFewShotExamples(documentType);
        if (examples.length === 0) {
            // Fallback to standard messages if no examples available
            return this.createStandardMessages(systemPrompt, userPrompt);
        }
        
        // Calculate optimal number of examples based on token budget
        const optimalExampleCount = calculateOptimalExampleCount(tokenLimit, 800, fewShotConfig);
        const selectedExamples = fewShotConfig.randomSelection 
            ? this.selectRandomExamples(examples, optimalExampleCount)
            : examples.slice(0, optimalExampleCount);

        if (selectedExamples.length === 0) {
            return this.createStandardMessages(systemPrompt, userPrompt);
        }

        const enhancedSystemPrompt = `${systemPrompt}

You will be provided with examples of high-quality, PMBOK-compliant documents to guide your output. Study these examples carefully and follow their structure, format, and level of detail while adapting the content to the specific project context provided.

Key principles to follow from the examples:
1. Use clear, professional language appropriate for project management documentation
2. Include specific, measurable objectives with quantifiable metrics
3. Follow PMBOK 7th Edition standards and terminology
4. Provide comprehensive coverage of all required sections
5. Ensure content is tailored to the specific project context
6. Use proper markdown formatting for structure and readability
7. Include realistic timelines, budgets, and resource allocations
8. Address stakeholder needs and business value

${formatExamplesForPrompt(selectedExamples)}

Now, based on these examples and following the same quality standards, generate the requested document for the provided project context.`;

        return [
            { role: 'system', content: enhancedSystemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }

    /**
     * Select random examples from the available examples
     * @param examples Available examples
     * @param count Number of examples to select
     * @returns Randomly selected examples
     */
    private selectRandomExamples(examples: FewShotExample[], count: number): FewShotExample[] {
        if (count >= examples.length) {
            return examples;
        }
        
        const shuffled = [...examples].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Create PMBOK-specific enhanced messages with domain expertise
     * @param documentType Type of PMBOK document
     * @param context Project context
     * @param additionalContext Additional context items
     * @param tokenLimit Token limit for the AI call
     * @param config Few-shot learning configuration
     * @returns Enhanced chat messages with few-shot examples
     */
    protected createPMBOKMessages(
        documentType: string,
        context: string,
        additionalContext: string[] = [],
        tokenLimit: number = 2500,
        config?: Partial<FewShotConfig>
    ): ChatMessage[] {
        const systemPrompt = `You are a PMBOK-certified project manager with extensive experience in ${documentType} development. You follow PMBOK 7th Edition standards and best practices. Generate comprehensive, professional documentation that meets industry standards and stakeholder expectations.

Your expertise includes:
- PMBOK 7th Edition principles and practices
- Project management best practices and methodologies
- Stakeholder communication and engagement
- Risk management and quality assurance
- Budget planning and resource management
- Compliance with industry standards and regulations

Focus on creating practical, actionable content that provides real value to project stakeholders.`;

        const contextInfo = additionalContext.length > 0 
            ? `\n\nAdditional Context: ${additionalContext.join(', ')}`
            : '';

        const userPrompt = `Based on the project context below, create a well-structured ${documentType}:

Project Context:
${context}${contextInfo}

Requirements:
- Follow PMBOK 7th Edition standards
- Ensure the document is clear, comprehensive, and tailored to the project's needs
- Include specific, measurable objectives where applicable
- Use professional project management terminology
- Provide actionable guidance and clear deliverables
- Format using proper markdown structure`;

        return this.createEnhancedMessages(systemPrompt, userPrompt, documentType, tokenLimit, config);
    }
}
