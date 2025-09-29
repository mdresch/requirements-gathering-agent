# MongoDB Atlas Migration Guide

This guide will help you migrate from the local Docker MongoDB to MongoDB Atlas (cloud database).

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Atlas Cluster**: Create a free M0 cluster or higher
3. **Database User**: Create a database user with read/write permissions
4. **Network Access**: Configure IP whitelist (0.0.0.0/0 for development, specific IPs for production)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Create" → "Cluster"
3. Choose "FREE" tier (M0) for development
4. Select your preferred cloud provider and region
5. Click "Create Cluster"

### 1.2 Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses
5. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" driver
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 2: Update Environment Configuration

### 2.1 Create .env File
Create a `.env` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env
```

### 2.2 Update .env with Atlas Connection
Edit the `.env` file and update the MongoDB URI:

```env
# Replace with your actual Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/requirements-gathering-agent?retryWrites=true&w=majority
```

**Important**: Replace:
- `your-username` with your Atlas database username
- `your-password` with your Atlas database password
- `cluster0.xxxxx` with your actual cluster URL
- Add the database name `requirements-gathering-agent` before the query parameters

## Step 3: Migrate Data (Optional)

If you have existing data in your local MongoDB that you want to migrate:

### 3.1 Export Data from Local MongoDB
```bash
# Make sure local MongoDB is running
docker ps | grep mongo

# Export data to JSON files
node scripts/migrate-to-atlas.js export
```

### 3.2 Import Data to Atlas
```bash
# Set Atlas connection string and import
ATLAS_MONGODB_URI="your-atlas-connection-string" node scripts/migrate-to-atlas.js import
```

### 3.3 Verify Migration
```bash
# Verify data was migrated correctly
ATLAS_MONGODB_URI="your-atlas-connection-string" node scripts/migrate-to-atlas.js verify
```

## Step 4: Update Application Configuration

### 4.1 Build and Test
```bash
# Build the application
npm run build

# Test the connection
npm start
```

### 4.2 Verify Atlas Connection
Look for these log messages:
```
📊 Connected to MongoDB Atlas (Cloud): mongodb+srv://***:***@cluster0.xxxxx.mongodb.net/...
```

## Step 5: Stop Local MongoDB (Optional)

Once you've verified everything works with Atlas:

```bash
# Stop and remove Docker MongoDB container
docker stop mongodb-adpa
docker rm mongodb-adpa

# Remove Docker image (optional)
docker rmi mongo:latest
```

## Troubleshooting

### Connection Issues

**Error**: `MongoServerError: bad auth : Authentication failed.`
- **Solution**: Check username/password in connection string

**Error**: `MongoServerError: IP not in whitelist`
- **Solution**: Add your IP address to Atlas Network Access

**Error**: `MongoServerSelectionError: connection timeout`
- **Solution**: Check network connectivity and firewall settings

### Performance Issues

**Slow queries**: Atlas free tier (M0) has limited resources
- **Solution**: Consider upgrading to M2/M5 for better performance

**Connection timeouts**: Default timeout is 45 seconds
- **Solution**: Increase timeout in connection options if needed

### Data Migration Issues

**Missing collections**: Some collections might not exist locally
- **Solution**: This is normal for new installations

**Import errors**: Duplicate key errors
- **Solution**: The script clears existing data before importing

## Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for database users
2. **Restrict Network Access**: Use specific IP addresses instead of 0.0.0.0/0 for production
3. **Regular Backups**: Enable Atlas backups for production data
4. **Monitor Access**: Use Atlas monitoring to track database access
5. **Rotate Credentials**: Regularly update database passwords

## Cost Considerations

### Atlas Free Tier (M0)
- **Storage**: 512 MB
- **RAM**: Shared
- **Connections**: 100 concurrent connections
- **Perfect for**: Development and testing

### Atlas Paid Tiers (M2+)
- **Storage**: 2 GB+ (scalable)
- **RAM**: Dedicated
- **Connections**: 500+ concurrent connections
- **Perfect for**: Production applications

## Environment Variables Reference

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?options

# Alternative environment variables for migration script
LOCAL_MONGODB_URI=mongodb://localhost:27017/requirements-gathering-agent
ATLAS_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

## Support

If you encounter issues:

1. Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
2. Review the application logs for specific error messages
3. Verify your connection string format
4. Ensure your Atlas cluster is running and accessible

## Next Steps

After successful migration:

1. **Monitor Performance**: Use Atlas monitoring dashboard
2. **Set Up Alerts**: Configure alerts for database issues
3. **Plan Backups**: Enable automated backups for production
4. **Scale as Needed**: Upgrade cluster size based on usage
