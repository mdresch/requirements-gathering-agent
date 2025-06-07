/**
 * Document Generator Usage Examples
 * 
 * This file demonstrates how to use the refactored document generator modules
 */

// New modular imports
import { DocumentGenerator } from '../modules/documentGenerator/index';
import { PMBOKValidator } from '../modules/pmbokValidation/index';
import { generateAllWithPMBOKValidation } from '../modules/documentGeneratorWithValidation';

// Legacy compatibility imports
import * as legacyDocGen from '../modules/documentGenerator';

async function demonstrateDocumentGeneration() {
    const projectContext = "This is a sample project context...";

    console.log("\n=== Example 1: Using Direct Module Imports ===");
    // Create a document generator
    const generator = new DocumentGenerator(projectContext, {
        maxConcurrent: 2,
        outputDir: 'generated-examples',
        generateIndex: true
    });

    // Generate all documents
    await generator.generateAll();
    
    console.log("\n=== Example 2: Using Integrated Generation with Validation ===");
    // Generate documents with PMBOK validation
    const results = await generateAllWithPMBOKValidation(projectContext, {
        outputDir: 'generated-examples'
    });
    console.log(`Documents generated: ${results.result.successCount}`);
    console.log(`PMBOK compliance: ${results.validation.pmbokCompliance.compliance ? 'Yes' : 'No'}`);
    
    console.log("\n=== Example 3: Using Legacy Compatibility Layer ===");
    // Use the compatibility functions
    const legacyGenerator = legacyDocGen.createDocumentGenerator(projectContext, {
        outputDir: 'generated-examples-legacy'
    });
    await legacyGenerator.generateAll();
}

// Run the demonstration
// demonstrateDocumentGeneration().catch(console.error);

// Export the function for use in other files
export { demonstrateDocumentGeneration };
