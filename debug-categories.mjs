// Debug test to check category ordering
import { getDocumentCategories } from './dist/cli-main.js';

console.log('🔍 Debug: Checking category ordering...');

const categories = getDocumentCategories();
console.log('Raw categories:', categories);
console.log('Sorted categories:', [...categories].sort());
console.log('Are they equal?', JSON.stringify(categories) === JSON.stringify([...categories].sort()));
