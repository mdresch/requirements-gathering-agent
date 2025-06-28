# Azure Subscription Diagnostic and Resolution Script (PowerShell)
# This script helps diagnose and potentially resolve Azure subscription issues

param(
    [switch]$Detailed,
    [switch]$AutoResolve
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Color functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Blue
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput $Message "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput $Message "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput $Message "Red"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput $Message "Cyan"
}

# Check if Azure CLI is installed and logged in
function Test-AzureCLI {
    Write-Info "Checking Azure CLI installation and authentication..."
    
    try {
        $null = Get-Command az -ErrorAction Stop
        Write-Success "Azure CLI is installed"
    }
    catch {
        Write-Error "Azure CLI is not installed. Please install it first."
        Write-Host "Installation guide: https://docs.microsoft.com/cli/azure/install-azure-cli" -ForegroundColor Blue
        return $false
    }
    
    try {
        $null = az account show --query "id" -o tsv 2>$null
        Write-Success "Azure CLI is authenticated"
        return $true
    }
    catch {
        Write-Error "Not logged into Azure CLI. Please run 'az login' first."
        return $false
    }
}

# Get current subscription details
function Get-CurrentSubscription {
    Write-Info "Getting current subscription details..."
    
    try {
        $currentSub = az account show --query "{Name:name, State:state, SubscriptionId:id, TenantId:tenantId, User:user.name}" | ConvertFrom-Json
        
        Write-Host "`nCurrent Subscription:" -ForegroundColor Yellow
        Write-Host "  Name: $($currentSub.Name)" -ForegroundColor White
        Write-Host "  State: $($currentSub.State)" -ForegroundColor $(if ($currentSub.State -eq "Enabled") { "Green" } else { "Red" })
        Write-Host "  Subscription ID: $($currentSub.SubscriptionId)" -ForegroundColor White
        Write-Host "  Tenant ID: $($currentSub.TenantId)" -ForegroundColor White
        Write-Host "  User: $($currentSub.User)" -ForegroundColor White
        
        if ($currentSub.State -eq "Enabled") {
            Write-Success "Current subscription is enabled and ready for deployment"
            return @{
                IsEnabled = $true
                Subscription = $currentSub
            }
        }
        else {
            Write-Warning "Current subscription state: $($currentSub.State)"
            return @{
                IsEnabled = $false
                Subscription = $currentSub
            }
        }
    }
    catch {
        Write-Error "Failed to get current subscription details: $($_.Exception.Message)"
        return @{
            IsEnabled = $false
            Subscription = $null
        }
    }
}

# List all subscriptions
function Get-AllSubscriptions {
    Write-Info "Listing all available subscriptions..."
    
    try {
        $allSubs = az account list --all --query "[].{Name:name, State:state, SubscriptionId:id, TenantId:tenantId}" | ConvertFrom-Json
        
        Write-Host "`nAll Subscriptions:" -ForegroundColor Yellow
        $enabledCount = 0
        
        foreach ($sub in $allSubs) {
            $stateColor = switch ($sub.State) {
                "Enabled" { "Green"; $enabledCount++ }
                "Warned" { "Yellow" }
                "Disabled" { "Red" }
                default { "White" }
            }
            
            Write-Host "  • $($sub.Name) [$($sub.State)]" -ForegroundColor $stateColor
            Write-Host "    ID: $($sub.SubscriptionId)" -ForegroundColor Gray
        }
        
        if ($enabledCount -gt 0) {
            Write-Success "Found $enabledCount enabled subscription(s)"
            return @{
                HasEnabled = $true
                EnabledCount = $enabledCount
                Subscriptions = $allSubs
            }
        }
        else {
            Write-Warning "No enabled subscriptions found"
            return @{
                HasEnabled = $false
                EnabledCount = 0
                Subscriptions = $allSubs
            }
        }
    }
    catch {
        Write-Error "Failed to list subscriptions: $($_.Exception.Message)"
        return @{
            HasEnabled = $false
            EnabledCount = 0
            Subscriptions = @()
        }
    }
}

# Check billing information
function Test-BillingStatus {
    Write-Info "Checking billing account information..."
    
    try {
        $billingAccounts = az billing account list --query "[].{Name:displayName, Id:id, Status:agreementType}" 2>$null | ConvertFrom-Json
        
        if ($billingAccounts -and $billingAccounts.Count -gt 0) {
            Write-Host "`nBilling Accounts:" -ForegroundColor Yellow
            foreach ($account in $billingAccounts) {
                Write-Host "  • $($account.Name)" -ForegroundColor White
                Write-Host "    ID: $($account.Id)" -ForegroundColor Gray
                Write-Host "    Type: $($account.Status)" -ForegroundColor Gray
            }
        }
        else {
            Write-Warning "No billing account information available or insufficient permissions"
        }
    }
    catch {
        Write-Warning "Could not retrieve billing information: $($_.Exception.Message)"
    }
}

# Check resource providers
function Test-ResourceProviders {
    param([string]$SubscriptionState)
    
    Write-Info "Checking required resource provider registrations..."
    
    $requiredProviders = @(
        "Microsoft.ApiCenter",
        "Microsoft.Storage", 
        "Microsoft.Web"
    )
    
    $registrationIssues = @()
    
    foreach ($provider in $requiredProviders) {
        try {
            $status = az provider show --namespace $provider --query "registrationState" -o tsv 2>$null
            
            if ($status -eq "Registered") {
                Write-Success "$provider`: $status"
            }
            else {
                Write-Warning "$provider`: $status"
                $registrationIssues += $provider
                
                if ($status -ne "NotFound" -and $SubscriptionState -eq "Enabled" -and $AutoResolve) {
                    Write-Info "Attempting to register $provider..."
                    try {
                        az provider register --namespace $provider --wait
                        Write-Success "Successfully registered $provider"
                    }
                    catch {
                        Write-Error "Failed to register $provider`: $($_.Exception.Message)"
                    }
                }
            }
        }
        catch {
            Write-Error "Failed to check provider $provider`: $($_.Exception.Message)"
            $registrationIssues += $provider
        }
    }
    
    return $registrationIssues
}

# Test basic Azure operations
function Test-AzureOperations {
    Write-Info "Testing basic Azure operations..."
    
    $testResults = @{}
    
    # Test resource group listing
    try {
        $null = az group list --query "[0].name" -o tsv 2>$null
        Write-Success "Can list resource groups"
        $testResults.ResourceGroups = $true
    }
    catch {
        Write-Error "Cannot list resource groups"
        $testResults.ResourceGroups = $false
    }
    
    # Test location listing
    try {
        $null = az account list-locations --query "[0].name" -o tsv 2>$null
        Write-Success "Can list Azure locations"
        $testResults.Locations = $true
    }
    catch {
        Write-Error "Cannot list Azure locations"
        $testResults.Locations = $false
    }
    
    return $testResults
}

# Attempt to switch to an enabled subscription
function Switch-ToEnabledSubscription {
    param([array]$AllSubscriptions)
    
    Write-Info "Attempting to switch to an enabled subscription..."
    
    $enabledSubs = $AllSubscriptions | Where-Object { $_.State -eq "Enabled" }
    
    if ($enabledSubs.Count -eq 0) {
        Write-Error "No enabled subscriptions available"
        return $false
    }
    elseif ($enabledSubs.Count -eq 1) {
        $enabledSub = $enabledSubs[0]
        Write-Info "Switching to enabled subscription: $($enabledSub.Name)"
        
        try {
            az account set --subscription $enabledSub.SubscriptionId
            Write-Success "Successfully switched to subscription: $($enabledSub.Name)"
            return $true
        }
        catch {
            Write-Error "Failed to switch to subscription: $($enabledSub.Name)"
            return $false
        }
    }
    else {
        Write-Host "`nMultiple enabled subscriptions found:" -ForegroundColor Yellow
        
        for ($i = 0; $i -lt $enabledSubs.Count; $i++) {
            $sub = $enabledSubs[$i]
            Write-Host "  $($i + 1). $($sub.Name) ($($sub.SubscriptionId))" -ForegroundColor White
        }
        
        if (-not $AutoResolve) {
            $choice = Read-Host "`nEnter choice (1-$($enabledSubs.Count))"
            
            if ([int]$choice -ge 1 -and [int]$choice -le $enabledSubs.Count) {
                $selectedSub = $enabledSubs[$choice - 1]
                Write-Info "Switching to selected subscription: $($selectedSub.Name)"
                
                try {
                    az account set --subscription $selectedSub.SubscriptionId
                    Write-Success "Successfully switched to subscription: $($selectedSub.Name)"
                    return $true
                }
                catch {
                    Write-Error "Failed to switch to subscription: $($selectedSub.Name)"
                    return $false
                }
            }
            else {
                Write-Error "Invalid choice. Please run the script again."
                return $false
            }
        }
        else {
            # Auto-select first enabled subscription
            $selectedSub = $enabledSubs[0]
            Write-Info "Auto-selecting first enabled subscription: $($selectedSub.Name)"
            
            try {
                az account set --subscription $selectedSub.SubscriptionId
                Write-Success "Successfully switched to subscription: $($selectedSub.Name)"
                return $true
            }
            catch {
                Write-Error "Failed to switch to subscription: $($selectedSub.Name)"
                return $false
            }
        }
    }
}

# Generate resolution recommendations
function Write-ResolutionRecommendations {
    param(
        [bool]$HasEnabledSubscriptions,
        [int]$EnabledCount
    )
    
    Write-Info "Generating resolution recommendations..."
    
    Write-Host "`n" + "="*60 -ForegroundColor Blue
    Write-Host "SUBSCRIPTION RESOLUTION RECOMMENDATIONS" -ForegroundColor Blue
    Write-Host "="*60 -ForegroundColor Blue
    
    if (-not $HasEnabledSubscriptions) {
        Write-Host "`n❌ No enabled subscriptions found. Recommended actions:" -ForegroundColor Red
        
        Write-Host "`n1. IMMEDIATE ACTIONS:" -ForegroundColor Yellow
        Write-Host "   • Check Azure Portal billing section" -ForegroundColor White
        Write-Host "   • Verify payment method is valid and current" -ForegroundColor White
        Write-Host "   • Contact Azure Support for subscription reactivation" -ForegroundColor White
        
        Write-Host "`n2. ALTERNATIVE OPTIONS:" -ForegroundColor Yellow
        Write-Host "   • Create new Azure Free account (`$200 credit, 12 months)" -ForegroundColor White
        Write-Host "   • Set up Pay-As-You-Go subscription" -ForegroundColor White
        Write-Host "   • Use Visual Studio subscription benefits (if available)" -ForegroundColor White
        
        Write-Host "`n3. USEFUL LINKS:" -ForegroundColor Yellow
        Write-Host "   • Azure Portal: https://portal.azure.com" -ForegroundColor Cyan
        Write-Host "   • Azure Free Account: https://azure.microsoft.com/free" -ForegroundColor Cyan
        Write-Host "   • Azure Support: https://azure.microsoft.com/support" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n✅ Enabled subscription(s) available. You can proceed with deployment." -ForegroundColor Green
        
        Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Run the API Center deployment script:" -ForegroundColor White
        Write-Host "   .\scripts\deploy-to-azure-api-center.ps1" -ForegroundColor Cyan
        Write-Host "`n2. Or use Bash version:" -ForegroundColor White
        Write-Host "   .\scripts\deploy-to-azure-api-center.sh" -ForegroundColor Cyan
    }
    
    Write-Host "`n4. COST MANAGEMENT:" -ForegroundColor Yellow
    Write-Host "   • Set up billing alerts (recommended: `$50/month limit)" -ForegroundColor White
    Write-Host "   • Monitor usage in Azure Portal" -ForegroundColor White
    Write-Host "   • Use Azure Cost Management tools" -ForegroundColor White
    
    Write-Host "`n5. DEPLOYMENT ESTIMATES:" -ForegroundColor Yellow
    Write-Host "   • Azure API Center: ~`$5-15/month" -ForegroundColor White
    Write-Host "   • Storage Account: ~`$1-5/month" -ForegroundColor White
    Write-Host "   • Total: ~`$6-20/month" -ForegroundColor White
    
    Write-Host "`n" + "="*60 -ForegroundColor Blue
}

# Main execution function
function Main {
    Write-Host "`n🔍 Azure Subscription Diagnostic and Resolution Tool" -ForegroundColor Blue
    Write-Host "=" * 60 -ForegroundColor Blue
    
    # Check Azure CLI
    if (-not (Test-AzureCLI)) {
        return
    }
    
    Write-Host ""
    
    # Get current subscription
    $currentSubResult = Get-CurrentSubscription
    $hasEnabledCurrent = $currentSubResult.IsEnabled
    
    Write-Host ""
    
    # Get all subscriptions
    $allSubsResult = Get-AllSubscriptions
    $hasEnabledSubs = $allSubsResult.HasEnabled
    
    # If current subscription is not enabled, try to switch
    if (-not $hasEnabledCurrent -and $hasEnabledSubs) {
        Write-Host ""
        $switchResult = Switch-ToEnabledSubscription -AllSubscriptions $allSubsResult.Subscriptions
        
        if ($switchResult) {
            Write-Host ""
            $currentSubResult = Get-CurrentSubscription
            $hasEnabledCurrent = $currentSubResult.IsEnabled
        }
    }
    
    # Run additional checks if we have an enabled subscription
    if ($hasEnabledCurrent -or $hasEnabledSubs) {
        Write-Host ""
        $providerIssues = Test-ResourceProviders -SubscriptionState $currentSubResult.Subscription.State
        
        Write-Host ""
        $operationResults = Test-AzureOperations
    }
    
    # Check billing status
    Write-Host ""
    Test-BillingStatus
    
    # Generate recommendations
    Write-Host ""
    Write-ResolutionRecommendations -HasEnabledSubscriptions $hasEnabledSubs -EnabledCount $allSubsResult.EnabledCount
    
    Write-Host "`n=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Blue
    Write-Host ""
}

# Run main function
Main
