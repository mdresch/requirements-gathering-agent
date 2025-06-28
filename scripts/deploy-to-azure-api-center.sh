#!/bin/bash

# Azure API Center Deployment Script (Bash)
# Standards Compliance & Deviation Analysis API

# Variables
RESOURCE_GROUP="rg-api-center"
LOCATION="westeurope"
API_CENTER_NAME="svc-api-center"
API_ID="standards-compliance-api"
API_TITLE="Standards Compliance & Deviation Analysis API"

echo "🚀 Deploying Standards Compliance API to Azure API Center"
echo "============================================================"

# Step 0: API Center Plugin & Multi-Tenant Authentication
echo "🔐 Azure API Center Plugin & Multi-Tenant Authentication"
echo "========================================================="

# Check if API Center extension is installed
echo "� Checking Azure API Center extension..."
APIC_EXTENSION=$(az extension list --query "[?name=='apic'].name" -o tsv 2>/dev/null)

if [ -z "$APIC_EXTENSION" ]; then
    echo "❌ Azure API Center extension not found"
    echo "📦 Installing Azure API Center extension..."
    az extension add --name apic --yes
    
    if [ $? -eq 0 ]; then
        echo "✅ Azure API Center extension installed successfully"
    else
        echo "❌ Failed to install API Center extension"
        echo "💡 You can install manually: az extension add --name apic"
        exit 1
    fi
else
    echo "✅ Azure API Center extension is installed"
    # Check for updates
    echo "🔄 Checking for extension updates..."
    az extension update --name apic 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Extension updated to latest version"
    fi
fi

# Check current authentication status
echo ""
echo "🔍 Checking current Azure authentication..."
CURRENT_USER=$(az account show --query "user.name" -o tsv 2>/dev/null)

if [ -z "$CURRENT_USER" ]; then
    echo "❌ Not authenticated to Azure"
    echo "💡 Please run: az login"
    exit 1
else
    echo "✅ Authenticated as: $CURRENT_USER"
fi

# Display available tenants
echo ""
echo "📋 Available Tenants:"
echo "--------------------"
az account tenant list --query "[].{Name:displayName, TenantId:tenantId, Domain:defaultDomain}" -o table

echo ""
echo "🏢 Current Tenant Information:"
CURRENT_TENANT=$(az account show --query "tenantId" -o tsv)
CURRENT_TENANT_NAME=$(az account show --query "user.type" -o tsv)
echo "  Tenant ID: $CURRENT_TENANT"
echo "  User Type: $CURRENT_TENANT_NAME"

# Prompt for tenant selection if multiple tenants available
TENANT_COUNT=$(az account tenant list --query "length(@)" -o tsv)
if [ "$TENANT_COUNT" -gt 1 ]; then
    echo ""
    echo "🔄 Multiple tenants detected. Current tenant: $CURRENT_TENANT"
    read -p "❓ Do you want to switch to a different tenant? (y/n): " SWITCH_TENANT
    
    if [ "$SWITCH_TENANT" = "y" ] || [ "$SWITCH_TENANT" = "Y" ]; then
        echo "📋 Available Tenants:"
        az account tenant list --query "[].{Name:displayName, TenantId:tenantId}" -o table
        echo ""
        read -p "🎯 Enter the Tenant ID you want to use: " TARGET_TENANT
        
        echo "🔄 Switching to tenant: $TARGET_TENANT"
        az login --tenant "$TARGET_TENANT"
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully switched to tenant: $TARGET_TENANT"
        else
            echo "❌ Failed to switch tenant"
            exit 1
        fi
    fi
fi

# Display and select subscription
echo ""
echo "💳 Subscription Selection:"
echo "-------------------------"
az account list --query "[].{Name:name, SubscriptionId:id, State:state, TenantId:tenantId}" -o table

# Check if we have multiple subscriptions
SUBSCRIPTION_COUNT=$(az account list --query "length(@)" -o tsv)
if [ "$SUBSCRIPTION_COUNT" -gt 1 ]; then
    echo ""
    CURRENT_SUBSCRIPTION=$(az account show --query "id" -o tsv)
    echo "🔄 Current subscription: $CURRENT_SUBSCRIPTION"
    read -p "❓ Do you want to use a different subscription? (y/n): " SWITCH_SUBSCRIPTION
    
    if [ "$SWITCH_SUBSCRIPTION" = "y" ] || [ "$SWITCH_SUBSCRIPTION" = "Y" ]; then
        read -p "🎯 Enter the Subscription ID you want to use: " TARGET_SUBSCRIPTION
        
        echo "🔄 Setting active subscription: $TARGET_SUBSCRIPTION"
        az account set --subscription "$TARGET_SUBSCRIPTION"
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully set subscription: $TARGET_SUBSCRIPTION"
        else
            echo "❌ Failed to set subscription"
            exit 1
        fi
    fi
fi

# Final verification
echo ""
echo "✅ Final Authentication Status:"
echo "------------------------------"
FINAL_USER=$(az account show --query "user.name" -o tsv)
FINAL_SUBSCRIPTION=$(az account show --query "name" -o tsv)
FINAL_SUBSCRIPTION_ID=$(az account show --query "id" -o tsv)
FINAL_TENANT=$(az account show --query "tenantId" -o tsv)

echo "  User: $FINAL_USER"
echo "  Subscription: $FINAL_SUBSCRIPTION"
echo "  Subscription ID: $FINAL_SUBSCRIPTION_ID"
echo "  Tenant ID: $FINAL_TENANT"

echo ""
echo "🚀 Proceeding with API Center deployment..."
echo "============================================"

# API Center Plugin Features
echo "🔌 Leveraging API Center Plugin Features"
echo "----------------------------------------"

# List existing API Centers across all accessible subscriptions
echo "📋 Scanning for existing API Centers across tenants..."
EXISTING_CENTERS=$(az apic service list --query "[].{Name:name, ResourceGroup:resourceGroup, Subscription:subscription, Location:location}" -o table 2>/dev/null)

if [ $? -eq 0 ] && [ ! -z "$EXISTING_CENTERS" ]; then
    echo "✅ Found existing API Centers:"
    echo "$EXISTING_CENTERS"
    echo ""
    read -p "❓ Do you want to use an existing API Center instead of creating new? (y/n): " USE_EXISTING
    
    if [ "$USE_EXISTING" = "y" ] || [ "$USE_EXISTING" = "Y" ]; then
        read -p "🎯 Enter the API Center name to use: " EXISTING_API_CENTER_NAME
        read -p "🎯 Enter the Resource Group name: " EXISTING_RESOURCE_GROUP
        
        # Verify the existing API Center
        VERIFY_CENTER=$(az apic service show --name "$EXISTING_API_CENTER_NAME" --resource-group "$EXISTING_RESOURCE_GROUP" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "✅ Using existing API Center: $EXISTING_API_CENTER_NAME"
            API_CENTER_NAME="$EXISTING_API_CENTER_NAME"
            RESOURCE_GROUP="$EXISTING_RESOURCE_GROUP"
            SKIP_CREATION=true
        else
            echo "❌ Could not access the specified API Center"
            echo "💡 Continuing with new API Center creation..."
            SKIP_CREATION=false
        fi
    else
        SKIP_CREATION=false
    fi
else
    echo "ℹ️ No existing API Centers found or accessible"
    SKIP_CREATION=false
fi

# Step 1: Verify Resource Group (with subscription context)
echo "📁 Checking Resource Group: $RESOURCE_GROUP"
echo "   Subscription: $FINAL_SUBSCRIPTION_ID"
echo "   Location: $LOCATION"

if [ "$SKIP_CREATION" = "true" ]; then
    echo "✅ Using existing Resource Group (from existing API Center)"
    RG_LOCATION=$(az group show --name $RESOURCE_GROUP --query "location" -o tsv)
    echo "   Current location: $RG_LOCATION"
    LOCATION="$RG_LOCATION"  # Use the existing location
else
    # Check if resource group already exists
    RG_EXISTS=$(az group exists --name $RESOURCE_GROUP)
    if [ "$RG_EXISTS" = "true" ]; then
        echo "✅ Resource Group '$RESOURCE_GROUP' already exists"
        # Verify it's in the correct location
        RG_LOCATION=$(az group show --name $RESOURCE_GROUP --query "location" -o tsv)
        echo "   Current location: $RG_LOCATION"
        if [ "$RG_LOCATION" != "$LOCATION" ]; then
            echo "⚠️  Resource Group is in different location ($RG_LOCATION vs $LOCATION)"
            read -p "❓ Continue anyway? (y/n): " CONTINUE_ANYWAY
            if [ "$CONTINUE_ANYWAY" != "y" ] && [ "$CONTINUE_ANYWAY" != "Y" ]; then
                echo "❌ Deployment cancelled by user"
                exit 1
            fi
        fi
    else
        echo "📁 Creating Resource Group: $RESOURCE_GROUP"
        az group create --name $RESOURCE_GROUP --location $LOCATION
        
        if [ $? -eq 0 ]; then
            echo "✅ Resource Group created successfully"
        else
            echo "❌ Failed to create Resource Group"
            echo "💡 Check permissions for subscription: $FINAL_SUBSCRIPTION_ID"
            exit 1
        fi
    fi
fi

# Step 2: Verify/Create API Center Instance
echo "🏢 Checking API Center: $API_CENTER_NAME"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Subscription: $FINAL_SUBSCRIPTION_ID"

if [ "$SKIP_CREATION" = "true" ]; then
    echo "✅ Using existing API Center '$API_CENTER_NAME'"
    # Show API Center details using plugin features
    echo "📋 API Center Details:"
    az apic service show --name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --query "{Name:name, Location:location, ResourceGroup:resourceGroup, Sku:sku.name}" -o table
else
    # Check if API Center already exists
    APIC_EXISTS=$(az apic service show --name $API_CENTER_NAME --resource-group $RESOURCE_GROUP 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ API Center '$API_CENTER_NAME' already exists"
        # Show API Center details
        echo "📋 API Center Details:"
        az apic service show --name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --query "{Name:name, Location:location, ResourceGroup:resourceGroup, Sku:sku.name}" -o table
    else
        echo "🏢 Creating API Center: $API_CENTER_NAME"
        az apic service create --name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --location $LOCATION
        
        if [ $? -eq 0 ]; then
            echo "✅ API Center created successfully"
            echo "📋 New API Center Details:"
            az apic service show --name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --query "{Name:name, Location:location, ResourceGroup:resourceGroup, Sku:sku.name}" -o table
        else
            echo "❌ Failed to create API Center"
            echo "💡 Possible issues:"
            echo "   - Insufficient permissions in subscription: $FINAL_SUBSCRIPTION_ID"
            echo "   - API Center service not available in region: $LOCATION"
            echo "   - Name '$API_CENTER_NAME' may be taken"
            exit 1
        fi
    fi
fi

# Step 3: Create/Update API in Catalog (Using API Center Plugin)
echo "📋 Registering API: $API_TITLE"
echo "   API ID: $API_ID"
echo "   API Center: $API_CENTER_NAME"

# Check if API already exists
EXISTING_API=$(az apic api show --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ API '$API_ID' already exists"
    echo "📋 Existing API Details:"
    az apic api show --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --query "{Title:title, Type:kind, ApiId:name}" -o table
    
    read -p "❓ Do you want to update the existing API? (y/n): " UPDATE_API
    if [ "$UPDATE_API" = "y" ] || [ "$UPDATE_API" = "Y" ]; then
        echo "🔄 Updating existing API..."
        az apic api update --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --title "$API_TITLE"
        if [ $? -eq 0 ]; then
            echo "✅ API updated successfully"
        else
            echo "⚠️ Failed to update API (continuing with existing)"
        fi
    fi
else
    echo "🆕 Creating new API..."
    az apic api create --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --title "$API_TITLE" --type REST
    
    if [ $? -eq 0 ]; then
        echo "✅ API registered successfully"
        echo "📋 New API Details:"
        az apic api show --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --query "{Title:title, Type:kind, ApiId:name}" -o table
    else
        echo "❌ Failed to register API"
        echo "💡 Possible issues:"
        echo "   - API ID '$API_ID' may already exist"
        echo "   - Insufficient permissions"
        echo "   - API Center may not be properly configured"
        exit 1
    fi
fi

# Step 4: Create API Version with Enhanced Plugin Features
echo "🔖 Creating API Version: v1.0"
echo "   API: $API_ID"
echo "   Version: v1.0"

# Check if version already exists
EXISTING_VERSION=$(az apic api version show --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --version-id v1 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ API Version 'v1' already exists"
    echo "📋 Existing Version Details:"
    az apic api version show --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --version-id v1 --query "{Title:title, State:lifecycleStage, VersionId:name}" -o table
else
    echo "🆕 Creating new API version..."
    az apic api version create --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --version-id v1 --title "Version 1.0 - Production"
    
    if [ $? -eq 0 ]; then
        echo "✅ API Version created successfully"
        echo "📋 New Version Details:"
        az apic api version show --service-name $API_CENTER_NAME --resource-group $RESOURCE_GROUP --api-id $API_ID --version-id v1 --query "{Title:title, State:lifecycleStage, VersionId:name}" -o table
    else
        echo "❌ Failed to create API Version"
        exit 1
    fi
fi

# Step 5: Upload OpenAPI Specification
echo "📄 Uploading OpenAPI Specification"
OPENAPI_FILE="api-specs/standards-compliance-openapi.json"

if [ -f "$OPENAPI_FILE" ]; then
    az apic api definition create -g $RESOURCE_GROUP -n $API_CENTER_NAME \
        --api-id $API_ID --version-id v1 --definition-id openapi \
        --title "OpenAPI 3.0 Specification" --specification "@$OPENAPI_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ OpenAPI Specification uploaded successfully"
    else
        echo "❌ Failed to upload OpenAPI Specification"
        exit 1
    fi
else
    echo "❌ OpenAPI file not found: $OPENAPI_FILE"
    echo "💡 Make sure you're running this script from the project root directory"
    exit 1
fi

# Step 6: Add API Metadata and Tags
echo "🏷️ Adding API Metadata and Tags"
az apic api update -g $RESOURCE_GROUP -n $API_CENTER_NAME --api-id $API_ID \
    --custom-properties '{
        "compliance-standards": ["BABOK_V3", "PMBOK_7", "DMBOK_2"],
        "industry-focus": ["HEALTHCARE", "FINANCE", "TECHNOLOGY"],
        "api-maturity": "PRODUCTION_READY",
        "business-value": "HIGH",
        "innovation-level": "ADVANCED"
    }'

if [ $? -eq 0 ]; then
    echo "✅ API Metadata added successfully"
else
    echo "⚠️ Failed to add API Metadata (non-critical)"
fi

# Step 7: Create API Environments
echo "🌍 Creating API Environments"

# Development Environment
az apic environment create -g $RESOURCE_GROUP -n $API_CENTER_NAME \
    --environment-id development --title "Development" --kind Development \
    --server '{
        "type": "development",
        "url": "http://localhost:3001/api/v1"
    }'

# Production Environment  
az apic environment create -g $RESOURCE_GROUP -n $API_CENTER_NAME \
    --environment-id production --title "Production" --kind Production \
    --server '{
        "type": "production", 
        "url": "https://api.adpa.io/v1"
    }'

if [ $? -eq 0 ]; then
    echo "✅ API Environments created successfully"
else
    echo "⚠️ Failed to create API Environments (non-critical)"
fi

# Step 8: Display Deployment Summary
echo ""
echo "🎉 Azure API Center Deployment Complete!"
echo "========================================"
echo "📊 Deployment Summary:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  API Center: $API_CENTER_NAME"
echo "  API ID: $API_ID"
echo "  API Title: $API_TITLE"
echo ""
echo "🌐 Access Your API Center:"
echo "  Portal: https://portal.azure.com/#browse/Microsoft.ApiCenter%2Fservices"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure API governance policies"
echo "  2. Set up consumer onboarding"
echo "  3. Enable analytics and monitoring"
echo "  4. Configure Microsoft Entra ID authentication"
echo ""
echo "🔧 Useful Commands:"
echo "  # View API details"
echo "  az apic api show -g $RESOURCE_GROUP -n $API_CENTER_NAME --api-id $API_ID"
echo ""
echo "  # List all APIs in center"
echo "  az apic api list -g $RESOURCE_GROUP -n $API_CENTER_NAME"
echo ""
echo "  # Update API metadata"
echo "  az apic api update -g $RESOURCE_GROUP -n $API_CENTER_NAME --api-id $API_ID --description 'Updated description'"
