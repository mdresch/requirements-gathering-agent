# ADPA CLI Quick Reference

## Essential Commands

### Setup & Status
```bash
adpa setup                    # Interactive setup wizard
adpa status                   # Show system status
adpa list-templates          # List available document templates
```

### Document Generation
```bash
adpa generate [key]                    # Generate specific document
adpa generate-category <category>      # Generate category documents  
adpa generate-all                      # Generate all documents
adpa generate-core-analysis           # Generate core analysis docs
```

### Validation
```bash
adpa validate                 # Validate documents against PMBOK
```

## Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `--output` | Output directory | `--output ./my-docs` |
| `--quiet` | Suppress output | `--quiet` |
| `--retries` | Number of retries | `--retries 3` |
| `--retry-backoff` | Retry delay (ms) | `--retry-backoff 2000` |
| `--format` | Output format | `--format json` |

## Document Categories

| Category | Description | Example Command |
|----------|-------------|-----------------|
| `babok` | Business Analysis (BABOK v3) | `adpa generate-category babok` |
| `pmbok` | Project Management (PMBOK 7th) | `adpa generate-category pmbok` |
| `dmbok` | Data Management (DMBOK 2.0) | `adpa generate-category dmbok` |
| `basic-docs` | Basic project documents | `adpa generate-category basic-docs` |
| `planning` | Planning artifacts | `adpa generate-category planning` |
| `quality-assurance` | QA documents | `adpa generate-category quality-assurance` |
| `risk-management` | Risk documents | `adpa generate-category risk-management` |
| `stakeholder-management` | Stakeholder docs | `adpa generate-category stakeholder-management` |
| `technical-analysis` | Technical analysis | `adpa generate-category technical-analysis` |
| `technical-design` | Technical design | `adpa generate-category technical-design` |

## Integration Commands

### Confluence
```bash
adpa confluence init                    # Initialize Confluence
adpa confluence oauth2 login          # Authenticate
adpa confluence test                   # Test connection
adpa confluence publish               # Publish documents
adpa confluence status                # Check status
```

### SharePoint
```bash
adpa sharepoint init                   # Initialize SharePoint
adpa sharepoint oauth2 login         # Authenticate
adpa sharepoint test                  # Test connection
adpa sharepoint publish              # Publish documents
adpa sharepoint status               # Check status
```

### Version Control
```bash
adpa vcs init                         # Initialize Git repo
adpa vcs status                       # Show Git status
adpa vcs commit                       # Commit changes
adpa vcs push                         # Push to remote
```

## Popular Document Keys

### PMBOK Documents
```bash
adpa generate project-charter
adpa generate project-management-plan
adpa generate work-breakdown-structure
adpa generate risk-management-plan
adpa generate stakeholder-register
adpa generate communication-management-plan
adpa generate quality-management-plan
```

### BABOK Documents
```bash
adpa generate business-analysis-planning-and-monitoring
adpa generate elicitation-and-collaboration
adpa generate requirements-analysis-and-design-definition
adpa generate requirements-life-cycle-management
adpa generate solution-evaluation
adpa generate strategy-analysis
```

### DMBOK Documents
```bash
adpa generate data-governance-framework
adpa generate data-quality-management-plan
adpa generate master-data-management-strategy
adpa generate data-architecture-modeling-guide
adpa generate metadata-management-framework
```

## Quick Workflows

### New Project Setup
```bash
mkdir my-project && cd my-project
adpa setup
adpa generate-core-analysis
adpa validate
```

### Generate All PMBOK Documents
```bash
adpa generate-category pmbok --retries 3
adpa validate
```

### Enterprise Documentation
```bash
adpa generate-all --output ./enterprise-docs
adpa validate --output ./enterprise-docs
adpa confluence publish --documents-path ./enterprise-docs
```

### Git Integration
```bash
adpa generate-all
adpa vcs init
adpa vcs commit --message "Initial documentation"
adpa vcs push
```

## Environment Variables

```bash
# Google AI
GOOGLE_AI_API_KEY=your_key
GOOGLE_AI_MODEL=gemini-1.5-flash

# Azure OpenAI  
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_key
DEPLOYMENT_NAME=gpt-4

# GitHub AI
GITHUB_TOKEN=your_token
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini

# Ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama3.1

# General
CURRENT_PROVIDER=google-ai
DEFAULT_OUTPUT_DIR=./generated-documents
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API key not found | Run `adpa setup` |
| Network timeouts | Use `--retries 3 --retry-backoff 5000` |
| Permission errors | Use `--output ./writable-directory` |
| Git not initialized | Run `adpa vcs init` |
| Validation failures | Check output with `adpa status` |

## Help Commands

```bash
adpa --help                   # Show all commands
adpa generate --help         # Show generate command options
adpa confluence --help       # Show confluence commands
adpa sharepoint --help       # Show sharepoint commands
adpa vcs --help              # Show VCS commands
```