// Document Status Modal Component
// filepath: admin-interface/src/components/DocumentStatusModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, FileText, Calendar, User, Tag } from 'lucide-react';

interface GeneratedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  category: string;
  framework: string;
  generatedAt: string;
  generatedBy: string;
  qualityScore: number;
  wordCount: number;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'deleted';
  deletedAt?: string;
}

interface DocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GeneratedDocument | null;
  onStatusUpdate?: (documentId: string, status: string, comments?: string) => Promise<void>;
}

export default function DocumentStatusModal({ isOpen, onClose, document, onStatusUpdate }: DocumentStatusModalProps) {
  const [newStatus, setNewStatus] = useState<GeneratedDocument['status']>('draft');
  const [comments, setComments] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form when document changes
  useEffect(() => {
    if (document) {
      setNewStatus(document.status);
      setComments('');
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deleted': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'review': return '👀';
      case 'approved': return '✅';
      case 'published': return '📢';
      case 'deleted': return '🗑️';
      default: return '📄';
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

  const handleSave = async () => {
    if (!onStatusUpdate || !document) return;

    try {
      setIsUpdating(true);
      await onStatusUpdate(document.id, newStatus, comments);
      onClose();
    } catch (error) {
      console.error('Failed to update document status:', error);
      // You could add a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setNewStatus(document.status);
    setComments('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Document Status</h2>
              <p className="text-sm text-gray-600">{document.name}</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{document.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{document.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-medium">{formatDate(document.generatedAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">By:</span>
                  <span className="font-medium">{document.generatedBy}</span>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h3>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(document.status)}`}>
                <span className="text-lg">{getStatusIcon(document.status)}</span>
                <span className="text-sm font-medium">
                  {document.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GeneratedDocument['status'])}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="review">👀 Review</option>
                    <option value="approved">✅ Approved</option>
                    <option value="published">📢 Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments about this status change..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    These comments will be recorded with the status change.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            {newStatus !== document.status && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Status Change Preview</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">Changing from:</span>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(document.status)}`}>
                    <span>{getStatusIcon(document.status)}</span>
                    <span>{document.status.toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-blue-700">to:</span>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(newStatus)}`}>
                    <span>{getStatusIcon(newStatus)}</span>
                    <span>{newStatus.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {newStatus !== document.status ? 'Status will be updated' : 'No changes to save'}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating || newStatus === document.status}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
