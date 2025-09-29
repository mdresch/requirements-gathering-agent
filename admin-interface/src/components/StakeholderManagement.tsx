'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Mail, Phone, Building, Star, AlertTriangle, CheckCircle, Clock, Target, BarChart3, Activity, FileText, Workflow, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import StakeholderForm from './StakeholderForm';
import RolePlaceholderManagement from './RolePlaceholderManagement';
import RecruitmentAnalytics from './RecruitmentAnalytics';
import RecruitmentTimeline from './RecruitmentTimeline';
import RecruitmentMetrics from './RecruitmentMetrics';
import AdvancedReporting from './AdvancedReporting';
import WorkflowIntegration from './WorkflowIntegration';
import NotificationSystem from './NotificationSystem';
import WorkflowProgressTracker from './WorkflowProgressTracker';
import type { Stakeholder, CreateStakeholderData } from '../types/stakeholder';

interface StakeholderManagementProps {
  projectId: string;
  projectName: string;
}

export default function StakeholderManagement({ projectId, projectName }: StakeholderManagementProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'stakeholders' | 'placeholders' | 'analytics' | 'reporting' | 'workflow' | 'notifications' | 'progress'>('stakeholders');

  useEffect(() => {
    loadStakeholders();
  }, [projectId]);

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjectStakeholders(projectId);
      
      if (response.success && response.data) {
        setStakeholders(response.data.stakeholders || []);
      } else {
        toast.error('Failed to load stakeholders');
      }
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStakeholder = async (stakeholderId: string, stakeholderName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${stakeholderName}"?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteStakeholder(stakeholderId);
      
      if (response.success) {
        toast.success(`Deleted ${stakeholderName}`);
        loadStakeholders();
      } else {
        toast.error('Failed to delete stakeholder');
      }
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error('Failed to delete stakeholder');
    }
  };

  const handleSaveStakeholder = (stakeholder: CreateStakeholderData) => {
    loadStakeholders(); // Refresh the list
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'project_manager': return <UserCheck className="w-4 h-4" />;
      case 'sponsor': return <Star className="w-4 h-4" />;
      case 'team_member': return <Users className="w-4 h-4" />;
      case 'end_user': return <UserX className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'project_manager': return 'bg-blue-100 text-blue-800';
      case 'sponsor': return 'bg-purple-100 text-purple-800';
      case 'team_member': return 'bg-green-100 text-green-800';
      case 'end_user': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const statusMatch = filter === 'all' || (filter === 'active' ? stakeholder.status === 'active' : stakeholder.status !== 'active');
    const roleMatch = roleFilter === 'all' || stakeholder.role === roleFilter;
    return statusMatch && roleMatch;
  });

  const groupedStakeholders = {
    project_manager: filteredStakeholders.filter(s => s.role === 'project_manager'),
    sponsors: filteredStakeholders.filter(s => s.role === 'sponsor'),
    team_members: filteredStakeholders.filter(s => s.role === 'team_member'),
    end_users: filteredStakeholders.filter(s => s.role === 'end_user'),
    stakeholders: filteredStakeholders.filter(s => s.role === 'stakeholder')
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading stakeholders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Stakeholder Management</h2>
              <p className="text-sm text-gray-500">Manage project stakeholders and team members</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stakeholder</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('stakeholders')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'stakeholders' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Active Stakeholders
          </button>
          <button
            onClick={() => setActiveTab('placeholders')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'placeholders' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Target className="w-4 h-4 mr-2" />
            Role Placeholders
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'progress' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Workflow Progress
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('reporting')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'reporting' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Reporting
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'workflow' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Workflow className="w-4 h-4 mr-2" />
            Workflow
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
        </div>
      </div>

      {/* Filters - Only show for stakeholders tab */}
      {activeTab === 'stakeholders' && (
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="project_manager">Project Manager</option>
                <option value="sponsor">Sponsor</option>
                <option value="team_member">Team Member</option>
                <option value="end_user">End User</option>
                <option value="stakeholder">Stakeholder</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredStakeholders.length} of {stakeholders.length} stakeholders
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'stakeholders' ? (
          stakeholders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stakeholders yet</h3>
              <p className="text-gray-500 mb-4">Add project stakeholders to get started with stakeholder management.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Stakeholder
              </button>
            </div>
          ) : (
            <div className="space-y-8">
            {/* Project Manager */}
            {groupedStakeholders.project_manager.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                  Project Manager ({groupedStakeholders.project_manager.length})
                </h3>
                <div className="grid gap-4">
                  {groupedStakeholders.project_manager.map((stakeholder) => (
                    <StakeholderCard 
                      key={stakeholder.id} 
                      stakeholder={stakeholder} 
                      onEdit={setEditingStakeholder}
                      onDelete={handleDeleteStakeholder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sponsors */}
            {groupedStakeholders.sponsors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-purple-600" />
                  Sponsors ({groupedStakeholders.sponsors.length})
                </h3>
                <div className="grid gap-4">
                  {groupedStakeholders.sponsors.map((stakeholder) => (
                    <StakeholderCard 
                      key={stakeholder.id} 
                      stakeholder={stakeholder} 
                      onEdit={setEditingStakeholder}
                      onDelete={handleDeleteStakeholder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            {groupedStakeholders.team_members.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Team Members ({groupedStakeholders.team_members.length})
                </h3>
                <div className="grid gap-4">
                  {groupedStakeholders.team_members.map((stakeholder) => (
                    <StakeholderCard 
                      key={stakeholder.id} 
                      stakeholder={stakeholder} 
                      onEdit={setEditingStakeholder}
                      onDelete={handleDeleteStakeholder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* End Users */}
            {groupedStakeholders.end_users.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserX className="w-5 h-5 mr-2 text-orange-600" />
                  End Users ({groupedStakeholders.end_users.length})
                </h3>
                <div className="grid gap-4">
                  {groupedStakeholders.end_users.map((stakeholder) => (
                    <StakeholderCard 
                      key={stakeholder.id} 
                      stakeholder={stakeholder} 
                      onEdit={setEditingStakeholder}
                      onDelete={handleDeleteStakeholder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Stakeholders */}
            {groupedStakeholders.stakeholders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-600" />
                  Other Stakeholders ({groupedStakeholders.stakeholders.length})
                </h3>
                <div className="grid gap-4">
                  {groupedStakeholders.stakeholders.map((stakeholder) => (
                    <StakeholderCard 
                      key={stakeholder.id} 
                      stakeholder={stakeholder} 
                      onEdit={setEditingStakeholder}
                      onDelete={handleDeleteStakeholder}
                    />
                  ))}
                </div>
              </div>
            )}
            </div>
          )
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            <RecruitmentAnalytics 
              projectId={projectId} 
              projectName={projectName} 
            />
            <RecruitmentTimeline 
              projectId={projectId} 
            />
            <RecruitmentMetrics 
              projectId={projectId} 
              projectName={projectName} 
            />
          </div>
        ) : activeTab === 'reporting' ? (
          <AdvancedReporting 
            projectId={projectId} 
          />
        ) : activeTab === 'workflow' ? (
          <WorkflowIntegration 
            projectId={projectId} 
          />
        ) : activeTab === 'notifications' ? (
          <NotificationSystem 
            projectId={projectId} 
          />
        ) : activeTab === 'progress' ? (
          <WorkflowProgressTracker 
            projectId={projectId} 
          />
        ) : (
          <RolePlaceholderManagement 
            projectId={projectId} 
            projectName={projectName} 
          />
        )}
      </div>

      {/* Stakeholder Form Modal */}
      <StakeholderForm
        isOpen={showCreateModal || !!editingStakeholder}
        onClose={() => {
          setShowCreateModal(false);
          setEditingStakeholder(null);
        }}
        projectId={projectId}
        stakeholder={editingStakeholder}
        onSave={handleSaveStakeholder}
      />
    </div>
  );
}

// Stakeholder Card Component
function StakeholderCard({ 
  stakeholder, 
  onEdit, 
  onDelete 
}: { 
  stakeholder: Stakeholder; 
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'project_manager': return <UserCheck className="w-4 h-4" />;
      case 'sponsor': return <Star className="w-4 h-4" />;
      case 'team_member': return <Users className="w-4 h-4" />;
      case 'end_user': return <UserX className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'project_manager': return 'bg-blue-100 text-blue-800';
      case 'sponsor': return 'bg-purple-100 text-purple-800';
      case 'team_member': return 'bg-green-100 text-green-800';
      case 'end_user': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-medium text-gray-900">{stakeholder.name}</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(stakeholder.role)}`}>
              {getRoleIcon(stakeholder.role)}
              <span className="ml-1 capitalize">{stakeholder.role.replace('_', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInfluenceColor(stakeholder.influence)}`}>
              {stakeholder.influence} influence
            </span>
            {stakeholder.status === 'active' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <UserX className="w-4 h-4 text-gray-400" />
            )}
          </div>
          
          <p className="text-gray-600 mb-2">{stakeholder.title}</p>
          
          {stakeholder.department && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Building className="w-4 h-4 mr-1" />
              {stakeholder.department}
            </div>
          )}
          
          {stakeholder.email && (
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Mail className="w-4 h-4 mr-1" />
              {stakeholder.email}
            </div>
          )}
          
          {stakeholder.phone && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Phone className="w-4 h-4 mr-1" />
              {stakeholder.phone}
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Power: {stakeholder.powerLevel || 0}/5</span>
            <span>Engagement: {stakeholder.engagementLevel || 0}/5</span>
            <span>Interest: {stakeholder.interest || 'medium'}</span>
          </div>

          {stakeholder.requirements && stakeholder.requirements.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
              <div className="flex flex-wrap gap-1">
                {stakeholder.requirements.slice(0, 3).map((req, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {req.length > 30 ? `${req.substring(0, 30)}...` : req}
                  </span>
                ))}
                {stakeholder.requirements.length > 3 && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    +{stakeholder.requirements.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(stakeholder)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit stakeholder"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(stakeholder.id, stakeholder.name || 'Unknown')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete stakeholder"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
