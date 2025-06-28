# Quick Subscription Status Check
# Run this to check if your subscription is ready

Write-Host "🔍 Checking Azure Subscription Status..." -ForegroundColor Cyan
Write-Host ""

$subscriptionId = "3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6"

# Check subscription status
Write-Host "📋 Subscription Details:" -ForegroundColor Yellow
try {
    $subDetails = az account show --subscription $subscriptionId --query "{name:name, state:state, id:id}" -o table
    Write-Host $subDetails
}
catch {
    Write-Host "❌ Cannot access subscription yet" -ForegroundColor Red
}

Write-Host ""

# Check if API Center exists
Write-Host "🏢 API Center Status:" -ForegroundColor Yellow
try {
    $apiCenter = az apic service show --resource-group "cba-api-center" --service-name "CBAAPICenter" --subscription $subscriptionId --query "{name:name, location:location}" -o table 2>$null
    if ($apiCenter) {
        Write-Host $apiCenter
        Write-Host "✅ API Center is accessible!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  API Center not found or not accessible yet" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Cannot access API Center yet" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Tips while waiting:" -ForegroundColor Cyan
Write-Host "• New subscriptions can take 5-15 minutes to fully activate" -ForegroundColor White
Write-Host "• You can monitor status in Azure Portal" -ForegroundColor White
Write-Host "• All services should become available gradually" -ForegroundColor White
Write-Host ""
Write-Host "Ready to try? Run: .\scripts\wait-for-subscription-activation.ps1" -ForegroundColor Green
