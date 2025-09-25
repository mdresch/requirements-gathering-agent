import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

async function testServerDbDirect() {
  console.log('🧪 Testing Server Database Connection Directly...');
  
  try {
    // Use the same connection logic as the server
    let connectionUri = MONGODB_URI;
    
    // If the URI doesn't already specify a database, append it
    if (!connectionUri.includes('/') || connectionUri.endsWith('/')) {
      connectionUri = connectionUri.replace(/\/$/, '') + `/${MONGODB_DATABASE}`;
    }
    
    console.log(`🔌 Connecting with URI: ${connectionUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    console.log(`   Database name: ${db.databaseName}`);

    // Test the exact query that the repository uses
    console.log('\n📊 Testing Repository Query:');
    const repositoryQuery = {
      is_active: true,
      is_deleted: { $ne: true }
    };
    const repositoryResults = await db.collection('templates').find(repositoryQuery).toArray();
    console.log(`   Repository query results: ${repositoryResults.length} templates`);
    
    if (repositoryResults.length > 0) {
      console.log('   Sample result:', repositoryResults[0].name);
    }

    // Test projects query
    console.log('\n📋 Testing Projects Query:');
    const projectsResults = await db.collection('projects').find({}).toArray();
    console.log(`   Projects query results: ${projectsResults.length} projects`);
    
    if (projectsResults.length > 0) {
      console.log('   Sample project:', projectsResults[0].name);
    }

  } catch (error) {
    console.error('❌ Error testing server database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
  }
}

testServerDbDirect();
