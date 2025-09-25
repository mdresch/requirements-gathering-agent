import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

async function testServerFinal() {
  console.log('🧪 Testing Server Final Connection...');
  
  try {
    // Use the exact same connection logic as the server
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
    
    console.log(`🔌 Connecting with URI: ${connectionUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    console.log(`   Database name: ${db.databaseName}`);

    // Test templates query
    console.log('\n📊 Testing Templates Query:');
    const templatesQuery = {
      is_active: true,
      is_deleted: { $ne: true }
    };
    const templatesResults = await db.collection('templates').find(templatesQuery).toArray();
    console.log(`   Templates query results: ${templatesResults.length} templates`);
    
    if (templatesResults.length > 0) {
      console.log('   Sample template:', templatesResults[0].name);
    }

    // Test projects query
    console.log('\n📋 Testing Projects Query:');
    const projectsResults = await db.collection('projects').find({}).toArray();
    console.log(`   Projects query results: ${projectsResults.length} projects`);
    
    if (projectsResults.length > 0) {
      console.log('   Sample project:', projectsResults[0].name);
    }

    // Test if the server should be able to see this data
    console.log('\n🎯 Server Should See:');
    console.log(`   Templates: ${templatesResults.length} active templates`);
    console.log(`   Projects: ${projectsResults.length} total projects`);

  } catch (error) {
    console.error('❌ Error testing server final:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
  }
}

testServerFinal();
