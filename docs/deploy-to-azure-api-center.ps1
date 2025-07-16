# Azure API Center Deployment Script
# Deploy Standards Compliance API and Echo API to Azure API Center

# Variables
$resourceGroup = "rg-api-center"
$apiCenterName = "svc-api-center"
$location = "eastus"
$subscriptionId = "3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6"

Write-Host "🚀 Deploying APIs to Azure API Center: $apiCenterName" -ForegroundColor Green
Write-Host "Resource Group: $resourceGroup" -ForegroundColor Cyan
Write-Host "Location: $location" -ForegroundColor Cyan

# Ensure API Center exists (create if it doesn't)
Write-Host "`n📋 Checking API Center existence..." -ForegroundColor Yellow
try {
    az apic show --name $apiCenterName --resource-group $resourceGroup --subscription $subscriptionId
    Write-Host "✅ API Center already exists" -ForegroundColor Green
} catch {
    Write-Host "📦 Creating API Center..." -ForegroundColor Yellow
    az apic create --name $apiCenterName --resource-group $resourceGroup --location $location --subscription $subscriptionId
    Write-Host "✅ API Center created successfully" -ForegroundColor Green
}

# 1. Create Echo API
Write-Host "`n🔊 Creating Echo API..." -ForegroundColor Yellow
az apic api create `
    --api-id "echo-api" `
    --title "Echo API" `
    --type "rest" `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Echo API created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create Echo API" -ForegroundColor Red
}

# 2. Create Standards Compliance API
Write-Host "`n🎯 Creating Standards Compliance & Deviation Analysis API..." -ForegroundColor Yellow
az apic api create `
    --api-id "standards-compliance-api" `
    --title "Standards Compliance & Deviation Analysis API" `
    --type "rest" `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId `
    --description "Revolutionary API for analyzing projects against international standards (BABOK v3, PMBOK 7th Edition, DMBOK 2.0) with intelligent deviation detection and executive reporting."

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Standards Compliance API created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create Standards Compliance API" -ForegroundColor Red
}

# 3. Create API Version for Standards Compliance API
Write-Host "`n📋 Creating API version..." -ForegroundColor Yellow
az apic api version create `
    --api-id "standards-compliance-api" `
    --version-id "v1" `
    --title "Standards Compliance API v1.0" `
    --lifecycle-stage "production" `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId

# 4. Upload OpenAPI Specification
Write-Host "`n📄 Uploading OpenAPI specification..." -ForegroundColor Yellow
if (Test-Path "api-specs\standards-compliance-openapi.json") {
    az apic api definition create `
        --api-id "standards-compliance-api" `
        --version-id "v1" `
        --definition-id "openapi" `
        --title "Standards Compliance API OpenAPI 3.0" `
        --specification "@api-specs\standards-compliance-openapi.json" `
        --resource-group $resourceGroup `
        --service-name $apiCenterName `
        --subscription $subscriptionId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ OpenAPI specification uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to upload OpenAPI specification" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ OpenAPI specification file not found: api-specs\standards-compliance-openapi.json" -ForegroundColor Yellow
}

# 5. Add API Metadata and Tags
Write-Host "`n🏷️ Adding API metadata..." -ForegroundColor Yellow

# Add tags for better organization
az apic api update `
    --api-id "standards-compliance-api" `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId `
    --custom-properties '{
        "standards": ["BABOK_V3", "PMBOK_7", "DMBOK_2"],
        "category": "Business Analysis",
        "maturity": "Production",
        "owner": "ADPA Team",
        "businessValue": "High",
        "compliance": "Enterprise"
    }'

# 6. Create Environment for API
Write-Host "`n🌍 Creating API environments..." -ForegroundColor Yellow

# Development Environment
az apic environment create `
    --environment-id "development" `
    --title "Development" `
    --type "development" `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId `
    --server '{"type": "development", "title": "Development Server"}'

# Production Environment  
az apic environment create `
    --environment-id "production" `
    --title "Production" `
    --type "production" `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId `
    --server '{"type": "production", "title": "Production Server"}'

# 7. Create API Deployment
Write-Host "`n🚀 Creating API deployment..." -ForegroundColor Yellow
az apic api deployment create `
    --api-id "standards-compliance-api" `
    --deployment-id "prod-deployment" `
    --title "Production Deployment" `
    --environment-id "production" `
    --server '{"runtimeUri": ["https://api.adpa.io/v1"]}' `
    --resource-group $resourceGroup `
    --service-name $apiCenterName `
    --subscription $subscriptionId

# 8. Display Results
Write-Host "`n📊 Deployment Summary:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Write-Host "🔊 Echo API: " -NoNewline -ForegroundColor Cyan
Write-Host "https://portal.azure.com/#view/Microsoft_Azure_ApiCenter/ApiCenterBlade/~/apis/apiId/echo-api" -ForegroundColor White

Write-Host "🎯 Standards Compliance API: " -NoNewline -ForegroundColor Cyan  
Write-Host "https://portal.azure.com/#view/Microsoft_Azure_ApiCenter/ApiCenterBlade/~/apis/apiId/standards-compliance-api" -ForegroundColor White

Write-Host "📋 API Center Portal: " -NoNewline -ForegroundColor Cyan
Write-Host "https://portal.azure.com/#view/Microsoft_Azure_ApiCenter/ApiCenterBlade" -ForegroundColor White

Write-Host "`n✨ Next Steps:" -ForegroundColor Green
Write-Host "1. Configure API policies and governance rules" -ForegroundColor White
Write-Host "2. Set up consumer access and permissions" -ForegroundColor White  
Write-Host "3. Enable monitoring and analytics" -ForegroundColor White
Write-Host "4. Configure Dev Proxy for testing" -ForegroundColor White
Write-Host "5. Import Postman collection for testing" -ForegroundColor White

Write-Host "`n🎉 Azure API Center deployment completed successfully!" -ForegroundColor Green
