#!/bin/bash
# Requirements Gathering Agent - Quick Setup for GitHub Codespaces

echo "🚀 Setting up Requirements Gathering Agent..."

# Check if we're in a valid project directory
if [ ! -f "package.json" ] && [ ! -f "README.md" ]; then
    echo "⚠️  Warning: No package.json or README.md found. Make sure you're in your project root directory."
    echo "   The agent will create documentation in the current directory."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install the requirements gathering agent globally
echo "📦 Installing Requirements Gathering Agent globally..."
npm install -g requirements-gathering-agent@1.0.0

if [ $? -eq 0 ]; then
    echo "✅ Installation successful!"
    echo ""
    echo "🔧 Setup Instructions:"
    echo "1. Create a .env.local file with your GitHub token:"
    echo "   GITHUB_TOKEN=your_github_token_here"
    echo "   AZURE_AI_API_KEY=your_github_token_here"
    echo "   AZURE_AI_ENDPOINT=https://models.github.ai/inference"
    echo ""
    echo "2. Get your GitHub token:"
    echo "   - Go to GitHub Settings → Developer settings → Personal access tokens"
    echo "   - Create fine-grained token with 'models:read' permission"
    echo ""
    echo "3. Run the agent:"
    echo "   requirements-gathering-agent"
    echo ""
    echo "📁 The agent will create:"
    echo "   - requirements/ directory (16 requirement documents)"
    echo "   - PMBOK_Documents/ directory (22 project management documents)"
    echo ""
    echo "🎉 Ready to generate comprehensive project documentation!"
else
    echo "❌ Installation failed. Trying alternative method..."
    echo "📥 Downloading and running directly..."
    
    # Alternative: Download and run directly
    curl -L -o requirements-agent.tar.gz "https://github.com/mdresch/requirements-gathering-agent/archive/main.tar.gz"
    tar -xzf requirements-agent.tar.gz
    cd requirements-gathering-agent-main
    npm install
    npm run build
    cd ..
    
    echo "✅ Setup complete! Run with:"
    echo "   node requirements-gathering-agent-main/dist/cli.js"
fi
