#!/usr/bin/env node

/**
 * MongoDB to Atlas Migration Script
 * 
 * This script helps migrate data from local Docker MongoDB to MongoDB Atlas
 * 
 * Usage:
 * 1. Export data from local MongoDB: node scripts/migrate-to-atlas.js export
 * 2. Import data to Atlas: node scripts/migrate-to-atlas.js import
 * 3. Verify migration: node scripts/migrate-to-atlas.js verify
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent';
const ATLAS_MONGODB_URI = process.env.ATLAS_MONGODB_URI || process.env.MONGODB_URI;
const DATABASE_NAME = 'requirements-gathering-agent';
const EXPORT_DIR = './migration-data';

// Collections to migrate
const COLLECTIONS = [
  'projects',
  'projectdocuments', 
  'stakeholders',
  'templates',
  'reviews',
  'documentaudittrails',
  'generationjobs',
  'aicontexttrackings'
];

async function createExportDirectory() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    console.log(`📁 Created export directory: ${EXPORT_DIR}`);
  }
}

async function exportCollection(client, collectionName) {
  try {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(collectionName);
    
    const documents = await collection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`⚠️ Collection '${collectionName}' is empty, skipping...`);
      return;
    }
    
    const exportPath = path.join(EXPORT_DIR, `${collectionName}.json`);
    fs.writeFileSync(exportPath, JSON.stringify(documents, null, 2));
    
    console.log(`✅ Exported ${documents.length} documents from '${collectionName}'`);
    return documents.length;
  } catch (error) {
    console.error(`❌ Error exporting collection '${collectionName}':`, error.message);
    return 0;
  }
}

async function exportData() {
  console.log('🚀 Starting data export from local MongoDB...');
  
  await createExportDirectory();
  
  const client = new MongoClient(LOCAL_MONGODB_URI);
  
  try {
    await client.connect();
    console.log('📊 Connected to local MongoDB');
    
    let totalExported = 0;
    
    for (const collectionName of COLLECTIONS) {
      const count = await exportCollection(client, collectionName);
      totalExported += count;
    }
    
    console.log(`\n🎉 Export completed! Total documents exported: ${totalExported}`);
    console.log(`📁 Export files saved to: ${EXPORT_DIR}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    await client.close();
  }
}

async function importCollection(client, collectionName) {
  try {
    const importPath = path.join(EXPORT_DIR, `${collectionName}.json`);
    
    if (!fs.existsSync(importPath)) {
      console.log(`⚠️ Import file for '${collectionName}' not found, skipping...`);
      return;
    }
    
    const documents = JSON.parse(fs.readFileSync(importPath, 'utf8'));
    
    if (documents.length === 0) {
      console.log(`⚠️ No documents to import for '${collectionName}', skipping...`);
      return;
    }
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(collectionName);
    
    // Clear existing data (optional - remove if you want to keep existing data)
    await collection.deleteMany({});
    
    // Insert documents
    const result = await collection.insertMany(documents);
    
    console.log(`✅ Imported ${result.insertedCount} documents to '${collectionName}'`);
    return result.insertedCount;
    
  } catch (error) {
    console.error(`❌ Error importing collection '${collectionName}':`, error.message);
    return 0;
  }
}

async function importData() {
  console.log('🚀 Starting data import to MongoDB Atlas...');
  
  if (!ATLAS_MONGODB_URI) {
    console.error('❌ ATLAS_MONGODB_URI environment variable is required');
    console.error('   Set it to your MongoDB Atlas connection string');
    process.exit(1);
  }
  
  const client = new MongoClient(ATLAS_MONGODB_URI);
  
  try {
    await client.connect();
    console.log('📊 Connected to MongoDB Atlas');
    
    let totalImported = 0;
    
    for (const collectionName of COLLECTIONS) {
      const count = await importCollection(client, collectionName);
      totalImported += count;
    }
    
    console.log(`\n🎉 Import completed! Total documents imported: ${totalImported}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await client.close();
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  const localClient = new MongoClient(LOCAL_MONGODB_URI);
  const atlasClient = new MongoClient(ATLAS_MONGODB_URI);
  
  try {
    await localClient.connect();
    await atlasClient.connect();
    
    console.log('📊 Connected to both local and Atlas databases');
    
    for (const collectionName of COLLECTIONS) {
      try {
        const localCount = await localClient.db(DATABASE_NAME).collection(collectionName).countDocuments();
        const atlasCount = await atlasClient.db(DATABASE_NAME).collection(collectionName).countDocuments();
        
        const status = localCount === atlasCount ? '✅' : '⚠️';
        console.log(`${status} ${collectionName}: Local=${localCount}, Atlas=${atlasCount}`);
        
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'export':
      await exportData();
      break;
    case 'import':
      await importData();
      break;
    case 'verify':
      await verifyMigration();
      break;
    default:
      console.log(`
🔧 MongoDB to Atlas Migration Script

Usage:
  node scripts/migrate-to-atlas.js <command>

Commands:
  export  - Export data from local MongoDB to JSON files
  import  - Import data from JSON files to MongoDB Atlas
  verify  - Verify that migration was successful

Environment Variables:
  LOCAL_MONGODB_URI  - Local MongoDB connection string (default: mongodb://localhost:27017/requirements-gathering-agent)
  ATLAS_MONGODB_URI  - MongoDB Atlas connection string (required for import/verify)

Example:
  # Export from local MongoDB
  node scripts/migrate-to-atlas.js export
  
  # Import to Atlas (set ATLAS_MONGODB_URI first)
  ATLAS_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db" node scripts/migrate-to-atlas.js import
  
  # Verify migration
  ATLAS_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db" node scripts/migrate-to-atlas.js verify
      `);
  }
}

main().catch(console.error);
