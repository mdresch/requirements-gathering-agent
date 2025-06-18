# Atlassian Forge CLI Best Practices & Integration Guide

## Table of Contents
- [Environment Setup](#environment-setup)
- [Forge CLI Best Practices](#forge-cli-best-practices)
- [Development Workflow](#development-workflow)
- [Confluence API Integration](#confluence-api-integration)
- [Security & Authentication](#security--authentication)
- [Testing & Debugging](#testing--debugging)
- [Deployment & Distribution](#deployment--distribution)
- [Common Pitfalls & Solutions](#common-pitfalls--solutions)

## Environment Setup

### 1. Prerequisites
- Node.js 18.x, 20.x or 22.x (current warning indicates version compatibility)
- Atlassian developer account
- Confluence Cloud instance for testing
- Git for version control

### 2. Initial Setup Commands
```bash
# Login to Atlassian Developer Console
forge login

# Verify login status
forge whoami

# Check available templates
forge create --help
```

## Forge CLI Best Practices

### 1. Project Structure Best Practices

```
forge-app/
├── manifest.yml          # App configuration
├── package.json          # Dependencies
├── src/
│   ├── index.js          # Main entry point
│   ├── resolvers/        # Custom resolvers
│   └── frontend/         # UI components (if applicable)
├── static/               # Static assets
├── .env                  # Environment variables (local only)
└── README.md
```

### 2. Manifest Configuration Best Practices

```yaml
# manifest.yml - Key best practices
modules:
  confluence:page:
    - key: document-publisher
      function: main
      title: ADPA Document Publisher
      # Use specific permissions only
      permissions:
        - read:page:confluence
        - write:page:confluence
        - read:space:confluence

# Environment variables (avoid hardcoding)
app:
  runtime:
    name: nodejs20.x
  environment:
    variables:
      API_BASE_URL: ${API_BASE_URL}
```

### 3. Development Commands

```bash
# Create new Forge app
forge create --template confluence-hello-world

# Install dependencies
npm install

# Start local development tunnel
forge tunnel

# Deploy to development environment
forge deploy

# Install app in Confluence instance
forge install

# View logs
forge logs

# Upgrade app
forge deploy --environment development
forge install --upgrade
```

## Development Workflow

### 1. Local Development Setup
```bash
# Set up development environment
forge tunnel --port 3000

# In another terminal, run your local server
npm run dev
```

### 2. Environment Management
```bash
# Create environment-specific configurations
forge deploy --environment staging
forge deploy --environment production

# Environment variable management
forge variables set --environment development API_KEY="dev-key"
forge variables set --environment production API_KEY="prod-key"
```

### 3. Version Control Integration
```bash
# Always commit manifest.yml changes
git add manifest.yml package.json
git commit -m "feat: update Forge app configuration"

# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
```

## Confluence API Integration

### 1. API Request Patterns
```javascript
// Best practice: Use Forge's requestConfluence API
import { requestConfluence } from '@forge/bridge';

// GET request
const response = await requestConfluence(`/wiki/rest/api/content`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
});

// POST request with error handling
try {
  const response = await requestConfluence('/wiki/rest/api/content', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'page',
      title: 'Generated Document',
      space: { key: 'SPACE_KEY' },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    })
  });
  
  return response.json();
} catch (error) {
  console.error('API request failed:', error);
  throw error;
}
```

### 2. Content Creation Best Practices
```javascript
// Always validate content before publishing
function validateContent(content) {
  if (!content || content.trim().length === 0) {
    throw new Error('Content cannot be empty');
  }
  
  // Escape HTML entities
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Use Confluence storage format
function convertToStorageFormat(markdown) {
  // Convert markdown to Confluence storage format
  // Use libraries like confluence-markdown or custom converter
  return storageContent;
}
```

### 3. Error Handling & Retry Logic
```javascript
async function resilientApiCall(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestConfluence(url, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.message}`);
      }
      
      return response.json();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Security & Authentication

### 1. Permission Management
```yaml
# manifest.yml - Minimal permissions principle
permissions:
  scopes:
    - read:page:confluence
    - write:page:confluence
    - read:space:confluence
  # Avoid broad permissions like admin:confluence
```

### 2. Data Handling
```javascript
// Never log sensitive data
console.log('Processing document:', { 
  id: document.id, 
  title: document.title 
  // Don't log: content, tokens, user data
});

// Validate user permissions
async function checkPermissions(spaceKey, userId) {
  const permissions = await requestConfluence(
    `/wiki/rest/api/space/${spaceKey}/permission`
  );
  
  return permissions.some(p => 
    p.subjects.user.results.some(u => u.accountId === userId)
  );
}
```

### 3. Environment Variables
```javascript
// Use environment variables for configuration
const config = {
  apiUrl: process.env.API_BASE_URL || 'https://api.atlassian.com',
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  retryCount: parseInt(process.env.RETRY_COUNT) || 3
};
```

## Testing & Debugging

### 1. Local Testing
```bash
# Test tunnel connection
forge tunnel --port 3000

# Check logs in real-time
forge logs --follow

# Test specific functionality
forge lint
```

### 2. Integration Testing
```javascript
// Test API integration
async function testConfluenceConnection() {
  try {
    const response = await requestConfluence('/wiki/rest/api/space');
    console.log('Connection successful:', response.size);
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    return false;
  }
}

// Test content creation
async function testDocumentCreation() {
  const testContent = '<p>Test document from ADPA</p>';
  
  try {
    const result = await createPage('TEST', 'ADPA Test Document', testContent);
    console.log('Test document created:', result.id);
    
    // Clean up test document
    await deletePage(result.id);
    return true;
  } catch (error) {
    console.error('Document creation test failed:', error);
    return false;
  }
}
```

### 3. Error Monitoring
```javascript
// Implement comprehensive error tracking
function trackError(error, context) {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString()
  });
  
  // Send to monitoring service if configured
  // sendToMonitoring(error, context);
}
```

## Deployment & Distribution

### 1. Deployment Workflow
```bash
# Development deployment
forge deploy --environment development
forge install --site YOUR_SITE.atlassian.net

# Production deployment
forge deploy --environment production
forge install --site YOUR_SITE.atlassian.net --environment production

# Rollback if needed
forge deploy --environment production --version PREVIOUS_VERSION
```

### 2. Release Management
```bash
# Create release
forge deploy --environment production
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Monitor deployment
forge logs --environment production
```

### 3. App Distribution
```yaml
# manifest.yml - Prepare for Marketplace
app:
  name: ADPA Document Publisher
  description: Advanced Document Processing Agent for Confluence
  vendor:
    name: Your Organization
    url: https://your-website.com
  support:
    email: support@your-domain.com
    url: https://support.your-domain.com
```

## Common Pitfalls & Solutions

### 1. Performance Issues
```javascript
// Problem: Synchronous operations blocking
// Solution: Use async/await properly
async function processDocuments(documents) {
  // Bad: Sequential processing
  // for (const doc of documents) {
  //   await processDocument(doc);
  // }
  
  // Good: Parallel processing with concurrency limit
  const batchSize = 5;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    await Promise.all(batch.map(processDocument));
  }
}
```

### 2. Memory Management
```javascript
// Problem: Memory leaks in long-running processes
// Solution: Proper cleanup
function processLargeDocument(content) {
  let processedContent = null;
  
  try {
    processedContent = transformContent(content);
    return processedContent;
  } finally {
    // Clean up large objects
    processedContent = null;
    if (global.gc) global.gc();
  }
}
```

### 3. API Rate Limiting
```javascript
// Implement rate limiting
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

### 4. Content Format Issues
```javascript
// Handle different content formats
function sanitizeContent(content, format = 'storage') {
  switch (format) {
    case 'markdown':
      return convertMarkdownToStorage(content);
    case 'html':
      return sanitizeHtml(content);
    case 'storage':
      return validateStorageFormat(content);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
```

## ✅ Authentication Success

**Successfully authenticated with Forge CLI using:**
- User: `menno@cbadmin.onmicrosoft.com`
- Date: June 18, 2025
- Status: Ready for Confluence integration development

> **Important:** Always ensure you're using the correct organizational account that has access to your Confluence instance and appropriate permissions for app development.

## Next Steps After Authentication

Now that authentication is successful, you can proceed with:

1. **Install Confluence Integration Dependencies**
2. **Create ConfluencePublisher Module**
3. **Test API Connectivity**
4. **Implement Basic Publishing Features**

Refer to `CONFLUENCE-INTEGRATION-PLAN.md` for detailed implementation steps.

## Next Steps for ADPA Integration

1. **Set Up Forge App Structure**
   ```bash
   cd confluence-integration
   forge create --template confluence-hello-world adpa-confluence-app
   cd adpa-confluence-app
   ```

2. **Configure Manifest for ADPA**
   - Add appropriate permissions
   - Configure custom UI components
   - Set up webhook endpoints

3. **Implement Core Modules**
   - Document publisher
   - Space manager
   - Template synchronizer
   - User preference manager

4. **Testing Strategy**
   - Unit tests for all modules
   - Integration tests with Confluence API
   - End-to-end user workflow tests

5. **Deployment Pipeline**
   - Development environment setup
   - Staging environment for testing
   - Production deployment with monitoring

This guide provides the foundation for building a robust, scalable Confluence integration for ADPA. Follow these best practices to ensure a smooth development experience and reliable production deployment.
