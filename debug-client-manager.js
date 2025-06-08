import { AIClientManager } from './dist/modules/ai/AIClientManager.js';

async function debugClientManager() {
    console.log('=== AIClientManager Debug ===');
    
    const clientManager = AIClientManager.getInstance();
    
    console.log('1. Current provider:', clientManager.getCurrentProvider());
    console.log('2. Is initialized:', clientManager.isInitialized());
    
    try {
        console.log('3. Attempting to initialize...');
        await clientManager.initialize();
        console.log('   Initialization completed successfully');
        
        console.log('4. Testing clients:');
        const googleClient = clientManager.getClient('google-ai');
        const currentClient = clientManager.getClient();
        
        console.log('   Google AI client:', !!googleClient);
        console.log('   Current provider client:', !!currentClient);
        
    } catch (error) {
        console.error('   Initialization failed:', error.message);
    }
}

debugClientManager().catch(console.error);
