# Requirements Gathering Agent

[![npm version](https://badge.fury.io/js/requirements-gathering-agent.svg)](https://badge.fury.io/js/requirements-gathering-agent)
[![npm downloads](https://img.shields.io/npm/dm/requirements-gathering-agent.svg)](https://www.npmjs.com/package/requirements-gathering-agent)
[![license](https://img.shields.io/npm/l/requirements-gathering-agent.svg)](https://github.com/your-username/requirements-gathering-agent/blob/main/LICENSE)

🚀 **AI-powered PMBOK documentation generator using Azure OpenAI**

Transform your project's README into comprehensive project management documentation following PMBOK (Project Management Body of Knowledge) standards.

## Features

✅ **Complete PMBOK Document Suite** - Generates 28 professional documents  
✅ **Azure OpenAI Integration** - Powered by GPT-4 with Entra ID authentication  
✅ **Organized Output** - Professional categorized directory structure  
✅ **Multiple AI Providers** - Azure OpenAI, GitHub AI, Ollama support  
✅ **Enterprise Ready** - Robust error handling and retry logic  
✅ **TypeScript** - Modern, type-safe implementation  

## Quick Start

### Installation

```bash
# Install globally
npm install -g requirements-gathering-agent

# Or run directly with npx
npx requirements-gathering-agent
```

### Basic Usage

```bash
# Generate all PMBOK documents
requirements-gathering-agent

# Generate core documents only
requirements-gathering-agent --core-only

# Generate with retry logic
requirements-gathering-agent --with-retry
```

## Configuration

Create a `.env` file with your AI provider configuration:

### Google AI Studio (Free Tier Available)
```bash
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_MODEL=gemini-1.5-flash
```
Get your API key: https://makersuite.google.com/app/apikey

### Azure OpenAI (Recommended)
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
DEPLOYMENT_NAME=gpt-4.1-mini
USE_ENTRA_ID=true
```

### GitHub AI (Free Tier)
```bash
AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com
GITHUB_TOKEN=your-github-token
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini
```

### Ollama (Local)
```bash
AZURE_AI_ENDPOINT=http://localhost:11434
REQUIREMENTS_AGENT_MODEL=llama3.1
```

## Generated Documents

The tool generates a comprehensive set of PMBOK-compliant documents organized in categories:

### 📋 Core Analysis
- Project Summary and Goals
- User Stories and Requirements  
- User Personas
- Key Roles and Needs Analysis

### 📜 Project Charter
- PMBOK Project Charter

### 📊 Management Plans
- Scope Management Plan
- Risk Management Plan
- Cost Management Plan
- Quality Management Plan
- Resource Management Plan
- Communication Management Plan
- Procurement Management Plan

### 🏗️ Planning Artifacts
- Work Breakdown Structure (WBS)
- WBS Dictionary
- Activity List and Estimates
- Schedule Network Diagram
- Milestone List

### 👥 Stakeholder Management
- Stakeholder Register
- Stakeholder Engagement Plan

### ⚙️ Technical Analysis
- Technology Stack Analysis
- Data Model Suggestions
- Risk Analysis
- Acceptance Criteria
- Compliance Considerations
- UI/UX Considerations

## Output Structure

```
generated-documents/
├── README.md                     # Master index
├── core-analysis/               # Business requirements
├── project-charter/             # Formal authorization
├── management-plans/            # PMBOK management plans
├── planning-artifacts/          # Detailed planning
├── stakeholder-management/      # Stakeholder analysis
└── technical-analysis/          # Technology recommendations
```

## Command Line Options

```bash
requirements-gathering-agent [options]

Options:
  -h, --help              Show help
  -v, --version           Show version
  --core-only             Generate core documents only
  --management-plans      Generate management plans only
  --planning-artifacts    Generate planning artifacts only
  --technical-analysis    Generate technical analysis only
  --with-retry            Enable retry logic for failed documents
```

## Authentication

### Google AI Studio
Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Azure OpenAI with Entra ID
```bash
az login
```

### Azure OpenAI with API Key
Set `AZURE_AI_API_KEY` in your `.env` file

### GitHub AI
Get your token from [GitHub Settings](https://github.com/settings/tokens)

### Ollama
```bash
ollama serve
```

## Development

```bash
# Clone repository
git clone https://github.com/mdresch/requirements-gathering-agent.git
cd requirements-gathering-agent

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
```

## Requirements

- Node.js 18.0.0 or higher
- Azure OpenAI resource (recommended) or alternative AI provider
- Azure CLI (for Entra ID authentication)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 📖 [Documentation](https://github.com/mdresch/requirements-gathering-agent)
- 🐛 [Issues](https://github.com/mdresch/requirements-gathering-agent/issues)
- 💬 [Discussions](https://github.com/mdresch/requirements-gathering-agent/discussions)

---

**Built with ❤️ by [Menno Drescher] (https://exceptional-cba-project.webflow.io/) using Azure OpenAI**
