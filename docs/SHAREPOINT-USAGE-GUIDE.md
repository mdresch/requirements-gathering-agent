# SharePoint Integration Usage Guide

## Overview

The SharePoint integration in Requirements Gathering Agent v2.1.3 enables you to automatically publish generated documents to SharePoint Online document libraries. This feature provides enterprise-grade document management with Azure authentication, metadata tagging, and version control.

## Features

- **Microsoft Graph API Integration**: Secure, enterprise-grade authentication
- **OAuth2 Authentication**: Azure AD integration with device code flow
- **Automatic Folder Creation**: Creates organized folder structures
- **Metadata Management**: Adds custom metadata to published documents
- **Batch Publishing**: Efficiently publish multiple documents
- **Version Control**: SharePoint's built-in versioning support
- **Enterprise Security**: Follows Azure security best practices

## Quick Start

### 1. Prerequisites

Before using SharePoint integration, ensure you have:

- SharePoint Online subscription
- Azure AD tenant
- Azure App Registration with appropriate permissions
- SharePoint site and document library ready

### 2. Azure App Registration Setup

1. **Create App Registration in Azure Portal**:
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: "Requirements Gathering Agent"
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: `http://localhost:3000/auth/callback`

2. **Configure API Permissions**:
   - Go to API permissions
   - Add permissions:
     - Microsoft Graph → Application permissions:
       - `Sites.ReadWrite.All`
       - `Files.ReadWrite.All`
       - `User.Read`

3. **Grant Admin Consent**:
   - Click "Grant admin consent for [Your Tenant]"

4. **Note Configuration Details**:
   - Application (client) ID
   - Directory (tenant) ID

### 3. Initialize SharePoint Configuration

```bash
# Initialize SharePoint configuration
npm run sharepoint:init
```

You'll be prompted to provide:
- **Azure Tenant ID**: Your Azure AD tenant ID
- **Client ID**: Your app registration client ID
- **SharePoint Site URL**: Full URL to your SharePoint site
- **Document Library**: Name of the document library (default: "Documents")
- **Folder Path**: Optional default folder path
- **Label Prefix**: Metadata label prefix (default: "adpa")

### 4. Authenticate with SharePoint

```bash
# Login to SharePoint via OAuth2
npm run sharepoint:oauth2:login
```

This will:
- Start the OAuth2 device code flow
- Open a browser for authentication
- Store authentication tokens securely

### 5. Test Connection

```bash
# Test SharePoint connectivity
npm run sharepoint:test
```

### 6. Publish Documents

```bash
# Publish all generated documents
npm run sharepoint:publish

# Publish with specific folder path
npm run sharepoint:publish --folder-path "/Projects/MyProject"

# Dry run (preview only)
npm run sharepoint:publish --dry-run

# Force publish (skip validation)
npm run sharepoint:publish --force
```

## CLI Commands

### Configuration Commands

| Command | Description |
|---------|-------------|
| `sharepoint init` | Initialize SharePoint configuration |
| `sharepoint status` | Show integration status and configuration |

### Authentication Commands

| Command | Description |
|---------|-------------|
| `sharepoint oauth2 login` | Start OAuth2 authentication |
| `sharepoint oauth2 status` | Check authentication status |
| `sharepoint oauth2 debug` | Debug authentication issues |

### Publishing Commands

| Command | Description |
|---------|-------------|
| `sharepoint test` | Test SharePoint connectivity |
| `sharepoint publish` | Publish documents to SharePoint |

### Publishing Options

| Option | Description | Example |
|--------|-------------|---------|
| `--folder-path <path>` | Target folder path | `--folder-path "/Projects/Documentation"` |
| `--label-prefix <prefix>` | Metadata label prefix | `--label-prefix "myproject"` |
| `--dry-run` | Preview mode (no actual publishing) | `--dry-run` |
| `--force` | Force publish despite validation errors | `--force` |

## Configuration File

The SharePoint configuration is stored in `config-rga.json`:

```json
{
  "sharepoint": {
    "tenantId": "your-tenant-id",
    "clientId": "your-client-id",
    "siteUrl": "https://yourtenant.sharepoint.com/sites/yoursite",
    "documentLibrary": "Documents",
    "authMethod": "oauth2",
    "rootFolderPath": "/Projects",
    "oauth2": {
      "redirectUri": "http://localhost:3000/auth/callback",
      "scopes": [
        "https://graph.microsoft.com/Sites.ReadWrite.All",
        "https://graph.microsoft.com/Files.ReadWrite.All",
        "https://graph.microsoft.com/User.Read"
      ],
      "authority": "https://login.microsoftonline.com/your-tenant-id"
    },
    "publishingOptions": {
      "enableVersioning": true,
      "createFolders": true,
      "overwriteExisting": false,
      "addMetadata": true
    }
  }
}
```

## Metadata Schema

Published documents include comprehensive metadata:

- **GeneratedBy**: ADPA v2.1.3
- **GeneratedDate**: ISO timestamp
- **DocumentType**: Project Documentation
- **ProjectPhase**: Derived from document content
- **PMBOKCategory**: PMBOK knowledge area
- **ADPAVersion**: Version of the generator
- **Custom Labels**: Based on label prefix

## Folder Structure

Documents are organized in SharePoint using this structure:

```
/[Root Folder Path]/
├── Core Analysis/
│   ├── Business Case.md
│   ├── Requirements Analysis.md
│   └── Stakeholder Analysis.md
├── Quality Assurance/
│   ├── QA Plan.md
│   ├── Test Strategy.md
│   └── Quality Metrics.md
├── Technical Analysis/
│   ├── Technical Requirements.md
│   ├── System Architecture.md
│   └── Integration Plan.md
└── Management Plans/
    ├── Project Plan.md
    ├── Communication Plan.md
    └── Risk Management Plan.md
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   # Check authentication status
   npm run sharepoint:oauth2:status
   
   # Re-authenticate
   npm run sharepoint:oauth2:login
   ```

2. **Permission Denied**
   - Ensure Azure app has required permissions
   - Verify admin consent is granted
   - Check SharePoint site permissions

3. **Site or Library Not Found**
   - Verify SharePoint site URL is correct
   - Ensure document library exists
   - Check site accessibility

4. **File Upload Failed**
   - Check file size limits
   - Verify folder permissions
   - Ensure unique file names

### Debug Commands

```bash
# Show detailed configuration
npm run sharepoint:status

# Debug authentication
npm run sharepoint:oauth2:debug

# Test connectivity
npm run sharepoint:test
```

### Environment Variables

For CI/CD scenarios, you can use environment variables:

```bash
SHAREPOINT_TENANT_ID=your-tenant-id
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/yoursite
SHAREPOINT_DOCUMENT_LIBRARY=Documents
```

## Best Practices

### Security
- Use service principal authentication for production
- Regularly rotate authentication tokens
- Apply principle of least privilege
- Monitor access logs

### Organization
- Use consistent folder naming conventions
- Apply meaningful metadata labels
- Organize documents by project phase
- Maintain version control discipline

### Performance
- Use batch publishing for large document sets
- Consider file size limitations
- Monitor SharePoint storage quotas
- Implement retry logic for failed uploads

## Integration with Other Tools

### Power Automate
SharePoint integration enables Power Automate workflows:
- Document approval processes
- Notification systems
- Content distribution
- Backup and archiving

### Microsoft Teams
Published documents integrate with Teams:
- Channel file tabs
- Collaborative editing
- Meeting attachments
- Project workspace integration

### Power BI
Metadata enables advanced analytics:
- Document generation metrics
- Project progress tracking
- Quality assurance reporting
- Stakeholder engagement analysis

## Support and Resources

- **Microsoft Graph API**: https://docs.microsoft.com/en-us/graph/
- **SharePoint REST API**: https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-folders-and-files-with-rest
- **Azure AD Authentication**: https://docs.microsoft.com/en-us/azure/active-directory/develop/
- **ADPA Documentation**: See `docs/` folder for additional guides

## Changelog

### v2.1.3
- Initial SharePoint integration
- OAuth2 authentication support
- Batch document publishing
- Metadata management
- Enterprise security features

---

**Requirements Gathering Agent v2.1.3**  
Celebrating 175+ weekly downloads with breakthrough SharePoint integration!
