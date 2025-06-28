# Azure Subscription Quick Resolution Script
# This script attempts to automatically resolve common subscription issues

param(
    [switch]$CheckOnly,
    [switch]$Force,
    [string]$NewSubscriptionName = "API-Center-Deployment"
)

$ErrorActionPreference = "Continue"

# Color output functions
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Action { param([string]$Message) Write-Host "🔧 $Message" -ForegroundColor Blue }

Write-Host "`n🚀 Azure Subscription Quick Resolution" -ForegroundColor Blue
Write-Host "=" * 50 -ForegroundColor Blue

# Step 1: Check current status
Write-Action "Checking current Azure subscription status..."

try {
    $currentSub = az account show --query "{Name:name, State:state, SubscriptionId:id}" | ConvertFrom-Json
    
    if ($currentSub.State -eq "Enabled") {
        Write-Success "Current subscription '$($currentSub.Name)' is already enabled!"
        
        if (-not $CheckOnly) {
            Write-Info "Proceeding with API Center deployment..."
            
            # Run deployment script
            $deployScript = Join-Path $PSScriptRoot "deploy-to-azure-api-center.ps1"
            if (Test-Path $deployScript) {
                & $deployScript
            } else {
                Write-Warning "Deployment script not found. Please run manually:"
                Write-Host ".\scripts\deploy-to-azure-api-center.ps1" -ForegroundColor Cyan
            }
        }
        
        exit 0
    }
    
    Write-Warning "Current subscription '$($currentSub.Name)' is in state: $($currentSub.State)"
    
} catch {
    Write-Error "Failed to get current subscription status"
    Write-Info "Please ensure you're logged into Azure CLI: az login"
    exit 1
}

if ($CheckOnly) {
    Write-Info "Check-only mode. No changes will be made."
    exit 0
}

# Step 2: Look for enabled subscriptions
Write-Action "Searching for enabled subscriptions..."

try {
    $allSubs = az account list --query "[?state=='Enabled'].{Name:name, SubscriptionId:id}" | ConvertFrom-Json
    
    if ($allSubs -and $allSubs.Count -gt 0) {
        Write-Success "Found $($allSubs.Count) enabled subscription(s)"
        
        if ($allSubs.Count -eq 1) {
            $targetSub = $allSubs[0]
            Write-Action "Switching to enabled subscription: $($targetSub.Name)"
            
            az account set --subscription $targetSub.SubscriptionId
            Write-Success "Successfully switched to: $($targetSub.Name)"
            
            # Run deployment
            Write-Action "Starting API Center deployment..."
            $deployScript = Join-Path $PSScriptRoot "deploy-to-azure-api-center.ps1"
            if (Test-Path $deployScript) {
                & $deployScript
            } else {
                Write-Warning "Deployment script not found. Please run manually:"
                Write-Host ".\scripts\deploy-to-azure-api-center.ps1" -ForegroundColor Cyan
            }
            
            exit 0
        } else {
            Write-Info "Multiple enabled subscriptions found:"
            for ($i = 0; $i -lt $allSubs.Count; $i++) {
                Write-Host "  $($i + 1). $($allSubs[$i].Name)" -ForegroundColor White
            }
            
            if ($Force) {
                $choice = 1
                Write-Info "Force mode: Auto-selecting first subscription"
            } else {
                $choice = Read-Host "Select subscription (1-$($allSubs.Count))"
            }
            
            if ([int]$choice -ge 1 -and [int]$choice -le $allSubs.Count) {
                $targetSub = $allSubs[$choice - 1]
                Write-Action "Switching to: $($targetSub.Name)"
                
                az account set --subscription $targetSub.SubscriptionId
                Write-Success "Successfully switched to: $($targetSub.Name)"
                
                # Run deployment
                Write-Action "Starting API Center deployment..."
                $deployScript = Join-Path $PSScriptRoot "deploy-to-azure-api-center.ps1"
                if (Test-Path $deployScript) {
                    & $deployScript
                } else {
                    Write-Warning "Deployment script not found. Please run manually:"
                    Write-Host ".\scripts\deploy-to-azure-api-center.ps1" -ForegroundColor Cyan
                }
                
                exit 0
            } else {
                Write-Error "Invalid selection"
                exit 1
            }
        }
    }
} catch {
    Write-Warning "Could not retrieve subscription list"
}

# Step 3: No enabled subscriptions found - provide guidance
Write-Error "No enabled subscriptions found"
Write-Host "`n📋 RESOLUTION OPTIONS:" -ForegroundColor Yellow

Write-Host "`n1. 🔧 Fix Current Subscription (FASTEST):" -ForegroundColor Blue
Write-Host "   • Open Azure Portal: https://portal.azure.com"
Write-Host "   • Go to: Cost Management + Billing"
Write-Host "   • Check: Payment methods and billing status"
Write-Host "   • Update: Any expired payment methods"

Write-Host "`n2. 🆓 Create Azure Free Account:" -ForegroundColor Blue
Write-Host "   • Visit: https://azure.microsoft.com/free"
Write-Host "   • Get: `$200 credit + 12 months free services"
Write-Host "   • Use different email if you've had free trial before"

Write-Host "`n3. 🎫 Contact Azure Support:" -ForegroundColor Blue
Write-Host "   • Portal: Azure Portal → Help + Support"
Write-Host "   • Issue: Billing → Subscription Management"
Write-Host "   • Include: Subscription ID $($currentSub.SubscriptionId)"

Write-Host "`n4. ✨ Quick Free Account Setup:" -ForegroundColor Blue
if (-not $Force) {
    $createNew = Read-Host "Would you like to open the Azure Free Account page? (y/n)"
    if ($createNew -eq "y" -or $createNew -eq "Y") {
        Start-Process "https://azure.microsoft.com/free"
        Write-Success "Opened Azure Free Account page in browser"
    }
}

Write-Host "`n📱 AFTER RESOLUTION:" -ForegroundColor Yellow
Write-Host "   1. Login to new/fixed subscription: az login"
Write-Host "   2. Run this script again: .\scripts\azure-subscription-quick-resolve.ps1"
Write-Host "   3. Or run deployment directly: .\scripts\deploy-to-azure-api-center.ps1"

Write-Host "`n🎯 ESTIMATED COSTS:" -ForegroundColor Yellow
Write-Host "   • Azure API Center: ~`$5-15/month"
Write-Host "   • Storage Account: ~`$1-5/month"
Write-Host "   • Total: ~`$6-20/month"

Write-Host "`n⏱️  ESTIMATED TIME:" -ForegroundColor Yellow
Write-Host "   • Fix existing: 15-30 minutes"
Write-Host "   • New account: 30-45 minutes"
Write-Host "   • Deployment: 15-30 minutes"

Write-Host "`n" + "=" * 50 -ForegroundColor Blue
Write-Host "🔄 Run this script again after resolving subscription issues" -ForegroundColor Blue
Write-Host "=" * 50 -ForegroundColor Blue
