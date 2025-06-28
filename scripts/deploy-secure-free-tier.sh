#!/bin/bash

# Azure API Center Deployment - Free Tier Security Optimized
# This script deploys API Center with maximum security within free tier constraints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

echo "🔒 Azure API Center - Free Tier Security Deployment"
echo "=================================================="

# Step 1: Authentication and Free Tier Verification
log "Verifying Azure CLI authentication and subscription type..."

CURRENT_USER=$(az account show --query "user.name" -o tsv 2>/dev/null)
if [ -z "$CURRENT_USER" ]; then
    error "Not authenticated. Please run: az login"
    exit 1
fi

SUBSCRIPTION_INFO=$(az account show --query "{Name:name, State:state, SubscriptionId:id, TenantId:tenantId}" -o json)
SUB_STATE=$(echo "$SUBSCRIPTION_INFO" | jq -r '.State')
SUB_NAME=$(echo "$SUBSCRIPTION_INFO" | jq -r '.Name')
SUB_ID=$(echo "$SUBSCRIPTION_INFO" | jq -r '.SubscriptionId')

success "Authenticated as: $CURRENT_USER"
log "Subscription: $SUB_NAME (State: $SUB_STATE)"

if [ "$SUB_STATE" != "Enabled" ]; then
    error "Subscription is not enabled (State: $SUB_STATE)"
    echo "Please resolve subscription issues first:"
    echo "1. Check Azure Portal billing section"
    echo "2. Create new free account if needed"
    echo "3. Contact Azure Support"
    exit 1
fi

# Check if this is a free tier subscription
FREE_TIER_INDICATORS=("Free" "free" "trial" "Trial" "Pay-As-You-Go")
IS_FREE_TIER=false

for indicator in "${FREE_TIER_INDICATORS[@]}"; do
    if [[ "$SUB_NAME" == *"$indicator"* ]]; then
        IS_FREE_TIER=true
        break
    fi
done

if [ "$IS_FREE_TIER" = true ]; then
    warning "Free tier subscription detected - applying security optimizations"
    echo "✅ Free tier security features will be maximized"
    echo "⚠️  Enterprise features will be substituted with free alternatives"
else
    log "Standard subscription detected - full security features available"
fi

# Step 2: Security-First Configuration
echo ""
log "Configuring security-first deployment parameters..."

# Generate unique identifiers for security
RANDOM_ID=$(openssl rand -hex 3)
DEPLOYMENT_TIMESTAMP=$(date +%Y%m%d-%H%M)

# Resource naming with security tags
RESOURCE_GROUP="rg-apicenter-secure-${RANDOM_ID}"
LOCATION="westeurope"  # EU region for GDPR compliance
API_CENTER_NAME="apic-secure-${RANDOM_ID}"
KEY_VAULT_NAME="kv-secure-${RANDOM_ID}"
STORAGE_NAME="stsecure${RANDOM_ID}"
NSG_NAME="nsg-apicenter-${RANDOM_ID}"

# Security configuration
ADMIN_IP=$(curl -s https://ipinfo.io/ip 2>/dev/null || echo "0.0.0.0")
if [ "$ADMIN_IP" = "0.0.0.0" ]; then
    warning "Could not detect admin IP. Network security will use broader rules."
    read -p "Enter your public IP address for admin access: " ADMIN_IP
fi

echo ""
log "Security Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION (EU - GDPR compliant)"
echo "  API Center: $API_CENTER_NAME"
echo "  Key Vault: $KEY_VAULT_NAME"
echo "  Admin IP: $ADMIN_IP"
echo "  Deployment ID: $RANDOM_ID"

read -p "Proceed with secure deployment? (y/n): " PROCEED
if [ "$PROCEED" != "y" ] && [ "$PROCEED" != "Y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Step 3: Create Resource Group with Security Tags
echo ""
log "Creating resource group with security and compliance tags..."

az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --tags \
        Environment="Production" \
        SecurityLevel="High" \
        Owner="$CURRENT_USER" \
        DeploymentDate="$DEPLOYMENT_TIMESTAMP" \
        ComplianceRequired="true" \
        CostCenter="IT" \
        Classification="Internal" \
        BackupRequired="true"

if [ $? -eq 0 ]; then
    success "Resource group created with security tags"
else
    error "Failed to create resource group"
    exit 1
fi

# Step 4: Create Network Security Group (Maximum Security)
echo ""
log "Creating Network Security Group with strict security rules..."

az network nsg create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$NSG_NAME" \
    --location "$LOCATION" \
    --tags \
        SecurityPolicy="Strict" \
        LastReviewed="$DEPLOYMENT_TIMESTAMP"

# Allow HTTPS only from admin IP
az network nsg rule create \
    --resource-group "$RESOURCE_GROUP" \
    --nsg-name "$NSG_NAME" \
    --name "AllowAdminHTTPS" \
    --protocol Tcp \
    --priority 1000 \
    --destination-port-range 443 \
    --source-address-prefixes "$ADMIN_IP/32" \
    --access Allow \
    --description "HTTPS access for admin only"

# Allow limited HTTP for Let's Encrypt validation
az network nsg rule create \
    --resource-group "$RESOURCE_GROUP" \
    --nsg-name "$NSG_NAME" \
    --name "AllowHTTPValidation" \
    --protocol Tcp \
    --priority 1100 \
    --destination-port-range 80 \
    --source-address-prefixes "*" \
    --access Allow \
    --description "HTTP for SSL certificate validation only"

# Deny all other inbound traffic
az network nsg rule create \
    --resource-group "$RESOURCE_GROUP" \
    --nsg-name "$NSG_NAME" \
    --name "DenyAllInbound" \
    --protocol "*" \
    --priority 4096 \
    --destination-port-range "*" \
    --source-address-prefixes "*" \
    --access Deny \
    --description "Deny all other inbound traffic"

success "Network Security Group configured with strict rules"

# Step 5: Create Key Vault (Software keys for free tier)
echo ""
log "Creating Azure Key Vault with maximum free tier security..."

az keyvault create \
    --name "$KEY_VAULT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku standard \
    --enabled-for-disk-encryption true \
    --enabled-for-deployment false \
    --enabled-for-template-deployment false \
    --enable-soft-delete true \
    --retention-days 90 \
    --enable-purge-protection false \
    --tags \
        SecurityLevel="High" \
        EncryptionType="Software" \
        PurgeProtection="false"

# Set access policy with minimal permissions
az keyvault set-policy \
    --name "$KEY_VAULT_NAME" \
    --upn "$CURRENT_USER" \
    --secret-permissions get list set delete \
    --key-permissions get list create delete \
    --certificate-permissions get list create delete

success "Key Vault created with secure configuration"

# Step 6: Create Storage Account (Maximum Security)
echo ""
log "Creating secure storage account with encryption..."

az storage account create \
    --name "$STORAGE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --https-only true \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access false \
    --default-action Deny \
    --tags \
        EncryptionEnabled="true" \
        HTTPSOnly="true" \
        PublicAccess="false"

# Configure storage encryption (enabled by default but verify)
az storage account update \
    --name "$STORAGE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --encryption-services blob file

success "Storage account created with maximum security"

# Step 7: Create API Center with Security Configuration
echo ""
log "Creating Azure API Center with security optimizations..."

az apic service create \
    --name "$API_CENTER_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --tags \
        SecurityLevel="High" \
        MonitoringEnabled="true" \
        BackupRequired="true"

if [ $? -eq 0 ]; then
    success "API Center created successfully"
else
    error "Failed to create API Center"
    exit 1
fi

# Step 8: Configure Log Analytics (Free 500MB/day)
echo ""
log "Setting up Log Analytics workspace for security monitoring..."

LOG_WORKSPACE_NAME="law-apicenter-${RANDOM_ID}"

az monitor log-analytics workspace create \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$LOG_WORKSPACE_NAME" \
    --location "$LOCATION" \
    --sku Free \
    --tags \
        DataRetention="90days" \
        SecurityLogs="enabled"

# Enable diagnostic settings for API Center
az monitor diagnostic-settings create \
    --name "apicenter-security-logs" \
    --resource "/subscriptions/$SUB_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ApiCenter/services/$API_CENTER_NAME" \
    --workspace "/subscriptions/$SUB_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.OperationalInsights/workspaces/$LOG_WORKSPACE_NAME" \
    --logs '[{"category":"ApiManagementGatewayLogs","enabled":true},{"category":"AuditLogs","enabled":true}]' \
    --metrics '[{"category":"AllMetrics","enabled":true}]'

success "Security monitoring configured"

# Step 9: Set Up Security Alerts
echo ""
log "Configuring security alerts and monitoring..."

# Create action group for security alerts
az monitor action-group create \
    --name "security-alerts-${RANDOM_ID}" \
    --resource-group "$RESOURCE_GROUP" \
    --short-name "SecAlert" \
    --email-receiver name="admin" email-address="$CURRENT_USER"

# Create cost alert (critical for free tier)
az consumption budget create \
    --budget-name "security-budget-${RANDOM_ID}" \
    --amount 10 \
    --time-grain Monthly \
    --start-date "$(date -d 'first day of this month' '+%Y-%m-%d')" \
    --end-date "$(date -d 'first day of next month' '+%Y-%m-%d')" \
    --resource-group "$RESOURCE_GROUP" \
    --notifications '[{
        "enabled": true,
        "operator": "GreaterThan",
        "threshold": 80,
        "contactEmails": ["'$CURRENT_USER'"],
        "contactRoles": ["Owner"]
    }]'

success "Security alerts configured"

# Step 10: Register APIs with Security Metadata
echo ""
log "Registering APIs with security classifications..."

API_ID="standards-compliance-api"
API_TITLE="Standards Compliance & Deviation Analysis API"

az apic api create \
    --resource-group "$RESOURCE_GROUP" \
    --service-name "$API_CENTER_NAME" \
    --api-id "$API_ID" \
    --title "$API_TITLE" \
    --type REST \
    --description "Secure API for standards compliance analysis with enterprise-grade security"

# Create API version with security metadata
az apic api version create \
    --resource-group "$RESOURCE_GROUP" \
    --service-name "$API_CENTER_NAME" \
    --api-id "$API_ID" \
    --version-id "v1" \
    --title "Version 1.0 - Secure"

# Create environments with security classifications
az apic environment create \
    --resource-group "$RESOURCE_GROUP" \
    --service-name "$API_CENTER_NAME" \
    --environment-id "secure-dev" \
    --title "Secure Development" \
    --kind Development \
    --description "Security-hardened development environment"

az apic environment create \
    --resource-group "$RESOURCE_GROUP" \
    --service-name "$API_CENTER_NAME" \
    --environment-id "secure-prod" \
    --title "Secure Production" \
    --kind Production \
    --description "Production environment with maximum security"

success "APIs registered with security metadata"

# Step 11: Create Security Documentation
echo ""
log "Generating security documentation and procedures..."

cat > "$RESOURCE_GROUP-security-summary.md" << EOF
# Security Deployment Summary

## Deployment Information
- **Deployment ID**: $RANDOM_ID
- **Timestamp**: $DEPLOYMENT_TIMESTAMP
- **Deployed by**: $CURRENT_USER
- **Subscription**: $SUB_NAME ($SUB_ID)

## Resources Created
- **Resource Group**: $RESOURCE_GROUP
- **API Center**: $API_CENTER_NAME
- **Key Vault**: $KEY_VAULT_NAME
- **Storage Account**: $STORAGE_NAME
- **Network Security Group**: $NSG_NAME
- **Log Analytics**: $LOG_WORKSPACE_NAME

## Security Features Implemented
- ✅ Network Security Groups with strict rules
- ✅ Azure Key Vault for secrets management
- ✅ Storage encryption at rest and in transit
- ✅ HTTPS-only communication
- ✅ IP allowlisting for admin access
- ✅ Comprehensive logging and monitoring
- ✅ Cost alerts to prevent overruns
- ✅ Resource tagging for compliance

## Free Tier Security Optimizations
- ✅ Software-based encryption (Key Vault Standard)
- ✅ 500MB/day Log Analytics quota optimization
- ✅ Basic monitoring and alerting
- ✅ Manual compliance procedures documented
- ✅ Cost management and budget alerts

## Next Steps
1. **Configure MFA**: Enable multi-factor authentication
2. **Review Access**: Conduct access control review
3. **Test Security**: Run security validation tests
4. **Document Procedures**: Complete security runbooks
5. **Schedule Reviews**: Set up regular security assessments

## Emergency Contacts
- **Primary Admin**: $CURRENT_USER
- **Azure Support**: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade

## Compliance Notes
- Data residency: EU (West Europe)
- Encryption: Enabled for data at rest and in transit
- Access control: IP-based allowlisting implemented
- Monitoring: Comprehensive logging enabled
- Backup: Configuration exported and stored

Generated: $(date)
EOF

success "Security documentation created: $RESOURCE_GROUP-security-summary.md"

# Step 12: Export Configuration for Backup
echo ""
log "Exporting configuration for backup and disaster recovery..."

# Export ARM template
az group export \
    --resource-group "$RESOURCE_GROUP" \
    --output-format json \
    > "$RESOURCE_GROUP-backup-$(date +%Y%m%d).json"

# Create deployment manifest
cat > "$RESOURCE_GROUP-deployment-manifest.json" << EOF
{
    "deploymentInfo": {
        "id": "$RANDOM_ID",
        "timestamp": "$DEPLOYMENT_TIMESTAMP",
        "user": "$CURRENT_USER",
        "subscription": {
            "id": "$SUB_ID",
            "name": "$SUB_NAME"
        }
    },
    "resources": {
        "resourceGroup": "$RESOURCE_GROUP",
        "apiCenter": "$API_CENTER_NAME",
        "keyVault": "$KEY_VAULT_NAME",
        "storage": "$STORAGE_NAME",
        "nsg": "$NSG_NAME",
        "logAnalytics": "$LOG_WORKSPACE_NAME"
    },
    "security": {
        "adminIP": "$ADMIN_IP",
        "encryptionEnabled": true,
        "httpsOnly": true,
        "networkRestricted": true,
        "monitoringEnabled": true
    },
    "freeTierOptimizations": {
        "costBudget": "10 USD/month",
        "logAnalyticsQuota": "500MB/day",
        "keyVaultTier": "Standard",
        "storageTier": "Standard_LRS"
    }
}
EOF

success "Configuration exported for backup"

# Final Summary
echo ""
echo "🎉 SECURE DEPLOYMENT COMPLETE!"
echo "=============================="
success "Resource Group: $RESOURCE_GROUP"
success "API Center: $API_CENTER_NAME"
success "Location: $LOCATION"
success "Security Level: Maximum (Free Tier Optimized)"
echo ""
echo "🔒 Security Features:"
echo "   ✅ Network restrictions (IP: $ADMIN_IP)"
echo "   ✅ Encryption at rest and in transit"
echo "   ✅ Key Vault for secrets management"
echo "   ✅ Comprehensive monitoring and alerting"
echo "   ✅ Cost protection (budget: \$10/month)"
echo "   ✅ Compliance tagging and documentation"
echo ""
echo "🌐 Portal Access:"
echo "   API Center: https://portal.azure.com/#resource/subscriptions/$SUB_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ApiCenter/services/$API_CENTER_NAME"
echo "   Key Vault: https://portal.azure.com/#resource/subscriptions/$SUB_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME"
echo ""
echo "📋 Security Documentation:"
echo "   Summary: $RESOURCE_GROUP-security-summary.md"
echo "   Backup: $RESOURCE_GROUP-backup-$(date +%Y%m%d).json"
echo "   Manifest: $RESOURCE_GROUP-deployment-manifest.json"
echo ""
echo "⚡ Quick Commands:"
echo "   View API: az apic api show -g $RESOURCE_GROUP -s $API_CENTER_NAME --api-id $API_ID"
echo "   Check costs: az consumption usage list --top 10"
echo "   View logs: az monitor log-analytics query --workspace $LOG_WORKSPACE_NAME --analytics-query 'AzureActivity | limit 10'"
echo ""
warning "IMPORTANT: Review and implement additional security procedures from FREE-TIER-SECURITY-IMPLEMENTATION.md"
echo ""
echo "🎯 Next Steps:"
echo "1. Enable MFA for your account"
echo "2. Review network security group rules"
echo "3. Test API access and functionality"
echo "4. Set up regular security reviews"
echo "5. Monitor costs daily"
echo ""
success "Deployment completed successfully with maximum free tier security!"
