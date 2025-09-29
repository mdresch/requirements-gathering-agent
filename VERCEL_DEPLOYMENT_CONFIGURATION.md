# Vercel Deployment Configuration Guide

## ✅ Successful Build Specifications

This document outlines the exact configuration that resulted in a successful Vercel deployment for the requirements-gathering-agent project.

## 📁 Project Structure

```
requirements-gathering-agent/
├── vercel.json                    # Root Vercel configuration
├── admin-interface/               # Next.js application
│   ├── vercel.json               # Admin-interface specific config
│   ├── package.json              # Dependencies and scripts
│   ├── next.config.js            # Next.js configuration
│   └── src/                      # Application source code
└── .vercelignore                 # Files to ignore during deployment
```

## 🔧 Root Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "admin-interface/package.json",
      "use": "@vercel/next",
      "config": {
        "installCommand": "npm install --legacy-peer-deps",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/admin-interface/$1"
    }
  ]
}
```

### Key Configuration Points:
- **`@vercel/next`**: Uses Next.js-specific builder
- **`src: "admin-interface/package.json"`**: Points to the Next.js project root
- **`--legacy-peer-deps`**: Essential for resolving peer dependency conflicts
- **Routes**: Redirects all traffic to admin-interface subdirectory

## 🎯 Admin-Interface Vercel Configuration (`admin-interface/vercel.json`)

```json
{
  "version": 2,
  "buildCommand": "npx next build",
  "outputDirectory": ".next",
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Key Points:
- **`npx next build`**: Ensures Next.js CLI is available
- **`outputDirectory: ".next"`**: Standard Next.js build output
- **`--legacy-peer-deps`**: Consistent dependency resolution

## 📦 Critical Dependencies (`admin-interface/package.json`)

### Essential Dependencies:
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-is": "^18.2.0",           // CRITICAL: Required for recharts
    "next": "^15.5.2",
    "recharts": "^3.2.1",
    "lucide-react": "^0.300.0",
    "framer-motion": "^12.23.6",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

### Build Scripts:
```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev -p 3003",
    "start": "next start -p 3003"
  }
}
```

## ⚙️ Next.js Configuration (`admin-interface/next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3002/api/v1/:path*',
      },
    ];
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1',
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123',
  },
}

module.exports = nextConfig;
```

## 🚫 Ignored Files (`.vercelignore`)

```
# Ignore backend files and directories (but not admin-interface)
/src/
/dist/
/node_modules/
*.log
.env*
*.md
!README.md
```

## 🎯 Success Factors

### 1. **Dual Vercel Configuration**
- Root `vercel.json` for monorepo structure
- Admin-interface `vercel.json` for Next.js specifics

### 2. **Critical Dependencies**
- `react-is: "^18.2.0"` - Required for recharts compatibility
- `--legacy-peer-deps` flag - Resolves peer dependency conflicts

### 3. **Proper Builder Configuration**
- `@vercel/next` builder with explicit config
- `npx next build` instead of `npm run build` for CLI availability

### 4. **Monorepo Structure Handling**
- Routes configuration to redirect to subdirectory
- Separate package.json targeting

## 📊 Build Results

### Successful Build Output:
```
✓ Compiled successfully in 26.5s
✓ Generating static pages (12/12)
✓ Build Completed in /vercel/output [1m]
✓ Deployment completed
✓ Build cache created and uploaded
```

### Route Statistics:
- **12 routes** successfully built
- **11 static pages** (including web-interface)
- **1 dynamic page** (`/projects/[id]`)
- **1 API route** (health endpoint)

## 🔄 Deployment Process

1. **Clone Repository**: Vercel clones the repository
2. **Install Dependencies**: Runs `npm install --legacy-peer-deps` in admin-interface
3. **Build Application**: Executes `npm run build` (which runs `next build`)
4. **Generate Static Pages**: Creates optimized static content
5. **Deploy**: Uploads to Vercel CDN

## ⚠️ Common Issues Avoided

### 1. **Module Resolution Errors**
- **Problem**: `Can't resolve 'react-is'`
- **Solution**: Added `react-is` dependency

### 2. **Next.js CLI Not Found**
- **Problem**: `next: command not found`
- **Solution**: Used `npx next build` instead of `npm run build`

### 3. **Peer Dependency Conflicts**
- **Problem**: Version conflicts between packages
- **Solution**: Used `--legacy-peer-deps` flag

### 4. **Monorepo Structure Issues**
- **Problem**: Vercel not detecting Next.js project
- **Solution**: Dual configuration with proper routing

## 🚀 Best Practices

1. **Always use `--legacy-peer-deps`** for complex React/Next.js applications
2. **Include `react-is`** when using recharts or similar libraries
3. **Use `npx` commands** for CLI tools to ensure availability
4. **Configure dual vercel.json** for monorepo structures
5. **Test locally** before deploying to catch dependency issues

## 📝 Environment Variables

Required environment variables for production:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_API_KEY`: API authentication key

## 🎉 Deployment Success Criteria

✅ **Build completes without errors**
✅ **All static pages generated**
✅ **Dependencies installed successfully**
✅ **Next.js optimization completed**
✅ **Build cache created**
✅ **Application deployed to CDN**

This configuration has been proven to work successfully and should be used as the template for future deployments.
