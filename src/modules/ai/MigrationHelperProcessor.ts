/**
 * Migration Helper Processor
 * Utility class to handle common AI operations in the migration layer
 */

import { ChatMessage } from "./types.js";
import { AIProcessor } from "./AIProcessor.js";

export class MigrationHelperProcessor {
    /**
     * Creates standard message array for AI calls
     * 
     * @param {string} systemPrompt - System prompt defining the AI's role
     * @param {string} userPrompt - The main prompt content to send
     * @returns {ChatMessage[]} Formatted chat message array 
     */
    static createMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }

    /**
     * Generic handler for AI function calls with proper error handling
     * 
     * @param {Function} operation - Async function that makes the actual AI call
     * @param {string} operationName - Name of the operation for logging and metrics
     * @returns {Promise<string|null>} AI-generated content or null if operation fails
     */
    static async handleAICall(
        operation: () => Promise<string | null>,
        operationName: string
    ): Promise<string | null> {
        try {
            const aiProcessor = AIProcessor.getInstance();
            return await aiProcessor.processAIRequest(operation, operationName);
        } catch (error: any) {
            console.error(`Migration AI operation failed: ${operationName}`, error.message);
            return null;
        }
    }
}
