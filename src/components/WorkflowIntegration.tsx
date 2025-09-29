'use client';

import { useState, useEffect } from 'react';
import { Workflow, Calendar, CheckCircle, Clock, AlertTriangle, Users, Mail, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { Stakeholder } from '../types/stakeholder';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: string;
  assignee?: string;
  notes?: string;
  stakeholders: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedDuration: number; // days
}

interface WorkflowIntegrationProps {
  projectId: string;
}

export default function WorkflowIntegration({ projectId }: WorkflowIntegrationProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);

  const defaultWorkflowTemplates: WorkflowTemplate[] = [
    {
      id: 'standard_recruitment',
      name: 'Standard Recruitment Process',
      description: 'Complete recruitment workflow for stakeholder onboarding',
      estimatedDuration: 21,
      steps: [
        {
          id: 'identify_requirements',
          name: 'Identify Role Requirements',
          description: 'Define the role, responsibilities, and skills needed',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'create_placeholder',
          name: 'Create Role Placeholder',
          description: 'Set up role placeholder in the system',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'sourcing',
          name: 'Candidate Sourcing',
          description: 'Search and identify potential candidates',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'initial_contact',
          name: 'Initial Contact',
          description: 'Reach out to potential candidates',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'screening',
          name: 'Candidate Screening',
          description: 'Review applications and conduct initial screening',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'interviews',
          name: 'Interviews',
          description: 'Conduct formal interviews with candidates',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'decision',
          name: 'Selection Decision',
          description: 'Make final hiring decision',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'onboarding',
          name: 'Onboarding',
          description: 'Welcome new stakeholder and complete setup',
          status: 'pending',
          stakeholders: []
        }
      ]
    },
    {
      id: 'urgent_recruitment',
      name: 'Urgent Recruitment Process',
      description: 'Fast-track recruitment for critical roles',
      estimatedDuration: 7,
      steps: [
        {
          id: 'urgent_requirements',
          name: 'Define Urgent Requirements',
          description: 'Quickly identify critical role needs',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'immediate_sourcing',
          name: 'Immediate Sourcing',
          description: 'Rapid candidate identification',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'fast_track_interview',
          name: 'Fast-Track Interview',
          description: 'Expedited interview process',
          status: 'pending',
          stakeholders: []
        },
        {
          id: 'quick_decision',
          name: 'Quick Decision',
          description: 'Rapid selection and onboarding',
          status: 'pending',
          stakeholders: []
        }
      ]
    }
  ];

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjectStakeholders(projectId);
      
      if (response.success && response.data) {
        setStakeholders(response.data.stakeholders || []);
      }
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = (template: WorkflowTemplate) => {
    const newWorkflow = {
      ...template,
      id: `${template.id}_${Date.now()}`,
      steps: template.steps.map(step => ({
        ...step,
        id: `${step.id}_${Date.now()}`,
        stakeholders: [],
        status: 'pending' as const
      }))
    };
    
    setActiveWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setShowCreateWorkflow(false);
    toast.success('Workflow created successfully');
  };

  const updateStepStatus = (workflowId: string, stepId: string, status: WorkflowStep['status']) => {
    setActiveWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              steps: workflow.steps.map(step =>
                step.id === stepId ? { ...step, status } : step
              )
            }
          : workflow
      )
    );
    
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, status } : step
        )
      } : null);
    }
  };

  const assignStakeholderToStep = (workflowId: string, stepId: string, stakeholderId: string) => {
    setActiveWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              steps: workflow.steps.map(step =>
                step.id === stepId 
                  ? { 
                      ...step, 
                      stakeholders: step.stakeholders.includes(stakeholderId)
                        ? step.stakeholders.filter(id => id !== stakeholderId)
                        : [...step.stakeholders, stakeholderId]
                    }
                  : step
              )
            }
          : workflow
      )
    );
  };

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'skipped':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'skipped':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWorkflowProgress = (workflow: WorkflowTemplate) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Workflow className="w-5 h-5 mr-2" />
              Workflow Integration
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage recruitment workflows and track stakeholder onboarding progress
            </p>
          </div>
          <button
            onClick={() => setShowCreateWorkflow(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Workflow
          </button>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeWorkflows.map(workflow => (
          <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-semibold text-blue-600">
                  {getWorkflowProgress(workflow).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getWorkflowProgress(workflow)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                {workflow.estimatedDuration} days estimated
              </div>
              <button
                onClick={() => setSelectedWorkflow(workflow)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {activeWorkflows.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Workflow className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No active workflows</p>
            <p className="text-sm text-gray-500">Create a workflow to get started</p>
          </div>
        )}
      </div>

      {/* Workflow Templates */}
      {showCreateWorkflow && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultWorkflowTemplates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {template.steps.length} steps • {template.estimatedDuration} days
                  </span>
                  <button
                    onClick={() => createWorkflow(template)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Create
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowCreateWorkflow(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workflow Details */}
      {selectedWorkflow && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedWorkflow.name}</h3>
              <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
            </div>
            <button
              onClick={() => setSelectedWorkflow(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {selectedWorkflow.steps.map((step, index) => (
              <div key={step.id} className={`border rounded-lg p-4 ${getStepStatusColor(step.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm opacity-75 mt-1">{step.description}</p>
                      
                      {/* Step Actions */}
                      <div className="flex items-center space-x-2 mt-3">
                        <select
                          value={step.status}
                          onChange={(e) => updateStepStatus(selectedWorkflow.id, step.id, e.target.value as any)}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="skipped">Skipped</option>
                        </select>
                        
                        {step.stakeholders.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span className="text-xs">{step.stakeholders.length} assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stakeholder Assignment */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Available Stakeholders</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stakeholders.map(stakeholder => (
                <div key={stakeholder.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {stakeholder.name || 'Role Placeholder'}
                      </p>
                      <p className="text-xs text-gray-600">{stakeholder.role}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          // Assign to first pending step
                          const pendingStep = selectedWorkflow.steps.find(step => step.status === 'pending');
                          if (pendingStep) {
                            assignStakeholderToStep(selectedWorkflow.id, pendingStep.id, stakeholder.id || '');
                          }
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Assign to workflow"
                      >
                        <Workflow className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
