# Setup script for Requirements Gathering Agent
Write-Host "🚀 Setting up Requirements Gathering Agent..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Copy environment template if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating environment template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "⚠️  Please edit .env.local with your GitHub token!" -ForegroundColor Yellow
    Write-Host "   Get token from: https://github.com/settings/personal-access-tokens/new" -ForegroundColor Cyan
    Write-Host "   Required scope: models:read" -ForegroundColor Cyan
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Edit .env.local with your GitHub token" -ForegroundColor White
    Write-Host "2. Run 'npm start' to generate PMBOK documents" -ForegroundColor White
    Write-Host "3. Check README.md for detailed usage instructions" -ForegroundColor White
} else {
    Write-Host "❌ Build failed. Please check for errors." -ForegroundColor Red
}
