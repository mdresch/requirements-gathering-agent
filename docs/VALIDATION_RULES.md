# 📋 **Validation Rules Documentation**

## 🎯 **Overview**

This document defines comprehensive validation rules for all models in the Requirements Gathering Agent. These rules ensure data integrity, security, and consistency across the entire application.

## 🏗️ **Validation Architecture**

### **Three-Layer Validation Approach**

1. **Input Sanitization Layer** (Agent 2)
   - XSS protection
   - NoSQL injection prevention
   - Command injection protection
   - Input cleaning and normalization

2. **Schema Validation Layer** (Mongoose)
   - Field-level validation
   - Type checking
   - Business rule enforcement
   - Data integrity constraints

3. **Application Validation Layer** (Joi)
   - Request validation
   - Complex business logic
   - Cross-field validation
   - API contract enforcement

## 📊 **Common Validation Patterns**

### **String Validation Patterns**

```typescript
// Required string with length limits
requiredString: (field: string, minLength: number = 1, maxLength: number = 100) => ({
  type: String,
  required: [true, `${field} is required`],
  trim: true,
  minlength: [minLength, `${field} must be at least ${minLength} character(s)`],
  maxlength: [maxLength, `${field} cannot exceed ${maxLength} characters`]
})

// Optional string with length limits
optionalString: (field: string, maxLength: number = 100) => ({
  type: String,
  trim: true,
  maxlength: [maxLength, `${field} cannot exceed ${maxLength} characters`]
})

// Email validation
email: {
  type: String,
  trim: true,
  lowercase: true,
  maxlength: [255, 'Email cannot exceed 255 characters'],
  match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address']
}

// URL validation
url: {
  type: String,
  trim: true,
  maxlength: [500, 'URL cannot exceed 500 characters'],
  match: [/^https?:\/\/.+/, 'URL must start with http:// or https://']
}

// Phone number validation
phone: {
  type: String,
  trim: true,
  maxlength: [20, 'Phone number cannot exceed 20 characters'],
  match: [/^[\+]?[1-9][\d]{0,15}$/, 'Phone number must be valid']
}
```

### **Number Validation Patterns**

```typescript
// Positive integer
positiveInteger: (field: string, max?: number) => ({
  type: Number,
  required: [true, `${field} is required`],
  min: [1, `${field} must be at least 1`],
  max: max ? [max, `${field} cannot exceed ${max}`] : undefined,
  validate: {
    validator: Number.isInteger,
    message: `${field} must be an integer`
  }
})

// Percentage (0-100)
percentage: (field: string) => ({
  type: Number,
  min: [0, `${field} cannot be negative`],
  max: [100, `${field} cannot exceed 100`],
  validate: {
    validator: (value: number) => Number.isFinite(value),
    message: `${field} must be a valid number`
  }
})

// Rating (1-5 scale)
rating: {
  type: Number,
  required: [true, 'Rating is required'],
  min: [1, 'Rating must be at least 1'],
  max: [5, 'Rating cannot exceed 5'],
  validate: {
    validator: Number.isInteger,
    message: 'Rating must be an integer'
  }
}
```

### **Date Validation Patterns**

```typescript
// Future date
futureDate: (field: string) => ({
  type: Date,
  required: [true, `${field} is required`],
  validate: {
    validator: function(value: Date) {
      return value > new Date();
    },
    message: `${field} must be in the future`
  }
})

// Past date
pastDate: (field: string) => ({
  type: Date,
  required: [true, `${field} is required`],
  validate: {
    validator: function(value: Date) {
      return value < new Date();
    },
    message: `${field} must be in the past`
  }
})

// Date range validation
dateRange: (startField: string, endField: string) => ({
  validate: {
    validator: function() {
      return this[endField] > this[startField];
    },
    message: `${endField} must be after ${startField}`
  }
})
```

### **Enum Validation Patterns**

```typescript
// Priority levels
priority: {
  type: String,
  enum: {
    values: ['low', 'medium', 'high', 'critical'],
    message: 'Priority must be one of: low, medium, high, critical'
  },
  default: 'medium'
}

// Status values
status: {
  type: String,
  enum: {
    values: ['active', 'inactive', 'pending', 'completed', 'cancelled', 'archived'],
    message: 'Status must be one of: active, inactive, pending, completed, cancelled, archived'
  },
  default: 'active'
}

// Severity levels
severity: {
  type: String,
  enum: {
    values: ['low', 'medium', 'high', 'critical'],
    message: 'Severity must be one of: low, medium, high, critical'
  },
  default: 'medium'
}
```

### **Array Validation Patterns**

```typescript
// String array with limits
stringArray: (field: string, maxItems: number = 10, maxItemLength: number = 50) => ({
  type: [String],
  default: [],
  validate: {
    validator: function(arr: string[]) {
      return arr.length <= maxItems && arr.every(item => item.length <= maxItemLength);
    },
    message: `${field} cannot have more than ${maxItems} items and each item cannot exceed ${maxItemLength} characters`
  }
})

// ObjectId array
objectIdArray: (field: string, maxItems: number = 100) => ({
  type: [String],
  default: [],
  validate: {
    validator: function(arr: string[]) {
      return arr.length <= maxItems && arr.every(id => /^[0-9a-fA-F]{24}$/.test(id));
    },
    message: `${field} cannot have more than ${maxItems} items and each must be a valid ObjectId`
  }
})
```

### **Object Validation Patterns**

```typescript
// Metadata object
metadata: {
  type: Schema.Types.Mixed,
  default: {},
  validate: {
    validator: function(value: any) {
      return typeof value === 'object' && value !== null;
    },
    message: 'Metadata must be an object'
  }
}

// Audit trail entry
auditTrailEntry: {
  action: {
    type: String,
    required: [true, 'Audit action is required'],
    enum: {
      values: ['created', 'updated', 'deleted', 'restored', 'activated', 'deactivated'],
      message: 'Action must be one of: created, updated, deleted, restored, activated, deactivated'
    }
  },
  timestamp: { type: Date, default: Date.now },
  userId: {
    type: String,
    required: [true, 'User ID is required for audit trail'],
    maxlength: [100, 'User ID cannot exceed 100 characters']
  },
  reason: {
    type: String,
    maxlength: [500, 'Audit reason cannot exceed 500 characters']
  }
}
```

## 🏷️ **Model-Specific Validation Rules**

### **Template Model Validation**

```typescript
const TemplateValidationRules = {
  // Core fields
  name: requiredString('Template name', 1, 100),
  description: requiredString('Template description', 1, 500),
  category: requiredString('Template category', 1, 50),
  documentKey: {
    type: String,
    required: [true, 'Document key is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Document key must be at least 1 character'],
    maxlength: [50, 'Document key cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Document key can only contain letters, numbers, underscores, and hyphens']
  },
  
  // AI-related fields
  ai_instructions: requiredString('AI instructions', 10, 5000),
  prompt_template: requiredString('Prompt template', 10, 10000),
  generation_function: requiredString('Generation function', 1, 100),
  
  // Priority and metadata
  contextPriority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Context priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  
  // Version and status
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  is_active: { type: Boolean, default: false },
  is_system: { type: Boolean, default: false },
  
  // Soft delete fields
  deleted_at: { type: Date },
  deleted_by: optionalString('Deleted by', 100),
  delete_reason: optionalString('Delete reason', 500),
  is_deleted: { type: Boolean, default: false }
};
```

### **Project Model Validation**

```typescript
const ProjectValidationRules = {
  // Core fields
  name: requiredString('Project name', 1, 200),
  description: requiredString('Project description', 1, 1000),
  
  // Status and framework
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'review', 'completed', 'archived'],
      message: 'Status must be one of: draft, active, review, completed, archived'
    },
    default: 'draft',
    required: true
  },
  framework: {
    type: String,
    enum: {
      values: ['babok', 'pmbok', 'dmbok', 'multi'],
      message: 'Framework must be one of: babok, pmbok, dmbok, multi'
    },
    required: [true, 'Framework is required']
  },
  
  // Metrics
  complianceScore: percentage('Compliance score'),
  documents: {
    type: Number,
    min: [0, 'Document count cannot be negative'],
    default: 0
  },
  stakeholders: {
    type: Number,
    min: [0, 'Stakeholder count cannot be negative'],
    default: 0
  },
  
  // Dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // Arrays
  tags: stringArray('Tags', 20, 50),
  stakeholders: objectIdArray('Stakeholders', 50),
  documents: objectIdArray('Documents', 100)
};
```

### **Feedback Model Validation**

```typescript
const FeedbackValidationRules = {
  // Core identifiers
  documentId: requiredString('Document ID', 1, 100),
  projectId: requiredString('Project ID', 1, 100),
  userId: requiredString('User ID', 1, 100),
  userName: optionalString('User name', 100),
  
  // Feedback content
  feedbackType: {
    type: String,
    required: [true, 'Feedback type is required'],
    enum: {
      values: ['general', 'technical', 'content', 'structure', 'compliance', 'quality'],
      message: 'Feedback type must be one of: general, technical, content, structure, compliance, quality'
    },
    default: 'general'
  },
  rating: rating,
  title: requiredString('Feedback title', 5, 200),
  description: requiredString('Feedback description', 10, 2000),
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['positive', 'negative', 'suggestion', 'question', 'issue'],
      message: 'Category must be one of: positive, negative, suggestion, question, issue'
    },
    default: 'suggestion'
  },
  priority: priority,
  severity: {
    type: String,
    enum: {
      values: ['minor', 'moderate', 'major', 'critical'],
      message: 'Severity must be one of: minor, moderate, major, critical'
    },
    default: 'moderate'
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: {
      values: ['open', 'in_review', 'addressed', 'resolved', 'rejected', 'closed'],
      message: 'Status must be one of: open, in_review, addressed, resolved, rejected, closed'
    },
    default: 'open'
  },
  assignedTo: optionalString('Assigned to', 100),
  resolution: optionalString('Resolution', 1000),
  
  // Arrays
  tags: stringArray('Tags', 15, 50),
  attachments: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return arr.length <= 10 && arr.every(url => url.length <= 500);
      },
      message: 'Cannot have more than 10 attachments and each URL cannot exceed 500 characters'
    }
  }
};
```

### **Category Model Validation**

```typescript
const CategoryValidationRules = {
  // Core fields
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Category name must be at least 1 character'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: requiredString('Category description', 5, 200),
  
  // Visual properties
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code']
  },
  icon: {
    type: String,
    default: '📁',
    maxlength: [10, 'Icon cannot exceed 10 characters']
  },
  
  // Status and system flags
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false },
  
  // Hierarchy and ordering
  parentCategory: optionalString('Parent category ID', 100),
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  }
};
```

### **AuditTrail Model Validation**

```typescript
const AuditTrailValidationRules = {
  // Core audit fields
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: {
      values: ['template', 'project', 'category', 'feedback', 'stakeholder', 'document', 'user', 'system'],
      message: 'Entity type must be one of: template, project, category, feedback, stakeholder, document, user, system'
    }
  },
  entityId: requiredString('Entity ID', 1, 100),
  entityName: optionalString('Entity name', 200),
  
  // Action details
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: ['created', 'updated', 'deleted', 'restored', 'activated', 'deactivated', 'assigned', 'unassigned', 'status_changed', 'permission_changed', 'login', 'logout', 'export', 'import'],
      message: 'Action must be one of: created, updated, deleted, restored, activated, deactivated, assigned, unassigned, status_changed, permission_changed, login, logout, export, import'
    }
  },
  actionDescription: optionalString('Action description', 500),
  
  // User information
  userId: requiredString('User ID', 1, 100),
  userName: optionalString('User name', 100),
  userEmail: email,
  userRole: optionalString('User role', 50),
  
  // Context information
  projectId: optionalString('Project ID', 100),
  projectName: optionalString('Project name', 200),
  documentId: optionalString('Document ID', 100),
  documentName: optionalString('Document name', 200),
  
  // Request context
  ipAddress: {
    type: String,
    trim: true,
    maxlength: [45, 'IP address cannot exceed 45 characters'],
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'IP address must be valid IPv4 or IPv6']
  },
  userAgent: optionalString('User agent', 500),
  
  // Metadata
  severity: severity,
  category: {
    type: String,
    enum: {
      values: ['data_change', 'access', 'system', 'security', 'compliance', 'workflow'],
      message: 'Category must be one of: data_change, access, system, security, compliance, workflow'
    },
    default: 'data_change'
  },
  tags: stringArray('Tags', 10, 50),
  
  // Compliance
  complianceFramework: {
    type: String,
    enum: {
      values: ['sox', 'gdpr', 'hipaa', 'pci', 'iso27001', 'custom'],
      message: 'Compliance framework must be one of: sox, gdpr, hipaa, pci, iso27001, custom'
    }
  },
  requiresReview: { type: Boolean, default: false },
  reviewedBy: optionalString('Reviewed by', 100),
  reviewNotes: optionalString('Review notes', 1000)
};
```

## 🔧 **Custom Validation Functions**

### **Cross-Field Validation**

```typescript
// Date range validation
const validateDateRange = function(this: any) {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    throw new Error('End date must be after start date');
  }
};

// Email domain validation
const validateEmailDomain = (allowedDomains: string[]) => {
  return function(email: string) {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };
};

// Password strength validation
const validatePasswordStrength = {
  validator: function(password: string) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  },
  message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
};
```

### **Business Logic Validation**

```typescript
// Template dependency validation
const validateTemplateDependencies = {
  validator: function(dependencies: string[]) {
    // Check for circular dependencies
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (dep: string): boolean => {
      if (recursionStack.has(dep)) return true;
      if (visited.has(dep)) return false;
      
      visited.add(dep);
      recursionStack.add(dep);
      
      // Check if this dependency has its own dependencies
      // Implementation would check the database for actual dependencies
      
      recursionStack.delete(dep);
      return false;
    };
    
    return dependencies.every(dep => !hasCycle(dep));
  },
  message: 'Template dependencies cannot contain circular references'
};

// Project capacity validation
const validateProjectCapacity = {
  validator: function(this: any) {
    const maxDocuments = 1000;
    const maxStakeholders = 500;
    
    return this.documents <= maxDocuments && this.stakeholders <= maxStakeholders;
  },
  message: 'Project cannot exceed maximum capacity limits'
};
```

## 📝 **Error Message Standards**

### **Message Format**

All validation error messages follow this format:
```
[Field Name] [Action Required] [Constraint Details]
```

### **Common Message Patterns**

```typescript
const ErrorMessages = {
  // Required fields
  required: (field: string) => `${field} is required`,
  
  // Length constraints
  minLength: (field: string, min: number) => `${field} must be at least ${min} character(s)`,
  maxLength: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  
  // Numeric constraints
  minValue: (field: string, min: number) => `${field} must be at least ${min}`,
  maxValue: (field: string, max: number) => `${field} cannot exceed ${max}`,
  
  // Format constraints
  invalidFormat: (field: string, format: string) => `${field} must be a valid ${format}`,
  
  // Enum constraints
  invalidEnum: (field: string, values: string[]) => `${field} must be one of: ${values.join(', ')}`,
  
  // Array constraints
  maxItems: (field: string, max: number) => `${field} cannot have more than ${max} items`,
  
  // Business logic
  businessRule: (rule: string) => rule
};
```

## 🧪 **Validation Testing**

### **Test Categories**

1. **Field Validation Tests**
   - Required field validation
   - Length constraint validation
   - Format validation
   - Type validation

2. **Business Logic Tests**
   - Cross-field validation
   - Complex business rules
   - Dependency validation

3. **Edge Case Tests**
   - Boundary values
   - Null/undefined handling
   - Empty string handling

4. **Performance Tests**
   - Large data validation
   - Complex validation rules
   - Memory usage

### **Test Examples**

```typescript
describe('Template Validation', () => {
  it('should validate required fields', () => {
    const template = new TemplateModel({});
    const error = template.validateSync();
    expect(error.errors.name.message).toBe('Template name is required');
    expect(error.errors.description.message).toBe('Template description is required');
  });
  
  it('should validate field lengths', () => {
    const template = new TemplateModel({
      name: 'a'.repeat(101),
      description: 'a'.repeat(501)
    });
    const error = template.validateSync();
    expect(error.errors.name.message).toBe('Template name cannot exceed 100 characters');
    expect(error.errors.description.message).toBe('Template description cannot exceed 500 characters');
  });
  
  it('should validate document key format', () => {
    const template = new TemplateModel({
      name: 'Test',
      description: 'Test description',
      documentKey: 'invalid key!'
    });
    const error = template.validateSync();
    expect(error.errors.documentKey.message).toBe('Document key can only contain letters, numbers, underscores, and hyphens');
  });
});
```

## 🔄 **Validation Lifecycle**

### **Validation Order**

1. **Input Sanitization** (Agent 2)
   - Clean and normalize input
   - Remove dangerous content
   - Prepare for validation

2. **Schema Validation** (Mongoose)
   - Validate field types
   - Check required fields
   - Apply field-level rules

3. **Business Logic Validation**
   - Cross-field validation
   - Complex business rules
   - External dependency checks

4. **Final Validation**
   - Data integrity checks
   - Consistency validation
   - Performance validation

### **Error Handling**

```typescript
const handleValidationError = (error: any) => {
  if (error.name === 'ValidationError') {
    const formattedErrors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formattedErrors
      }
    };
  }
  
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  };
};
```

## 📊 **Validation Metrics**

### **Performance Metrics**

- **Validation Time**: < 10ms per request
- **Memory Usage**: < 1MB per validation
- **Error Rate**: < 0.1% false positives
- **Coverage**: 100% of input fields

### **Quality Metrics**

- **Consistency**: All models use same patterns
- **Clarity**: Error messages are descriptive
- **Maintainability**: Rules are centralized
- **Testability**: All rules are testable

---

## 🎯 **Implementation Checklist**

### **For Each Model**

- [ ] Define comprehensive field validation rules
- [ ] Implement consistent error messages
- [ ] Add business logic validation
- [ ] Create validation tests
- [ ] Document validation rules
- [ ] Update API documentation

### **For Each Field**

- [ ] Required/optional validation
- [ ] Type validation
- [ ] Length constraints
- [ ] Format validation
- [ ] Business rule validation
- [ ] Error message definition

---

**This validation rules documentation ensures consistent, secure, and maintainable data validation across the entire Requirements Gathering Agent application.**
