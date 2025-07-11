#!/bin/bash

# Adobe Real API Integration - Azure Infrastructure Setup
# This script creates the necessary Azure resources for production Adobe integration

set -e

echo "🚀 Adobe Real API Integration - Azure Setup"
echo "============================================="

# Configuration
RESOURCE_GROUP_NAME="rg-adpa-adobe-integration"
LOCATION="eastus"
APP_NAME="adpa-adobe"
KEY_VAULT_NAME="kv-adpa-adobe-$(date +%s)"
CONTAINER_REGISTRY_NAME="cradpaadobe$(date +%s)"
LOG_WORKSPACE_NAME="log-adpa-adobe"
APP_INSIGHTS_NAME="ai-adpa-adobe"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP_NAME"
echo "  Location: $LOCATION"
echo "  Key Vault: $KEY_VAULT_NAME"
echo "  Container Registry: $CONTAINER_REGISTRY_NAME"
echo ""

# Check if Azure CLI is logged in
if ! az account show &> /dev/null; then
    echo "❌ Please log in to Azure CLI first: az login"
    exit 1
fi

# Get current subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)
echo "✅ Using subscription: $SUBSCRIPTION_ID"

# Create resource group
echo "📦 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP_NAME \
    --location $LOCATION \
    --output table

# Create Log Analytics workspace
echo "📊 Creating Log Analytics workspace..."
az monitor log-analytics workspace create \
    --resource-group $RESOURCE_GROUP_NAME \
    --workspace-name $LOG_WORKSPACE_NAME \
    --location $LOCATION \
    --output table

# Get Log Analytics workspace ID
LOG_WORKSPACE_ID=$(az monitor log-analytics workspace show \
    --resource-group $RESOURCE_GROUP_NAME \
    --workspace-name $LOG_WORKSPACE_NAME \
    --query id -o tsv)

# Create Application Insights
echo "📈 Creating Application Insights..."
az monitor app-insights component create \
    --app $APP_INSIGHTS_NAME \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP_NAME \
    --workspace $LOG_WORKSPACE_ID \
    --output table

# Create Key Vault
echo "🔐 Creating Azure Key Vault..."
az keyvault create \
    --name $KEY_VAULT_NAME \
    --resource-group $RESOURCE_GROUP_NAME \
    --location $LOCATION \
    --enable-rbac-authorization \
    --sku standard \
    --output table

# Create Container Registry
echo "📦 Creating Container Registry..."
az acr create \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $CONTAINER_REGISTRY_NAME \
    --sku Basic \
    --admin-enabled true \
    --output table

# Create Container Apps Environment
echo "🏗️  Creating Container Apps Environment..."
CONTAINER_ENV_NAME="env-adpa-adobe"
az containerapp env create \
    --name $CONTAINER_ENV_NAME \
    --resource-group $RESOURCE_GROUP_NAME \
    --location $LOCATION \
    --logs-workspace-id $LOG_WORKSPACE_ID \
    --output table

# Get current user object ID for Key Vault permissions
USER_OBJECT_ID=$(az ad signed-in-user show --query id -o tsv)

# Assign Key Vault permissions to current user
echo "🔑 Assigning Key Vault permissions..."
az role assignment create \
    --role "Key Vault Secrets Officer" \
    --assignee $USER_OBJECT_ID \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME"

# Wait a moment for permissions to propagate
echo "⏳ Waiting for permissions to propagate..."
sleep 10

# Create placeholder secrets (to be updated with real Adobe credentials)
echo "🔐 Creating placeholder secrets in Key Vault..."
az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "adobe-client-id" \
    --value "YOUR_ADOBE_CLIENT_ID_HERE" \
    --output none

az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "adobe-client-secret" \
    --value "YOUR_ADOBE_CLIENT_SECRET_HERE" \
    --output none

az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "adobe-org-id" \
    --value "YOUR_ADOBE_ORG_ID_HERE" \
    --output none

az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "adobe-account-id" \
    --value "YOUR_ADOBE_ACCOUNT_ID_HERE" \
    --output none

az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "adobe-private-key" \
    --value "YOUR_ADOBE_PRIVATE_KEY_HERE" \
    --output none

# Get Application Insights connection string
AI_CONNECTION_STRING=$(az monitor app-insights component show \
    --app $APP_INSIGHTS_NAME \
    --resource-group $RESOURCE_GROUP_NAME \
    --query connectionString -o tsv)

# Create environment configuration file
echo "📝 Creating environment configuration..."
cat > .env.azure.production << EOF
# Azure Adobe Integration - Production Configuration
# Generated on $(date)

# Azure Resources
AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
AZURE_TENANT_ID=$TENANT_ID
AZURE_RESOURCE_GROUP=$RESOURCE_GROUP_NAME
AZURE_KEY_VAULT_URL=https://$KEY_VAULT_NAME.vault.azure.net/
AZURE_CONTAINER_REGISTRY=$CONTAINER_REGISTRY_NAME.azurecr.io

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=$AI_CONNECTION_STRING

# Adobe Configuration (will use Key Vault values)
ADOBE_ENVIRONMENT=production
ADOBE_PDF_SERVICES_BASE_URL=https://pdf-services.adobe.io
ADOBE_IMS_BASE_URL=https://ims-na1.adobelogin.com
ADOBE_MAX_RETRIES=3
ADOBE_TIMEOUT_MS=30000
ADOBE_ENABLE_LOGGING=true

# Container Apps
CONTAINER_ENV_NAME=$CONTAINER_ENV_NAME
EOF

# Output summary
echo ""
echo "✅ Azure infrastructure setup completed successfully!"
echo "============================================="
echo ""
echo "📋 Created Resources:"
echo "  ✅ Resource Group: $RESOURCE_GROUP_NAME"
echo "  ✅ Key Vault: $KEY_VAULT_NAME"
echo "  ✅ Container Registry: $CONTAINER_REGISTRY_NAME"
echo "  ✅ Log Analytics: $LOG_WORKSPACE_NAME"
echo "  ✅ Application Insights: $APP_INSIGHTS_NAME"
echo "  ✅ Container Apps Environment: $CONTAINER_ENV_NAME"
echo ""
echo "🔑 Key Vault URL: https://$KEY_VAULT_NAME.vault.azure.net/"
echo "📦 Container Registry: $CONTAINER_REGISTRY_NAME.azurecr.io"
echo "📊 Application Insights: $AI_CONNECTION_STRING"
echo ""
echo "🚨 IMPORTANT NEXT STEPS:"
echo "1. Update Key Vault secrets with your real Adobe credentials:"
echo "   az keyvault secret set --vault-name $KEY_VAULT_NAME --name adobe-client-id --value 'YOUR_REAL_CLIENT_ID'"
echo "   az keyvault secret set --vault-name $KEY_VAULT_NAME --name adobe-client-secret --value 'YOUR_REAL_CLIENT_SECRET'"
echo "   az keyvault secret set --vault-name $KEY_VAULT_NAME --name adobe-org-id --value 'YOUR_REAL_ORG_ID'"
echo "   az keyvault secret set --vault-name $KEY_VAULT_NAME --name adobe-account-id --value 'YOUR_REAL_ACCOUNT_ID'"
echo "   az keyvault secret set --vault-name $KEY_VAULT_NAME --name adobe-private-key --value 'YOUR_REAL_PRIVATE_KEY'"
echo ""
echo "2. Build and deploy your application:"
echo "   npm run build:production"
echo "   npm run deploy:azure"
echo ""
echo "📄 Environment configuration saved to: .env.azure.production"
echo ""
echo "🎉 Ready for Adobe API integration!"
