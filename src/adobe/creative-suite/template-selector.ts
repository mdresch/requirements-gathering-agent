/**
 * Template Selection System for Adobe Creative Suite Phase 2
 * 
 * This module provides automatic template selection based on document types
 * and content analysis. It maps input documents to the most appropriate
 * Adobe Creative Suite templates based on content, structure, and purpose.
 */

import path from 'path';
import { brandGuidelines } from './brand-guidelines.js';

// Template base paths
const TEMPLATE_BASE_PATH = path.resolve(process.cwd(), 'templates', 'adobe-creative');
const INDESIGN_TEMPLATES_PATH = path.join(TEMPLATE_BASE_PATH, 'indesign');
const ILLUSTRATOR_TEMPLATES_PATH = path.join(TEMPLATE_BASE_PATH, 'illustrator');
const PHOTOSHOP_TEMPLATES_PATH = path.join(TEMPLATE_BASE_PATH, 'photoshop');
const DOC_GEN_TEMPLATES_PATH = path.join(TEMPLATE_BASE_PATH, 'document-generation');

// Document type enums - Enhanced with more types
export enum DocumentType {
  PROJECT_CHARTER = 'project-charter',
  REQUIREMENTS_SPECIFICATION = 'requirements-specification',
  TECHNICAL_DESIGN = 'technical-design',
  USER_GUIDE = 'user-guide',
  STATUS_REPORT = 'status-report',
  TEST_PLAN = 'test-plan',
  BUSINESS_PROPOSAL = 'business-proposal',
  MEETING_MINUTES = 'meeting-minutes',
  RISK_ASSESSMENT = 'risk-assessment',
  TRAINING_MANUAL = 'training-manual',
  API_DOCUMENTATION = 'api-documentation',
  RELEASE_NOTES = 'release-notes',
  COMPLIANCE_REPORT = 'compliance-report',
  SECURITY_ASSESSMENT = 'security-assessment',
  UNKNOWN = 'unknown'
}

// Visual element types
export enum VisualizationType {
  PROJECT_TIMELINE = 'project-timeline',
  PROCESS_FLOW = 'process-flow',
  ORGANIZATION_CHART = 'organization-chart',
  DATA_CHART = 'data-chart',
  ARCHITECTURE_DIAGRAM = 'architecture-diagram',
  UNKNOWN = 'unknown'
}

// Image enhancement types
export enum ImageEnhancementType {
  SCREENSHOT = 'screenshot',
  PHOTO = 'photo',
  DIAGRAM = 'diagram',
  ICON = 'icon',
  UNKNOWN = 'unknown'
}

/**
 * Template registry mapping document types to appropriate templates
 */
interface TemplateRegistry {
  indesign: Record<DocumentType, string>;
  illustrator: Record<VisualizationType, string>;
  photoshop: Record<ImageEnhancementType, string>;
  documentGeneration: Record<DocumentType, string>;
}

/**
 * Registry of available templates mapped by document type
 */
export const templateRegistry: TemplateRegistry = {
  indesign: {
    [DocumentType.PROJECT_CHARTER]: path.join(INDESIGN_TEMPLATES_PATH, 'project-charter.idml'),
    [DocumentType.REQUIREMENTS_SPECIFICATION]: path.join(INDESIGN_TEMPLATES_PATH, 'requirements-specification.idml'),
    [DocumentType.TECHNICAL_DESIGN]: path.join(INDESIGN_TEMPLATES_PATH, 'technical-design.idml'),
    [DocumentType.USER_GUIDE]: path.join(INDESIGN_TEMPLATES_PATH, 'user-guide.idml'),
    [DocumentType.STATUS_REPORT]: path.join(INDESIGN_TEMPLATES_PATH, 'status-report.idml'),
    [DocumentType.TEST_PLAN]: path.join(INDESIGN_TEMPLATES_PATH, 'test-plan.idml'),
    [DocumentType.BUSINESS_PROPOSAL]: path.join(INDESIGN_TEMPLATES_PATH, 'business-proposal.idml'),
    [DocumentType.MEETING_MINUTES]: path.join(INDESIGN_TEMPLATES_PATH, 'meeting-minutes.idml'),
    [DocumentType.RISK_ASSESSMENT]: path.join(INDESIGN_TEMPLATES_PATH, 'risk-assessment.idml'),
    [DocumentType.TRAINING_MANUAL]: path.join(INDESIGN_TEMPLATES_PATH, 'training-manual.idml'),
    [DocumentType.API_DOCUMENTATION]: path.join(INDESIGN_TEMPLATES_PATH, 'api-documentation.idml'),
    [DocumentType.RELEASE_NOTES]: path.join(INDESIGN_TEMPLATES_PATH, 'release-notes.idml'),
    [DocumentType.COMPLIANCE_REPORT]: path.join(INDESIGN_TEMPLATES_PATH, 'compliance-report.idml'),
    [DocumentType.SECURITY_ASSESSMENT]: path.join(INDESIGN_TEMPLATES_PATH, 'security-assessment.idml'),
    [DocumentType.UNKNOWN]: path.join(INDESIGN_TEMPLATES_PATH, 'generic-document.idml')
  },
  illustrator: {
    [VisualizationType.PROJECT_TIMELINE]: path.join(ILLUSTRATOR_TEMPLATES_PATH, 'project-timeline.ai'),
    [VisualizationType.PROCESS_FLOW]: path.join(ILLUSTRATOR_TEMPLATES_PATH, 'process-flow.ai'),
    [VisualizationType.ORGANIZATION_CHART]: path.join(ILLUSTRATOR_TEMPLATES_PATH, 'organization-chart.ai'),
    [VisualizationType.DATA_CHART]: path.join(ILLUSTRATOR_TEMPLATES_PATH, 'data-chart.ai'),
    [VisualizationType.ARCHITECTURE_DIAGRAM]: path.join(ILLUSTRATOR_TEMPLATES_PATH, 'architecture-diagram.ai'),
    [VisualizationType.UNKNOWN]: path.join(ILLUSTRATOR_TEMPLATES_PATH, 'generic-graphic.ai')
  },
  photoshop: {
    [ImageEnhancementType.SCREENSHOT]: path.join(PHOTOSHOP_TEMPLATES_PATH, 'screenshot-enhancement.psd'),
    [ImageEnhancementType.PHOTO]: path.join(PHOTOSHOP_TEMPLATES_PATH, 'photo-enhancement.psd'),
    [ImageEnhancementType.DIAGRAM]: path.join(PHOTOSHOP_TEMPLATES_PATH, 'diagram-enhancement.psd'),
    [ImageEnhancementType.ICON]: path.join(PHOTOSHOP_TEMPLATES_PATH, 'icon-enhancement.psd'),
    [ImageEnhancementType.UNKNOWN]: path.join(PHOTOSHOP_TEMPLATES_PATH, 'generic-image.psd')
  },
  documentGeneration: {
    [DocumentType.PROJECT_CHARTER]: path.join(DOC_GEN_TEMPLATES_PATH, 'project-charter.xml'),
    [DocumentType.REQUIREMENTS_SPECIFICATION]: path.join(DOC_GEN_TEMPLATES_PATH, 'requirements-specification.xml'),
    [DocumentType.TECHNICAL_DESIGN]: path.join(DOC_GEN_TEMPLATES_PATH, 'technical-design.xml'),
    [DocumentType.USER_GUIDE]: path.join(DOC_GEN_TEMPLATES_PATH, 'user-guide.xml'),
    [DocumentType.STATUS_REPORT]: path.join(DOC_GEN_TEMPLATES_PATH, 'status-report.xml'),
    [DocumentType.TEST_PLAN]: path.join(DOC_GEN_TEMPLATES_PATH, 'test-plan.xml'),
    [DocumentType.BUSINESS_PROPOSAL]: path.join(DOC_GEN_TEMPLATES_PATH, 'business-proposal.xml'),
    [DocumentType.MEETING_MINUTES]: path.join(DOC_GEN_TEMPLATES_PATH, 'meeting-minutes.xml'),
    [DocumentType.RISK_ASSESSMENT]: path.join(DOC_GEN_TEMPLATES_PATH, 'risk-assessment.xml'),
    [DocumentType.TRAINING_MANUAL]: path.join(DOC_GEN_TEMPLATES_PATH, 'training-manual.xml'),
    [DocumentType.API_DOCUMENTATION]: path.join(DOC_GEN_TEMPLATES_PATH, 'api-documentation.xml'),
    [DocumentType.RELEASE_NOTES]: path.join(DOC_GEN_TEMPLATES_PATH, 'release-notes.xml'),
    [DocumentType.COMPLIANCE_REPORT]: path.join(DOC_GEN_TEMPLATES_PATH, 'compliance-report.xml'),
    [DocumentType.SECURITY_ASSESSMENT]: path.join(DOC_GEN_TEMPLATES_PATH, 'security-assessment.xml'),
    [DocumentType.UNKNOWN]: path.join(DOC_GEN_TEMPLATES_PATH, 'generic-document.xml')
  }
};

/**
 * Document analysis result with detected type and confidence
 */
export interface DocumentAnalysis {
  documentType: DocumentType;
  confidence: number;
  metadata: Record<string, any>;
  visualElements: VisualizationType[];
  imageElements: ImageEnhancementType[];
  recommendedTemplates: {
    indesign: string;
    illustrator: string[];
    photoshop: string[];
    documentGeneration: string;
  };
}

/**
 * Analyzes document content to determine the document type
 * @param content Document content to analyze
 * @param metadata Optional metadata about the document
 * @returns Analysis results including document type and confidence
 */
export function analyzeDocument(content: string, metadata?: Record<string, any>): DocumentAnalysis {
  // Initialize with unknown type and zero confidence
  let documentType = DocumentType.UNKNOWN;
  let confidence = 0;
  
  // Default metadata if not provided
  const docMetadata = metadata || {};
  
  // Extract document characteristics with more specific keyword patterns
  const hasProjectCharterKeywords = /project charter|charter objectives|stakeholder.*analysis|project.*scope.*statement/i.test(content);
  const hasRequirementsKeywords = /requirements specification|user stories|acceptance criteria|user requirements|functional requirements/i.test(content);
  const hasTechnicalDesignKeywords = /technical design|architecture|system design|component diagram|data model|class diagram/i.test(content);
  const hasUserGuideKeywords = /user guide|manual|instructions|how to|tutorial|step by step/i.test(content);
  const hasStatusReportKeywords = /status report|progress|milestones completed|next steps|issues|risks/i.test(content);
  const hasTestPlanKeywords = /test plan|test cases|test scenarios|test strategy|acceptance testing/i.test(content);
  const hasBusinessProposalKeywords = /business proposal|proposal.*budget|cost.*benefit|return on investment|ROI|budget.*allocation|deliverable.*timeline|proposal.*deliverable/i.test(content);
  const hasMeetingMinutesKeywords = /meeting minutes|agenda|attendees|action items|decisions|notes from meeting|meeting.*recorded|minutes.*summary/i.test(content);
  const hasRiskAssessmentKeywords = /risk assessment|risk analysis|risk register|risk mitigation|threat analysis/i.test(content);
  const hasTrainingManualKeywords = /training manual|training guide|course material|learning objectives|exercises/i.test(content);
  const hasApiDocumentationKeywords = /api documentation|endpoint|REST API|API reference|swagger|openapi/i.test(content);
  const hasReleaseNotesKeywords = /release notes|version|changelog|what's new|bug fixes|enhancements/i.test(content);
  const hasComplianceReportKeywords = /compliance report|audit|regulatory|compliance|standards|certification/i.test(content);
  const hasSecurityAssessmentKeywords = /security assessment|vulnerability|security analysis|penetration test|security audit/i.test(content);
  
  // Detect document type based on keywords with improved confidence scoring
  // Check more specific patterns first to avoid conflicts
  if (hasBusinessProposalKeywords) {
    documentType = DocumentType.BUSINESS_PROPOSAL;
    confidence = 0.8;
  } else if (hasMeetingMinutesKeywords) {
    documentType = DocumentType.MEETING_MINUTES;
    confidence = 0.9;
  } else if (hasRiskAssessmentKeywords) {
    documentType = DocumentType.RISK_ASSESSMENT;
    confidence = 0.85;
  } else if (hasApiDocumentationKeywords) {
    documentType = DocumentType.API_DOCUMENTATION;
    confidence = 0.8;
  } else if (hasReleaseNotesKeywords) {
    documentType = DocumentType.RELEASE_NOTES;
    confidence = 0.8;
  } else if (hasTrainingManualKeywords) {
    documentType = DocumentType.TRAINING_MANUAL;
    confidence = 0.8;
  } else if (hasComplianceReportKeywords) {
    documentType = DocumentType.COMPLIANCE_REPORT;
    confidence = 0.8;
  } else if (hasSecurityAssessmentKeywords) {
    documentType = DocumentType.SECURITY_ASSESSMENT;
    confidence = 0.85;
  } else if (hasProjectCharterKeywords) {
    documentType = DocumentType.PROJECT_CHARTER;
    confidence = 0.85;
  } else if (hasRequirementsKeywords) {
    documentType = DocumentType.REQUIREMENTS_SPECIFICATION;
    confidence = 0.85;
  } else if (hasTechnicalDesignKeywords) {
    documentType = DocumentType.TECHNICAL_DESIGN;
    confidence = 0.8;
  } else if (hasUserGuideKeywords) {
    documentType = DocumentType.USER_GUIDE;
    confidence = 0.8;
  } else if (hasStatusReportKeywords) {
    documentType = DocumentType.STATUS_REPORT;
    confidence = 0.75;
  } else if (hasTestPlanKeywords) {
    documentType = DocumentType.TEST_PLAN;
    confidence = 0.75;
  } else {
    documentType = DocumentType.UNKNOWN;
    confidence = 0.3;
  }
  
  // If we have metadata about the document type, use that with higher confidence
  if (docMetadata.documentType) {
    const metadataType = docMetadata.documentType.toLowerCase();
    Object.values(DocumentType).forEach(type => {
      if (metadataType.includes(type)) {
        documentType = type as DocumentType;
        confidence = 0.9;
      }
    });
  }
  
  // Detect visualization elements
  const visualElements: VisualizationType[] = [];
  
  if (/timeline|gantt chart|schedule|milestones/i.test(content)) {
    visualElements.push(VisualizationType.PROJECT_TIMELINE);
  }
  
  if (/flow chart|process flow|workflow|sequence|steps/i.test(content)) {
    visualElements.push(VisualizationType.PROCESS_FLOW);
  }
  
  if (/organization chart|org chart|team structure|reporting structure|hierarchy/i.test(content)) {
    visualElements.push(VisualizationType.ORGANIZATION_CHART);
  }
  
  if (/chart|graph|plot|data visualization|metrics|statistics/i.test(content)) {
    visualElements.push(VisualizationType.DATA_CHART);
  }
  
  if (/architecture diagram|system architecture|component diagram|deployment diagram/i.test(content)) {
    visualElements.push(VisualizationType.ARCHITECTURE_DIAGRAM);
  }
  
  // Detect image elements
  const imageElements: ImageEnhancementType[] = [];
  
  if (/screenshot|screen capture/i.test(content)) {
    imageElements.push(ImageEnhancementType.SCREENSHOT);
  }
  
  if (/photo|image|picture/i.test(content)) {
    imageElements.push(ImageEnhancementType.PHOTO);
  }
  
  if (/diagram|chart|graph/i.test(content)) {
    imageElements.push(ImageEnhancementType.DIAGRAM);
  }
  
  if (/icon|logo|symbol/i.test(content)) {
    imageElements.push(ImageEnhancementType.ICON);
  }
  
  // Build recommended templates
  const recommendedTemplates = {
    indesign: templateRegistry.indesign[documentType],
    illustrator: visualElements.map(vType => templateRegistry.illustrator[vType]),
    photoshop: imageElements.map(iType => templateRegistry.photoshop[iType]),
    documentGeneration: templateRegistry.documentGeneration[documentType]
  };
  
  return {
    documentType,
    confidence,
    metadata: docMetadata,
    visualElements,
    imageElements,
    recommendedTemplates
  };
}

/**
 * Get the InDesign template path for a specific document type
 * @param documentType The document type
 * @returns Path to the InDesign template
 */
export function getInDesignTemplate(documentType: DocumentType): string {
  return templateRegistry.indesign[documentType] || templateRegistry.indesign[DocumentType.UNKNOWN];
}

/**
 * Get the Illustrator template path for a specific visualization type
 * @param visualizationType The visualization type
 * @returns Path to the Illustrator template
 */
export function getIllustratorTemplate(visualizationType: VisualizationType): string {
  return templateRegistry.illustrator[visualizationType] || templateRegistry.illustrator[VisualizationType.UNKNOWN];
}

/**
 * Get the Photoshop template path for a specific image enhancement type
 * @param imageType The image enhancement type
 * @returns Path to the Photoshop template
 */
export function getPhotoshopTemplate(imageType: ImageEnhancementType): string {
  return templateRegistry.photoshop[imageType] || templateRegistry.photoshop[ImageEnhancementType.UNKNOWN];
}

/**
 * Get the Document Generation template path for a specific document type
 * @param documentType The document type
 * @returns Path to the Document Generation template
 */
export function getDocumentGenerationTemplate(documentType: DocumentType): string {
  return templateRegistry.documentGeneration[documentType] || templateRegistry.documentGeneration[DocumentType.UNKNOWN];
}

/**
 * Get template variables for a document based on brand guidelines and document type
 * @param documentType The document type
 * @returns Template variables object
 */
export async function getTemplateVariables(documentType: DocumentType): Promise<Record<string, any>> {
  // Get brand guidelines data
  const guidelines = await brandGuidelines.getGuidelines();
  const colors = await brandGuidelines.getColors();
  const typography = await brandGuidelines.getTypography();
  
  // Base variables from brand guidelines
  const variables: Record<string, any> = {
    companyName: guidelines.brandName,
    logoPath: guidelines.assets?.logoVariants?.primary || guidelines.assets?.logoPath || '',
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    fontPrimary: typography.headings.fontFamily,
    fontSecondary: typography.body.fontFamily,
    generationDate: new Date().toISOString().split('T')[0]
  };
  
  // Add document-type specific variables
  switch(documentType) {
    case DocumentType.PROJECT_CHARTER:
      variables.documentTitle = 'Project Charter';
      variables.documentSubtitle = 'Project Initiation Document';
      variables.sections = ['Executive Summary', 'Project Overview', 'Objectives', 'Scope', 'Stakeholders', 'Timeline', 'Budget', 'Risks'];
      variables.templatePlaceholders = {
        projectName: '{{PROJECT_NAME}}',
        projectManager: '{{PROJECT_MANAGER}}',
        startDate: '{{PROJECT_START_DATE}}',
        endDate: '{{PROJECT_END_DATE}}',
        budget: '{{PROJECT_BUDGET}}',
        sponsor: '{{PROJECT_SPONSOR}}',
        objectives: '{{PROJECT_OBJECTIVES}}',
        scope: '{{PROJECT_SCOPE}}',
        deliverables: '{{PROJECT_DELIVERABLES}}',
        stakeholders: '{{PROJECT_STAKEHOLDERS}}',
        risks: '{{PROJECT_RISKS}}',
        assumptions: '{{PROJECT_ASSUMPTIONS}}'
      };
      break;
      
    case DocumentType.REQUIREMENTS_SPECIFICATION:
      variables.documentTitle = 'Requirements Specification';
      variables.documentSubtitle = 'Functional and Non-Functional Requirements';
      variables.sections = ['Introduction', 'System Overview', 'Functional Requirements', 'Non-Functional Requirements', 'Data Requirements', 'Constraints'];
      variables.templatePlaceholders = {
        systemName: '{{SYSTEM_NAME}}',
        version: '{{SYSTEM_VERSION}}',
        author: '{{DOCUMENT_AUTHOR}}',
        reviewers: '{{DOCUMENT_REVIEWERS}}',
        functionalRequirements: '{{FUNCTIONAL_REQUIREMENTS}}',
        nonFunctionalRequirements: '{{NON_FUNCTIONAL_REQUIREMENTS}}',
        dataRequirements: '{{DATA_REQUIREMENTS}}',
        businessRules: '{{BUSINESS_RULES}}',
        userStories: '{{USER_STORIES}}',
        acceptanceCriteria: '{{ACCEPTANCE_CRITERIA}}',
        constraints: '{{SYSTEM_CONSTRAINTS}}',
        dependencies: '{{SYSTEM_DEPENDENCIES}}'
      };
      break;

    case DocumentType.TECHNICAL_DESIGN:
      variables.documentTitle = 'Technical Design Document';
      variables.documentSubtitle = 'System Architecture and Design Specifications';
      variables.sections = ['Overview', 'Architecture', 'Components', 'Data Design', 'Interface Design', 'Security', 'Performance'];
      variables.templatePlaceholders = {
        systemName: '{{SYSTEM_NAME}}',
        architect: '{{SYSTEM_ARCHITECT}}',
        architecture: '{{SYSTEM_ARCHITECTURE}}',
        components: '{{SYSTEM_COMPONENTS}}',
        dataModel: '{{DATA_MODEL}}',
        interfaces: '{{SYSTEM_INTERFACES}}',
        security: '{{SECURITY_DESIGN}}',
        performance: '{{PERFORMANCE_REQUIREMENTS}}',
        deployment: '{{DEPLOYMENT_ARCHITECTURE}}',
        technology: '{{TECHNOLOGY_STACK}}',
        patterns: '{{DESIGN_PATTERNS}}',
        standards: '{{CODING_STANDARDS}}'
      };
      break;

    case DocumentType.USER_GUIDE:
      variables.documentTitle = 'User Guide';
      variables.documentSubtitle = 'Step-by-Step Instructions';
      variables.sections = ['Getting Started', 'Features', 'Procedures', 'Troubleshooting', 'FAQ', 'Support'];
      variables.templatePlaceholders = {
        productName: '{{PRODUCT_NAME}}',
        version: '{{PRODUCT_VERSION}}',
        audience: '{{TARGET_AUDIENCE}}',
        features: '{{PRODUCT_FEATURES}}',
        procedures: '{{USER_PROCEDURES}}',
        screenshots: '{{SCREENSHOT_PLACEHOLDERS}}',
        troubleshooting: '{{TROUBLESHOOTING_GUIDE}}',
        faq: '{{FREQUENTLY_ASKED_QUESTIONS}}',
        support: '{{SUPPORT_INFORMATION}}',
        quickStart: '{{QUICK_START_GUIDE}}',
        tutorials: '{{STEP_BY_STEP_TUTORIALS}}',
        tips: '{{TIPS_AND_TRICKS}}'
      };
      break;

    case DocumentType.STATUS_REPORT:
      variables.documentTitle = 'Status Report';
      variables.documentSubtitle = 'Project Progress and Updates';
      variables.sections = ['Executive Summary', 'Progress', 'Milestones', 'Issues', 'Risks', 'Next Steps'];
      variables.templatePlaceholders = {
        reportingPeriod: '{{REPORTING_PERIOD}}',
        projectName: '{{PROJECT_NAME}}',
        overallStatus: '{{OVERALL_STATUS}}',
        progress: '{{PROGRESS_SUMMARY}}',
        milestones: '{{COMPLETED_MILESTONES}}',
        upcomingMilestones: '{{UPCOMING_MILESTONES}}',
        issues: '{{CURRENT_ISSUES}}',
        risks: '{{IDENTIFIED_RISKS}}',
        nextSteps: '{{NEXT_STEPS}}',
        budget: '{{BUDGET_STATUS}}',
        timeline: '{{TIMELINE_STATUS}}',
        resources: '{{RESOURCE_STATUS}}'
      };
      break;

    case DocumentType.TEST_PLAN:
      variables.documentTitle = 'Test Plan';
      variables.documentSubtitle = 'Test Strategy and Execution Plan';
      variables.sections = ['Overview', 'Scope', 'Strategy', 'Test Cases', 'Environment', 'Schedule', 'Resources'];
      variables.templatePlaceholders = {
        testPlanId: '{{TEST_PLAN_ID}}',
        systemUnderTest: '{{SYSTEM_UNDER_TEST}}',
        testScope: '{{TEST_SCOPE}}',
        testStrategy: '{{TEST_STRATEGY}}',
        testCases: '{{TEST_CASES}}',
        testEnvironment: '{{TEST_ENVIRONMENT}}',
        testData: '{{TEST_DATA}}',
        testSchedule: '{{TEST_SCHEDULE}}',
        testResources: '{{TEST_RESOURCES}}',
        entryExitCriteria: '{{ENTRY_EXIT_CRITERIA}}',
        riskAssessment: '{{TEST_RISK_ASSESSMENT}}',
        deliverables: '{{TEST_DELIVERABLES}}'
      };
      break;
      
    default:
      variables.documentTitle = 'Document';
      variables.documentSubtitle = 'Generated Document';
      variables.sections = ['Introduction', 'Content', 'Summary'];
      variables.templatePlaceholders = {
        title: '{{DOCUMENT_TITLE}}',
        subtitle: '{{DOCUMENT_SUBTITLE}}',
        author: '{{DOCUMENT_AUTHOR}}',
        date: '{{DOCUMENT_DATE}}',
        content: '{{DOCUMENT_CONTENT}}',
        summary: '{{DOCUMENT_SUMMARY}}'
      };
  }
  
  return variables;
}

export default {
  analyzeDocument,
  getInDesignTemplate,
  getIllustratorTemplate,
  getPhotoshopTemplate,
  getDocumentGenerationTemplate,
  getTemplateVariables,
  DocumentType,
  VisualizationType,
  ImageEnhancementType
};
