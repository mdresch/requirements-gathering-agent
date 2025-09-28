// Feedback Detail Modal Component
// filepath: admin-interface/src/components/FeedbackDetailModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Star, Calendar, User, FileText, MessageSquare, Lightbulb, AlertTriangle, CheckCircle, Clock, Tag, Edit3, Save, RotateCcw } from 'lucide-react';

interface FeedbackItem {
  id: string;
  title: string;
  documentType: string;
  feedbackType: string;
  rating: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-review' | 'implemented' | 'rejected' | 'closed';
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  description: string;
  suggestedImprovement?: string;
  tags?: string[];
  category?: string;
  documentPath?: string;
}

interface FeedbackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackItem | null;
  onStatusUpdate?: (feedbackId: string, status: string, reviewerComments: string) => Promise<void>;
}

export default function FeedbackDetailModal({ isOpen, onClose, feedback, onStatusUpdate }: FeedbackDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(feedback?.status || 'open');
  const [reviewerComments, setReviewerComments] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form when feedback changes
  useEffect(() => {
    if (feedback) {
      setNewStatus(feedback.status);
      setReviewerComments('');
      setIsEditing(false);
    }
  }, [feedback]);

  if (!isOpen || !feedback) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'implemented': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in-review': return <Clock className="w-4 h-4" />;
      case 'implemented': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'quality': return 'Quality';
      case 'accuracy': return 'Accuracy';
      case 'completeness': return 'Completeness';
      case 'clarity': return 'Clarity';
      case 'compliance': return 'Compliance';
      case 'suggestion': return 'Suggestion';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveStatus = async () => {
    if (!onStatusUpdate || !feedback) return;

    try {
      setIsUpdating(true);
      await onStatusUpdate(feedback.id, newStatus, reviewerComments);
      setIsEditing(false);
      setReviewerComments('');
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      // You could add a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setNewStatus(feedback.status);
    setReviewerComments('');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Feedback Details</h2>
              <p className="text-sm text-gray-600">ID: {feedback.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{feedback.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 mr-2">Rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {feedback.rating}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'open' | 'in-review' | 'implemented' | 'rejected' | 'closed')}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="in-review">In Review</option>
                    <option value="implemented">Implemented</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(feedback.status)}`}>
                  {getStatusIcon(feedback.status)}
                  <span className="text-sm font-medium">
                    {feedback.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getPriorityColor(feedback.priority)}`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {feedback.priority.toUpperCase()} PRIORITY
                </span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {getFeedbackTypeLabel(feedback.feedbackType)}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Document Type</p>
                    <p className="text-gray-900">{feedback.documentType}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Submitted By</p>
                    <p className="text-gray-900">{feedback.submittedByName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Submitted At</p>
                    <p className="text-gray-900">{formatDate(feedback.submittedAt)}</p>
                  </div>
                </div>

                {feedback.category && (
                  <div className="flex items-center space-x-3">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Category</p>
                      <p className="text-gray-900">{feedback.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Description</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {feedback.description}
                </p>
              </div>
            </div>

            {/* Reviewer Comments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Reviewer Comments</h3>
              {isEditing ? (
                <div>
                  <textarea
                    value={reviewerComments}
                    onChange={(e) => setReviewerComments(e.target.value)}
                    placeholder="Add your review comments here..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    These comments will be added to the feedback record and visible to the submitter.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {reviewerComments ? (
                    <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                      {reviewerComments}
                    </p>
                  ) : (
                    <p className="text-blue-600 italic">
                      No reviewer comments added yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Suggested Improvement */}
            {feedback.suggestedImprovement && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggested Improvement</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                      {feedback.suggestedImprovement}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {feedback.tags && feedback.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Document Path */}
            {feedback.documentPath && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Path</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <code className="text-sm text-gray-700 font-mono">
                    {feedback.documentPath}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {isEditing ? 'Editing feedback status and comments' : 'Click "Update Status" to modify feedback'}
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
