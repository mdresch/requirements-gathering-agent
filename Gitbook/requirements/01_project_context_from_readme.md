# Project Context from README.md

# Requirements Gathering Agent

A comprehensive Node.js/TypeScript module for automated project management documentation generation using Azure AI. This tool generates complete PMBOK-aligned project documentation, including strategic sections, requirements, and comprehensive project management plans for any software project.

## Features

### Strategic Planning
- Project vision, mission, core values, and purpose statements
- User roles, needs, and processes identification
- Technology stack analysis and recommendations

### PMBOK-Aligned Documentation Generation
This tool can generate comprehensive project management documentation following the Project Management Body of Knowledge (PMBOK) framework:

#### Initiating Process Group
- **Project Charter**: Complete project authorization document
- **Stakeholder Register**: Comprehensive stakeholder identification and analysis

#### Planning Process Group
- **Scope Management Plan**: Project scope definition and control procedures
- **Requirements Management Plan**: Requirements collection, analysis, and traceability
- **Schedule Management Plan**: Time management and scheduling approach
- **Cost Management Plan**: Budget planning and cost control procedures
- **Quality Management Plan**: Quality assurance and control processes
- **Resource Management Plan**: Human and material resource planning
- **Communications Management Plan**: Stakeholder communication strategy
- **Risk Management Plan**: Risk identification, analysis, and response planning
- **Procurement Management Plan**: Vendor and contract management approach
- **Stakeholder Engagement Plan**: Stakeholder engagement strategies

#### Detailed Planning Artifacts
- **Work Breakdown Structure (WBS)**: Hierarchical project decomposition
- **WBS Dictionary**: Detailed work package descriptions
- **Activity List**: Comprehensive project activities
- **Activity Duration Estimates**: Time estimation for all activities
- **Activity Resource Estimates**: Resource requirements per activity
- **Schedule Network Diagram**: Activity dependencies and relationships
- **Milestone List**: Key project deliverables and checkpoints

#### Additional Analysis & Considerations
- **Technology Stack Analysis**: Technical architecture recommendations
- **Risk Analysis**: Comprehensive risk assessment and mitigation strategies
- **Compliance Considerations**: Regulatory and standards compliance requirements
- **UI/UX Considerations**: User experience and interface design guidelines

### Technical Features
- Powered by Azure AI Inference API for enterprise-grade reliability
- Enforces strict JSON output for easy integration
- Modular architecture for flexible implementation
- Can be used in any project, not just Next.js or portfolio platforms
- Command-line interface for direct document generation

## Installation

```bash
npm install requirements-gathering-agent
```

## Quick Start

### Basic Strategic Planning

```typescript
import { generateRequirements, generateStrategicSections } from 'requirements-gathering-agent';

const result = await generateStrategicSections({
  businessProblem: 'Describe your business problem here',
  technologyStack: ['TypeScript', 'Next.js'],
  contextBundle: 'Additional context here'
});

console.log(result.vision, result.mission, result.coreValues, result.purpose);
```

### Generate PMBOK Documentation

```typescript
import { 
  getAiProjectCharter,
  getAiScopeManagementPlan,
  getAiScheduleManagementPlan,
  getAiRiskManagementPlan
} from 'requirements-gathering-agent';

// Generate a complete project charter
const charter = await getAiProjectCharter({
  businessProblem: 'Need a customer relationship management system',
  technologyStack: ['React', 'Node.js', 'PostgreSQL'],
  contextBundle: 'Enterprise CRM for sales team automation'
});

// Generate comprehensive management plans
const scopePlan = await getAiScopeManagementPlan({
  businessProblem: 'Need a customer relationship management system',
  technologyStack: ['React', 'Node.js', 'PostgreSQL'],
  contextBundle: 'Enterprise CRM for sales team automation'
});
```

### Command Line Interface

Generate documents directly from the command line:

```bash
# First, set up your Azure AI credentials (required for AI generation)
# Create a .env.local file or set environment variables:
# AZURE_AI_API_KEY=your_azure_ai_api_key
# AZURE_AI_ENDPOINT=your_azure_ai_endpoint

# Build the TypeScript project
npm run build

# Generate all PMBOK documents
npm run generate-docs
# OR
npm start
# OR
node dist/cli.js

# For development with auto-compilation
npm run dev
```

# Using a High-Token LLM Model

To use a large-context LLM (such as GPT-4-32k, Claude 3, etc.) for requirements and PMBOK document generation, set the environment variable `REQUIREMENTS_AGENT_MODEL` to your desired model name before running the agent. This enables processing and generating longer documents without token limit issues.

**Example (Linux/macOS):**
```bash
export REQUIREMENTS_AGENT_MODEL="openai/gpt-4-32k"
# Then run your application as usual
```

If you use a `.env` file, add:
```
REQUIREMENTS_AGENT_MODEL=openai/gpt-4-32k
```

The agent will automatically use the specified model for all LLM-powered operations.

## API Reference

### Core Functions

#### `generateStrategicSections(input)`
Generates strategic planning documents.
- **Input**: `{ businessProblem: string, technologyStack: string[], contextBundle: string }`
- **Returns**: `{ vision: string, mission: string, coreValues: string, purpose: string }`

#### `generateRequirements(input)`
Generates user requirements and roles.
- **Input**: `{ businessProblem: string, technologyStack: string[], contextBundle: string }`
- **Returns**: `Array<{ role: string, needs: string[], processes: string[] }>`

### PMBOK Document Generation Functions

#### Initiating Process Group
- `getAiProjectCharter(input)` - Complete project authorization document
- `getAiStakeholderRegister(input)` - Stakeholder identification and analysis

#### Planning Process Group - Management Plans
- `getAiScopeManagementPlan(input)` - Scope definition and control
- `getAiRequirementsManagementPlan(input)` - Requirements collection and traceability
- `getAiScheduleManagementPlan(input)` - Time management approach
- `getAiCostManagementPlan(input)` - Budget and cost control
- `getAiQualityManagementPlan(input)` - Quality assurance processes
- `getAiResourceManagementPlan(input)` - Resource planning and management
- `getAiCommunicationsManagementPlan(input)` - Communication strategy
- `getAiRiskManagementPlan(input)` - Risk management approach
- `getAiProcurementManagementPlan(input)` - Vendor and contract management
- `getAiStakeholderEngagementPlan(input)` - Stakeholder engagement strategy

#### Planning Process Group - Detailed Artifacts
- `getAiWbs(input)` - Work Breakdown Structure
- `getAiWbsDictionary(input)` - Work package descriptions
- `getAiActivityList(input)` - Project activities list
- `getAiActivityDurationEstimates(input)` - Time estimates
- `getAiActivityResourceEstimates(input)` - Resource requirements
- `getAiScheduleNetworkDiagram(input)` - Activity dependencies
- `getAiMilestoneList(input)` - Key project milestones

#### Analysis Functions
- `getAiTechStackAnalysis(input)` - Technology recommendations
- `getAiRiskAnalysis(input)` - Risk assessment
- `getAiComplianceConsiderations(input)` - Regulatory compliance
- `getAiUiUxConsiderations(input)` - User experience guidelines

All functions accept the same input format:
```typescript
{
  businessProblem: string,
  technologyStack: string[],
  contextBundle: string
}
```

# Integration Guide

This agent can be integrated into any Node.js/TypeScript project to automate comprehensive project management documentation generation.

## Setup in New Project

### 1. Copy the Module
Copy the entire `requirements-gathering-agent` directory into your project:
```bash
# Copy to project root
cp -r requirements-gathering-agent /path/to/your/project/

# Or copy to libs directory
cp -r requirements-gathering-agent /path/to/your/project/libs/
```

### 2. Install Dependencies
```bash
npm install @azure-rest/ai-inference @azure/core-auth
```

### 3. Environment Configuration
Set up your Azure AI Inference API credentials:
```bash
# .env file
AZURE_AI_API_KEY=your_azure_ai_api_key
AZURE_AI_ENDPOINT=your_azure_ai_endpoint
```

### 4. Import and Use
```typescript
import { 
  generateStrategicSections, 
  generateRequirements,
  getAiProjectCharter,
  getAiScopeManagementPlan 
} from './requirements-gathering-agent/index.js';

// Generate strategic documentation
const strategic = await generateStrategicSections({
  businessProblem: 'A SaaS platform for remote team collaboration',
  technologyStack: ['Node.js', 'React', 'PostgreSQL'],
  contextBundle: 'Real-time collaboration platform for distributed teams'
});

// Generate PMBOK documentation
const charter = await getAiProjectCharter({
  businessProblem: 'A SaaS platform for remote team collaboration',
  technologyStack: ['Node.js', 'React', 'PostgreSQL'],
  contextBundle: 'Real-time collaboration platform for distributed teams'
});
```

### 5. Document Generation Script
Create a script to generate all project documentation:

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { 
  generateStrategicSections,
  generateRequirements,
  getAiProjectCharter,
  getAiScopeManagementPlan,
  getAiScheduleManagementPlan,
  getAiRiskManagementPlan,
  getAiWbs,
  getAiStakeholderRegister
} from './requirements-gathering-agent/index.js';

async function generateProjectDocumentation() {
  const projectInput = {
    businessProblem: 'A SaaS platform for remote team collaboration',
    technologyStack: ['Node.js', 'React', 'PostgreSQL'],
    contextBundle: 'The platform enables real-time chat, file sharing, and project management for distributed teams.'
  };

  // Create docs directory
  await mkdir('./docs', { recursive: true });

  // Generate strategic documents
  const strategic = await generateStrategicSections(projectInput);
  const requirements = await generateRequirements(projectInput);

  // Generate PMBOK documents
  const charter = await getAiProjectCharter(projectInput);
  const scopePlan = await getAiScopeManagementPlan(projectInput);
  const schedulePlan = await getAiScheduleManagementPlan(projectInput);
  const riskPlan = await getAiRiskManagementPlan(projectInput);
  const wbs = await getAiWbs(projectInput);
  const stakeholders = await getAiStakeholderRegister(projectInput);

  // Write all documents
  await Promise.all([
    writeFile('./docs/strategic-plan.json', JSON.stringify(strategic, null, 2)),
    writeFile('./docs/requirements.json', JSON.stringify(requirements, null, 2)),
    writeFile('./docs/project-charter.md', charter),
    writeFile('./docs/scope-management-plan.md', scopePlan),
    writeFile('./docs/schedule-management-plan.md', schedulePlan),
    writeFile('./docs/risk-management-plan.md', riskPlan),
    writeFile('./docs/work-breakdown-structure.md', wbs),
    writeFile('./docs/stakeholder-register.md', stakeholders)
  ]);

  console.log('✅ Project documentation generated successfully!');
}

generateProjectDocumentation().catch(console.error);
```

## Example: Complete Project Setup

```typescript
// generate-docs.ts
import { writeFile, mkdir } from 'fs/promises';
import { 
  generateStrategicSections,
  getAiProjectCharter,
  getAiScopeManagementPlan,
  getAiRiskManagementPlan,
  getAiWbs,
  getAiActivityList,
  getAiMilestoneList,
  getAiStakeholderRegister,
  getAiTechStackAnalysis
} from './requirements-gathering-agent/index.js';

(async () => {
  const projectDetails = {
    businessProblem: 'Need an e-commerce platform for small businesses',
    technologyStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    contextBundle: 'Multi-tenant e-commerce solution with inventory management, payment processing, and analytics dashboard'
  };

  // Create documentation structure
  await mkdir('./project-docs', { recursive: true });
  await mkdir('./project-docs/pmbok', { recursive: true });

  console.log('🚀 Generating comprehensive project documentation...');

  // Generate all documents
  const [
    strategic,
    charter,
    scopePlan,
    riskPlan,
    wbs,
    activities,
    milestones,
    stakeholders,
    techAnalysis
  ] = await Promise.all([
    generateStrategicSections(projectDetails),
    getAiProjectCharter(projectDetails),
    getAiScopeManagementPlan(projectDetails),
    getAiRiskManagementPlan(projectDetails),
    getAiWbs(projectDetails),
    getAiActivityList(projectDetails),
    getAiMilestoneList(projectDetails),
    getAiStakeholderRegister(projectDetails),
    getAiTechStackAnalysis(projectDetails)
  ]);

  // Write organized documentation
  await Promise.all([
    writeFile('./project-docs/strategic-overview.json', JSON.stringify(strategic, null, 2)),
    writeFile('./project-docs/pmbok/01-project-charter.md', charter),
    writeFile('./project-docs/pmbok/02-scope-management-plan.md', scopePlan),
    writeFile('./project-docs/pmbok/03-risk-management-plan.md', riskPlan),
    writeFile('./project-docs/pmbok/04-work-breakdown-structure.md', wbs),
    writeFile('./project-docs/pmbok/05-activity-list.md', activities),
    writeFile('./project-docs/pmbok/06-milestone-list.md', milestones),
    writeFile('./project-docs/pmbok/07-stakeholder-register.md', stakeholders),
    writeFile('./project-docs/technical-analysis.md', techAnalysis)
  ]);

  console.log('✅ Complete project documentation generated in ./project-docs/');
})();
```

## Publishing as Package

For multi-project use, publish to npm:

1. **Update package.json**:
```json
{
  "name": "your-requirements-agent",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

2. **Build and publish**:
```bash
npm run build
npm publish
```

3. **Install in other projects**:
```bash
npm install your-requirements-agent
```

## Technical Requirements

- **Node.js**: 18+ (for ES modules support)
- **TypeScript**: 4.5+ (for proper type definitions)
- **Azure AI Inference API**: Valid API key and endpoint
- **Dependencies**: `@azure-rest/ai-inference`, `@azure/core-auth`

## Troubleshooting

### Common Issues

1. **File Permission Errors**: Ensure write permissions for output directories
2. **API Key Issues**: Verify Azure AI credentials are properly configured
3. **Module Import Errors**: Check that you're using ES modules (`.js` extensions in imports)
4. **TypeScript Compilation**: Ensure `tsconfig.json` is configured for ES modules

### Support
For issues or questions, please check the project documentation or create an issue in the repository.
