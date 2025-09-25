#!/usr/bin/env node

/**
 * MongoDB Docker to Atlas Migration Script
 * 
 * This script helps migrate data from a local Docker MongoDB instance to MongoDB Atlas.
 * It handles data export, import, and provides guidance for configuration updates.
 * 
 * Prerequisites:
 * 1. MongoDB Atlas cluster set up and accessible
 * 2. Docker MongoDB container running locally
 * 3. mongodump and mongorestore tools installed
 * 4. MongoDB Atlas connection string
 * 
 * Usage:
 * node scripts/migrate-to-atlas.js
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Configuration
const CONFIG = {
  // Docker MongoDB connection
  dockerHost: 'localhost',
  dockerPort: '27017',
  dockerDatabase: 'requirements-gathering-agent',
  
  // Atlas connection (will be prompted)
  atlasConnectionString: '',
  
  // Backup directory
  backupDir: './mongodb-backup',
  
  // Collections to migrate
  collections: [
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
  ]
};

class AtlasMigration {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async confirm(question) {
    const answer = await this.prompt(`${question} (y/N): `);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
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

  async checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    try {
      // Check if mongodump is available
      execSync('mongodump --version', { stdio: 'pipe' });
      this.log('mongodump is available', 'success');
    } catch (error) {
      this.log('mongodump not found. Please install MongoDB Database Tools', 'error');
      process.exit(1);
    }

    try {
      // Check if mongorestore is available
      execSync('mongorestore --version', { stdio: 'pipe' });
      this.log('mongorestore is available', 'success');
    } catch (error) {
      this.log('mongorestore not found. Please install MongoDB Database Tools', 'error');
      process.exit(1);
    }

    // Check if Docker MongoDB is accessible
    try {
      execSync(`mongosh --host ${CONFIG.dockerHost}:${CONFIG.dockerPort} --eval "db.adminCommand('ping')"`, { stdio: 'pipe' });
      this.log('Docker MongoDB is accessible', 'success');
    } catch (error) {
      this.log('Cannot connect to Docker MongoDB. Please ensure it\'s running', 'error');
      process.exit(1);
    }
  }

  async getAtlasConnectionString() {
    this.log('MongoDB Atlas Connection Setup');
    this.log('Please provide your MongoDB Atlas connection string.');
    this.log('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    
    const connectionString = await this.prompt('Atlas connection string: ');
    
    if (!connectionString.includes('mongodb+srv://')) {
      this.log('Invalid connection string format', 'error');
      return await this.getAtlasConnectionString();
    }
    
    CONFIG.atlasConnectionString = connectionString;
    return connectionString;
  }

  async testAtlasConnection() {
    this.log('Testing Atlas connection...');
    
    try {
      execSync(`mongosh "${CONFIG.atlasConnectionString}" --eval "db.adminCommand('ping')"`, { stdio: 'pipe' });
      this.log('Atlas connection successful', 'success');
      return true;
    } catch (error) {
      this.log('Atlas connection failed. Please check your connection string and network access', 'error');
      return false;
    }
  }

  async createBackupDirectory() {
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
      this.log(`Created backup directory: ${CONFIG.backupDir}`, 'success');
    }
  }

  async exportData() {
    this.log('Starting data export from Docker MongoDB...');
    
    const exportCommand = [
      'mongodump',
      `--host=${CONFIG.dockerHost}:${CONFIG.dockerPort}`,
      `--db=${CONFIG.dockerDatabase}`,
      `--out=${CONFIG.backupDir}`,
      '--gzip'
    ].join(' ');

    try {
      this.log(`Executing: ${exportCommand}`);
      execSync(exportCommand, { stdio: 'inherit' });
      this.log('Data export completed successfully', 'success');
    } catch (error) {
      this.log('Data export failed', 'error');
      throw error;
    }
  }

  async importData() {
    this.log('Starting data import to MongoDB Atlas...');
    
    const importCommand = [
      'mongorestore',
      `--uri="${CONFIG.atlasConnectionString}"`,
      `--dir=${CONFIG.backupDir}/${CONFIG.dockerDatabase}`,
      '--gzip',
      '--drop'
    ].join(' ');

    try {
      this.log(`Executing: ${importCommand}`);
      execSync(importCommand, { stdio: 'inherit' });
      this.log('Data import completed successfully', 'success');
    } catch (error) {
      this.log('Data import failed', 'error');
      throw error;
    }
  }

  async verifyMigration() {
    this.log('Verifying migration...');
    
    for (const collection of CONFIG.collections) {
      try {
        const countCommand = `mongosh "${CONFIG.atlasConnectionString}" --eval "db.${collection}.countDocuments()" --quiet`;
        const result = execSync(countCommand, { encoding: 'utf8' });
        const count = parseInt(result.trim());
        this.log(`Collection ${collection}: ${count} documents`, 'info');
      } catch (error) {
        this.log(`Could not verify collection ${collection}`, 'warning');
      }
    }
  }

  async updateConfiguration() {
    this.log('Configuration Update Instructions');
    this.log('Please update the following configuration files:');
    
    const configUpdates = [
      {
        file: '.env',
        updates: [
          'MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database',
          'MONGODB_DATABASE=requirements-gathering-agent'
        ]
      },
      {
        file: 'src/config/database.js',
        updates: [
          'Update connection string to use Atlas URI',
          'Update connection options for Atlas compatibility'
        ]
      },
      {
        file: 'docker-compose.yml',
        updates: [
          'Remove or comment out MongoDB service',
          'Update environment variables to use Atlas'
        ]
      }
    ];

    configUpdates.forEach(config => {
      this.log(`\n📁 ${config.file}:`);
      config.updates.forEach(update => {
        this.log(`  - ${update}`);
      });
    });
  }

  async generateConfigFiles() {
    this.log('Generating updated configuration files...');
    
    // Generate .env template
    const envTemplate = `# MongoDB Atlas Configuration
MONGODB_URI=${CONFIG.atlasConnectionString}
MONGODB_DATABASE=requirements-gathering-agent

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

    fs.writeFileSync('.env.atlas', envTemplate);
    this.log('Generated .env.atlas template', 'success');

    // Generate database config
    const dbConfigTemplate = `const mongoose = require('mongoose');

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

    fs.writeFileSync('src/config/database.atlas.js', dbConfigTemplate);
    this.log('Generated database.atlas.js template', 'success');
  }

  async cleanup() {
    const shouldCleanup = await this.confirm('Do you want to remove the backup files?');
    
    if (shouldCleanup) {
      try {
        fs.rmSync(CONFIG.backupDir, { recursive: true, force: true });
        this.log('Backup files cleaned up', 'success');
      } catch (error) {
        this.log('Failed to cleanup backup files', 'warning');
      }
    }
  }

  async run() {
    try {
      this.log('Starting MongoDB Docker to Atlas Migration', 'info');
      
      // Step 1: Check prerequisites
      await this.checkPrerequisites();
      
      // Step 2: Get Atlas connection string
      await this.getAtlasConnectionString();
      
      // Step 3: Test Atlas connection
      const atlasConnected = await this.testAtlasConnection();
      if (!atlasConnected) {
        const retry = await this.confirm('Would you like to retry with a different connection string?');
        if (retry) {
          await this.getAtlasConnectionString();
          await this.testAtlasConnection();
        } else {
          process.exit(1);
        }
      }
      
      // Step 4: Confirm migration
      const proceed = await this.confirm('Proceed with migration? This will replace all data in Atlas.');
      if (!proceed) {
        this.log('Migration cancelled by user', 'warning');
        process.exit(0);
      }
      
      // Step 5: Create backup directory
      await this.createBackupDirectory();
      
      // Step 6: Export data from Docker
      await this.exportData();
      
      // Step 7: Import data to Atlas
      await this.importData();
      
      // Step 8: Verify migration
      await this.verifyMigration();
      
      // Step 9: Generate configuration files
      await this.generateConfigFiles();
      
      // Step 10: Show configuration update instructions
      await this.updateConfiguration();
      
      // Step 11: Cleanup
      await this.cleanup();
      
      this.log('Migration completed successfully!', 'success');
      this.log('Please update your application configuration and restart your services.', 'info');
      
    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new AtlasMigration();
  migration.run();
}

export default AtlasMigration;
