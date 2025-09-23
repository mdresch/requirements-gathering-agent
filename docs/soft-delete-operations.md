# Soft Delete Operations Documentation

## Overview

The soft delete system provides a comprehensive solution for safely managing template deletions with audit trails, recovery options, and administrative controls.

## Features

### Core Functionality
- **Soft Delete**: Templates are marked as deleted but remain in the database
- **Audit Trail**: Complete history of all template operations
- **Recovery**: Restore deleted templates at any time
- **Batch Operations**: Handle multiple templates simultaneously
- **Automatic Cleanup**: Permanently delete old soft-deleted templates
- **Statistics**: Track deletion patterns and usage

### Security Features
- **Permission Checks**: System templates require admin privileges
- **User Tracking**: All operations are logged with user information
- **Reason Codes**: Optional reason tracking for deletions
- **Validation**: Comprehensive input validation and error handling

## Database Schema

### Enhanced Template Model

```typescript
interface ITemplate {
  // ... existing fields ...
  
  // Soft delete fields
  deleted_at?: Date;
  deleted_by?: string;
  delete_reason?: string;
  is_deleted: boolean;
  
  // Audit trail
  audit_trail?: {
    action: 'created' | 'updated' | 'soft_deleted' | 'restored' | 'hard_deleted';
    timestamp: Date;
    user_id: string;
    changes?: any;
    reason?: string;
  }[];
}
```

### Indexes for Performance

```javascript
// Optimized indexes for soft delete queries
TemplateSchema.index({ is_deleted: 1, is_active: 1 });
TemplateSchema.index({ deleted_at: 1 });
TemplateSchema.index({ category: 1, is_deleted: 1 });
TemplateSchema.index({ created_by: 1, is_deleted: 1 });
```

## API Endpoints

### 1. Soft Delete Template
```http
DELETE /api/v1/templates/:templateId
```

**Query Parameters:**
- `permanent=true` - Skip soft delete, perform permanent deletion

**Request Body:**
```json
{
  "reason": "Template no longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully",
  "data": {
    "templateId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "templateName": "User Stories Template",
    "deletedAt": "2024-01-15T10:30:00Z",
    "permanent": false
  }
}
```

### 2. Get Soft-Deleted Templates
```http
GET /api/v1/templates/deleted
```

**Query Parameters:**
- `category` - Filter by category
- `deletedBy` - Filter by user who deleted
- `daysSinceDeleted` - Filter by age (days)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "User Stories Template",
      "category": "basic-docs",
      "deletedAt": "2024-01-15T10:30:00Z",
      "deletedBy": "user123",
      "deleteReason": "Template no longer needed",
      "daysSinceDeleted": 5
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

### 3. Restore Template
```http
POST /api/v1/templates/:templateId/restore
```

**Request Body:**
```json
{
  "reason": "Template needed again"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "templateId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "templateName": "User Stories Template",
    "restoredAt": "2024-01-20T14:30:00Z",
    "reason": "Template needed again"
  },
  "message": "Template restored successfully"
}
```

### 4. Batch Restore Templates
```http
POST /api/v1/templates/batch-restore
```

**Request Body:**
```json
{
  "templateIds": [
    "64f1a2b3c4d5e6f7g8h9i0j1",
    "64f1a2b3c4d5e6f7g8h9i0j2"
  ],
  "reason": "Bulk restore operation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequested": 2,
    "restored": 2,
    "failed": 0,
    "errors": []
  },
  "message": "Restored 2/2 templates"
}
```

### 5. Get Soft Delete Statistics
```http
GET /api/v1/templates/deleted/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDeleted": 15,
    "deletedThisWeek": 3,
    "deletedThisMonth": 8,
    "byCategory": {
      "basic-docs": 5,
      "project-charter": 3,
      "requirements": 7
    },
    "byUser": {
      "user123": 8,
      "admin456": 4,
      "user789": 3
    },
    "oldestDeleted": "2023-12-01T00:00:00Z"
  }
}
```

### 6. Cleanup Old Templates
```http
DELETE /api/v1/templates/cleanup
```

**Request Body:**
```json
{
  "olderThanDays": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 5,
    "templateIds": [
      "64f1a2b3c4d5e6f7g8h9i0j1",
      "64f1a2b3c4d5e6f7g8h9i0j2"
    ]
  },
  "message": "Permanently deleted 5 old templates"
}
```

### 7. Get Template Audit Trail
```http
GET /api/v1/templates/:templateId/audit
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templateId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "auditTrail": [
      {
        "action": "created",
        "timestamp": "2024-01-01T10:00:00Z",
        "user_id": "user123",
        "reason": "Template created"
      },
      {
        "action": "updated",
        "timestamp": "2024-01-10T14:30:00Z",
        "user_id": "user123",
        "changes": ["name", "description"],
        "reason": "Template updated"
      },
      {
        "action": "soft_deleted",
        "timestamp": "2024-01-15T10:30:00Z",
        "user_id": "user123",
        "reason": "Template no longer needed"
      }
    ]
  }
}
```

## Service Layer

### SoftDeleteService

The `SoftDeleteService` provides the core business logic for soft delete operations:

```typescript
class SoftDeleteService {
  // Single template operations
  async softDeleteTemplate(templateId: string, options: SoftDeleteOptions): Promise<SoftDeleteResult>
  async restoreTemplate(templateId: string, options: RestoreOptions): Promise<RestoreResult>
  
  // Batch operations
  async batchSoftDeleteTemplates(options: BatchSoftDeleteOptions): Promise<BatchSoftDeleteResult>
  async batchRestoreTemplates(templateIds: string[], options: RestoreOptions): Promise<BatchRestoreResult>
  
  // Administrative operations
  async getSoftDeletedTemplates(options?: FilterOptions): Promise<SoftDeletedTemplate[]>
  async getSoftDeleteStatistics(): Promise<SoftDeleteStatistics>
  async permanentDeleteOldTemplates(olderThanDays: number, options: CleanupOptions): Promise<CleanupResult>
}
```

## Usage Examples

### Frontend Integration

```typescript
// Soft delete a template
const deleteTemplate = async (templateId: string, reason?: string) => {
  const response = await fetch(`/api/v1/templates/${templateId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return response.json();
};

// Restore a template
const restoreTemplate = async (templateId: string, reason?: string) => {
  const response = await fetch(`/api/v1/templates/${templateId}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return response.json();
};

// Get deleted templates
const getDeletedTemplates = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/v1/templates/deleted?${params}`);
  return response.json();
};
```

### Backend Usage

```typescript
import { SoftDeleteService } from '../services/SoftDeleteService.js';
import { TemplateRepository } from '../repositories/TemplateRepository.js';

// Initialize service
const templateRepository = new TemplateRepository();
const softDeleteService = new SoftDeleteService(templateRepository);

// Soft delete with audit trail
const result = await softDeleteService.softDeleteTemplate('template-id', {
  userId: 'user123',
  reason: 'Template no longer needed'
});

// Batch restore
const restoreResult = await softDeleteService.batchRestoreTemplates(
  ['id1', 'id2', 'id3'],
  {
    userId: 'admin456',
    reason: 'Bulk restore operation'
  }
);

// Get statistics
const stats = await softDeleteService.getSoftDeleteStatistics();
console.log(`Total deleted: ${stats.totalDeleted}`);
```

## Best Practices

### 1. Regular Cleanup
Set up automated cleanup jobs to permanently delete old soft-deleted templates:

```typescript
// Run daily cleanup for templates older than 90 days
const cleanupJob = async () => {
  const result = await softDeleteService.permanentDeleteOldTemplates(90, {
    userId: 'system',
    reason: 'Automated cleanup job'
  });
  console.log(`Cleaned up ${result.deletedCount} old templates`);
};
```

### 2. User Experience
- Show confirmation dialogs for deletions
- Provide restore options in the UI
- Display deletion statistics to administrators
- Show audit trails for transparency

### 3. Monitoring
- Track deletion patterns
- Monitor restore rates
- Alert on unusual deletion activity
- Regular cleanup job monitoring

### 4. Security
- Validate user permissions
- Log all operations
- Implement rate limiting
- Sanitize input data

## Error Handling

All soft delete operations include comprehensive error handling:

```typescript
try {
  const result = await softDeleteService.softDeleteTemplate(templateId, options);
  // Handle success
} catch (error) {
  if (error.message.includes('Template not found')) {
    // Handle not found
  } else if (error.message.includes('already deleted')) {
    // Handle already deleted
  } else if (error.message.includes('permissions')) {
    // Handle permission denied
  } else {
    // Handle general error
  }
}
```

## Performance Considerations

### Database Indexes
- Optimized indexes for soft delete queries
- Composite indexes for common filter combinations
- Regular index maintenance

### Query Optimization
- Use projection to limit returned fields
- Implement pagination for large result sets
- Cache frequently accessed statistics

### Memory Management
- Stream large batch operations
- Implement connection pooling
- Monitor memory usage during cleanup

## Migration Guide

### From Hard Delete to Soft Delete

1. **Update Database Schema**
   ```sql
   ALTER TABLE templates 
   ADD COLUMN deleted_at TIMESTAMP,
   ADD COLUMN deleted_by VARCHAR(255),
   ADD COLUMN delete_reason TEXT,
   ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
   ADD COLUMN audit_trail JSONB DEFAULT '[]';
   ```

2. **Create Indexes**
   ```sql
   CREATE INDEX idx_templates_deleted ON templates(is_deleted);
   CREATE INDEX idx_templates_deleted_at ON templates(deleted_at);
   CREATE INDEX idx_templates_category_deleted ON templates(category, is_deleted);
   ```

3. **Update Application Code**
   - Replace hard delete calls with soft delete
   - Add restore functionality
   - Implement audit trail logging
   - Update UI to show deleted items

4. **Data Migration**
   ```typescript
   // Migrate existing deleted templates (if any)
   const migrateDeletedTemplates = async () => {
     // Implementation depends on existing data structure
   };
   ```

## Troubleshooting

### Common Issues

1. **Templates not appearing as deleted**
   - Check `is_deleted` field is set to `true`
   - Verify database indexes are created
   - Ensure queries include proper filters

2. **Restore operation fails**
   - Check template exists in database
   - Verify `is_deleted` is `true`
   - Ensure user has restore permissions

3. **Audit trail not updating**
   - Check middleware is properly configured
   - Verify `audit_trail` field is not null
   - Ensure user context is available

4. **Performance issues**
   - Check database indexes
   - Optimize query filters
   - Consider pagination for large datasets

### Debugging

Enable debug logging to troubleshoot issues:

```typescript
// Enable debug mode
process.env.DEBUG_SOFT_DELETE = 'true';

// Check service initialization
console.log('SoftDeleteService initialized:', !!softDeleteService);
console.log('TemplateRepository initialized:', !!templateRepository);
```

## Conclusion

The soft delete system provides a robust, auditable, and user-friendly approach to template management. It ensures data safety while maintaining system performance and providing comprehensive administrative controls.
