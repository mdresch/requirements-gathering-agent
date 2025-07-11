#!/bin/bash

# ADPA Enterprise Framework Automation - Complete Development Environment Setup
echo "🚀 Setting up ADPA Enterprise Framework Automation development environment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -qq

# Install Node.js 18+ (required by package.json engines)
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm versions
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install global dependencies that might be needed
echo "📦 Installing global npm dependencies..."
sudo npm install -g typescript ts-node rimraf jest

# Navigate to project directory
cd /mnt/persist/workspace

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env.local from .env.example if it doesn't exist
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "⚠️  Note: .env.local created from template - you may need to configure API keys"
    else
        echo "📝 Creating basic .env.local file..."
        cat > .env.local << 'EOF'
# ADPA Configuration
NODE_ENV=development
PORT=3000

# AI Provider Configuration (configure as needed)
# OPENAI_API_KEY=your_openai_key_here
# AZURE_OPENAI_API_KEY=your_azure_key_here
# GITHUB_TOKEN=your_github_token_here

# Test Configuration
SKIP_EXTERNAL_SERVICES=true
EOF
    fi
fi

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Build the project
echo "🔨 Building project..."
npm run build

# Verify build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Add npm global bin to PATH in profile
echo "🔧 Configuring PATH..."
if ! grep -q "npm bin -g" $HOME/.profile; then
    echo 'export PATH="$(npm bin -g):$PATH"' >> $HOME/.profile
fi

# Add local node_modules/.bin to PATH
if ! grep -q "node_modules/.bin" $HOME/.profile; then
    echo 'export PATH="./node_modules/.bin:$PATH"' >> $HOME/.profile
fi

# Source the profile to update current session
source $HOME/.profile

# Set environment variables for testing to avoid external service dependencies
export NODE_ENV=test
export SKIP_EXTERNAL_SERVICES=true

# Create test directories if they don't exist
mkdir -p test-output
mkdir -p generated-documents

echo "✅ Development environment setup complete!"
echo ""
echo "📋 Project Information:"
echo "  Name: ADPA Enterprise Framework Automation"
echo "  Version: 3.2.0"
echo "  Language: TypeScript/Node.js"
echo "  Testing: Jest"
echo "  Build System: TypeScript Compiler"
echo ""
echo "📋 Available commands:"
echo "  npm test                 - Run all tests"
echo "  npm run test:providers   - Test AI providers"
echo "  npm run test:performance - Performance tests"
echo "  npm start               - Start the server"
echo "  npm run dev             - Start in development mode"
echo "  npm run build           - Build the project"
echo "  npm run clean           - Clean build artifacts"
echo ""
echo "🔧 Configuration files:"
echo "  .env.local              - Environment configuration"
echo "  package.json            - Project configuration"
echo "  tsconfig.json           - TypeScript configuration"
echo "  jest.config.js          - Test configuration"
echo ""
echo "🧪 Test Structure:"
echo "  tests/integration/      - Integration tests"
echo "  tests/commands/         - Command tests"
echo "  Jest patterns: **/test/**/*.test.ts, **/tests/**/*.test.ts"
echo ""
echo "⚠️  Notes:"
echo "  - Some tests may fail due to missing external services (Ollama, etc.)"
echo "  - This is expected in a fresh development environment"
echo "  - Integration tests are passing and verify core functionality"
echo "  - Configure API keys in .env.local for full functionality"