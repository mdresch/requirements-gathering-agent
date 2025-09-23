/**
 * Test script to verify template loading from database
 */

import { TemplateRepository } from './src/repositories/TemplateRepository.js';
import { dbConnection } from './src/config/database.js';
import { logger } from './src/utils/logger.js';

async function testTemplateLoading() {
    try {
        console.log('🔧 Testing template loading from database...');
        
        // Connect to database
        await dbConnection.connect();
        console.log('✅ Database connected');
        
        // Create repository instance
        const templateRepository = new TemplateRepository();
        console.log('✅ TemplateRepository created');
        
        // Test getting all templates
        console.log('📋 Fetching all templates...');
        const allTemplates = await templateRepository.getAllTemplates();
        console.log(`✅ Found ${allTemplates.length} templates`);
        
        if (allTemplates.length > 0) {
            console.log('📄 Sample template:');
            console.log({
                id: allTemplates[0]._id,
                name: allTemplates[0].name,
                category: allTemplates[0].category,
                is_active: allTemplates[0].is_active,
                is_deleted: allTemplates[0].is_deleted
            });
        }
        
        // Test search templates
        console.log('🔍 Testing template search...');
        const searchResults = await templateRepository.searchTemplates({
            limit: 5,
            offset: 0
        });
        console.log(`✅ Search returned ${searchResults.length} templates`);
        
        // Test getting template counts
        console.log('📊 Getting template counts...');
        const counts = await templateRepository.getTemplateCounts();
        console.log('✅ Template counts by category:', counts);
        
        console.log('🎉 All tests passed! Templates are loading correctly from database.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the test
testTemplateLoading();
