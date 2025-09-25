// Phase 2: Interactive Drill-down Features - Issue Management Modal
// Modal for creating, editing, and managing compliance issues

'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Send,
  Archive
} from 'lucide-react';

interface ComplianceIssue {
  id: string;
  projectId: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  issueType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  title: string;
  description?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'REVIEW' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IssueManagementModalProps {
  issue?: ComplianceIssue | null;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (issue: ComplianceIssue) => void;
  onDelete?: (issueId: string) => void;
}

export default function IssueManagementModal({
  issue,
  standardType,
  projectId = 'current-project',
  isOpen,
  onClose,
  onSave,
  onDelete
}: IssueManagementModalProps) {
  const [formData, setFormData] = useState<Partial<ComplianceIssue>>({
    projectId,
    standardType,
    issueType: '',
    severity: 'MEDIUM',
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: undefined,
    createdBy: 'current-user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'comments'>('details');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const isEditing = !!issue;

  useEffect(() => {
    if (issue) {
      setFormData({
        ...issue,
        dueDate: issue.dueDate ? new Date(issue.dueDate) : undefined
      });
    } else {
      setFormData({
        projectId,
        standardType,
        issueType: '',
        severity: 'MEDIUM',
        title: '',
        description: '',
        status: 'OPEN',
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: undefined,
        createdBy: 'current-user'
      });
    }
  }, [issue, standardType, projectId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.issueType?.trim()) {
        throw new Error('Issue type is required');
      }

      const issueData: ComplianceIssue = {
        id: issue?.id || `issue-${Date.now()}`,
        projectId: formData.projectId!,
        standardType: formData.standardType!,
        issueType: formData.issueType!,
        severity: formData.severity!,
        title: formData.title!,
        description: formData.description,
        status: formData.status!,
        priority: formData.priority!,
        assigneeId: formData.assigneeId,
        dueDate: formData.dueDate,
        resolvedAt: formData.status === 'RESOLVED' || formData.status === 'CLOSED' ? new Date() : undefined,
        createdBy: formData.createdBy!,
        createdAt: issue?.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Try to save via API
      try {
        const response = await fetch('/api/v1/standards/issues', {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(issueData)
        });

        if (!response.ok) {
          throw new Error('Failed to save issue');
        }
      } catch (apiError) {
        console.warn('API save failed, using local save:', apiError);
        // Continue with local save
      }

      onSave(issueData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save issue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!issue || !onDelete) return;

    if (confirm('Are you sure you want to delete this issue?')) {
      setLoading(true);
      try {
        await onDelete(issue.id);
        onClose();
      } catch (error) {
        setError('Failed to delete issue');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: `comment-${Date.now()}`,
      text: newComment,
      author: 'current-user',
      createdAt: new Date()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-red-600 bg-red-50';
      case 'ASSIGNED': return 'text-blue-600 bg-blue-50';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
      case 'REVIEW': return 'text-purple-600 bg-purple-50';
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'CLOSED': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Issue' : 'Create New Issue'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {standardType} Compliance Issue
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['details', 'history', 'comments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter issue title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type *
                  </label>
                  <input
                    type="text"
                    value={formData.issueType || ''}
                    onChange={(e) => handleInputChange('issueType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter issue type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={formData.severity || 'MEDIUM'}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                    <option value="INFORMATIONAL">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'MEDIUM'}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'OPEN'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={formData.assigneeId || ''}
                    onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter assignee ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter issue description"
                />
              </div>

              {/* Current Status Display */}
              {isEditing && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(formData.severity!)}`}>
                      {formData.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status!)}`}>
                      {formData.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      Priority: {formData.priority}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Issue History</h3>
              <div className="space-y-3">
                {[
                  { action: 'Created', user: 'system', date: issue?.createdAt || new Date(), details: 'Issue was created' },
                  { action: 'Updated', user: 'current-user', date: new Date(), details: 'Issue details were updated' }
                ].map((entry, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{entry.action}</div>
                      <div className="text-sm text-gray-600">{entry.details}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.user} • {entry.date.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Comments</h3>
              
              {/* Add Comment */}
              <div className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a comment..."
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Add Comment</span>
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                      <span className="text-sm text-gray-500">{comment.createdAt.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {isEditing && onDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Update' : 'Create'} Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
