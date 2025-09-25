import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

async function testTemplateData() {
  console.log('🧪 Testing Template Data Structure...');
  
  try {
    // Connect to database
    const connectionUri = MONGODB_URI.includes('?') 
      ? `${MONGODB_URI}&dbName=${MONGODB_DATABASE}`
      : `${MONGODB_URI}${MONGODB_DATABASE}`;
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    
    // Get a sample template to see its structure
    console.log('\n📊 Sample Template Structure:');
    const sampleTemplate = await db.collection('templates').findOne({});
    if (sampleTemplate) {
      console.log('Sample template fields:', Object.keys(sampleTemplate));
      console.log('Sample template data:', JSON.stringify(sampleTemplate, null, 2));
    } else {
      console.log('No templates found in database');
    }

    // Check template counts with different filters
    console.log('\n📊 Template Counts:');
    const totalTemplates = await db.collection('templates').countDocuments();
    console.log(`   Total templates: ${totalTemplates}`);

    const activeTemplates = await db.collection('templates').countDocuments({ is_active: true });
    console.log(`   Active templates: ${activeTemplates}`);

    const inactiveTemplates = await db.collection('templates').countDocuments({ is_active: false });
    console.log(`   Inactive templates: ${inactiveTemplates}`);

    const templatesWithoutActiveField = await db.collection('templates').countDocuments({ is_active: { $exists: false } });
    console.log(`   Templates without is_active field: ${templatesWithoutActiveField}`);

    const deletedTemplates = await db.collection('templates').countDocuments({ is_deleted: true });
    console.log(`   Deleted templates: ${deletedTemplates}`);

    const nonDeletedTemplates = await db.collection('templates').countDocuments({ is_deleted: { $ne: true } });
    console.log(`   Non-deleted templates: ${nonDeletedTemplates}`);

    const templatesWithoutDeletedField = await db.collection('templates').countDocuments({ is_deleted: { $exists: false } });
    console.log(`   Templates without is_deleted field: ${templatesWithoutDeletedField}`);

    // Test the exact query that the repository uses
    console.log('\n🔍 Testing Repository Query:');
    const repositoryQuery = {
      is_active: true,
      is_deleted: { $ne: true }
    };
    const repositoryResults = await db.collection('templates').find(repositoryQuery).toArray();
    console.log(`   Repository query results: ${repositoryResults.length} templates`);
    
    if (repositoryResults.length > 0) {
      console.log('   Sample result:', JSON.stringify(repositoryResults[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing template data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
  }
}

testTemplateData();
