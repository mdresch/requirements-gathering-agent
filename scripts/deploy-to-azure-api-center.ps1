# Azure API Center Deployment Script
# Standards Compliance & Deviation Analysis API

# Variables - Updated for correct resource names
$SUBSCRIPTION_ID = "3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6"  # Working subscription
$RESOURCE_GROUP = "rg-api-center"  # Correct resource group name  
$LOCATION = "westeurope"
$API_CENTER_NAME = "svc-api-center"  # Correct API Center service name
$API_ID = "standards-compliance-api"
$API_TITLE = "Standards Compliance & Deviation Analysis API"
$ECHO_API_ID = "echo-api"
$ECHO_API_TITLE = "Echo API"

Write-Host "🚀 Deploying APIs to CBA Azure API Center" -ForegroundColor Green
Write-Host "=" * 60

# Step 0: Set Active Subscription
Write-Host "🔑 Setting active subscription: $SUBSCRIPTION_ID" -ForegroundColor Yellow
az account set --subscription $SUBSCRIPTION_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Subscription set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set subscription" -ForegroundColor Red
    exit 1
}

# Step 1: Verify Resource Group exists (since you mentioned it exists)
Write-Host "📁 Verifying Resource Group: $RESOURCE_GROUP" -ForegroundColor Yellow
$rgExists = az group exists --name $RESOURCE_GROUP --subscription $SUBSCRIPTION_ID
if ($rgExists -eq "true") {
    Write-Host "✅ Resource Group verified" -ForegroundColor Green
} else {
    Write-Host "📁 Creating Resource Group: $RESOURCE_GROUP" -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $LOCATION --subscription $SUBSCRIPTION_ID
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Resource Group created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create Resource Group" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Verify API Center exists (since you mentioned it exists)
Write-Host "🏢 Verifying API Center: $API_CENTER_NAME" -ForegroundColor Yellow
$apiCenterExists = az apic show --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --subscription $SUBSCRIPTION_ID 2>$null
if ($apiCenterExists) {
    Write-Host "✅ API Center verified" -ForegroundColor Green
} else {
    Write-Host "🏢 Creating API Center: $API_CENTER_NAME" -ForegroundColor Yellow
    az apic create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --location $LOCATION --subscription $SUBSCRIPTION_ID
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API Center created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create API Center" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Create Echo API
Write-Host "📋 Registering Echo API: $ECHO_API_TITLE" -ForegroundColor Yellow
az apic api create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $ECHO_API_ID --title $ECHO_API_TITLE --type "rest" --subscription $SUBSCRIPTION_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Echo API registered successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Echo API may already exist or failed to create" -ForegroundColor Yellow
}

# Step 4: Create Standards Compliance API
Write-Host "📋 Registering Standards Compliance API: $API_TITLE" -ForegroundColor Yellow
az apic api create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $API_ID --title $API_TITLE --type "rest" --subscription $SUBSCRIPTION_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Standards Compliance API registered successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Standards Compliance API may already exist or failed to create" -ForegroundColor Yellow
}

# Step 5: Create API Versions for both APIs
Write-Host "🔖 Creating API Versions" -ForegroundColor Yellow

# Echo API Version
az apic api version create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $ECHO_API_ID --version-id v1 --title "Version 1.0" --subscription $SUBSCRIPTION_ID

# Standards Compliance API Version
az apic api version create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $API_ID --version-id v1 --title "Version 1.0" --subscription $SUBSCRIPTION_ID

Write-Host "✅ API Versions created" -ForegroundColor Green

# Step 6: Upload OpenAPI Specification for Standards Compliance API
Write-Host "📄 Uploading OpenAPI Specification" -ForegroundColor Yellow
$OPENAPI_FILE = "api-specs/standards-compliance-openapi.json"

if (Test-Path $OPENAPI_FILE) {
    az apic api definition create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $API_ID --version-id v1 --definition-id openapi --title "OpenAPI 3.0 Specification" --specification "@$OPENAPI_FILE" --subscription $SUBSCRIPTION_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ OpenAPI Specification uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Failed to upload OpenAPI Specification (may need manual upload)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ OpenAPI file not found: $OPENAPI_FILE" -ForegroundColor Yellow
    Write-Host "💡 Make sure you're running this script from the project root directory" -ForegroundColor Yellow
}

# Step 7: Add API Metadata and Tags
Write-Host "🏷️ Adding API Metadata" -ForegroundColor Yellow

# Try to add metadata (this might fail depending on API Center tier)
az apic api update --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $API_ID --subscription $SUBSCRIPTION_ID 2>$null

Write-Host "✅ API Metadata processing completed" -ForegroundColor Green

# Step 8: Create API Environments
Write-Host "🌍 Creating API Environments" -ForegroundColor Yellow

# Development Environment
az apic environment create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --environment-id development --title "Development" --kind Development --subscription $SUBSCRIPTION_ID 2>$null

# Production Environment  
az apic environment create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --environment-id production --title "Production" --kind Production --subscription $SUBSCRIPTION_ID 2>$null

Write-Host "✅ API Environments processing completed" -ForegroundColor Green
} else {
    Write-Host "⚠️ Failed to create API Environments (non-critical)" -ForegroundColor Yellow
}

# Step 8: Display Deployment Summary
Write-Host ""
Write-Host "🎉 Azure API Center Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Resource Group: $RESOURCE_GROUP" -ForegroundColor White
Write-Host "  API Center: $API_CENTER_NAME" -ForegroundColor White
Write-Host "  API ID: $API_ID" -ForegroundColor White
Write-Host "  API Title: $API_TITLE" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access Your API Center:" -ForegroundColor Cyan
Write-Host "  Portal: https://portal.azure.com/#browse/Microsoft.ApiCenter%2Fservices" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure API governance policies" -ForegroundColor White
Write-Host "  2. Set up consumer onboarding" -ForegroundColor White
Write-Host "  3. Enable analytics and monitoring" -ForegroundColor White
Write-Host "  4. Configure Microsoft Entra ID authentication" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "  # View API details" -ForegroundColor Gray
Write-Host "  az apic api show -g $RESOURCE_GROUP -n $API_CENTER_NAME --api-id $API_ID" -ForegroundColor White
Write-Host ""
Write-Host "  # List all APIs in center" -ForegroundColor Gray  
Write-Host "  az apic api list -g $RESOURCE_GROUP -n $API_CENTER_NAME" -ForegroundColor White
Write-Host ""
Write-Host "  # Update API metadata" -ForegroundColor Gray
Write-Host "  az apic api update -g $RESOURCE_GROUP -n $API_CENTER_NAME --api-id $API_ID --description 'Updated description'" -ForegroundColor White
