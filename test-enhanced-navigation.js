#!/usr/bin/env node

/**
 * Test script for Enhanced CLI Navigation
 * 
 * This script tests the enhanced navigation system to ensure it works correctly
 * with inquirer and provides proper menu navigation.
 */

import { startEnhancedNavigation } from './src/modules/cli/EnhancedMenuNavigation.js';

console.log('🧪 Testing Enhanced CLI Navigation...\n');

try {
  await startEnhancedNavigation();
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}