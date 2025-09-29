export interface RecruitmentWorkflow {
  id: string;
  name: string;
  type: 'standard' | 'fast_track';
  role: string;
  jobTitle: string;
  steps: WorkflowStep[];
  estimatedDuration: number; // in days
  description: string;
  requirements: string[];
}

export interface WorkflowStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedDays: number;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  deliverables: string[];
  notes?: string;
}

export interface RecruitmentInstance {
  id: string;
  workflowId: string;
  stakeholderId: string;
  role: string;
  jobTitle: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  assignedRecruiter?: string;
  steps: WorkflowStepInstance[];
  notes: string;
  budget?: number;
  deadline?: string;
}

export interface WorkflowStepInstance {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  startedAt?: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
  deliverables?: string[];
}

// Predefined workflow templates
export const RECRUITMENT_WORKFLOWS: Record<string, RecruitmentWorkflow> = {
  // Standard Workflows
  'standard_project_manager': {
    id: 'standard_project_manager',
    name: 'Standard Project Manager Recruitment',
    type: 'standard',
    role: 'project_manager',
    jobTitle: 'Project Manager',
    estimatedDuration: 21,
    description: 'Comprehensive recruitment process for project manager positions',
    requirements: ['PMP certification', '5+ years experience', 'Leadership skills'],
    steps: [
      {
        id: 'job_post',
        order: 1,
        title: 'Job Posting Creation',
        description: 'Create and publish job posting on multiple platforms',
        estimatedDays: 2,
        status: 'pending',
        dependencies: [],
        deliverables: ['Job posting', 'Platform selection']
      },
      {
        id: 'resume_screening',
        order: 2,
        title: 'Resume Screening',
        description: 'Review and filter incoming applications',
        estimatedDays: 3,
        status: 'pending',
        dependencies: ['job_post'],
        deliverables: ['Shortlisted candidates', 'Screening report']
      },
      {
        id: 'phone_interview',
        order: 3,
        title: 'Phone Interview',
        description: 'Initial phone screening with candidates',
        estimatedDays: 5,
        status: 'pending',
        dependencies: ['resume_screening'],
        deliverables: ['Phone interview notes', 'Candidate ratings']
      },
      {
        id: 'technical_interview',
        order: 4,
        title: 'Technical Interview',
        description: 'Assess project management skills and experience',
        estimatedDays: 3,
        status: 'pending',
        dependencies: ['phone_interview'],
        deliverables: ['Technical assessment', 'Skills evaluation']
      },
      {
        id: 'panel_interview',
        order: 5,
        title: 'Panel Interview',
        description: 'Final interview with hiring panel',
        estimatedDays: 2,
        status: 'pending',
        dependencies: ['technical_interview'],
        deliverables: ['Panel feedback', 'Final candidate ranking']
      },
      {
        id: 'reference_check',
        order: 6,
        title: 'Reference Check',
        description: 'Contact and verify candidate references',
        estimatedDays: 3,
        status: 'pending',
        dependencies: ['panel_interview'],
        deliverables: ['Reference reports', 'Background verification']
      },
      {
        id: 'offer_negotiation',
        order: 7,
        title: 'Offer Negotiation',
        description: 'Present offer and negotiate terms',
        estimatedDays: 3,
        status: 'pending',
        dependencies: ['reference_check'],
        deliverables: ['Job offer', 'Contract terms']
      }
    ]
  },

  'standard_developer': {
    id: 'standard_developer',
    name: 'Standard Developer Recruitment',
    type: 'standard',
    role: 'team_member',
    jobTitle: 'Developer',
    estimatedDuration: 18,
    description: 'Standard recruitment process for developer positions',
    requirements: ['Programming skills', '3+ years experience', 'Problem solving'],
    steps: [
      {
        id: 'job_post',
        order: 1,
        title: 'Job Posting Creation',
        description: 'Create and publish job posting on tech platforms',
        estimatedDays: 2,
        status: 'pending',
        dependencies: [],
        deliverables: ['Job posting', 'Platform selection']
      },
      {
        id: 'resume_screening',
        order: 2,
        title: 'Resume Screening',
        description: 'Review applications and portfolio',
        estimatedDays: 2,
        status: 'pending',
        dependencies: ['job_post'],
        deliverables: ['Shortlisted candidates', 'Portfolio review']
      },
      {
        id: 'coding_test',
        order: 3,
        title: 'Coding Assessment',
        description: 'Technical coding test and evaluation',
        estimatedDays: 4,
        status: 'pending',
        dependencies: ['resume_screening'],
        deliverables: ['Code review', 'Technical scores']
      },
      {
        id: 'technical_interview',
        order: 4,
        title: 'Technical Interview',
        description: 'Deep dive into technical skills and experience',
        estimatedDays: 3,
        status: 'pending',
        dependencies: ['coding_test'],
        deliverables: ['Technical assessment', 'Skills evaluation']
      },
      {
        id: 'cultural_fit',
        order: 5,
        title: 'Cultural Fit Interview',
        description: 'Assess team fit and communication skills',
        estimatedDays: 2,
        status: 'pending',
        dependencies: ['technical_interview'],
        deliverables: ['Cultural assessment', 'Team feedback']
      },
      {
        id: 'offer_negotiation',
        order: 6,
        title: 'Offer Negotiation',
        description: 'Present offer and negotiate compensation',
        estimatedDays: 2,
        status: 'pending',
        dependencies: ['cultural_fit'],
        deliverables: ['Job offer', 'Compensation package']
      }
    ]
  },

  // Fast Track Workflows
  'fast_track_project_manager': {
    id: 'fast_track_project_manager',
    name: 'Fast Track Project Manager Recruitment',
    type: 'fast_track',
    role: 'project_manager',
    jobTitle: 'Project Manager',
    estimatedDuration: 7,
    description: 'Accelerated recruitment for urgent project manager needs',
    requirements: ['PMP certification', '5+ years experience', 'Immediate availability'],
    steps: [
      {
        id: 'network_recruitment',
        order: 1,
        title: 'Network Recruitment',
        description: 'Leverage professional networks and referrals',
        estimatedDays: 1,
        status: 'pending',
        dependencies: [],
        deliverables: ['Network outreach', 'Referral candidates']
      },
      {
        id: 'expedited_interview',
        order: 2,
        title: 'Expedited Interview Process',
        description: 'Combined technical and panel interview',
        estimatedDays: 2,
        status: 'pending',
        dependencies: ['network_recruitment'],
        deliverables: ['Combined interview', 'Rapid assessment']
      },
      {
        id: 'fast_reference',
        order: 3,
        title: 'Fast Reference Check',
        description: 'Quick reference verification',
        estimatedDays: 1,
        status: 'pending',
        dependencies: ['expedited_interview'],
        deliverables: ['Reference verification', 'Quick background check']
      },
      {
        id: 'immediate_offer',
        order: 4,
        title: 'Immediate Offer',
        description: 'Present competitive offer immediately',
        estimatedDays: 1,
        status: 'pending',
        dependencies: ['fast_reference'],
        deliverables: ['Competitive offer', 'Fast contract']
      },
      {
        id: 'onboarding_prep',
        order: 5,
        title: 'Onboarding Preparation',
        description: 'Prepare for immediate start',
        estimatedDays: 2,
        status: 'pending',
        dependencies: ['immediate_offer'],
        deliverables: ['Onboarding plan', 'Equipment setup']
      }
    ]
  },

  'fast_track_developer': {
    id: 'fast_track_developer',
    name: 'Fast Track Developer Recruitment',
    type: 'fast_track',
    role: 'team_member',
    jobTitle: 'Developer',
    estimatedDuration: 5,
    description: 'Rapid recruitment for critical developer positions',
    requirements: ['Strong technical skills', 'Immediate availability', 'Fast learner'],
    steps: [
      {
        id: 'tech_network',
        order: 1,
        title: 'Tech Network Recruitment',
        description: 'Target tech communities and networks',
        estimatedDays: 1,
        status: 'pending',
        dependencies: [],
        deliverables: ['Tech outreach', 'Community engagement']
      },
      {
        id: 'live_coding',
        order: 2,
        title: 'Live Coding Interview',
        description: 'Real-time coding assessment',
        estimatedDays: 1,
        status: 'pending',
        dependencies: ['tech_network'],
        deliverables: ['Live coding evaluation', 'Technical fit assessment']
      },
      {
        id: 'quick_cultural',
        order: 3,
        title: 'Quick Cultural Assessment',
        description: 'Brief team fit evaluation',
        estimatedDays: 1,
        status: 'pending',
        dependencies: ['live_coding'],
        deliverables: ['Cultural fit score', 'Team compatibility']
      },
      {
        id: 'fast_offer',
        order: 4,
        title: 'Fast Track Offer',
        description: 'Immediate competitive offer',
        estimatedDays: 1,
        status: 'pending',
        dependencies: ['quick_cultural'],
        deliverables: ['Competitive offer', 'Quick start terms']
      },
      {
        id: 'immediate_onboarding',
        order: 5,
        title: 'Immediate Onboarding',
        description: 'Same-day onboarding process',
        estimatedDays: 1,
        status: 'pending',
        dependencies: ['fast_offer'],
        deliverables: ['Immediate access', 'Quick setup']
      }
    ]
  }
};

// Helper function to get workflow by role and job title
export function getWorkflowByRoleAndTitle(role: string, jobTitle: string, type: 'standard' | 'fast_track' = 'standard'): RecruitmentWorkflow | null {
  // Map common role variations to workflow keys
  const roleMapping: Record<string, string> = {
    'project_manager': 'project_manager',
    'team_member': 'developer',
    'developer': 'developer',
    'sponsor': 'project_manager', // Use PM workflow for sponsors
    'end_user': 'developer', // Use developer workflow for end users
    'stakeholder': 'project_manager' // Use PM workflow for stakeholders
  };

  const mappedRole = roleMapping[role.toLowerCase()] || role.toLowerCase();
  const key = `${type}_${mappedRole}`;
  const workflow = RECRUITMENT_WORKFLOWS[key];
  
  console.log('getWorkflowByRoleAndTitle Debug:', {
    inputRole: role,
    inputJobTitle: jobTitle,
    inputType: type,
    mappedRole,
    key,
    workflowFound: !!workflow,
    availableKeys: Object.keys(RECRUITMENT_WORKFLOWS)
  });
  
  if (workflow) {
    // Customize job title in the workflow
    return {
      ...workflow,
      jobTitle,
      name: `${workflow.name.replace(workflow.jobTitle, jobTitle)}`
    };
  }
  
  return null;
}

// Helper function to get all available workflows for a role
export function getAvailableWorkflows(role: string, jobTitle: string): RecruitmentWorkflow[] {
  const workflows: RecruitmentWorkflow[] = [];
  
  const standardWorkflow = getWorkflowByRoleAndTitle(role, jobTitle, 'standard');
  if (standardWorkflow) {
    workflows.push(standardWorkflow);
  }
  
  const fastTrackWorkflow = getWorkflowByRoleAndTitle(role, jobTitle, 'fast_track');
  if (fastTrackWorkflow) {
    workflows.push(fastTrackWorkflow);
  }
  
  // If no workflows found, create a generic fallback workflow
  if (workflows.length === 0) {
    const genericStandard: RecruitmentWorkflow = {
      id: `standard_${role.toLowerCase().replace(' ', '_')}`,
      name: `Standard ${jobTitle} Recruitment`,
      type: 'standard',
      role,
      jobTitle,
      estimatedDuration: 14,
      description: `Standard recruitment process for ${jobTitle} positions`,
      requirements: ['Relevant experience', 'Good communication skills', 'Team fit'],
      steps: [
        {
          id: 'job_post',
          order: 1,
          title: 'Job Posting Creation',
          description: 'Create and publish job posting',
          estimatedDays: 2,
          status: 'pending',
          dependencies: [],
          deliverables: ['Job posting', 'Platform selection']
        },
        {
          id: 'resume_screening',
          order: 2,
          title: 'Resume Screening',
          description: 'Review and filter applications',
          estimatedDays: 3,
          status: 'pending',
          dependencies: ['job_post'],
          deliverables: ['Shortlisted candidates']
        },
        {
          id: 'interview',
          order: 3,
          title: 'Interview Process',
          description: 'Conduct interviews with candidates',
          estimatedDays: 5,
          status: 'pending',
          dependencies: ['resume_screening'],
          deliverables: ['Interview notes', 'Candidate assessment']
        },
        {
          id: 'reference_check',
          order: 4,
          title: 'Reference Check',
          description: 'Verify candidate references',
          estimatedDays: 2,
          status: 'pending',
          dependencies: ['interview'],
          deliverables: ['Reference verification']
        },
        {
          id: 'offer',
          order: 5,
          title: 'Offer Process',
          description: 'Present offer and negotiate terms',
          estimatedDays: 2,
          status: 'pending',
          dependencies: ['reference_check'],
          deliverables: ['Job offer', 'Contract']
        }
      ]
    };

    const genericFastTrack: RecruitmentWorkflow = {
      id: `fast_track_${role.toLowerCase().replace(' ', '_')}`,
      name: `Fast Track ${jobTitle} Recruitment`,
      type: 'fast_track',
      role,
      jobTitle,
      estimatedDuration: 7,
      description: `Accelerated recruitment process for ${jobTitle} positions`,
      requirements: ['Immediate availability', 'Strong skills', 'Quick learner'],
      steps: [
        {
          id: 'network_recruit',
          order: 1,
          title: 'Network Recruitment',
          description: 'Leverage professional networks',
          estimatedDays: 1,
          status: 'pending',
          dependencies: [],
          deliverables: ['Network outreach']
        },
        {
          id: 'quick_interview',
          order: 2,
          title: 'Quick Interview',
          description: 'Rapid assessment interview',
          estimatedDays: 2,
          status: 'pending',
          dependencies: ['network_recruit'],
          deliverables: ['Quick assessment']
        },
        {
          id: 'fast_offer',
          order: 3,
          title: 'Fast Offer',
          description: 'Immediate competitive offer',
          estimatedDays: 1,
          status: 'pending',
          dependencies: ['quick_interview'],
          deliverables: ['Competitive offer']
        },
        {
          id: 'quick_onboard',
          order: 4,
          title: 'Quick Onboarding',
          description: 'Fast-track onboarding process',
          estimatedDays: 3,
          status: 'pending',
          dependencies: ['fast_offer'],
          deliverables: ['Quick setup', 'Immediate access']
        }
      ]
    };

    workflows.push(genericStandard, genericFastTrack);
  }
  
  return workflows;
}
