// Phase 2: Interactive Drill-down Features - Compliance Workflow Engine
// Workflow management for compliance issue resolution

'use client';

import { useState, useEffect } from 'react';
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowRight, 
  ArrowDown,
  RefreshCw,
  Filter,
  Search,
  X
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'MANUAL' | 'AUTOMATED' | 'APPROVAL' | 'NOTIFICATION';
  assigneeRole?: string;
  estimatedDuration: number; // in hours
  requiredApprovals?: number;
  conditions?: string[];
  actions?: string[];
}

interface ComplianceWorkflow {
  id: string;
  name: string;
  description: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'GENERAL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  issueId: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentStepId: string;
  startedAt: Date;
  completedAt?: Date;
  assignedTo: string;
  progress: number; // percentage
  steps: {
    stepId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
    startedAt?: Date;
    completedAt?: Date;
    assignedTo?: string;
    notes?: string;
  }[];
}

interface ComplianceWorkflowEngineProps {
  projectId?: string;
  onClose?: () => void;
}

export default function ComplianceWorkflowEngine({ 
  projectId = 'current-project',
  onClose 
}: ComplianceWorkflowEngineProps) {
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ComplianceWorkflow | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [viewMode, setViewMode] = useState<'workflows' | 'instances' | 'create'>('workflows');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStandard, setFilterStandard] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadWorkflows();
    loadInstances();
  }, [projectId]);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load real workflows from API
      const response = await fetch(`/api/v1/standards/workflows?projectId=${projectId}`);
      const result = await response.json();
      
      if (result.success && result.data?.workflows) {
        setWorkflows(result.data.workflows);
      } else {
        // Fallback to mock data
        setWorkflows(generateMockWorkflows());
      }
    } catch (error) {
      console.error('❌ Error loading workflows:', error);
      setError('Failed to load workflows');
      // Use mock data as fallback
      setWorkflows(generateMockWorkflows());
    } finally {
      setLoading(false);
    }
  };

  const loadInstances = async () => {
    try {
      // Try to load real instances from API
      const response = await fetch(`/api/v1/standards/workflow-instances?projectId=${projectId}`);
      const result = await response.json();
      
      if (result.success && result.data?.instances) {
        setInstances(result.data.instances);
      } else {
        // Fallback to mock data
        setInstances(generateMockInstances());
      }
    } catch (error) {
      console.error('❌ Error loading instances:', error);
      // Use mock data as fallback
      setInstances(generateMockInstances());
    }
  };

  const generateMockWorkflows = (): ComplianceWorkflow[] => [
    {
      id: 'workflow-1',
      name: 'Critical Issue Resolution',
      description: 'Workflow for resolving critical compliance issues',
      standardType: 'GENERAL',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      steps: [
        {
          id: 'step-1',
          name: 'Initial Assessment',
          description: 'Assess the severity and impact of the issue',
          type: 'MANUAL',
          assigneeRole: 'Compliance Manager',
          estimatedDuration: 2,
          conditions: ['Issue severity is CRITICAL'],
          actions: ['Document assessment', 'Notify stakeholders']
        },
        {
          id: 'step-2',
          name: 'Root Cause Analysis',
          description: 'Identify the root cause of the compliance issue',
          type: 'MANUAL',
          assigneeRole: 'Business Analyst',
          estimatedDuration: 4,
          conditions: ['Assessment completed'],
          actions: ['Analyze data', 'Interview stakeholders']
        },
        {
          id: 'step-3',
          name: 'Solution Design',
          description: 'Design a solution to address the root cause',
          type: 'MANUAL',
          assigneeRole: 'Solution Architect',
          estimatedDuration: 6,
          conditions: ['Root cause identified'],
          actions: ['Design solution', 'Create implementation plan']
        },
        {
          id: 'step-4',
          name: 'Approval',
          description: 'Get approval for the proposed solution',
          type: 'APPROVAL',
          assigneeRole: 'Compliance Director',
          estimatedDuration: 1,
          requiredApprovals: 1,
          conditions: ['Solution designed'],
          actions: ['Submit for approval', 'Document decision']
        },
        {
          id: 'step-5',
          name: 'Implementation',
          description: 'Implement the approved solution',
          type: 'MANUAL',
          assigneeRole: 'Implementation Team',
          estimatedDuration: 8,
          conditions: ['Solution approved'],
          actions: ['Deploy solution', 'Test implementation']
        },
        {
          id: 'step-6',
          name: 'Verification',
          description: 'Verify that the issue has been resolved',
          type: 'MANUAL',
          assigneeRole: 'Quality Assurance',
          estimatedDuration: 2,
          conditions: ['Implementation completed'],
          actions: ['Test compliance', 'Document results']
        }
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdBy: 'admin'
    },
    {
      id: 'workflow-2',
      name: 'BABOK Requirements Review',
      description: 'Workflow for reviewing BABOK requirements compliance',
      standardType: 'BABOK',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      steps: [
        {
          id: 'step-1',
          name: 'Requirements Analysis',
          description: 'Analyze requirements against BABOK standards',
          type: 'MANUAL',
          assigneeRole: 'Business Analyst',
          estimatedDuration: 3,
          conditions: ['Requirements document available'],
          actions: ['Review requirements', 'Check BABOK compliance']
        },
        {
          id: 'step-2',
          name: 'Gap Analysis',
          description: 'Identify gaps in requirements documentation',
          type: 'MANUAL',
          assigneeRole: 'Senior Business Analyst',
          estimatedDuration: 2,
          conditions: ['Analysis completed'],
          actions: ['Identify gaps', 'Document findings']
        },
        {
          id: 'step-3',
          name: 'Recommendations',
          description: 'Provide recommendations for improvement',
          type: 'MANUAL',
          assigneeRole: 'Business Analyst',
          estimatedDuration: 2,
          conditions: ['Gap analysis completed'],
          actions: ['Create recommendations', 'Prioritize actions']
        }
      ],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdBy: 'admin'
    }
  ];

  const generateMockInstances = (): WorkflowInstance[] => [
    {
      id: 'instance-1',
      workflowId: 'workflow-1',
      issueId: 'issue-123',
      status: 'RUNNING',
      currentStepId: 'step-3',
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      assignedTo: 'user-1',
      progress: 50,
      steps: [
        { stepId: 'step-1', status: 'COMPLETED', startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), assignedTo: 'user-1', notes: 'Assessment completed successfully' },
        { stepId: 'step-2', status: 'COMPLETED', startedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), assignedTo: 'user-2', notes: 'Root cause identified' },
        { stepId: 'step-3', status: 'IN_PROGRESS', startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), assignedTo: 'user-3', notes: 'Working on solution design' },
        { stepId: 'step-4', status: 'PENDING' },
        { stepId: 'step-5', status: 'PENDING' },
        { stepId: 'step-6', status: 'PENDING' }
      ]
    },
    {
      id: 'instance-2',
      workflowId: 'workflow-2',
      issueId: 'issue-456',
      status: 'COMPLETED',
      currentStepId: 'step-3',
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      assignedTo: 'user-4',
      progress: 100,
      steps: [
        { stepId: 'step-1', status: 'COMPLETED', startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), assignedTo: 'user-4', notes: 'Requirements analyzed' },
        { stepId: 'step-2', status: 'COMPLETED', startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), assignedTo: 'user-5', notes: 'Gaps identified' },
        { stepId: 'step-3', status: 'COMPLETED', startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), assignedTo: 'user-4', notes: 'Recommendations provided' }
      ]
    }
  ];

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStandard = filterStandard === 'ALL' || workflow.standardType === filterStandard;
    const matchesStatus = filterStatus === 'ALL' || workflow.status === filterStatus;
    
    return matchesSearch && matchesStandard && matchesStatus;
  });

  const filteredInstances = instances.filter(instance => {
    const workflow = workflows.find(w => w.id === instance.workflowId);
    const matchesSearch = workflow?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.issueId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStandard = filterStandard === 'ALL' || workflow?.standardType === filterStandard;
    const matchesStatus = filterStatus === 'ALL' || instance.status === filterStatus;
    
    return matchesSearch && matchesStandard && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'RUNNING': return 'text-green-600 bg-green-50';
      case 'INACTIVE': case 'PAUSED': return 'text-yellow-600 bg-yellow-50';
      case 'DRAFT': case 'PENDING': return 'text-gray-600 bg-gray-50';
      case 'COMPLETED': return 'text-blue-600 bg-blue-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'INFORMATIONAL': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'FAILED': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'SKIPPED': return <Square className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Compliance Workflow Engine
            </h2>
            <p className="text-gray-600 mt-1">
              Manage automated workflows for compliance issue resolution
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadWorkflows();
              loadInstances();
            }}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'workflows', label: 'Workflows', icon: Settings },
            { id: 'instances', label: 'Running Instances', icon: Play },
            { id: 'create', label: 'Create Workflow', icon: Plus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search workflows or instances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStandard}
            onChange={(e) => setFilterStandard(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Standards</option>
            <option value="BABOK">BABOK</option>
            <option value="PMBOK">PMBOK</option>
            <option value="DMBOK">DMBOK</option>
            <option value="ISO">ISO</option>
            <option value="GENERAL">General</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
            {viewMode === 'workflows' ? (
              <>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </>
            ) : (
              <>
                <option value="RUNNING">Running</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading workflows...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Workflows</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              loadWorkflows();
              loadInstances();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : viewMode === 'workflows' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Workflow Templates</h3>
            <button
              onClick={() => setViewMode('create')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </button>
          </div>
          
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-8">
              <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStandard !== 'ALL' || filterStatus !== 'ALL' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first workflow to get started'}
              </p>
              <button
                onClick={() => setViewMode('create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Standard:</span>
                      <span className="font-medium">{workflow.standardType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Severity:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(workflow.severity)}`}>
                        {workflow.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Steps:</span>
                      <span className="font-medium">{workflow.steps.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors">
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors">
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'instances' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Running Workflow Instances</h3>
          
          {filteredInstances.length === 0 ? (
            <div className="text-center py-8">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Running Instances</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStandard !== 'ALL' || filterStatus !== 'ALL' 
                  ? 'Try adjusting your filters' 
                  : 'No workflow instances are currently running'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstances.map((instance) => {
                const workflow = workflows.find(w => w.id === instance.workflowId);
                return (
                  <div
                    key={instance.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedInstance(instance)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{workflow?.name || 'Unknown Workflow'}</h4>
                        <p className="text-sm text-gray-600 mt-1">Issue: {instance.issueId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                          {instance.status}
                        </span>
                        <span className="text-sm text-gray-600">{instance.progress}%</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${instance.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Workflow Steps */}
                    <div className="space-y-2">
                      {instance.steps.map((step, index) => {
                        const workflowStep = workflow?.steps.find(s => s.id === step.stepId);
                        return (
                          <div key={step.stepId} className="flex items-center space-x-3">
                            {getStepStatusIcon(step.status)}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {workflowStep?.name || 'Unknown Step'}
                              </div>
                              {step.notes && (
                                <div className="text-xs text-gray-600">{step.notes}</div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {step.assignedTo || 'Unassigned'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
                      <button className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                      {instance.status === 'RUNNING' && (
                        <button className="flex items-center space-x-1 px-2 py-1 text-xs text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors">
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      )}
                      {instance.status === 'PAUSED' && (
                        <button className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors">
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : viewMode === 'create' ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Create New Workflow</h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Workflow Creation</span>
            </div>
            <p className="text-yellow-700 mt-2">
              Workflow creation functionality is coming in the next update. For now, you can view and manage existing workflows.
            </p>
          </div>
          
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Builder</h3>
            <p className="text-gray-600 mb-4">
              Create custom workflows for compliance issue resolution
            </p>
            <button
              onClick={() => setViewMode('workflows')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Workflows
            </button>
          </div>
        </div>
      ) : null}

      {/* Selected Workflow Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedWorkflow.description}</p>
              </div>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Standard</h4>
                    <p className="text-sm text-gray-600">{selectedWorkflow.standardType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Severity</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedWorkflow.severity)}`}>
                      {selectedWorkflow.severity}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkflow.status)}`}>
                      {selectedWorkflow.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Steps</h4>
                    <p className="text-sm text-gray-600">{selectedWorkflow.steps.length}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Workflow Steps</h3>
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Type: {step.type}</span>
                              <span>Duration: {step.estimatedDuration}h</span>
                              {step.assigneeRole && <span>Assignee: {step.assigneeRole}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Close
              </button>
              <button className="flex items-center space-x-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Play className="w-4 h-4" />
                <span>Start Workflow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
