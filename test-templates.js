#!/usr/bin/env node
/**
 * Test script to verify template discovery and category listing
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAvailableCategories, getTasksByCategory } from './dist/modules/documentGenerator/generationTasks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing Template Discovery System\n');

try {
    console.log('📋 Available Categories:');
    const categories = getAvailableCategories();
    console.log(`Found ${categories.length} categories:`, categories);
    console.log('');
    
    for (const category of categories) {
        const tasks = getTasksByCategory(category);
        
        if (tasks.length > 0) {
            // Convert category to display name
            const displayCategory = category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            console.log(`${displayCategory} (${tasks.length} documents):`);
            
            for (const task of tasks) {
                console.log(`  ${task.emoji} ${task.name} (key: ${task.key})`);
            }
            console.log('');
        }
    }
    
    console.log('\n✅ Template discovery test completed successfully!');
    
} catch (error) {
    console.error('❌ Error testing template discovery:', error);
    process.exit(1);
}
