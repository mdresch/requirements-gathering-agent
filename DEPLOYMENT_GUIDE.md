# Requirements Gathering Agent - Deployment Guide

## 🚀 Using the Agent in GitHub Codespaces

### Method 1: NPX (Recommended - No Installation)
```bash
# Navigate to your project in Codespaces
cd /workspaces/your-project-name

# Run the agent directly
npx requirements-gathering-agent@0.0.1
```

### Method 2: Global NPM Install
```bash
# Install globally in Codespaces
npm install -g requirements-gathering-agent

# Run from any project directory
requirements-gathering-agent
```

### Method 3: Clone Repository
```bash
# Clone the agent repository
git clone https://github.com/mdresch/requirements-gathering-agent.git

# Install dependencies and build
cd requirements-gathering-agent
npm install
npm run build

# Go back to your project and run
cd ../your-project
node ../requirements-gathering-agent/dist/cli.js
```

### Method 4: Quick Deploy Script
```bash
# Download and run in one command
curl -o- https://raw.githubusercontent.com/mdresch/requirements-gathering-agent/main/setup.sh | bash
```

## 🔧 Environment Setup

### Required Environment Variables
Create a `.env.local` file in your project with:

```bash
# GitHub fine-grained token with models:read permission
GITHUB_TOKEN=your_github_token_here

# GitHub AI Inference API credentials
AZURE_AI_API_KEY=your_github_token_here
AZURE_AI_ENDPOINT=https://models.github.ai/inference

# Model selection (optional)
REQUIREMENTS_AGENT_MODEL=gpt-4o
```

### Get GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create new token with `models:read` permission
3. Copy token to `.env.local`

## 📁 Output Structure

The agent will create in your project root:

```
your-project/
├── requirements/                    # 16 requirement documents
│   ├── 01_project_context_from_readme.md
│   ├── 02_project_metadata_and_dependencies.md
│   └── [14 more AI-generated files]
│
└── PMBOK_Documents/                 # 22 PMBOK documents
    ├── Initiating/
    │   ├── 01_Project_Charter.md
    │   └── 02_Stakeholder_Register.md
    └── Planning/
        ├── 01_Scope_Management_Plan.md
        └── [19 more planning documents]
```

## 🔄 Usage Examples

### Basic Usage
```bash
# Run in project root
requirements-gathering-agent

# Or with npx
npx requirements-gathering-agent@1.0.0
```

### Programmatic Usage
```javascript
import { RequirementsAgent } from 'requirements-gathering-agent';

const agent = new RequirementsAgent();
await agent.generateProjectDocumentation();
```

## 🛠️ Troubleshooting

### Common Issues
1. **Missing Environment Variables**: Ensure `.env.local` exists with valid GitHub token
2. **Permission Errors**: Make sure GitHub token has `models:read` permission
3. **Build Errors**: Run `npm run build` if using cloned repository

### Support
- Repository: https://github.com/mdresch/requirements-gathering-agent
- Issues: https://github.com/mdresch/requirements-gathering-agent/issues
- Documentation: See README.md for full details

## 📝 Generated Documentation

The agent generates 38 total documents:
- **16 Requirements Documents**: Project analysis, user stories, personas, tech stack
- **22 PMBOK Documents**: Complete project management documentation following PMI standards

All documents are AI-generated based on your project's README.md and package.json files.
