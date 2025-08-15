/**
 * Prompt Registry for AI Document Generation
 * 
 * Centralized management of tailored system prompts for each document type.
 * Provides specialized prompts that generate content directly relevant to each section.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * Key Features:
 * - Document-type-specific system prompts
 * - Role-based prompt engineering
 * - Context-aware prompt selection
 * - Maintainable prompt templates
 * 
 * @filepath src/modules/ai/prompts/PromptRegistry.ts
 */

export interface PromptTemplate {
    /** Unique identifier for the prompt */
    id: string;
    /** Document type this prompt is designed for */
    documentType: string;
    /** Category of the document (BABOK, DMBOK, PMBOK, etc.) */
    category: string;
    /** AI role and expertise definition */
    systemPrompt: string;
    /** Template for user prompt with placeholders */
    userPromptTemplate: string;
    /** Specific instructions for content structure */
    structureInstructions: string;
    /** Quality criteria and standards to follow */
    qualityCriteria: string;
    /** Maximum recommended tokens for response */
    maxTokens: number;
    /** Priority level for prompt selection */
    priority: number;
    /** Tags for prompt categorization */
    tags: string[];
    /** Version of the prompt */
    version: string;
    /** Last updated timestamp */
    lastUpdated: Date;
}

export interface PromptContext {
    /** Project context information */
    projectContext: string;
    /** Document-specific context */
    documentContext?: string;
    /** Related documents context */
    relatedDocuments?: string[];
    /** Stakeholder information */
    stakeholders?: string;
    /** Business domain context */
    businessDomain?: string;
    /** Technical context */
    technicalContext?: string;
}

/**
 * Central registry for all AI prompts used in document generation
 */
export class PromptRegistry {
    private static instance: PromptRegistry;
    private prompts: Map<string, PromptTemplate> = new Map();
    private categoryPrompts: Map<string, PromptTemplate[]> = new Map();

    private constructor() {
        this.initializePrompts();
    }

    public static getInstance(): PromptRegistry {
        if (!PromptRegistry.instance) {
            PromptRegistry.instance = new PromptRegistry();
        }
        return PromptRegistry.instance;
    }

    /**
     * Initialize all prompt templates
     */
    private initializePrompts(): void {
        // BABOK Prompts
        this.registerBABOKPrompts();
        
        // DMBOK Prompts
        this.registerDMBOKPrompts();
        
        // PMBOK Prompts
        this.registerPMBOKPrompts();
        
        // Requirements Prompts
        this.registerRequirementsPrompts();
        
        // Technical Analysis Prompts
        this.registerTechnicalAnalysisPrompts();
        
        // Quality Assurance Prompts
        this.registerQualityAssurancePrompts();
        
        // Strategic Planning Prompts
        this.registerStrategicPlanningPrompts();
        
        // Implementation Prompts
        this.registerImplementationPrompts();
    }

    /**
     * Register a prompt template
     */
    public registerPrompt(prompt: PromptTemplate): void {
        this.prompts.set(prompt.id, prompt);
        
        // Add to category index
        if (!this.categoryPrompts.has(prompt.category)) {
            this.categoryPrompts.set(prompt.category, []);
        }
        this.categoryPrompts.get(prompt.category)!.push(prompt);
    }

    /**
     * Get prompt by ID
     */
    public getPrompt(id: string): PromptTemplate | undefined {
        return this.prompts.get(id);
    }

    /**
     * Get prompt by document type
     */
    public getPromptByDocumentType(documentType: string): PromptTemplate | undefined {
        for (const prompt of this.prompts.values()) {
            if (prompt.documentType === documentType) {
                return prompt;
            }
        }
        return undefined;
    }

    /**
     * Get prompts by category
     */
    public getPromptsByCategory(category: string): PromptTemplate[] {
        return this.categoryPrompts.get(category) || [];
    }

    /**
     * Get all available categories
     */
    public getCategories(): string[] {
        return Array.from(this.categoryPrompts.keys());
    }

    /**
     * Search prompts by tags
     */
    public searchPromptsByTags(tags: string[]): PromptTemplate[] {
        const results: PromptTemplate[] = [];
        for (const prompt of this.prompts.values()) {
            if (tags.some(tag => prompt.tags.includes(tag))) {
                results.push(prompt);
            }
        }
        return results;
    }

    /**
     * Build complete prompt from template and context
     */
    public buildPrompt(promptId: string, context: PromptContext): { systemPrompt: string; userPrompt: string } | null {
        const template = this.getPrompt(promptId);
        if (!template) {
            return null;
        }

        const systemPrompt = template.systemPrompt;
        
        // Replace placeholders in user prompt template
        let userPrompt = template.userPromptTemplate
            .replace('{{projectContext}}', context.projectContext || '')
            .replace('{{documentContext}}', context.documentContext || '')
            .replace('{{stakeholders}}', context.stakeholders || '')
            .replace('{{businessDomain}}', context.businessDomain || '')
            .replace('{{technicalContext}}', context.technicalContext || '');

        // Add structure instructions
        if (template.structureInstructions) {
            userPrompt += '\n\n' + template.structureInstructions;
        }

        // Add quality criteria
        if (template.qualityCriteria) {
            userPrompt += '\n\n' + template.qualityCriteria;
        }

        return { systemPrompt, userPrompt };
    }

    /**
     * Register BABOK-specific prompts
     */
    private registerBABOKPrompts(): void {
        // Business Analysis Planning & Monitoring
        this.registerPrompt({
            id: 'babok-business-analysis-planning-monitoring',
            documentType: 'business-analysis-planning-and-monitoring',
            category: 'babok',
            systemPrompt: `You are a certified Business Analysis Professional (CBAP) with extensive expertise in the Business Analysis Body of Knowledge (BABOK). You specialize in business analysis planning and monitoring, with deep knowledge of:

- BABOK Guide v3 standards and best practices
- Business analysis planning methodologies
- Stakeholder engagement strategies
- Requirements elicitation and management
- Business analysis performance monitoring
- Change management and governance
- Business process analysis and improvement

Your role is to create comprehensive, actionable business analysis planning and monitoring documentation that follows BABOK standards and provides practical guidance for business analysts.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Business Analysis Planning and Monitoring document following BABOK Guide v3 standards:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Business Analysis Planning and Monitoring

### 1. Business Analysis Approach
- Methodology selection and rationale
- Stakeholder engagement approach
- Requirements management strategy
- Change control procedures

### 2. Planning Activities
- Business analysis work planning
- Stakeholder identification and analysis
- Requirements planning
- Communication planning
- Risk assessment and mitigation

### 3. Monitoring and Controlling
- Performance measurement criteria
- Progress tracking mechanisms
- Quality assurance processes
- Issue identification and resolution

### 4. Governance Framework
- Decision-making authority
- Approval processes
- Change management procedures
- Escalation protocols

### 5. Tools and Techniques
- Business analysis tools selection
- Documentation standards
- Collaboration platforms
- Reporting mechanisms`,
            qualityCriteria: `Ensure your document meets these quality criteria:
- Follows BABOK Guide v3 terminology and structure
- Provides actionable guidance for business analysts
- Includes specific examples and templates where appropriate
- Addresses both planning and monitoring aspects comprehensively
- Considers stakeholder needs and organizational context
- Incorporates industry best practices and lessons learned
- Uses professional business analysis language and formatting`,
            maxTokens: 2500,
            priority: 1,
            tags: ['babok', 'business-analysis', 'planning', 'monitoring', 'governance'],
            version: '1.0.0',
            lastUpdated: new Date()
        });

        // Elicitation and Collaboration
        this.registerPrompt({
            id: 'babok-elicitation-collaboration',
            documentType: 'elicitation-and-collaboration',
            category: 'babok',
            systemPrompt: `You are a senior Business Analyst with CBAP certification and specialized expertise in requirements elicitation and stakeholder collaboration. Your knowledge encompasses:

- BABOK Guide v3 elicitation and collaboration knowledge area
- Advanced facilitation and interview techniques
- Stakeholder engagement and communication strategies
- Requirements gathering methodologies
- Collaborative analysis techniques
- Conflict resolution and consensus building
- Workshop design and facilitation

You excel at creating comprehensive elicitation strategies that maximize stakeholder participation and ensure complete requirements capture.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Elicitation and Collaboration strategy document following BABOK Guide v3 standards:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Elicitation and Collaboration Strategy

### 1. Elicitation Planning
- Stakeholder analysis and mapping
- Elicitation technique selection
- Session planning and scheduling
- Resource requirements and logistics

### 2. Elicitation Techniques
- Interviews (structured, semi-structured, unstructured)
- Workshops and focus groups
- Observation and job shadowing
- Document analysis and research
- Prototyping and storyboarding
- Surveys and questionnaires

### 3. Collaboration Framework
- Stakeholder engagement model
- Communication protocols
- Decision-making processes
- Conflict resolution procedures
- Consensus building techniques

### 4. Information Management
- Requirements capture methods
- Documentation standards
- Traceability mechanisms
- Version control procedures
- Storage and retrieval systems

### 5. Quality Assurance
- Validation techniques
- Review and approval processes
- Completeness criteria
- Accuracy verification methods`,
            qualityCriteria: `Ensure your document meets these quality criteria:
- Aligns with BABOK Guide v3 elicitation and collaboration principles
- Provides specific, actionable elicitation techniques
- Addresses diverse stakeholder needs and preferences
- Includes practical examples and templates
- Considers organizational culture and constraints
- Incorporates modern collaboration tools and methods
- Emphasizes both efficiency and effectiveness in requirements gathering`,
            maxTokens: 2200,
            priority: 1,
            tags: ['babok', 'elicitation', 'collaboration', 'stakeholders', 'requirements'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register DMBOK-specific prompts
     */
    private registerDMBOKPrompts(): void {
        // Data Governance Framework
        this.registerPrompt({
            id: 'dmbok-data-governance-framework',
            documentType: 'data-governance-framework',
            category: 'dmbok',
            systemPrompt: `You are a certified Data Management Professional (CDMP) with extensive expertise in the Data Management Body of Knowledge (DMBOK). You specialize in data governance with deep knowledge of:

- DMBOK v2 data governance principles and frameworks
- Data governance organizational structures
- Data stewardship roles and responsibilities
- Data policies, standards, and procedures
- Data quality management and monitoring
- Regulatory compliance and data privacy
- Enterprise data architecture and strategy

Your role is to create comprehensive data governance frameworks that establish clear accountability, policies, and procedures for enterprise data management.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Data Governance Framework document following DMBOK v2 standards:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Data Governance Framework

### 1. Governance Structure
- Data governance organization model
- Roles and responsibilities matrix
- Decision-making authority and escalation
- Committee structures and charter

### 2. Policies and Standards
- Data governance policies
- Data quality standards
- Data security and privacy policies
- Data retention and archival policies
- Data sharing and access policies

### 3. Processes and Procedures
- Data governance processes
- Data stewardship procedures
- Issue resolution workflows
- Change management procedures
- Compliance monitoring processes

### 4. Tools and Technology
- Data governance tools and platforms
- Metadata management systems
- Data quality monitoring tools
- Reporting and dashboard requirements

### 5. Implementation Roadmap
- Phased implementation approach
- Success metrics and KPIs
- Training and communication plan
- Risk mitigation strategies`,
            qualityCriteria: `Ensure your document meets these quality criteria:
- Follows DMBOK v2 data governance best practices
- Provides clear organizational structure and accountability
- Includes specific policies and procedures
- Addresses regulatory and compliance requirements
- Considers organizational maturity and culture
- Incorporates industry standards and frameworks
- Provides measurable success criteria and implementation guidance`,
            maxTokens: 2400,
            priority: 1,
            tags: ['dmbok', 'data-governance', 'policies', 'stewardship', 'compliance'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register PMBOK-specific prompts
     */
    private registerPMBOKPrompts(): void {
        // Project Charter
        this.registerPrompt({
            id: 'pmbok-project-charter',
            documentType: 'project-charter',
            category: 'pmbok',
            systemPrompt: `You are a certified Project Management Professional (PMP) with extensive expertise in the Project Management Body of Knowledge (PMBOK Guide 7th Edition). You specialize in project initiation and charter development with deep knowledge of:

- PMBOK Guide 7th Edition principles and performance domains
- Project charter components and best practices
- Stakeholder identification and analysis
- Business case development and justification
- Project success criteria and metrics
- Risk identification and initial assessment
- Resource planning and estimation

Your role is to create comprehensive project charters that clearly define project scope, objectives, and success criteria while establishing proper project authority and governance.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Project Charter document following PMBOK Guide 7th Edition standards:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Project Charter

### 1. Project Overview
- Project title and description
- Project purpose and justification
- Business case summary
- Project objectives and success criteria

### 2. Scope and Deliverables
- Project scope statement
- Major deliverables and milestones
- Project boundaries and exclusions
- Acceptance criteria

### 3. Stakeholders and Organization
- Project sponsor and key stakeholders
- Project manager authority and responsibilities
- Project team structure
- Organizational impacts

### 4. Timeline and Resources
- High-level schedule and milestones
- Budget estimates and funding sources
- Resource requirements
- Critical dependencies

### 5. Risks and Assumptions
- High-level risk assessment
- Key assumptions and constraints
- Success factors and criteria
- Approval and sign-off requirements`,
            qualityCriteria: `Ensure your document meets these quality criteria:
- Follows PMBOK Guide 7th Edition standards and terminology
- Provides clear project authorization and scope definition
- Includes measurable objectives and success criteria
- Addresses stakeholder needs and expectations
- Considers organizational context and constraints
- Incorporates risk awareness and mitigation thinking
- Uses professional project management language and structure`,
            maxTokens: 2000,
            priority: 1,
            tags: ['pmbok', 'project-charter', 'initiation', 'scope', 'stakeholders'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register Requirements-specific prompts
     */
    private registerRequirementsPrompts(): void {
        // User Stories
        this.registerPrompt({
            id: 'requirements-user-stories',
            documentType: 'user-stories',
            category: 'requirements',
            systemPrompt: `You are a certified Scrum Master and Senior Business Analyst with expertise in Agile methodologies and user story development. Your knowledge encompasses:

- Agile and Scrum best practices for user story creation
- INVEST criteria for quality user stories
- User-centered design and persona development
- Acceptance criteria definition using Given-When-Then format
- Story mapping and epic decomposition
- Backlog prioritization and estimation techniques
- Cross-functional collaboration and stakeholder engagement

Your role is to create comprehensive, well-structured user stories that capture functional requirements from the user's perspective and provide clear guidance for development teams.`,
            userPromptTemplate: `Based on the comprehensive project context below, create detailed User Stories following Agile best practices:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## User Stories

### 1. Epic-Level Stories
- 3-5 high-level epic stories representing major functional areas
- User journey mapping and flow
- Epic acceptance criteria and definition of done

### 2. Detailed User Stories
For each epic, create 5-8 detailed user stories using the format:
**As a [user type], I want [functionality] so that [benefit/value].**

### 3. Story Details
For each user story include:
- **Acceptance Criteria**: Clear, testable criteria using Given/When/Then format
- **Story Points**: Estimated complexity (1, 2, 3, 5, 8, 13)
- **Priority**: High, Medium, Low with business justification
- **Dependencies**: Links to other stories or external requirements
- **Technical Notes**: Key implementation considerations

### 4. Story Mapping
- Organize stories by user journey flow
- Show dependencies and relationships
- Identify MVP vs future releases
- Prioritization rationale

### 5. Traceability Matrix
- Link to business requirements
- Connect to project objectives
- Map to stakeholder needs
- Reference to acceptance criteria`,
            qualityCriteria: `Ensure your user stories meet these quality criteria:
- Follow INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Use consistent user story format and language
- Include comprehensive acceptance criteria for each story
- Provide clear business value and user benefit
- Consider edge cases and error conditions
- Address both functional and non-functional requirements
- Enable effective estimation and sprint planning
- Support iterative development and continuous feedback`,
            maxTokens: 2500,
            priority: 1,
            tags: ['requirements', 'user-stories', 'agile', 'acceptance-criteria', 'backlog'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register Technical Analysis prompts
     */
    private registerTechnicalAnalysisPrompts(): void {
        // Architecture Design
        this.registerPrompt({
            id: 'technical-architecture-design',
            documentType: 'architecture-design',
            category: 'technical-design',
            systemPrompt: `You are a Senior Solution Architect with extensive experience in enterprise software architecture design. Your expertise includes:

- Enterprise architecture frameworks (TOGAF, Zachman)
- Software architecture patterns and best practices
- Cloud-native and microservices architectures
- System integration and API design
- Security architecture and compliance
- Performance and scalability considerations
- Technology stack evaluation and selection
- Architecture documentation and communication

Your role is to create comprehensive architecture designs that provide clear technical direction, ensure system quality attributes, and support business objectives.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Architecture Design document:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Architecture Design

### 1. Architecture Overview
- System context and scope
- Architecture vision and principles
- Key architectural decisions and rationale
- Technology stack overview

### 2. System Architecture
- High-level system components
- Component interactions and interfaces
- Data flow and processing patterns
- Integration points and dependencies

### 3. Technical Architecture
- Application architecture layers
- Infrastructure and deployment architecture
- Security architecture and controls
- Data architecture and management

### 4. Quality Attributes
- Performance requirements and design
- Scalability and availability considerations
- Security and compliance measures
- Maintainability and extensibility

### 5. Implementation Guidance
- Development standards and guidelines
- Deployment and configuration requirements
- Monitoring and observability strategy
- Risk mitigation and contingency plans`,
            qualityCriteria: `Ensure your architecture design meets these quality criteria:
- Provides clear technical direction and decision rationale
- Addresses all significant quality attributes and constraints
- Includes appropriate level of detail for implementation
- Considers current and future business needs
- Incorporates industry best practices and standards
- Addresses security, performance, and scalability requirements
- Provides actionable guidance for development teams
- Uses standard architecture documentation formats and notation`,
            maxTokens: 2800,
            priority: 1,
            tags: ['technical-design', 'architecture', 'system-design', 'technology-stack'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register Quality Assurance prompts
     */
    private registerQualityAssurancePrompts(): void {
        // Test Strategy
        this.registerPrompt({
            id: 'qa-test-strategy',
            documentType: 'test-strategy',
            category: 'quality-assurance',
            systemPrompt: `You are a Senior Test Manager and Quality Assurance Professional with extensive expertise in software testing methodologies. Your knowledge encompasses:

- Test strategy development and planning
- Test design techniques and methodologies
- Automated and manual testing approaches
- Risk-based testing and prioritization
- Quality metrics and measurement
- Test environment and data management
- Defect management and root cause analysis
- Continuous testing and DevOps integration

Your role is to create comprehensive test strategies that ensure thorough quality assurance coverage while optimizing testing efficiency and effectiveness.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Test Strategy document:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Test Strategy

### 1. Testing Approach
- Overall testing philosophy and methodology
- Risk-based testing approach
- Test levels and types coverage
- Entry and exit criteria for testing phases

### 2. Test Planning
- Test scope and objectives
- Testing timeline and milestones
- Resource requirements and allocation
- Test environment and infrastructure needs

### 3. Test Design and Execution
- Test design techniques and standards
- Test case development guidelines
- Test data management strategy
- Test execution procedures and protocols

### 4. Automation Strategy
- Test automation framework and tools
- Automation scope and priorities
- Continuous integration and testing
- Maintenance and evolution of automated tests

### 5. Quality Management
- Defect management process
- Quality metrics and reporting
- Risk mitigation and contingency planning
- Continuous improvement processes`,
            qualityCriteria: `Ensure your test strategy meets these quality criteria:
- Provides comprehensive coverage of testing activities
- Aligns with project objectives and constraints
- Incorporates risk-based testing principles
- Balances manual and automated testing approaches
- Addresses both functional and non-functional testing
- Includes clear metrics and success criteria
- Considers resource constraints and timeline requirements
- Supports continuous improvement and learning`,
            maxTokens: 2300,
            priority: 1,
            tags: ['quality-assurance', 'test-strategy', 'testing', 'automation', 'quality-metrics'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register Strategic Planning prompts
     */
    private registerStrategicPlanningPrompts(): void {
        // Business Case
        this.registerPrompt({
            id: 'strategic-business-case',
            documentType: 'business-case',
            category: 'strategic-statements',
            systemPrompt: `You are a Senior Business Strategist and Financial Analyst with extensive experience in business case development. Your expertise includes:

- Strategic business analysis and planning
- Financial modeling and cost-benefit analysis
- Risk assessment and mitigation strategies
- Market analysis and competitive positioning
- Stakeholder value proposition development
- Investment justification and ROI calculation
- Change management and organizational impact
- Performance measurement and success metrics

Your role is to create compelling business cases that clearly articulate the value proposition, justify investment decisions, and provide a roadmap for successful project execution.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Business Case document:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Business Case

### 1. Executive Summary
- Project overview and strategic alignment
- Key benefits and value proposition
- Investment requirements and expected returns
- Recommendation and next steps

### 2. Business Need and Opportunity
- Problem statement and current state analysis
- Market opportunity and competitive landscape
- Strategic drivers and business objectives
- Stakeholder needs and expectations

### 3. Solution Analysis
- Proposed solution overview
- Alternative options considered
- Solution benefits and capabilities
- Implementation approach and timeline

### 4. Financial Analysis
- Cost-benefit analysis and ROI calculation
- Investment requirements and funding sources
- Financial projections and cash flow analysis
- Sensitivity analysis and scenario planning

### 5. Risk and Implementation
- Risk assessment and mitigation strategies
- Implementation roadmap and milestones
- Success metrics and performance indicators
- Governance and oversight requirements`,
            qualityCriteria: `Ensure your business case meets these quality criteria:
- Provides clear and compelling value proposition
- Includes comprehensive financial analysis and justification
- Addresses stakeholder needs and concerns
- Considers alternative solutions and approaches
- Incorporates realistic risk assessment and mitigation
- Aligns with organizational strategy and objectives
- Uses data-driven analysis and evidence-based recommendations
- Provides actionable implementation guidance`,
            maxTokens: 2600,
            priority: 1,
            tags: ['strategic-statements', 'business-case', 'financial-analysis', 'roi', 'value-proposition'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }

    /**
     * Register Implementation prompts
     */
    private registerImplementationPrompts(): void {
        // Deployment Guide
        this.registerPrompt({
            id: 'implementation-deployment-guide',
            documentType: 'deployment-guide',
            category: 'implementation-guides',
            systemPrompt: `You are a Senior DevOps Engineer and Deployment Specialist with extensive experience in software deployment and infrastructure management. Your expertise includes:

- Deployment automation and CI/CD pipelines
- Infrastructure as Code (IaC) and configuration management
- Cloud platforms and containerization technologies
- Monitoring, logging, and observability
- Security and compliance in deployment processes
- Disaster recovery and business continuity
- Performance optimization and scaling
- Troubleshooting and incident response

Your role is to create comprehensive deployment guides that ensure reliable, secure, and efficient software deployments across different environments.`,
            userPromptTemplate: `Based on the comprehensive project context below, create a detailed Deployment Guide document:

Project Context:
{{projectContext}}

{{structureInstructions}}

{{qualityCriteria}}`,
            structureInstructions: `Structure your document with the following sections:

## Deployment Guide

### 1. Deployment Overview
- Deployment strategy and approach
- Environment architecture and topology
- Prerequisites and dependencies
- Deployment timeline and phases

### 2. Environment Setup
- Infrastructure requirements and specifications
- Environment configuration and setup procedures
- Security configuration and access controls
- Network and connectivity requirements

### 3. Deployment Procedures
- Step-by-step deployment instructions
- Configuration management and settings
- Database migration and data setup
- Application deployment and verification

### 4. Monitoring and Validation
- Health checks and validation procedures
- Performance monitoring and alerting
- Log management and troubleshooting
- Rollback procedures and contingency plans

### 5. Post-Deployment Activities
- Go-live checklist and procedures
- User acceptance testing coordination
- Documentation and knowledge transfer
- Ongoing maintenance and support procedures`,
            qualityCriteria: `Ensure your deployment guide meets these quality criteria:
- Provides clear, step-by-step deployment instructions
- Addresses all environments (development, staging, production)
- Includes comprehensive validation and testing procedures
- Incorporates security and compliance requirements
- Provides troubleshooting guidance and rollback procedures
- Considers automation and repeatability
- Addresses monitoring and observability requirements
- Includes post-deployment support and maintenance guidance`,
            maxTokens: 2400,
            priority: 1,
            tags: ['implementation-guides', 'deployment', 'devops', 'infrastructure', 'automation'],
            version: '1.0.0',
            lastUpdated: new Date()
        });
    }
}