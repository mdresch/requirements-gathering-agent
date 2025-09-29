'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, UserCheck, Clock, AlertTriangle, Target, Calendar, Star, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import RolePlaceholderForm from './RolePlaceholderForm';
import RecruitmentModal from './RecruitmentModal';
import PlaceholderEditForm from './PlaceholderEditForm';
import RecruitmentWorkflowModal from './RecruitmentWorkflowModal';
import type { Stakeholder, CreateRolePlaceholderData, RecruitmentStatus } from '../types/stakeholder';
import type { RecruitmentWorkflow } from '../types/recruitment';

interface RolePlaceholderManagementProps {
  projectId: string;
  projectName: string;
}

export default function RolePlaceholderManagement({ projectId, projectName }: RolePlaceholderManagementProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [recruitmentStatus, setRecruitmentStatus] = useState<RecruitmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recruitingStakeholder, setRecruitingStakeholder] = useState<Stakeholder | null>(null);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [workflowStakeholder, setWorkflowStakeholder] = useState<Stakeholder | null>(null);
  const [filter, setFilter] = useState<'all' | 'placeholders' | 'recruited' | 'active'>('all');

  useEffect(() => {
    loadData();
  }, [projectId]);


  const loadData = async () => {
    try {
      setLoading(true);
      const [stakeholdersResponse, statusResponse] = await Promise.all([
        apiClient.getProjectStakeholders(projectId),
        apiClient.getRecruitmentStatus(projectId)
      ]);
      
      if (stakeholdersResponse.success && stakeholdersResponse.data) {
        setStakeholders(stakeholdersResponse.data.stakeholders || []);
      }
      
      if (statusResponse.success && statusResponse.data) {
        setRecruitmentStatus(statusResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaceholder = async (placeholderData: CreateRolePlaceholderData) => {
    try {
      const response = await apiClient.createRolePlaceholder(projectId, placeholderData);
      
      if (response.success) {
        toast.success('Role placeholder created successfully');
        setShowCreateModal(false);
        loadData();
      } else {
        toast.error(response.error?.message || 'Failed to create role placeholder');
      }
    } catch (error) {
      console.error('Error creating role placeholder:', error);
      toast.error('Failed to create role placeholder');
    }
  };

  const handleRecruitStakeholder = async (stakeholderId: string, recruitmentData: any) => {
    try {
      const response = await apiClient.recruitStakeholder(stakeholderId, recruitmentData);
      
      if (response.success) {
        toast.success('Stakeholder recruited successfully');
        setRecruitingStakeholder(null);
        loadData();
      } else {
        toast.error(response.error?.message || 'Failed to recruit stakeholder');
      }
    } catch (error) {
      console.error('Error recruiting stakeholder:', error);
      toast.error('Failed to recruit stakeholder');
    }
  };

  const handleUpdateStakeholder = async (updatedData: Partial<Stakeholder>) => {
    if (!editingStakeholder) return;

    try {
      const response = await apiClient.updateStakeholder(editingStakeholder.id, updatedData);
      
      if (response.success) {
        toast.success('Stakeholder updated successfully');
        setEditingStakeholder(null);
        loadData();
      } else {
        toast.error(response.error?.message || 'Failed to update stakeholder');
      }
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast.error('Failed to update stakeholder');
    }
  };

  const handleStartWorkflow = async (workflow: RecruitmentWorkflow) => {
    if (!workflowStakeholder) return;

    try {
      // Create recruitment instance with workflow
      const recruitmentInstance = {
        stakeholderId: workflowStakeholder.id,
        workflowId: workflow.id,
        role: workflowStakeholder.role,
        jobTitle: workflowStakeholder.title,
        priority: workflowStakeholder.recruitmentPriority || 'medium',
        status: 'active',
        currentStep: 0,
        startedAt: new Date().toISOString(),
        assignedRecruiter: '', // Will be set from the modal
        notes: '',
        steps: workflow.steps.map(step => ({
          stepId: step.id,
          status: 'pending' as const
        }))
      };

      // TODO: Implement API call to create recruitment instance
      // await apiClient.createRecruitmentInstance(recruitmentInstance);
      
      toast.success(`${workflow.name} started successfully`);
      setWorkflowStakeholder(null);
      loadData();
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start recruitment workflow');
    }
  };

  const getFilteredStakeholders = () => {
    if (!stakeholders || !Array.isArray(stakeholders)) {
      return [];
    }
    
    let filtered;
    switch (filter) {
      case 'placeholders':
        filtered = stakeholders.filter(s => s.status === 'placeholder');
        break;
      case 'recruited':
        filtered = stakeholders.filter(s => s.status === 'recruited');
        break;
      case 'active':
        filtered = stakeholders.filter(s => s.status === 'active');
        break;
      default:
        filtered = stakeholders.filter(s => s.status === 'placeholder' || s.status === 'recruited' || s.status === 'active');
        break;
    }
    
    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placeholder': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'recruited': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'active': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading recruitment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Placeholder Management</h2>
          <p className="text-gray-600 mt-1">Manage role placeholders and recruitment for {projectName}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Role Placeholder
        </button>
      </div>

      {/* Recruitment Status Dashboard */}
      {recruitmentStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recruitmentStatus.totalPlaceholders}</div>
            <div className="text-sm text-gray-600">Role Placeholders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{recruitmentStatus.totalRecruited}</div>
            <div className="text-sm text-gray-600">Recruited</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{recruitmentStatus.totalActive}</div>
            <div className="text-sm text-gray-600">Active Stakeholders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{recruitmentStatus.upcomingDeadlines?.length || 0}</div>
            <div className="text-sm text-gray-600">Upcoming Deadlines</div>
          </div>
        </div>
      )}

      {/* Priority Breakdown */}
      {recruitmentStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-red-600">{(Array.isArray(recruitmentStatus.byPriority?.critical) ? recruitmentStatus.byPriority.critical : []).length}</div>
                <div className="text-sm text-red-500">Critical Priority</div>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-orange-600">{(Array.isArray(recruitmentStatus.byPriority?.high) ? recruitmentStatus.byPriority.high : []).length}</div>
                <div className="text-sm text-orange-500">High Priority</div>
              </div>
              <Target className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-yellow-600">{(Array.isArray(recruitmentStatus.byPriority?.medium) ? recruitmentStatus.byPriority.medium : []).length}</div>
                <div className="text-sm text-yellow-500">Medium Priority</div>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-green-600">{(Array.isArray(recruitmentStatus.byPriority?.low) ? recruitmentStatus.byPriority.low : []).length}</div>
                <div className="text-sm text-green-500">Low Priority</div>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Roles
        </button>
        <button
          onClick={() => setFilter('placeholders')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'placeholders' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Placeholders Only
        </button>
        <button
          onClick={() => setFilter('recruited')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'recruited' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Recruited
        </button>
      </div>

      {/* Role Placeholders List */}
      <div className="space-y-4">
        {getFilteredStakeholders().length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No role placeholders found</p>
            <p className="text-sm">Create your first role placeholder to get started</p>
          </div>
        ) : (
          getFilteredStakeholders().map((stakeholder, index) => (
            <div key={stakeholder.id || index} className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(stakeholder.status || 'placeholder')}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stakeholder.name || (stakeholder.title || formatRole(stakeholder.role || 'stakeholder'))}
                      </h3>
                      {stakeholder.title && stakeholder.name && (
                        <p className="text-sm text-gray-600">{stakeholder.title}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(stakeholder.recruitmentPriority || 'low')}`}>
                      {(stakeholder.recruitmentPriority || 'low').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Role</p>
                      <p className="font-medium">{formatRole(stakeholder.role || 'stakeholder')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Recruitment Status</p>
                      <p className="font-medium capitalize">{stakeholder.recruitmentStatus || 'identified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Influence</p>
                      <p className="font-medium capitalize">{stakeholder.influence || 'medium'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Interest</p>
                      <p className="font-medium capitalize">{stakeholder.interest || 'medium'}</p>
                    </div>
                  </div>

                  {stakeholder.recruitmentDeadline && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      Deadline: {new Date(stakeholder.recruitmentDeadline).toLocaleDateString()}
                    </div>
                  )}

                  {stakeholder.roleRequirements && stakeholder.roleRequirements.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Requirements</p>
                      <div className="flex flex-wrap gap-1">
                        {(stakeholder.roleRequirements || []).slice(0, 3).map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {req}
                          </span>
                        ))}
                        {stakeholder.roleRequirements && stakeholder.roleRequirements.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{stakeholder.roleRequirements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {stakeholder.recruitmentNotes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Recruitment Notes</p>
                      <p className="text-sm text-gray-800">{stakeholder.recruitmentNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingStakeholder(stakeholder)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  {stakeholder.status === 'placeholder' && (
                    <>
                      <button
                        onClick={() => setWorkflowStakeholder(stakeholder)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Start Workflow
                      </button>
                      <button
                        onClick={() => setRecruitingStakeholder(stakeholder)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Quick Recruit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <RolePlaceholderForm
          projectId={projectId}
          onSubmit={handleCreatePlaceholder}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {recruitingStakeholder && (
        <RecruitmentModal
          stakeholder={recruitingStakeholder}
          onSubmit={(data) => handleRecruitStakeholder(recruitingStakeholder.id, data)}
          onCancel={() => setRecruitingStakeholder(null)}
        />
      )}

      {editingStakeholder && (
        <PlaceholderEditForm
          stakeholder={editingStakeholder}
          onSave={handleUpdateStakeholder}
          onCancel={() => setEditingStakeholder(null)}
          isOpen={!!editingStakeholder}
        />
      )}

      {workflowStakeholder && (
        <RecruitmentWorkflowModal
          stakeholder={workflowStakeholder}
          onStartWorkflow={handleStartWorkflow}
          onCancel={() => setWorkflowStakeholder(null)}
          isOpen={!!workflowStakeholder}
          projectId={projectId}
        />
      )}
    </div>
  );
}
