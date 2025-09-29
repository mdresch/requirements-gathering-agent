# 🔐 Vercel Environment Variables Setup

## MongoDB Atlas Configuration

Your MongoDB Atlas connection is ready! Here's how to configure it in Vercel:

### Required Environment Variables for Vercel Dashboard

Go to **Vercel Dashboard > Your Project > Settings > Environment Variables** and add these:

```bash
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/requirements-gathering-agent?retryWrites=true&w=majority
MONGODB_DATABASE=requirements-gathering-agent

# Application Configuration
NODE_ENV=production
PORT=3002
API_PORT=3002

# API Security (CHANGE THESE!)
API_KEY=your-secure-api-key-here-change-this
JWT_SECRET=your-jwt-secret-here-change-this
JWT_EXPIRES_IN=7d

# AI Provider Configuration (Choose one)
PRIMARY_AI_PROVIDER=google-ai
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_ENABLED=true

# CORS Configuration (update with your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🔒 Security Notes

### ⚠️ IMPORTANT: Change These Values!

1. **API_KEY**: Generate a secure random string
2. **JWT_SECRET**: Generate a secure random string
3. **GOOGLE_AI_API_KEY**: Get from Google AI Studio

### 🔐 Generate Secure Keys

```bash
# Generate secure API key (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate secure JWT secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ MongoDB Atlas Setup

### 1. Network Access
- Go to MongoDB Atlas Dashboard
- Navigate to **Network Access**
- Add IP Address: `0.0.0.0/0` (for Vercel) or specific Vercel IPs

### 2. Database User
- Your user `mennodrescher_db_user` is already configured
- Password: `QueIQ4CBA` (keep this secure!)

### 3. Connection String
- ✅ Already configured: `mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/`
- Database: `requirements-gathering-agent`

## 🚀 Deployment Steps

### 1. Backend Deployment
1. **Import Project**: Go to Vercel Dashboard
2. **Select Repository**: `mdresch/requirements-gathering-agent`
3. **Configure**:
   - Framework: `Other`
   - Root Directory: `/`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
4. **Set Environment Variables**: Copy all variables above
5. **Deploy**: Click Deploy

### 2. Frontend Deployment
1. **Create New Project**: In Vercel Dashboard
2. **Import Repository**: Same repository
3. **Configure**:
   - Framework: `Next.js`
   - Root Directory: `admin-interface`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Set Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api/v1
   NEXT_PUBLIC_API_KEY=your-secure-api-key-here-change-this
   NODE_ENV=production
   ```

## 🔗 Connecting Frontend to Backend

After both deployments:

1. **Get Backend URL**: From Vercel Dashboard (e.g., `https://requirements-gathering-agent-abc123.vercel.app`)
2. **Update Frontend Environment**:
   ```bash
   NEXT_PUBLIC_API_URL=https://requirements-gathering-agent-abc123.vercel.app/api/v1
   ```
3. **Update Backend CORS**:
   ```bash
   CORS_ORIGIN=https://admin-interface-xyz789.vercel.app
   ```

## 🧪 Testing Deployment

### Health Check
```bash
curl https://your-backend-api.vercel.app/api/v1/health
```

### Database Connection Test
```bash
curl https://your-backend-api.vercel.app/api/v1/templates
```

## 📊 Monitoring

1. **Vercel Functions**: Monitor execution in Vercel Dashboard
2. **MongoDB Atlas**: Monitor connections and performance
3. **Logs**: Check Vercel function logs for debugging

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection Failed**: Check MongoDB Atlas network access
2. **CORS Errors**: Update CORS_ORIGIN environment variable
3. **API Key Issues**: Verify API_KEY matches between frontend and backend
4. **Build Failures**: Check TypeScript compilation errors

### Debug Commands:
```bash
# Test MongoDB connection
curl https://your-backend-api.vercel.app/api/v1/health

# Check environment variables
vercel env ls

# View function logs
vercel logs
```

## ✅ Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] MongoDB Atlas connection working
- [ ] Environment variables configured
- [ ] API_KEY and JWT_SECRET changed from defaults
- [ ] CORS configured for frontend domain
- [ ] Health check endpoint responding
- [ ] Frontend can connect to backend API
- [ ] Database operations working
- [ ] AI provider configured and working
