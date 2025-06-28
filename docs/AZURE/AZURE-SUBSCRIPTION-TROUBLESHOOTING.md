# Azure Subscription Troubleshooting Guide
# CBA API Center Project

## Issue Summary

**Problem**: ReadOnlyDisabledSubscription error when using Azure CLI
```
The subscription '3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6' is disabled and therefore marked as read only.
```

## Root Cause
Your original "Pay-As-You-Go" subscription (ID: `3bb6fd82-796d-4ad5-87f0-4d9d47d09ae6`) is disabled, preventing any write operations through Azure CLI, even though the Azure Portal may still allow some read operations.

## Solution: Use Active Subscription

### ✅ Active Subscription Details
- **Subscription Name**: Pay-As-You-Go
- **Subscription ID**: `e759446b-8bb7-4065-a0ed-9d5273a05c46`
- **Status**: Active ✅
- **Account**: menno@cbaconsult.eu

## Quick Resolution Steps

### 1. Switch to Active Subscription
```powershell
# Set the active subscription
az account set --subscription "e759446b-8bb7-4065-a0ed-9d5273a05c46"

# Verify the switch
az account show --query "{Name:name, Id:id, State:state}" --output table
```

### 2. Update All Scripts
All deployment scripts have been updated with the correct subscription ID:
- `scripts/deploy-to-azure-api-center.ps1` ✅
- `scripts/create-echo-api.ps1` ✅

### 3. Test Your Original Command
```powershell
# Your original command (now with correct subscription context)
az apic api create --resource-group cba-api-center --service-name CBAAPICenter --api-id echo-api --title "Echo API" --type "rest"
```

## Verification Commands

### Check Current Subscription
```powershell
az account show --output table
```

### List All Available Subscriptions
```powershell
az account list --output table
```

### Verify API Center Access
```powershell
# List APIs in your API Center
az apic api list --resource-group cba-api-center --service-name CBAAPICenter --output table

# Check API Center details
az apic show --resource-group cba-api-center --service-name CBAAPICenter
```

## Updated Resource Configuration

### CBA API Center Details
- **Resource Group**: `cba-api-center`
- **API Center Name**: `CBAAPICenter`
- **Subscription**: `e759446b-8bb7-4065-a0ed-9d5273a05c46` (Active)
- **Location**: East US (assumed)

### APIs to Deploy
1. **Echo API**
   - API ID: `echo-api`
   - Title: "Echo API"
   - Type: REST

2. **Standards Compliance API**
   - API ID: `standards-compliance-api`
   - Title: "Standards Compliance & Deviation Analysis API"
   - Type: REST

## Automated Deployment

### Run the Complete Deployment
```powershell
# Navigate to project root
cd c:\Users\menno\Source\Repos\requirements-gathering-agent

# Run the full deployment script
.\scripts\deploy-to-azure-api-center.ps1

# Or just create the Echo API
.\scripts\create-echo-api.ps1
```

## Prevention for Future

### 1. Always Check Subscription Status
```powershell
# Before running any Azure CLI commands
az account show --query "state" --output tsv
```

### 2. Set Default Subscription
```powershell
# Set your active subscription as default
az account set --subscription "e759446b-8bb7-4065-a0ed-9d5273a05c46"
```

### 3. Monitor Subscription Health
- Regularly check Azure Portal for subscription status
- Set up billing alerts
- Monitor credit/spending limits

## Alternative Solutions

### If CLI Still Fails

1. **Use Azure Portal**
   - Navigate to Azure API Center
   - Manually create APIs through the web interface
   - Import OpenAPI specifications

2. **Use Azure PowerShell**
   ```powershell
   # Install Azure PowerShell module if needed
   Install-Module -Name Az -Force -AllowClobber
   
   # Connect with correct subscription
   Connect-AzAccount -Subscription "e759446b-8bb7-4065-a0ed-9d5273a05c46"
   ```

3. **Use ARM Templates**
   - Deploy via Infrastructure as Code
   - More reliable for complex deployments

## Support Resources

### Microsoft Documentation
- [Azure CLI Troubleshooting](https://docs.microsoft.com/en-us/cli/azure/troubleshooting)
- [Azure API Center Documentation](https://docs.microsoft.com/en-us/azure/api-center/)
- [Subscription Management](https://docs.microsoft.com/en-us/azure/cost-management-billing/)

### Contact Support
If subscription issues persist:
1. Contact Azure Support through the Portal
2. Check with your organization's Azure administrator
3. Review billing and payment status

## Success Indicators

✅ **Subscription Active**: `az account show` returns "Enabled"  
✅ **API Center Accessible**: Can list/create APIs  
✅ **Echo API Created**: Successfully registered in catalog  
✅ **Standards API Ready**: OpenAPI spec uploaded  
✅ **Portal Access**: Can view APIs in Azure Portal  

---

**Status**: Ready for deployment with active subscription `e759446b-8bb7-4065-a0ed-9d5273a05c46`  
**Next Steps**: Run `.\scripts\create-echo-api.ps1` or the full deployment script  
**Last Updated**: June 23, 2025
