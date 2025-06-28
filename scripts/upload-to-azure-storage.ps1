# Upload Deployment Script to Azure Storage
# This script uploads your deployment files to Azure Storage for sharing/backup

param(
    [string]$ResourceGroup = "rg-api-center",
    [string]$StorageAccountName = "stgapicenter$(Get-Random -Minimum 1000 -Maximum 9999)",
    [string]$ContainerName = "deployment-scripts",
    [string]$Location = "westeurope",
    [string]$SubscriptionId = "3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6"
)

Write-Host "🚀 Uploading Deployment Files to Azure Storage" -ForegroundColor Green
Write-Host "=" * 60

# Set subscription
az account set --subscription $SubscriptionId

# Create storage account if it doesn't exist
Write-Host "📦 Creating Storage Account: $StorageAccountName" -ForegroundColor Yellow
az storage account create `
    --name $StorageAccountName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --subscription $SubscriptionId

# Get storage account key
Write-Host "🔑 Getting Storage Account Key" -ForegroundColor Yellow
$storageKey = az storage account keys list `
    --resource-group $ResourceGroup `
    --account-name $StorageAccountName `
    --query "[0].value" -o tsv `
    --subscription $SubscriptionId

# Create container
Write-Host "📁 Creating Container: $ContainerName" -ForegroundColor Yellow
az storage container create `
    --name $ContainerName `
    --account-name $StorageAccountName `
    --account-key $storageKey

# Upload deployment script
Write-Host "📤 Uploading PowerShell deployment script" -ForegroundColor Cyan
az storage blob upload `
    --file "scripts/deploy-to-azure-api-center.ps1" `
    --name "deploy-to-azure-api-center.ps1" `
    --container-name $ContainerName `
    --account-name $StorageAccountName `
    --account-key $storageKey

# Upload Bash deployment script
Write-Host "📤 Uploading Bash deployment script" -ForegroundColor Cyan
az storage blob upload `
    --file "scripts/deploy-to-azure-api-center.sh" `
    --name "deploy-to-azure-api-center.sh" `
    --container-name $ContainerName `
    --account-name $StorageAccountName `
    --account-key $storageKey

# Upload OpenAPI specification
Write-Host "📤 Uploading OpenAPI specification" -ForegroundColor Cyan
az storage blob upload `
    --file "api-specs/standards-compliance-openapi.json" `
    --name "standards-compliance-openapi.json" `
    --container-name $ContainerName `
    --account-name $StorageAccountName `
    --account-key $storageKey

# Generate download URLs
Write-Host "🔗 Generating download URLs" -ForegroundColor Green
$psUrl = az storage blob url `
    --name "deploy-to-azure-api-center.ps1" `
    --container-name $ContainerName `
    --account-name $StorageAccountName -o tsv

$bashUrl = az storage blob url `
    --name "deploy-to-azure-api-center.sh" `
    --container-name $ContainerName `
    --account-name $StorageAccountName -o tsv

$apiUrl = az storage blob url `
    --name "standards-compliance-openapi.json" `
    --container-name $ContainerName `
    --account-name $StorageAccountName -o tsv

Write-Host ""
Write-Host "✅ Files uploaded successfully!" -ForegroundColor Green
Write-Host "📋 Download URLs:" -ForegroundColor Cyan
Write-Host "  PowerShell Script: $psUrl" -ForegroundColor White
Write-Host "  Bash Script: $bashUrl" -ForegroundColor White
Write-Host "  OpenAPI Spec: $apiUrl" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access via Azure Portal:" -ForegroundColor Cyan
Write-Host "  Storage Account: https://portal.azure.com/#@/resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/$StorageAccountName" -ForegroundColor Blue
