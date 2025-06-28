# Quick Echo API Creation Script
# Using your active subscription and existing Azure API Center

$SUBSCRIPTION_ID = "e759446b-8bb7-4065-a0ed-9d5273a05c46"  # Your active subscription
$RESOURCE_GROUP = "cba-api-center"
$API_CENTER_NAME = "CBAAPICenter"
$API_ID = "echo-api"
$API_TITLE = "Echo API"

Write-Host "🚀 Creating Echo API in CBA Azure API Center" -ForegroundColor Green
Write-Host "=" * 50

# Set active subscription
Write-Host "🔑 Setting active subscription..." -ForegroundColor Yellow
az account set --subscription $SUBSCRIPTION_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Subscription set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set subscription" -ForegroundColor Red
    exit 1
}

# Verify current subscription
Write-Host "📋 Current subscription info:" -ForegroundColor Cyan
az account show --output table

# Create Echo API
Write-Host "📋 Creating Echo API..." -ForegroundColor Yellow
az apic api create --resource-group $RESOURCE_GROUP --service-name $API_CENTER_NAME --api-id $API_ID --title $API_TITLE --type "rest" --subscription $SUBSCRIPTION_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Echo API created successfully!" -ForegroundColor Green
    Write-Host "🌐 You can view it in the Azure Portal at:" -ForegroundColor Cyan
    Write-Host "   https://portal.azure.com/#@cbaconsult.eu/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ApiCenter/services/$API_CENTER_NAME/apis/$API_ID" -ForegroundColor Blue
} else {
    Write-Host "❌ Failed to create Echo API" -ForegroundColor Red
    Write-Host "💡 The API might already exist. Check the Azure Portal." -ForegroundColor Yellow
}

Write-Host "`n🎉 Script completed!" -ForegroundColor Green
