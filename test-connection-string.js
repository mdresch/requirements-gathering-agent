import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

console.log('🧪 Testing Connection String Construction...');

console.log('\n📋 Environment Variables:');
console.log(`   MONGODB_URI: ${MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
console.log(`   MONGODB_DATABASE: ${MONGODB_DATABASE}`);

console.log('\n🔧 Connection String Construction:');
let connectionUri = MONGODB_URI;

// If the URI doesn't already specify a database, append it
if (!connectionUri.includes('/') || connectionUri.endsWith('/')) {
  connectionUri = connectionUri.replace(/\/$/, '') + `/${MONGODB_DATABASE}`;
}

console.log(`   Original URI: ${MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
console.log(`   Final URI: ${connectionUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);

console.log('\n✅ Connection string construction completed!');
