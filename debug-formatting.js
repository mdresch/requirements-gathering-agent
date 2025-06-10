import { DocxGenerator } from './dist/src/modules/formatGenerators/DocxGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugFormattingParsing() {
    console.log('🐛 Debugging Word formatting parsing...\n');
    
    // Simple test content with just bold text
    const simpleTest = `# Test Heading

This is **bold text** and this is normal text.

Another **bold word** here.`;

    try {
        const generator = new DocxGenerator({
            title: 'Debug Test Document',
            author: 'Debug Test',
            description: 'Testing formatting parsing'
        });
        
        const outputPath = path.join(__dirname, 'test-word-output', 'debug-test.docx');
        
        await generator.saveDocument(simpleTest, outputPath);
        
        console.log('✅ Debug document generated!');
        console.log('📁 Location:', outputPath);
        console.log('\n🔍 Please check if "bold text" and "bold word" appear as actual bold in Word.');
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugFormattingParsing();
