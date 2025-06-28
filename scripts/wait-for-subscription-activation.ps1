# Wait for Azure Subscription Activation and Create Echo API
# This script monitors subscription activation and creates the Echo API once ready

param(
    [string]$SubscriptionId = "3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6",
    [string]$ResourceGroup = "rg-api-center",
    [string]$ServiceName = "svc-api-center",
    [int]$MaxWaitMinutes = 15
)

Write-Host "🚀 Monitoring Azure Subscription Activation..." -ForegroundColor Cyan
Write-Host "Subscription ID: $SubscriptionId" -ForegroundColor Yellow
Write-Host "Max wait time: $MaxWaitMinutes minutes" -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date
$maxEndTime = $startTime.AddMinutes($MaxWaitMinutes)

function Test-SubscriptionStatus {
    param([string]$SubId)
    
    try {
        $result = az account show --subscription $SubId --query "state" -o tsv 2>$null
        return $result -eq "Enabled"
    }
    catch {
        return $false
    }
}

function Test-ResourceGroupAccess {
    param([string]$SubId, [string]$RgName)
    
    try {
        az group show --name $RgName --subscription $SubId --query "name" -o tsv 2>$null
        return $?
    }
    catch {
        return $false
    }
}

# Wait for subscription activation
$attempt = 1
while ((Get-Date) -lt $maxEndTime) {
    Write-Host "⏱️  Attempt $attempt - Checking subscription status..." -ForegroundColor Gray
    
    if (Test-SubscriptionStatus -SubId $SubscriptionId) {
        Write-Host "✅ Subscription is now active!" -ForegroundColor Green
        
        # Check resource group access
        Write-Host "🔍 Checking resource group access..." -ForegroundColor Gray
        if (Test-ResourceGroupAccess -SubId $SubscriptionId -RgName $ResourceGroup) {
            Write-Host "✅ Resource group access confirmed!" -ForegroundColor Green
            break
        }
        else {
            Write-Host "⚠️  Resource group not accessible yet, waiting..." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⏳ Subscription still activating..." -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 30
    $attempt++
}

if ((Get-Date) -ge $maxEndTime) {
    Write-Host "❌ Timeout: Subscription not activated within $MaxWaitMinutes minutes" -ForegroundColor Red
    Write-Host "Please check your subscription status in the Azure portal" -ForegroundColor Yellow
    exit 1
}

# Create Echo API
Write-Host ""
Write-Host "🎯 Creating Echo API..." -ForegroundColor Cyan

try {
    $result = az apic api create `
        --resource-group $ResourceGroup `
        --service-name $ServiceName `
        --api-id "echo-api" `
        --title "Echo API" `
        --type "rest" `
        --subscription $SubscriptionId

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Echo API created successfully!" -ForegroundColor Green
        Write-Host $result
    }
    else {
        Write-Host "❌ Failed to create Echo API" -ForegroundColor Red
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $result
    }
}
catch {
    Write-Host "❌ Exception while creating Echo API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify the API was created in Azure Portal" -ForegroundColor White
Write-Host "2. Add API definitions and environments" -ForegroundColor White
Write-Host "3. Run the Standards Compliance API deployment" -ForegroundColor White
Write-Host ""
Write-Host "Ready to deploy Standards Compliance API? Run:" -ForegroundColor Yellow
Write-Host ".\scripts\deploy-to-azure-api-center.ps1 -SubscriptionId $SubscriptionId" -ForegroundColor Gray
