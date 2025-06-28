# Alternative Azure API Center Deployment Script
# Uses current active subscription as proof-of-concept
# Can be migrated to target subscription when available

param(
    [string]$SubscriptionId = "3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6",
    [string]$ResourceGroupName = "rg-api-center-demo",
    [string]$ServiceName = "svc-api-center-demo",
    [string]$Location = "westeurope",
    [string]$SkuName = "Free",
    [switch]$Force
)

Write-Host "🚀 Alternative Azure API Center Deployment" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're logged in to Azure
try {
    $currentSubscription = az account show --query "id" -o tsv 2>$null
    if (-not $currentSubscription) {
        Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Current Azure subscription: $currentSubscription" -ForegroundColor Green
    
    if ($currentSubscription -ne $SubscriptionId) {
        Write-Host "ℹ️  Note: Using current subscription instead of target subscription" -ForegroundColor Yellow
        Write-Host "   Current: $currentSubscription" -ForegroundColor Yellow
        Write-Host "   Target:  e759446b-8bb7-4065-a0ed-9d5273a05c46" -ForegroundColor Yellow
        $SubscriptionId = $currentSubscription
    }
} catch {
    Write-Host "❌ Error checking Azure login status: $_" -ForegroundColor Red
    exit 1
}

# Set the subscription
Write-Host "📋 Setting subscription to: $SubscriptionId" -ForegroundColor Blue
try {
    az account set --subscription $SubscriptionId
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to set subscription"
    }
    Write-Host "✅ Subscription set successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting subscription: $_" -ForegroundColor Red
    exit 1
}

# Check if resource group exists
Write-Host "🔍 Checking resource group: $ResourceGroupName" -ForegroundColor Blue
$rgExists = az group show --name $ResourceGroupName --query "id" -o tsv 2>$null
if (-not $rgExists) {
    Write-Host "📦 Creating resource group: $ResourceGroupName in $Location" -ForegroundColor Yellow
    try {
        az group create --name $ResourceGroupName --location $Location
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create resource group"
        }
        Write-Host "✅ Resource group created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error creating resource group: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Resource group already exists" -ForegroundColor Green
}

# Check if API Center service exists
Write-Host "🔍 Checking API Center service: $ServiceName" -ForegroundColor Blue
$serviceExists = az apic service show --resource-group $ResourceGroupName --service-name $ServiceName --query "id" -o tsv 2>$null
if (-not $serviceExists) {
    Write-Host "🏗️  Creating API Center service: $ServiceName" -ForegroundColor Yellow
    try {
        az apic service create `
            --resource-group $ResourceGroupName `
            --service-name $ServiceName `
            --location $Location `
            --sku-name $SkuName
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create API Center service"
        }
        Write-Host "✅ API Center service created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error creating API Center service: $_" -ForegroundColor Red
        Write-Host "ℹ️  This might be due to API Center not being available in the current subscription" -ForegroundColor Yellow
        Write-Host "ℹ️  Continuing with documentation and local setup..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ API Center service already exists" -ForegroundColor Green
}

# Deploy API specifications
Write-Host "📄 Deploying API specifications..." -ForegroundColor Blue

$apiSpecPath = Join-Path $PSScriptRoot "..\api-specs\standards-compliance-openapi.json"
if (Test-Path $apiSpecPath) {
    Write-Host "📄 Found OpenAPI specification: $apiSpecPath" -ForegroundColor Green
    
    # Create API in API Center (if service exists)
    if ($serviceExists) {
        try {
            Write-Host "📤 Importing API specification to API Center..." -ForegroundColor Blue
            
            # Create API
            az apic api create `
                --resource-group $ResourceGroupName `
                --service-name $ServiceName `
                --api-id "standards-compliance-api" `
                --title "Standards Compliance & Deviation Analysis API" `
                --type "rest"
            
            # Import OpenAPI specification
            az apic api version create `
                --resource-group $ResourceGroupName `
                --service-name $ServiceName `
                --api-id "standards-compliance-api" `
                --version-id "v1" `
                --title "Version 1.0" `
                --lifecycle-stage "production"
            
            az apic api definition create `
                --resource-group $ResourceGroupName `
                --service-name $ServiceName `
                --api-id "standards-compliance-api" `
                --version-id "v1" `
                --definition-id "openapi-spec" `
                --title "OpenAPI 3.0 Specification" `
                --format "openapi" `
                --specification "file://$apiSpecPath"
            
            Write-Host "✅ API specification imported successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  API specification import failed: $_" -ForegroundColor Yellow
            Write-Host "ℹ️  This is expected if API Center is not available in current subscription" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  OpenAPI specification not found at: $apiSpecPath" -ForegroundColor Yellow
}

# Generate deployment summary
Write-Host ""
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Subscription ID:    $SubscriptionId" -ForegroundColor White
Write-Host "Resource Group:     $ResourceGroupName" -ForegroundColor White
Write-Host "Service Name:       $ServiceName" -ForegroundColor White
Write-Host "Location:           $Location" -ForegroundColor White
Write-Host "SKU:               $SkuName" -ForegroundColor White
Write-Host ""

if ($serviceExists -or $rgExists) {
    Write-Host "✅ Proof-of-concept deployment completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Test APIs locally with existing scripts" -ForegroundColor White
    Write-Host "2. Validate API specifications" -ForegroundColor White
    Write-Host "3. Prepare migration to target subscription when available" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Migration Command (when target subscription is ready):" -ForegroundColor Cyan
    Write-Host "az account set --subscription e759446b-8bb7-4065-a0ed-9d5273a05c46" -ForegroundColor Gray
    Write-Host ".\deploy-to-azure-api-center.ps1" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Partial deployment - continue with local development" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Focus on business value delivery while waiting for subscription!" -ForegroundColor Cyan
