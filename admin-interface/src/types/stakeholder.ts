export interface Stakeholder {
  id: string;
  projectId: string;
  
  // Core identification (optional for role placeholders)
  name?: string | null;
  title?: string | null;
  role: 'project_manager' | 'sponsor' | 'team_member' | 'end_user' | 'stakeholder';
  
  // Contact info (optional for role placeholders)
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  
  // Status and recruitment tracking
  status: 'active' | 'inactive' | 'placeholder' | 'recruited';
  recruitmentStatus: 'identified' | 'contacted' | 'recruited' | 'declined';
  recruitmentPriority: 'low' | 'medium' | 'high' | 'critical';
  recruitmentDeadline?: string | null;
  recruitmentNotes?: string | null;
  
  // Role-specific data
  roleRequirements: string[];
  roleResponsibilities: string[];
  roleSkills: string[];
  roleExperience: string;
  
  // Analysis data
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high';
  powerLevel: number;
  engagementLevel: number;
  
  // Communication and preferences
  communicationPreference: 'email' | 'phone' | 'meeting' | 'portal';
  requirements: string[];
  concerns: string[];
  expectations: string[];
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface CreateStakeholderData {
  name: string;
  title: string;
  role: 'project_manager' | 'sponsor' | 'team_member' | 'end_user' | 'stakeholder';
  email?: string;
  phone?: string;
  department?: string;
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high';
  powerLevel: number;
  engagementLevel: number;
  communicationPreference: 'email' | 'phone' | 'meeting' | 'portal';
  requirements: string[];
  concerns: string[];
  expectations: string[];
  notes?: string;
}

export interface CreateRolePlaceholderData {
  role: 'project_manager' | 'sponsor' | 'team_member' | 'end_user' | 'stakeholder';
  recruitmentPriority: 'low' | 'medium' | 'high' | 'critical';
  roleRequirements: string[];
  roleResponsibilities: string[];
  roleSkills: string[];
  roleExperience: string;
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high';
  recruitmentDeadline?: string;
  recruitmentNotes?: string;
}

export interface RecruitStakeholderData {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  department?: string;
  powerLevel: number;
  engagementLevel: number;
  requirements: string[];
  concerns: string[];
  expectations: string[];
  notes?: string;
}

export interface RecruitmentStatus {
  totalPlaceholders: number;
  totalRecruited: number;
  totalActive: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    identified: number;
    contacted: number;
    recruited: number;
    declined: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    role: string;
    deadline: string;
    priority: string;
  }>;
}
