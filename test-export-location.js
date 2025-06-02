#!/usr/bin/env node

// Test script to demonstrate where files are exported
import { generateMarkdownFile } from './dist/modules/documentGenerator.js';
import * as path from 'path';

console.log('Current working directory:', process.cwd());
console.log('Script location:', import.meta.url);

// Test creating a file in the current working directory (where the command is run)
const outputDir = path.join(process.cwd(), 'test-export-demo');
const fileName = 'test-file.md';
const title = 'Test Export Location';
const content = 'This file was created to test the export location behavior.';

try {
  await generateMarkdownFile(outputDir, fileName, title, content);
  console.log(`✅ File created at: ${path.join(outputDir, fileName)}`);
  console.log('This demonstrates that files are created relative to where the command is run, not inside the package directory.');
} catch (error) {
  console.error('❌ Error creating test file:', error);
}
