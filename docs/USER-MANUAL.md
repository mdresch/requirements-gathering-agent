# Requirements Gathering Agent - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Installation & Setup](#installation--setup)
3. [Basic Usage](#basic-usage)
4. [Advanced Features](#advanced-features)
5. [Adobe Creative Suite Integration](#adobe-creative-suite-integration)
6. [Standards Compliance Analysis](#standards-compliance-analysis)
7. [API Server Usage](#api-server-usage)
8. [Configuration Guide](#configuration-guide)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Getting Started

The Requirements Gathering Agent is an enterprise-grade automation platform that combines AI-powered content generation with professional document creation and standards compliance analysis.

### Key Features
- **Multi-Provider AI Integration**: OpenAI, Google AI, GitHub Copilot, Ollama
- **Professional Document Generation**: Adobe Creative Suite integration
- **Standards Compliance**: BABOK v3, PMBOK 7th Edition analysis
- **Enterprise API**: RESTful endpoints for system integration
- **Template System**: 6+ professional templates for various document types

## Installation & Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Git for version control

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/mdresch/requirements-gathering-agent.git
cd requirements-gathering-agent
```

2. **Install Dependencies**
```bash
npm install
```

3. **Build the Project**
```bash
npm run build
```

4. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# AI Provider Configuration
CURRENT_PROVIDER=github-ai
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_key_here
AZURE_OPENAI_ENDPOINT=your_azure_endpoint_here

# Adobe Creative Cloud Configuration
ADOBE_CLIENT_ID=your_adobe_client_id
ADOBE_CLIENT_SECRET=your_adobe_client_secret
ADOBE_ORGANIZATION_ID=your_adobe_org_id

# Server Configuration
PORT=3001
NODE_ENV=production
```

## Basic Usage

### Command Line Interface

The CLI provides direct access to all features:

```bash
# Basic document generation
node dist/cli.js generate --type "project-charter" --input "Project requirements..."

# Interactive mode
node dist/cli.js interactive

# Batch processing
node dist/cli.js batch --directory "./input-documents"
```

### Common Commands

```bash
# Generate PMBOK-compliant project charter
node dist/cli.js pmbok:generate --framework=pmbok

# Generate BABOK business analysis document
node dist/cli.js babok:generate --framework=babok

# Start API server
npm run api:start

# Run tests
npm test
```

## Advanced Features

### Multi-Provider AI Processing

Switch between AI providers based on requirements:

```typescript
import { DocumentService } from './src/services/DocumentService';

const service = new DocumentService();

// Use specific provider
await service.generate({
  content: "Project requirements...",
  provider: "openai", // or "github-ai", "gemini", "ollama"
  template: "project-charter"
});
```

### Template System

Available templates:
- `project-charter-template`: PMBOK-style project charter
- `requirements-doc-template`: Technical requirements specification
- `management-plan-template`: Project management plan
- `technical-spec-template`: Technical specification document

```bash
# List available templates
node dist/cli.js templates:list

# Use specific template
node dist/cli.js generate --template="project-charter-template"
```

## Adobe Creative Suite Integration

### Setup Adobe Integration

1. **Obtain Adobe Developer Credentials**
   - Visit [Adobe Developer Console](https://developer.adobe.com/console)
   - Create a new project
   - Add Creative Cloud APIs
   - Generate client credentials

2. **Configure Environment**
```env
ADOBE_CLIENT_ID=your_client_id
ADOBE_CLIENT_SECRET=your_client_secret
ADOBE_ORGANIZATION_ID=your_org_id
```

3. **Test Integration**
```bash
node test-phase3-implementation.js
```

### Using Adobe Features

```typescript
import { adobeCreativeSuite } from './src/adobe/creative-suite/index.js';

// Generate professional InDesign layout
const indesignDoc = await adobeCreativeSuite.inDesign.createDocument({
  templateId: 'project-charter-template',
  content: {
    title: 'Project Charter',
    author: 'Project Manager',
    sections: [/* document sections */]
  },
  branding: {
    colorScheme: 'corporate',
    typography: { /* typography settings */ }
  },
  outputOptions: {
    format: 'pdf',
    quality: 'high'
  }
});

// Generate data visualizations
const visualization = await adobeCreativeSuite.illustrator.generateTimeline({
  title: 'Project Timeline',
  milestones: [/* milestone data */]
}, {
  colorScheme: ['#2E86AB', '#A23B72'],
  theme: 'corporate'
});
```

### Batch Processing

```typescript
// Process multiple documents
const results = await adobeCreativeSuite.processDocuments({
  sourceDirectory: './input-documents',
  outputDirectory: './generated-documents-adobe',
  enableInDesignLayouts: true,
  enableDataVisualization: true,
  qualityLevel: 'premium'
});
```

## Standards Compliance Analysis

### API Endpoints

Start the API server:
```bash
npm run api:start
```

### Analyze Project Compliance

```bash
curl -X POST http://localhost:3001/api/v1/standards/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectData": {
      "projectId": "PRJ-2025-001",
      "projectName": "Digital Transformation Project",
      "industry": "HEALTHCARE",
      "methodology": "AGILE_HYBRID"
    },
    "analysisConfig": {
      "enabledStandards": ["BABOK_V3", "PMBOK_7"],
      "analysisDepth": "COMPREHENSIVE"
    }
  }'
```

### Dashboard Access

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/standards/dashboard
```

### Executive Reports

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/standards/reports/executive-summary
```

## API Server Usage

### Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build && npm start
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/standards/analyze` | POST | Comprehensive compliance analysis |
| `/api/v1/standards/dashboard` | GET | Real-time compliance dashboard |
| `/api/v1/standards/health` | GET | System health check |
| `/api/v1/standards/deviations/summary` | GET | Executive deviation summary |

### Authentication

The API uses Bearer token authentication:

```javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_TOKEN',
  'Content-Type': 'application/json'
};
```

## Configuration Guide

### AI Provider Configuration

```env
# Set primary provider
CURRENT_PROVIDER=github-ai

# Configure specific providers
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxx
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

### Adobe Configuration

```env
# Adobe Creative Cloud API
ADOBE_CLIENT_ID=d1c7d6413e7b442091ae8ce5b2dca3d4
ADOBE_CLIENT_SECRET=ep8e-RdqUegunFEePYaSY0VjPnyFRr7rBkpSs
ADOBE_ORGANIZATION_ID=0A9356CE5F8120180A495FD3@AdobeOrg
```

### Server Configuration

```env
# Express server settings
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Database (if applicable)
DATABASE_URL=your_database_connection_string
```

## Troubleshooting

### Common Issues

#### 1. Adobe Authentication Fails
```
Error: invalid client_secret parameter
```
**Solution**: Verify Adobe credentials in `.env` file and ensure they're valid.

#### 2. AI Provider Connection Issues
```
Error: Failed to connect to OpenAI API
```
**Solution**: Check API key validity and network connectivity.

#### 3. Build Errors
```
Error: Cannot find module
```
**Solution**: Run `npm install` and `npm run build` again.

#### 4. Permission Errors
```
Error: EACCES permission denied
```
**Solution**: Check file permissions and run with appropriate privileges.

### Debug Mode

Enable debug logging:
```bash
DEBUG=* node dist/cli.js
```

### Log Files

Check application logs:
```bash
# View recent logs
tail -f logs/application.log

# Search for specific errors
grep "ERROR" logs/application.log
```

## Best Practices

### 1. Project Organization
- Use clear project structures
- Organize documents by type and date
- Maintain consistent naming conventions

### 2. Template Usage
- Choose appropriate templates for document types
- Customize templates for organizational needs
- Maintain template version control

### 3. AI Provider Selection
- Use GitHub Copilot for code-related documentation
- Use OpenAI for general business content
- Use local models (Ollama) for sensitive data

### 4. Adobe Integration
- Use high-quality settings for final documents
- Implement brand guidelines consistently
- Optimize batch processing for large document sets

### 5. Standards Compliance
- Run compliance analysis early in project lifecycle
- Address deviations with proper justification
- Generate executive summaries for stakeholder communication

### 6. Performance Optimization
- Use caching for repeated operations
- Implement batch processing for multiple documents
- Monitor API usage and costs

### 7. Security
- Secure API keys and credentials
- Use environment variables for configuration
- Implement proper authentication for API access

## Support and Resources

### Documentation
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API-REFERENCE.md)
- [Adobe Integration Guide](./docs/ADOBE/ADOBE-INTEGRATION-README.md)

### Community
- GitHub Issues: Report bugs and feature requests
- Discussions: Community support and questions

### Enterprise Support
For enterprise support and custom implementations, contact the development team.

---

**Version**: 3.2.0  
**Last Updated**: July 13, 2025  
**Status**: Production Ready
