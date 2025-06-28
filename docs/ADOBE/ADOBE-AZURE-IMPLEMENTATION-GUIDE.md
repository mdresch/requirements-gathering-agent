# Adobe.io + Azure Implementation Guide

## Prerequisites Checklist

✅ **You already have:** Adobe.io Developer Console access  
🔲 **You need:** Azure subscription with appropriate permissions  
🔲 **You need:** Azure CLI or PowerShell installed  
🔲 **You need:** Node.js/npm for Azure Functions development  

## Quick Start Implementation (Phase 1)

### Step 1: Set Up Azure Key Vault for Adobe Credentials

```bash
# Create resource group
az group create --name adobe-integration-rg --location eastus

# Create Key Vault
az keyvault create --name your-adobe-keyvault --resource-group adobe-integration-rg --location eastus

# Store Adobe credentials securely
az keyvault secret set --vault-name your-adobe-keyvault --name "adobe-client-id" --value "your-client-id"
az keyvault secret set --vault-name your-adobe-keyvault --name "adobe-client-secret" --value "your-client-secret"
az keyvault secret set --vault-name your-adobe-keyvault --name "adobe-org-id" --value "your-org-id"
```

### Step 2: Create Azure Function for PDF Processing

```javascript
// Azure Function: processMarkdownToPDF
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

module.exports = async function (context, req) {
    try {
        // Get Adobe credentials from Key Vault
        const credential = new DefaultAzureCredential();
        const vaultUrl = process.env.KEY_VAULT_URL;
        const client = new SecretClient(vaultUrl, credential);
        
        const clientId = await client.getSecret("adobe-client-id");
        const clientSecret = await client.getSecret("adobe-client-secret");
        
        // Get access token from Adobe
        const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId.value,
                client_secret: clientSecret.value,
                scope: 'openid,AdobeID,session'
            })
        });
        
        const { access_token } = await tokenResponse.json();
        
        // Call Adobe PDF Services API
        const pdfResponse = await fetch('https://pdf-services.adobe.io/operation/createpdf', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-api-key': clientId.value
            },
            body: JSON.stringify({
                // Adobe PDF Services parameters
                assetID: req.body.markdownContent,
                outputFormat: 'pdf'
            })
        });
        
        const result = await pdfResponse.json();
        
        context.res = {
            status: 200,
            body: {
                success: true,
                downloadUrl: result.downloadUri,
                message: "PDF generated successfully"
            }
        };
        
    } catch (error) {
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};
```

### Step 3: Deploy and Test

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create Function App
func init AdobeIntegrationApp --typescript
cd AdobeIntegrationApp
func new --name processMarkdownToPDF --template "HTTP trigger"

# Deploy to Azure
az functionapp create --resource-group adobe-integration-rg --consumption-plan-location eastus --runtime node --runtime-version 18 --functions-version 4 --name your-adobe-function-app --storage-account yourstorageaccount

# Deploy function code
func azure functionapp publish your-adobe-function-app
```

### Step 4: Integration with Your ADPA System

```typescript
// Add to your existing ADPA word.ts file
export async function convertMarkdownToAdobePDF(
  event: Office.AddinCommands.Event,
  markdownContent?: string
) {
  try {
    // Get markdown content from current document or parameter
    const content = markdownContent || await getCurrentDocumentContent();
    
    // Call Azure Function
    const response = await fetch('https://your-adobe-function-app.azurewebsites.net/api/processMarkdownToPDF', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdownContent: content })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success message with download link
      await showSuccessMessage(`PDF generated successfully! Download: ${result.downloadUrl}`);
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error('Adobe PDF conversion failed:', error);
    await showErrorMessage('Failed to generate PDF. Please try again.');
  }
  
  event.completed();
}

async function getCurrentDocumentContent(): Promise<string> {
  return new Promise((resolve) => {
    Word.run(async (context) => {
      const body = context.document.body;
      context.load(body, 'text');
      await context.sync();
      resolve(body.text);
    });
  });
}

async function showSuccessMessage(message: string): Promise<void> {
  // Implementation depends on your UI framework
  console.log(message);
}

async function showErrorMessage(message: string): Promise<void> {
  // Implementation depends on your UI framework
  console.error(message);
}
```

## Advanced Implementation (Phase 2)

### Azure Logic App for Workflow Automation

```json
{
  "definition": {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "triggers": {
      "When_a_file_is_created": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['azureblob']['connectionId']"
            }
          },
          "method": "get",
          "path": "/datasets/default/triggers/batch/onupdatedfile",
          "queries": {
            "folderId": "generated-documents",
            "maxFileCount": 10
          }
        }
      }
    },
    "actions": {
      "Process_with_Adobe": {
        "type": "Function",
        "inputs": {
          "function": {
            "id": "/subscriptions/{subscription-id}/resourceGroups/adobe-integration-rg/providers/Microsoft.Web/sites/your-adobe-function-app/functions/processMarkdownToPDF"
          },
          "body": {
            "markdownContent": "@triggerBody()?['content']",
            "fileName": "@triggerBody()?['name']"
          }
        }
      },
      "Save_to_SharePoint": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['sharepointonline']['connectionId']"
            }
          },
          "method": "post",
          "path": "/datasets/{site-id}/files",
          "body": "@body('Process_with_Adobe')?['content']"
        }
      },
      "Notify_Teams": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['teams']['connectionId']"
            }
          },
          "method": "post",
          "path": "/v1.0/teams/{team-id}/channels/{channel-id}/messages",
          "body": {
            "body": {
              "content": "New professional document generated: @{body('Process_with_Adobe')?['downloadUrl']}"
            }
          }
        }
      }
    }
  }
}
```

## Cost Estimation

### Phase 1 (Basic PDF Generation)
- **Azure Functions:** ~$10-20/month (based on executions)
- **Azure Key Vault:** ~$3/month
- **Azure Blob Storage:** ~$5-10/month
- **Adobe PDF Services API:** ~$0.50-2.00 per document
- **Total:** ~$20-35/month + per-document Adobe costs

### Phase 2 (Advanced Processing)
- **Additional Container Apps:** ~$50-100/month
- **Service Bus:** ~$10/month
- **Logic Apps:** ~$20-40/month
- **Additional storage:** ~$10-20/month
- **Total:** ~$110-205/month + per-document Adobe costs

## Testing and Validation

### 1. Test Adobe Credentials
```bash
# Test Adobe API access
curl -X POST "https://ims-na1.adobelogin.com/ims/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=openid,AdobeID,session"
```

### 2. Test Azure Function
```bash
# Test function locally
func start

# Test deployed function
curl -X POST "https://your-adobe-function-app.azurewebsites.net/api/processMarkdownToPDF" \
  -H "Content-Type: application/json" \
  -d '{"markdownContent": "# Test Document\n\nThis is a test."}'
```

### 3. Monitor and Optimize
- Use Azure Application Insights for performance monitoring
- Track Adobe API usage and costs
- Monitor function execution times and error rates
- Optimize based on usage patterns

## Troubleshooting Common Issues

### Adobe API Authentication
- Verify client ID and secret are correct
- Check organization ID if using enterprise features
- Ensure proper scopes are requested

### Azure Function Issues
- Check Key Vault permissions for the function's managed identity
- Verify environment variables are set correctly
- Monitor function logs in Azure portal

### Performance Optimization
- Implement caching for frequently generated documents
- Use Azure CDN for faster document delivery
- Consider batch processing for multiple documents

## Next Steps

1. **Immediate:** Set up Phase 1 with basic PDF generation
2. **Week 2:** Test with real documents from your generated-documents folder
3. **Week 3:** Implement Phase 2 with workflow automation
4. **Week 4:** Add monitoring and optimization
5. **Ongoing:** Scale to additional Adobe services (InDesign, Illustrator)

This implementation guide provides a clear path from your current Adobe.io access to a fully automated, enterprise-grade document processing system powered by Azure services.
