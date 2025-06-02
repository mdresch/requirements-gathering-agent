# GitHub Codespaces Setup Guide

## Quick Start in Codespaces

### 1. Clone and Setup
```bash
# The repository should already be cloned in Codespaces
cd requirements-gathering-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables
Edit `.env.local` with your GitHub token:

```bash
# Get a fine-grained personal access token from:
# https://github.com/settings/personal-access-tokens/new
# Required scope: models:read

GITHUB_TOKEN=github_pat_YOUR_TOKEN_HERE
AZURE_AI_API_KEY=github_pat_YOUR_TOKEN_HERE
AZURE_AI_ENDPOINT=https://models.github.ai/inference
REQUIREMENTS_AGENT_MODEL=gpt-4o
```

### 3. Build and Test
```bash
# Build the project
npm run build

# Test the CLI
npm start
```

## Integration into Your Project

### Option 1: Copy as Subdirectory
```bash
# In your target project
mkdir tools
cp -r /path/to/requirements-gathering-agent tools/
cd tools/requirements-gathering-agent
npm install
```

### Option 2: Use as NPM Dependency
```bash
# In your target project
npm install /path/to/requirements-gathering-agent
```

Then in your code:
```typescript
import RequirementsAgent from 'requirements-gathering-agent';

const agent = new RequirementsAgent({
  projectName: 'My Project',
  outputDir: './docs'
});

await agent.generatePMBOK();
```

### Option 3: Global CLI Installation
```bash
# Install globally
npm install -g /path/to/requirements-gathering-agent

# Use anywhere
requirements-agent
```

## GitHub Models API Setup

1. Go to https://github.com/settings/personal-access-tokens/new
2. Create a **fine-grained personal access token**
3. Select the scope: `models:read`
4. Copy the token to your `.env.local` file

## Troubleshooting

### Common Issues
- **Token errors**: Ensure your GitHub token has `models:read` scope
- **Build errors**: Run `npm install` and `npm run build`
- **Permission errors**: Check file permissions in Codespaces

### Getting Help
- Check the README.md for detailed documentation
- Review the generated examples in `PMBOK_Documents/` and `requirements/`
- Ensure all environment variables are properly set
