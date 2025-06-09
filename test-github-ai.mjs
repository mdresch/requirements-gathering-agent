import { ProviderManager } from './dist/modules/ai/ProviderManager.js';
import { ConfigurationManager } from './dist/modules/ai/ConfigurationManager.js';

console.log('=== GitHub AI Configuration Test ===');

// Test environment variables
console.log('1. Environment Variables:');
console.log('   GITHUB_TOKEN:', !!process.env.GITHUB_TOKEN);
console.log('   AZURE_AI_ENDPOINT:', process.env.AZURE_AI_ENDPOINT);
console.log('   GOOGLE_AI_API_KEY:', !!process.env.GOOGLE_AI_API_KEY);

// Test ConfigurationManager GitHub AI validation
console.log('\n2. ConfigurationManager GitHub AI Validation:');
const configManager = ConfigurationManager.getInstance();
configManager.setProvider('github-ai');
const validation = configManager.validateCurrentConfig();
console.log('   Valid:', validation.isValid);
console.log('   Missing vars:', validation.missingVars);

// Test ProviderManager
console.log('\n3. ProviderManager Provider Detection:');
const providerManager = new ProviderManager();
const results = await providerManager.validateConfigurations();
console.log('   Validation results:', results);
console.log('   Active provider:', providerManager.getActiveProvider());

// Test GitHub AI provider specifically
console.log('\n4. GitHub AI Provider Check:');
const githubValid = await providerManager.validateProvider('github-ai');
console.log('   GitHub AI valid:', githubValid);

console.log('\n✅ GitHub AI configuration test complete');
