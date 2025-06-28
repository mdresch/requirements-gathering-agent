# Free Tier Security Implementation Guide

## 🛡️ Maximum Security Configuration for Azure Free Account

This guide provides step-by-step implementation of enterprise-grade security practices within Azure Free Tier limitations.

## Phase 1: Identity & Access Security (Day 1)

### 1.1 Azure Active Directory Configuration

```powershell
# After creating your free Azure account, immediately configure basic security

# Enable MFA for your account (do this first!)
# Portal: Azure AD > Users > Multi-Factor Authentication
# Select your user > Enable

# Create additional admin account with MFA
az ad user create \
    --display-name "Admin-Backup" \
    --password "TempPassword123!" \
    --user-principal-name "admin-backup@yourdomain.onmicrosoft.com" \
    --force-change-password-next-login true

# Assign Global Administrator role (use sparingly)
az role assignment create \
    --assignee "admin-backup@yourdomain.onmicrosoft.com" \
    --role "Global Administrator"
```

### 1.2 Strong Password Policy (Manual Enforcement)
```yaml
Password Requirements (Document and Enforce):
  - Minimum 14 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - No dictionary words
  - No personal information
  - Change every 90 days for admin accounts
  - No password reuse (last 12 passwords)
```

### 1.3 Privileged Access Management
```powershell
# Create custom roles for least privilege access
az role definition create --role-definition '{
    "Name": "API Center Manager",
    "Description": "Can manage API Center resources only",
    "Actions": [
        "Microsoft.ApiCenter/*",
        "Microsoft.Resources/subscriptions/resourceGroups/read"
    ],
    "NotActions": [],
    "AssignableScopes": ["/subscriptions/YOUR-SUBSCRIPTION-ID"]
}'

# Assign role to specific users instead of broad permissions
az role assignment create \
    --assignee "user@yourdomain.com" \
    --role "API Center Manager" \
    --scope "/subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/rg-api-center"
```

## Phase 2: Network Security (Day 2)

### 2.1 Network Security Groups (NSGs)

```json
{
  "name": "nsg-api-center-strict",
  "location": "West Europe",
  "properties": {
    "securityRules": [
      {
        "name": "AllowHTTPS",
        "properties": {
          "protocol": "Tcp",
          "sourcePortRange": "*",
          "destinationPortRange": "443",
          "sourceAddressPrefix": "*",
          "destinationAddressPrefix": "*",
          "access": "Allow",
          "priority": 1000,
          "direction": "Inbound"
        }
      },
      {
        "name": "AllowAdminSSH",
        "properties": {
          "protocol": "Tcp",
          "sourcePortRange": "*",
          "destinationPortRange": "22",
          "sourceAddressPrefix": "YOUR-ADMIN-IP/32",
          "destinationAddressPrefix": "*",
          "access": "Allow",
          "priority": 1100,
          "direction": "Inbound"
        }
      },
      {
        "name": "DenyAllInbound",
        "properties": {
          "protocol": "*",
          "sourcePortRange": "*",
          "destinationPortRange": "*",
          "sourceAddressPrefix": "*",
          "destinationAddressPrefix": "*",
          "access": "Deny",
          "priority": 4096,
          "direction": "Inbound"
        }
      }
    ]
  }
}
```

### 2.2 IP Allowlisting Strategy
```powershell
# Create NSG with strict IP allowlisting
az network nsg create \
    --resource-group rg-api-center \
    --name nsg-api-center-strict \
    --location "West Europe"

# Allow only your office/home IP for admin access
az network nsg rule create \
    --resource-group rg-api-center \
    --nsg-name nsg-api-center-strict \
    --name AllowAdminAccess \
    --protocol Tcp \
    --priority 1000 \
    --destination-port-range 443 \
    --source-address-prefixes "YOUR-IP/32" "OFFICE-IP/32" \
    --access Allow
```

## Phase 3: Data Protection (Day 3)

### 3.1 Azure Key Vault Setup (Free Tier)

```powershell
# Create Key Vault with maximum security for free tier
az keyvault create \
    --name "kv-api-center-$(Get-Random)" \
    --resource-group rg-api-center \
    --location "West Europe" \
    --sku standard \
    --enabled-for-disk-encryption true \
    --enabled-for-deployment false \
    --enabled-for-template-deployment false \
    --enable-soft-delete true \
    --retention-days 90

# Set access policy with minimal permissions
az keyvault set-policy \
    --name "kv-api-center-123456" \
    --upn "your-email@domain.com" \
    --secret-permissions get list set delete \
    --key-permissions get list create delete \
    --certificate-permissions get list create delete
```

### 3.2 Storage Account Security

```powershell
# Create storage account with maximum security
az storage account create \
    --name "stgapicenter$(Get-Random)" \
    --resource-group rg-api-center \
    --location "West Europe" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --https-only true \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access false \
    --default-action Deny

# Enable storage encryption (default in Azure)
az storage account update \
    --name "stgapicenter123456" \
    --resource-group rg-api-center \
    --encryption-services blob file
```

### 3.3 Database Security (if using Azure SQL)

```sql
-- SQL Database security configuration
ALTER DATABASE [your-database] SET ENCRYPTION ON;

-- Enable Transparent Data Encryption
CREATE DATABASE ENCRYPTION KEY
WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE [YourServerCertificate];

-- Enable Dynamic Data Masking for sensitive columns
ALTER TABLE Customers 
ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');

ALTER TABLE Customers 
ALTER COLUMN Phone ADD MASKED WITH (FUNCTION = 'partial(1,"XXX-XXX-",4)');
```

## Phase 4: Monitoring & Alerting (Day 4)

### 4.1 Azure Monitor Configuration

```powershell
# Create Log Analytics workspace (500MB free per day)
az monitor log-analytics workspace create \
    --resource-group rg-api-center \
    --workspace-name law-api-center \
    --location "West Europe" \
    --sku Free

# Enable diagnostic settings for key resources
az monitor diagnostic-settings create \
    --name "api-center-diagnostics" \
    --resource "/subscriptions/YOUR-SUB/resourceGroups/rg-api-center/providers/Microsoft.ApiCenter/services/api-center-name" \
    --workspace "/subscriptions/YOUR-SUB/resourceGroups/rg-api-center/providers/Microsoft.OperationalInsights/workspaces/law-api-center" \
    --logs '[{"category":"ApiCenterLogs","enabled":true}]' \
    --metrics '[{"category":"AllMetrics","enabled":true}]'
```

### 4.2 Security Alerts (Free Tier)

```powershell
# Create action group for alerts
az monitor action-group create \
    --name "security-alerts" \
    --resource-group rg-api-center \
    --short-name "SecAlert" \
    --email-receiver name="admin" email-address="your-email@domain.com"

# Create alert for failed login attempts
az monitor metrics alert create \
    --name "Failed-Logins" \
    --resource-group rg-api-center \
    --scopes "/subscriptions/YOUR-SUB/resourceGroups/rg-api-center" \
    --condition "count 'Sign-in activity' > 5" \
    --window-size 5m \
    --evaluation-frequency 1m \
    --action "security-alerts" \
    --description "Alert on multiple failed login attempts"
```

### 4.3 Cost Monitoring (Critical for Free Tier)

```powershell
# Create budget alert to prevent unexpected charges
az consumption budget create \
    --budget-name "monthly-budget" \
    --amount 10 \
    --time-grain Monthly \
    --start-date "2025-07-01" \
    --end-date "2025-12-31" \
    --resource-group rg-api-center \
    --notifications '[{
        "enabled": true,
        "operator": "GreaterThan",
        "threshold": 80,
        "contactEmails": ["your-email@domain.com"],
        "contactRoles": ["Owner"]
    }]'
```

## Phase 5: Backup & Recovery (Day 5)

### 5.1 Automated Backup Strategy

```powershell
# Create Recovery Services Vault
az backup vault create \
    --resource-group rg-api-center \
    --name rsv-api-center \
    --location "West Europe"

# Configure backup for important data
az backup policy create \
    --resource-group rg-api-center \
    --vault-name rsv-api-center \
    --name "DailyBackupPolicy" \
    --backup-management-type AzureStorage \
    --policy '{
        "schedulePolicy": {
            "schedulePolicyType": "SimpleSchedulePolicy",
            "scheduleRunFrequency": "Daily",
            "scheduleRunTimes": ["2025-01-01T02:00:00.000Z"]
        },
        "retentionPolicy": {
            "retentionPolicyType": "LongTermRetentionPolicy",
            "dailySchedule": {
                "retentionTimes": ["2025-01-01T02:00:00.000Z"],
                "retentionDuration": {
                    "count": 30,
                    "durationType": "Days"
                }
            }
        }
    }'
```

### 5.2 Configuration Backup

```powershell
# Export ARM templates for infrastructure as code backup
az group export \
    --resource-group rg-api-center \
    --output-format json \
    > backup-infrastructure-$(Get-Date -Format "yyyyMMdd").json

# Backup Key Vault secrets (encrypted)
az keyvault secret list \
    --vault-name kv-api-center-123456 \
    --query "[].{name:name,id:id}" \
    --output json > backup-secrets-list-$(Get-Date -Format "yyyyMMdd").json
```

## Phase 6: Compliance & Governance (Day 6-7)

### 6.1 Azure Policy Implementation

```json
{
  "if": {
    "field": "type",
    "equals": "Microsoft.Storage/storageAccounts"
  },
  "then": {
    "effect": "deny",
    "details": {
      "reason": "Storage accounts must have HTTPS-only enabled"
    }
  },
  "condition": {
    "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly",
    "equals": "false"
  }
}
```

### 6.2 Resource Tagging Strategy

```powershell
# Apply mandatory tags to all resources
az resource tag \
    --resource-group rg-api-center \
    --name "api-center-service" \
    --resource-type "Microsoft.ApiCenter/services" \
    --tags Environment=Production Owner=admin@company.com CostCenter=IT Classification=Internal

# Create policy to enforce tagging
az policy definition create \
    --name "require-tags" \
    --display-name "Require specific tags" \
    --description "Requires specific tags on all resources" \
    --rules '{
        "if": {
            "anyOf": [
                {"field": "tags[Environment]", "exists": "false"},
                {"field": "tags[Owner]", "exists": "false"},
                {"field": "tags[Classification]", "exists": "false"}
            ]
        },
        "then": {
            "effect": "deny"
        }
    }'
```

## Phase 7: Operational Security Procedures

### 7.1 Daily Security Checklist

```yaml
Daily Tasks (5 minutes):
  - [ ] Check Azure Security Center recommendations
  - [ ] Review activity logs for suspicious activities
  - [ ] Verify backup completion status
  - [ ] Check cost consumption (stay within free limits)

Weekly Tasks (30 minutes):
  - [ ] Review user access and permissions
  - [ ] Check for software updates and patches
  - [ ] Review security policies and procedures
  - [ ] Audit resource configurations

Monthly Tasks (2 hours):
  - [ ] Complete security assessment
  - [ ] Review and update incident response plan
  - [ ] Conduct backup restore test
  - [ ] Review and update security documentation
```

### 7.2 Incident Response Plan (Free Tier)

```yaml
Security Incident Response:
  Level 1 (Low Impact):
    - Response Time: 4 hours
    - Actions: Log incident, assess impact, implement fix
    - Escalation: If not resolved in 8 hours
    
  Level 2 (Medium Impact):
    - Response Time: 1 hour
    - Actions: Immediate containment, assess scope, notify stakeholders
    - Escalation: If business operations affected
    
  Level 3 (High Impact):
    - Response Time: 15 minutes
    - Actions: Emergency response, disable compromised accounts, notify authorities
    - Escalation: Immediate management notification

Contact Information:
  - Primary: your-email@domain.com
  - Secondary: backup-admin@domain.com
  - Emergency: +1-XXX-XXX-XXXX
```

## Phase 8: Third-Party Security Enhancements (Free)

### 8.1 Free Security Tools Integration

```yaml
Cloudflare (Free Tier):
  - DDoS protection
  - Web Application Firewall
  - SSL/TLS encryption
  Setup: Point your domain to Cloudflare nameservers

Let's Encrypt (Free):
  - SSL certificates
  - Automated renewal
  Setup: Use certbot or Azure App Service built-in

OWASP ZAP (Free):
  - Security testing
  - Vulnerability scanning
  Setup: Download and configure for your APIs

HaveIBeenPwned API (Free):
  - Password breach monitoring
  - Email compromise detection
  Setup: Integrate with your user management system
```

### 8.2 Open Source Monitoring Stack

```yaml
ELK Stack (Self-hosted):
  Components:
    - Elasticsearch: Log storage and search
    - Logstash: Log processing
    - Kibana: Visualization and dashboards
  
  Setup:
    - Deploy on Azure Container Instances (free tier)
    - Configure log forwarding from Azure Monitor
    - Create security dashboards and alerts

Prometheus + Grafana:
  Components:
    - Prometheus: Metrics collection
    - Grafana: Visualization
    - AlertManager: Alert routing
  
  Setup:
    - Deploy on Azure Container Instances
    - Configure Azure Monitor integration
    - Set up alerting rules for security events
```

## 🎯 Success Metrics

### Security KPIs (Free Tier)

```yaml
Identity Security:
  - MFA adoption rate: 100%
  - Privileged access reviews: Monthly
  - Password policy compliance: 100%
  - Failed login attempts: < 5 per day

Network Security:
  - NSG rule compliance: 100%
  - Unauthorized access attempts: 0
  - Network segmentation: Implemented
  - SSL/TLS usage: 100%

Data Protection:
  - Encryption at rest: 100%
  - Encryption in transit: 100%
  - Backup success rate: 100%
  - Key rotation: Quarterly

Monitoring:
  - Alert response time: < 1 hour
  - Log analysis coverage: Daily
  - Security review completion: 100%
  - Incident documentation: 100%
```

## 📋 Implementation Timeline

| Phase | Duration | Critical Path | Dependencies |
|-------|----------|---------------|--------------|
| **Phase 1**: Identity Setup | Day 1 | Azure AD + MFA | Azure account created |
| **Phase 2**: Network Security | Day 2 | NSG configuration | Resource groups created |
| **Phase 3**: Data Protection | Day 3 | Key Vault + encryption | Network security complete |
| **Phase 4**: Monitoring | Day 4 | Alerts + logging | Resources deployed |
| **Phase 5**: Backup | Day 5 | Recovery procedures | Data protection complete |
| **Phase 6**: Compliance | Day 6-7 | Policies + governance | All phases complete |
| **Phase 7**: Operations | Day 8+ | Ongoing procedures | Framework established |

## 💡 Pro Tips for Free Tier Security

### Maximize Your Free Quotas
- **Log Analytics**: 500MB/day - focus on security logs only
- **Storage**: Use lifecycle policies to manage costs
- **Compute**: Use B1s instances for minimal workloads
- **Monitoring**: Consolidate alerts to reduce noise

### Cost Optimization
- **Tag everything** for cost tracking
- **Set up billing alerts** at $5, $10, $15 thresholds
- **Use Azure Advisor** recommendations
- **Monitor daily** to avoid surprises

### Security Best Practices
- **Document everything** - compensate for limited tooling with good documentation
- **Regular reviews** - manual processes are more critical in free tier
- **Community support** - leverage free community resources
- **Stay updated** - follow Azure security blogs and updates

---

**Result**: Enterprise-grade security baseline achieved within Azure Free Tier constraints, suitable for revenue-generating operations with documented acceptable risk levels.
