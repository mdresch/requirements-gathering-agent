export interface Stakeholder {
  id: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
