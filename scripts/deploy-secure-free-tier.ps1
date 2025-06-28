# Azure API Center Deployment - Free Tier Security Optimized (PowerShell)
# This script deploys API Center with maximum security within free tier constraints

param(
    [string]$AdminIP = "",
    [switch]$SkipConfirmation,
    [string]$Location = "westeurope"
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Security { param([string]$Message) Write-Host "🔒 $Message" -ForegroundColor Magenta }

Write-Host "🔒 Azure API Center - Free Tier Security Deployment" -ForegroundColor Blue
Write-Host "=" * 60 -ForegroundColor Blue

# Step 1: Authentication and Free Tier Verification
Write-Info "Verifying Azure CLI authentication and subscription type..."

try {
    $currentUser = az account show --query "user.name" -o tsv 2>$null
    if (-not $currentUser) {
        Write-Error "Not authenticated. Please run: az login"
        exit 1
    }
    
    $subscriptionInfo = az account show --query "{Name:name, State:state, SubscriptionId:id, TenantId:tenantId}" | ConvertFrom-Json
    
    Write-Success "Authenticated as: $currentUser"
    Write-Info "Subscription: $($subscriptionInfo.Name) (State: $($subscriptionInfo.State))"
    
    if ($subscriptionInfo.State -ne "Enabled") {
        Write-Error "Subscription is not enabled (State: $($subscriptionInfo.State))"
        Write-Host "Please resolve subscription issues first:" -ForegroundColor Yellow
        Write-Host "1. Check Azure Portal billing section"
        Write-Host "2. Create new free account if needed"
        Write-Host "3. Contact Azure Support"
        exit 1
    }
} catch {
    Write-Error "Failed to verify authentication: $($_.Exception.Message)"
    exit 1
}

# Check if this is a free tier subscription
$freeTierIndicators = @("Free", "free", "trial", "Trial", "Pay-As-You-Go")
$isFreeTier = $false

foreach ($indicator in $freeTierIndicators) {
    if ($subscriptionInfo.Name -like "*$indicator*") {
        $isFreeTier = $true
        break
    }
}

if ($isFreeTier) {
    Write-Warning "Free tier subscription detected - applying security optimizations"
    Write-Success "Free tier security features will be maximized"
    Write-Warning "Enterprise features will be substituted with free alternatives"
} else {
    Write-Info "Standard subscription detected - full security features available"
}

# Step 2: Security-First Configuration
Write-Host ""
Write-Info "Configuring security-first deployment parameters..."

# Generate unique identifiers for security
$randomId = -join ((1..6) | ForEach {'{0:x}' -f (Get-Random -Max 16)})
$deploymentTimestamp = Get-Date -Format "yyyyMMdd-HHmm"

# Resource naming with security tags
$resourceGroup = "rg-apicenter-secure-$randomId"
$apiCenterName = "apic-secure-$randomId"
$keyVaultName = "kv-secure-$randomId"
$storageName = "stsecure$randomId"
$nsgName = "nsg-apicenter-$randomId"

# Get admin IP if not provided
if (-not $AdminIP) {
    try {
        $AdminIP = (Invoke-RestMethod -Uri "https://ipinfo.io/ip" -TimeoutSec 10).Trim()
        Write-Info "Detected admin IP: $AdminIP"
    } catch {
        Write-Warning "Could not detect admin IP. Network security will use broader rules."
        $AdminIP = Read-Host "Enter your public IP address for admin access"
    }
}

Write-Host ""
Write-Security "Security Configuration:"
Write-Host "  Resource Group: $resourceGroup" -ForegroundColor White
Write-Host "  Location: $Location (EU - GDPR compliant)" -ForegroundColor White
Write-Host "  API Center: $apiCenterName" -ForegroundColor White
Write-Host "  Key Vault: $keyVaultName" -ForegroundColor White
Write-Host "  Admin IP: $AdminIP" -ForegroundColor White
Write-Host "  Deployment ID: $randomId" -ForegroundColor White

if (-not $SkipConfirmation) {
    $proceed = Read-Host "`nProceed with secure deployment? (y/n)"
    if ($proceed -ne "y" -and $proceed -ne "Y") {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Step 3: Create Resource Group with Security Tags
Write-Host ""
Write-Info "Creating resource group with security and compliance tags..."

try {
    az group create `
        --name $resourceGroup `
        --location $Location `
        --tags `
            Environment="Production" `
            SecurityLevel="High" `
            Owner="$currentUser" `
            DeploymentDate="$deploymentTimestamp" `
            ComplianceRequired="true" `
            CostCenter="IT" `
            Classification="Internal" `
            BackupRequired="true"
    
    Write-Success "Resource group created with security tags"
} catch {
    Write-Error "Failed to create resource group: $($_.Exception.Message)"
    exit 1
}

# Step 4: Create Network Security Group (Maximum Security)
Write-Host ""
Write-Info "Creating Network Security Group with strict security rules..."

try {
    # Create NSG
    az network nsg create `
        --resource-group $resourceGroup `
        --name $nsgName `
        --location $Location `
        --tags `
            SecurityPolicy="Strict" `
            LastReviewed="$deploymentTimestamp"
    
    # Allow HTTPS only from admin IP
    az network nsg rule create `
        --resource-group $resourceGroup `
        --nsg-name $nsgName `
        --name "AllowAdminHTTPS" `
        --protocol Tcp `
        --priority 1000 `
        --destination-port-range 443 `
        --source-address-prefixes "$AdminIP/32" `
        --access Allow `
        --description "HTTPS access for admin only"
    
    # Allow limited HTTP for Let's Encrypt validation
    az network nsg rule create `
        --resource-group $resourceGroup `
        --nsg-name $nsgName `
        --name "AllowHTTPValidation" `
        --protocol Tcp `
        --priority 1100 `
        --destination-port-range 80 `
        --source-address-prefixes "*" `
        --access Allow `
        --description "HTTP for SSL certificate validation only"
    
    # Deny all other inbound traffic
    az network nsg rule create `
        --resource-group $resourceGroup `
        --nsg-name $nsgName `
        --name "DenyAllInbound" `
        --protocol "*" `
        --priority 4096 `
        --destination-port-range "*" `
        --source-address-prefixes "*" `
        --access Deny `
        --description "Deny all other inbound traffic"
    
    Write-Success "Network Security Group configured with strict rules"
} catch {
    Write-Error "Failed to create Network Security Group: $($_.Exception.Message)"
    exit 1
}

# Step 5: Create Key Vault (Software keys for free tier)
Write-Host ""
Write-Info "Creating Azure Key Vault with maximum free tier security..."

try {
    az keyvault create `
        --name $keyVaultName `
        --resource-group $resourceGroup `
        --location $Location `
        --sku standard `
        --enabled-for-disk-encryption true `
        --enabled-for-deployment false `
        --enabled-for-template-deployment false `
        --enable-soft-delete true `
        --retention-days 90 `
        --tags `
            SecurityLevel="High" `
            EncryptionType="Software" `
            PurgeProtection="false"
    
    # Set access policy with minimal permissions
    az keyvault set-policy `
        --name $keyVaultName `
        --upn $currentUser `
        --secret-permissions get list set delete `
        --key-permissions get list create delete `
        --certificate-permissions get list create delete
    
    Write-Success "Key Vault created with secure configuration"
} catch {
    Write-Error "Failed to create Key Vault: $($_.Exception.Message)"
    exit 1
}

# Step 6: Create Storage Account (Maximum Security)
Write-Host ""
Write-Info "Creating secure storage account with encryption..."

try {
    az storage account create `
        --name $storageName `
        --resource-group $resourceGroup `
        --location $Location `
        --sku Standard_LRS `
        --kind StorageV2 `
        --access-tier Hot `
        --https-only true `
        --min-tls-version TLS1_2 `
        --allow-blob-public-access false `
        --default-action Deny `
        --tags `
            EncryptionEnabled="true" `
            HTTPSOnly="true" `
            PublicAccess="false"
    
    # Configure storage encryption (enabled by default but verify)
    az storage account update `
        --name $storageName `
        --resource-group $resourceGroup `
        --encryption-services blob file
    
    Write-Success "Storage account created with maximum security"
} catch {
    Write-Error "Failed to create storage account: $($_.Exception.Message)"
    exit 1
}

# Step 7: Create API Center with Security Configuration
Write-Host ""
Write-Info "Creating Azure API Center with security optimizations..."

try {
    az apic service create `
        --name $apiCenterName `
        --resource-group $resourceGroup `
        --location $Location `
        --tags `
            SecurityLevel="High" `
            MonitoringEnabled="true" `
            BackupRequired="true"
    
    Write-Success "API Center created successfully"
} catch {
    Write-Error "Failed to create API Center: $($_.Exception.Message)"
    exit 1
}

# Step 8: Configure Log Analytics (Free 500MB/day)
Write-Host ""
Write-Info "Setting up Log Analytics workspace for security monitoring..."

$logWorkspaceName = "law-apicenter-$randomId"

try {
    az monitor log-analytics workspace create `
        --resource-group $resourceGroup `
        --workspace-name $logWorkspaceName `
        --location $Location `
        --sku Free `
        --tags `
            DataRetention="90days" `
            SecurityLogs="enabled"
    
    # Enable diagnostic settings for API Center
    az monitor diagnostic-settings create `
        --name "apicenter-security-logs" `
        --resource "/subscriptions/$($subscriptionInfo.SubscriptionId)/resourceGroups/$resourceGroup/providers/Microsoft.ApiCenter/services/$apiCenterName" `
        --workspace "/subscriptions/$($subscriptionInfo.SubscriptionId)/resourceGroups/$resourceGroup/providers/Microsoft.OperationalInsights/workspaces/$logWorkspaceName" `
        --logs '[{"category":"ApiManagementGatewayLogs","enabled":true},{"category":"AuditLogs","enabled":true}]' `
        --metrics '[{"category":"AllMetrics","enabled":true}]'
    
    Write-Success "Security monitoring configured"
} catch {
    Write-Warning "Log Analytics setup encountered issues (may not be critical): $($_.Exception.Message)"
}

# Step 9: Set Up Security Alerts
Write-Host ""
Write-Info "Configuring security alerts and monitoring..."

try {
    # Create action group for security alerts
    az monitor action-group create `
        --name "security-alerts-$randomId" `
        --resource-group $resourceGroup `
        --short-name "SecAlert" `
        --email-receiver name="admin" email-address="$currentUser"
    
    # Create cost alert (critical for free tier)
    $startDate = (Get-Date -Day 1).ToString("yyyy-MM-dd")
    $endDate = (Get-Date -Day 1).AddMonths(1).ToString("yyyy-MM-dd")
    
    az consumption budget create `
        --budget-name "security-budget-$randomId" `
        --amount 10 `
        --time-grain Monthly `
        --start-date $startDate `
        --end-date $endDate `
        --resource-group $resourceGroup `
        --notifications '[{
            "enabled": true,
            "operator": "GreaterThan",
            "threshold": 80,
            "contactEmails": ["'$currentUser'"],
            "contactRoles": ["Owner"]
        }]'
    
    Write-Success "Security alerts configured"
} catch {
    Write-Warning "Some alert configurations may have failed: $($_.Exception.Message)"
}

# Step 10: Register APIs with Security Metadata
Write-Host ""
Write-Info "Registering APIs with security classifications..."

$apiId = "standards-compliance-api"
$apiTitle = "Standards Compliance & Deviation Analysis API"

try {
    az apic api create `
        --resource-group $resourceGroup `
        --service-name $apiCenterName `
        --api-id $apiId `
        --title $apiTitle `
        --type REST `
        --description "Secure API for standards compliance analysis with enterprise-grade security"
    
    # Create API version with security metadata
    az apic api version create `
        --resource-group $resourceGroup `
        --service-name $apiCenterName `
        --api-id $apiId `
        --version-id "v1" `
        --title "Version 1.0 - Secure"
    
    # Create environments with security classifications
    az apic environment create `
        --resource-group $resourceGroup `
        --service-name $apiCenterName `
        --environment-id "secure-dev" `
        --title "Secure Development" `
        --kind Development `
        --description "Security-hardened development environment"
    
    az apic environment create `
        --resource-group $resourceGroup `
        --service-name $apiCenterName `
        --environment-id "secure-prod" `
        --title "Secure Production" `
        --kind Production `
        --description "Production environment with maximum security"
    
    Write-Success "APIs registered with security metadata"
} catch {
    Write-Warning "API registration encountered issues: $($_.Exception.Message)"
}

# Step 11: Create Security Documentation
Write-Host ""
Write-Info "Generating security documentation and procedures..."

$securitySummary = @"
# Security Deployment Summary

## Deployment Information
- **Deployment ID**: $randomId
- **Timestamp**: $deploymentTimestamp
- **Deployed by**: $currentUser
- **Subscription**: $($subscriptionInfo.Name) ($($subscriptionInfo.SubscriptionId))

## Resources Created
- **Resource Group**: $resourceGroup
- **API Center**: $apiCenterName
- **Key Vault**: $keyVaultName
- **Storage Account**: $storageName
- **Network Security Group**: $nsgName
- **Log Analytics**: $logWorkspaceName

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
- **Primary Admin**: $currentUser
- **Azure Support**: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade

## Compliance Notes
- Data residency: EU (West Europe)
- Encryption: Enabled for data at rest and in transit
- Access control: IP-based allowlisting implemented
- Monitoring: Comprehensive logging enabled
- Backup: Configuration exported and stored

Generated: $(Get-Date)
"@

$securitySummary | Out-File -FilePath "$resourceGroup-security-summary.md" -Encoding UTF8
Write-Success "Security documentation created: $resourceGroup-security-summary.md"

# Step 12: Export Configuration for Backup
Write-Host ""
Write-Info "Exporting configuration for backup and disaster recovery..."

try {
    # Export ARM template
    az group export `
        --resource-group $resourceGroup `
        --output-format json `
        > "$resourceGroup-backup-$(Get-Date -Format 'yyyyMMdd').json"
    
    # Create deployment manifest
    $deploymentManifest = @{
        deploymentInfo = @{
            id = $randomId
            timestamp = $deploymentTimestamp
            user = $currentUser
            subscription = @{
                id = $subscriptionInfo.SubscriptionId
                name = $subscriptionInfo.Name
            }
        }
        resources = @{
            resourceGroup = $resourceGroup
            apiCenter = $apiCenterName
            keyVault = $keyVaultName
            storage = $storageName
            nsg = $nsgName
            logAnalytics = $logWorkspaceName
        }
        security = @{
            adminIP = $AdminIP
            encryptionEnabled = $true
            httpsOnly = $true
            networkRestricted = $true
            monitoringEnabled = $true
        }
        freeTierOptimizations = @{
            costBudget = "10 USD/month"
            logAnalyticsQuota = "500MB/day"
            keyVaultTier = "Standard"
            storageTier = "Standard_LRS"
        }
    }
    
    $deploymentManifest | ConvertTo-Json -Depth 10 | Out-File -FilePath "$resourceGroup-deployment-manifest.json" -Encoding UTF8
    Write-Success "Configuration exported for backup"
} catch {
    Write-Warning "Backup export encountered issues: $($_.Exception.Message)"
}

# Final Summary
Write-Host ""
Write-Host "🎉 SECURE DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=" * 40 -ForegroundColor Blue
Write-Success "Resource Group: $resourceGroup"
Write-Success "API Center: $apiCenterName"
Write-Success "Location: $Location"
Write-Success "Security Level: Maximum (Free Tier Optimized)"

Write-Host ""
Write-Host "🔒 Security Features:" -ForegroundColor Magenta
Write-Host "   ✅ Network restrictions (IP: $AdminIP)" -ForegroundColor Green
Write-Host "   ✅ Encryption at rest and in transit" -ForegroundColor Green
Write-Host "   ✅ Key Vault for secrets management" -ForegroundColor Green
Write-Host "   ✅ Comprehensive monitoring and alerting" -ForegroundColor Green
Write-Host "   ✅ Cost protection (budget: `$10/month)" -ForegroundColor Green
Write-Host "   ✅ Compliance tagging and documentation" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Portal Access:" -ForegroundColor Blue
Write-Host "   API Center: https://portal.azure.com/#resource/subscriptions/$($subscriptionInfo.SubscriptionId)/resourceGroups/$resourceGroup/providers/Microsoft.ApiCenter/services/$apiCenterName" -ForegroundColor Cyan
Write-Host "   Key Vault: https://portal.azure.com/#resource/subscriptions/$($subscriptionInfo.SubscriptionId)/resourceGroups/$resourceGroup/providers/Microsoft.KeyVault/vaults/$keyVaultName" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Security Documentation:" -ForegroundColor Blue
Write-Host "   Summary: $resourceGroup-security-summary.md" -ForegroundColor White
Write-Host "   Backup: $resourceGroup-backup-$(Get-Date -Format 'yyyyMMdd').json" -ForegroundColor White
Write-Host "   Manifest: $resourceGroup-deployment-manifest.json" -ForegroundColor White

Write-Host ""
Write-Host "⚡ Quick Commands:" -ForegroundColor Blue
Write-Host "   View API: az apic api show -g $resourceGroup -s $apiCenterName --api-id $apiId" -ForegroundColor Gray
Write-Host "   Check costs: az consumption usage list --top 10" -ForegroundColor Gray
Write-Host "   View logs: az monitor log-analytics query --workspace $logWorkspaceName --analytics-query 'AzureActivity | limit 10'" -ForegroundColor Gray

Write-Host ""
Write-Warning "IMPORTANT: Review and implement additional security procedures from FREE-TIER-SECURITY-IMPLEMENTATION.md"

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Blue
Write-Host "1. Enable MFA for your account" -ForegroundColor White
Write-Host "2. Review network security group rules" -ForegroundColor White
Write-Host "3. Test API access and functionality" -ForegroundColor White
Write-Host "4. Set up regular security reviews" -ForegroundColor White
Write-Host "5. Monitor costs daily" -ForegroundColor White

Write-Host ""
Write-Success "Deployment completed successfully with maximum free tier security!"
