# 🚀 Real Adobe API Integration - Implementation Plan

## 📋 **Phase 2: Production Adobe API Integration**

This guide provides a comprehensive roadmap for transitioning from the current mock implementation to real Adobe PDF Services API integration.

---

## 🎯 **STEP 1: Adobe API Prerequisites**

### **1.1 Adobe Developer Account Setup**

#### **Create Adobe Developer Account**
1. **Visit**: [Adobe Developer Console](https://developer.adobe.com/console)
2. **Sign up**: Use business email for enterprise accounts
3. **Verify**: Complete email verification process

#### **Create New Project**
1. **Navigate**: Adobe Developer Console → Projects
2. **Create Project**: Choose "Empty Project" or "Document Generation"
3. **Add Services**: Select "PDF Services API"

#### **Generate Credentials**
```bash
# Required credential types for Adobe PDF Services
1. Client ID (Public identifier)
2. Client Secret (Private key) 
3. Organization ID (Org identifier)
4. Account ID (Account identifier)
5. Private Key (JWT authentication)
```

### **1.2 Adobe PDF Services SDK Installation**

#### **Install Official Adobe SDK**
```bash
# Install Adobe PDF Services Node.js SDK
npm install @adobe/pdfservices-node-sdk

# Install additional dependencies for file handling
npm install multer form-data
```

#### **Install Supporting Libraries**
```bash
# For enhanced file operations
npm install fs-extra mime-types

# For better error handling
npm install axios-retry
```

---

## 🔧 **STEP 2: Configuration Updates**

### **2.1 Update Environment Variables**

#### **Update `.env.adobe.template`**
```bash
# Adobe PDF Services API Configuration
ADOBE_CLIENT_ID=your_client_id_here
ADOBE_CLIENT_SECRET=your_client_secret_here
ADOBE_ORGANIZATION_ID=your_org_id_here
ADOBE_ACCOUNT_ID=your_account_id_here
ADOBE_PRIVATE_KEY_PATH=./private.key
ADOBE_ENVIRONMENT=production

# Adobe API Endpoints
ADOBE_PDF_SERVICES_BASE_URL=https://pdf-services.adobe.io
ADOBE_IMS_BASE_URL=https://ims-na1.adobelogin.com

# Enhanced Configuration
ADOBE_WEBHOOK_URL=https://your-domain.com/adobe/webhook
ADOBE_MAX_RETRIES=3
ADOBE_TIMEOUT_MS=30000
ADOBE_ENABLE_LOGGING=true
```

### **2.2 Azure Key Vault Integration**

#### **Store Sensitive Credentials in Azure Key Vault**
```typescript
// src/adobe/azure-config.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

export class AzureAdobeConfig {
  private secretClient: SecretClient;

  constructor(keyVaultUrl: string) {
    const credential = new DefaultAzureCredential();
    this.secretClient = new SecretClient(keyVaultUrl, credential);
  }

  async getAdobeCredentials() {
    try {
      const [clientId, clientSecret, orgId, accountId, privateKey] = await Promise.all([
        this.secretClient.getSecret('adobe-client-id'),
        this.secretClient.getSecret('adobe-client-secret'),
        this.secretClient.getSecret('adobe-org-id'),
        this.secretClient.getSecret('adobe-account-id'),
        this.secretClient.getSecret('adobe-private-key')
      ]);

      return {
        clientId: clientId.value!,
        clientSecret: clientSecret.value!,
        organizationId: orgId.value!,
        accountId: accountId.value!,
        privateKey: privateKey.value!
      };
    } catch (error) {
      throw new Error(`Failed to retrieve Adobe credentials: ${error}`);
    }
  }
}
```

---

## 📝 **STEP 3: Core Implementation Updates**

### **3.1 Replace PDF Processor with Real Adobe API**

#### **Update `src/adobe/pdf-processor.ts`**
```typescript
import { 
  PDFServices, 
  MimeType, 
  CreatePDFJob, 
  CreatePDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError 
} from '@adobe/pdfservices-node-sdk';
import { AzureAdobeConfig } from './azure-config.js';
import { CircuitBreaker } from '../utils/circuit-breaker.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { logger } from '../utils/logger.js';

export class AdobePDFProcessor {
  private pdfServices: PDFServices;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private azureConfig: AzureAdobeConfig;

  constructor() {
    this.azureConfig = new AzureAdobeConfig(process.env.AZURE_KEY_VAULT_URL!);
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000
    });
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 100 // Adobe API limits
    });
  }

  async initialize(): Promise<void> {
    try {
      const credentials = await this.azureConfig.getAdobeCredentials();
      
      this.pdfServices = new PDFServices({
        credentials: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          organizationId: credentials.organizationId,
          accountId: credentials.accountId,
          privateKey: credentials.privateKey
        }
      });

      logger.info('Adobe PDF Services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Adobe PDF Services', { error });
      throw error;
    }
  }

  async generatePDF(input: PDFGenerationInput): Promise<PDFGenerationResult> {
    return this.circuitBreaker.execute(async () => {
      await this.rateLimiter.checkLimit();

      try {
        logger.info('Starting PDF generation', { templateId: input.templateId });

        // Create PDF from HTML content
        const createPDFJob: CreatePDFJob = this.pdfServices.createJob()
          .setInput({
            source: input.htmlContent,
            mimeType: MimeType.HTML
          })
          .setOptions({
            pageLayout: {
              pageSize: 'A4'
            },
            documentLanguage: 'en-US'
          });

        const result: CreatePDFResult = await this.pdfServices.submit(createPDFJob);
        const resultAsset = await this.pdfServices.getContent(result.asset);

        logger.info('PDF generated successfully', { 
          assetId: result.asset.assetID,
          size: resultAsset.readableStreamBody?.readableLength 
        });

        return {
          success: true,
          pdfBuffer: resultAsset.readableStreamBody,
          assetId: result.asset.assetID,
          metadata: {
            generatedAt: new Date().toISOString(),
            templateId: input.templateId,
            pageCount: await this.getPageCount(resultAsset.readableStreamBody)
          }
        };

      } catch (error) {
        logger.error('PDF generation failed', { error, input });
        
        if (error instanceof ServiceUsageError) {
          throw new Error('Adobe API quota exceeded');
        } else if (error instanceof ServiceApiError) {
          throw new Error(`Adobe API error: ${error.message}`);
        } else if (error instanceof SDKError) {
          throw new Error(`Adobe SDK error: ${error.message}`);
        }
        
        throw error;
      }
    });
  }

  private async getPageCount(pdfBuffer: any): Promise<number> {
    // Implement page counting logic
    return 1; // Placeholder
  }
}
```

### **3.2 Update Document Intelligence with Real Adobe API**

#### **Update `src/adobe/document-intelligence.ts`**
```typescript
import { 
  PDFServices, 
  ExtractPDFJob, 
  ExtractPDFResult,
  ExtractPDFOptions 
} from '@adobe/pdfservices-node-sdk';

export class DocumentIntelligence {
  private pdfServices: PDFServices;

  async extractText(pdfBuffer: Buffer): Promise<DocumentAnalysisResult> {
    try {
      logger.info('Starting document text extraction');

      const extractPDFJob: ExtractPDFJob = this.pdfServices.createJob()
        .setInput({
          source: pdfBuffer,
          mimeType: MimeType.PDF
        })
        .setOptions(ExtractPDFOptions.createNew()
          .addElementsToExtract([
            ExtractPDFOptions.Element.TEXT,
            ExtractPDFOptions.Element.TABLES,
            ExtractPDFOptions.Element.IMAGES
          ])
          .addCharInfo(true)
          .addStylingInfo(true)
        );

      const result: ExtractPDFResult = await this.pdfServices.submit(extractPDFJob);
      const resultAsset = await this.pdfServices.getContent(result.asset);
      
      const extractedData = JSON.parse(resultAsset.readableStreamBody.toString());

      return {
        success: true,
        extractedText: this.parseExtractedText(extractedData),
        tables: this.parseExtractedTables(extractedData),
        images: this.parseExtractedImages(extractedData),
        metadata: {
          pageCount: extractedData.pages?.length || 0,
          wordCount: this.countWords(extractedData),
          extractedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Document text extraction failed', { error });
      throw error;
    }
  }

  private parseExtractedText(data: any): string {
    // Parse Adobe's extracted text format
    return data.elements
      ?.filter((element: any) => element.type === 'text')
      ?.map((element: any) => element.text)
      ?.join(' ') || '';
  }

  private parseExtractedTables(data: any): TableData[] {
    // Parse Adobe's extracted table format
    return data.elements
      ?.filter((element: any) => element.type === 'table')
      ?.map((table: any) => ({
        rows: table.rows?.length || 0,
        columns: table.columns?.length || 0,
        data: table.cells || []
      })) || [];
  }

  private parseExtractedImages(data: any): ImageData[] {
    // Parse Adobe's extracted image format
    return data.elements
      ?.filter((element: any) => element.type === 'image')
      ?.map((image: any) => ({
        width: image.width,
        height: image.height,
        format: image.format,
        path: image.path
      })) || [];
  }

  private countWords(data: any): number {
    const text = this.parseExtractedText(data);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}
```

---

## 🔒 **STEP 4: Security & Authentication**

### **4.1 Implement Secure Credential Management**

#### **Create Azure Key Vault Setup Script**
```bash
#!/bin/bash
# scripts/setup-azure-keyvault.sh

# Set variables
RESOURCE_GROUP="rg-adpa-adobe"
KEY_VAULT_NAME="kv-adpa-adobe-$(date +%s)"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Key Vault
az keyvault create \
  --name $KEY_VAULT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --enable-rbac-authorization

# Set secrets (replace with your actual values)
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "adobe-client-id" --value "your-client-id"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "adobe-client-secret" --value "your-client-secret"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "adobe-org-id" --value "your-org-id"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "adobe-account-id" --value "your-account-id"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "adobe-private-key" --value "your-private-key"

echo "Key Vault URL: https://$KEY_VAULT_NAME.vault.azure.net/"
```

### **4.2 Implement Managed Identity**

#### **Configure Managed Identity for Azure App Service**
```typescript
// src/adobe/managed-identity-config.ts
import { DefaultAzureCredential, ManagedIdentityCredential } from '@azure/identity';

export class ManagedIdentityAdobeConfig {
  private credential: DefaultAzureCredential | ManagedIdentityCredential;

  constructor() {
    // Use managed identity in Azure, fallback to default credential locally
    this.credential = process.env.AZURE_CLIENT_ID 
      ? new ManagedIdentityCredential(process.env.AZURE_CLIENT_ID)
      : new DefaultAzureCredential();
  }

  async getAccessToken(): Promise<string> {
    const tokenResponse = await this.credential.getToken(
      'https://pdf-services.adobe.io/.default'
    );
    return tokenResponse.token;
  }
}
```

---

## 📊 **STEP 5: Monitoring & Observability**

### **5.1 Implement Azure Application Insights**

#### **Add Telemetry Tracking**
```typescript
// src/adobe/telemetry.ts
import { TelemetryClient, SeverityLevel } from 'applicationinsights';

export class AdobeTelemetry {
  private telemetryClient: TelemetryClient;

  constructor() {
    this.telemetryClient = new TelemetryClient(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
  }

  trackPDFGeneration(duration: number, success: boolean, template: string) {
    this.telemetryClient.trackMetric({
      name: 'Adobe.PDF.Generation.Duration',
      value: duration,
      properties: {
        template,
        success: success.toString()
      }
    });

    this.telemetryClient.trackEvent({
      name: 'Adobe.PDF.Generated',
      properties: {
        template,
        success: success.toString(),
        duration: duration.toString()
      }
    });
  }

  trackAPIError(operation: string, error: Error) {
    this.telemetryClient.trackException({
      exception: error,
      severity: SeverityLevel.Error,
      properties: {
        operation,
        source: 'Adobe.API'
      }
    });
  }

  trackAPIUsage(operation: string, responseTime: number) {
    this.telemetryClient.trackDependency({
      target: 'Adobe PDF Services',
      name: operation,
      data: operation,
      duration: responseTime,
      resultCode: 200,
      success: true,
      dependencyTypeName: 'HTTP'
    });
  }
}
```

### **5.2 Health Check Implementation**

#### **Create Adobe API Health Check**
```typescript
// src/adobe/health-check.ts
export class AdobeHealthCheck {
  async checkHealth(): Promise<HealthCheckResult> {
    try {
      // Test Adobe API connectivity
      const testResult = await this.performHealthCheck();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          adobe_api: testResult.adobe_api,
          azure_keyvault: testResult.azure_keyvault,
          credentials: testResult.credentials
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  private async performHealthCheck() {
    // Implement actual health checks
    return {
      adobe_api: 'healthy',
      azure_keyvault: 'healthy',
      credentials: 'valid'
    };
  }
}
```

---

## 🚀 **STEP 6: Deployment Strategy**

### **6.1 Azure Container Apps Deployment**

#### **Create Deployment Configuration**
```yaml
# deploy/azure-container-apps.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adpa-adobe-integration
spec:
  replicas: 3
  selector:
    matchLabels:
      app: adpa-adobe
  template:
    metadata:
      labels:
        app: adpa-adobe
    spec:
      containers:
      - name: adpa-adobe
        image: your-registry.azurecr.io/adpa-adobe:latest
        env:
        - name: AZURE_KEY_VAULT_URL
          value: "https://your-keyvault.vault.azure.net/"
        - name: APPLICATIONINSIGHTS_CONNECTION_STRING
          valueFrom:
            secretKeyRef:
              name: app-insights
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### **6.2 Infrastructure as Code**

#### **Create Bicep Template**
```bicep
// deploy/main.bicep
param location string = resourceGroup().location
param appName string = 'adpa-adobe'

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-${appName}-${uniqueString(resourceGroup().id)}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-${appName}'
  location: location
  properties: {
    environmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
      }
    }
    template: {
      containers: [
        {
          name: appName
          image: 'your-registry.azurecr.io/${appName}:latest'
          env: [
            {
              name: 'AZURE_KEY_VAULT_URL'
              value: keyVault.properties.vaultUri
            }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
      }
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}
```

---

## 📋 **STEP 7: Testing Strategy**

### **7.1 Integration Tests**

#### **Create Adobe API Integration Tests**
```typescript
// tests/adobe-integration.test.ts
import { AdobePDFProcessor } from '../src/adobe/pdf-processor.js';
import { DocumentIntelligence } from '../src/adobe/document-intelligence.js';

describe('Adobe API Integration Tests', () => {
  let pdfProcessor: AdobePDFProcessor;
  let docIntelligence: DocumentIntelligence;

  beforeAll(async () => {
    pdfProcessor = new AdobePDFProcessor();
    docIntelligence = new DocumentIntelligence();
    await pdfProcessor.initialize();
    await docIntelligence.initialize();
  });

  test('should generate PDF from HTML', async () => {
    const input = {
      htmlContent: '<h1>Test Document</h1><p>This is a test.</p>',
      templateId: 'test-template'
    };

    const result = await pdfProcessor.generatePDF(input);
    
    expect(result.success).toBe(true);
    expect(result.pdfBuffer).toBeDefined();
    expect(result.metadata.pageCount).toBeGreaterThan(0);
  }, 30000);

  test('should extract text from PDF', async () => {
    // First generate a PDF
    const pdfResult = await pdfProcessor.generatePDF({
      htmlContent: '<h1>Extraction Test</h1><p>Content to extract.</p>',
      templateId: 'extraction-test'
    });

    // Then extract text from it
    const extractResult = await docIntelligence.extractText(pdfResult.pdfBuffer);
    
    expect(extractResult.success).toBe(true);
    expect(extractResult.extractedText).toContain('Extraction Test');
    expect(extractResult.metadata.wordCount).toBeGreaterThan(0);
  }, 45000);
});
```

### **7.2 Load Testing**

#### **Create Load Test Script**
```typescript
// tests/load-test.ts
import { performance } from 'perf_hooks';

async function loadTest() {
  const processor = new AdobePDFProcessor();
  await processor.initialize();

  const concurrentRequests = 10;
  const totalRequests = 100;
  
  const promises = [];
  const startTime = performance.now();

  for (let i = 0; i < totalRequests; i++) {
    const promise = processor.generatePDF({
      htmlContent: `<h1>Load Test Document ${i}</h1>`,
      templateId: 'load-test'
    });
    
    promises.push(promise);
    
    if (promises.length >= concurrentRequests) {
      await Promise.all(promises);
      promises.length = 0;
    }
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Generated ${totalRequests} PDFs in ${duration}ms`);
  console.log(`Average time per PDF: ${duration / totalRequests}ms`);
}
```

---

## 📝 **STEP 8: Migration Checklist**

### **8.1 Pre-Migration Verification**
- [ ] Adobe Developer account created and verified
- [ ] Adobe PDF Services API credentials generated
- [ ] Azure Key Vault created and configured
- [ ] Managed Identity assigned and permissions configured
- [ ] All dependencies installed (`@adobe/pdfservices-node-sdk`)
- [ ] Environment variables updated
- [ ] Integration tests written and passing

### **8.2 Migration Steps**
1. [ ] **Backup Current Implementation**
   ```bash
   git checkout -b backup-mock-implementation
   git commit -am "Backup mock implementation before Adobe API migration"
   git checkout main
   ```

2. [ ] **Update Dependencies**
   ```bash
   npm install @adobe/pdfservices-node-sdk @azure/identity @azure/keyvault-secrets
   ```

3. [ ] **Deploy Azure Infrastructure**
   ```bash
   az deployment group create \
     --resource-group rg-adpa-adobe \
     --template-file deploy/main.bicep \
     --parameters appName=adpa-adobe
   ```

4. [ ] **Configure Secrets**
   ```bash
   # Run the Key Vault setup script
   ./scripts/setup-azure-keyvault.sh
   ```

5. [ ] **Update Code**
   - [ ] Replace `src/adobe/pdf-processor.ts`
   - [ ] Replace `src/adobe/document-intelligence.ts`
   - [ ] Update `src/adobe/config.ts`
   - [ ] Add Azure Key Vault integration

6. [ ] **Test Integration**
   ```bash
   npm run test:adobe-integration
   npm run adobe:health-check
   ```

7. [ ] **Deploy to Staging**
   ```bash
   npm run build
   npm run deploy:staging
   ```

8. [ ] **Production Deployment**
   ```bash
   npm run deploy:production
   ```

### **8.3 Post-Migration Validation**
- [ ] Health checks passing
- [ ] PDF generation working with real Adobe API
- [ ] Document intelligence extracting accurate data
- [ ] Monitoring and alerts configured
- [ ] Performance metrics within acceptable ranges
- [ ] Error handling working correctly
- [ ] Security audit completed

---

## 🎯 **Success Metrics**

### **Performance Targets**
- PDF Generation: < 5 seconds for standard documents
- Text Extraction: < 3 seconds for typical documents
- API Response Time: < 2 seconds for 95th percentile
- Availability: > 99.9% uptime

### **Quality Targets**
- Error Rate: < 0.1% for successful Adobe API calls
- Text Extraction Accuracy: > 99% for standard documents
- Memory Usage: < 512MB per container instance
- CPU Usage: < 70% under normal load

---

## 🔗 **References**

- [Adobe PDF Services API Documentation](https://developer.adobe.com/document-services/docs/overview/pdf-services-api/)
- [Adobe PDF Services Node.js SDK](https://github.com/adobe/pdfservices-node-sdk)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)
- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

---

*This implementation plan provides a comprehensive roadmap for migrating from mock implementation to production Adobe API integration with enterprise-grade security, monitoring, and deployment practices.*
