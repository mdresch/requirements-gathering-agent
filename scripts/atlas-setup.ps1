# MongoDB Atlas Setup Script for Windows PowerShell
# This script helps set up MongoDB Atlas for the requirements-gathering-agent project

param(
    [string]$ProjectName = "requirements-gathering-agent",
    [string]$ClusterName = "requirements-cluster",
    [string]$DatabaseName = "requirements-gathering-agent"
)

# Configuration
$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if MongoDB tools are installed
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    try {
        $null = Get-Command mongosh -ErrorAction Stop
        Write-Status "mongosh is installed"
    } catch {
        Write-Error "mongosh is not installed. Please install MongoDB Shell."
        Write-Host "Installation guide: https://docs.mongodb.com/mongodb-shell/install/"
        exit 1
    }
    
    try {
        $null = Get-Command mongodump -ErrorAction Stop
        Write-Status "mongodump is installed"
    } catch {
        Write-Error "mongodump is not installed. Please install MongoDB Database Tools."
        Write-Host "Installation guide: https://docs.mongodb.com/database-tools/installation/"
        exit 1
    }
    
    try {
        $null = Get-Command mongorestore -ErrorAction Stop
        Write-Status "mongorestore is installed"
    } catch {
        Write-Error "mongorestore is not installed. Please install MongoDB Database Tools."
        Write-Host "Installation guide: https://docs.mongodb.com/database-tools/installation/"
        exit 1
    }
    
    Write-Status "All prerequisites are installed"
}

# Create Atlas cluster (manual instructions)
function Show-AtlasClusterInstructions {
    Write-Info "Atlas Cluster Setup Instructions"
    Write-Host ""
    Write-Host "Please follow these steps to create your MongoDB Atlas cluster:"
    Write-Host ""
    Write-Host "1. Go to https://cloud.mongodb.com/"
    Write-Host "2. Sign up or log in to your account"
    Write-Host "3. Create a new project: '$ProjectName'"
    Write-Host "4. Create a new cluster: '$ClusterName'"
    Write-Host "5. Choose the free tier (M0) for development"
    Write-Host "6. Select a region close to your users"
    Write-Host "7. Wait for the cluster to be created (5-10 minutes)"
    Write-Host ""
    Write-Host "After creating the cluster, you'll need to:"
    Write-Host "- Create a database user"
    Write-Host "- Configure network access"
    Write-Host "- Get the connection string"
    Write-Host ""
    
    Read-Host "Press Enter when you have completed the Atlas cluster setup"
}

# Create database user
function Show-DatabaseUserInstructions {
    Write-Info "Database User Setup Instructions"
    Write-Host ""
    Write-Host "Please create a database user in Atlas:"
    Write-Host ""
    Write-Host "1. Go to your Atlas project"
    Write-Host "2. Click 'Database Access' in the left sidebar"
    Write-Host "3. Click 'Add New Database User'"
    Write-Host "4. Choose 'Password' authentication"
    Write-Host "5. Create a username (e.g., 'app-user')"
    Write-Host "6. Generate a secure password (save it securely!)"
    Write-Host "7. Set privileges to 'Read and write to any database'"
    Write-Host "8. Click 'Add User'"
    Write-Host ""
    
    Read-Host "Press Enter when you have created the database user"
}

# Configure network access
function Show-NetworkAccessInstructions {
    Write-Info "Network Access Configuration Instructions"
    Write-Host ""
    Write-Host "Please configure network access in Atlas:"
    Write-Host ""
    Write-Host "1. Go to your Atlas project"
    Write-Host "2. Click 'Network Access' in the left sidebar"
    Write-Host "3. Click 'Add IP Address'"
    Write-Host "4. For development, you can:"
    Write-Host "   - Add your current IP address"
    Write-Host "   - Or add '0.0.0.0/0' for access from anywhere (less secure)"
    Write-Host "5. Click 'Confirm'"
    Write-Host ""
    
    Read-Host "Press Enter when you have configured network access"
}

# Get connection string
function Get-ConnectionString {
    Write-Info "Getting Connection String"
    Write-Host ""
    Write-Host "Please get your connection string from Atlas:"
    Write-Host ""
    Write-Host "1. Go to your Atlas project"
    Write-Host "2. Click 'Clusters' in the left sidebar"
    Write-Host "3. Click 'Connect' on your cluster"
    Write-Host "4. Choose 'Connect your application'"
    Write-Host "5. Select 'Node.js' as the driver"
    Write-Host "6. Copy the connection string"
    Write-Host "7. Replace <password> with your database user password"
    Write-Host "8. Replace <dbname> with '$DatabaseName'"
    Write-Host ""
    
    $connectionString = Read-Host "Enter your Atlas connection string"
    
    if ($connectionString -like "*mongodb+srv://*") {
        Write-Status "Connection string format looks correct"
        $connectionString | Out-File -FilePath "atlas-connection.txt" -Encoding UTF8
        Write-Status "Connection string saved to atlas-connection.txt"
        return $connectionString
    } else {
        Write-Error "Invalid connection string format. Please try again."
        return Get-ConnectionString
    }
}

# Test connection
function Test-AtlasConnection {
    param([string]$ConnectionString)
    
    Write-Info "Testing Atlas connection..."
    
    try {
        $result = mongosh $ConnectionString --eval "db.adminCommand('ping')" --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Atlas connection successful!"
            return $true
        } else {
            Write-Error "Atlas connection failed. Please check your connection string and network access."
            return $false
        }
    } catch {
        Write-Error "Atlas connection failed: $($_.Exception.Message)"
        return $false
    }
}

# Create indexes
function New-DatabaseIndexes {
    param([string]$ConnectionString)
    
    Write-Info "Creating database indexes..."
    
    $indexScript = @"
        // Templates collection indexes
        db.templates.createIndex({ 'name': 1 });
        db.templates.createIndex({ 'category': 1 });
        db.templates.createIndex({ 'is_active': 1, 'is_deleted': 1 });
        db.templates.createIndex({ 'created_at': -1 });
        
        // Projects collection indexes
        db.projects.createIndex({ 'name': 1 });
        db.projects.createIndex({ 'framework': 1 });
        db.projects.createIndex({ 'created_at': -1 });
        
        // Project documents collection indexes
        db.projectdocuments.createIndex({ 'projectId': 1 });
        db.projectdocuments.createIndex({ 'type': 1 });
        db.projectdocuments.createIndex({ 'status': 1 });
        db.projectdocuments.createIndex({ 'generatedAt': -1 });
        
        // Users collection indexes
        db.users.createIndex({ 'email': 1 }, { unique: true });
        db.users.createIndex({ 'role': 1 });
        
        // Audit trails collection indexes
        db.audittrails.createIndex({ 'entityType': 1, 'entityId': 1 });
        db.audittrails.createIndex({ 'timestamp': -1 });
        db.audittrails.createIndex({ 'userId': 1 });
        
        // Feedback collection indexes
        db.feedback.createIndex({ 'projectId': 1 });
        db.feedback.createIndex({ 'documentId': 1 });
        db.feedback.createIndex({ 'createdAt': -1 });
        
        // Context tracking collection indexes
        db.contexttracking.createIndex({ 'projectId': 1 });
        db.contexttracking.createIndex({ 'documentId': 1 });
        db.contexttracking.createIndex({ 'createdAt': -1 });
        
        // Generation jobs collection indexes
        db.generationjobs.createIndex({ 'projectId': 1 });
        db.generationjobs.createIndex({ 'status': 1 });
        db.generationjobs.createIndex({ 'createdAt': -1 });
        
        // Quality assessments collection indexes
        db.qualityassessments.createIndex({ 'documentId': 1 });
        db.qualityassessments.createIndex({ 'assessedAt': -1 });
        
        // Compliance reports collection indexes
        db.compliancereports.createIndex({ 'documentId': 1 });
        db.compliancereports.createIndex({ 'generatedAt': -1 });
        
        print('Indexes created successfully');
"@

    try {
        $indexScript | mongosh $ConnectionString --quiet
        Write-Status "Database indexes created successfully"
    } catch {
        Write-Warning "Failed to create some indexes: $($_.Exception.Message)"
    }
}

# Generate environment file
function New-EnvironmentFile {
    param([string]$ConnectionString)
    
    Write-Info "Generating environment configuration..."
    
    $envContent = @"
# MongoDB Atlas Configuration
MONGODB_URI=$ConnectionString
MONGODB_DATABASE=$DatabaseName

# Application Configuration
NODE_ENV=production
PORT=3002

# API Configuration
API_KEY=your-secure-api-key-here
NEXT_PUBLIC_API_KEY=your-secure-api-key-here

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

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

    $envContent | Out-File -FilePath ".env.atlas" -Encoding UTF8
    Write-Status "Environment file generated: .env.atlas"
}

# Generate database configuration
function New-DatabaseConfig {
    Write-Info "Generating database configuration..."
    
    $dbConfigContent = @'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    
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
'@

    # Ensure src/config directory exists
    if (!(Test-Path "src/config")) {
        New-Item -ItemType Directory -Path "src/config" -Force | Out-Null
    }
    
    $dbConfigContent | Out-File -FilePath "src/config/database.atlas.js" -Encoding UTF8
    Write-Status "Database configuration generated: src/config/database.atlas.js"
}

# Generate docker-compose update
function New-DockerComposeUpdate {
    Write-Info "Generating Docker Compose update..."
    
    $dockerComposeContent = @'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DATABASE=${MONGODB_DATABASE}
      - API_KEY=${API_KEY}
      - JWT_SECRET=${JWT_SECRET}
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
'@

    $dockerComposeContent | Out-File -FilePath "docker-compose.atlas.yml" -Encoding UTF8
    Write-Status "Docker Compose update generated: docker-compose.atlas.yml"
}

# Main execution
function Start-AtlasSetup {
    Write-Host "🚀 MongoDB Atlas Setup Script" -ForegroundColor Blue
    Write-Host "==============================" -ForegroundColor Blue
    Write-Host ""
    
    Test-Prerequisites
    Show-AtlasClusterInstructions
    Show-DatabaseUserInstructions
    Show-NetworkAccessInstructions
    
    $connectionString = Get-ConnectionString
    
    $connectionTest = Test-AtlasConnection -ConnectionString $connectionString
    if (-not $connectionTest) {
        $retry = Read-Host "Would you like to retry with a different connection string? (y/N)"
        if ($retry -eq "y" -or $retry -eq "Y") {
            $connectionString = Get-ConnectionString
            Test-AtlasConnection -ConnectionString $connectionString
        } else {
            Write-Error "Setup cancelled due to connection failure"
            exit 1
        }
    }
    
    New-DatabaseIndexes -ConnectionString $connectionString
    New-EnvironmentFile -ConnectionString $connectionString
    New-DatabaseConfig
    New-DockerComposeUpdate
    
    Write-Host ""
    Write-Status "Atlas setup completed successfully!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "1. Review the generated configuration files"
    Write-Host "2. Update your application to use the Atlas connection"
    Write-Host "3. Run the migration script: node scripts/migrate-to-atlas.js"
    Write-Host "4. Update your deployment configuration"
    Write-Host ""
    Write-Warning "Remember to keep your connection string and credentials secure!"
}

# Run main function
Start-AtlasSetup
