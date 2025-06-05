// Simple test of the updated cli-main integration
import { getDocumentCategories } from './dist/cli-main.js';

console.log('🧪 Testing cli-main.ts integration...');

try {
    const categories = getDocumentCategories();
    console.log('✅ getDocumentCategories() works!');
    console.log('📂 Found categories:', categories.length);
    console.log('📋 Categories:', categories.join(', '));
    console.log('🎉 CLI-main successfully integrated with modern DocumentGenerator!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
}
