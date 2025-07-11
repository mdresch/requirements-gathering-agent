# Template Variable Schema Documentation

## Overview

This document describes the template variable schema used by the Adobe Creative Suite Phase 2 template selection system. Template variables are used to populate placeholders in Adobe templates with dynamic content.

## Global Variables

These variables are available for all document types and are derived from brand guidelines:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `companyName` | string | Company/organization name | "ACME Corporation" |
| `logoPath` | string | Path to company logo | "/assets/logos/primary-logo.svg" |
| `primaryColor` | string | Primary brand color (hex) | "#1a365d" |
| `secondaryColor` | string | Secondary brand color (hex) | "#2d3748" |
| `accentColor` | string | Accent brand color (hex) | "#3182ce" |
| `fontPrimary` | string | Primary font family | "Arial, sans-serif" |
| `fontSecondary` | string | Secondary font family | "Georgia, serif" |
| `generationDate` | string | Document generation date | "2024-03-15" |
| `documentTitle` | string | Document title | "Project Charter" |
| `documentSubtitle` | string | Document subtitle | "Project Initiation Document" |
| `sections` | string[] | Document sections | ["Executive Summary", "Objectives"] |

## Document Type Specific Variables

### Project Charter (`project-charter`)

Template placeholders for project charter documents:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Name of the project | "Digital Transformation Initiative" |
| `{{PROJECT_MANAGER}}` | Project manager name | "John Smith" |
| `{{PROJECT_START_DATE}}` | Project start date | "2024-01-15" |
| `{{PROJECT_END_DATE}}` | Project end date | "2024-12-31" |
| `{{PROJECT_BUDGET}}` | Project budget | "$500,000" |
| `{{PROJECT_SPONSOR}}` | Project sponsor | "Jane Doe, VP Technology" |
| `{{PROJECT_OBJECTIVES}}` | Project objectives list | "Modernize legacy systems..." |
| `{{PROJECT_SCOPE}}` | Project scope definition | "Implementation of new CRM..." |
| `{{PROJECT_DELIVERABLES}}` | Project deliverables | "New system, training materials..." |
| `{{PROJECT_STAKEHOLDERS}}` | Stakeholder list | "Business users, IT team..." |
| `{{PROJECT_RISKS}}` | Identified risks | "Resource constraints..." |
| `{{PROJECT_ASSUMPTIONS}}` | Project assumptions | "Team availability..." |

### Requirements Specification (`requirements-specification`)

Template placeholders for requirements documents:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SYSTEM_NAME}}` | Name of the system | "Customer Management System" |
| `{{SYSTEM_VERSION}}` | System version | "2.0" |
| `{{DOCUMENT_AUTHOR}}` | Document author | "Business Analyst" |
| `{{DOCUMENT_REVIEWERS}}` | Document reviewers | "Stakeholder Team" |
| `{{FUNCTIONAL_REQUIREMENTS}}` | Functional requirements | "User login functionality..." |
| `{{NON_FUNCTIONAL_REQUIREMENTS}}` | Non-functional requirements | "Performance requirements..." |
| `{{DATA_REQUIREMENTS}}` | Data requirements | "Customer data fields..." |
| `{{BUSINESS_RULES}}` | Business rules | "Validation rules..." |
| `{{USER_STORIES}}` | User stories | "As a user, I want to..." |
| `{{ACCEPTANCE_CRITERIA}}` | Acceptance criteria | "Given when then..." |
| `{{SYSTEM_CONSTRAINTS}}` | System constraints | "Must integrate with..." |
| `{{SYSTEM_DEPENDENCIES}}` | System dependencies | "Requires database..." |

### Technical Design (`technical-design`)

Template placeholders for technical design documents:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SYSTEM_NAME}}` | System name | "E-commerce Platform" |
| `{{SYSTEM_ARCHITECT}}` | System architect | "Senior Architect" |
| `{{SYSTEM_ARCHITECTURE}}` | Architecture description | "Microservices architecture..." |
| `{{SYSTEM_COMPONENTS}}` | System components | "API Gateway, Services..." |
| `{{DATA_MODEL}}` | Data model description | "Entity relationship..." |
| `{{SYSTEM_INTERFACES}}` | System interfaces | "REST APIs, message queues..." |
| `{{SECURITY_DESIGN}}` | Security design | "Authentication, authorization..." |
| `{{PERFORMANCE_REQUIREMENTS}}` | Performance specs | "Response time < 200ms..." |
| `{{DEPLOYMENT_ARCHITECTURE}}` | Deployment architecture | "Cloud-based deployment..." |
| `{{TECHNOLOGY_STACK}}` | Technology stack | "Node.js, PostgreSQL..." |
| `{{DESIGN_PATTERNS}}` | Design patterns | "Repository, Factory..." |
| `{{CODING_STANDARDS}}` | Coding standards | "ESLint configuration..." |

### User Guide (`user-guide`)

Template placeholders for user guides:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PRODUCT_NAME}}` | Product name | "Customer Portal" |
| `{{PRODUCT_VERSION}}` | Product version | "3.1" |
| `{{TARGET_AUDIENCE}}` | Target audience | "End users, administrators" |
| `{{PRODUCT_FEATURES}}` | Product features | "Dashboard, reporting..." |
| `{{USER_PROCEDURES}}` | User procedures | "Step-by-step instructions..." |
| `{{SCREENSHOT_PLACEHOLDERS}}` | Screenshot placeholders | "Login screen, dashboard..." |
| `{{TROUBLESHOOTING_GUIDE}}` | Troubleshooting guide | "Common issues and solutions..." |
| `{{FREQUENTLY_ASKED_QUESTIONS}}` | FAQ section | "Q: How do I reset password..." |
| `{{SUPPORT_INFORMATION}}` | Support contact info | "Email: support@company.com..." |
| `{{QUICK_START_GUIDE}}` | Quick start guide | "Getting started in 5 minutes..." |
| `{{STEP_BY_STEP_TUTORIALS}}` | Detailed tutorials | "Complete workflow guides..." |
| `{{TIPS_AND_TRICKS}}` | Tips and tricks | "Power user features..." |

### Status Report (`status-report`)

Template placeholders for status reports:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{REPORTING_PERIOD}}` | Reporting period | "Week of March 15-22, 2024" |
| `{{PROJECT_NAME}}` | Project name | "Digital Transformation" |
| `{{OVERALL_STATUS}}` | Overall status | "On Track" |
| `{{PROGRESS_SUMMARY}}` | Progress summary | "Completed database migration..." |
| `{{COMPLETED_MILESTONES}}` | Completed milestones | "Phase 1 completion..." |
| `{{UPCOMING_MILESTONES}}` | Upcoming milestones | "User testing phase..." |
| `{{CURRENT_ISSUES}}` | Current issues | "Resource allocation..." |
| `{{IDENTIFIED_RISKS}}` | Identified risks | "Timeline pressure..." |
| `{{NEXT_STEPS}}` | Next steps | "Begin integration testing..." |
| `{{BUDGET_STATUS}}` | Budget status | "75% utilized..." |
| `{{TIMELINE_STATUS}}` | Timeline status | "2 days ahead of schedule..." |
| `{{RESOURCE_STATUS}}` | Resource status | "All resources allocated..." |

### Test Plan (`test-plan`)

Template placeholders for test plans:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{TEST_PLAN_ID}}` | Test plan identifier | "TP-2024-001" |
| `{{SYSTEM_UNDER_TEST}}` | System being tested | "Payment Processing Module" |
| `{{TEST_SCOPE}}` | Testing scope | "Functional and integration testing..." |
| `{{TEST_STRATEGY}}` | Testing strategy | "Risk-based testing approach..." |
| `{{TEST_CASES}}` | Test cases | "TC001: Valid payment..." |
| `{{TEST_ENVIRONMENT}}` | Test environment | "Staging environment..." |
| `{{TEST_DATA}}` | Test data requirements | "Sample customer records..." |
| `{{TEST_SCHEDULE}}` | Test schedule | "Testing Phase: 2 weeks..." |
| `{{TEST_RESOURCES}}` | Test resources | "QA team, test tools..." |
| `{{ENTRY_EXIT_CRITERIA}}` | Entry/exit criteria | "Code complete, bug-free..." |
| `{{TEST_RISK_ASSESSMENT}}` | Risk assessment | "High-risk areas identified..." |
| `{{TEST_DELIVERABLES}}` | Test deliverables | "Test results, defect reports..." |

## Usage Examples

### In Adobe InDesign Templates

```xml
<InDesignTemplate>
  <TextFrame>
    <Title>{{PROJECT_NAME}} - {{DOCUMENT_TITLE}}</Title>
    <Subtitle>{{DOCUMENT_SUBTITLE}}</Subtitle>
    <Content>{{PROJECT_OBJECTIVES}}</Content>
  </TextFrame>
  <ColorScheme>
    <Primary>{{PRIMARY_COLOR}}</Primary>
    <Secondary>{{SECONDARY_COLOR}}</Secondary>
  </ColorScheme>
</InDesignTemplate>
```

### In Document Generation API

```xml
<DocumentTemplate type="project-charter">
  <Header>
    <CompanyLogo>{{LOGO_PATH}}</CompanyLogo>
    <Title>{{PROJECT_NAME}}</Title>
  </Header>
  <Body>
    <Section name="objectives">{{PROJECT_OBJECTIVES}}</Section>
    <Section name="scope">{{PROJECT_SCOPE}}</Section>
  </Body>
</DocumentTemplate>
```

### In Illustrator Templates

```javascript
// Template variable replacement in Illustrator scripts
const templateVars = {
  timelineStart: "{{PROJECT_START_DATE}}",
  timelineEnd: "{{PROJECT_END_DATE}}",
  milestones: "{{PROJECT_MILESTONES}}",
  brandColor: "{{PRIMARY_COLOR}}"
};
```

## Variable Resolution Process

1. **Brand Guidelines**: Base variables are loaded from brand guidelines
2. **Document Analysis**: Document type is detected from content
3. **Template Selection**: Appropriate template is selected based on document type
4. **Variable Generation**: Document-specific variables are generated
5. **Placeholder Replacement**: Template placeholders are replaced with actual values

## Extensibility

To add new document types or variables:

1. Add new `DocumentType` enum value
2. Update `templateRegistry` with template paths
3. Add detection logic in `analyzeDocument`
4. Add variable generation in `getTemplateVariables`
5. Update this documentation

## Best Practices

- Use descriptive placeholder names: `{{PROJECT_START_DATE}}` not `{{DATE1}}`
- Include fallback values for optional variables
- Validate variable types before template processing
- Document any custom variables for specific templates
- Use consistent naming conventions across all templates

## Error Handling

If a variable is not found:
- Document generation continues with placeholder intact
- Warning is logged for missing variables
- Fallback templates are used for unknown document types
- Empty strings are used for undefined optional variables
