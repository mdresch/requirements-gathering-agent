/**
 * Test script to verify template-selector.ts compiles correctly
 */

import { 
  analyzeDocument, 
  getTemplateVariables, 
  DocumentType,
  getInDesignTemplate,
  getIllustratorTemplate,
  getPhotoshopTemplate,
  getDocumentGenerationTemplate 
} from './src/adobe/creative-suite/template-selector.js';

console.log('✅ Template selector imports successful!');

// Test document analysis
const sampleContent = 'This is a project charter for our new software development initiative...';
const analysis = analyzeDocument(sampleContent);

console.log('📊 Document Analysis Result:');
console.log(`  Document Type: ${analysis.documentType}`);
console.log(`  Confidence: ${analysis.confidence}`);
console.log(`  Visual Elements: ${analysis.visualElements.length}`);
console.log(`  Image Elements: ${analysis.imageElements.length}`);

// Test template paths
console.log('\n📁 Template Paths:');
console.log(`  InDesign: ${getInDesignTemplate(analysis.documentType)}`);
console.log(`  Document Generation: ${getDocumentGenerationTemplate(analysis.documentType)}`);

// Test template variables (async)
getTemplateVariables(analysis.documentType).then(variables => {
  console.log('\n🎨 Template Variables:');
  console.log(`  Company: ${variables.companyName}`);
  console.log(`  Document Title: ${variables.documentTitle}`);
  console.log(`  Generation Date: ${variables.generationDate}`);
  console.log('\n✅ Template selector test completed successfully!');
}).catch(error => {
  console.error('❌ Template variables error:', error.message);
});
