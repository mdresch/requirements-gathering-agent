import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

async function testAppDbConnection() {
  console.log('🧪 Testing Application Database Connection...');
  console.log('\n📋 Connection Details:');
  console.log(`   URI: ${MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
  console.log(`   Database: ${MONGODB_DATABASE}`);

  try {
    // Test the same connection logic as the application
    const connectionUri = MONGODB_URI.includes('?') 
      ? `${MONGODB_URI}&dbName=${MONGODB_DATABASE}`
      : `${MONGODB_URI}${MONGODB_DATABASE}`;
    
    console.log(`\n🔌 Connecting with URI: ${connectionUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Application-style connection successful!');

    console.log('\n📊 Testing database access...');
    const db = mongoose.connection.db;
    console.log(`   Database name: ${db.databaseName}`);

    const collections = ['templates', 'projects', 'projectdocuments', 'users'];
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   📁 ${collectionName}: ${count} documents`);
      if (count > 0) {
        const sampleDoc = await db.collection(collectionName).findOne();
        if (collectionName === 'templates') console.log(`      Sample: ${sampleDoc.name}`);
        if (collectionName === 'projects') console.log(`      Sample: ${sampleDoc.name}`);
        if (collectionName === 'projectdocuments') console.log(`      Sample: ${sampleDoc.name}`);
        if (collectionName === 'users') console.log(`      Sample: ${sampleDoc.email}`);
      }
    }

    console.log('\n🎉 Application database connection test completed successfully!');

  } catch (error) {
    console.error('❌ Application database connection test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
  }
}

testAppDbConnection();
