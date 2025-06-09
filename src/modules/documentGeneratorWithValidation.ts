/**
 * Document Generator with PMBOK Validation Module for Requirements Gathering Agent
 * 
 * Integration module that combines document generation with comprehensive PMBOK validation
 * to ensure compliance with PMI standards and cross-document consistency.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Integrated document generation and PMBOK validation workflow
 * - Comprehensive validation against PMI standards
 * - Quality assessment scoring and reporting
 * - Cross-document consistency checking
 * - Professional compliance validation
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\documentGeneratorWithValidation.ts
 */
import { DocumentGenerator, GenerationResult, GenerationOptions } from './documentGenerator/index.js';
import { PMBOKValidator, ComprehensiveValidationResult } from './pmbokValidation/index.js';
import { GENERATION_TASKS } from './documentGenerator/generationTasks.js';

/**
 * Generate documents and validate against PMBOK standards
 * @param context Project context
 * @param options Generation options
 * @returns Combined generation and validation results
 */
export async function generateAllWithPMBOKValidation(
    context: string,
    options: GenerationOptions = {}
): Promise<{
    result: GenerationResult;
    validation: ComprehensiveValidationResult;
}> {
    // Generate all documents
    const generator = new DocumentGenerator(context, {
        maxConcurrent: 1,
        delayBetweenCalls: 500,
        continueOnError: true,
        generateIndex: true,
        cleanup: true,
        ...options
    });
    
    const result = await generator.generateAll();
    
    // Basic validation
    console.log('\n🔍 Validating document generation...');
    const validation = await generator.validateGeneration();
    
    // PMBOK compliance validation
    const validator = new PMBOKValidator(options.outputDir || 'generated-documents');
    const documentKeys = GENERATION_TASKS.map(task => task.key);
    const pmbokValidation = await validator.performComprehensiveValidation(documentKeys);
    
    // Summary report
    console.log('\n📋 Final Validation Summary:');
    console.log(`📁 Generated: ${result.successCount}/${result.successCount + result.failureCount} documents`);
    console.log(`✅ Files Present: ${validation.isComplete ? 'All' : 'Some missing'}`);
    console.log(`📊 PMBOK Compliance: ${pmbokValidation.pmbokCompliance.compliance ? 'Compliant' : 'Non-compliant'}`);
    console.log(`🎯 Consistency Score: ${pmbokValidation.pmbokCompliance.consistencyScore}/100`);
    
    return { 
        result, 
        validation: pmbokValidation 
    };
}

/**
 * Version information for the integrated module
 */
export const integratedVersion = '2.2.0';
