#!/bin/bash

# =============================================================================
# ADPA Environment Setup Script
# =============================================================================

echo "🚀 ADPA Environment Setup"
echo "=========================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "📝 Creating .env configuration file..."

# Create .env file with template
cat > .env << 'EOF'
# =============================================================================
# Requirements Gathering Agent - Environment Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# PROVIDER SELECTION
# -----------------------------------------------------------------------------
# Set the active AI provider (required)
CURRENT_PROVIDER=google-ai

# -----------------------------------------------------------------------------
# GOOGLE AI STUDIO CONFIGURATION (Free Tier - Recommended)
# -----------------------------------------------------------------------------
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_ENDPOINT=https://generativelanguage.googleapis.com

# -----------------------------------------------------------------------------
# GITHUB AI CONFIGURATION (Free for GitHub Users)
# -----------------------------------------------------------------------------
# Get your token from: https://github.com/settings/tokens
# GITHUB_TOKEN=your-github-personal-access-token
# GITHUB_ENDPOINT=https://models.github.ai/inference/
# REQUIREMENTS_AGENT_MODEL=gpt-4o-mini

# -----------------------------------------------------------------------------
# AZURE OPENAI CONFIGURATION (Enterprise)
# -----------------------------------------------------------------------------
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_API_KEY=your-azure-openai-api-key
# AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
# AZURE_OPENAI_API_VERSION=2024-02-15-preview

# -----------------------------------------------------------------------------
# AZURE OPENAI WITH ENTRA ID (Enterprise)
# -----------------------------------------------------------------------------
# USE_ENTRA_ID=true
# AZURE_CLIENT_ID=your-client-id
# AZURE_TENANT_ID=your-tenant-id
# AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
# DEPLOYMENT_NAME=your-deployment-name

# -----------------------------------------------------------------------------
# OLLAMA CONFIGURATION (Local)
# -----------------------------------------------------------------------------
# OLLAMA_ENDPOINT=http://localhost:11434/api
# OLLAMA_MODEL=deepseek-coder:latest

# -----------------------------------------------------------------------------
# OUTPUT CONFIGURATION
# -----------------------------------------------------------------------------
OUTPUT_DIR=./generated-documents

# -----------------------------------------------------------------------------
# SYSTEM CONFIGURATION
# -----------------------------------------------------------------------------
DEBUG_MODE=false
AI_MAX_RETRIES=3
AI_TIMEOUT=60000
RATE_LIMIT_RPM=60
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔧 Next Steps:"
echo "1. Edit the .env file and add your API key for your chosen provider"
echo "2. Run 'npm run build' to compile the project"
echo "3. Run 'node dist/cli.js status' to verify your configuration"
echo "4. Run 'node dist/cli.js list-templates' to see available document types"
echo ""
echo "📚 Provider Setup Guides:"
echo "• Google AI Studio: https://makersuite.google.com/app/apikey"
echo "• GitHub AI: https://github.com/settings/tokens"
echo "• Azure OpenAI: https://portal.azure.com/"
echo ""
echo "🎉 Setup complete! Happy documenting!"
EOF

# Make the script executable
chmod +x setup-env.sh

echo "✅ Setup script created successfully!"

