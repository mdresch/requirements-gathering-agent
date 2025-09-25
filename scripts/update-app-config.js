#!/usr/bin/env node

/**
 * Application Configuration Update Script
 * 
 * This script updates your application configuration to use MongoDB Atlas
 * instead of the local Docker MongoDB instance.
 * 
 * Usage:
 * node scripts/update-app-config.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

class ConfigUpdater {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.configFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'src/config/database.js',
      'src/config/mongodb.js',
      'docker-compose.yml',
      'docker-compose.prod.yml'
    ];
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

  async getAtlasConnectionString() {
    this.log('Please provide your MongoDB Atlas connection string.');
    this.log('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    
    const connectionString = await this.prompt('Atlas connection string: ');
    
    if (!connectionString.includes('mongodb+srv://')) {
      this.log('Invalid connection string format', 'error');
      return await this.getAtlasConnectionString();
    }
    
    return connectionString;
  }

  async updateEnvFile(filePath, atlasConnectionString) {
    if (!fs.existsSync(filePath)) {
      this.log(`Environment file not found: ${filePath}`, 'warning');
      return false;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update MongoDB URI
      if (content.includes('MONGODB_URI=')) {
        content = content.replace(
          /MONGODB_URI=.*/,
          `MONGODB_URI=${atlasConnectionString}`
        );
      } else {
        content += `\nMONGODB_URI=${atlasConnectionString}\n`;
      }
      
      // Update MongoDB database name
      if (content.includes('MONGODB_DATABASE=')) {
        content = content.replace(
          /MONGODB_DATABASE=.*/,
          'MONGODB_DATABASE=requirements-gathering-agent'
        );
      } else {
        content += 'MONGODB_DATABASE=requirements-gathering-agent\n';
      }
      
      // Comment out Docker MongoDB settings
      content = content.replace(/^MONGO_HOST=/gm, '# MONGO_HOST=');
      content = content.replace(/^MONGO_PORT=/gm, '# MONGO_PORT=');
      
      fs.writeFileSync(filePath, content);
      this.log(`Updated: ${filePath}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to update ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async updateDatabaseConfig(filePath, atlasConnectionString) {
    if (!fs.existsSync(filePath)) {
      this.log(`Database config file not found: ${filePath}`, 'warning');
      return false;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update connection string
      content = content.replace(
        /mongoose\.connect\([^)]+\)/,
        `mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    })`
      );
      
      // Add Atlas-specific connection options
      if (!content.includes('maxPoolSize')) {
        content = content.replace(
          /mongoose\.connect\([^)]+\)/,
          `mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    })`
        );
      }
      
      fs.writeFileSync(filePath, content);
      this.log(`Updated: ${filePath}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to update ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async updateDockerCompose(filePath) {
    if (!fs.existsSync(filePath)) {
      this.log(`Docker Compose file not found: ${filePath}`, 'warning');
      return false;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Comment out MongoDB service
      content = content.replace(
        /^  mongodb:/gm,
        '  # mongodb:'
      );
      content = content.replace(
        /^    image: mongo/gm,
        '    # image: mongo'
      );
      content = content.replace(
        /^    ports:/gm,
        '    # ports:'
      );
      content = content.replace(
        /^      - "27017:27017"/gm,
        '      # - "27017:27017"'
      );
      content = content.replace(
        /^    volumes:/gm,
        '    # volumes:'
      );
      content = content.replace(
        /^      - mongodb_data:/gm,
        '      # - mongodb_data:'
      );
      content = content.replace(
        /^    environment:/gm,
        '    # environment:'
      );
      content = content.replace(
        /^      - MONGO_INITDB_ROOT_USERNAME=/gm,
        '      # - MONGO_INITDB_ROOT_USERNAME='
      );
      content = content.replace(
        /^      - MONGO_INITDB_ROOT_PASSWORD=/gm,
        '      # - MONGO_INITDB_ROOT_PASSWORD='
      );
      
      // Comment out volumes section
      content = content.replace(
        /^volumes:/gm,
        '# volumes:'
      );
      content = content.replace(
        /^  mongodb_data:/gm,
        '  # mongodb_data:'
      );
      
      // Add environment variables for Atlas
      if (content.includes('services:')) {
        content = content.replace(
          /(services:\s*\n\s*app:)/,
          `$1
    environment:
      - MONGODB_URI=\${MONGODB_URI}
      - MONGODB_DATABASE=\${MONGODB_DATABASE}`
        );
      }
      
      fs.writeFileSync(filePath, content);
      this.log(`Updated: ${filePath}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to update ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async createBackupFiles() {
    this.log('Creating backup files...');
    
    for (const file of this.configFiles) {
      if (fs.existsSync(file)) {
        const backupFile = `${file}.backup.${Date.now()}`;
        try {
          fs.copyFileSync(file, backupFile);
          this.log(`Backup created: ${backupFile}`, 'success');
        } catch (error) {
          this.log(`Failed to create backup for ${file}: ${error.message}`, 'error');
        }
      }
    }
  }

  async updateConfigurationFiles(atlasConnectionString) {
    this.log('Updating configuration files...');
    
    let updatedCount = 0;
    
    for (const file of this.configFiles) {
      if (file.includes('.env')) {
        if (await this.updateEnvFile(file, atlasConnectionString)) {
          updatedCount++;
        }
      } else if (file.includes('database') || file.includes('mongodb')) {
        if (await this.updateDatabaseConfig(file, atlasConnectionString)) {
          updatedCount++;
        }
      } else if (file.includes('docker-compose')) {
        if (await this.updateDockerCompose(file)) {
          updatedCount++;
        }
      }
    }
    
    this.log(`Updated ${updatedCount} configuration files`, 'success');
  }

  async generateAtlasConfig() {
    this.log('Generating Atlas-specific configuration...');
    
    // Generate .env.atlas
    const envAtlasContent = `# MongoDB Atlas Configuration
MONGODB_URI=${await this.getAtlasConnectionString()}
MONGODB_DATABASE=requirements-gathering-agent

# Application Configuration
NODE_ENV=production
PORT=3002

# API Configuration
API_KEY=your-secure-api-key-here
NEXT_PUBLIC_API_KEY=your-secure-api-key-here

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

    fs.writeFileSync('.env.atlas', envAtlasContent);
    this.log('Generated .env.atlas', 'success');

    // Generate database.atlas.js
    const dbAtlasContent = `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    });

    console.log(\`MongoDB Atlas Connected: \${conn.connection.host}\`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
`;

    fs.writeFileSync('src/config/database.atlas.js', dbAtlasContent);
    this.log('Generated src/config/database.atlas.js', 'success');
  }

  async showNextSteps() {
    this.log('Configuration Update Complete!');
    this.log('Next steps:');
    console.log('');
    console.log('1. Review the updated configuration files');
    console.log('2. Test the Atlas connection');
    console.log('3. Run the migration script: node scripts/migrate-to-atlas.js');
    console.log('4. Update your deployment configuration');
    console.log('5. Restart your application services');
    console.log('');
    this.log('Important: Keep your Atlas connection string secure!', 'warning');
  }

  async run() {
    try {
      this.log('Starting application configuration update...');
      
      // Get Atlas connection string
      const atlasConnectionString = await this.getAtlasConnectionString();
      
      // Confirm update
      const proceed = await this.confirm('Proceed with configuration update?');
      if (!proceed) {
        this.log('Configuration update cancelled', 'warning');
        return;
      }
      
      // Create backups
      await this.createBackupFiles();
      
      // Update configuration files
      await this.updateConfigurationFiles(atlasConnectionString);
      
      // Generate Atlas-specific configs
      await this.generateAtlasConfig();
      
      // Show next steps
      await this.showNextSteps();
      
    } catch (error) {
      this.log(`Configuration update failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new ConfigUpdater();
  updater.run();
}

export default ConfigUpdater;
