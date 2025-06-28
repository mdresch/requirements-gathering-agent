# Azure Portal API Center Setup Guide
# Standards Compliance & Deviation Analysis API

## 🎯 **Portal-Based Deployment Strategy**

Using the Azure Portal will help resolve subscription ID issues and provide a visual approach to API Center setup.

## Step 1: Access Azure Portal

### **Navigate to Azure API Center**
1. **Open**: [Azure Portal](https://portal.azure.com)
2. **Search**: "API Center" in the top search bar
3. **Select**: "API Centers" from the results

### **Verify Subscription Access**
- **Check**: Which subscriptions you can see in the portal
- **Confirm**: The correct subscription containing your resources
- **Note**: The actual subscription ID for CLI alignment

## Step 2: Create/Verify API Center Instance

### **Option A: Create New API Center**
If `svc-api-center` doesn't exist:

1. **Click**: "Create API Center"
2. **Subscription**: Select the correct active subscription
3. **Resource Group**: 
   - **Existing**: `rg-api-center` (if exists)
   - **New**: Create `rg-api-center`
4. **API Center Name**: `svc-api-center`
5. **Region**: **West Europe** (`westeu`)
6. **Pricing Tier**: Start with Standard
7. **Click**: "Review + Create" → "Create"

### **Option B: Use Existing API Center**
If it already exists:
1. **Navigate**: to existing `svc-api-center`
2. **Note**: Subscription ID and Resource Group (`rg-api-center`)
3. **Verify**: Access and permissions

## Step 3: Create APIs via Portal

### **3.1 Create Echo API**
1. **Navigate**: to your `svc-api-center` API Center instance
2. **Click**: "APIs" in the left menu
3. **Click**: "Create API"
4. **Fill Details**:
   - **API ID**: `echo-api`
   - **Title**: `Echo API`
   - **Type**: `REST`
   - **Description**: `Simple echo API for testing`
5. **Click**: "Create"

### **3.2 Create Standards Compliance API**
1. **Click**: "Create API" again
2. **Fill Details**:
   - **API ID**: `standards-compliance-api`
   - **Title**: `Standards Compliance & Deviation Analysis API`
   - **Type**: `REST`
   - **Description**: `PMI PMBOK and BABOK standards compliance analysis with deviation detection and executive reporting`
3. **Click**: "Create"

## Step 4: Add API Specifications

### **Upload OpenAPI Specification**
1. **Select**: `standards-compliance-api`
2. **Click**: "API definitions" in the left menu
3. **Click**: "Add definition"
4. **Choose**: "Import from file"
5. **Upload**: Your `api-specs/standards-compliance-openapi.json` file
6. **Configure**:
   - **Title**: `OpenAPI 3.0 Specification`
   - **Description**: `Complete API specification with all endpoints`
7. **Click**: "Import"

### **Alternative: Manual Specification Entry**
If file upload doesn't work, use this OpenAPI spec content:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Standards Compliance & Deviation Analysis API",
    "version": "1.0.0",
    "description": "PMI PMBOK and BABOK standards compliance analysis with executive reporting"
  },
  "servers": [
    {
      "url": "https://your-api-server.com/api/v1",
      "description": "Production server"
    }
  ],
  "paths": {
    "/compliance/analyze": {
      "post": {
        "summary": "Analyze project compliance",
        "operationId": "analyzeCompliance",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ProjectData"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Compliance analysis results",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ComplianceReport"
                }
              }
            }
          }
        }
      }
    },
    "/compliance/deviations": {
      "get": {
        "summary": "Get compliance deviations",
        "operationId": "getDeviations",
        "parameters": [
          {
            "name": "standard",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": ["PMBOK", "BABOK"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of deviations",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Deviation"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/reports/executive": {
      "post": {
        "summary": "Generate executive summary",
        "operationId": "generateExecutiveSummary",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ExecutiveReportRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Executive summary generated",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ExecutiveSummary"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ProjectData": {
        "type": "object",
        "properties": {
          "projectId": {"type": "string"},
          "name": {"type": "string"},
          "description": {"type": "string"},
          "methodology": {"type": "string"},
          "documents": {
            "type": "array",
            "items": {"type": "string"}
          }
        }
      },
      "ComplianceReport": {
        "type": "object",
        "properties": {
          "projectId": {"type": "string"},
          "complianceScore": {"type": "number"},
          "deviations": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/Deviation"}
          },
          "recommendations": {
            "type": "array",
            "items": {"type": "string"}
          }
        }
      },
      "Deviation": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "standard": {"type": "string"},
          "category": {"type": "string"},
          "severity": {"type": "string"},
          "description": {"type": "string"},
          "recommendation": {"type": "string"}
        }
      },
      "ExecutiveReportRequest": {
        "type": "object",
        "properties": {
          "projectIds": {
            "type": "array",
            "items": {"type": "string"}
          },
          "timeframe": {"type": "string"},
          "includeRecommendations": {"type": "boolean"}
        }
      },
      "ExecutiveSummary": {
        "type": "object",
        "properties": {
          "summary": {"type": "string"},
          "keyFindings": {
            "type": "array",
            "items": {"type": "string"}
          },
          "recommendations": {
            "type": "array", 
            "items": {"type": "string"}
          },
          "complianceMetrics": {"type": "object"}
        }
      }
    },
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key"
      },
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "security": [
    {"ApiKeyAuth": []},
    {"BearerAuth": []}
  ]
}
```

## Step 5: Configure Environments

### **Add Development Environment**
1. **Click**: "Environments" in the left menu
2. **Click**: "Create environment"
3. **Fill Details**:
   - **Name**: `Development`
   - **Type**: `Development`
   - **Server URL**: `https://localhost:3000/api/v1`
   - **Description**: `Local development environment`
4. **Click**: "Create"

### **Add Production Environment**
1. **Click**: "Create environment" again
2. **Fill Details**:
   - **Name**: `Production`
   - **Type**: `Production`
   - **Server URL**: `https://your-production-api.com/api/v1`
   - **Description**: `Production deployment environment`
3. **Click**: "Create"

## Step 6: Add Metadata and Documentation

### **API Metadata**
1. **Select**: your Standards Compliance API
2. **Click**: "Overview" tab
3. **Add Tags**:
   - `pmi`
   - `pmbok`
   - `babok`
   - `compliance`
   - `governance`
   - `standards`
4. **Update Description**: Add detailed business value description

### **Documentation Links**
Add links to your documentation:
- **Implementation Guide**: Link to your docs folder
- **PMI Alignment**: Link to PMI leadership analysis
- **Technical Specs**: Link to OpenAPI specification

## Step 7: Security and Access Control

### **API Access Policies**
1. **Navigate**: to "Access control (IAM)"
2. **Add**: appropriate role assignments
3. **Configure**: API key management
4. **Setup**: Authentication requirements

## Step 8: Monitor and Validate

### **Verification Steps**
1. **Check**: API appears in API Center catalog
2. **Verify**: OpenAPI specification loaded correctly
3. **Test**: Portal navigation and documentation
4. **Confirm**: All metadata and tags are present

### **Get Portal Information for CLI**
1. **Note**: Actual subscription ID from portal
2. **Record**: Resource group name
3. **Copy**: API Center resource details
4. **Update**: CLI scripts with correct IDs

## Step 9: PMI Leadership Presentation Prep

### **Portal Screenshots for Executive Demo**
Capture:
1. **API Center Overview** - Show professional API catalog
2. **Standards Compliance API Details** - Highlight PMI alignment
3. **OpenAPI Documentation** - Demonstrate technical excellence
4. **Environment Configuration** - Show enterprise readiness

### **Portal Benefits for PMI Board**
- **Visual Governance** - Easy-to-understand API portfolio
- **Professional Presentation** - Enterprise-grade appearance
- **Self-Service Discovery** - Teams can explore APIs independently
- **Compliance Documentation** - Built-in governance features

## Benefits of Portal Approach

### **Immediate Advantages**
- **Visual Interface** - Easier to understand and navigate
- **No CLI Issues** - Bypasses subscription ID problems
- **Interactive Setup** - Guided configuration process
- **Instant Validation** - Immediate feedback on configuration

### **Strategic Value**
- **Executive Friendly** - Perfect for board presentations
- **Professional Appearance** - Industry-standard API governance
- **Team Collaboration** - Multiple stakeholders can access
- **Documentation Hub** - Centralized API information

## Next Steps After Portal Setup

1. **Document**: Actual subscription ID and resource details
2. **Update**: CLI scripts with correct information
3. **Test**: API Center functionality and access
4. **Prepare**: PMI leadership demonstration materials
5. **Schedule**: Executive briefing for Tom Bloemers alignment

This portal approach will give you immediate visual results and resolve the CLI subscription issues while providing a professional foundation for your PMI board candidate engagement strategy!
