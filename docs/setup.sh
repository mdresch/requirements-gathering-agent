#!/bin/bash
# Setup script for Requirements Gathering Agent in GitHub Codespaces

echo "🚀 Setting up Requirements Gathering Agent..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment template if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your GitHub token!"
    echo "   Get token from: https://github.com/settings/personal-access-tokens/new"
    echo "   Required scope: models:read"
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your GitHub token"
    echo "2. Run 'npm start' to generate PMBOK documents"
    echo "3. Check README.md for detailed usage instructions"
else
    echo "❌ Build failed. Please check for errors."
fi
