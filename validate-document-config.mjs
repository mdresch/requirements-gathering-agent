#!/usr/bin/env node

/**
 * Validation script to check if all documents in generationTasks.ts 
 * are properly configured in fileManager.ts DOCUMENT_CONFIG
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Validating Document Configuration...\n');

try {
    // Read the generation tasks file
    const tasksFile = readFileSync('src/modules/documentGenerator/generationTasks.ts', 'utf-8');
    
    // Read the fileManager file
    const fileManagerFile = readFileSync('src/modules/fileManager.ts', 'utf-8');
    
    // Extract document keys from GENERATION_TASKS
    const taskMatches = tasksFile.match(/{\s*key:\s*'([^']+)'/g) || [];
    const taskKeys = taskMatches.map(match => {
        const keyMatch = match.match(/key:\s*'([^']+)'/);
        return keyMatch ? keyMatch[1] : null;
    }).filter(Boolean);
    
    // Extract document keys from DOCUMENT_CONFIG in generationTasks.ts
    const configMatches = tasksFile.match(/'([^']+)':\s*{\s*filename:/g) || [];
    const configKeysFromTasks = configMatches.map(match => {
        const keyMatch = match.match(/'([^']+)':/);
        return keyMatch ? keyMatch[1] : null;
    }).filter(Boolean);
    
    // Extract document keys from DOCUMENT_CONFIG in fileManager.ts
    const fileManagerMatches = fileManagerFile.match(/'([^']+)':\s*{\s*title:/g) || [];
    const configKeysFromFileManager = fileManagerMatches.map(match => {
        const keyMatch = match.match(/'([^']+)':/);
        return keyMatch ? keyMatch[1] : null;
    }).filter(Boolean);
    
    console.log('📊 Document Analysis:');
    console.log(`   • Generation Tasks: ${taskKeys.length} documents`);
    console.log(`   • Config in generationTasks.ts: ${configKeysFromTasks.length} documents`);
    console.log(`   • Config in fileManager.ts: ${configKeysFromFileManager.length} documents`);
    
    // Find missing documents in fileManager.ts
    const missingInFileManager = taskKeys.filter(key => !configKeysFromFileManager.includes(key));
    const missingInGenerationConfig = taskKeys.filter(key => !configKeysFromTasks.includes(key));
    
    console.log('\n🔍 Missing Document Analysis:');
    
    if (missingInFileManager.length > 0) {
        console.log('❌ Documents missing from fileManager.ts DOCUMENT_CONFIG:');
        missingInFileManager.forEach(key => console.log(`   • ${key}`));
    } else {
        console.log('✅ All documents properly configured in fileManager.ts');
    }
    
    if (missingInGenerationConfig.length > 0) {
        console.log('\n❌ Documents missing from generationTasks.ts DOCUMENT_CONFIG:');
        missingInGenerationConfig.forEach(key => console.log(`   • ${key}`));
    } else {
        console.log('✅ All documents properly configured in generationTasks.ts');
    }
    
    // Show extra documents in fileManager that aren't in tasks
    const extraInFileManager = configKeysFromFileManager.filter(key => !taskKeys.includes(key));
    if (extraInFileManager.length > 0) {
        console.log('\n⚠️  Extra documents in fileManager.ts (not in generation tasks):');
        extraInFileManager.forEach(key => console.log(`   • ${key}`));
    }
    
    console.log('\n🎯 Summary:');
    if (missingInFileManager.length === 0 && missingInGenerationConfig.length === 0) {
        console.log('✅ All document configurations are properly synchronized!');
        console.log('✅ The "unknown" category bug should be fixed.');
    } else {
        console.log('❌ Document configuration issues found. Please fix the missing documents.');
    }
    
} catch (error) {
    console.error('❌ Error validating document configuration:', error.message);
    process.exit(1);
}
