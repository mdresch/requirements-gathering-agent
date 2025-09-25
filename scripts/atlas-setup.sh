#!/bin/bash

# MongoDB Atlas Setup Script
# This script helps set up MongoDB Atlas for the requirements-gathering-agent project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="requirements-gathering-agent"
CLUSTER_NAME="requirements-cluster"
DATABASE_NAME="requirements-gathering-agent"

echo -e "${BLUE}🚀 MongoDB Atlas Setup Script${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if MongoDB tools are installed
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v mongosh &> /dev/null; then
        print_error "mongosh is not installed. Please install MongoDB Shell."
        echo "Installation guide: https://docs.mongodb.com/mongodb-shell/install/"
        exit 1
    fi
    
    if ! command -v mongodump &> /dev/null; then
        print_error "mongodump is not installed. Please install MongoDB Database Tools."
        echo "Installation guide: https://docs.mongodb.com/database-tools/installation/"
        exit 1
    fi
    
    if ! command -v mongorestore &> /dev/null; then
        print_error "mongorestore is not installed. Please install MongoDB Database Tools."
        echo "Installation guide: https://docs.mongodb.com/database-tools/installation/"
        exit 1
    fi
    
    print_status "All prerequisites are installed"
}

# Create Atlas cluster (manual instructions)
create_atlas_cluster() {
    print_info "Atlas Cluster Setup Instructions"
    echo ""
    echo "Please follow these steps to create your MongoDB Atlas cluster:"
    echo ""
    echo "1. Go to https://cloud.mongodb.com/"
    echo "2. Sign up or log in to your account"
    echo "3. Create a new project: '$PROJECT_NAME'"
    echo "4. Create a new cluster: '$CLUSTER_NAME'"
    echo "5. Choose the free tier (M0) for development"
    echo "6. Select a region close to your users"
    echo "7. Wait for the cluster to be created (5-10 minutes)"
    echo ""
    echo "After creating the cluster, you'll need to:"
    echo "- Create a database user"
    echo "- Configure network access"
    echo "- Get the connection string"
    echo ""
    
    read -p "Press Enter when you have completed the Atlas cluster setup..."
}

# Create database user
create_database_user() {
    print_info "Database User Setup Instructions"
    echo ""
    echo "Please create a database user in Atlas:"
    echo ""
    echo "1. Go to your Atlas project"
    echo "2. Click 'Database Access' in the left sidebar"
    echo "3. Click 'Add New Database User'"
    echo "4. Choose 'Password' authentication"
    echo "5. Create a username (e.g., 'app-user')"
    echo "6. Generate a secure password (save it securely!)"
    echo "7. Set privileges to 'Read and write to any database'"
    echo "8. Click 'Add User'"
    echo ""
    
    read -p "Press Enter when you have created the database user..."
}

# Configure network access
configure_network_access() {
    print_info "Network Access Configuration Instructions"
    echo ""
    echo "Please configure network access in Atlas:"
    echo ""
    echo "1. Go to your Atlas project"
    echo "2. Click 'Network Access' in the left sidebar"
    echo "3. Click 'Add IP Address'"
    echo "4. For development, you can:"
    echo "   - Add your current IP address"
    echo "   - Or add '0.0.0.0/0' for access from anywhere (less secure)"
    echo "5. Click 'Confirm'"
    echo ""
    
    read -p "Press Enter when you have configured network access..."
}

# Get connection string
get_connection_string() {
    print_info "Getting Connection String"
    echo ""
    echo "Please get your connection string from Atlas:"
    echo ""
    echo "1. Go to your Atlas project"
    echo "2. Click 'Clusters' in the left sidebar"
    echo "3. Click 'Connect' on your cluster"
    echo "4. Choose 'Connect your application'"
    echo "5. Select 'Node.js' as the driver"
    echo "6. Copy the connection string"
    echo "7. Replace <password> with your database user password"
    echo "8. Replace <dbname> with '$DATABASE_NAME'"
    echo ""
    
    read -p "Enter your Atlas connection string: " CONNECTION_STRING
    
    if [[ $CONNECTION_STRING == *"mongodb+srv://"* ]]; then
        print_status "Connection string format looks correct"
        echo "$CONNECTION_STRING" > atlas-connection.txt
        print_status "Connection string saved to atlas-connection.txt"
    else
        print_error "Invalid connection string format. Please try again."
        get_connection_string
    fi
}

# Test connection
test_connection() {
    print_info "Testing Atlas connection..."
    
    CONNECTION_STRING=$(cat atlas-connection.txt)
    
    if mongosh "$CONNECTION_STRING" --eval "db.adminCommand('ping')" --quiet; then
        print_status "Atlas connection successful!"
    else
        print_error "Atlas connection failed. Please check your connection string and network access."
        exit 1
    fi
}

# Create indexes
create_indexes() {
    print_info "Creating database indexes..."
    
    CONNECTION_STRING=$(cat atlas-connection.txt)
    
    # Create indexes for better performance
    mongosh "$CONNECTION_STRING" --eval "
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
    " --quiet
    
    print_status "Database indexes created successfully"
}

# Generate environment file
generate_env_file() {
    print_info "Generating environment configuration..."
    
    CONNECTION_STRING=$(cat atlas-connection.txt)
    
    cat > .env.atlas << EOF
# MongoDB Atlas Configuration
MONGODB_URI=$CONNECTION_STRING
MONGODB_DATABASE=$DATABASE_NAME

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
EOF

    print_status "Environment file generated: .env.atlas"
}

# Generate database configuration
generate_db_config() {
    print_info "Generating database configuration..."
    
    cat > src/config/database.atlas.js << 'EOF'
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
EOF

    print_status "Database configuration generated: src/config/database.atlas.js"
}

# Generate docker-compose update
generate_docker_compose_update() {
    print_info "Generating Docker Compose update..."
    
    cat > docker-compose.atlas.yml << 'EOF'
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
EOF

    print_status "Docker Compose update generated: docker-compose.atlas.yml"
}

# Main execution
main() {
    echo -e "${BLUE}Starting MongoDB Atlas setup...${NC}"
    echo ""
    
    check_prerequisites
    create_atlas_cluster
    create_database_user
    configure_network_access
    get_connection_string
    test_connection
    create_indexes
    generate_env_file
    generate_db_config
    generate_docker_compose_update
    
    echo ""
    print_status "Atlas setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Review the generated configuration files"
    echo "2. Update your application to use the Atlas connection"
    echo "3. Run the migration script: node scripts/migrate-to-atlas.js"
    echo "4. Update your deployment configuration"
    echo ""
    print_warning "Remember to keep your connection string and credentials secure!"
}

# Run main function
main "$@"
