#!/bin/bash

# Wait for Azure Subscription Activation and Create Echo API
# This script monitors subscription activation and creates the Echo API once ready

SUBSCRIPTION_ID="${1:-3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6}"
RESOURCE_GROUP="${2:-rg-api-center}"
SERVICE_NAME="${3:-svc-api-center}"
MAX_WAIT_MINUTES="${4:-15}"

echo "🚀 Monitoring Azure Subscription Activation..."
echo "Subscription ID: $SUBSCRIPTION_ID"
echo "Max wait time: $MAX_WAIT_MINUTES minutes"
echo ""

START_TIME=$(date +%s)
MAX_END_TIME=$((START_TIME + MAX_WAIT_MINUTES * 60))

test_subscription_status() {
    local sub_id="$1"
    local result=$(az account show --subscription "$sub_id" --query "state" -o tsv 2>/dev/null)
    [[ "$result" == "Enabled" ]]
}

test_resource_group_access() {
    local sub_id="$1"
    local rg_name="$2"
    az group show --name "$rg_name" --subscription "$sub_id" --query "name" -o tsv >/dev/null 2>&1
}

# Wait for subscription activation
attempt=1
while [[ $(date +%s) -lt $MAX_END_TIME ]]; do
    echo "⏱️  Attempt $attempt - Checking subscription status..."
    
    if test_subscription_status "$SUBSCRIPTION_ID"; then
        echo "✅ Subscription is now active!"
        
        # Check resource group access
        echo "🔍 Checking resource group access..."
        if test_resource_group_access "$SUBSCRIPTION_ID" "$RESOURCE_GROUP"; then
            echo "✅ Resource group access confirmed!"
            break
        else
            echo "⚠️  Resource group not accessible yet, waiting..."
        fi
    else
        echo "⏳ Subscription still activating..."
    fi
    
    sleep 30
    ((attempt++))
done

if [[ $(date +%s) -ge $MAX_END_TIME ]]; then
    echo "❌ Timeout: Subscription not activated within $MAX_WAIT_MINUTES minutes"
    echo "Please check your subscription status in the Azure portal"
    exit 1
fi

# Create Echo API
echo ""
echo "🎯 Creating Echo API..."

if az apic api create \
    --resource-group "$RESOURCE_GROUP" \
    --service-name "$SERVICE_NAME" \
    --api-id "echo-api" \
    --title "Echo API" \
    --type "rest" \
    --subscription "$SUBSCRIPTION_ID"; then
    
    echo "✅ Echo API created successfully!"
else
    echo "❌ Failed to create Echo API"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Verify the API was created in Azure Portal"
echo "2. Add API definitions and environments"
echo "3. Run the Standards Compliance API deployment"
echo ""
echo "Ready to deploy Standards Compliance API? Run:"
echo "./scripts/deploy-to-azure-api-center.sh $SUBSCRIPTION_ID"
