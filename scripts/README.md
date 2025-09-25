# MongoDB Docker to Atlas Migration Scripts

This directory contains scripts to help you migrate your MongoDB database from a local Docker container to MongoDB Atlas.

## 📋 Prerequisites

Before running these scripts, ensure you have:

1. **MongoDB Database Tools** installed:
   - `mongodump` - for exporting data
   - `mongorestore` - for importing data
   - `mongosh` - for database operations
   - `mongoexport` - for JSON exports

2. **MongoDB Atlas Account**:
   - Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
   - Create a cluster (free tier M0 is sufficient for development)
   - Set up database user and network access

3. **Docker MongoDB Container**:
   - Your local MongoDB container should be running
   - Data should be accessible and not corrupted

## 🚀 Migration Process

### Step 1: Set Up MongoDB Atlas

Run the Atlas setup script to configure your Atlas cluster:

```bash
# Make the script executable
chmod +x scripts/atlas-setup.sh

# Run the setup script
bash scripts/atlas-setup.sh
```

This script will:
- Guide you through Atlas cluster creation
- Help configure database users and network access
- Generate connection strings and configuration files
- Create necessary database indexes

### Step 2: Backup Docker MongoDB Data

Create a backup of your current Docker MongoDB data:

```bash
# Make the script executable
chmod +x scripts/backup-docker-mongodb.sh

# Run the backup script
bash scripts/backup-docker-mongodb.sh
```

This script will:
- Verify Docker MongoDB container is running
- Create full database backup (BSON format)
- Export individual collections
- Generate JSON exports for verification
- Create backup summary and verification

### Step 3: Update Application Configuration

Update your application configuration to use Atlas:

```bash
# Run the configuration update script
node scripts/update-app-config.js
```

This script will:
- Update environment files (.env, .env.local, etc.)
- Modify database configuration files
- Update Docker Compose files
- Generate Atlas-specific configurations
- Create backup files before making changes

### Step 4: Migrate Data to Atlas

Run the main migration script:

```bash
# Run the migration script
node scripts/migrate-to-atlas.js
```

This script will:
- Export data from Docker MongoDB
- Import data to MongoDB Atlas
- Verify migration success
- Generate updated configuration files
- Provide cleanup options

## 📁 Script Files

### `atlas-setup.sh`
Interactive script to set up MongoDB Atlas cluster and configuration.

**Features:**
- Prerequisites checking
- Atlas cluster setup guidance
- Database user creation
- Network access configuration
- Connection string generation
- Index creation
- Configuration file generation

### `backup-docker-mongodb.sh`
Creates comprehensive backups of your Docker MongoDB data.

**Features:**
- Docker container verification
- Full database backup (BSON + gzip)
- Individual collection backups
- JSON exports for verification
- Backup integrity verification
- Old backup cleanup
- Detailed backup summary

### `migrate-to-atlas.js`
Main migration script that handles the complete migration process.

**Features:**
- Prerequisites validation
- Atlas connection testing
- Data export from Docker
- Data import to Atlas
- Migration verification
- Configuration file generation
- Cleanup options

### `update-app-config.js`
Updates application configuration files to use Atlas.

**Features:**
- Environment file updates
- Database configuration updates
- Docker Compose modifications
- Backup file creation
- Atlas-specific config generation

## 🔧 Configuration Files Generated

The scripts will generate several configuration files:

### `.env.atlas`
Atlas-specific environment configuration:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DATABASE=requirements-gathering-agent
NODE_ENV=production
PORT=3002
# ... other configurations
```

### `src/config/database.atlas.js`
Atlas-optimized database connection configuration:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // ... Atlas-specific options
    });
    // ... connection handling
  } catch (error) {
    // ... error handling
  }
};
```

### `docker-compose.atlas.yml`
Updated Docker Compose configuration without MongoDB service:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DATABASE=${MONGODB_DATABASE}
    # MongoDB service removed - using Atlas instead
```

## 🗂️ Collections Migrated

The migration process handles these collections:

- `templates` - Document templates
- `projects` - Project information
- `projectdocuments` - Generated documents
- `users` - User accounts
- `audittrails` - Audit logs
- `feedback` - User feedback
- `contexttracking` - Context tracking data
- `generationjobs` - Document generation jobs
- `qualityassessments` - Quality assessments
- `compliancereports` - Compliance reports

## 🔍 Verification Steps

After migration, verify the following:

1. **Connection Test**: Ensure your application can connect to Atlas
2. **Data Integrity**: Check that all collections have the expected document counts
3. **Indexes**: Verify that indexes were created successfully
4. **Application Functionality**: Test key application features
5. **Performance**: Monitor query performance and connection stability

## 🚨 Troubleshooting

### Common Issues

**Connection String Format**
```
Error: Invalid connection string format
```
- Ensure your connection string follows the format: `mongodb+srv://username:password@cluster.mongodb.net/database`

**Network Access**
```
Error: Atlas connection failed
```
- Check that your IP address is whitelisted in Atlas Network Access
- Verify firewall settings
- Ensure MongoDB port (27017) is not blocked

**Authentication**
```
Error: Authentication failed
```
- Verify username and password are correct
- Check that the database user has proper permissions
- Ensure the user is not locked or expired

**Data Import Issues**
```
Error: Data import failed
```
- Check that the backup files are not corrupted
- Verify Atlas cluster has sufficient storage
- Ensure the target database exists

### Recovery Options

If migration fails:

1. **Restore from Backup**: Use the backup files to restore your Docker MongoDB
2. **Retry Migration**: Fix the issue and run the migration script again
3. **Partial Migration**: Manually import specific collections if needed
4. **Rollback**: Revert configuration changes and continue using Docker MongoDB

## 📞 Support

If you encounter issues:

1. Check the script logs for detailed error messages
2. Verify all prerequisites are met
3. Test Atlas connection manually
4. Review the generated configuration files
5. Check MongoDB Atlas documentation

## 🔒 Security Considerations

- **Connection Strings**: Keep your Atlas connection string secure
- **Credentials**: Use strong passwords for database users
- **Network Access**: Restrict IP addresses in Atlas Network Access
- **Backup Files**: Secure backup files contain sensitive data
- **Environment Variables**: Never commit connection strings to version control

## 📈 Performance Optimization

After migration:

1. **Monitor Connection Pool**: Adjust `maxPoolSize` based on your application needs
2. **Index Optimization**: Review and optimize indexes for your query patterns
3. **Query Performance**: Use Atlas Performance Advisor
4. **Scaling**: Consider upgrading your Atlas cluster as your application grows

## 🎯 Next Steps

After successful migration:

1. Update your deployment configuration
2. Test all application functionality
3. Monitor Atlas metrics and performance
4. Set up Atlas monitoring and alerts
5. Consider implementing Atlas backup strategies
6. Update your team documentation

---

**Note**: These scripts are designed for the requirements-gathering-agent project. Modify them as needed for your specific use case.
