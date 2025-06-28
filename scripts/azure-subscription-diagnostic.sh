#!/bin/bash

# Azure Subscription Diagnostic and Resolution Script
# This script helps diagnose and potentially resolve Azure subscription issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if Azure CLI is installed and logged in
check_azure_cli() {
    log "Checking Azure CLI installation and authentication..."
    
    if ! command -v az &> /dev/null; then
        error "Azure CLI is not installed. Please install it first."
        echo "Installation guide: https://docs.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        error "Not logged into Azure CLI. Please run 'az login' first."
        exit 1
    fi
    
    success "Azure CLI is installed and authenticated"
}

# Get current subscription details
get_current_subscription() {
    log "Getting current subscription details..."
    
    CURRENT_SUB=$(az account show --query "{Name:name, State:state, SubscriptionId:id, TenantId:tenantId, User:user.name}" -o json)
    
    echo "Current Subscription:"
    echo "$CURRENT_SUB" | jq .
    
    # Extract state for further processing
    SUB_STATE=$(echo "$CURRENT_SUB" | jq -r '.State')
    SUB_ID=$(echo "$CURRENT_SUB" | jq -r '.SubscriptionId')
    SUB_NAME=$(echo "$CURRENT_SUB" | jq -r '.Name')
    
    if [ "$SUB_STATE" = "Enabled" ]; then
        success "Current subscription is enabled and ready for deployment"
        return 0
    else
        warning "Current subscription state: $SUB_STATE"
        return 1
    fi
}

# List all subscriptions
list_all_subscriptions() {
    log "Listing all available subscriptions..."
    
    ALL_SUBS=$(az account list --all --query "[].{Name:name, State:state, SubscriptionId:id, TenantId:tenantId}" -o json)
    
    echo "All Subscriptions:"
    echo "$ALL_SUBS" | jq .
    
    # Check if any enabled subscriptions exist
    ENABLED_COUNT=$(echo "$ALL_SUBS" | jq '[.[] | select(.State == "Enabled")] | length')
    
    if [ "$ENABLED_COUNT" -gt 0 ]; then
        success "Found $ENABLED_COUNT enabled subscription(s)"
        echo "Enabled subscriptions:"
        echo "$ALL_SUBS" | jq '.[] | select(.State == "Enabled")'
        return 0
    else
        warning "No enabled subscriptions found"
        return 1
    fi
}

# Check billing information
check_billing_status() {
    log "Checking billing account information..."
    
    BILLING_ACCOUNTS=$(az billing account list --query "[].{Name:displayName, Id:id, Status:agreementType}" -o json 2>/dev/null || echo "[]")
    
    if [ "$(echo "$BILLING_ACCOUNTS" | jq length)" -gt 0 ]; then
        echo "Billing Accounts:"
        echo "$BILLING_ACCOUNTS" | jq .
    else
        warning "No billing account information available or insufficient permissions"
    fi
}

# Check resource providers
check_resource_providers() {
    log "Checking required resource provider registrations..."
    
    REQUIRED_PROVIDERS=("Microsoft.ApiCenter" "Microsoft.Storage" "Microsoft.Web")
    
    for provider in "${REQUIRED_PROVIDERS[@]}"; do
        STATUS=$(az provider show --namespace "$provider" --query "registrationState" -o tsv 2>/dev/null || echo "NotFound")
        
        if [ "$STATUS" = "Registered" ]; then
            success "$provider: $STATUS"
        else
            warning "$provider: $STATUS"
            
            if [ "$STATUS" != "NotFound" ] && [ "$SUB_STATE" = "Enabled" ]; then
                log "Attempting to register $provider..."
                if az provider register --namespace "$provider" --wait; then
                    success "Successfully registered $provider"
                else
                    error "Failed to register $provider"
                fi
            fi
        fi
    done
}

# Test basic Azure operations
test_azure_operations() {
    log "Testing basic Azure operations..."
    
    # Test resource group listing
    if az group list --query "[0].name" -o tsv &> /dev/null; then
        success "Can list resource groups"
    else
        error "Cannot list resource groups"
    fi
    
    # Test location listing
    if az account list-locations --query "[0].name" -o tsv &> /dev/null; then
        success "Can list Azure locations"
    else
        error "Cannot list Azure locations"
    fi
}

# Attempt to switch to an enabled subscription
switch_to_enabled_subscription() {
    log "Attempting to switch to an enabled subscription..."
    
    ENABLED_SUBS=$(az account list --query "[?state=='Enabled'].{Name:name, SubscriptionId:id}" -o json)
    ENABLED_COUNT=$(echo "$ENABLED_SUBS" | jq length)
    
    if [ "$ENABLED_COUNT" -eq 0 ]; then
        error "No enabled subscriptions available"
        return 1
    elif [ "$ENABLED_COUNT" -eq 1 ]; then
        ENABLED_SUB_ID=$(echo "$ENABLED_SUBS" | jq -r '.[0].SubscriptionId')
        ENABLED_SUB_NAME=$(echo "$ENABLED_SUBS" | jq -r '.[0].Name')
        
        log "Switching to enabled subscription: $ENABLED_SUB_NAME"
        
        if az account set --subscription "$ENABLED_SUB_ID"; then
            success "Successfully switched to subscription: $ENABLED_SUB_NAME"
            return 0
        else
            error "Failed to switch to subscription: $ENABLED_SUB_NAME"
            return 1
        fi
    else
        echo "Multiple enabled subscriptions found:"
        echo "$ENABLED_SUBS" | jq .
        
        echo "Please choose a subscription (enter the number):"
        for i in $(seq 0 $((ENABLED_COUNT - 1))); do
            SUB_NAME=$(echo "$ENABLED_SUBS" | jq -r ".[$i].Name")
            SUB_ID=$(echo "$ENABLED_SUBS" | jq -r ".[$i].SubscriptionId")
            echo "$((i + 1)). $SUB_NAME ($SUB_ID)"
        done
        
        read -p "Enter choice (1-$ENABLED_COUNT): " CHOICE
        
        if [[ "$CHOICE" =~ ^[0-9]+$ ]] && [ "$CHOICE" -ge 1 ] && [ "$CHOICE" -le "$ENABLED_COUNT" ]; then
            INDEX=$((CHOICE - 1))
            SELECTED_SUB_ID=$(echo "$ENABLED_SUBS" | jq -r ".[$INDEX].SubscriptionId")
            SELECTED_SUB_NAME=$(echo "$ENABLED_SUBS" | jq -r ".[$INDEX].Name")
            
            log "Switching to selected subscription: $SELECTED_SUB_NAME"
            
            if az account set --subscription "$SELECTED_SUB_ID"; then
                success "Successfully switched to subscription: $SELECTED_SUB_NAME"
                return 0
            else
                error "Failed to switch to subscription: $SELECTED_SUB_NAME"
                return 1
            fi
        else
            error "Invalid choice. Please run the script again."
            return 1
        fi
    fi
}

# Generate resolution recommendations
generate_recommendations() {
    log "Generating resolution recommendations..."
    
    echo ""
    echo "=== SUBSCRIPTION RESOLUTION RECOMMENDATIONS ==="
    echo ""
    
    if [ "$ENABLED_COUNT" -eq 0 ]; then
        echo "❌ No enabled subscriptions found. Recommended actions:"
        echo ""
        echo "1. IMMEDIATE ACTIONS:"
        echo "   • Check Azure Portal billing section"
        echo "   • Verify payment method is valid and current"
        echo "   • Contact Azure Support for subscription reactivation"
        echo ""
        echo "2. ALTERNATIVE OPTIONS:"
        echo "   • Create new Azure Free account ($200 credit, 12 months)"
        echo "   • Set up Pay-As-You-Go subscription"
        echo "   • Use Visual Studio subscription benefits (if available)"
        echo ""
        echo "3. USEFUL LINKS:"
        echo "   • Azure Portal: https://portal.azure.com"
        echo "   • Azure Free Account: https://azure.microsoft.com/free"
        echo "   • Azure Support: https://azure.microsoft.com/support"
        echo ""
    else
        echo "✅ Enabled subscription(s) available. You can proceed with deployment."
        echo ""
        echo "NEXT STEPS:"
        echo "1. Run the API Center deployment script:"
        echo "   ./scripts/deploy-to-azure-api-center.sh"
        echo ""
        echo "2. Or use PowerShell version:"
        echo "   ./scripts/deploy-to-azure-api-center.ps1"
        echo ""
    fi
    
    echo "4. COST MANAGEMENT:"
    echo "   • Set up billing alerts (recommended: $50/month limit)"
    echo "   • Monitor usage in Azure Portal"
    echo "   • Use Azure Cost Management tools"
    echo ""
    
    echo "5. DEPLOYMENT ESTIMATES:"
    echo "   • Azure API Center: ~$5-15/month"
    echo "   • Storage Account: ~$1-5/month"
    echo "   • Total: ~$6-20/month"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "🔍 Azure Subscription Diagnostic and Resolution Tool"
    echo "=================================================="
    echo ""
    
    check_azure_cli
    echo ""
    
    if get_current_subscription; then
        echo ""
        check_resource_providers
        echo ""
        test_azure_operations
    else
        echo ""
        list_all_subscriptions
        echo ""
        
        if switch_to_enabled_subscription; then
            echo ""
            get_current_subscription
            echo ""
            check_resource_providers
            echo ""
            test_azure_operations
        fi
    fi
    
    echo ""
    check_billing_status
    echo ""
    generate_recommendations
    
    echo ""
    echo "=== DIAGNOSTIC COMPLETE ==="
    echo ""
}

# Run main function
main
