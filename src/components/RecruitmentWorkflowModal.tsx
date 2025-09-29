'use client';

import React, { useState } from 'react';
import { X, Clock, Zap, Users, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { Stakeholder } from '@/types/stakeholder';
import { RecruitmentWorkflow, getAvailableWorkflows } from '@/types/recruitment';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface RecruitmentWorkflowModalProps {
  stakeholder: Stakeholder;
  onStartWorkflow: (workflow: RecruitmentWorkflow) => void;
  onCancel: () => void;
  isOpen: boolean;
  projectId: string;
}

const RecruitmentWorkflowModal: React.FC<RecruitmentWorkflowModalProps> = ({
  stakeholder,
  onStartWorkflow,
  onCancel,
  isOpen,
  projectId
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<RecruitmentWorkflow | null>(null);
  const [assignedRecruiter, setAssignedRecruiter] = useState('');
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const availableWorkflows = getAvailableWorkflows(stakeholder.role || 'stakeholder', stakeholder.title || 'Stakeholder');
  
  // Debug logging
  console.log('RecruitmentWorkflowModal Debug:', {
    stakeholderRole: stakeholder.role,
    stakeholderTitle: stakeholder.title,
    availableWorkflows: availableWorkflows.length,
    workflows: availableWorkflows.map(w => ({ id: w.id, name: w.name, type: w.type }))
  });

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getWorkflowIcon = (type: string) => {
    return type === 'fast_track' ? 
      <Zap className="w-6 h-6 text-orange-500" /> : 
      <Clock className="w-6 h-6 text-blue-500" />;
  };

  const getWorkflowColor = (type: string) => {
    return type === 'fast_track' ? 
      'border-orange-200 bg-orange-50' : 
      'border-blue-200 bg-blue-50';
  };

  const getWorkflowButtonColor = (type: string) => {
    return type === 'fast_track' ? 
      'bg-orange-600 hover:bg-orange-700' : 
      'bg-blue-600 hover:bg-blue-700';
  };

  const handleStartWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      // Create workflow instance
      const workflowInstance = {
        workflowId: selectedWorkflow.id,
        stakeholderId: stakeholder.id,
        projectId: projectId,
        role: stakeholder.role,
        jobTitle: stakeholder.title || selectedWorkflow.jobTitle,
        priority: stakeholder.recruitmentPriority || 'medium',
        status: 'active',
        currentStep: 0,
        startedAt: new Date().toISOString(),
        assignedRecruiter: assignedRecruiter || undefined,
        notes: notes,
        budget: budget ? parseFloat(budget) : undefined,
        deadline: deadline || undefined,
        steps: selectedWorkflow.steps.map(step => ({
          stepId: step.id,
          status: 'pending' as const,
          assignedTo: step.assignedTo || assignedRecruiter || undefined,
          notes: step.notes || undefined,
          deliverables: step.deliverables || []
        }))
      };

      const response = await apiClient.createWorkflowInstance(workflowInstance);
      
      if (response.success) {
        toast.success(`${selectedWorkflow.name} started successfully`);
        onStartWorkflow(selectedWorkflow);
      } else {
        toast.error(response.error?.message || 'Failed to start workflow');
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start recruitment workflow');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Start Recruitment Workflow
              </h2>
              <p className="text-sm text-gray-600">
                {stakeholder.title || formatRole(stakeholder.role || 'stakeholder')} • {formatRole(stakeholder.role || 'stakeholder')}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stakeholder Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Role Placeholder Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Job Title</p>
                <p className="font-medium">{stakeholder.title || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium">{formatRole(stakeholder.role || 'stakeholder')}</p>
              </div>
              <div>
                <p className="text-gray-600">Priority</p>
                <p className="font-medium capitalize">{stakeholder.recruitmentPriority || 'medium'}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">{stakeholder.recruitmentStatus || 'identified'}</p>
              </div>
            </div>
          </div>

          {/* Workflow Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Recruitment Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedWorkflow?.id === workflow.id
                      ? 'border-blue-500 bg-blue-50'
                      : getWorkflowColor(workflow.type)
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getWorkflowIcon(workflow.type)}
                      <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                    </div>
                    {selectedWorkflow?.id === workflow.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{workflow.estimatedDuration} days</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{workflow.steps.length} steps</span>
                    </div>
                  </div>

                  {/* Workflow Steps Preview */}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Workflow Steps:</p>
                    <div className="space-y-1">
                      {workflow.steps.slice(0, 3).map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2 text-xs text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs">{step.order}</span>
                          </div>
                          <span className="truncate">{step.title}</span>
                        </div>
                      ))}
                      {workflow.steps.length > 3 && (
                        <div className="text-xs text-gray-500 pl-6">
                          +{workflow.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Configuration */}
          {selectedWorkflow && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Workflow Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Recruiter
                  </label>
                  <input
                    type="text"
                    value={assignedRecruiter}
                    onChange={(e) => setAssignedRecruiter(e.target.value)}
                    placeholder="Enter recruiter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (Optional)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter budget amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any specific notes or requirements..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartWorkflow}
              disabled={!selectedWorkflow}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                selectedWorkflow ? getWorkflowButtonColor(selectedWorkflow.type) : 'bg-gray-400'
              }`}
            >
              <span>Start {selectedWorkflow?.type === 'fast_track' ? 'Fast Track' : 'Standard'} Workflow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentWorkflowModal;
