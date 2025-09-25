#!/usr/bin/env node

/**
 * Node.js MongoDB Migration Script
 * 
 * This script migrates data from Docker MongoDB to Atlas using Node.js MongoDB driver
 * instead of requiring MongoDB Database Tools to be installed.
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';

// Configuration
const DOCKER_URI = 'mongodb://localhost:27017';
const ATLAS_URI = 'mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/';
const DATABASE_NAME = 'requirements-gathering-agent';

// Collections to migrate
const COLLECTIONS = [
  'templates',
  'projects', 
  'projectdocuments',
  'users',
  'audittrails',
  'feedback',
  'contexttracking',
  'generationjobs',
  'qualityassessments',
  'compliancereports'
];

class NodeMigration {
  constructor() {
    this.dockerClient = null;
    this.atlasClient = null;
    this.dockerDb = null;
    this.atlasDb = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async connectToDocker() {
    this.log('Connecting to Docker MongoDB...');
    try {
      this.dockerClient = new MongoClient(DOCKER_URI);
      await this.dockerClient.connect();
      this.dockerDb = this.dockerClient.db(DATABASE_NAME);
      
      // Test connection
      await this.dockerDb.admin().ping();
      this.log('Docker MongoDB connection successful', 'success');
      return true;
    } catch (error) {
      this.log(`Docker MongoDB connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async connectToAtlas() {
    this.log('Connecting to MongoDB Atlas...');
    try {
      this.atlasClient = new MongoClient(ATLAS_URI);
      await this.atlasClient.connect();
      this.atlasDb = this.atlasClient.db(DATABASE_NAME);
      
      // Test connection
      await this.atlasDb.admin().ping();
      this.log('Atlas connection successful', 'success');
      return true;
    } catch (error) {
      this.log(`Atlas connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async migrateCollection(collectionName) {
    this.log(`Migrating collection: ${collectionName}`);
    
    try {
      const sourceCollection = this.dockerDb.collection(collectionName);
      const targetCollection = this.atlasDb.collection(collectionName);
      
      // Get all documents from source
      const documents = await sourceCollection.find({}).toArray();
      this.log(`Found ${documents.length} documents in ${collectionName}`);
      
      if (documents.length === 0) {
        this.log(`No documents to migrate in ${collectionName}`, 'warning');
        return { success: true, count: 0 };
      }
      
      // Clear target collection
      await targetCollection.deleteMany({});
      
      // Insert documents into target
      if (documents.length > 0) {
        await targetCollection.insertMany(documents);
      }
      
      this.log(`Successfully migrated ${documents.length} documents to ${collectionName}`, 'success');
      return { success: true, count: documents.length };
      
    } catch (error) {
      this.log(`Failed to migrate ${collectionName}: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async verifyMigration() {
    this.log('Verifying migration...');
    
    for (const collectionName of COLLECTIONS) {
      try {
        const dockerCount = await this.dockerDb.collection(collectionName).countDocuments();
        const atlasCount = await this.atlasDb.collection(collectionName).countDocuments();
        
        if (dockerCount === atlasCount) {
          this.log(`✅ ${collectionName}: ${atlasCount} documents (verified)`, 'success');
        } else {
          this.log(`⚠️ ${collectionName}: Docker=${dockerCount}, Atlas=${atlasCount} (mismatch)`, 'warning');
        }
      } catch (error) {
        this.log(`❌ Could not verify ${collectionName}: ${error.message}`, 'error');
      }
    }
  }

  async createIndexes() {
    this.log('Creating indexes in Atlas...');
    
    const indexDefinitions = {
      templates: [
        { name: 1 },
        { category: 1 },
        { is_active: 1, is_deleted: 1 },
        { created_at: -1 }
      ],
      projects: [
        { name: 1 },
        { framework: 1 },
        { created_at: -1 }
      ],
      projectdocuments: [
        { projectId: 1 },
        { type: 1 },
        { status: 1 },
        { generatedAt: -1 }
      ],
      users: [
        { email: 1 },
        { role: 1 }
      ],
      audittrails: [
        { entityType: 1, entityId: 1 },
        { timestamp: -1 },
        { userId: 1 }
      ],
      feedback: [
        { projectId: 1 },
        { documentId: 1 },
        { createdAt: -1 }
      ],
      contexttracking: [
        { projectId: 1 },
        { documentId: 1 },
        { createdAt: -1 }
      ],
      generationjobs: [
        { projectId: 1 },
        { status: 1 },
        { createdAt: -1 }
      ],
      qualityassessments: [
        { documentId: 1 },
        { assessedAt: -1 }
      ],
      compliancereports: [
        { documentId: 1 },
        { generatedAt: -1 }
      ]
    };

    for (const [collectionName, indexes] of Object.entries(indexDefinitions)) {
      try {
        const collection = this.atlasDb.collection(collectionName);
        
        for (const index of indexes) {
          try {
            await collection.createIndex(index);
            this.log(`Created index on ${collectionName}: ${JSON.stringify(index)}`, 'success');
          } catch (error) {
            if (error.code === 85) { // Index already exists
              this.log(`Index already exists on ${collectionName}: ${JSON.stringify(index)}`, 'info');
            } else {
              this.log(`Failed to create index on ${collectionName}: ${error.message}`, 'warning');
            }
          }
        }
      } catch (error) {
        this.log(`Failed to create indexes for ${collectionName}: ${error.message}`, 'warning');
      }
    }
  }

  async generateConfigFiles() {
    this.log('Generating configuration files...');
    
    // Generate .env.atlas
    const envContent = `# MongoDB Atlas Configuration
MONGODB_URI=${ATLAS_URI}
MONGODB_DATABASE=${DATABASE_NAME}

# Application Configuration
NODE_ENV=production
PORT=3002

# API Configuration
API_KEY=your-secure-api-key-here

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Email Configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

    fs.writeFileSync('.env.atlas', envContent);
    this.log('Generated .env.atlas', 'success');

    // Generate database config
    const dbConfigContent = `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(\`MongoDB Atlas Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
`;

    // Ensure src/config directory exists
    if (!fs.existsSync('src/config')) {
      fs.mkdirSync('src/config', { recursive: true });
    }

    fs.writeFileSync('src/config/database.atlas.js', dbConfigContent);
    this.log('Generated src/config/database.atlas.js', 'success');

    // Generate docker-compose update
    const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=\${MONGODB_URI}
      - MONGODB_DATABASE=\${MONGODB_DATABASE}
      - API_KEY=\${API_KEY}
      - JWT_SECRET=\${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    # Remove MongoDB service since we're using Atlas

  # MongoDB service removed - using Atlas instead
  # mongodb:
  #   image: mongo:latest
  #   ports:
  #     - "27017:27017"
  #   volumes:
  #     - mongodb_data:/data/db
  #   environment:
  #     - MONGO_INITDB_ROOT_USERNAME=admin
  #     - MONGO_INITDB_ROOT_PASSWORD=password

# volumes:
#   mongodb_data:
`;

    fs.writeFileSync('docker-compose.atlas.yml', dockerComposeContent);
    this.log('Generated docker-compose.atlas.yml', 'success');
  }

  async closeConnections() {
    if (this.dockerClient) {
      await this.dockerClient.close();
      this.log('Docker MongoDB connection closed', 'info');
    }
    if (this.atlasClient) {
      await this.atlasClient.close();
      this.log('Atlas connection closed', 'info');
    }
  }

  async run() {
    try {
      this.log('Starting Node.js MongoDB Migration to Atlas', 'info');
      
      // Connect to both databases
      const dockerConnected = await this.connectToDocker();
      if (!dockerConnected) {
        this.log('Cannot proceed without Docker MongoDB connection', 'error');
        return;
      }

      const atlasConnected = await this.connectToAtlas();
      if (!atlasConnected) {
        this.log('Cannot proceed without Atlas connection', 'error');
        return;
      }

      // Migrate each collection
      let totalMigrated = 0;
      let totalErrors = 0;

      for (const collectionName of COLLECTIONS) {
        const result = await this.migrateCollection(collectionName);
        if (result.success) {
          totalMigrated += result.count;
        } else {
          totalErrors++;
        }
      }

      // Verify migration
      await this.verifyMigration();

      // Create indexes
      await this.createIndexes();

      // Generate configuration files
      await this.generateConfigFiles();

      this.log(`Migration completed! Migrated ${totalMigrated} documents across ${COLLECTIONS.length} collections`, 'success');
      if (totalErrors > 0) {
        this.log(`${totalErrors} collections had errors during migration`, 'warning');
      }

      this.log('Next steps:', 'info');
      console.log('1. Update your .env file to use the Atlas connection string');
      console.log('2. Update your database configuration to use src/config/database.atlas.js');
      console.log('3. Update your docker-compose.yml to remove the MongoDB service');
      console.log('4. Restart your application services');
      console.log('');
      this.log('Keep your Atlas connection string secure!', 'warning');

    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error');
    } finally {
      await this.closeConnections();
    }
  }
}

// Run migration
const migration = new NodeMigration();
migration.run().catch(console.error);
