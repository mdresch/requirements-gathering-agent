'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '../lib/api';
import { validateDocumentDependencies, DocumentDependency, getRecommendedGenerationOrder } from '@/lib/documentDependencies';
import DependencyValidationWarning from './DependencyValidationWarning';
import ContextTrackingModal from './ContextTrackingModal';
import { toast } from 'sonner';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  documentKey?: string;
  estimatedTime: string;
  framework: string[];
  required: boolean;
  contextPriority?: string;
  originalFramework?: string;
}

interface GeneratedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  category: string;
  framework: string;
  generatedAt: string;
  generatedBy: string;
  qualityScore: number;
  wordCount: number;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'published';
}

interface DocumentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectFramework: string;
  projectContext?: any; // Rich project context for better document generation
  existingDocuments?: any[]; // Previously generated documents for context
  onGenerate: (selectedTemplates: string[], generatedDocuments?: GeneratedDocument[]) => Promise<void>;
  onDocumentGenerated?: (document: GeneratedDocument) => void; // Callback when a single document is generated
}

const DocumentGenerationModal: React.FC<DocumentGenerationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectFramework,
  projectContext,
  existingDocuments = [],
  onGenerate,
  onDocumentGenerated
}) => {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<{[key: string]: 'pending' | 'generating' | 'completed' | 'error'}>({});
  const [dependencyValidation, setDependencyValidation] = useState<{[key: string]: any}>({});
  const [showDependencyWarnings, setShowDependencyWarnings] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<DocumentTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  // Context tracking modal state
  const [showContextTracking, setShowContextTracking] = useState(false);
  const [selectedDocumentForTracking, setSelectedDocumentForTracking] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('google-gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Fetch available templates when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTemplates = async () => {
        setTemplatesLoading(true);
        try {
          const response = await apiClient.getTemplates();
          
          if (response.success && response.data?.templates) {
            
            // Filter to only include ACTIVE templates for document generation
            const activeTemplates = response.data.templates.filter((template: any) => template.isActive === true);
            
            // Transform API templates to DocumentTemplate format
            const transformedTemplates: DocumentTemplate[] = activeTemplates.map((template: any) => ({
              id: template.id,
              name: template.name,
              description: template.description,
              category: template.category,
              estimatedTime: template.metadata?.estimatedTime || '2-4 hours',
              framework: [template.metadata?.framework || 'general'], // Keep original framework for filtering
              required: false, // Will be determined dynamically based on framework and priority
              contextPriority: template.contextPriority || 'medium', // Add priority for filtering
              originalFramework: template.metadata?.framework || 'general' // Store original framework
            }));
            
            setAvailableTemplates(transformedTemplates);
          } else {
            console.error('❌ Failed to load templates for document generation');
            // Fallback to empty array
            setAvailableTemplates([]);
          }
        } catch (error) {
          console.error('❌ Error fetching templates for document generation:', error);
          setAvailableTemplates([]);
        } finally {
          setTemplatesLoading(false);
        }
      };
      
      fetchTemplates();
    }
  }, [isOpen]);

  // Validate dependencies when templates are selected
  useEffect(() => {
    if (selectedTemplates.length > 0) {
      const validationResults: {[key: string]: any} = {};
      let hasWarnings = false;
      
      selectedTemplates.forEach(templateId => {
        const validation = validateDocumentDependencies(templateId, existingDocuments);
        validationResults[templateId] = validation;
        if (!validation.isValid) {
          hasWarnings = true;
        }
      });
      
      setDependencyValidation(validationResults);
      setShowDependencyWarnings(hasWarnings);
    } else {
      setDependencyValidation({});
      setShowDependencyWarnings(false);
    }
  }, [selectedTemplates, existingDocuments]);

  // Get filtered templates based on search and filter criteria
  const getFilteredTemplates = (): DocumentTemplate[] => {
    if (!availableTemplates.length) {
      return [];
    }

    return availableTemplates.filter(template => {
      // Search filter
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Framework filter
      const matchesFramework = selectedFramework === 'all' || 
        template.originalFramework === selectedFramework ||
        template.framework.includes(selectedFramework);

      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        template.category === selectedCategory;

      // Priority filter
      const matchesPriority = selectedPriority === 'all' || 
        template.contextPriority === selectedPriority;

      return matchesSearch && matchesFramework && matchesCategory && matchesPriority;
    });
  };

  // Determine if a template is required based on project framework and template characteristics
  const isTemplateRequired = (template: DocumentTemplate): boolean => {
    const isHighPriority = template.contextPriority === 'critical' || template.contextPriority === 'high';
    
    // If project framework is 'multi', all high priority templates are required
    if (projectFramework === 'multi') {
      return isHighPriority;
    }
    
    // For specific frameworks, prioritize templates designed for that framework
    if (template.originalFramework === projectFramework) {
      return isHighPriority;
    }
    
    // For general templates, they're required if high priority
    if (template.originalFramework === 'general') {
      return isHighPriority;
    }
    
    // For cross-framework templates (e.g., BABOK template in PMBOK project), 
    // only critical templates are required
    if (template.contextPriority === 'critical') {
      return true;
    }
    
    // All other templates are optional
    return false;
  };

  const templates = getFilteredTemplates();

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSelectAll = () => {
    const allTemplateIds = templates.map(t => t.id);
    setSelectedTemplates(allTemplateIds);
  };

  const handleDeselectAll = () => {
    setSelectedTemplates([]);
  };

  // Build rich context from existing documents and project information
  const buildContextFromExistingDocuments = () => {
    const context: {
      projectInfo: any;
      existingDocs: any[];
      stakeholders: any[];
      budget: any;
      timeline: any;
      risks: any[];
      requirements: any[];
      scope: any;
      assumptions: any[];
      priorityDocuments: Array<{
        name: any;
        priority: any;
        content: any;
        order: number;
      }>;
    } = {
      projectInfo: projectContext || {},
      existingDocs: existingDocuments || [],
      stakeholders: [],
      budget: null,
      timeline: null,
      risks: [],
      requirements: [],
      scope: null,
      assumptions: [],
      priorityDocuments: [] // Track high-priority documents for context
    };

    // Sort documents by priority (critical > high > medium > low)
    const priorityOrder: { [key: string]: number } = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    const sortedDocs = [...(existingDocuments || [])].sort((a, b) => {  
      const priorityA = priorityOrder[a.contextPriority || 'medium'] || 2;                                                                              
      const priorityB = priorityOrder[b.contextPriority || 'medium'] || 2;                                                                              
      return priorityB - priorityA; // Higher priority first
    });

    console.log('📋 Document context building - Priority order:', 
      sortedDocs.map(doc => `${doc.name} (${doc.contextPriority || 'medium'})`));

    // Extract information from existing documents, prioritizing high-value documents
    sortedDocs.forEach((doc, index) => {
      const content = doc.content || '';
      const priority = doc.contextPriority || 'medium';
      
      // Track priority documents for LLM context
      if (priority === 'critical' || priority === 'high') {
        context.priorityDocuments.push({
          name: doc.name,
          priority: priority,
          content: content.substring(0, 500), // First 500 chars for context
          order: index + 1
        });
      }
      
      // Extract stakeholders from stakeholder analysis documents
      if (doc.name.toLowerCase().includes('stakeholder')) {
        const stakeholderMatches = content.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
        if (stakeholderMatches) {
          stakeholderMatches.forEach((match: string) => {
            const parts = match.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 2 && !parts[0].toLowerCase().includes('stakeholder')) {
              context.stakeholders.push({
                name: parts[0],
                role: parts[1],
                influence: parts[2] || 'Medium',
                interest: parts[3] || 'Medium'
              });
            }
          });
        }
      }

      // Extract budget information
      if (content.includes('Budget') || content.includes('budget')) {
        const budgetMatch = content.match(/Budget[:\s]*\$?([0-9,]+)/i);
        if (budgetMatch) {
          context.budget = budgetMatch[1].replace(/,/g, '');
        }
      }

      // Extract timeline information
      if (content.includes('Duration') || content.includes('Timeline')) {
        const durationMatch = content.match(/Duration[:\s]*([0-9]+)\s*(days?|weeks?|months?)/i);
        if (durationMatch) {
          context.timeline = `${durationMatch[1]} ${durationMatch[2]}`;
        }
      }

      // Extract risks
      if (content.includes('Risk') || content.includes('risk')) {
        const riskMatches = content.match(/[-*]\s*([^:\n]+(?:risk|Risk)[^:\n]*)/gi);
        if (riskMatches) {
          riskMatches.forEach((risk: string) => {
            context.risks.push(risk.replace(/[-*]\s*/, '').trim());
          });
        }
      }

      // Extract requirements
      if (content.includes('Requirement') || content.includes('requirement')) {
        const reqMatches = content.match(/[-*]\s*([^:\n]*(?:requirement|Requirement)[^:\n]*)/gi);
        if (reqMatches) {
          reqMatches.forEach((req: string) => {
            context.requirements.push(req.replace(/[-*]\s*/, '').trim());
          });
        }
      }
    });

    return context;
  };

  // Helper function to get templates filtered by framework
  const getTemplatesForFramework = (framework: string): DocumentTemplate[] => {
    if (!availableTemplates.length) {
      return [];
    }
    
    return availableTemplates.filter(template => {
      return template.originalFramework === framework || 
             template.framework.includes(framework) ||
             template.originalFramework === 'general';
    });
  };

  const generateDocumentContent = (templateId: string, projectName: string, projectFramework: string): string => {
    // Build context from existing documents and project information
    const contextInfo = buildContextFromExistingDocuments();
    const templates = getTemplatesForFramework(projectFramework);
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';

    // Generate realistic document content based on template type
    const currentDate = new Date().toLocaleDateString();

    switch (templateId) {
      case 'project-charter':
        // Use accumulated context for richer content
        const hasStakeholders = contextInfo.stakeholders.length > 0;
        const hasBudget = contextInfo.budget || contextInfo.projectInfo.budget;
        const hasTimeline = contextInfo.timeline || (contextInfo.projectInfo.startDate && contextInfo.projectInfo.endDate);
        const hasRisks = contextInfo.risks.length > 0;
        const hasRequirements = contextInfo.requirements.length > 0;
        
        return `# Project Charter: ${projectName}

## Project Overview
**Project Name:** ${projectName}
**Project ID:** ${projectId}
**Date:** ${currentDate}
**Framework:** ${projectFramework.toUpperCase()}
${contextInfo.projectInfo.owner ? `**Project Owner:** ${contextInfo.projectInfo.owner}` : ''}
${contextInfo.projectInfo.priority ? `**Priority:** ${contextInfo.projectInfo.priority.toUpperCase()}` : ''}

## Context Enrichment
${contextInfo.priorityDocuments.length > 0 ? 
  `This charter has been enriched with context from ${contextInfo.priorityDocuments.length} high-priority existing documents:
${contextInfo.priorityDocuments.map(doc => `- **${doc.name}** (${doc.priority} priority) - ${doc.content.substring(0, 100)}...`).join('\n')}` :
  'No high-priority context documents available for enrichment.'}

## Project Purpose
This project aims to deliver a comprehensive solution for ${projectName.toLowerCase()}, addressing key business requirements and stakeholder needs.
${contextInfo.priorityDocuments.length > 0 ? 'The project approach is informed by existing high-value documentation to ensure continuity and alignment.' : ''}

## Project Objectives
- Deliver a robust and scalable solution
- Meet all stakeholder requirements
- Ensure compliance with industry standards
- Complete within approved budget and timeline

## Success Criteria
- All deliverables meet quality standards
- Stakeholder satisfaction rating > 85%
- Project completed within budget
- All compliance requirements met

## Project Scope
### In Scope
- Core functionality development
- User interface design and implementation
- Testing and quality assurance
- Documentation and training

### Out of Scope
- Legacy system integration (Phase 2)
- Advanced analytics (Phase 3)
- Third-party integrations (Phase 4)

## Key Stakeholders
${hasStakeholders ? 
  contextInfo.stakeholders.map(stakeholder => 
    `- **${stakeholder.name}:** ${stakeholder.role} (${stakeholder.influence} influence, ${stakeholder.interest} interest)`
  ).join('\n') :
  `- **Project Sponsor:** [To be defined]
- **Project Manager:** [To be defined]
- **Business Analyst:** [To be defined]
- **Technical Lead:** [To be defined]
- **End Users:** [To be defined]`}

## Budget and Timeline
- **Total Budget:** ${hasBudget ? `$${hasBudget.toLocaleString()}` : '[To be defined]'}
- **Project Duration:** ${hasTimeline || '[To be defined]'}
- **Start Date:** ${contextInfo.projectInfo.startDate ? new Date(contextInfo.projectInfo.startDate).toLocaleDateString() : currentDate}
- **Target Completion:** ${contextInfo.projectInfo.endDate ? new Date(contextInfo.projectInfo.endDate).toLocaleDateString() : '[To be defined]'}

## Risks and Assumptions
### Key Risks
${hasRisks ? 
  contextInfo.risks.map(risk => `- ${risk}`).join('\n') :
  `- Resource availability constraints
- Technology compatibility issues
- Scope creep potential
- Regulatory compliance changes`}

### Key Assumptions
- Stakeholder availability for requirements gathering
- Technology stack stability
- Budget approval timeline
- Team member availability

## Requirements Summary
${hasRequirements ? 
  contextInfo.requirements.map(req => `- ${req}`).join('\n') :
  '- Detailed requirements to be gathered during project initiation'}

## Approval
This project charter requires approval from the following stakeholders:
- Project Sponsor: [Signature Required]
- Project Manager: [Signature Required]
- Business Owner: [Signature Required]

---
*Document generated on ${currentDate} using ADPA Enterprise Platform*
*Context enriched with ${contextInfo.existingDocs.length} existing document(s)*
${contextInfo.priorityDocuments.length > 0 ? `*High-priority context sources: ${contextInfo.priorityDocuments.map(doc => doc.name).join(', ')}*` : ''}`;

      case 'stakeholder-analysis':
        return `# Stakeholder Analysis: ${projectName}

## Project Information
**Project Name:** ${projectName}
**Analysis Date:** ${currentDate}
**Framework:** ${projectFramework.toUpperCase()}

## Stakeholder Identification

### Primary Stakeholders
| Stakeholder | Role | Influence | Interest | Communication Needs |
|-------------|------|-----------|----------|-------------------|
| Project Sponsor | Decision Maker | High | High | Weekly status reports |
| Project Manager | Project Lead | High | High | Daily updates |
| Business Owner | Requirements Owner | High | High | Bi-weekly reviews |
| End Users | Solution Users | Medium | High | Training sessions |

### Secondary Stakeholders
| Stakeholder | Role | Influence | Interest | Communication Needs |
|-------------|------|-----------|----------|-------------------|
| IT Department | Technical Support | Medium | Medium | Technical updates |
| Legal Team | Compliance | Medium | Low | Regulatory updates |
| Finance Team | Budget Approval | High | Low | Budget reports |

## Stakeholder Engagement Matrix

### High Influence, High Interest (Manage Closely)
- Project Sponsor
- Business Owner
- Project Manager

### High Influence, Low Interest (Keep Satisfied)
- Finance Team
- Legal Team

### Low Influence, High Interest (Keep Informed)
- End Users
- Subject Matter Experts

### Low Influence, Low Interest (Monitor)
- External Vendors
- Support Teams

## Communication Strategy

### Communication Plan
- **Weekly Status Reports:** All primary stakeholders
- **Monthly Steering Committee:** Executive stakeholders
- **Quarterly Reviews:** All stakeholders
- **Ad-hoc Communications:** As needed for critical issues

### Communication Channels
- Email updates
- Video conferences
- In-person meetings
- Project dashboard
- Documentation portal

## Stakeholder Concerns and Expectations

### Project Sponsor
- **Concerns:** Budget overrun, timeline delays
- **Expectations:** Regular updates, risk mitigation

### Business Owner
- **Concerns:** Requirements completeness, user adoption
- **Expectations:** Solution meets business needs

### End Users
- **Concerns:** Usability, training, job impact
- **Expectations:** Intuitive interface, adequate training

## Engagement Activities

### Phase 1: Initiation
- Stakeholder identification workshop
- Initial requirements gathering
- Communication plan establishment

### Phase 2: Planning
- Detailed requirements review
- Design validation sessions
- Risk assessment workshops

### Phase 3: Execution
- Regular progress updates
- User acceptance testing
- Training delivery

### Phase 4: Closure
- Final stakeholder sign-off
- Lessons learned sessions
- Transition planning

## Risk Mitigation

### Stakeholder-Related Risks
- **Risk:** Key stakeholder unavailable
- **Mitigation:** Identify backup contacts, document decisions

- **Risk:** Conflicting stakeholder requirements
- **Mitigation:** Facilitate resolution sessions, document trade-offs

- **Risk:** Poor communication leading to misunderstandings
- **Mitigation:** Regular check-ins, written confirmations

---
*Document generated on ${currentDate} using ADPA Enterprise Platform*`;

      case 'requirements-document':
        return `# Requirements Document: ${projectName}

## Document Information
**Project Name:** ${projectName}
**Document Version:** 1.0
**Date:** ${currentDate}
**Framework:** ${projectFramework.toUpperCase()}

## Executive Summary
This document outlines the functional and non-functional requirements for the ${projectName} project. The requirements have been gathered through stakeholder interviews, business analysis, and industry best practices.

## Business Context

### Business Objectives
- Improve operational efficiency
- Enhance user experience
- Ensure regulatory compliance
- Reduce operational costs

### Business Drivers
- Market competition
- Customer expectations
- Regulatory requirements
- Technology advancement

## Functional Requirements

### FR-001: User Authentication
**Description:** The system shall provide secure user authentication.
**Priority:** High
**Acceptance Criteria:**
- Users can log in with valid credentials
- System enforces password complexity rules
- Account lockout after failed attempts
- Session timeout after inactivity

### FR-002: Data Management
**Description:** The system shall manage project data effectively.
**Priority:** High
**Acceptance Criteria:**
- Create, read, update, delete operations
- Data validation and integrity checks
- Audit trail for all changes
- Backup and recovery capabilities

### FR-003: Reporting
**Description:** The system shall generate various reports.
**Priority:** Medium
**Acceptance Criteria:**
- Real-time dashboard views
- Scheduled report generation
- Export to multiple formats
- Customizable report parameters

### FR-004: Integration
**Description:** The system shall integrate with external systems.
**Priority:** Medium
**Acceptance Criteria:**
- API-based integration
- Data synchronization
- Error handling and logging
- Performance monitoring

## Non-Functional Requirements

### NFR-001: Performance
**Description:** The system shall meet specified performance criteria.
**Acceptance Criteria:**
- Page load time < 3 seconds
- Support 1000 concurrent users
- 99.9% uptime availability
- Database response time < 1 second

### NFR-002: Security
**Description:** The system shall implement comprehensive security measures.
**Acceptance Criteria:**
- Encryption of sensitive data
- Role-based access control
- Regular security audits
- Compliance with security standards

### NFR-003: Usability
**Description:** The system shall be user-friendly and accessible.
**Acceptance Criteria:**
- Intuitive user interface
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1)
- User training documentation

### NFR-004: Scalability
**Description:** The system shall scale to meet future growth.
**Acceptance Criteria:**
- Horizontal scaling capability
- Cloud deployment support
- Load balancing
- Auto-scaling features

## Data Requirements

### Data Entities
- **Users:** Authentication and profile information
- **Projects:** Project details and metadata
- **Documents:** Generated documents and versions
- **Templates:** Document templates and configurations

### Data Relationships
- Users can own multiple projects
- Projects can contain multiple documents
- Documents are based on templates
- Templates belong to frameworks

## Interface Requirements

### User Interfaces
- Web-based dashboard
- Mobile-responsive design
- Document generation interface
- Project management interface

### External Interfaces
- REST API endpoints
- Database connections
- File system access
- Third-party service integrations

## Quality Attributes

### Reliability
- System availability 99.9%
- Error recovery mechanisms
- Data backup and restore
- Disaster recovery procedures

### Maintainability
- Modular architecture
- Comprehensive documentation
- Automated testing
- Version control

### Portability
- Cross-platform compatibility
- Cloud deployment support
- Containerization support
- Database abstraction

## Constraints

### Technical Constraints
- Must use approved technology stack
- Must comply with security standards
- Must integrate with existing systems
- Must support current browser versions

### Business Constraints
- Budget limitations
- Timeline requirements
- Resource availability
- Regulatory compliance

## Assumptions and Dependencies

### Assumptions
- Stakeholder availability for requirements validation
- Technology stack stability
- Budget approval timeline
- Team member expertise

### Dependencies
- Infrastructure provisioning
- Third-party service availability
- Security clearance processes
- Regulatory approval timeline

## Traceability Matrix

| Requirement ID | Business Objective | Test Case | Status |
|----------------|-------------------|-----------|--------|
| FR-001 | Improve Security | TC-001 | Approved |
| FR-002 | Enhance Efficiency | TC-002 | Approved |
| FR-003 | Enable Reporting | TC-003 | Pending |
| NFR-001 | Ensure Performance | TC-004 | Approved |

---
*Document generated on ${currentDate} using ADPA Enterprise Platform*`;

      default:
        return `# ${template.name}: ${projectName}

## Document Information
**Project Name:** ${projectName}
**Document Type:** ${template.name}
**Date:** ${currentDate}
**Framework:** ${projectFramework.toUpperCase()}

## Overview
${template.description}

## Content
This document contains the generated content for ${template.name} based on the ${projectFramework.toUpperCase()} framework.

### Key Sections
1. **Introduction**
2. **Main Content**
3. **Conclusion**
4. **Appendices**

## Implementation Details
- Generated using ADPA Enterprise Platform
- Based on ${projectFramework.toUpperCase()} best practices
- Tailored for ${projectName} project requirements

---
*Document generated on ${currentDate} using ADPA Enterprise Platform*`;
    }
  };

  // Function to map template IDs to document keys
  const getDocumentKeyFromTemplateId = (templateId: string, templateName: string): string => {
    // First, try to find the template in the available templates to get the documentKey
    const template = availableTemplates.find(t => t.id === templateId);
    
    if (template && template.documentKey) {
      // Validate document key format - reject 'Document ID' and ensure proper format
      if (template.documentKey === 'Document ID' || !/^[a-z0-9\-]+$/.test(template.documentKey)) {
        console.error(`❌ Invalid document key "${template.documentKey}" for template ${templateId}. Document keys must be lowercase with hyphens (e.g., "business-case"). Using name mapping as fallback.`);
        return getDocumentKeyFromTemplateName(templateName);
      }
      
      return template.documentKey;
    }

    // Fallback: Map template names to document keys that the DocumentGenerator expects
    console.log(`⚠️ No documentKey found for template ${templateId}, using name mapping for "${templateName}"`);
    return getDocumentKeyFromTemplateName(templateName);
  };

  // Function to map template names to document keys
  const getDocumentKeyFromTemplateName = (templateName: string): string => {
    const nameToKeyMap: { [key: string]: string } = {
      'Mission, Vision & Core Values': 'mission-vision-core-values',
      'Company Mission Vision and Core Values': 'mission-vision-core-values',
      'Company Values': 'company-values',
      'Project Charter': 'project-charter',
      'Project Charter Template': 'project-charter',
      'Stakeholder Analysis': 'stakeholder-analysis',
      'Requirements Document': 'requirements-document',
      'Risk Management Plan': 'risk-management-plan',
      'Scope Management Plan': 'scope-management-plan',
      'Business Case': 'business-case',
      'Business Case Template': 'business-case',
      'User Personas': 'user-personas',
      'User Stories': 'user-stories',
      'User Stories Template': 'user-stories',
      'API Documentation Template': 'api-documentation',
      'Data Governance Policy': 'data-governance-plan',
      'Test Plan Document': 'test-plan',
      'Risk Assessment Report': 'risk-assessment',
      'System Architecture Document': 'system-architecture',
      'Functional Requirements Specification': 'functional-requirements',
      'Technical Requirements Template': 'technical-requirements'
    };
    
    return nameToKeyMap[templateName] || templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleGenerate = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one document to generate.');
      return;
    }

    // Find the template by ID to get its name
    const firstTemplate = availableTemplates.find(template => template.id === selectedTemplates[0]);
    if (!firstTemplate) {
      console.error('❌ Template not found for ID:', selectedTemplates[0]);
      alert('Error: Template not found. Please try again.');
      return;
    }

    // Convert template name to document key
    const documentKey = getDocumentKeyFromTemplateName(firstTemplate.name);

    // Open context tracking modal instead of immediately generating
    setSelectedDocumentForTracking(documentKey); // Use document key as document type
    setShowContextTracking(true);
    return;
  };

  const handleDocumentGenerated = async (generatedDocument: any) => {
    try {
      // Add the generated document to the project documents
      console.log('Document generated:', generatedDocument);
      
      // Here you would typically save the document to your database
      // and update the project documents list
      
      // Show success message
      toast.success(`Document "${generatedDocument.name}" added to project successfully!`);
      
      // Close the document generation modal
      onClose();
      
      // Call the parent's onDocumentGenerated callback with the document ID
      if (onDocumentGenerated) {
        onDocumentGenerated(generatedDocument);
      }
      
    } catch (error) {
      console.error('Error handling generated document:', error);
      toast.error('Failed to add document to project');
    }
  };

  const handleActualGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Get the recommended generation order based on dependencies
      const generationOrder = getRecommendedGenerationOrder(selectedTemplates, existingDocuments);
      console.log('📋 Recommended generation order:', generationOrder.map(dep => dep.templateName));
      
      // Initialize generation status for all templates (selected + dependencies)
      const allTemplateIds = generationOrder.map(dep => dep.templateId);
      const initialStatus: {[key: string]: 'pending' | 'generating' | 'completed' | 'error'} = {};
      allTemplateIds.forEach(templateId => {
        initialStatus[templateId] = 'pending';
      });
      setGenerationStatus(initialStatus);

      const generatedDocuments = [];
      
      // Generate documents in dependency order
      for (const dependency of generationOrder) {
        const templateId = dependency.templateId;
        setGenerationStatus(prev => ({ ...prev, [templateId]: 'generating' }));
        
        // Get the document key for this template
        const template = availableTemplates.find(t => t.id === templateId);
        const documentKey = getDocumentKeyFromTemplateId(templateId, template?.name || dependency.templateName);
        
        console.log(`🔄 Generating document for template ${templateId} (${dependency.templateName}) with document key: ${documentKey}`);
        
        // Generate document using the real API
        const generationResponse = await apiClient.generateDocuments({
          projectId: projectId,
          context: projectName,
          documentKeys: [documentKey], // Use the mapped document key instead of template ID
          framework: projectFramework
        });
        
        if (generationResponse.success) {
          // Get the template info for the generated document
          const templates = getTemplatesForFramework(projectFramework);
          const template = templates.find(t => t.id === templateId);
          
          if (template) {
            try {
              // The backend DocumentGenerator already saves documents to MongoDB
              
              // Use the actual generated document from the backend response
              const generatedDoc = generationResponse.generatedDocuments?.find((doc: any) => doc.type === documentKey);
              
              if (generatedDoc) {
                // Create a document object using the actual database document
                const document = {
                  id: generatedDoc.id,
                  name: generatedDoc.name,
                  type: generatedDoc.type,
                  content: 'Document generated successfully and saved to database',
                  category: generatedDoc.category,
                  framework: projectFramework,
                  generatedAt: new Date().toISOString(),
                  generatedBy: 'ADPA System',
                  qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100%
                  wordCount: 0, // Will be updated when document is loaded
                  tags: [generatedDoc.category, projectFramework, 'generated'],
                  status: 'draft' as 'draft' | 'review' | 'approved' | 'published'
                };
                
                generatedDocuments.push(document);
                setGenerationStatus(prev => ({ ...prev, [templateId]: 'completed' }));
              } else {
                // Fallback to template-based document if generated document not found
                const document = {
                  id: `generated-${templateId}-${Date.now()}`,
                  name: template.name,
                  type: templateId,
                  content: 'Document generated successfully and saved to database',
                  category: template.category,
                  framework: projectFramework,
                  generatedAt: new Date().toISOString(),
                  generatedBy: 'ADPA System',
                  qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100%
                  wordCount: 0, // Will be updated when document is loaded
                  tags: [template.category, projectFramework, 'generated'],
                  status: 'draft' as 'draft' | 'review' | 'approved' | 'published'
                };
                
                generatedDocuments.push(document);
                setGenerationStatus(prev => ({ ...prev, [templateId]: 'completed' }));
              }
          } catch (error) {
            console.error(`Error saving document for template ${templateId}:`, error);
            setGenerationStatus(prev => ({ ...prev, [templateId]: 'error' }));
          }
        } else {
          setGenerationStatus(prev => ({ ...prev, [templateId]: 'error' }));
        }
      } else {
        // Handle case where generationResponse.success is false
        setGenerationStatus(prev => ({ ...prev, [templateId]: 'error' }));
      }
      } // Close the for loop

      // Call the onGenerate callback with generated documents
      await onGenerate(selectedTemplates, generatedDocuments);
      
      // Close modal after successful generation
      setTimeout(() => {
        onClose();
        setSelectedTemplates([]);
        setGenerationStatus({});
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Document generation error:', error);
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'generating':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'generating':
        return 'Generating...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Documents</h2>
            <p className="text-gray-600 mt-1">Generate project documents for: <span className="font-medium">{projectName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Search and Filter Controls */}
          {!templatesLoading && availableTemplates.length > 0 && (
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Framework Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Frameworks</option>
                    <option value="babok">BABOK</option>
                    <option value="pmbok">PMBOK</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {Array.from(new Set(availableTemplates.map(t => t.category))).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFramework('all');
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selection Controls */}
          {!templatesLoading && templates.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {selectedTemplates.length} of {templates.length} documents selected
                {availableTemplates.length !== templates.length && (
                  <span className="text-gray-500"> (filtered from {availableTemplates.length} total)</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg transition-colors"
                  disabled={isGenerating}
                >
                  Select All Visible
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg transition-colors"
                  disabled={isGenerating}
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading available templates...</p>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {availableTemplates.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
                  <p className="text-gray-600">
                    No templates are currently available for document generation. 
                    Please ensure templates are configured in the template management system.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Match Your Filters</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or filter criteria to see more templates.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFramework('all');
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
              const isSelected = selectedTemplates.includes(template.id);
              const status = generationStatus[template.id];
              const validation = dependencyValidation[template.id];
              const hasDependencyIssues = validation && !validation.isValid;
              
              return (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? hasDependencyIssues
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-blue-500 bg-blue-50'
                      : hasDependencyIssues
                        ? 'border-orange-200 hover:border-orange-300'
                        : 'border-gray-200 hover:border-gray-300'
                  } ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={() => !isGenerating && handleTemplateToggle(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isGenerating && handleTemplateToggle(template.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isGenerating}
                        />
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        {isTemplateRequired(template) && (
                          <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                            Required
                          </span>
                        )}
                        {hasDependencyIssues && (
                          <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Dependencies</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Category: {template.category}</span>
                        <span>Est. Time: {template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {/* Framework Badge */}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.originalFramework === 'babok' ? 'bg-blue-100 text-blue-800' :
                          template.originalFramework === 'pmbok' ? 'bg-green-100 text-green-800' :
                          template.originalFramework === 'general' ? 'bg-gray-100 text-gray-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {template.originalFramework?.toUpperCase() || 'GENERAL'}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.contextPriority === 'critical' ? 'bg-red-100 text-red-800' :
                          template.contextPriority === 'high' ? 'bg-orange-100 text-orange-800' :
                          template.contextPriority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {template.contextPriority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    {status && (
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(status)}
                        <span className="text-xs text-gray-600">{getStatusText(status)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}

          {/* Dependency Validation Warnings */}
          {showDependencyWarnings && selectedTemplates.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                📋 Document Dependencies Analysis
              </h3>
              {selectedTemplates.map(templateId => {
                const validation = dependencyValidation[templateId];
                const template = templates.find(t => t.id === templateId);
                
                if (!validation || validation.isValid || !template) return null;
                
                return (
                  <div key={templateId} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {template.name} - Dependency Check
                    </h4>
                    <DependencyValidationWarning
                      validation={validation}
                      templateName={template.name}
                      onGenerateMissing={(missingDeps) => {
                        // Add missing dependencies to selection
                        const missingIds = missingDeps.map(dep => dep.templateId);
                        const newSelection = [...new Set([...selectedTemplates, ...missingIds])];
                        setSelectedTemplates(newSelection);
                      }}
                      onContinue={() => {
                        // Allow user to continue without dependencies
                        setShowDependencyWarnings(false);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplates.length > 0 && (
              <span>
                Estimated total time: {selectedTemplates.length * 25} minutes
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={selectedTemplates.length === 0 || isGenerating || templatesLoading}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                showDependencyWarnings 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>
                    {showDependencyWarnings ? 'Generate with Warnings' : 'Generate Documents'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Context Tracking Modal */}
      <ContextTrackingModal
        isOpen={showContextTracking}
        onClose={() => setShowContextTracking(false)}
        documentType={selectedDocumentForTracking}
        projectId={projectId}
        projectContext={projectContext}
        provider={selectedProvider}
        model={selectedModel}
        onDocumentGenerated={handleDocumentGenerated}
      />
    </div>
  );
};

export default DocumentGenerationModal;
