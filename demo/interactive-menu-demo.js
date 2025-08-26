#!/usr/bin/env node

/**
 * Interactive Menu Demo
 * 
 * Demonstrates the interactive CLI menu system functionality.
 * This script can be used to test the menu system without running the full CLI.
 */

import { startInteractiveMenu } from '../dist/modules/cli/InteractiveMenuSystem.js';

async function runDemo() {
  console.log('🎯 Interactive Menu Demo');
  console.log('─'.repeat(50));
  console.log('This demo showcases the interactive CLI menu system.');
  console.log('Use number keys to navigate, Ctrl+C to exit.\n');

  try {
    await startInteractiveMenu();
  } catch (error) {
    console.error('❌ Demo error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Demo ended. Thank you for testing!');
  process.exit(0);
});

// Run the demo
runDemo().catch(console.error);