import { AIProcessor } from './dist/modules/ai/AIProcessor.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== GitHub AI Document Generation Test ===');

async function testGitHubAIGeneration() {
    try {
        const aiProcessor = AIProcessor.getInstance();
        
        console.log('Testing simple text generation...');
        const testPrompt = "Generate a brief technical requirements document for a simple web application that manages a library's book inventory. Keep it under 500 words.";
        
        const messages = aiProcessor.createMessages(
            "You are a senior business analyst. Create a technical requirements document.",
            testPrompt
        );
        
        const result = await aiProcessor.makeAICall(messages, 1000);        
        console.log('✅ Generation successful!');
        console.log('Provider used:', result.metadata?.provider || 'Unknown');
        console.log('Token usage:', result.metadata?.tokensUsed || 'Not provided');
        console.log('Response length:', result.content.length);
        console.log('\n--- Generated Content ---');
        console.log(result.content);
        
    } catch (error) {
        console.error('❌ Generation failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

await testGitHubAIGeneration();
