# ADPA CLI Execution Guide

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Core Commands](#core-commands)
- [Document Generation](#document-generation)
- [Integration Commands](#integration-commands)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Overview

The ADPA (Advanced Document Processing & Automation) CLI provides a comprehensive command-line interface for generating professional documentation following industry standards including BABOK v3, PMBOK 7th Edition, and DMBOK 2.0.

### Key Features
- 🤖 **Multi-AI Provider Support** - Google AI, Azure OpenAI, GitHub AI, Ollama
- 📋 **Standards Compliance** - BABOK v3, PMBOK 7th Edition, DMBOK 2.0
- 🔄 **Retry Logic** - Built-in retry mechanisms with configurable backoff
- 🌐 **Integration Ready** - Confluence, SharePoint, Git integration
- ✅ **Validation** - PMBOK compliance validation
- 📊 **Rich Output** - Multiple formats (Markdown, JSON, YAML)

## Installation

### Global Installation (Recommended)
```bash
npm install -g adpa-enterprise-framework-automation
```

### Local Installation
```bash
npm install adpa-enterprise-framework-automation
npx adpa --help
```

### From Source
```bash
git clone https://github.com/mdresch/requirements-gathering-agent.git
cd requirements-gathering-agent
npm install
npm run build
npm link
```

## Quick Start

### 1. Initial Setup
```bash
# Run interactive setup wizard
adpa setup

# Check system status
adpa status

# List available document templates
adpa list-templates
```

### 2. Generate Your First Document
```bash
# Generate a project charter
adpa generate project-charter

# Generate all documents in a category
adpa generate-category pmbok

# Generate core analysis documents
adpa generate-core-analysis
```

### 3. Validate Documents
```bash
# Validate generated documents against PMBOK standards
adpa validate
```

## Configuration

### Environment Variables

Create a `.env` file in your project directory:

```bash
# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key
GOOGLE_AI_MODEL=gemini-1.5-flash

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_api_key
DEPLOYMENT_NAME=gpt-4
USE_ENTRA_ID=false

# GitHub AI Configuration
GITHUB_TOKEN=your_github_token
GITHUB_ENDPOINT=https://models.github.ai/inference/
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini

# Ollama Configuration
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama3.1

# General Configuration
CURRENT_PROVIDER=google-ai
DEFAULT_OUTPUT_DIR=./generated-documents
DEBUG=false
```

### Configuration Files

#### config-rga.json
```json
{
  "currentProvider": "google-ai",
  "providers": {
    "google-ai": {
      "model": "gemini-1.5-flash"
    },
    "azure-ai": {
      "model": "gpt-4"
    }
  }
}
```

## Core Commands

### Setup Command
Interactive setup wizard for configuring AI providers.

```bash
# Run setup wizard
adpa setup
```

**Example Output:**
```
🧙‍♂️ Interactive Setup Wizard

Select AI provider (google/azure/github/ollama): google
Enter your Google AI API Key: [your-key]
Enter Google AI Model (default: gemini-1.5-flash): 
Update config-rga.json with provider/model? (y/n): y
Run npm install now? (y/n): y
```

### Status Command
Display comprehensive system status and configuration.

```bash
# Show system status
adpa status

# Quiet mode
adpa status --quiet

# Verbose mode
adpa status --verbose
```

**Example Output:**
```
🔍 Requirements Gathering Agent - System Status

📋 VERSION INFO:
   🚀 CLI Version: 3.2.0
   📁 Working Directory: /path/to/project
   🟢 Node.js: v18.17.0
   💻 Platform: win32 (x64)

⚙️  CURRENT CONFIGURATION:
   Active Provider: google-ai
   Output Directory: ./generated-documents
   Debug Mode: ❌ Disabled

🤖 AI PROVIDER STATUS:
   🟣 Google AI Studio:
      Status: ✅ Configured
      Model: gemini-1.5-flash
```

### Analyze Command
Analyze workspace without generating documents.

```bash
# Analyze current workspace
adpa analyze
```

### List Templates Command
Show all available document templates organized by category.

```bash
# List all available templates
adpa list-templates
```

**Example Output:**
```
📋 Available Document Templates by Category:

📁 BABOK:
   📊 Business Analysis Planning and Monitoring (business-analysis-planning-and-monitoring)
   🤝 Elicitation and Collaboration (elicitation-and-collaboration)
   📋 Requirements Analysis and Design Definition (requirements-analysis-and-design-definition)

📁 PMBOK:
   📋 Project Charter (project-charter)
   📊 Project Management Plan (project-management-plan)
   ✅ Close Project or Phase (close-project-or-phase)

Total: 85 templates available
```

## Document Generation

### Generate Single Document
Generate a specific document by its key.

```bash
# Basic generation
adpa generate project-charter

# With custom output directory
adpa generate project-charter --output ./my-docs

# With specific format
adpa generate project-charter --format json

# With retry configuration
adpa generate project-charter --retries 3 --retry-backoff 1000

# Quiet mode
adpa generate project-charter --quiet
```

**Available Options:**
- `--output` - Output directory (default: ./generated-documents)
- `--format` - Output format: markdown, json, yaml (default: markdown)
- `--quiet` - Suppress output
- `--retries` - Number of retries (default: 0)
- `--retry-backoff` - Initial retry backoff in ms (default: 1000)
- `--retry-max-delay` - Maximum retry delay in ms (default: 30000)

### Generate Category
Generate all documents in a specific category.

```bash
# Generate all PMBOK documents
adpa generate-category pmbok

# Generate all BABOK documents
adpa generate-category babok

# Generate all DMBOK documents
adpa generate-category dmbok

# With retry configuration
adpa generate-category pmbok --retries 2 --retry-backoff 2000
```

**Available Categories:**
- `babok` - Business Analysis Body of Knowledge documents
- `pmbok` - Project Management Body of Knowledge documents
- `dmbok` - Data Management Body of Knowledge documents
- `basic-docs` - Basic project documents
- `planning` - Planning artifacts
- `quality-assurance` - QA documents
- `risk-management` - Risk management documents
- `stakeholder-management` - Stakeholder documents
- `technical-analysis` - Technical analysis documents
- `technical-design` - Technical design documents

### Generate All Documents
Generate all available documents.

```bash
# Generate all documents
adpa generate-all

# With custom output and retry settings
adpa generate-all --output ./complete-docs --retries 3
```

### Generate Core Analysis
Generate essential core analysis documents.

```bash
# Generate core analysis documents
adpa generate-core-analysis

# With custom settings
adpa generate-core-analysis --output ./core-docs --retries 2
```

## Integration Commands

### Confluence Integration

#### Initialize Confluence
```bash
# Initialize Confluence configuration
adpa confluence init
```

#### Test Connection
```bash
# Test Confluence connection
adpa confluence test
```

#### OAuth2 Authentication
```bash
# Start OAuth2 authentication
adpa confluence oauth2 login

# Check authentication status
adpa confluence oauth2 status

# Debug authentication issues
adpa confluence oauth2 debug
```

#### Publish Documents
```bash
# Basic publish
adpa confluence publish

# With specific options
adpa confluence publish \
  --documents-path ./generated-documents \
  --parent-page "Project Documentation" \
  --label-prefix "adpa-" \
  --dry-run

# Force publish (overwrite existing)
adpa confluence publish --force
```

#### Check Status
```bash
# Show Confluence integration status
adpa confluence status
```

### SharePoint Integration

#### Initialize SharePoint
```bash
# Initialize SharePoint configuration
adpa sharepoint init
```

#### Test Connection
```bash
# Test SharePoint connection
adpa sharepoint test
```

#### OAuth2 Authentication
```bash
# Start OAuth2 authentication
adpa sharepoint oauth2 login

# Check authentication status
adpa sharepoint oauth2 status

# Debug authentication issues
adpa sharepoint oauth2 debug
```

#### Publish Documents
```bash
# Basic publish
adpa sharepoint publish

# With specific options
adpa sharepoint publish \
  --documents-path ./generated-documents \
  --folder-path "/sites/project/documents" \
  --label-prefix "adpa-" \
  --dry-run

# Force publish
adpa sharepoint publish --force
```

#### Check Status
```bash
# Show SharePoint integration status
adpa sharepoint status
```

### Version Control System (VCS)

#### Initialize Git Repository
```bash
# Initialize Git repository in output directory
adpa vcs init

# Initialize in custom directory
adpa vcs init --output ./my-docs
```

#### Check Git Status
```bash
# Show Git repository status
adpa vcs status

# Check status in custom directory
adpa vcs status --output ./my-docs
```

#### Commit Changes
```bash
# Commit with default message
adpa vcs commit

# Commit with custom message
adpa vcs commit --message "Add new project documentation"

# Commit in custom directory
adpa vcs commit --output ./my-docs --message "Update documents"
```

#### Push Changes
```bash
# Push to default remote (origin/main)
adpa vcs push

# Push to specific remote and branch
adpa vcs push --remote upstream --branch develop

# Push from custom directory
adpa vcs push --output ./my-docs
```

## Advanced Usage

### Validation

#### Validate Documents
```bash
# Validate all generated documents against PMBOK standards
adpa validate

# Validate with custom output directory
adpa validate --output ./my-docs

# Quiet validation
adpa validate --quiet
```

**Validation Output:**
- `compliance-report.md` - Detailed compliance report
- `prompt-adjustment-report.txt` - Suggestions for prompt improvements

### Batch Operations

#### Generate Multiple Categories
```bash
# Generate multiple categories sequentially
adpa generate-category babok && \
adpa generate-category pmbok && \
adpa generate-category dmbok
```

#### Complete Workflow
```bash
# Complete workflow: setup, generate, validate, commit
adpa setup
adpa generate-all --retries 3
adpa validate
adpa vcs init
adpa vcs commit --message "Initial document generation"
```

### Error Handling and Retries

#### Retry Configuration
```bash
# Configure retry behavior for unreliable networks
adpa generate-all \
  --retries 5 \
  --retry-backoff 2000 \
  --retry-max-delay 60000
```

#### Debug Mode
```bash
# Enable debug mode via environment variable
DEBUG=true adpa generate project-charter
```

## Troubleshooting

### Common Issues

#### 1. API Key Not Found
```bash
# Error: API key not configured
# Solution: Run setup wizard
adpa setup
```

#### 2. Network Timeouts
```bash
# Use retry configuration for network issues
adpa generate-all --retries 3 --retry-backoff 5000
```

#### 3. Permission Errors
```bash
# Error: Permission denied writing to output directory
# Solution: Check directory permissions or use different output
adpa generate project-charter --output ./user-writable-directory
```

#### 4. Git Not Initialized
```bash
# Error: Not a git repository
# Solution: Initialize git repository
adpa vcs init
```

### Diagnostic Commands

#### Check System Status
```bash
# Comprehensive system check
adpa status

# Check specific provider configuration
adpa status --verbose
```

#### Test AI Provider Connection
```bash
# Test by generating a simple document
adpa generate project-summary --quiet
```

#### Validate Environment
```bash
# Check if all required files exist
adpa analyze
```

## Examples

### Example 1: Complete Project Setup
```bash
# 1. Install ADPA globally
npm install -g adpa-enterprise-framework-automation

# 2. Create new project directory
mkdir my-project && cd my-project

# 3. Run setup wizard
adpa setup

# 4. Check status
adpa status

# 5. Generate core documents
adpa generate-core-analysis

# 6. Validate documents
adpa validate

# 7. Initialize git and commit
adpa vcs init
adpa vcs commit --message "Initial project documentation"
```

### Example 2: BABOK Documentation Generation
```bash
# Generate all BABOK documents with retry logic
adpa generate-category babok \
  --output ./babok-docs \
  --retries 3 \
  --retry-backoff 2000

# Validate BABOK compliance
adpa validate --output ./babok-docs

# List what was generated
ls -la ./babok-docs/
```

### Example 3: Enterprise Integration Workflow
```bash
# 1. Generate all documents
adpa generate-all --output ./enterprise-docs

# 2. Validate compliance
adpa validate --output ./enterprise-docs

# 3. Initialize Confluence
adpa confluence init

# 4. Test Confluence connection
adpa confluence test

# 5. Publish to Confluence (dry run first)
adpa confluence publish \
  --documents-path ./enterprise-docs \
  --parent-page "Enterprise Documentation" \
  --dry-run

# 6. Actual publish
adpa confluence publish \
  --documents-path ./enterprise-docs \
  --parent-page "Enterprise Documentation"
```

### Example 4: Multi-Provider Failover Setup
```bash
# Setup primary provider (Google AI)
adpa setup
# Select: google
# Enter: your-google-ai-key

# Test generation
adpa generate project-charter

# If primary fails, setup secondary provider
adpa setup
# Select: azure
# Enter: azure-endpoint and key

# Generate with retry logic
adpa generate-all --retries 5
```

### Example 5: Custom Document Generation
```bash
# List available templates
adpa list-templates

# Generate specific business analysis documents
adpa generate business-analysis-planning-and-monitoring
adpa generate elicitation-and-collaboration
adpa generate requirements-analysis-and-design-definition

# Generate project management documents
adpa generate project-charter
adpa generate project-management-plan
adpa generate work-breakdown-structure

# Generate data management documents
adpa generate data-governance-framework
adpa generate data-quality-management-plan
adpa generate master-data-management-strategy
```

### Example 6: Continuous Integration Setup
```bash
#!/bin/bash
# ci-generate-docs.sh

set -e

echo "🚀 Starting ADPA document generation..."

# Setup (assuming environment variables are set)
adpa status

# Generate all documents with retries
adpa generate-all \
  --output ./generated-docs \
  --retries 3 \
  --retry-backoff 2000 \
  --quiet

# Validate documents
adpa validate \
  --output ./generated-docs \
  --quiet

# Commit if in git repository
if [ -d .git ]; then
  adpa vcs commit \
    --output ./generated-docs \
    --message "CI: Update generated documentation [skip ci]"
fi

echo "✅ Document generation complete!"
```

### Example 7: SharePoint Integration
```bash
# Initialize SharePoint integration
adpa sharepoint init

# Authenticate with OAuth2
adpa sharepoint oauth2 login

# Test connection
adpa sharepoint test

# Generate documents
adpa generate-category pmbok --output ./pmbok-docs

# Publish to SharePoint
adpa sharepoint publish \
  --documents-path ./pmbok-docs \
  --folder-path "/sites/project/Shared Documents/PMBOK" \
  --label-prefix "pmbok-"

# Check status
adpa sharepoint status
```

---

## Command Reference Quick Guide

| Command | Description | Example |
|---------|-------------|---------|
| `adpa setup` | Interactive setup wizard | `adpa setup` |
| `adpa status` | Show system status | `adpa status` |
| `adpa list-templates` | List available templates | `adpa list-templates` |
| `adpa generate [key]` | Generate specific document | `adpa generate project-charter` |
| `adpa generate-category <cat>` | Generate category documents | `adpa generate-category pmbok` |
| `adpa generate-all` | Generate all documents | `adpa generate-all --retries 3` |
| `adpa validate` | Validate documents | `adpa validate` |
| `adpa confluence init` | Setup Confluence | `adpa confluence init` |
| `adpa sharepoint init` | Setup SharePoint | `adpa sharepoint init` |
| `adpa vcs init` | Initialize Git | `adpa vcs init` |

For more detailed information, use `adpa --help` or `adpa <command> --help`.