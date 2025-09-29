# ADPA - Advanced Document Processing & Automation Framework

<!-- Deployment trigger: 2025-01-28 15:30 -->

[![CI](https://github.com/mdresch/requirements-gathering-agent/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mdresch/requirements-gathering-agent/actions/workflows/ci.yml)
[![Vercel](https://vercelbadge.vercel.app/api/project/prj_TVNBBugHdRQTvaVpBFt37qdO8hn6)](https://vercel.com/team_iwZkbWCdspuARj0t8dUyo90z/requirements-gathering-agent)

[![npm version](https://badge.fury.io/js/adpa-enterprise-framework-automation.svg)](https://badge.fury.io/js/adpa-enterprise-framework-automation)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API-First](https://img.shields.io/badge/API--First-TypeSpec-orange.svg)](https://typespec.io/)

> **Previously known as Requirements Gathering Agent (RGA)**

**ADPA** is a modular, standards-compliant enterprise automation framework for AI-powered document generation, project management, and business analysis. Built with TypeScript and Node.js, it provides both CLI and REST API interfaces for generating professional documentation following industry standards including BABOK v3, PMBOK 7th Edition, and DMBOK 2.0.

## 🚀 **Key Features**

### **Enterprise Standards Compliance**
- 📊 **BABOK v3** - Business Analysis Body of Knowledge automation ✅ Production Ready
- 📋 **PMBOK 7th Edition** - Project Management documentation generation ✅ Production Ready
- 📈 **DMBOK 2.0** - Data Management frameworks ✅ Production Ready
- 🏛️ **Multi-Framework Integration** - Cross-reference and unified reporting

### **AI-Powered Generation**
- 🤖 **Multi-Provider AI Support** - OpenAI, Google AI, GitHub Copilot, Ollama
- 🧠 **Intelligent Context Management** - Smart context injection and processing
- 📝 **Professional Document Generation** - Standards-compliant business documents
- 🔄 **Automated Workflows** - End-to-end document generation pipelines
- 🎯 **Context Quality Measurement** - A/B testing for optimal context window usage
- 📊 **Complexity-Driven Documentation** - Dynamic requirements based on project complexity

### **Recent Major Features (September 2025)**
- 🎯 **Context Quality Measurement Framework** - A/B testing system for optimal LLM context usage
- 📊 **PMBOK Complexity Analysis** - Dynamic documentation requirements based on project complexity
- 💬 **Feedback System** - Complete user feedback collection with database persistence ✅ Production Ready
- 🗄️ **MongoDB Integration** - Full database connectivity with project and feedback management ✅ Operational

### **Enterprise Integration**
- 🌐 **Production-Ready REST API** - TypeSpec-generated OpenAPI specifications
- 📚 **Confluence Integration** - Direct publishing to Atlassian Confluence
- 📊 **SharePoint Integration** - Microsoft SharePoint document management
- � **Adobe Document Services** - Professional PDF generation and document intelligence
- �🔧 **CLI & Web Interface** - Multiple interaction modes

### **Compliance & Security**
- 🛡️ **Enterprise-Grade Security** - Production-ready authentication and authorization
- 📋 **Regulatory Compliance** - Basel III, MiFID II, GDPR, SOX, FINRA, PCI DSS
- 🏢 **Fortune 500 Ready** - Designed for large-scale enterprise deployments
- ✅ **API-First Architecture** - Scalable microservices design

## 📦 **Installation**

### **NPM Package (Recommended)**
```bash
npm install -g adpa-enterprise-framework-automation
```

### **From Source**
```bash
git clone https://github.com/mdresch/requirements-gathering-agent.git
cd requirements-gathering-agent
npm install
npm run build
```

### **Docker (Coming Soon)**
```bash
docker pull adpa/enterprise-framework:latest
```

## 🎯 **Quick Start**

### **1. CLI Usage**
```bash
# Generate project documentation
adpa generate --key project-charter --output ./docs

# Start the API server
adpa-api

# Initialize Confluence integration
adpa confluence init

# Initialize SharePoint integration  
adpa sharepoint init
```

### **2. API Server**
```bash
# Start the Express.js API server
npm run api:start

# Access API documentation
open http://localhost:3000/api-docs
```

### **3. Admin Web Interface**
```bash
# Install and start the admin interface
npm run admin:setup
npm run admin:serve

# Access at http://localhost:3001
```

### **4. Feedback System (NEW)**
```bash
# Submit feedback via API
curl -X POST http://localhost:3002/api/v1/feedback/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-123" \
  -d '{
    "projectId": "your-project-id",
    "documentType": "project-charter",
    "feedbackType": "quality",
    "rating": 4,
    "title": "Great document!",
    "description": "Very comprehensive and well-structured",
    "category": "pmbok"
  }'

# Get feedback summary
curl -X GET http://localhost:3002/api/v1/feedback/summary \
  -H "X-API-Key: dev-api-key-123"
```

## 🛠️ **Configuration**

### **Environment Setup**

1. **Copy the environment template:**
```bash
cp .env .env.local  # Create your local configuration
```

2. **Configure your preferred AI provider:**

#### **Option 1: Google AI Studio (Recommended - Free Tier)**
```bash
# Set the active provider
CURRENT_PROVIDER=google-ai

# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
GOOGLE_AI_MODEL=gemini-1.5-flash
```

#### **Option 2: GitHub AI (Free for GitHub Users)**
```bash
# Set the active provider
CURRENT_PROVIDER=github-ai

# Get your token from: https://github.com/settings/tokens
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_ENDPOINT=https://models.github.ai/inference/
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini
```

#### **Option 3: Azure OpenAI (Enterprise)**
```bash
# Set the active provider
CURRENT_PROVIDER=azure-openai-key

# Configure Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

#### **Option 4: Ollama (Local)**
```bash
# Set the active provider
CURRENT_PROVIDER=ollama

# Configure Ollama (requires local installation)
OLLAMA_ENDPOINT=http://localhost:11434/api
OLLAMA_MODEL=deepseek-coder:latest
```

### **AI Provider Configuration**
ADPA supports multiple AI providers with automatic failover:

- **Google AI Studio** - Free tier with generous limits (1M-2M tokens)
- **GitHub AI** - Free for GitHub users with gpt-4o-mini access
- **Azure OpenAI** - Enterprise-grade with Entra ID authentication
- **Ollama** - Local models for privacy-focused deployments

**Provider Priority:** The system will automatically fallback to available providers if the primary provider fails.

## 📚 **Framework Support**





### **BABOK v3 (Business Analysis)**
✅ **Production Ready**
- Requirements Elicitation & Analysis
- Stakeholder Analysis & Management
- Business Analysis Planning
- Requirements Life Cycle Management
- Strategy Analysis
- Requirements Analysis & Design Definition
- **Solution Evaluation**: Evaluate implemented solutions for business value, performance, and alignment with stakeholder needs. Supports continuous improvement and benefit realization tracking.
- **Underlying Competencies**: Describes the foundational skills, behaviors, and knowledge areas required for effective business analysis, as defined by BABOK v3.
- **Perspectives**: Outlines the various perspectives (Agile, BI, IT, Business Architecture, BPM) and how to tailor business analysis practices for each context, as defined by BABOK v3.
- Enterprise Analysis
- **Introduction Business Analysis Body of Knowledge**: Provides an overview, checklist, and summary of all BABOK documents, including coverage gaps and improvement suggestions. This document is generated as the starting point for BABOK-based documentation in ADPA.

### **PMBOK 7th Edition (Project Management)**  
✅ **Implemented**
- Project Charter & Scope Management
- Stakeholder Management Plans
- **Stakeholder Analysis & Communication Plan** - Identifies stakeholders, analyzes their influence/interest levels, and defines engagement and communication strategies for PPPM context (see `stakeholder-analysis` document type)
- Risk & Quality Management
- Resource & Schedule Management
- Cost Management & Control
- **Portfolio Dashboard** - Aggregates and visualizes performance, health, risks, and benefits across multiple projects/programs (see `portfolio-dashboard` document type)
- **Lessons Learned** - Captures project/program outcomes, what went well, what went wrong, key insights, recommendations, metrics, and action items for future improvement (see `lessons-learned` document type)


### **DMBOK 2.0 (Data Management)**
✅ **Production Ready**
- Data Governance Frameworks (see `data-governance-framework` document type)
- Data Stewardship & Roles (see `data-stewardship-roles-responsibilities` document type)
- Data Modeling Standards (see `data-modeling-standards` document type)
- Data Quality Management (see `data-quality-management-plan` document type)
- Data Architecture & Quality
- Data Architecture & Modeling (see `data-architecture-modeling-guide` document type)
- Business Intelligence & Analytics Strategy (see `business-intelligence-strategy` document type)
- Master Data Management (see `master-data-management-strategy` document type)
- Metadata Management (see `metadata-management-framework` document type)
- Data Security & Privacy (see `data-security-privacy-plan` document type)
- Reference Data Management (see `reference-data-management-plan` document type)
- Data Storage & Operations (see `data-storage-operations-handbook` document type)
- Data Lifecycle Management (see `data-lifecycle-management` document type)

## 🏗️ **Architecture**

### **Core Components**
```
ADPA/
├── 🧠 AI Processing Engine     # Multi-provider AI orchestration
├── 📄 Document Generator       # Template-based document creation  
├── 🌐 REST API Server         # Express.js with TypeSpec specs
├── 💻 CLI Interface           # Yargs-based command line tools
├── 🔌 Integration Layer       # Adobe, Confluence, SharePoint, VCS
├── 🎛️ Admin Interface        # Next.js web management portal
└── 📊 Analytics & Reporting   # Usage metrics and insights
```

### **Technology Stack**
- **Backend**: Node.js 18+, TypeScript 5.7+, Express.js
- **AI Integration**: OpenAI, Google AI, GitHub Copilot, Ollama
- **API**: TypeSpec, OpenAPI 3.0, Swagger UI

# Generate Data Modeling Standards Guide (DMBOK)
adpa generate --key data-modeling-standards --format markdown
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Database**: JSON-based configuration, extensible to SQL/NoSQL
- **Testing**: Jest, TypeScript, comprehensive test coverage

## 📖 **Usage Examples**


### **Document Generation**
```bash
# Generate business case document
adpa generate --key business-case --format markdown

# Generate complete project charter
adpa generate --category project-charter --output ./project-docs

# Generate stakeholder analysis
adpa generate --key stakeholder-analysis --format json

# Generate stakeholder analysis and communication plan (PPPM)
adpa generate --key stakeholder-analysis --format markdown --output ./stakeholder-docs



# Generate Solution Evaluation (BABOK)
adpa generate --key solution-evaluation --format markdown

# Generate Underlying Competencies (BABOK)
adpa generate --key underlying-competencies --format markdown

# Generate Perspectives (BABOK)
adpa generate --key perspectives --format markdown

# Generate Introduction Business Analysis Body of Knowledge (BABOK)
adpa generate --key introduction-business-analysis-body-of-knowledge --format markdown

# Generate Data Governance Framework (DMBOK)
adpa generate --key data-governance-framework --format markdown

# Generate Data Stewardship and Roles & Responsibilities (DMBOK)
adpa generate --key data-stewardship-roles-responsibilities --format markdown

# Generate Data Quality Management Plan (DMBOK)
adpa generate --key data-quality-management-plan --format markdown

# Generate Master Data Management Strategy (DMBOK)
adpa generate --key master-data-management-strategy --format markdown

# Generate Data Architecture & Modeling Guide (DMBOK)
adpa generate --key data-architecture-modeling-guide --format markdown

# Generate Metadata Management Framework (DMBOK)
adpa generate --key metadata-management-framework --format markdown

# Generate Data Security & Privacy Plan (DMBOK)
adpa generate --key data-security-privacy-plan --format markdown

# Generate Reference Data Management Plan (DMBOK)
adpa generate --key reference-data-management-plan --format markdown

# Generate Data Storage & Operations Handbook (DMBOK)
adpa generate --key data-storage-operations-handbook --format markdown

# Generate Data Lifecycle Management Policy (DMBOK)
adpa generate --key data-lifecycle-management --format markdown

# Generate Document & Content Management Framework (DMBOK)
adpa generate --key document-content-management --format markdown

# Generate Business Intelligence & Analytics Strategy (DMBOK)
adpa generate --key business-intelligence-strategy --format markdown
```

### **API Usage**
```typescript
// REST API endpoints
POST /api/v1/generate                    # Generate documents
GET  /api/v1/templates                   # List available templates
POST /api/v1/confluence/publish          # Publish to Confluence
POST /api/v1/sharepoint/upload           # Upload to SharePoint
GET  /api/v1/frameworks                  # List supported frameworks

// Feedback System (NEW - Production Ready)
POST /api/v1/feedback/                   # Submit feedback
GET  /api/v1/feedback/project/:id        # Get project feedback
GET  /api/v1/feedback/summary            # Get feedback analytics
PATCH /api/v1/feedback/:id/status        # Update feedback status
```

### **Integration Examples**
```bash
# Adobe Document Services integration
npm run adobe:setup                      # Configure Adobe credentials
npm run adobe:demo-generation           # Run document generation demo
npm run adobe:example-basic             # Basic PDF generation example

# Confluence integration
adpa confluence oauth2 login
adpa confluence publish --document ./docs/project-charter.md

# SharePoint integration  
adpa sharepoint oauth2 login
adpa sharepoint upload --folder "Project Documents" --file ./docs/

# Version control integration
adpa vcs commit --message "Generated project documentation"
adpa vcs push --remote origin
```

### Stakeholder Analysis & Communication Plan
Generate a comprehensive stakeholder analysis and communication plan for Project, Program, and Portfolio Management (PPPM) contexts:

```bash
adpa generate --key stakeholder-analysis --format markdown
```

This document provides a complete stakeholder management strategy including:
- **Stakeholder Analysis Matrix**: Detailed identification and analysis of all stakeholders with interest/influence levels
- **Communication Plan**: Comprehensive communication strategy with methods, frequency, and responsible parties
- **Stakeholder Engagement Activities**: Specific engagement strategies for different stakeholder categories
- **Power/Interest Grid Analysis**: Strategic categorization for targeted engagement approaches  
- **Communication Tools and Channels**: Technology and platform specifications for stakeholder communication
- **Monitoring and Review Process**: Framework for ongoing stakeholder relationship management

Ideal for project managers, program managers, and portfolio managers who need to effectively manage complex stakeholder relationships and ensure project success through strategic communication.

### Portfolio/Program Stakeholder Analysis
Generate a stakeholder analysis at the portfolio or program level (multi-project, business unit, or enterprise-wide):

```bash
adpa generate --key portfolio-stakeholder-analysis --format markdown
```

This document provides a comprehensive analysis of stakeholders across multiple projects, programs, or business units, supporting portfolio management best practices.

### Portfolio Dashboard
Generate a comprehensive dashboard that aggregates and visualizes performance, health, risks, and benefits across multiple projects/programs:

```bash
adpa generate --key portfolio-dashboard --format markdown
```

This document creates an executive-level portfolio dashboard including:
- Portfolio overview and strategic alignment
- Performance metrics and KPIs
- Resource utilization analysis
- Benefits tracking and realization
- Top risks and issues management
- Upcoming strategic decisions
- Actionable recommendations for portfolio governance

Perfect for portfolio managers, executives, and PMO teams who need comprehensive visibility across multiple projects and programs.

### Lessons Learned
Generate comprehensive lessons learned documentation to capture project/program outcomes and improve future delivery:

```bash
adpa generate --key lessons-learned --format markdown
```

This document captures institutional knowledge including:
- Project information and summary
- What went well and should be repeated
- What went wrong and should be improved
- Key insights and actionable recommendations
- Performance metrics and variance analysis
- Action items for organizational improvement
- Knowledge artifacts and contacts for future reference

Essential for project closure, organizational learning, and continuous improvement initiatives.

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Test specific providers
npm run test:azure
npm run test:github  
npm run test:ollama

# Performance testing
npm run test:performance

# Integration testing
npm run test:integration
```

## 🏢 **Enterprise Features**

### **Compliance Standards**
- **Financial**: Basel III, MiFID II, FINRA, CFTC, FCA, BaFin
- **Security**: GDPR, SOX, PCI DSS, ISO 27001, ISO 9001
- **Industry**: Healthcare (HIPAA), Government (FedRAMP)

### **Enterprise Integration**
- **Identity Management**: Active Directory, SAML, OAuth2
- **Document Management**: SharePoint, Confluence, FileNet
- **Project Management**: Jira, Azure DevOps, ServiceNow
- **Version Control**: GitHub Enterprise, GitLab, Azure DevOps

### **Scalability & Performance**
- **Horizontal Scaling**: Microservices architecture
- **Caching**: Redis support for high-performance scenarios  
- **Load Balancing**: Production-ready deployment patterns
- **Monitoring**: Built-in metrics and health checks

## 📊 **Current System Status (September 2025)**

### **✅ Production Ready Components**
- **Database**: MongoDB connected and operational with active projects
- **API Server**: Express.js server running on port 3002 with full authentication
- **Feedback System**: Complete CRUD operations with database persistence
- **Document Generation**: All frameworks (BABOK, PMBOK, DMBOK) fully implemented
- **Authentication**: API key authentication working with development keys

### **🔧 Active Development**
- **Admin Interface**: Enhanced project management and feedback visualization
- **Context Quality Measurement**: A/B testing framework for LLM optimization
- **Complexity Analysis**: PMBOK-based dynamic documentation requirements
- **Analytics Dashboard**: Usage metrics and feedback insights

### **📈 Recent Achievements**
- **Feedback System**: Full implementation with MongoDB integration ✅
- **PMBOK Complexity Framework**: Hierarchical influence model for documentation ✅
- **Context Quality Measurement**: A/B testing infrastructure for LLM optimization ✅
- **Database Connectivity**: Confirmed MongoDB operations with test data ✅

## 📁 **Project Structure**

```
requirements-gathering-agent/
├── 📂 src/                          # TypeScript source code
│   ├── 🎯 cli.ts                   # Main CLI entry point
│   ├── 🌐 server.ts                # Express.js API server
│   ├── 📄 modules/                 # Core modules
│   │   ├── ai/                     # AI provider integrations
│   │   │   └── contextQualityMeasurement/ # NEW: Context quality framework
│   │   ├── documentGenerator/      # Document generation engine
│   │   ├── pmbok/                  # NEW: PMBOK complexity analysis
│   │   ├── confluence/             # Confluence integration
│   │   ├── sharepoint/             # SharePoint integration
│   │   └── documentTemplates/      # Framework templates
│   ├── 📂 api/                     # REST API implementation
│   │   ├── controllers/            # API controllers (including FeedbackController)
│   │   ├── routes/                 # API routes (including feedback routes)
│   │   └── models/                 # Database models (including DocumentFeedback)
│   └── 🔧 commands/                # CLI command modules
├── 📂 admin-interface/             # Next.js admin portal
├── 📂 api-specs/                   # TypeSpec API specifications
├── 📂 docs/                        # Comprehensive documentation
│   └── LLM-CONTEXT.md              # NEW: LLM context document
├── 📂 test/                        # Test suites
├── 📂 generated-documents/         # Output directory
└── 📂 dist/                        # Compiled JavaScript
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
git clone https://github.com/mdresch/requirements-gathering-agent.git
cd requirements-gathering-agent
npm install
npm run dev         # Start development mode
npm run build       # Build for production
npm test           # Run tests
```

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing
- **Conventional Commits**: Commit message standards

## 📋 **Roadmap**

### **Q2 2025**
- ✅ DMBOK 2.0 implementation
🔄 Docker containerization
🔄 Kubernetes deployment templates
🔄 Advanced analytics dashboard

### **Q3 2025**
- 📋 Enterprise SSO integration
- 📋 Advanced workflow automation
- 📋 Real-time collaboration features
- 📋 Mobile application support

## 📞 **Support & Documentation**

- **📖 Full Documentation**: [GitHub Wiki](https://github.com/mdresch/requirements-gathering-agent/wiki)
- **🎯 CLI Usage Documentation**: [Interactive Menu Navigation & Complete Usage Guide](docs/CLI-USAGE-DOCUMENTATION.md)
- **🖥️ CLI Execution Guide**: [Complete CLI Usage Guide](docs/CLI-EXECUTION-GUIDE.md)
- **⚡ CLI Quick Reference**: [Essential Commands & Examples](docs/CLI-QUICK-REFERENCE.md)
- **🐛 Issue Tracking**: [GitHub Issues](https://github.com/mdresch/requirements-gathering-agent/issues)
- **💬 Community**: [GitHub Discussions](https://github.com/mdresch/requirements-gathering-agent/discussions)
- **📧 Enterprise Support**: [Contact Us](mailto:menno.drescher@gmail.com)

## 📄 **License**

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Industry Standards**: PMI (PMBOK), IIBA (BABOK), DAMA (DMBOK)
- **AI Providers**: OpenAI, Google, GitHub, Ollama community
- **Enterprise Partners**: Fortune 500 beta testing organizations
- **Open Source Community**: Contributors and feedback providers

---

<div align="center">

**Built with ❤️ for Enterprise Automation**

[🌟 Star us on GitHub](https://github.com/mdresch/requirements-gathering-agent) | [📦 npm Package](https://www.npmjs.com/package/adpa-enterprise-framework-automation) | [📖 Documentation](https://github.com/mdresch/requirements-gathering-agent/wiki)

</div>
