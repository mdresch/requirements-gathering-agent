'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  Square, 
  Edit3, 
  Calendar,
  User,
  Target,
  FileText,
  ArrowRight,
  CheckCircle2,
  Circle,
  Workflow
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { RecruitmentWorkflow, WorkflowStep } from '../types/recruitment';

interface WorkflowInstance {
  id: string;
  workflowId: string;
  stakeholderId: string;
  stakeholderName: string;
  role: string;
  jobTitle: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  assignedRecruiter?: string;
  notes: string;
  budget?: number;
  deadline?: string;
  steps: WorkflowStepInstance[];
}

interface WorkflowStepInstance {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  startedAt?: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
  deliverables?: string[];
}

interface WorkflowProgressTrackerProps {
  projectId: string;
}

const WorkflowProgressTracker: React.FC<WorkflowProgressTrackerProps> = ({ projectId }) => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStepInstance | null>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [stepDeliverables, setStepDeliverables] = useState<string[]>(['']);
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, [projectId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWorkflowInstances(projectId);
      
      if (response.success) {
        setWorkflows(response.data || []);
      } else {
        console.error('Failed to load workflows:', response.error);
        // Don't show error toast for empty results, just set empty array
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflow instances');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStepStatus = async (workflowId: string, stepId: string, status: WorkflowStepInstance['status']) => {
    try {
      const response = await apiClient.updateWorkflowStep(workflowId, stepId, { status });
      
      if (response.success) {
        // Update local state
        setWorkflows(prev => prev.map(workflow => 
          workflow.id === workflowId 
            ? {
                ...workflow,
                steps: workflow.steps.map(step => 
                  step.stepId === stepId 
                    ? { 
                        ...step, 
                        status,
                        ...(status === 'in_progress' && !step.startedAt && { startedAt: new Date().toISOString() }),
                        ...(status === 'completed' && { completedAt: new Date().toISOString() })
                      }
                    : step
                )
              }
            : workflow
        ));
        
        toast.success(`Step status updated to ${status}`);
      } else {
        toast.error(response.error?.message || 'Failed to update step status');
      }
    } catch (error) {
      console.error('Error updating step status:', error);
      toast.error('Failed to update step status');
    }
  };

  const updateStepDetails = async (workflowId: string, stepId: string, updates: Partial<WorkflowStepInstance>) => {
    try {
      const response = await apiClient.updateWorkflowStep(workflowId, stepId, updates);
      
      if (response.success) {
        // Update local state
        setWorkflows(prev => prev.map(workflow => 
          workflow.id === workflowId 
            ? {
                ...workflow,
                steps: workflow.steps.map(step => 
                  step.stepId === stepId 
                    ? { ...step, ...updates }
                    : step
                )
              }
            : workflow
        ));
        
        toast.success('Step details updated');
        setEditingStep(null);
        setStepNotes('');
        setStepDeliverables(['']);
        setAssignedTo('');
      } else {
        toast.error(response.error?.message || 'Failed to update step details');
      }
    } catch (error) {
      console.error('Error updating step details:', error);
      toast.error('Failed to update step details');
    }
  };

  const getStatusIcon = (status: WorkflowStepInstance['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: WorkflowStepInstance['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 border-blue-200';
      case 'blocked':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = (workflow: WorkflowInstance) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recruitment Workflow Progress</h2>
          <p className="text-gray-600">Track and manage active recruitment workflows</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {workflows.filter(w => w.status === 'active').length} Active Workflows
          </span>
        </div>
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Workflow className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Active Workflows Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Once you start recruiting stakeholders for your project, their workflow progress will appear here. 
              You'll be able to track each step of the recruitment process in real-time.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-medium text-gray-900 mb-3">What you'll see here:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Job Posting</p>
                    <p>Track when positions are posted and where</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Resume Screening</p>
                    <p>Monitor application reviews and shortlisting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Interviews</p>
                    <p>Track phone, technical, and panel interviews</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Final Steps</p>
                    <p>Reference checks, offers, and onboarding</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                To get started, create role placeholders in the "Role Placeholders" tab and begin the recruitment process.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Cards */}
      {workflows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              {/* Workflow Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {workflow.jobTitle} - {workflow.stakeholderName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {workflow.role} • Started {formatDate(workflow.startedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workflow.priority)}`}>
                    {workflow.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage(workflow)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(workflow)}%` }}
                  ></div>
                </div>
              </div>

              {/* Workflow Details */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Assigned Recruiter</p>
                  <p className="font-medium">{workflow.assignedRecruiter || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Deadline</p>
                  <p className="font-medium">{workflow.deadline ? formatDate(workflow.deadline) : 'No deadline'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Budget</p>
                  <p className="font-medium">{workflow.budget ? `$${workflow.budget.toLocaleString()}` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Step</p>
                  <p className="font-medium">{workflow.currentStep + 1} of {workflow.steps.length}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedWorkflow(workflow)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => setSelectedWorkflow(workflow)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Update Progress
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedWorkflow.jobTitle} - Workflow Details
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedWorkflow.role} • {selectedWorkflow.stakeholderName}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {/* Workflow Steps */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Workflow Steps</h4>
                {selectedWorkflow.steps.map((step, index) => {
                  const workflowStep = selectedWorkflow.steps.find(s => s.stepId === step.stepId);
                  return (
                    <div
                      key={step.stepId}
                      className={`border rounded-lg p-4 ${getStatusColor(step.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(step.status)}
                          <div>
                            <h5 className="font-medium text-gray-900">
                              Step {index + 1}: {step.stepId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {step.assignedTo && `Assigned to: ${step.assignedTo}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={step.status}
                            onChange={(e) => updateStepStatus(selectedWorkflow.id, step.stepId, e.target.value as WorkflowStepInstance['status'])}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                          </select>
                          <button
                            onClick={() => {
                              setEditingStep(step);
                              setStepNotes(step.notes || '');
                              setStepDeliverables(step.deliverables || ['']);
                              setAssignedTo(step.assignedTo || '');
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {step.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{step.notes}</p>
                        </div>
                      )}

                      {step.deliverables && step.deliverables.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Deliverables:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {step.deliverables.map((deliverable, idx) => (
                              <li key={idx}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {step.startedAt && (
                          <span>Started: {formatDate(step.startedAt)}</span>
                        )}
                        {step.completedAt && (
                          <span>Completed: {formatDate(step.completedAt)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Edit Modal */}
      {editingStep && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Step Details</h3>
              <button
                onClick={() => setEditingStep(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter assignee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Add step notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deliverables
                </label>
                {stepDeliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => {
                        const newDeliverables = [...stepDeliverables];
                        newDeliverables[index] = e.target.value;
                        setStepDeliverables(newDeliverables);
                      }}
                      placeholder="Enter deliverable"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {stepDeliverables.length > 1 && (
                      <button
                        onClick={() => {
                          const newDeliverables = stepDeliverables.filter((_, i) => i !== index);
                          setStepDeliverables(newDeliverables);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <span>&times;</span>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setStepDeliverables([...stepDeliverables, ''])}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  + Add Deliverable
                </button>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingStep(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStepDetails(selectedWorkflow.id, editingStep.stepId, {
                    assignedTo,
                    notes: stepNotes,
                    deliverables: stepDeliverables.filter(d => d.trim() !== '')
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowProgressTracker;
