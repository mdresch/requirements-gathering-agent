import { DocxGenerator } from './dist/src/modules/formatGenerators/DocxGenerator.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFormattingGeneration() {
    console.log('🧪 Testing DocxGenerator formatting capabilities...\n');
    
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

This test will verify that the Word document output properly renders all formatting.`;

    try {
        // Create DocxGenerator instance
        const generator = new DocxGenerator({
            title: 'Word Formatting Test Document',
            author: 'Requirements Gathering Agent',
            description: 'Test document for Word formatting validation',
            projectName: 'RGA Formatting Test',
            category: 'Testing'
        });        // Generate the test document
        const outputDir = path.join(__dirname, 'test-word-output');
        const outputPath = path.join(outputDir, 'formatting-test.docx');
        
        // Ensure directory exists
        await fs.mkdir(outputDir, { recursive: true });
        
        await generator.saveDocument(testMarkdown, outputPath);
        
        console.log('✅ Test document generated successfully!');
        console.log('📁 Location:', outputPath);
        console.log('\n🔍 Please open the document in Microsoft Word to verify:');
        console.log('   1. **Bold text** appears as actual bold formatting (not **text**)');
        console.log('   2. Tables appear as proper Word tables with borders');
        console.log('   3. Mixed formatting works correctly');
        console.log('   4. Document structure is professional');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testFormattingGeneration();
