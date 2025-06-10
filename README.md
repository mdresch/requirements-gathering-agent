# Requirements Gathering Agent

[![npm version](https://badge.fury.io/js/requirements-gathering-agent.svg)](https://badge.fury.io/js/requirements-gathering-agent)
[![npm downloads](https://img.shields.io/npm/dm/requirements-gathering-agent.svg)](https://www.npmjs.com/package/requirements-gathering-agent)
[![license](https://img.shields.io/npm/l/requirements-gathering-agent.svg)](https://github.com/your-username/requirements-gathering-agent/blob/main/LICENSE)

---

## 🎉 MILESTONE ACHIEVED: 175 Weekly Downloads! 

**We're celebrating a major milestone - 175 weekly downloads on NPM!** This represents strong market validation for our PMBOK-aligned AI-powered documentation approach. Thank you to our growing community of project managers and business analysts who are transforming their documentation workflows! 🚀

**[📊 View Full Milestone Report →](MILESTONE-175-DOWNLOADS.md)**

---

🚀 **AI-powered PMBOK documentation generator using Azure OpenAI**

Transform your project's README into comprehensive project management documentation following PMBOK (Project Management Body of Knowledge) standards.

## Features

✅ **Complete PMBOK Document Suite** - Generates 29 professional documents  
✅ **Enhanced Project Analysis** - Discovers and analyzes ALL markdown files beyond README.md  
✅ **Intelligent Context Building** - Scores and prioritizes documentation sources (0-100 relevance)  
✅ **Comprehensive Source Discovery** - Finds stakeholder docs, architecture files, requirements, and more  
✅ **PMBOK 7.0 Compliance Validation** - Validates documents against PMBOK standards  
✅ **Cross-Document Consistency** - Ensures consistency across all generated documents  
✅ **Document Quality Assessment** - Provides detailed quality scores and recommendations  
✅ **Azure OpenAI Integration** - Powered by GPT-4 with Entra ID authentication  
✅ **Organized Output** - Professional categorized directory structure  
✅ **Multiple AI Providers** - Azure OpenAI, GitHub AI, Ollama support  
✅ **Enhanced Context Manager** - Intelligent 3-phase context strategy for large language models  
✅ **Large Context Model Support** - Up to 90% context utilization for models like Gemini 1.5 Pro (2M tokens)  
✅ **Enterprise Ready** - Robust error handling and retry logic  
✅ **TypeScript** - Modern, type-safe implementation

## Quick Start

### Installation

```bash
# Install globally
npm install -g requirements-gathering-agent

# Or run directly with npx
npx requirements-gathering-agent
```

### Basic Usage

```bash
# Generate all PMBOK documents
requirements-gathering-agent

# Generate all documents with PMBOK 7.0 validation
requirements-gathering-agent --validate-pmbok

# Generate with comprehensive validation and quality assessment
requirements-gathering-agent --generate-with-validation

# Generate core documents only
requirements-gathering-agent --core-only

# Generate stakeholder documents only
requirements-gathering-agent --generate-stakeholder

# Generate with retry logic
requirements-gathering-agent --with-retry

# Validate existing documents against PMBOK standards
requirements-gathering-agent --validate-only
```

## 🔍 Enhanced Project Analysis

The Requirements Gathering Agent now features **comprehensive project analysis** that goes far beyond just reading your README.md file. It intelligently discovers and analyzes ALL relevant documentation in your project to build the richest possible context for generating PMBOK documents.

### Intelligent Source Discovery

The enhanced analyzer automatically discovers and processes:

- **📋 Requirements Documents** (`requirements/`, `specs/`, `specifications/`)
- **🏗️ Architecture Documentation** (`docs/architecture.md`, `design/`)
- **👥 Stakeholder Information** (`stakeholders.md`, `requirements/stakeholders.md`)
- **📋 Planning Documents** (`planning/`, `roadmap.md`, `scope.md`)
- **⚙️ Technical Documentation** (`docs/`, `wiki/`, `.github/`)
- **🔄 Project Metadata** (`package.json`, project configuration files)

### Smart Relevance Scoring

Each discovered file is analyzed and scored (0-100) based on:

- **📝 Content Relevance** - PMBOK terminology and project management concepts
- **📁 File Location** - Strategic placement in documentation directories  
- **🏷️ Naming Patterns** - High-value keywords (requirements, architecture, stakeholders)
- **📏 Content Structure** - Well-organized documents with headers and sections
- **📊 Content Depth** - Substantial, meaningful documentation

### Automatic Categorization

Files are intelligently categorized as:
- **🔵 Primary** - Core project documentation (overview, introduction, setup)
- **🟢 Planning** - Requirements, roadmaps, scope, planning documents
- **🟡 Development** - Architecture, APIs, technical specifications
- **🟠 Documentation** - User guides, tutorials, general documentation  
- **⚪ Other** - Supporting documentation

### Enhanced Context Building

The system builds comprehensive project context by:
- **🎯 Prioritizing** high-scoring, relevant documentation sources
- **📋 Integrating** content from multiple markdown files beyond README.md
- **⚖️ Balancing** context size to avoid token overflow while maximizing information
- **💡 Suggesting** the most valuable source files for manual review

### Example Analysis Output

```bash
🔍 Performing comprehensive project analysis...
✅ Found 12 additional markdown files
📋 Found 12 additional relevant files:
   • stakeholder-requirements.md (planning, score: 89)
   • architecture-overview.md (development, score: 76)
   • project-scope.md (planning, score: 71)
   • api-documentation.md (development, score: 65)
   • user-guide.md (documentation, score: 58)
💡 High-value sources identified: stakeholder-requirements.md, architecture-overview.md, project-scope.md
```

This enhanced analysis ensures that **all relevant project information** is discovered and incorporated into your PMBOK documents, resulting in more accurate, comprehensive, and stakeholder-specific documentation.

## 🧠 Enhanced Context Manager

The Requirements Gathering Agent features an **Enhanced Context Manager** that dramatically improves documentation quality by providing comprehensive context to large language models. This intelligent system adapts to your AI model's capabilities to deliver the best possible results.

### 🚀 Key Performance Improvements

- **25-75x Context Improvement**: From 0.66% to 20-50% context utilization
- **Large Model Optimization**: Up to 90% context utilization for models like Gemini 1.5 Pro
- **Intelligent Adaptation**: Automatically detects and optimizes for your AI model's capabilities
- **Comprehensive Project Understanding**: Provides full project context for accurate documentation

### 🔧 3-Phase Context Strategy

The Enhanced Context Manager implements an intelligent 3-phase approach:

#### Phase 1: Core Context
- **Direct Relationships**: All directly related content with smart prioritization
- **Relationship Scoring**: Context prioritized by relationship count and relevance
- **Token Optimization**: Precise token estimation and allocation

#### Phase 2: Ultra-Large Model Support (>200k tokens)
- **Comprehensive Context**: For models like Gemini 1.5 Pro/Flash (1M-2M tokens)
- **Maximum Accuracy**: Includes ALL available project context when possible
- **Smart Buffer Management**: 10k token response buffer for optimal performance

#### Phase 3: Large Model Supplementary (50k-200k tokens)
- **Selective Enhancement**: Top 3 supplementary contexts for models like GPT-4, Claude
- **Balanced Approach**: Optimal context without overwhelming smaller models
- **Performance Optimization**: Intelligent caching and token management

### 📊 Model-Specific Optimization

The system automatically detects and optimizes for different AI models:

| Model | Token Limit | Context Strategy | Expected Utilization |
|-------|------------|------------------|---------------------|
| **Gemini 1.5 Pro** | 2M tokens | Ultra-large comprehensive | 20-90% |
| **Gemini 1.5 Flash** | 1M tokens | Ultra-large comprehensive | 20-90% |
| **GPT-4** | 128k tokens | Large supplementary | 15-50% |
| **Claude 3.5 Sonnet** | 200k tokens | Large supplementary | 15-50% |
| **Ollama Models** | 128k tokens | Large supplementary | 15-50% |

### 🎯 Real-World Impact

**Before Enhanced Context Manager:**
- Context utilization: ~0.66-0.80% of available tokens
- Limited project understanding
- Basic documentation generation

**After Enhanced Context Manager:**
- Context utilization: 20-90% for large models
- Comprehensive project understanding
- Dramatically more accurate and detailed documentation
- Better cross-references and consistency

### 📈 Advanced Reporting & Analytics

Get detailed insights into context performance:

```bash
# Get context utilization report
requirements-gathering-agent --context-report

# Analyze document-specific context usage
requirements-gathering-agent --analyze-context

# Performance metrics and optimization recommendations
requirements-gathering-agent --context-metrics
```

**Example Context Report:**
```
📊 Context Manager Performance Report
- Core Context Tokens: 12,450
- Enriched Context Items: 18
- Total Project Tokens: 156,890
- Model Type: Ultra-Large Context (Gemini 1.5 Pro)
- Context Utilization: 47.3% (946,800 tokens used)
- Performance: 🌟 Excellent - Making optimal use of large context capabilities
```

### Supported Project Structures

The enhanced analyzer intelligently searches common documentation patterns:

```
your-project/
├── README.md                    # Primary project documentation
├── docs/                       # General documentation
│   ├── architecture.md         # System architecture
│   ├── api.md                  # API documentation  
│   └── user-guide.md           # User guides
├── requirements/               # Requirements documentation
│   ├── stakeholders.md         # Stakeholder analysis
│   ├── functional.md           # Functional requirements
│   └── non-functional.md       # Non-functional requirements
├── specs/                      # Technical specifications
├── planning/                   # Project planning documents
│   ├── roadmap.md             # Project roadmap
│   └── scope.md               # Project scope
├── .github/                    # GitHub documentation
│   └── CONTRIBUTING.md         # Contribution guidelines
├── design/                     # Design documentation
└── wiki/                       # Wiki-style documentation
```

The analyzer automatically:
- **🔍 Searches recursively** up to 3 levels deep in each directory
- **⚡ Skips system directories** (node_modules, .git, dist, build, etc.)
- **🚫 Avoids generated content** (generated-documents, coverage, logs, etc.)
- **📊 Provides source suggestions** for the highest-value documentation files

## Configuration

Create a `.env` file with your AI provider configuration:

### Google AI Studio (Free Tier Available) - Recommended for Large Context
```bash
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_MODEL=gemini-1.5-pro    # 2M tokens - Ultra-large context
# OR
GOOGLE_AI_MODEL=gemini-1.5-flash  # 1M tokens - Large context
```
Get your API key: https://makersuite.google.com/app/apikey

*Note: Gemini models provide the best context utilization with the Enhanced Context Manager, supporting up to 2M tokens for comprehensive project analysis.*

### Azure OpenAI (Recommended)
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
DEPLOYMENT_NAME=gpt-4.1-mini
USE_ENTRA_ID=true
```

### GitHub AI (Free Tier)
```bash
AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com
GITHUB_TOKEN=your-github-token
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini
```

### Ollama (Local)
```bash
AZURE_AI_ENDPOINT=http://localhost:11434
REQUIREMENTS_AGENT_MODEL=llama3.1
```

## Generated Documents

The tool generates a comprehensive set of PMBOK-compliant documents organized in categories:

### 📋 Core Analysis
- Project Summary and Goals
- User Stories and Requirements  
- User Personas
- Key Roles and Needs Analysis

### 📜 Project Charter
- PMBOK Project Charter

### 📊 Management Plans
- Scope Management Plan
- Risk Management Plan
- Cost Management Plan
- Quality Management Plan
- Resource Management Plan
- Communication Management Plan
- Procurement Management Plan

### 🏗️ Planning Artifacts
- Work Breakdown Structure (WBS)
- WBS Dictionary
- Activity List and Estimates
- Schedule Network Diagram
- Milestone List

### 👥 Stakeholder Management
- Stakeholder Register
- Stakeholder Engagement Plan
- Stakeholder Analysis

### ⚙️ Technical Analysis
- Technology Stack Analysis
- Data Model Suggestions
- Risk Analysis
- Acceptance Criteria
- Compliance Considerations
- UI/UX Considerations

## Output Structure

```
generated-documents/
├── README.md                     # Master index
├── core-analysis/               # Business requirements
├── project-charter/             # Formal authorization
├── management-plans/            # PMBOK management plans
├── planning-artifacts/          # Detailed planning
├── stakeholder-management/      # Stakeholder analysis
└── technical-analysis/          # Technology recommendations
```

## Validation & Quality Assurance

### PMBOK 7.0 Compliance Validation
- **Document Completeness**: Validates all required PMBOK elements are present
- **Quality Assessment**: Scores documents based on structure, content, and terminology
- **Cross-Document Consistency**: Ensures consistency across related documents
- **Compliance Reporting**: Detailed reports with actionable recommendations

### Validation Features
- ✅ PMBOK 7.0 standard compliance checking
- ✅ Required element verification for each document type
- ✅ Project terminology consistency validation
- ✅ Document quality scoring (0-100 scale)
- ✅ Cross-reference validation between documents
- ✅ Comprehensive validation reports with recommendations

## Command Line Options

```bash
requirements-gathering-agent [options]

Options:
  -h, --help                    Show help
  -v, --version                 Show version
  --core-only                   Generate core documents only
  --management-plans            Generate management plans only
  --planning-artifacts          Generate planning artifacts only
  --technical-analysis          Generate technical analysis only
  --generate-stakeholder        Generate stakeholder documents only
  --with-retry                  Enable retry logic for failed documents
  --output <dir>                Specify output directory (default: generated-documents)
  --format <fmt>                Output format: markdown|json|yaml (default: markdown)
  --quiet                       Suppress progress messages (good for CI/CD)
  
Validation Options:
  --validate-pmbok              Generate all documents with PMBOK 7.0 validation
  --generate-with-validation    Generate with comprehensive quality assessment
  --validate-only               Validate existing documents without regenerating
  --validate-consistency        Check cross-document consistency only
  --quality-assessment          Provide detailed quality scores for documents

Context Management Options:
  --context-report              Show Enhanced Context Manager performance report
  --analyze-context             Analyze document-specific context utilization
  --context-metrics             Display context performance metrics and recommendations
  --use-large-context           Force large context mode (auto-detected by default)
```

## 🧩 Modular Processor Architecture (2025 Update)

The Requirements Gathering Agent now uses a modular, configuration-driven processor factory for all document generation. This makes it easy to add, update, or swap document processors without changing core code.

- **Processors are registered in `processor-config.json`** using canonical keys.
- **ProcessorFactory** loads and instantiates processors based on this config, supporting both static and dynamic imports.
- **To add a new document type:**
  1. Implement your processor in `src/modules/documentTemplates/<category>/<YourProcessor>.ts`.
  2. Register it in `processor-config.json`.
  3. Add it to `generationTasks.ts` and update context relationships if needed.
  4. Add a Jest unit test for your processor (see below).
  5. Update documentation and CLI help.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/STEPS-TO-IMPLEMENT-NEW-DOCS.md`](docs/STEPS-TO-IMPLEMENT-NEW-DOCS.md) for full details.

---

## 🆕 Project KickOff Preparations Checklist

A new document type: **Project KickOff Preparations Checklist**

- **Purpose:** Provides a detailed, PMBOK-aligned checklist for project initiation, planning, setup, risk, communication, and more.
- **Canonical key:** `project-kickoff-preparations-checklist`
- **Output:** `planning-artifacts/project-kickoff-preparations-checklist.md`
- **How to generate:**
  ```pwsh
  requirements-gathering-agent --generate-planning
  # or generate all documents (includes checklist)
  requirements-gathering-agent
  ```
- **CLI listing:** Appears under planning artifacts in `--list-templates` and help output.

---

## 🛠️ How to Add New Document Types

1. Follow the modular processor pattern (see above).
2. Reference [`docs/STEPS-TO-IMPLEMENT-NEW-DOCS.md`](docs/STEPS-TO-IMPLEMENT-NEW-DOCS.md) for a step-by-step guide and worked example.
3. Add a Jest unit test for your processor (see guide for example).
4. Update CLI help and documentation.

---

(Sections above and below remain unchanged)

## Enhanced Analysis in Action

When you run the Requirements Gathering Agent, you'll see the comprehensive analysis and enhanced context management in action:

```bash
🚀 Requirements Gathering Agent v2.1.1
✅ Environment configuration loaded
🧠 Enhanced Context Manager initialized (Gemini 1.5 Pro - 2M tokens)
🔍 Performing comprehensive project analysis...
🔍 Analyzing project for all relevant markdown files...
✅ Found 15 additional markdown files
📋 Found 15 additional relevant files:
   • stakeholder-analysis.md (planning, score: 94)
   • system-architecture.md (development, score: 87)
   • requirements-specification.md (planning, score: 82)
   • api-documentation.md (development, score: 76)
   • user-stories.md (planning, score: 71)
   • ... and 10 more files
💡 High-value sources identified: stakeholder-analysis.md, system-architecture.md, requirements-specification.md
🧠 Context Strategy: Ultra-large model detected - Using comprehensive 3-phase context
📊 Context Utilization: 47.3% (946,800 / 2,000,000 tokens)
📋 Starting PMBOK document generation with enhanced context...
```

This comprehensive analysis and enhanced context management ensures your generated PMBOK documents include **all relevant project information** with maximum context utilization for your AI model's capabilities.

### 🔥 Enhanced Context Manager in Action

The Enhanced Context Manager provides real-time insights during document generation:

```bash
🔧 Building context for project-charter (large context model)
📊 Available tokens: 1,847,550
📄 Added full context for stakeholder-analysis: 23,450 tokens
📄 Added full context for system-architecture: 18,920 tokens
📄 Added full context for requirements-specification: 15,670 tokens
🌟 Ultra-large context model: Including comprehensive project context
📚 Added comprehensive context for api-documentation: 12,340 tokens
📚 Added comprehensive context for user-stories: 8,920 tokens
✅ Final context for project-charter: 1,156,890 tokens (57.8% utilization)
```

This level of context ensures that each generated document has access to the full project understanding, resulting in:
- **More Accurate Documentation**: Complete project understanding leads to better accuracy
- **Better Cross-References**: Full context enables proper document relationships
- **Consistent Terminology**: Comprehensive context maintains consistency across documents
- **Stakeholder-Specific Content**: Rich context enables targeted stakeholder analysis

## Validation Output Examples

### PMBOK 7.0 Compliance Report
```
📊 PMBOK 7.0 Compliance Validation Report
==========================================

🎯 Overall Compliance: ✅ COMPLIANT
📈 Consistency Score: 92/100

📋 Document Quality Scores:
   • project-charter: 95/100
     ✅ All required PMBOK elements covered
     ✅ Uses appropriate PMBOK terminology (8 terms found)
   • stakeholder-register: 88/100
     ✅ Well-structured with multiple sections
     ⚠️ Consider adding stakeholder influence analysis

💡 Recommendations:
   • Ensure all documents follow PMBOK 7.0 performance domains
   • Include clear traceability between objectives and deliverables
   • Maintain consistent terminology across all documents
```

### Quality Assessment Features
- **Enhanced Context Analysis**: Automatically discovers and analyzes ALL project documentation
- **Enhanced Context Manager**: 3-phase context strategy with up to 90% token utilization for large models
- **Smart Source Prioritization**: Scores and ranks documentation by PMBOK relevance (0-100)  
- **Content Analysis**: Checks document length, structure, and completeness
- **PMBOK Terminology**: Validates use of standard project management terms
- **Element Coverage**: Ensures all required PMBOK elements are present
- **Consistency Scoring**: Cross-document validation and scoring
- **Actionable Recommendations**: Specific suggestions for improvement
- **Comprehensive Source Discovery**: Finds stakeholder docs, architecture files, requirements beyond README.md

## Authentication

### Google AI Studio
Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Azure OpenAI with Entra ID
```bash
az login
```

### Azure OpenAI with API Key
Set `AZURE_AI_API_KEY` in your `.env` file

### GitHub AI
Get your token from [GitHub Settings](https://github.com/settings/tokens)

### Ollama
```bash
ollama serve
```

## Development

```bash
# Clone repository
git clone https://github.com/mdresch/requirements-gathering-agent.git
cd requirements-gathering-agent

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
```

## Requirements

- Node.js 18.0.0 or higher
- Azure OpenAI resource (recommended) or alternative AI provider
- Azure CLI (for Entra ID authentication)
- **Project Documentation**: The more comprehensive your project documentation (beyond README.md), the richer and more accurate your generated PMBOK documents will be

## What Makes This Different?

The Requirements Gathering Agent stands out by providing:

🔍 **Comprehensive Project Analysis** - Unlike tools that only read README files, we analyze your ENTIRE project documentation ecosystem

🧠 **Enhanced Context Manager** - Revolutionary 3-phase context strategy providing 25-75x more context to AI models for dramatically better documentation

📊 **Intelligent Source Discovery** - Automatically finds and analyzes stakeholder documents, architecture specs, requirements files, and more

🚀 **Large Context Model Optimization** - Up to 90% context utilization for models like Gemini 1.5 Pro (2M tokens), ensuring maximum accuracy

🎯 **PMBOK-Specific Intelligence** - Scores documentation relevance specifically for project management and PMBOK compliance

✅ **End-to-End Validation** - Not just generation, but comprehensive PMBOK 7.0 compliance validation with actionable recommendations

🏗️ **Enterprise-Ready** - Professional directory structure, multiple AI providers, robust error handling, and CI/CD support

🔧 **Model-Aware Performance** - Automatically detects your AI model's capabilities and optimizes context strategy accordingly

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 📖 [Documentation](https://github.com/mdresch/requirements-gathering-agent)
- 🐛 [Issues](https://github.com/mdresch/requirements-gathering-agent/issues)
- 💬 [Discussions](https://github.com/mdresch/requirements-gathering-agent/discussions)

---

**Built with ❤️ by [Menno Drescher] (https://exceptional-cba-project.webflow.io/) using Azure OpenAI**

## 🟡 Outstanding/Recent Issues & Fixes

### Issue: Zero Tokens in Context for Some Documents
- **Symptom:** Some generated documents (e.g., user-personas) showed `Final context: 0 tokens`.
- **Root Cause:** The Enhanced Context Manager was not being populated with the discovered markdown files from project analysis, resulting in an empty context for those documents.
- **Fix:** Added logic to ensure all discovered markdown files are added to the Enhanced Context Manager’s enriched context before document generation. Now, each document receives the full relevant context, and token counts reflect actual content.

### Issue: CLI Permission Denied (`npx rga`)
- **Symptom:** Running `npx rga` resulted in `Permission denied`.
- **Root Cause:** The CLI binary was not executable or not properly linked after build.
- **Fix:** Ensured the CLI is built (`npm run build`), has executable permissions (`chmod +x dist/cli.js`), and is correctly linked in the npm bin directory. Also, documented alternative run commands (`npm start`, `node dist/cli.js`).

### Issue: Enhanced Context Not Utilized for Large Models
- **Symptom:** Large language models (e.g., Gemini 1.5 Pro) were not utilizing their full context window.
- **Root Cause:** The context manager was not auto-detecting model capabilities or was too conservative in context allocation.
- **Fix:** Improved model detection and context allocation logic. Now, up to 90% of available tokens are used for ultra-large models, maximizing documentation accuracy.

---

## 🔧 Suggestions for Further Improvement

The Requirements Gathering Agent is robust and production-ready, but here are some areas for future enhancement—especially in the project analysis and context-building system:

- **Direct Context Injection:**  
  Add a function to directly inject all high-relevance markdown files into the Enhanced Context Manager’s enriched context, not just the combined context string. This will further improve per-document context building and accuracy for large LLMs.

- **Async Parallelization:**  
  For very large projects, consider parallelizing directory scans to speed up project analysis and markdown discovery.

- **Configurable Limits:**  
  Allow configuration of the maximum number of files and maximum content length included in the context via CLI options or environment variables, giving users more control over context size and performance.

- **Custom Directory Patterns:**  
  Enable users to specify additional directories or filename patterns to include or exclude in the analysis, making the tool even more flexible for diverse project structures.

- **Context Utilization Feedback:**  
  Provide real-time feedback or warnings if the context is being truncated due to token limits, and suggest ways to optimize context inclusion.


## 🧠 Enhanced llmProcessor.ts Improvements

⚡ Suggestions for Further Improvement
Async context population: For very large projects, consider parallelizing context injection for speed.
User-configurable context strategies: Allow users to tune context allocation via CLI or config.
Context pruning: Implement smarter pruning for extremely large projects to avoid token overflow.
More granular metrics: Track per-document context utilization and generation times.

Improvmenets contextManager.ts 
💡 Possible Improvements
AI-Powered Summarization:
Replace the fallback truncation in summarizeText with an actual LLM-powered summary for more meaningful context reduction.

Dynamic Context Mapping:
Allow the contextMap to be extended/configured at runtime or via project analysis, so relationships can be tailored to each project.

Async Context Assembly:
For very large projects, parallelize context fetching and summarization for speed.

Context Utilization Metrics:
Add methods to report how much of the available context window is used per document, and warn if context is being heavily truncated.

Context Pruning/Ranking:
Implement smarter selection of enriched context (e.g., based on relevance scores or recency) when there are too many sources to fit.

User-Configurable Token Limits:
Allow users to override maxContextTokens via CLI or config for advanced tuning.

Support for Additional Context Types:
Add support for images, diagrams, or other non-markdown sources as context (with appropriate conversion).

💡 Possible Improvements
AI-Powered Summarization:
Replace the fallback truncation in summarizeText with an actual LLM-powered summary for more meaningful context reduction.

Dynamic Context Mapping:
Allow the contextMap to be extended/configured at runtime or via project analysis, so relationships can be tailored to each project.

Async Context Assembly:
For very large projects, parallelize context fetching and summarization for speed.

Context Utilization Metrics:
Add methods to report how much of the available context window is used per document, and warn if context is being heavily truncated.

Context Pruning/Ranking:
Implement smarter selection of enriched context (e.g., based on relevance scores or recency) when there are too many sources to fit.

User-Configurable Token Limits:
Allow users to override maxContextTokens via CLI or config for advanced tuning.

Support for Additional Context Types:
Add support for images, diagrams, or other non-markdown sources as context (with appropriate conversion).

---

*Have an idea or want to contribute? Open an issue or pull request on GitHub!*
