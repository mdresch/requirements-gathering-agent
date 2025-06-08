/**
 * Base processor for common functionality across AI processors
 */

import { AIProcessor } from "../AIProcessor.js";
import { ChatMessage } from "../types.js";

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
}
