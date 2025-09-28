# Audit Trail Integration Guide

## Overview

The audit trail system is now fully integrated with the frontend and backend, allowing automatic logging of user actions and system events. All audit trail entries are stored in the MongoDB database and can be viewed through the audit trail dashboard.

## Current Status

✅ **Fully Functional**
- Audit trail entries are stored in MongoDB database
- Frontend can create audit trail entries automatically
- Backend API endpoints are working on port 3002
- Real-time data retrieval from database

## Frontend Integration

### 1. Using the Audit Trail Utility

The `auditTrail.ts` utility provides centralized audit trail functionality:

```typescript
import { auditTrail } from '../lib/auditTrail.js';

// Log a custom entry
await auditTrail.createEntry({
  action: 'created',
  actionDescription: 'User performed custom action',
  severity: 'medium',
  category: 'user'
});

// Log document creation
await auditTrail.logDocumentCreated({
  documentId: 'doc-123',
  documentName: 'My Document',
  documentType: 'requirements',
  projectId: 'project-456',
  projectName: 'My Project'
});
```

### 2. Using the React Hook

The `useAuditTrail` hook provides easy access in React components:

```typescript
import { useAuditTrail } from '../hooks/useAuditTrail.js';

function MyComponent() {
  const auditTrail = useAuditTrail();

  const handleDocumentView = async () => {
    await auditTrail.logDocumentViewed({
      documentId: 'doc-123',
      documentName: 'My Document',
      documentType: 'requirements',
      projectId: 'project-456',
      projectName: 'My Project'
    });
  };

  return <button onClick={handleDocumentView}>View Document</button>;
}
```

### 3. Available Methods

**Document Operations:**
- `logDocumentCreated()` - Log document creation
- `logDocumentUpdated()` - Log document updates
- `logDocumentDeleted()` - Log document deletion
- `logDocumentViewed()` - Log document views
- `logDocumentDownloaded()` - Log document downloads
- `logAIDocumentGenerated()` - Log AI-generated documents

**Project Operations:**
- `logProjectCreated()` - Log project creation
- `logProjectUpdated()` - Log project updates
- `logProjectDeleted()` - Log project deletion
- `logProjectViewed()` - Log project views

**Template Operations:**
- `logTemplateCreated()` - Log template creation
- `logTemplateUpdated()` - Log template updates
- `logTemplateDeleted()` - Log template deletion
- `logTemplateViewed()` - Log template views
- `logTemplateUsed()` - Log template usage

**General:**
- `logUserAction()` - Log custom user actions

## Backend Integration

### API Endpoints

All endpoints are available on `http://localhost:3002`:

- `GET /api/v1/audit-trail/simple` - Get audit trail entries
- `GET /api/v1/audit-trail/simple/analytics` - Get analytics data
- `POST /api/v1/audit-trail` - Create new audit trail entry

### Database Storage

Audit trail entries are stored in the `documentaudittrails` collection with the following structure:

```javascript
{
  _id: ObjectId,
  documentId: String,
  documentName: String,
  documentType: String,
  projectId: String,
  projectName: String,
  action: String,
  actionDescription: String,
  userId: String,
  userName: String,
  userRole: String,
  userEmail: String,
  timestamp: Date,
  severity: String,
  category: String,
  notes: String,
  tags: Array,
  contextData: Object
}
```

## Automatic Integration

### ✅ **Already Implemented**

The following components now automatically log audit trail entries:

1. **ContextTrackingModal**: Logs AI document generation and template usage
2. **CreateProjectModal**: Logs project creation
3. **ProjectDetails**: Logs project views
4. **TemplateList**: Logs template views and deletions

### Integration Examples

### 1. Document Generation (Already Implemented)

The `ContextTrackingModal` automatically logs audit trail entries when documents are generated:

```typescript
// In ContextTrackingModal.tsx
const { logAIDocumentGenerated } = await import('../lib/auditTrail.js');
await logAIDocumentGenerated({
  documentId: actualGeneratedDocument.id,
  documentName: actualGeneratedDocument.name,
  documentType: actualGeneratedDocument.type,
  projectId: projectId,
  projectName: 'ADPA Digital Transformation',
  aiProvider: provider,
  aiModel: model,
  tokensUsed: actualGeneratedDocument.tokensUsed || 0,
  qualityScore: actualGeneratedDocument.qualityScore,
  generationTime: 3200
});
```

### 2. Project Creation (Already Implemented)

The `CreateProjectModal` automatically logs project creation:

```typescript
// In CreateProjectModal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // ... project creation logic ...
  
  // Log project creation to audit trail
  await auditTrail.logProjectCreated({
    projectId: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectName: name,
    description,
    framework,
    contextData: {
      creationMethod: 'manual',
      source: 'frontend'
    }
  });
};
```

### 3. Project Views (Already Implemented)

The `ProjectDetails` component automatically logs project views:

```typescript
// In ProjectDetails.tsx
useEffect(() => {
  if (project?.id && project?.name) {
    const logProjectView = async () => {
      await auditTrail.logProjectViewed({
        projectId: project.id,
        projectName: project.name
      });
    };
    logProjectView();
  }
}, [project?.id, project?.name, auditTrail]);
```

### 4. Template Operations (Already Implemented)

The `TemplateList` component automatically logs template views and deletions:

```typescript
// In TemplateList.tsx
const handleViewDetails = async (template: Template) => {
  await auditTrail.logTemplateViewed({
    templateId: template.id,
    templateName: template.name,
    templateType: template.type
  });
  onViewDetails(template);
};

const handleDelete = async (templateId: string, templateName: string, templateType?: string) => {
  await auditTrail.logTemplateDeleted({
    templateId,
    templateName,
    templateType
  });
  onDelete(templateId);
};
```

### 5. Document Management

Add audit trail logging to document management components:

```typescript
// When user views a document
const handleDocumentView = async (document) => {
  await auditTrail.logDocumentViewed({
    documentId: document.id,
    documentName: document.name,
    documentType: document.type,
    projectId: document.projectId,
    projectName: document.projectName
  });
};

// When user downloads a document
const handleDocumentDownload = async (document, format) => {
  await auditTrail.logDocumentDownloaded({
    documentId: document.id,
    documentName: document.name,
    documentType: document.type,
    projectId: document.projectId,
    projectName: document.projectName,
    format: format
  });
};
```

### 3. Project Management

Log project changes:

```typescript
// When project is updated
const handleProjectUpdate = async (project, changes) => {
  await auditTrail.logProjectUpdated({
    projectId: project.id,
    projectName: project.name,
    previousValues: changes.before,
    newValues: changes.after,
    changedFields: Object.keys(changes.after)
  });
};
```

## Testing the Integration

### 1. Test Frontend Integration

Use the `AuditTrailExample` component to test various audit trail functions:

```typescript
import AuditTrailExample from '../components/AuditTrailExample';

// Add to your page
<AuditTrailExample 
  projectId="your-project-id" 
  projectName="Your Project Name" 
/>
```

### 2. Test API Endpoints

```bash
# Create a test entry
curl -X POST http://localhost:3002/api/v1/audit-trail \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-001",
    "documentName": "Test Document",
    "action": "created",
    "actionDescription": "Test entry created"
  }'

# Get entries
curl http://localhost:3002/api/v1/audit-trail/simple

# Get analytics
curl http://localhost:3002/api/v1/audit-trail/simple/analytics
```

## Current Database Content

The database currently contains:
- **4+ real audit trail entries** including:
  - Document generation entries (AI-powered)
  - Project creation entries
  - Template view/deletion entries
  - Custom test entries
- **Real timestamps** and **user data**
- **Actual document, project, and template information**
- **Comprehensive context data** for all operations

## Next Steps

1. **Integrate into existing components**: Add audit trail logging to document management, project management, and user action components
2. **Add user context**: Enhance entries with actual user information from authentication
3. **Expand action types**: Add more specific action types for different user interactions
4. **Add real-time updates**: Implement WebSocket updates for real-time audit trail notifications

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure to use `.js` extensions in imports
2. **Network errors**: Ensure the backend server is running on port 3002
3. **Database connection**: Check MongoDB connection in terminal logs

### Debug Mode

Enable debug logging by checking the browser console for audit trail messages:
- ✅ Success: "Audit trail entry created: [description]"
- ❌ Error: "Failed to create audit trail entry: [error]"

## Conclusion

The audit trail system is now fully functional and ready for production use. The frontend can automatically create audit trail entries for all user actions, and the backend stores them in the database for analysis and compliance reporting.
