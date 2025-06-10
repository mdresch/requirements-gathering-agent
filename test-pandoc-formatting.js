import { PandocGenerator } from './dist/src/modules/formatGenerators/PandocGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPandocFormatting() {
    console.log('🧪 Testing PandocGenerator formatting capabilities...\n');
    
    // Sample markdown content with various formatting
    const testMarkdown = `# Requirements Gathering Agent Test Document

## Project Overview

This is a **Requirements Gathering Agent** test document that demonstrates various formatting features.

### Key Features

- Support for **bold text** formatting
- Support for *italic text* formatting  
- Support for ***bold and italic*** text
- Support for \`inline code\` formatting

### Test Table

| Feature | Status | Priority |
|---------|--------|----------|
| Bold Text | **Working** | High |
| Tables | *In Progress* | Medium |
| Code Blocks | \`Completed\` | Low |

### Additional Information

The **Requirements Gathering Agent** should properly format:

1. **Bold headings** and text
2. *Italic emphasis* text
3. Tables with proper borders
4. Mixed formatting like ***bold italic*** text

This test will verify that the Pandoc document output properly renders all formatting.`;

    try {
        // Create PandocGenerator instance
        const generator = new PandocGenerator({
            title: 'Pandoc Formatting Test Document',
            author: 'Requirements Gathering Agent',
            description: 'Test document for Pandoc formatting validation',
            projectName: 'RGA Pandoc Test',
            category: 'Testing'
        });

        const outputDir = path.join(__dirname, 'test-word-output');
        
        // Test Word document generation
        console.log('📝 Testing Word (.docx) generation...');
        const wordPath = path.join(outputDir, 'pandoc-word-test.docx');
        await generator.generateWordDocument(testMarkdown, wordPath);
        
        // Test PowerPoint generation
        console.log('📊 Testing PowerPoint (.pptx) generation...');
        const pptPath = path.join(outputDir, 'pandoc-presentation-test.pptx');
        await generator.generatePowerPointDocument(testMarkdown, pptPath);
        
        // Test PDF generation (might require additional setup)
        console.log('📄 Testing PDF generation...');
        try {
            const pdfPath = path.join(outputDir, 'pandoc-pdf-test.pdf');
            await generator.generatePdfDocument(testMarkdown, pdfPath);
        } catch (error) {
            console.log('⚠️  PDF generation failed (requires LaTeX):', error.message);
        }
        
        // Test HTML generation
        console.log('🌐 Testing HTML generation...');
        const htmlPath = path.join(outputDir, 'pandoc-html-test.html');
        await generator.generateHtmlDocument(testMarkdown, htmlPath);
        
        console.log('\n✅ Pandoc tests completed successfully!');
        console.log('\n🔍 Please check the generated files:');
        console.log('   📝 Word: pandoc-word-test.docx');
        console.log('   📊 PowerPoint: pandoc-presentation-test.pptx');
        console.log('   🌐 HTML: pandoc-html-test.html');
        console.log('\n📋 Verify that formatting appears correctly:');
        console.log('   1. **Bold text** appears as actual bold formatting');
        console.log('   2. *Italic text* appears as actual italic formatting');
        console.log('   3. Tables appear as proper formatted tables');
        console.log('   4. Headings appear with proper hierarchy');
        
    } catch (error) {
        console.error('❌ Pandoc test failed:', error.message);
        console.error('Stack:', error.stack);
        
        // Show installation instructions
        console.log('\n' + PandocGenerator.getInstallInstructions());
    }
}

testPandocFormatting();
