export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'review' | 'completed' | 'archived';
  framework?: 'babok' | 'pmbok' | 'multi';
  complianceScore?: number;
  documents?: number;
  stakeholders?: number;
  owner?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  // Scope control fields
  scopeControlEnabled?: boolean;
  scopeRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
}
