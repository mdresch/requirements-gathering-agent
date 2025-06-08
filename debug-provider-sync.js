import { ProviderManager } from './dist/modules/ai/ProviderManager.js';
import { ConfigurationManager } from './dist/modules/ai/ConfigurationManager.js';

async function debugProviderSync() {
    console.log('=== Provider Synchronization Debug ===');
    
    // Test ProviderManager
    const providerManager = new ProviderManager();
    console.log('1. Validating providers...');
    const results = await providerManager.validateConfigurations();
    console.log('   Validation results:', results);
    console.log('   Active provider from ProviderManager:', providerManager.getActiveProvider());
    
    // Test ConfigurationManager
    const configManager = ConfigurationManager.getInstance();
    console.log('2. ConfigurationManager current provider:', configManager.getAIProvider());
    
    // Environment variables check
    console.log('3. Environment variables:');
    console.log('   GOOGLE_AI_API_KEY:', !!process.env.GOOGLE_AI_API_KEY);
    console.log('   AZURE_OPENAI_ENDPOINT:', !!process.env.AZURE_OPENAI_ENDPOINT);
    console.log('   GITHUB_TOKEN:', !!process.env.GITHUB_TOKEN);
    console.log('   AZURE_AI_ENDPOINT:', process.env.AZURE_AI_ENDPOINT);
}

debugProviderSync().catch(console.error);
