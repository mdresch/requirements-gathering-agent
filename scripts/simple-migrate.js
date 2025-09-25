#!/usr/bin/env node

/**
 * Simple MongoDB Migration Script
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Your Atlas connection string
const ATLAS_URI = 'mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/';
const DOCKER_HOST = 'localhost:27017';
const DATABASE_NAME = 'requirements-gathering-agent';
const BACKUP_DIR = './mongodb-backup';

console.log('🚀 Starting MongoDB Migration to Atlas...');
console.log('');

// Step 1: Check prerequisites
console.log('📋 Checking prerequisites...');
try {
  execSync('mongodump --version', { stdio: 'pipe' });
  console.log('✅ mongodump is available');
} catch (error) {
  console.log('❌ mongodump not found. Please install MongoDB Database Tools');
  process.exit(1);
}

try {
  execSync('mongorestore --version', { stdio: 'pipe' });
  console.log('✅ mongorestore is available');
} catch (error) {
  console.log('❌ mongorestore not found. Please install MongoDB Database Tools');
  process.exit(1);
}

// Step 2: Test Docker MongoDB connection
console.log('🔍 Testing Docker MongoDB connection...');
try {
  execSync(`mongosh --host ${DOCKER_HOST} --eval "db.adminCommand('ping')"`, { stdio: 'pipe' });
  console.log('✅ Docker MongoDB is accessible');
} catch (error) {
  console.log('❌ Cannot connect to Docker MongoDB. Please ensure it\'s running');
  process.exit(1);
}

// Step 3: Test Atlas connection
console.log('🌐 Testing Atlas connection...');
try {
  execSync(`mongosh "${ATLAS_URI}" --eval "db.adminCommand('ping')"`, { stdio: 'pipe' });
  console.log('✅ Atlas connection successful');
} catch (error) {
  console.log('❌ Atlas connection failed. Please check your connection string and network access');
  process.exit(1);
}

// Step 4: Create backup directory
console.log('📁 Creating backup directory...');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Backup directory created');
} else {
  console.log('✅ Backup directory already exists');
}

// Step 5: Export data from Docker MongoDB
console.log('📤 Exporting data from Docker MongoDB...');
try {
  const exportCommand = `mongodump --host=${DOCKER_HOST} --db=${DATABASE_NAME} --out=${BACKUP_DIR} --gzip`;
  console.log(`Executing: ${exportCommand}`);
  execSync(exportCommand, { stdio: 'inherit' });
  console.log('✅ Data export completed successfully');
} catch (error) {
  console.log('❌ Data export failed');
  process.exit(1);
}

// Step 6: Import data to Atlas
console.log('📥 Importing data to MongoDB Atlas...');
try {
  const importCommand = `mongorestore --uri="${ATLAS_URI}" --dir=${BACKUP_DIR}/${DATABASE_NAME} --gzip --drop`;
  console.log(`Executing: ${importCommand}`);
  execSync(importCommand, { stdio: 'inherit' });
  console.log('✅ Data import completed successfully');
} catch (error) {
  console.log('❌ Data import failed');
  process.exit(1);
}

// Step 7: Verify migration
console.log('🔍 Verifying migration...');
const collections = [
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

for (const collection of collections) {
  try {
    const countCommand = `mongosh "${ATLAS_URI}" --eval "db.${collection}.countDocuments()" --quiet`;
    const result = execSync(countCommand, { encoding: 'utf8' });
    const count = parseInt(result.trim());
    console.log(`📊 Collection ${collection}: ${count} documents`);
  } catch (error) {
    console.log(`⚠️ Could not verify collection ${collection}`);
  }
}

// Step 8: Generate configuration files
console.log('⚙️ Generating configuration files...');

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
console.log('✅ Generated .env.atlas');

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
console.log('✅ Generated src/config/database.atlas.js');

// Step 9: Generate docker-compose update
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
console.log('✅ Generated docker-compose.atlas.yml');

console.log('');
console.log('🎉 Migration completed successfully!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Update your .env file to use the Atlas connection string');
console.log('2. Update your database configuration to use src/config/database.atlas.js');
console.log('3. Update your docker-compose.yml to remove the MongoDB service');
console.log('4. Restart your application services');
console.log('');
console.log('🔒 Important: Keep your Atlas connection string secure!');
console.log('');
console.log('📁 Generated files:');
console.log('- .env.atlas (Atlas environment configuration)');
console.log('- src/config/database.atlas.js (Atlas database connection)');
console.log('- docker-compose.atlas.yml (Updated Docker Compose)');
console.log('- mongodb-backup/ (Backup files - can be deleted after verification)');
