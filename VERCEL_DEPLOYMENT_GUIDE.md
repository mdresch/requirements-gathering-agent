# 🚀 Vercel Deployment Guide for Backend API

## Overview
The backend API can be deployed to Vercel as a serverless function. This guide covers both frontend and backend deployment.

## 📋 Prerequisites
- GitHub repository with your code
- Vercel account
- MongoDB Atlas account (for database)
- AI provider API key (Google AI, Azure OpenAI, etc.)

## 🔧 Backend API Deployment

### 1. Prepare Backend for Vercel

The backend is already configured with:
- ✅ `vercel.json` configuration file
- ✅ Express.js server (`src/server.ts`)
- ✅ TypeScript build process
- ✅ Environment variable support

### 2. Required Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# AI Provider (choose one)
PRIMARY_AI_PROVIDER=google-ai
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_MODEL=gemini-1.5-flash

# Alternative: Azure OpenAI
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_API_KEY=your-api-key
# AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# API Configuration
API_PORT=3002
NODE_ENV=production

# Security
JWT_SECRET=your-jwt-secret-key
API_KEY=your-api-key

# CORS (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 3. Deploy Backend

1. **Connect Repository**: Go to Vercel Dashboard > Import Project
2. **Select Repository**: Choose your GitHub repository
3. **Configure Project**:
   - Framework Preset: `Other`
   - Root Directory: `/` (root)
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Set Environment Variables**: Add all required variables
5. **Deploy**: Click Deploy

### 4. Update Frontend Configuration

After backend deployment, update your frontend's environment variables:

```bash
# In admin-interface/.env or Vercel environment variables
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api/v1
NEXT_PUBLIC_API_KEY=your-api-key
```

## 🎯 Frontend Deployment

### 1. Deploy Admin Interface

1. **Create New Project**: In Vercel Dashboard
2. **Import Repository**: Select your GitHub repo
3. **Configure**:
   - Framework Preset: `Next.js`
   - Root Directory: `admin-interface`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Set Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api/v1
   NEXT_PUBLIC_API_KEY=your-api-key
   NODE_ENV=production
   ```

## 🔗 Connecting Frontend to Backend

### Option 1: Same Repository (Recommended)
- Deploy backend from root directory
- Deploy frontend from `admin-interface/` subdirectory
- Both will be separate Vercel projects

### Option 2: Separate Repositories
- Create separate GitHub repos for frontend and backend
- Deploy each independently
- Update API URLs accordingly

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. **Create Cluster**: Go to MongoDB Atlas
2. **Get Connection String**: Copy connection URI
3. **Set Environment Variable**: `MONGODB_URI=mongodb+srv://...`
4. **Whitelist IPs**: Add `0.0.0.0/0` for Vercel (or specific Vercel IPs)

## 🔐 Security Considerations

1. **API Keys**: Never commit API keys to repository
2. **CORS**: Configure CORS origins properly
3. **Rate Limiting**: Already configured in the backend
4. **Environment Variables**: Use Vercel's secure environment variables

## 📊 Monitoring & Debugging

1. **Vercel Functions**: Monitor function execution in Vercel Dashboard
2. **Logs**: Check Vercel function logs for debugging
3. **Health Check**: Use `/api/v1/health` endpoint
4. **API Docs**: Available at `/api-docs` (if OpenAPI spec exists)

## 🚀 Deployment Commands

```bash
# Build backend
npm run build

# Test locally
npm start

# Deploy to Vercel (after connecting repo)
vercel --prod
```

## 📝 Post-Deployment Checklist

- [ ] Backend API deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] AI provider configured
- [ ] CORS configured for frontend domain
- [ ] Health check endpoint responding
- [ ] Frontend can connect to backend API

## 🔧 Troubleshooting

### Common Issues:
1. **Build Failures**: Check TypeScript compilation
2. **Database Connection**: Verify MongoDB URI and network access
3. **CORS Errors**: Update CORS_ORIGIN environment variable
4. **API Key Issues**: Verify AI provider configuration
5. **Function Timeouts**: Increase timeout in vercel.json

### Debug Commands:
```bash
# Check build locally
npm run build

# Test API endpoints
curl https://your-backend-api.vercel.app/api/v1/health

# Check environment variables
vercel env ls
```

## 📞 Support

For deployment issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints manually
4. Check MongoDB Atlas connection
5. Verify AI provider API keys
