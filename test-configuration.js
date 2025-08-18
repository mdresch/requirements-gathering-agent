#!/usr/bin/env node

/**
 * Simple test script to verify the environment configuration system
 */

import EnvironmentConfigManager from './src/modules/ai/EnvironmentConfigManager.js';

async function testConfiguration() {
  console.log('🧪 Testing Environment Configuration System\n');
  
  try {
    // Initialize configuration manager
    const configManager = EnvironmentConfigManager.getInstance();
    
    // Test 1: Get current configuration
    console.log('📋 Current Configuration:');
    const config = configManager.getConfiguration();
    console.log(`  Primary Provider: ${config.primaryProvider}`);
    console.log(`  Fallback Providers: ${config.fallbackProviders.join(', ')}`);
    console.log(`  Auto Fallback: ${config.autoFallbackEnabled}`);
    console.log(`  Health Check Interval: ${config.healthCheckInterval}ms\n`);
    
    // Test 2: Validate configuration
    console.log('✅ Validating Configuration:');
    const validation = await configManager.validateConfiguration();
    console.log(`  Valid: ${validation.valid}`);
    if (validation.errors.length > 0) {
      console.log(`  Errors: ${validation.errors.length}`);
      validation.errors.forEach(error => console.log(`    - ${error}`));
    }
    if (validation.warnings.length > 0) {
      console.log(`  Warnings: ${validation.warnings.length}`);
      validation.warnings.forEach(warning => console.log(`    - ${warning}`));
    }
    if (validation.recommendations.length > 0) {
      console.log(`  Recommendations: ${validation.recommendations.length}`);
      validation.recommendations.forEach(rec => console.log(`    - ${rec}`));
    }
    console.log('');
    
    // Test 3: Provider health status
    console.log('🔍 Provider Health Status:');
    const healthMap = configManager.getProviderHealth();
    if (healthMap instanceof Map) {
      for (const [provider, health] of healthMap) {
        const statusIcon = health.status === 'healthy' ? '🟢' : 
                          health.status === 'degraded' ? '🟡' : '🔴';
        console.log(`  ${statusIcon} ${provider}: ${health.status} (${Math.round(health.successRate * 100)}% success)`);
      }
    }
    console.log('');
    
    // Test 4: Generate configuration template
    console.log('📄 Configuration Template:');
    const template = configManager.generateConfigurationTemplate();
    console.log('  Template generated successfully (first 200 chars):');
    console.log(`  ${template.substring(0, 200)}...\n`);
    
    // Test 5: Test fallback execution (mock)
    console.log('🔄 Testing Fallback Mechanism:');
    try {
      const result = await configManager.executeWithFallback(
        async (provider) => {
          console.log(`    Attempting operation with provider: ${provider}`);
          // Mock successful operation
          return `Success with ${provider}`;
        },
        'Test Operation'
      );
      console.log(`  Result: ${result}\n`);
    } catch (error) {
      console.log(`  Fallback test failed: ${error.message}\n`);
    }
    
    console.log('✅ Configuration system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    const configManager = EnvironmentConfigManager.getInstance();
    configManager.cleanup();
  }
}

// Run the test
testConfiguration().catch(console.error);