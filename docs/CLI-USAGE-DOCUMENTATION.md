# ADPA CLI Usage Documentation

> **📚 For comprehensive documentation, see:**
> - [CLI Comprehensive Usage Guide](./CLI-COMPREHENSIVE-USAGE-GUIDE.md) - Complete feature documentation
> - [CLI Visual Workflows](./CLI-VISUAL-WORKFLOWS.md) - Visual workflow diagrams
> - [CLI Quick Reference](./CLI-QUICK-REFERENCE.md) - Quick command reference

## Table of Contents
- [Overview](#overview)
- [Interactive Menu System](#interactive-menu-system)
- [Command Structure](#command-structure)
- [Navigation Guide](#navigation-guide)
- [Integration Commands](#integration-commands)
- [Advanced Features](#advanced-features)
- [Workflows and Examples](#workflows-and-examples)
- [Troubleshooting](#troubleshooting)

## Overview

The ADPA (Advanced Document Processing & Automation) CLI provides both interactive menu-driven interfaces and traditional command-line operations for generating professional documentation following industry standards (BABOK v3, PMBOK 7th Edition, DMBOK 2.0).

### Key Features
- 🎯 **Interactive Provider Selection Menu** - Visual AI provider configuration
- 📋 **Comprehensive Command Set** - 50+ specialized commands
- 🔄 **Integration Ready** - Confluence, SharePoint, Git workflows
- ✅ **Standards Compliance** - Built-in PMBOK validation
- 🤖 **Multi-AI Support** - Google AI, Azure OpenAI, GitHub AI, Ollama

## Interactive Menu System

### AI Provider Selection Menu

The interactive menu is the primary interface for configuring AI providers and is accessed through:

```bash
adpa setup
```

#### Menu Structure

```
🤖 AI Provider Selection Menu

Choose your AI provider for Requirements Gathering Agent:

  1. 🟢 Google AI Studio - Ready (Recommended for beginners)
     └─ Free tier with generous limits, easy setup
     └─ 🔧 Configuration: API Key configured
     └─ 💡 Start with Google AI Studio for free tier

  2. 🟡 Azure OpenAI - Needs Configuration
     └─ Enterprise-grade with advanced features
     └─ 🔧 Configuration: Endpoint and API key required
     └─ ⏱️ Setup time: ~5 minutes

  3. 🟡 GitHub AI - Needs Configuration  
     └─ Integrated with GitHub ecosystem
     └─ 🔧 Configuration: GitHub token required
     └─ ⏱️ Setup time: ~3 minutes

  4. 🔴 Ollama - Not Available
     └─ Local AI processing, privacy-focused
     └─ 🔧 Configuration: Local installation required
     └─ ⏱️ Setup time: ~10 minutes

  5. 🔧 Configure New Provider
  6. 📊 View Provider Status & Metrics
  7. ❓ Help & Documentation
  8. 🚫 Exit Menu
```

#### Menu Navigation

**Provider Selection (1-4)**:
- Select a numbered option to configure that AI provider
- Guided setup with step-by-step configuration
- Automatic connection testing and validation

**Menu Options (5-8)**:
- **Configure New Provider**: Add custom AI provider configurations
- **View Status & Metrics**: Display detailed provider performance data
- **Help & Documentation**: Access contextual help and setup guides
- **Exit Menu**: Return to command line

#### Status Indicators

| Icon | Status | Description |
|------|--------|-------------|
| 🟢 | Ready | Provider configured and tested successfully |
| 🟡 | Needs Configuration | Provider available but requires setup |
| 🔴 | Not Available | Provider not installed or accessible |
| ⚙️ | Configuring | Setup in progress |

### Interactive Setup Wizard

The enhanced setup wizard provides comprehensive environment configuration:

```bash
adpa setup
```

**Wizard Flow**:
1. **Provider Selection** - Choose from available AI providers
2. **Credential Configuration** - Enter API keys and endpoints
3. **Environment Setup** - Create/update .env file
4. **Configuration Files** - Update config-rga.json and processor-config.json
5. **Dependency Installation** - Optional npm install and build
6. **Validation** - Test connections and verify setup

## Command Structure

### Core Commands

#### Document Generation
```bash
# Generate specific document
adpa generate <document-key>

# Generate by category
adpa generate-category <category>

# Generate all documents
adpa generate-all

# Generate core analysis documents
adpa generate-core-analysis
```

#### System Management
```bash
# Show system status and configuration
adpa status [--verbose] [--quiet]

# Interactive setup wizard
adpa setup

# Analyze workspace without generating documents
adpa analyze

# List available document templates
adpa list-templates
```

#### Validation
```bash
# Validate documents against PMBOK standards
adpa validate [--output <dir>] [--quiet]
```

### Integration Commands

#### Confluence Integration
```bash
# Initialize Confluence configuration
adpa confluence init

# OAuth2 authentication flow
adpa confluence oauth2 login
adpa confluence oauth2 status
adpa confluence oauth2 debug

# Test connection
adpa confluence test

# Publish documents
adpa confluence publish [options]

# Check integration status
adpa confluence status
```

#### SharePoint Integration
```bash
# Initialize SharePoint configuration
adpa sharepoint init

# OAuth2 authentication flow
adpa sharepoint oauth2 login
adpa sharepoint oauth2 status
adpa sharepoint oauth2 debug

# Test connection
adpa sharepoint test

# Publish documents
adpa sharepoint publish [options]

# Check integration status
adpa sharepoint status
```

#### Version Control System (VCS)
```bash
# Initialize Git repository
adpa vcs init [--output <dir>]

# Show Git status
adpa vcs status [--output <dir>]

# Commit changes
adpa vcs commit [--message <msg>] [--output <dir>]

# Push to remote
adpa vcs push [--remote <name>] [--branch <name>] [--output <dir>]
```

### Specialized Commands

#### Feedback Management
```bash
# Analyze feedback patterns
adpa feedback analyze [--document-type <type>] [--days <n>]

# Apply feedback improvements
adpa feedback apply --project <id> [--dry-run]

# Generate with feedback enhancement
adpa feedback generate --context <context> [--project <id>]

# Show feedback statistics
adpa feedback stats [--project <id>] [--days <n>]
```

#### Stakeholder Analysis
```bash
# Comprehensive stakeholder analysis
adpa stakeholder analysis [options]

# Generate stakeholder register only
adpa stakeholder register [options]

# Generate engagement plan
adpa stakeholder engagement-plan [options]

# Full automation (all stakeholder documents)
adpa stakeholder automate [options]

# Show help
adpa stakeholder help
```

#### Risk & Compliance Assessment
```bash
# Generate risk and compliance assessment
adpa risk-compliance --project <name> [options]

# Options:
# --type <type>           Project type (SOFTWARE_DEVELOPMENT, INFRASTRUCTURE, etc.)
# --description <desc>    Project description
# --output <dir>          Output directory
# --integrated           Use compliance engine
# --pmbok-only           PMBOK-focused assessment only
# --format <format>      Output format (markdown, json)
```

#### Business Analysis
```bash
# Interview questions generation
adpa business-analysis interview-questions

# Workshop planning
adpa business-analysis workshop-plan

# Requirements extraction
adpa business-analysis requirements-extraction

# Process modeling
adpa business-analysis process-model

# Use case modeling
adpa business-analysis use-case-model

# Business rules analysis
adpa business-analysis business-rules

# Impact analysis
adpa business-analysis impact-analysis

# Quality assessment
adpa business-analysis quality-assessment
```

#### Prompt Management
```bash
# List available prompts
adpa prompts list

# Show specific prompt
adpa prompts show <prompt-name>

# Test prompt with sample data
adpa prompts test <prompt-name>

# Validate prompt structure
adpa prompts validate <prompt-name>
```

## Navigation Guide

### Menu Navigation Patterns

#### Interactive Menus
1. **Numbered Selection**: Enter the number corresponding to your choice
2. **Navigation Keys**: 
   - `Enter` - Confirm selection
   - `0` - Hidden exit option (in most menus)
   - `Ctrl+C` - Force exit
3. **Input Validation**: Invalid choices prompt for re-entry
4. **Context Help**: Most menus include help options

#### Command Line Navigation
1. **Tab Completion**: Use tab to auto-complete commands and options
2. **Help System**: `--help` or `-h` available for all commands
3. **Hierarchical Commands**: Use subcommands for organized functionality
4. **Global Options**: Options like `--quiet` work across commands

### Navigation Flow Examples

#### Setting Up a New Environment
```bash
# 1. Start with setup wizard
adpa setup
  # → Interactive provider selection menu
  # → Credential configuration
  # → Environment validation

# 2. Verify configuration
adpa status --verbose

# 3. Test with simple generation
adpa generate project-charter

# 4. Validate output
adpa validate
```

#### Publishing Workflow
```bash
# 1. Generate documents
adpa generate-all --output ./enterprise-docs

# 2. Initialize version control
adpa vcs init --output ./enterprise-docs

# 3. Commit initial version
adpa vcs commit --message "Initial documentation" --output ./enterprise-docs

# 4. Configure Confluence
adpa confluence init
adpa confluence oauth2 login

# 5. Publish to Confluence
adpa confluence publish --documents-path ./enterprise-docs
```

## Integration Commands

### Confluence Integration

#### Setup Process
1. **Initialize Configuration**
   ```bash
   adpa confluence init
   ```
   - Prompts for Confluence URL
   - Configures space and authentication method

2. **OAuth2 Authentication**
   ```bash
   adpa confluence oauth2 login
   ```
   - Opens browser for OAuth2 flow
   - Stores refresh tokens securely

3. **Test Connection**
   ```bash
   adpa confluence test
   ```
   - Validates authentication
   - Tests API connectivity

#### Publishing Options
```bash
adpa confluence publish \
  --documents-path ./generated-documents \
  --parent-page "Project Documentation" \
  --label-prefix "adpa-generated" \
  --dry-run
```

**Options**:
- `--documents-path`: Source directory for documents
- `--parent-page`: Confluence parent page title
- `--label-prefix`: Metadata label prefix
- `--dry-run`: Preview changes without publishing
- `--force`: Overwrite existing pages

### SharePoint Integration

#### Setup Process
1. **Initialize Configuration**
   ```bash
   adpa sharepoint init
   ```
   - Prompts for SharePoint site URL
   - Configures document library settings

2. **OAuth2 Authentication**
   ```bash
   adpa sharepoint oauth2 login
   ```
   - Microsoft authentication flow
   - Stores access tokens

3. **Test Connection**
   ```bash
   adpa sharepoint test
   ```
   - Validates permissions
   - Tests document upload

#### Publishing Options
```bash
adpa sharepoint publish \
  --documents-path ./generated-documents \
  --folder-path "/Shared Documents/Project Docs" \
  --label-prefix "adpa" \
  --dry-run
```

### Git Integration

#### Repository Management
```bash
# Initialize repository
adpa vcs init --output ./generated-documents

# Check status
adpa vcs status --output ./generated-documents

# Commit changes
adpa vcs commit \
  --message "Update project documentation" \
  --output ./generated-documents

# Push to remote
adpa vcs push \
  --remote origin \
  --branch main \
  --output ./generated-documents
```

## Advanced Features

### Retry and Error Handling

All generation commands support advanced retry mechanisms:

```bash
adpa generate-all \
  --retries 3 \
  --retry-backoff 2000 \
  --retry-max-delay 30000
```

**Options**:
- `--retries`: Number of retry attempts (default: 3)
- `--retry-backoff`: Initial backoff delay in ms (default: 1000)
- `--retry-max-delay`: Maximum backoff delay in ms (default: 30000)

### Output Formats

Multiple output formats are supported:

```bash
# Markdown (default)
adpa generate project-charter --format markdown

# JSON structured output
adpa generate project-charter --format json

# YAML format
adpa generate project-charter --format yaml
```

### Quiet Mode

Suppress output for automation:

```bash
adpa generate-all --quiet
adpa status --quiet
adpa validate --quiet
```

### Verbose Mode

Enhanced debugging information:

```bash
adpa status --verbose
adpa stakeholder analysis --verbose
```

## Workflows and Examples

### Complete Project Setup Workflow

```bash
# 1. Create project directory
mkdir my-enterprise-project
cd my-enterprise-project

# 2. Initialize ADPA
adpa setup
  # → Select Google AI Studio
  # → Enter API key
  # → Confirm configuration

# 3. Verify setup
adpa status --verbose

# 4. Generate core documentation
adpa generate-core-analysis

# 5. Generate full document suite
adpa generate-category pmbok
adpa generate-category babok
adpa generate-category dmbok

# 6. Validate compliance
adpa validate

# 7. Initialize version control
adpa vcs init

# 8. Commit initial documentation
adpa vcs commit --message "Initial project documentation"

# 9. Setup Confluence integration
adpa confluence init
adpa confluence oauth2 login

# 10. Publish to Confluence
adpa confluence publish --parent-page "Enterprise Projects"
```

### Stakeholder Analysis Workflow

```bash
# 1. Generate comprehensive stakeholder analysis
adpa stakeholder analysis \
  --analysis-depth comprehensive \
  --include-register \
  --include-engagement-plan \
  --verbose

# 2. Review generated documents
ls generated-documents/stakeholder-management/

# 3. Generate additional stakeholder documents
adpa stakeholder automate --format json

# 4. Validate stakeholder documentation
adpa validate --output generated-documents/stakeholder-management
```

### Risk and Compliance Assessment Workflow

```bash
# 1. Generate integrated risk assessment
adpa risk-compliance \
  --project "Enterprise CRM Implementation" \
  --type SOFTWARE_DEVELOPMENT \
  --description "Customer relationship management system" \
  --integrated \
  --output ./risk-assessment

# 2. Generate PMBOK-focused assessment
adpa risk-compliance \
  --project "Enterprise CRM Implementation" \
  --pmbok-only \
  --format json \
  --output ./pmbok-risk

# 3. Validate compliance
adpa validate --output ./risk-assessment
```

### Feedback-Driven Improvement Workflow

```bash
# 1. Analyze existing feedback patterns
adpa feedback analyze --days 30

# 2. Generate documents with feedback enhancement
adpa feedback generate \
  --context "Enterprise software project" \
  --project "crm-implementation" \
  --learning

# 3. Apply feedback improvements
adpa feedback apply --project "crm-implementation"

# 4. Monitor improvement statistics
adpa feedback stats --project "crm-implementation" --days 7
```

### Multi-Format Publishing Workflow

```bash
# 1. Generate documents in multiple formats
adpa generate-all --format markdown --output ./docs-md
adpa generate-all --format json --output ./docs-json

# 2. Publish to multiple platforms
adpa confluence publish --documents-path ./docs-md
adpa sharepoint publish --documents-path ./docs-md

# 3. Archive structured data
adpa vcs init --output ./docs-json
adpa vcs commit --message "Structured documentation archive" --output ./docs-json
```

## Troubleshooting

### Common Issues and Solutions

#### Provider Configuration Issues

**Problem**: "API key not found" error
```bash
# Solution: Run setup wizard
adpa setup
# Or check environment variables
adpa status --verbose
```

**Problem**: "Provider not responding" error
```bash
# Solution: Test connection and retry with backoff
adpa status
adpa generate project-charter --retries 5 --retry-backoff 3000
```

#### Authentication Issues

**Problem**: Confluence OAuth2 authentication fails
```bash
# Solution: Debug authentication and re-login
adpa confluence oauth2 debug
adpa confluence oauth2 login
```

**Problem**: SharePoint permission denied
```bash
# Solution: Check authentication status and permissions
adpa sharepoint oauth2 status
adpa sharepoint test
```

#### Generation Issues

**Problem**: Document generation fails
```bash
# Solution: Validate environment and use verbose mode
adpa status --verbose
adpa analyze
adpa generate project-charter --retries 3 --verbose
```

**Problem**: Validation errors
```bash
# Solution: Check output directory and file permissions
adpa validate --verbose
ls -la generated-documents/
```

#### Git Integration Issues

**Problem**: Git not initialized
```bash
# Solution: Initialize repository
adpa vcs init
```

**Problem**: Commit fails
```bash
# Solution: Check Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
adpa vcs commit --message "Documentation update"
```

### Debug Commands

```bash
# System diagnostics
adpa status --verbose

# Workspace analysis
adpa analyze

# Provider testing
adpa confluence test
adpa sharepoint test

# Authentication debugging
adpa confluence oauth2 debug
adpa sharepoint oauth2 debug

# Validation with details
adpa validate --verbose
```

### Performance Optimization

#### Batch Operations
```bash
# Use category generation for efficiency
adpa generate-category pmbok --retries 2

# Generate core documents first
adpa generate-core-analysis
```

#### Retry Configuration
```bash
# Optimize for slow networks
adpa generate-all \
  --retries 5 \
  --retry-backoff 5000 \
  --retry-max-delay 60000
```

#### Quiet Mode for Automation
```bash
# Suppress output in scripts
adpa generate-all --quiet
adpa validate --quiet
```

### Getting Help

#### Command-Specific Help
```bash
adpa --help                    # General help
adpa generate --help          # Generate command help
adpa confluence --help        # Confluence integration help
adpa stakeholder --help       # Stakeholder analysis help
```

#### Interactive Help
```bash
adpa setup                    # Access interactive help in menus
adpa stakeholder help         # Specialized help commands
```

#### Documentation Resources
- **GitHub Repository**: https://github.com/mdresch/requirements-gathering-agent
- **CLI Quick Reference**: `docs/CLI-QUICK-REFERENCE.md`
- **CLI Execution Guide**: `docs/CLI-EXECUTION-GUIDE.md`
- **Implementation Guides**: `generated-documents/implementation-guides/`

---

*This documentation covers the complete CLI usage patterns for ADPA. For specific implementation details, refer to the source code and additional documentation files.*