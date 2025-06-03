/**
 * Basic functionality tests for Requirements Gathering Agent
 */

import { 
  generateStrategicSections, 
  generateRequirements,
  version 
} from '../index.js';

async function runBasicTests() {
  console.log(`🧪 Testing Requirements Gathering Agent v${version}`);
  
  const testInput = {
    businessProblem: 'Need a simple task management application',
    technologyStack: ['TypeScript', 'React', 'Node.js'],
    contextBundle: 'Basic task management for small teams'
  };

  try {
    console.log('✅ Package imports successfully');
    
    // Test strategic sections generation (without AI if no credentials)
    console.log('📋 Testing strategic sections generation...');
    const strategic = await generateStrategicSections(testInput);
    console.log('✅ Strategic sections function callable');

    // Test requirements generation (without AI if no credentials)
    console.log('📋 Testing requirements generation...');
    const requirements = await generateRequirements(testInput);
    console.log('✅ Requirements function callable');

    console.log('🎉 All basic tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export { runBasicTests };