/**
 * Refactoring Migration Tests
 * Tests to ensure all refactored components are working correctly
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { DocumentGenerator } from './documentGenerator/index.js';
import { PMBOKValidator } from './pmbokValidation/index.js';
import { generateAllWithPMBOKValidation } from './documentGeneratorWithValidation.js';

/**
 * Verify that the refactoring did not break functionality
 */
export async function testRefactoredComponents(testContext: string = 'This is a test context'): Promise<boolean> {
    console.log('🧪 Testing refactored components...');
    let success = true;
    
    try {
        // Test DocumentGenerator
        const generator = new DocumentGenerator(testContext, {
            includeCategories: ['core-analysis'],
            maxConcurrent: 1,
            delayBetweenCalls: 10,
            outputDir: 'test-documents',
            cleanup: true
        });
        
        console.log('Testing DocumentGenerator.generateAll()...');
        const result = await generator.generateAll();
        console.log(`Generated ${result.successCount} documents`);
        
        // Test PMBOKValidator
        const validator = new PMBOKValidator('test-documents');
        console.log('Testing PMBOKValidator.validateGeneration()...');
        const validationResult = await validator.validateGeneration(['project-summary']);
        console.log(`Validation result: ${validationResult.isComplete ? 'Complete' : 'Incomplete'}`);
        
        // Test integrated function
        console.log('Testing generateAllWithPMBOKValidation()...');
        const integratedResult = await generateAllWithPMBOKValidation(testContext, {
            includeCategories: ['core-analysis'],
            outputDir: 'test-documents-integrated',
            cleanup: true
        });
        
        console.log(`Integrated test results: ${integratedResult.result.successCount} documents generated`);
        
        // Clean up test files
        await fs.rm('test-documents', { recursive: true, force: true });
        await fs.rm('test-documents-integrated', { recursive: true, force: true });
        
        console.log('✅ All tests passed');
    } catch (error: any) {
        console.error(`❌ Test failed: ${error.message}`);
        success = false;
    }
    
    return success;
}

/**
 * Main entry point for tests
 */
if (require.main === module) {
    testRefactoredComponents().then(success => {
        if (!success) {
            process.exit(1);
        }
    });
}
