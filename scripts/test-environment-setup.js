#!/usr/bin/env node

/**
 * Test Environment Setup Script
 * 
 * Tests the new environment configuration and fallback mechanisms
 * to ensure they work correctly.
 */

import { EnvironmentSetup } from '../dist/utils/environmentSetup.js';
import { ProviderFallbackManager } from '../dist/modules/ai/ProviderFallbackManager.js';

async function testEnvironmentSetup() {
    console.log('🧪 Testing Environment Configuration System...\n');
    
    try {
        // Test environment validation
        console.log('1. Testing Environment Validation...');
        const setup = EnvironmentSetup.getInstance();
        const validation = await setup.validateEnvironment();
        
        console.log(`   ✅ Validation completed`);
        console.log(`   📊 Configured providers: ${validation.configuredProviders.length}`);
        console.log(`   🌐 Available providers: ${validation.availableProviders.length}`);
        console.log(`   ⚠️ Warnings: ${validation.warnings.length}`);
        console.log(`   ❌ Errors: ${validation.errors.length}`);
        
        // Test fallback manager
        console.log('\n2. Testing Fallback Manager...');
        const fallbackManager = ProviderFallbackManager.getInstance();
        const config = fallbackManager.getConfig();
        
        console.log(`   🔄 Fallback enabled: ${config.enabled}`);
        console.log(`   📋 Fallback order: ${config.fallbackOrder.join(' → ')}`);
        console.log(`   ⏱️ Health check interval: ${config.healthCheckInterval}ms`);
        
        // Test provider health
        console.log('\n3. Testing Provider Health...');
        const healthMap = fallbackManager.getProviderHealth();
        for (const [provider, health] of healthMap) {
            const status = health.isHealthy ? '✅' : '❌';
            console.log(`   ${status} ${provider}: ${health.isHealthy ? 'Healthy' : 'Unhealthy'}`);
        }
        
        // Test best provider selection
        console.log('\n4. Testing Best Provider Selection...');
        const bestProvider = await fallbackManager.getBestProvider();
        console.log(`   🎯 Best provider: ${bestProvider || 'None available'}`);
        
        // Test configuration report
        console.log('\n5. Generating Configuration Report...');
        const report = await setup.generateConfigurationReport();
        console.log(`   📄 Report generated (${report.length} characters)`);
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testEnvironmentSetup().catch(console.error);