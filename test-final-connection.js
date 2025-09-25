import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

console.log('🧪 Testing Final Connection String Construction...');

console.log('\n📋 Environment Variables:');
console.log(`   MONGODB_URI: ${MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
console.log(`   MONGODB_DATABASE: ${MONGODB_DATABASE}`);

console.log('\n🔧 Connection String Construction:');
let connectionUri = MONGODB_URI;

// Always append the database name to ensure we connect to the right database
if (connectionUri.endsWith('/')) {
  connectionUri = connectionUri + MONGODB_DATABASE;
} else if (!connectionUri.includes('/')) {
  connectionUri = connectionUri + `/${MONGODB_DATABASE}`;
} else {
  // Replace any existing database name with our target database
  const baseUri = connectionUri.split('/').slice(0, -1).join('/');
  connectionUri = `${baseUri}/${MONGODB_DATABASE}`;
}

console.log(`   Original URI: ${MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
console.log(`   Final URI: ${connectionUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);

console.log('\n✅ Final connection string construction completed!');
