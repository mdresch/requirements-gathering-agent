# Manual MongoDB Migration Guide

## Current Issues Identified

1. **Docker MongoDB Authentication**: Your Docker MongoDB requires authentication
2. **Atlas SSL/TLS Connection**: Windows Node.js has SSL/TLS compatibility issues with Atlas

## Solution Options

### Option 1: Install MongoDB Database Tools (Recommended)

1. **Download MongoDB Database Tools for Windows**:
   - Go to: https://www.mongodb.com/try/download/database-tools
   - Download the Windows version
   - Extract to a folder (e.g., `C:\mongodb-tools\`)
   - Add the `bin` folder to your PATH environment variable

2. **Run the migration using command line tools**:
   ```bash
   # Export from Docker MongoDB
   mongodump --host=localhost:27017 --db=requirements-gathering-agent --username=your_username --password=your_password --out=./mongodb-backup --gzip
   
   # Import to Atlas
   mongorestore --uri="mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/" --dir=./mongodb-backup/requirements-gathering-agent --gzip --drop
   ```

### Option 2: Use MongoDB Compass (GUI Method)

1. **Download MongoDB Compass**:
   - Go to: https://www.mongodb.com/products/compass
   - Download and install MongoDB Compass

2. **Connect to Docker MongoDB**:
   - Connection string: `mongodb://localhost:27017`
   - Add authentication if required

3. **Export Collections**:
   - Right-click each collection → Export Collection
   - Choose JSON format
   - Save to `./mongodb-backup-json/`

4. **Connect to Atlas**:
   - Connection string: `mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/`

5. **Import Collections**:
   - Right-click database → Import Data
   - Choose the JSON files from step 3

### Option 3: Use Atlas Data Explorer

1. **Go to Atlas Web Interface**:
   - Log into: https://cloud.mongodb.com/
   - Navigate to your cluster

2. **Use Data Explorer**:
   - Click "Browse Collections"
   - Click "Add Data" → "Import File"
   - Upload JSON files from your backup

### Option 4: Fix Docker Authentication and Retry

If you want to continue with the automated script, you need to provide Docker MongoDB credentials:

1. **Find your Docker MongoDB credentials**:
   - Check your `docker-compose.yml` file
   - Look for `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`

2. **Update the migration script with credentials**:
   ```javascript
   const DOCKER_URI = 'mongodb://username:password@localhost:27017';
   ```

## Generated Configuration Files

The script has already generated these files for you:

- `.env.atlas` - Atlas environment configuration
- `src/config/database.atlas.js` - Atlas database connection
- `docker-compose.atlas.yml` - Updated Docker Compose without MongoDB service

## Next Steps After Migration

1. **Update your application configuration**:
   ```bash
   # Copy Atlas configuration to your main .env file
   cp .env.atlas .env
   ```

2. **Update your database connection**:
   ```javascript
   // In your main database config file
   const connectDB = require('./src/config/database.atlas.js');
   ```

3. **Update Docker Compose**:
   ```bash
   # Replace your docker-compose.yml with the Atlas version
   cp docker-compose.atlas.yml docker-compose.yml
   ```

4. **Restart your application**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Verification Steps

After migration, verify:

1. **Check document counts** in Atlas match Docker MongoDB
2. **Test application connectivity** to Atlas
3. **Verify all collections** are accessible
4. **Test key application features**

## Troubleshooting

### SSL/TLS Issues
- Try using MongoDB Compass instead of Node.js driver
- Update Node.js to latest version
- Check Windows SSL/TLS configuration

### Authentication Issues
- Verify Docker MongoDB credentials
- Check network access in Atlas
- Ensure IP address is whitelisted in Atlas

### Connection Timeouts
- Increase timeout values in connection options
- Check firewall settings
- Verify Atlas cluster is running

## Support

If you continue to have issues:
1. Use MongoDB Compass for GUI-based migration
2. Install MongoDB Database Tools for command-line migration
3. Contact MongoDB Atlas support for connection issues
