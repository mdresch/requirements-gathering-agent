# ADPA CLI Practical Examples

This document provides practical, real-world examples of using the ADPA CLI with actual code samples, expected outputs, and common use cases.

## Table of Contents

1. [Getting Started Examples](#getting-started-examples)
2. [Interactive Menu Examples](#interactive-menu-examples)
3. [Document Generation Examples](#document-generation-examples)
4. [Integration Examples](#integration-examples)
5. [Project Management Examples](#project-management-examples)
6. [Troubleshooting Examples](#troubleshooting-examples)
7. [Advanced Workflow Examples](#advanced-workflow-examples)

---

## Getting Started Examples

### Example 1: First-Time Setup

**Scenario**: New user setting up ADPA CLI for the first time

```bash
# Step 1: Check if ADPA is installed
$ adpa --version
ADPA CLI v2.1.3

# Step 2: Run interactive setup
$ adpa setup
🧙‍♂️ Interactive Setup Wizard

Select AI provider (google/azure/github/ollama): google
Enter your Google AI API Key: ****************************
Enter Google AI Model (default: gemini-1.5-flash): 
✅ .env file created/updated.
Update config-rga.json with provider/model? (y/n): y
✅ config-rga.json updated.
Update processor-config.json (for advanced users)? (y/n): n
Run npm install now? (y/n): n
Run npm run build now? (y/n): n

Setup complete. You may now use the CLI.
```

**Expected Output**: Environment configured with Google AI provider

### Example 2: Quick Project Initialization

**Scenario**: Starting a new software development project

```bash
# Create project directory
$ mkdir enterprise-portal && cd enterprise-portal

# Initialize Git repository
$ adpa vcs init
✅ Git repository initialized
✅ Initial commit created

# Generate core project documents
$ adpa generate-core-analysis
🚀 Generating core analysis documents...

✅ Generated: project-charter.md
✅ Generated: stakeholder-register.md  
✅ Generated: risk-management-plan.md
✅ Generated: business-case.md

📊 Generation Summary:
   • Documents: 4
   • Time: 12.3 seconds
   • Success Rate: 100%
```

**Expected Output**: Core project documents created in `./generated-documents/`

---

## Interactive Menu Examples

### Example 3: Interactive Menu Navigation

**Scenario**: Using the interactive menu system

```bash
$ adpa interactive
🚀 Starting ADPA Interactive CLI...

┌─────────────────────────────────────────────────────────────┐
│                    ADPA Interactive CLI - Main Menu        │
├─────────────────────────────────────────────────────────────┤
│  1. 🚀 Quick Start                                          │
│  2. 📝 Document Generation              [120+ templates]    │
│  3. 🤖 AI Configuration                 [Configured]        │
│  4. 📊 Project Management                                   │
│  5. 🔗 Integrations                                         │
│  6. 📈 Analytics & Feedback                                 │
│  7. ⚙️ System Configuration                                 │
│  8. 🔍 Workspace Analysis                                   │
│  9. ❓ Help & Documentation                                 │
│  0. 🚪 Exit                                                 │
└─────────────────────────────────────────────────────────────┘

📊 Status: AI ✅ | Project ✅ | Integrations ❌ | Documents: 4

Select an option (or type "back", "home", "help", "exit"): 2

📍 Main Menu > Document Generation

┌─────────────────────────────────────────────────────────────┐
│                      Document Generation                    │
├─────────────────────────────────────────────────────────────┤
│  1. 📚 Browse by Category                                   │
│  2. 🔍 Search Templates                                     │
│  3. ⚡ Generate Single Document                             │
│  4. 📦 Generate Category                                    │
│  5. 🌟 Generate All Documents                               │
│  6. 🎯 Custom Generation                                    │
│  7. 📋 Recent Documents                                     │
│  8. ⬅️ Back to Main Menu                                    │
└─────────────────────────────────────────────────────────────┘

Select an option (or type "back", "home", "help", "exit"): 1
```

**Navigation Tips**:
- Use number keys to select options
- Type `back` to go to previous menu
- Type `home` to return to main menu
- Type `help` for navigation assistance

### Example 4: Error Handling in Interactive Mode

**Scenario**: Invalid input with error recovery

```bash
Select an option (or type "back", "home", "help", "exit"): 99

❌ Invalid choice: "99"
💡 Valid options are: 1, 2, 3, 4, 5, 6, 7, 8

Choose recovery action:
  1. Try again
  2. Go back to previous menu
  3. Show help
  4. Exit to main menu

Select recovery option: 1

Select an option (or type "back", "home", "help", "exit"): 1
```

**Features Demonstrated**:
- Input validation with helpful error messages
- Recovery options for invalid input
- User-friendly error handling

---

## Document Generation Examples

### Example 5: Single Document Generation

**Scenario**: Generate a project charter with custom context

```bash
$ adpa generate project-charter --context "Enterprise e-commerce platform for financial services industry with 50+ stakeholders"

🚀 Generating document: project-charter
🤖 Using provider: google-ai (gemini-1.5-flash)
📝 Context: Enterprise e-commerce platform for financial services...

⏳ Processing... (3.2s)
✅ Generated: ./generated-documents/project-charter.md

📊 Document Statistics:
   • Word Count: 2,847
   • Sections: 12
   • Quality Score: 94/100
   • PMBOK Compliance: ✅
```

**Generated File Structure**:
```
./generated-documents/
└── project-charter.md
```

**Sample Output Content**:
```markdown
# Project Charter: Enterprise E-commerce Platform

## Project Overview
This document serves as the formal authorization for the Enterprise E-commerce Platform project...

## Business Case
The financial services industry requires a robust, secure, and scalable e-commerce platform...

## Stakeholder Summary
- **Executive Sponsor**: Chief Technology Officer
- **Project Manager**: [To be assigned]
- **Business Stakeholders**: 50+ across 5 departments
...
```

### Example 6: Category Generation

**Scenario**: Generate all PMBOK documents for a project

```bash
$ adpa generate-category pmbok --output ./pmbok-docs --retries 3

🚀 Generating category: pmbok
📁 Output directory: ./pmbok-docs
🔄 Retry configuration: 3 attempts with 2s backoff

📋 Templates to generate (25):
   • project-charter
   • project-management-plan
   • work-breakdown-structure
   • risk-management-plan
   • stakeholder-register
   ... and 20 more

⏳ Generation Progress:
   [████████████████████████████████████████] 100% (25/25)

✅ Generation Complete!

📊 Summary:
   • Total Documents: 25
   • Successful: 25
   • Failed: 0
   • Total Time: 2m 34s
   • Average Time per Document: 6.1s
```

**Generated Directory Structure**:
```
./pmbok-docs/
├── project-charter.md
├── project-management-plan.md
├── work-breakdown-structure.md
├── risk-management-plan.md
├── stakeholder-register.md
├── communication-management-plan.md
├── quality-management-plan.md
├── scope-management-plan.md
├── schedule-management-plan.md
├── cost-management-plan.md
├── resource-management-plan.md
├── procurement-management-plan.md
├── risk-register.md
├── stakeholder-engagement-plan.md
├── change-management-plan.md
├── configuration-management-plan.md
├── requirements-management-plan.md
├── requirements-documentation.md
├── requirements-traceability-matrix.md
├── project-scope-statement.md
├── activity-list.md
├── activity-duration-estimates.md
├── activity-resource-estimates.md
├── milestone-list.md
└── schedule-network-diagram.md
```

### Example 7: Batch Generation with Validation

**Scenario**: Generate all documents and validate them

```bash
$ adpa generate-all --output ./complete-docs && adpa validate --output ./complete-docs

🚀 Generating all documents...
📁 Output directory: ./complete-docs

📋 Categories to generate:
   • PMBOK (25 templates)
   • BABOK (18 templates)  
   • DMBOK (22 templates)
   • Strategic (12 templates)
   • Technical (15 templates)
   • Quality (10 templates)
   • Planning (8 templates)
   • Risk (6 templates)
   • Stakeholder (4 templates)

⏳ Total Progress:
   [████████████████████████████████████████] 100% (120/120)

✅ All documents generated successfully!

🔍 Starting validation...

📊 Validation Results:
   ✅ PMBOK Compliance: 25/25 documents passed
   ✅ BABOK Compliance: 18/18 documents passed
   ✅ DMBOK Compliance: 22/22 documents passed
   ✅ Template Structure: 120/120 documents valid
   ✅ Content Quality: Average score 92/100
   ⚠️  Minor Issues: 3 documents have formatting suggestions

📋 Validation Summary:
   • Total Documents: 120
   • Fully Compliant: 117
   • Minor Issues: 3
   • Major Issues: 0
   • Overall Score: 97.5%
```

---

## Integration Examples

### Example 8: Confluence Integration Setup

**Scenario**: Setting up and publishing to Confluence

```bash
# Step 1: Initialize Confluence integration
$ adpa confluence init
🔧 Confluence Integration Setup

Enter Confluence base URL: https://company.atlassian.net
Enter space key: PROJECTDOCS
Enter username: john.doe@company.com

✅ Confluence configuration saved

# Step 2: Authenticate with OAuth2
$ adpa confluence oauth2 login
🔐 Starting OAuth2 authentication...

Opening browser for authentication...
✅ Authentication successful
✅ Access token stored securely

# Step 3: Test connection
$ adpa confluence test
🔍 Testing Confluence connection...

✅ Connection successful
✅ Space access verified
✅ Write permissions confirmed

# Step 4: Publish documents
$ adpa confluence publish --documents-path ./generated-documents
📤 Publishing documents to Confluence...

📋 Documents to publish:
   • project-charter.md → "Project Charter"
   • stakeholder-register.md → "Stakeholder Register"
   • risk-management-plan.md → "Risk Management Plan"
   • business-case.md → "Business Case"

⏳ Publishing progress:
   [████████████████████████████████████████] 100% (4/4)

✅ All documents published successfully!

🔗 Published pages:
   • Project Charter: https://company.atlassian.net/wiki/spaces/PROJECTDOCS/pages/123456
   • Stakeholder Register: https://company.atlassian.net/wiki/spaces/PROJECTDOCS/pages/123457
   • Risk Management Plan: https://company.atlassian.net/wiki/spaces/PROJECTDOCS/pages/123458
   • Business Case: https://company.atlassian.net/wiki/spaces/PROJECTDOCS/pages/123459
```

### Example 9: SharePoint Integration

**Scenario**: Publishing documents to SharePoint

```bash
# Setup SharePoint integration
$ adpa sharepoint init
🔧 SharePoint Integration Setup

Enter SharePoint site URL: https://company.sharepoint.com/sites/projectdocs
Enter document library name: Documents
Enter tenant ID: 12345678-1234-1234-1234-123456789012

✅ SharePoint configuration saved

# Authenticate and publish
$ adpa sharepoint oauth2 login
🔐 Microsoft Graph OAuth2 authentication...
✅ Authentication successful

$ adpa sharepoint publish --documents-path ./generated-documents
📤 Uploading documents to SharePoint...

✅ Upload complete!
📁 Documents available at: https://company.sharepoint.com/sites/projectdocs/Documents
```

### Example 10: Git Integration Workflow

**Scenario**: Version control integration

```bash
# Initialize repository
$ adpa vcs init
✅ Git repository initialized
✅ .gitignore created
✅ Initial commit: "Initialize ADPA project"

# Generate documents
$ adpa generate-category pmbok

# Check status
$ adpa vcs status
📊 Git Repository Status:

Modified files:
   • generated-documents/ (25 new files)

Untracked files:
   • config-rga.json (modified)

# Commit changes
$ adpa vcs commit --message "Add PMBOK documentation"
✅ Changes committed successfully
📝 Commit hash: a1b2c3d4

# Push to remote (if configured)
$ adpa vcs push
✅ Changes pushed to remote repository
```

---

## Project Management Examples

### Example 11: Stakeholder Analysis Workflow

**Scenario**: Complete stakeholder analysis for enterprise project

```bash
$ adpa stakeholder analysis --context "Enterprise CRM implementation affecting 200+ users across sales, marketing, customer service, and IT departments"

🔍 Performing stakeholder analysis...

📊 Stakeholder Analysis Results:

Identified Stakeholder Groups:
   • Executive Sponsors (3)
   • Department Heads (4) 
   • End Users (200+)
   • IT Support Team (12)
   • External Vendors (2)

Influence/Interest Matrix:
   High Influence, High Interest:
   • Chief Revenue Officer
   • VP of Sales
   • VP of Marketing
   
   High Influence, Low Interest:
   • Chief Technology Officer
   • Chief Financial Officer
   
   Low Influence, High Interest:
   • Sales Representatives (50)
   • Marketing Specialists (30)
   • Customer Service Reps (75)

✅ Generated documents:
   • stakeholder-analysis.md
   • stakeholder-register.md
   • stakeholder-engagement-plan.md

💡 Recommendations:
   • Schedule weekly check-ins with high influence stakeholders
   • Create user training program for end users
   • Establish feedback channels for each department
```

### Example 12: Risk Assessment

**Scenario**: Software development risk assessment

```bash
$ adpa risk-compliance --project "Mobile Banking App" --type SOFTWARE_DEVELOPMENT --description "Customer-facing mobile banking application with biometric authentication"

🔍 Performing risk assessment...

📊 Risk Assessment Results:

Project Type: Software Development
Industry Context: Financial Services
Complexity Level: High

Identified Risk Categories:
   🔒 Security Risks (High Priority)
   • Data breach vulnerabilities
   • Authentication bypass
   • API security weaknesses
   
   ⚡ Technical Risks (Medium Priority)
   • Platform compatibility issues
   • Performance bottlenecks
   • Third-party integration failures
   
   📋 Compliance Risks (High Priority)
   • PCI DSS compliance
   • GDPR requirements
   • Banking regulations
   
   👥 Operational Risks (Medium Priority)
   • Resource availability
   • Skill gaps
   • Timeline pressures

Risk Mitigation Strategies:
   • Implement security code reviews
   • Conduct penetration testing
   • Establish compliance checkpoints
   • Create contingency plans

✅ Generated documents:
   • risk-assessment-report.md
   • risk-register.md
   • risk-mitigation-plan.md

📈 Overall Risk Score: 7.2/10 (High)
💡 Recommendation: Implement additional security measures before deployment
```

### Example 13: Business Analysis Workflow

**Scenario**: Interactive business analysis session

```bash
$ adpa business-analysis --interactive

🔍 Interactive Business Analysis Session

Select analysis type:
   1. Requirements Elicitation
   2. Process Modeling
   3. Use Case Analysis
   4. Business Rules Definition
   5. Impact Analysis
   6. Quality Assessment

Selection: 1

📋 Requirements Elicitation

Stakeholder Groups Identified:
   • Business Users
   • System Administrators  
   • External Partners
   • Compliance Team

Elicitation Techniques Recommended:
   • Stakeholder interviews (Primary)
   • Workshop sessions (Secondary)
   • Document analysis (Supporting)
   • Prototyping (Validation)

Interview Questions Generated:
   Business Users:
   • What are your current pain points?
   • How do you envision the solution working?
   • What would success look like?
   
   System Administrators:
   • What are the technical constraints?
   • What integration points exist?
   • What are the security requirements?

✅ Generated documents:
   • requirements-elicitation-plan.md
   • interview-questions.md
   • workshop-agenda.md

Next Steps:
   1. Schedule stakeholder interviews
   2. Conduct requirements workshops
   3. Document and validate requirements
```

---

## Troubleshooting Examples

### Example 14: AI Provider Issues

**Scenario**: API key not working

```bash
$ adpa generate project-charter
❌ Error: AI provider authentication failed

🔍 Diagnosing issue...

Issue: Invalid API key for Google AI
Possible causes:
   • API key expired
   • API key not set correctly
   • Network connectivity issues

Suggested solutions:
   1. Check API key configuration
   2. Regenerate API key
   3. Test network connection

$ adpa validate --ai-connection
🔍 Testing AI provider connection...

❌ Google AI: Authentication failed
   • API Key: Set but invalid
   • Model: gemini-1.5-flash
   • Endpoint: Reachable

💡 Solution: Update your API key
   Run: adpa setup --provider google-ai

$ adpa setup --provider google-ai
Enter your Google AI API Key: ****************************
✅ API key updated and validated
```

### Example 15: Template Generation Failure

**Scenario**: Template not found error

```bash
$ adpa generate invalid-template
❌ Error: Template 'invalid-template' not found

🔍 Available templates:
   Use 'adpa list-templates' to see all available templates
   Use 'adpa list-templates --search <term>' to search templates

$ adpa list-templates --search "project"
📋 Templates matching 'project':

PMBOK Category:
   • project-charter - Project Charter document
   • project-management-plan - Comprehensive project management plan
   • project-scope-statement - Detailed project scope statement

Strategic Category:
   • project-purpose - Project purpose and objectives

$ adpa generate project-charter
✅ Generated: project-charter.md
```

### Example 16: Permission Issues

**Scenario**: Output directory permission error

```bash
$ adpa generate project-charter --output /restricted/path
❌ Error: Permission denied writing to '/restricted/path'

💡 Solutions:
   1. Use a different output directory
   2. Check directory permissions
   3. Create directory with proper permissions

$ mkdir -p ~/documents/adpa-output
$ adpa generate project-charter --output ~/documents/adpa-output
✅ Generated: ~/documents/adpa-output/project-charter.md
```

---

## Advanced Workflow Examples

### Example 17: Automated Documentation Pipeline

**Scenario**: Automated daily documentation updates

```bash
#!/bin/bash
# automated-docs-pipeline.sh

echo "🚀 Starting automated documentation pipeline..."

# Generate all documents
echo "📝 Generating documents..."
adpa generate-all --output ./docs --retries 3

# Validate documents
echo "🔍 Validating documents..."
adpa validate --output ./docs --pmbok --babok --dmbok

# Publish to Confluence
echo "📤 Publishing to Confluence..."
adpa confluence publish --documents-path ./docs

# Publish to SharePoint
echo "📁 Publishing to SharePoint..."
adpa sharepoint publish --documents-path ./docs

# Commit to Git
echo "💾 Committing to version control..."
adpa vcs commit --message "Automated documentation update $(date)"
adpa vcs push

# Generate analytics report
echo "📊 Generating analytics..."
adpa feedback export --format json --output ./analytics/$(date +%Y%m%d).json

echo "✅ Pipeline complete!"
```

**Cron Job Setup**:
```bash
# Add to crontab for daily execution at 2 AM
0 2 * * * /path/to/automated-docs-pipeline.sh >> /var/log/adpa-pipeline.log 2>&1
```

### Example 18: Custom Context Management

**Scenario**: Using context files for consistent generation

```bash
# Create project context file
$ cat > project-context.json << EOF
{
  "project": {
    "name": "Enterprise Customer Portal",
    "industry": "Financial Services",
    "timeline": "12 months",
    "budget": "$2.5M",
    "team_size": 25,
    "stakeholders": {
      "count": 50,
      "departments": ["Sales", "Marketing", "IT", "Compliance", "Operations"]
    },
    "technology": {
      "frontend": "React",
      "backend": "Node.js",
      "database": "PostgreSQL",
      "cloud": "AWS"
    },
    "compliance": ["SOX", "PCI DSS", "GDPR"]
  }
}
EOF

# Generate documents with context file
$ adpa generate project-charter --context-file ./project-context.json
✅ Generated: project-charter.md (using project context)

$ adpa generate stakeholder-register --context-file ./project-context.json  
✅ Generated: stakeholder-register.md (using project context)

# Generate entire category with context
$ adpa generate-category pmbok --context-file ./project-context.json
✅ Generated 25 PMBOK documents with consistent context
```

### Example 19: Performance Monitoring

**Scenario**: Monitoring CLI performance and usage

```bash
# Enable performance monitoring
$ adpa configure --monitoring true
✅ Performance monitoring enabled

# Generate documents with monitoring
$ adpa generate-category babok --parallel --max-concurrent 3

📊 Performance Metrics:
   • Total Time: 1m 23s
   • Average per Document: 4.6s
   • Parallel Efficiency: 78%
   • Memory Usage: 245MB peak
   • AI Provider Response Time: 2.1s avg

# View detailed metrics
$ adpa metrics --category generation --period 7d

📈 Generation Metrics (Last 7 days):
   • Total Documents: 156
   • Success Rate: 98.7%
   • Average Generation Time: 5.2s
   • Most Used Template: project-charter (23 times)
   • Peak Usage: Tuesday 2-3 PM

# Export metrics for analysis
$ adpa metrics export --format csv --output ./metrics.csv
✅ Metrics exported to metrics.csv
```

### Example 20: Template Development and Testing

**Scenario**: Creating and testing custom templates

```bash
# Scaffold new template
$ adpa templates scaffold --category custom --name security-assessment
✅ Template scaffolded: ./custom-templates/security-assessment.json

# Edit template (example structure)
$ cat ./custom-templates/security-assessment.json
{
  "name": "security-assessment",
  "category": "custom",
  "title": "Security Assessment Report",
  "description": "Comprehensive security assessment for software projects",
  "sections": [
    {
      "title": "Executive Summary",
      "prompt": "Generate an executive summary of security findings..."
    },
    {
      "title": "Vulnerability Assessment", 
      "prompt": "Detail identified vulnerabilities and their risk levels..."
    }
  ]
}

# Validate template
$ adpa validate --template ./custom-templates/security-assessment.json
✅ Template structure valid
✅ Prompt quality score: 87/100
⚠️  Suggestion: Add more specific context variables

# Register template
$ adpa templates register ./custom-templates/security-assessment.json
✅ Template registered successfully

# Test template generation
$ adpa generate security-assessment --test-mode
✅ Test generation successful
📄 Output preview: ./test-output/security-assessment.md

# Compare with expected output
$ adpa templates compare --template security-assessment --expected ./expected/security-assessment.md
📊 Comparison Results:
   • Content Similarity: 94%
   • Structure Match: 100%
   • Quality Score: 91/100
   ✅ Template meets quality standards
```

---

## Code Samples and Configuration Examples

### Environment Configuration (.env)

```bash
# Google AI Configuration
GOOGLE_AI_API_KEY=AIzaSyD...
GOOGLE_AI_MODEL=gemini-1.5-flash

# Azure OpenAI Configuration  
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=sk-...
DEPLOYMENT_NAME=gpt-4
USE_ENTRA_ID=false

# GitHub AI Configuration
GITHUB_TOKEN=ghp_...
GITHUB_ENDPOINT=https://models.github.ai/inference/
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini

# General Configuration
CURRENT_PROVIDER=google-ai
DEFAULT_OUTPUT_DIR=./generated-documents
LOG_LEVEL=info
```

### Configuration File (config-rga.json)

```json
{
  "currentProvider": "google-ai",
  "defaultOutputDir": "./generated-documents",
  "providers": {
    "google-ai": {
      "model": "gemini-1.5-flash",
      "maxRetries": 3,
      "timeout": 30000
    },
    "azure-openai": {
      "model": "gpt-4",
      "endpoint": "https://your-resource.openai.azure.com/",
      "maxRetries": 3,
      "timeout": 30000
    }
  },
  "docsVcs": {
    "enabled": true,
    "autoCommit": false,
    "commitMessage": "Update documentation"
  },
  "confluence": {
    "baseUrl": "https://company.atlassian.net",
    "spaceKey": "PROJECTDOCS"
  },
  "sharepoint": {
    "siteUrl": "https://company.sharepoint.com/sites/projectdocs",
    "libraryName": "Documents"
  },
  "validation": {
    "enablePMBOK": true,
    "enableBABOK": true,
    "enableDMBOK": true,
    "qualityThreshold": 80
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "docs:generate": "adpa generate-all --output ./docs",
    "docs:validate": "adpa validate --output ./docs",
    "docs:publish": "adpa confluence publish --documents-path ./docs",
    "docs:backup": "adpa vcs commit --message 'Backup documentation'",
    "docs:full-pipeline": "npm run docs:generate && npm run docs:validate && npm run docs:publish && npm run docs:backup",
    "setup:google": "adpa setup --provider google-ai",
    "setup:azure": "adpa setup --provider azure-openai",
    "status": "adpa status --detailed",
    "diagnose": "adpa diagnose --detailed"
  }
}
```

---

This practical examples guide provides real-world scenarios, actual command outputs, and working code samples that users can follow to understand and use the ADPA CLI effectively. Each example includes expected outputs and common variations to help users troubleshoot and adapt the commands to their specific needs.