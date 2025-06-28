# Immediate Azure Subscription Resolution Guide

## ⚠️ Current Status Summary

Based on the diagnostic results:

- **Current Subscription**: Pay-As-You-Go (State: **Warned**)
- **Alternative Subscription**: CBA-Pay-As-You-Go (State: **Disabled**)
- **Billing Accounts**: 2 available (CBA Billing Account, CBA Consultancy)
- **Deployment Status**: ❌ **BLOCKED** - No enabled subscriptions

## 🎯 Immediate Action Plan (Priority Order)

### Option 1: Resolve "Warned" Subscription (FASTEST - 15-30 minutes)

The "Pay-As-You-Go" subscription in **Warned** state is most likely to be recoverable:

#### Step 1: Check Payment Method
1. **Open Azure Portal**: https://portal.azure.com
2. **Navigate to**: Cost Management + Billing
3. **Select**: Payment methods
4. **Verify**: Credit card/payment method is not expired
5. **Update**: If payment method needs updating

#### Step 2: Check Billing Status
```powershell
# Check if there are any outstanding charges
az billing invoice list --query "[?status=='Due'].{InvoiceId:name, Amount:amountDue.value, DueDate:dueDate}" -o table
```

#### Step 3: Attempt Subscription Reactivation
1. **Azure Portal**: Go to Subscriptions
2. **Select**: Pay-As-You-Go subscription
3. **Look for**: "Reactivate" or "Enable" button
4. **Follow**: Any prompts to resolve billing issues

### Option 2: Create New Azure Free Account (RECOMMENDED - 30 minutes)

If Option 1 fails, create a new subscription:

#### Benefits
- **$200 USD credit** for 30 days
- **12 months free** popular services
- **Always free** services (25+ services)

#### Steps
1. **Visit**: https://azure.microsoft.com/free
2. **Sign up** with a different email address (if you've used free trial before)
3. **Verify** identity and provide payment method (won't be charged)
4. **Wait** for account activation (usually 5-10 minutes)

#### After Account Creation
```powershell
# Login with new account
az login

# Verify new subscription is enabled
az account show --query "{Name:name, State:state, SubscriptionId:id}" -o table

# Set as default if needed
az account set --subscription <new-subscription-id>
```

### Option 3: Contact Azure Support (2-24 hours)

For enterprise scenarios or if you need to keep existing subscriptions:

#### Create Support Request
1. **Azure Portal**: https://portal.azure.com
2. **Navigate**: Help + Support → New support request
3. **Issue Type**: Billing
4. **Problem Type**: Subscription Management
5. **Subject**: "Subscription in Warned state - need reactivation"
6. **Details**: Include subscription ID `3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6`

## 🚀 Deployment Readiness Check

Once you have an enabled subscription, run this verification:

```powershell
# Quick verification script
cd "c:\Users\menno\Source\Repos\requirements-gathering-agent"

# Re-run diagnostic
.\scripts\azure-subscription-diagnostic.ps1

# If diagnostic shows "Enabled" subscription, proceed with deployment
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Ready for deployment!" -ForegroundColor Green
    .\scripts\deploy-to-azure-api-center.ps1
} else {
    Write-Host "❌ Still need to resolve subscription issues" -ForegroundColor Red
}
```

## 💰 Cost Management Setup (IMPORTANT)

After getting an enabled subscription, immediately set up cost controls:

### 1. Create Budget Alert
```powershell
# Create a $50/month budget with alerts
az consumption budget create \
  --budget-name "monthly-api-center-budget" \
  --amount 50 \
  --time-grain Monthly \
  --time-period start-date="2025-01-01" \
  --resource-group "rg-api-center-standards" \
  --category Cost \
  --notifications \
    actual=@{
      "enabled"="true";
      "operator"="GreaterThan";
      "threshold"="80";
      "contactEmails"=@("menno@cbaconsult.eu")
    }
```

### 2. Set Up Spending Limit (Free accounts)
```powershell
# Check if spending limit is available
az account show --query "state" -o tsv

# For free accounts, spending limit is usually enabled by default
# Verify in Azure Portal: Subscriptions → Your subscription → Usage + quotas
```

## 📋 Resource Deployment Checklist

Once subscription is enabled:

- [ ] **Subscription verified as "Enabled"**
- [ ] **Billing alerts configured**
- [ ] **Resource providers registered** (auto-handled by deployment script)
- [ ] **Resource group created**: `rg-api-center-standards`
- [ ] **Azure API Center deployed**: `apic-standards-compliance-xxx`
- [ ] **Storage account created**: For API specifications
- [ ] **APIs registered**: Upload OpenAPI specifications
- [ ] **Dev Proxy configured**: For local development

## 🔧 Troubleshooting Common Issues

### Issue: "Insufficient privileges" error
**Solution**: Ensure you have Contributor or Owner role on subscription

### Issue: "Resource provider not registered"
**Solution**: Run the diagnostic script with `-AutoResolve` flag
```powershell
.\scripts\azure-subscription-diagnostic.ps1 -AutoResolve
```

### Issue: "Quota exceeded"
**Solution**: Check quota in specific region
```powershell
az vm list-usage --location "West Europe" --query "[?name.value=='cores'].{Name:name.localizedValue, Current:currentValue, Limit:limit}" -o table
```

## 📞 Support Contacts

### Microsoft Azure Support
- **Portal**: https://portal.azure.com → Help + Support
- **Phone**: Available in Azure Portal (varies by region)
- **Community**: Microsoft Q&A (https://docs.microsoft.com/answers/)

### Internal CBA Support
- **Primary Contact**: menno@cbaconsult.eu
- **Billing Contact**: Check CBA Billing Account details
- **IT Support**: Internal CBA IT team

## 📈 Expected Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| **Phase 1**: Subscription Resolution | 15-30 min | 🟡 In Progress |
| **Phase 2**: Cost Controls Setup | 10-15 min | ⏳ Pending |
| **Phase 3**: Resource Deployment | 15-30 min | ⏳ Pending |
| **Phase 4**: API Registration | 15-20 min | ⏳ Pending |
| **Total** | **55-95 min** | **🎯 Target** |

## 🎯 Success Criteria

✅ **Subscription Status**: Enabled  
✅ **Cost Controls**: Budget alerts active  
✅ **API Center**: Deployed and accessible  
✅ **APIs Registered**: OpenAPI specs uploaded  
✅ **Documentation**: Complete and accessible  

---

**Next Action**: Choose Option 1, 2, or 3 above based on your preference and timeline requirements.

**Recommendation**: Start with Option 1 (resolve Warned subscription) as it's fastest, then move to Option 2 (new free account) if needed.
