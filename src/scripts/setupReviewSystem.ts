import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Setup script to initialize the review system with sample data
 */

// Sample workflow configurations
const sampleWorkflows = [
  {
    name: 'PMBOK Document Review',
    description: 'Standard review workflow for PMBOK-compliant project management documents',
    documentTypes: ['pmbok_document', 'management_plan', 'project_charter'],
    requiredRoles: ['project_manager', 'compliance_officer'],
    reviewStages: [
      {
        stageNumber: 1,
        name: 'Initial Review',
        description: 'Initial review by project manager for completeness and accuracy',
        requiredRole: 'project_manager',
        isParallel: false,
        isOptional: false,
        canSkip: false,
        estimatedHours: 4,
        maxDays: 3,
        criteria: [],
        passingScore: 70
      },
      {
        stageNumber: 2,
        name: 'Compliance Review',
        description: 'Compliance review to ensure PMBOK standards are met',
        requiredRole: 'compliance_officer',
        isParallel: false,
        isOptional: false,
        canSkip: false,
        estimatedHours: 6,
        maxDays: 5,
        criteria: [],
        passingScore: 80
      }
    ],
    defaultDueDays: 7,
    escalationRules: [
      {
        id: 'overdue-reminder',
        name: 'Overdue Review Reminder',
        condition: {
          type: 'overdue',
          parameters: {}
        },
        action: {
          type: 'notify',
          parameters: { template: 'overdue_reminder' }
        },
        triggerAfterHours: 24,
        reminderIntervalHours: 24,
        maxReminders: 3,
        escalateTo: ['reviewer_manager'],
        notificationTemplate: 'overdue_review_reminder',
        isActive: true
      }
    ],
    minimumReviewers: 2,
    requiredApprovals: 2,
    qualityThreshold: 75,
    autoAssignment: true,
    autoEscalation: true,
    autoNotification: true,
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Technical Document Review',
    description: 'Review workflow for technical specifications and design documents',
    documentTypes: ['technical_document', 'architecture_design', 'system_design'],
    requiredRoles: ['technical_reviewer', 'subject_matter_expert'],
    reviewStages: [
      {
        stageNumber: 1,
        name: 'Technical Review',
        description: 'Technical accuracy and feasibility review',
        requiredRole: 'technical_reviewer',
        isParallel: false,
        isOptional: false,
        canSkip: false,
        estimatedHours: 8,
        maxDays: 5,
        criteria: [],
        passingScore: 80
      },
      {
        stageNumber: 2,
        name: 'Subject Matter Expert Review',
        description: 'Domain expertise validation',
        requiredRole: 'subject_matter_expert',
        isParallel: true,
        isOptional: false,
        canSkip: false,
        estimatedHours: 6,
        maxDays: 4,
        criteria: [],
        passingScore: 75
      }
    ],
    defaultDueDays: 10,
    escalationRules: [
      {
        id: 'technical-escalation',
        name: 'Technical Review Escalation',
        condition: {
          type: 'overdue',
          parameters: {}
        },
        action: {
          type: 'escalate_manager',
          parameters: {}
        },
        triggerAfterHours: 48,
        reminderIntervalHours: 24,
        maxReminders: 2,
        escalateTo: ['technical_lead'],
        notificationTemplate: 'technical_review_escalation',
        isActive: true
      }
    ],
    minimumReviewers: 2,
    requiredApprovals: 2,
    qualityThreshold: 80,
    autoAssignment: true,
    autoEscalation: true,
    autoNotification: true,
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Business Analysis Review',
    description: 'Review workflow for business analysis and requirements documents',
    documentTypes: ['babok_document', 'requirements_document', 'business_case'],
    requiredRoles: ['business_analyst', 'stakeholder'],
    reviewStages: [
      {
        stageNumber: 1,
        name: 'Business Analysis Review',
        description: 'Review by business analyst for methodology compliance',
        requiredRole: 'business_analyst',
        isParallel: false,
        isOptional: false,
        canSkip: false,
        estimatedHours: 5,
        maxDays: 4,
        criteria: [],
        passingScore: 75
      },
      {
        stageNumber: 2,
        name: 'Stakeholder Review',
        description: 'Stakeholder validation and approval',
        requiredRole: 'stakeholder',
        isParallel: false,
        isOptional: false,
        canSkip: false,
        estimatedHours: 3,
        maxDays: 3,
        criteria: [],
        passingScore: 70
      }
    ],
    defaultDueDays: 6,
    escalationRules: [
      {
        id: 'stakeholder-reminder',
        name: 'Stakeholder Review Reminder',
        condition: {
          type: 'no_response',
          parameters: { hours: 48 }
        },
        action: {
          type: 'notify',
          parameters: { template: 'stakeholder_reminder' }
        },
        triggerAfterHours: 48,
        reminderIntervalHours: 24,
        maxReminders: 2,
        escalateTo: ['business_analyst'],
        notificationTemplate: 'stakeholder_review_reminder',
        isActive: true
      }
    ],
    minimumReviewers: 2,
    requiredApprovals: 2,
    qualityThreshold: 70,
    autoAssignment: true,
    autoEscalation: true,
    autoNotification: true,
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Quality Assurance Review',
    description: 'Comprehensive quality assurance review for all document types',
    documentTypes: ['quality_document', 'test_plan', 'test_strategy'],
    requiredRoles: ['quality_assurance', 'technical_reviewer'],
    reviewStages: [
      {
        stageNumber: 1,
        name: 'QA Review',
        description: 'Quality assurance review for standards compliance',
        requiredRole: 'quality_assurance',
        isParallel: false,
        isOptional: false,
        canSkip: false,
        estimatedHours: 6,
        maxDays: 4,
        criteria: [],
        passingScore: 85
      }
    ],
    defaultDueDays: 5,
    escalationRules: [
      {
        id: 'qa-escalation',
        name: 'QA Review Escalation',
        condition: {
          type: 'quality_threshold',
          parameters: { threshold: 85 }
        },
        action: {
          type: 'escalate_manager',
          parameters: {}
        },
        triggerAfterHours: 24,
        reminderIntervalHours: 12,
        maxReminders: 3,
        escalateTo: ['qa_manager'],
        notificationTemplate: 'qa_review_escalation',
        isActive: true
      }
    ],
    minimumReviewers: 1,
    requiredApprovals: 1,
    qualityThreshold: 85,
    autoAssignment: true,
    autoEscalation: true,
    autoNotification: true,
    isActive: true,
    createdBy: 'system'
  }
];

// Sample reviewer profiles
const sampleReviewers = [
  {
    userId: 'pm001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    title: 'Senior Project Manager',
    department: 'Project Management Office',
    organization: 'ADPA Enterprise',
    roles: ['project_manager', 'compliance_officer'],
    expertise: ['PMBOK', 'Agile', 'Risk Management', 'Stakeholder Management'],
    certifications: ['PMP', 'CSM', 'PMI-ACP'],
    experienceYears: 8,
    availability: {
      hoursPerWeek: 20,
      timeZone: 'America/New_York',
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: [1, 2, 3, 4, 5],
      unavailableDates: [],
      maxConcurrentReviews: 5
    },
    preferences: {
      preferredDocumentTypes: ['pmbok_document', 'management_plan', 'project_charter'],
      preferredProjectTypes: ['enterprise', 'digital_transformation'],
      notificationPreferences: {
        email: true,
        inApp: true,
        sms: false
      },
      reminderFrequency: 'daily'
    },
    metrics: {
      totalReviews: 45,
      completedReviews: 43,
      averageReviewTime: 6.5,
      averageQualityScore: 88,
      onTimeCompletionRate: 95,
      last30DaysReviews: 8,
      last30DaysAvgTime: 6.2,
      feedbackQualityScore: 92,
      thoroughnessScore: 89,
      lastUpdated: new Date()
    },
    isActive: true
  },
  {
    userId: 'tech001',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    title: 'Lead Technical Architect',
    department: 'Engineering',
    organization: 'ADPA Enterprise',
    roles: ['technical_reviewer', 'subject_matter_expert'],
    expertise: ['System Architecture', 'Cloud Computing', 'Microservices', 'Security'],
    certifications: ['AWS Solutions Architect', 'CISSP', 'TOGAF'],
    experienceYears: 12,
    availability: {
      hoursPerWeek: 15,
      timeZone: 'America/Los_Angeles',
      workingHours: { start: '08:00', end: '16:00' },
      workingDays: [1, 2, 3, 4, 5],
      unavailableDates: [],
      maxConcurrentReviews: 3
    },
    preferences: {
      preferredDocumentTypes: ['technical_document', 'architecture_design', 'system_design'],
      preferredProjectTypes: ['cloud_migration', 'system_modernization'],
      notificationPreferences: {
        email: true,
        inApp: true,
        sms: false
      },
      reminderFrequency: 'daily'
    },
    metrics: {
      totalReviews: 32,
      completedReviews: 30,
      averageReviewTime: 8.2,
      averageQualityScore: 91,
      onTimeCompletionRate: 93,
      last30DaysReviews: 5,
      last30DaysAvgTime: 7.8,
      feedbackQualityScore: 94,
      thoroughnessScore: 96,
      lastUpdated: new Date()
    },
    isActive: true
  },
  {
    userId: 'ba001',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    title: 'Senior Business Analyst',
    department: 'Business Analysis',
    organization: 'ADPA Enterprise',
    roles: ['business_analyst', 'stakeholder'],
    expertise: ['BABOK', 'Requirements Engineering', 'Process Modeling', 'Data Analysis'],
    certifications: ['CBAP', 'PMI-PBA', 'Six Sigma Green Belt'],
    experienceYears: 7,
    availability: {
      hoursPerWeek: 25,
      timeZone: 'America/Chicago',
      workingHours: { start: '08:30', end: '17:30' },
      workingDays: [1, 2, 3, 4, 5],
      unavailableDates: [],
      maxConcurrentReviews: 4
    },
    preferences: {
      preferredDocumentTypes: ['babok_document', 'requirements_document', 'business_case'],
      preferredProjectTypes: ['business_process_improvement', 'digital_transformation'],
      notificationPreferences: {
        email: true,
        inApp: true,
        sms: false
      },
      reminderFrequency: 'daily'
    },
    metrics: {
      totalReviews: 38,
      completedReviews: 36,
      averageReviewTime: 5.8,
      averageQualityScore: 86,
      onTimeCompletionRate: 94,
      last30DaysReviews: 7,
      last30DaysAvgTime: 5.5,
      feedbackQualityScore: 88,
      thoroughnessScore: 91,
      lastUpdated: new Date()
    },
    isActive: true
  },
  {
    userId: 'qa001',
    name: 'David Kim',
    email: 'david.kim@company.com',
    title: 'Quality Assurance Manager',
    department: 'Quality Assurance',
    organization: 'ADPA Enterprise',
    roles: ['quality_assurance', 'compliance_officer'],
    expertise: ['Quality Management', 'ISO Standards', 'Process Improvement', 'Compliance'],
    certifications: ['CQA', 'ISO 9001 Lead Auditor', 'ASQ CQE'],
    experienceYears: 10,
    availability: {
      hoursPerWeek: 18,
      timeZone: 'America/New_York',
      workingHours: { start: '09:00', end: '18:00' },
      workingDays: [1, 2, 3, 4, 5],
      unavailableDates: [],
      maxConcurrentReviews: 4
    },
    preferences: {
      preferredDocumentTypes: ['quality_document', 'test_plan', 'compliance_document'],
      preferredProjectTypes: ['quality_improvement', 'compliance'],
      notificationPreferences: {
        email: true,
        inApp: true,
        sms: false
      },
      reminderFrequency: 'weekly'
    },
    metrics: {
      totalReviews: 28,
      completedReviews: 27,
      averageReviewTime: 7.2,
      averageQualityScore: 93,
      onTimeCompletionRate: 96,
      last30DaysReviews: 4,
      last30DaysAvgTime: 6.8,
      feedbackQualityScore: 95,
      thoroughnessScore: 97,
      lastUpdated: new Date()
    },
    isActive: true
  },
  {
    userId: 'sme001',
    name: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@company.com',
    title: 'Subject Matter Expert - Healthcare',
    department: 'Domain Expertise',
    organization: 'ADPA Enterprise',
    roles: ['subject_matter_expert', 'stakeholder'],
    expertise: ['Healthcare Systems', 'HIPAA Compliance', 'Medical Informatics', 'Clinical Workflows'],
    certifications: ['RHIA', 'CHPS', 'HIMSS'],
    experienceYears: 15,
    availability: {
      hoursPerWeek: 12,
      timeZone: 'America/Denver',
      workingHours: { start: '10:00', end: '16:00' },
      workingDays: [1, 2, 3, 4],
      unavailableDates: [],
      maxConcurrentReviews: 2
    },
    preferences: {
      preferredDocumentTypes: ['requirements_document', 'compliance_document', 'technical_document'],
      preferredProjectTypes: ['healthcare', 'compliance'],
      notificationPreferences: {
        email: true,
        inApp: false,
        sms: false
      },
      reminderFrequency: 'weekly'
    },
    metrics: {
      totalReviews: 22,
      completedReviews: 21,
      averageReviewTime: 9.5,
      averageQualityScore: 95,
      onTimeCompletionRate: 95,
      last30DaysReviews: 3,
      last30DaysAvgTime: 9.2,
      feedbackQualityScore: 97,
      thoroughnessScore: 98,
      lastUpdated: new Date()
    },
    isActive: true
  }
];

interface IReviewStage {
  stageNumber: number;
  name: string;
  description?: string;
  requiredRole: string;
  isParallel?: boolean;
  isOptional?: boolean;
  canSkip?: boolean;
  estimatedHours?: number;
  maxDays?: number;
  criteria?: string[];
  passingScore?: number;
}

interface IEscalationRule {
  id: string;
  name: string;
  condition: {
    type: string;
    parameters?: object;
  };
  action: {
    type: string;
    parameters?: object;
  };
  triggerAfterHours?: number;
  reminderIntervalHours?: number;
  maxReminders?: number;
  escalateTo?: string[];
  notificationTemplate?: string;
  isActive?: boolean;
}

export interface ReviewWorkflowConfig {
  name: string;
  description?: string;
  documentTypes: string[];
  requiredRoles: string[];
  reviewStages: IReviewStage[];
  defaultDueDays?: number;
  escalationRules: IEscalationRule[];
  minimumReviewers?: number;
  requiredApprovals?: number;
  qualityThreshold?: number;
  autoAssignment?: boolean;
  autoEscalation?: boolean;
  autoNotification?: boolean;
  isActive?: boolean;
  createdBy: string;
}

// Utility functions for file-based storage
const workflowsFile = path.join(__dirname, '../data/reviewWorkflows.json');
const reviewersFile = path.join(__dirname, '../data/reviewerProfiles.json');

function readJsonFile(filePath: string) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJsonFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function validateWorkflow(workflow: ReviewWorkflowConfig) {
  const errors: string[] = [];
  if (!workflow.name || typeof workflow.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  if (!Array.isArray(workflow.reviewStages) || workflow.reviewStages.length === 0) {
    errors.push('At least one review stage is required');
  }
  // Add more validation as needed
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Initialize the review system with sample data
 */
try {
  logger.info('Setting up review system with sample data...');
  // Overwrite files with sample data
  writeJsonFile(workflowsFile, sampleWorkflows);
  writeJsonFile(reviewersFile, sampleReviewers);
  logger.info('✅ Review system setup completed successfully');
  logger.info(`Created ${sampleWorkflows.length} workflow configurations`);
  logger.info(`Created ${sampleReviewers.length} reviewer profiles`);
} catch (error) {
  logger.error('❌ Error setting up review system:', error);
  throw error;
}

/**
 * Validate the review system setup
 */
export async function validateReviewSystemSetup(): Promise<{
  isValid: boolean;
  workflows: number;
  reviewers: number;
  errors: string[];
}> {
  const result = {
    isValid: true,
    workflows: 0,
    reviewers: 0,
    errors: [] as string[]
  };
  try {
    // Read from JSON files
    const workflows: ReviewWorkflowConfig[] = readJsonFile(workflowsFile).filter((w: any) => w.isActive);
    const reviewers: any[] = readJsonFile(reviewersFile).filter((r: any) => r.isActive);
    result.workflows = workflows.length;
    result.reviewers = reviewers.length;
    // Validate workflows
    for (const workflow of workflows) {
      const validation = validateWorkflow(workflow);
      if (!validation.isValid) {
        result.errors.push(`Workflow "${workflow.name}": ${validation.errors.join(', ')}`);
        result.isValid = false;
      }
    }
    // Validate reviewers
    for (const reviewer of reviewers) {
      if (!reviewer.roles || reviewer.roles.length === 0) {
        result.errors.push(`Reviewer "${reviewer.name}": No roles assigned`);
        result.isValid = false;
      }
      if (!reviewer.expertise || reviewer.expertise.length === 0) {
        result.errors.push(`Reviewer "${reviewer.name}": No expertise defined`);
        result.isValid = false;
      }
    }
    logger.info(`Review system validation: ${result.isValid ? 'PASSED' : 'FAILED'}`);
    logger.info(`Workflows: ${result.workflows}, Reviewers: ${result.reviewers}`);
    if (result.errors.length > 0) {
      logger.warn('Validation errors:', result.errors);
    }
  } catch (error) {
    logger.error('Error validating review system setup:', error);
    result.isValid = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }
  return result;
}

// CLI execution (file-based)
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--validate')) {
    validateReviewSystemSetup().then(validation => {
      console.log('\n=== Review System Validation ===');
      console.log(`Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);
      console.log(`Workflows: ${validation.workflows}`);
      console.log(`Reviewers: ${validation.reviewers}`);
      if (validation.errors.length > 0) {
        console.log('\nErrors:');
        validation.errors.forEach(error => console.log(`  - ${error}`));
      }
      process.exit(0);
    });
  } else {
    try {
      // Overwrite files with sample data
      writeJsonFile(workflowsFile, sampleWorkflows);
      writeJsonFile(reviewersFile, sampleReviewers);
      logger.info('✅ Review system setup completed successfully');
      logger.info(`Created ${sampleWorkflows.length} workflow configurations`);
      logger.info(`Created ${sampleReviewers.length} reviewer profiles`);
      validateReviewSystemSetup().then(() => process.exit(0));
    } catch (error) {
      logger.error('❌ Error setting up review system:', error);
      process.exit(1);
    }
  }
}