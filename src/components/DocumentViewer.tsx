'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  X, 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  Eye, 
  Edit3,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  SortAsc,
  Trash2,
  MessageSquare,
  BarChart3,
  Users
} from 'lucide-react';
import { apiClient } from '../lib/api';
import DocumentStatusModal from './DocumentStatusModal';
import ShareModal from './ShareModal';
import FeedbackModal from './FeedbackModal';
import QualityReportModal from './QualityReportModal';
import BulkQualityAssessmentModal from './BulkQualityAssessmentModal';

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

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  documents: GeneratedDocument[];
  onDocumentSelect?: (document: GeneratedDocument) => void;
  selectedDocument?: GeneratedDocument | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  documents,
  onDocumentSelect,
  selectedDocument: initialSelectedDocument
}) => {
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'quality'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeletedDocuments, setShowDeletedDocuments] = useState(false);
  const [deletedDocuments, setDeletedDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<GeneratedDocument | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [documentToShare, setDocumentToShare] = useState<GeneratedDocument | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [documentToFeedback, setDocumentToFeedback] = useState<GeneratedDocument | null>(null);
  const [showQualityReportModal, setShowQualityReportModal] = useState(false);
  const [documentForQualityReport, setDocumentForQualityReport] = useState<GeneratedDocument | null>(null);
  const [showBulkAssessmentModal, setShowBulkAssessmentModal] = useState(false);

  // Load deleted documents
  useEffect(() => {
    const loadDeletedDocuments = async () => {
      try {
        const response = await apiClient.getDeletedProjectDocuments(projectId);
        
        if (response.success) {
          // Transform deleted documents to GeneratedDocument format
          const transformedDeleted = response.data.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type || 'document',
            content: doc.content || `# ${doc.name}\n\nThis document was deleted on ${new Date(doc.deletedAt).toLocaleDateString()}.`,
            category: doc.category || 'General',
            framework: doc.framework || 'general',
            generatedAt: doc.deletedAt || doc.createdAt,
            generatedBy: doc.createdBy || 'System',
            qualityScore: doc.qualityScore || 0,
            wordCount: doc.content ? doc.content.split(' ').length : 0,
            tags: doc.tags || [],
            status: 'deleted' as const,
            deletedAt: doc.deletedAt
          }));
          
          setDeletedDocuments(transformedDeleted);
        }
      } catch (error) {
        console.error('Failed to load deleted documents:', error);
      }
    };

    if (isOpen) {
      loadDeletedDocuments();
    }
  }, [isOpen, projectId]);

  // Set initial selected document when provided
  useEffect(() => {
    if (initialSelectedDocument) {
      setSelectedDocument(initialSelectedDocument);
    }
  }, [initialSelectedDocument]);

  // Filter and sort documents based on active/deleted view
  const currentDocuments = showDeletedDocuments ? deletedDocuments : documents;
  const filteredDocuments = currentDocuments
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          // For deleted documents, sort by deletedAt, otherwise by generatedAt
          const dateA = showDeletedDocuments ? new Date(a.deletedAt || a.generatedAt).getTime() : new Date(a.generatedAt).getTime();
          const dateB = showDeletedDocuments ? new Date(b.deletedAt || b.generatedAt).getTime() : new Date(b.generatedAt).getTime();
          comparison = dateA - dateB;
          break;
        case 'quality':
          comparison = a.qualityScore - b.qualityScore;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Auto-select first document when modal opens (if no initial document provided)
  useEffect(() => {
    if (isOpen && !initialSelectedDocument && filteredDocuments.length > 0 && !selectedDocument) {
      // Immediately select the first document without loading delay
      setSelectedDocument(filteredDocuments[0]);
    }
  }, [isOpen, initialSelectedDocument, filteredDocuments, selectedDocument]);

  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category)))];

  const handleDocumentSelect = (document: GeneratedDocument) => {
    // Immediately select the document without loading delay
    setSelectedDocument(document);
    if (onDocumentSelect) {
      onDocumentSelect(document);
    }
  };

  const handleEditDocument = (document: GeneratedDocument) => {
    setDocumentToEdit(document);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setDocumentToEdit(null);
  };

  const handleStatusUpdate = async (documentId: string, status: string, comments?: string) => {
    try {
      // TODO: Implement API call to update document status
      console.log('Updating document status:', { documentId, status, comments });
      
      // For now, just update the local state
      setSelectedDocument(prev => 
        prev && prev.id === documentId 
          ? { ...prev, status: status as GeneratedDocument['status'] }
          : prev
      );

      // Update in the documents list
      // This would need to be passed up to the parent component in a real implementation
      
      toast.success('Document status updated successfully');
    } catch (error) {
      console.error('Failed to update document status:', error);
      toast.error('Failed to update document status');
      throw error;
    }
  };

  const handleDownload = (doc: GeneratedDocument) => {
    const element = document.createElement('a');
    const file = new Blob([doc.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.name}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteDocument = async (doc: GeneratedDocument) => {
    const confirmed = window.confirm(
      `Are you sure you want to move "${doc.name}" to trash?\n\nYou can restore it later from the deleted documents section.`
    );
    
    if (!confirmed) return;
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Moving document to trash...');
      
      const response = await apiClient.deleteProjectDocument(doc.id);
      
      if (response.success) {
        toast.dismiss(loadingToast);
        // Show success message with undo option
        const undoToast = toast.success(
          <div className="flex items-center justify-between">
            <span>"{doc.name}" moved to trash!</span>
            <button
              onClick={() => {
                toast.dismiss(undoToast);
                handleRestoreDocument(doc.id, doc.name);
              }}
              className="ml-3 px-2 py-1 text-xs bg-white text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
            >
              Undo
            </button>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
          }
        );
        
        // Update the document list by removing the deleted document
        // The parent component should handle refreshing the documents
        // For now, we'll trigger a custom event that the parent can listen to
        window.dispatchEvent(new CustomEvent('documentDeleted', { 
          detail: { documentId: doc.id, documentName: doc.name } 
        }));
      } else {
        throw new Error(response.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.dismiss();
      toast.error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRestoreDocument = async (documentId: string, documentName: string) => {
    try {
      const loadingToast = toast.loading('Restoring document...');
      
      const response = await apiClient.restoreProjectDocument(documentId);
      
      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success(`"${documentName}" restored successfully!`, {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500'
          }
        });
        
        // Update the document list by triggering a refresh event
        window.dispatchEvent(new CustomEvent('documentRestored', { 
          detail: { documentId, documentName } 
        }));
      } else {
        throw new Error(response.message || 'Failed to restore document');
      }
    } catch (error) {
      console.error('Error restoring document:', error);
      toast.dismiss();
      toast.error(`Failed to restore document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleShareDocument = (doc: GeneratedDocument) => {
    setDocumentToShare(doc);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setDocumentToShare(null);
  };

  const handleFeedbackDocument = (doc: GeneratedDocument) => {
    setDocumentToFeedback(doc);
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setDocumentToFeedback(null);
  };

  const handleSubmitFeedback = async (feedbackData: any) => {
    try {
      console.log('Submitting feedback:', feedbackData);
      
      const response = await apiClient.submitFeedback(feedbackData);
      
      if (response.success) {
        console.log('Feedback submitted successfully:', response.data);
        toast.success('Feedback submitted successfully!', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500'
          }
        });
        
        // Close the modal
        handleCloseFeedbackModal();
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(`Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleQualityReport = (doc: GeneratedDocument) => {
    setDocumentForQualityReport(doc);
    setShowQualityReportModal(true);
  };

  const handleCloseQualityReportModal = () => {
    setShowQualityReportModal(false);
    setDocumentForQualityReport(null);
  };

  const handleBulkAssessment = () => {
    setShowBulkAssessmentModal(true);
  };

  const handleCloseBulkAssessmentModal = () => {
    setShowBulkAssessmentModal(false);
  };

  const handleAssessmentComplete = (result: any) => {
    console.log('Bulk assessment completed:', result);
    // You could trigger a document list refresh here if needed
    // or show a success toast
  };

  const handlePrint = (doc: GeneratedDocument) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${doc.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1, h2, h3 { color: #333; }
              .header { border-bottom: 2px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
              .meta { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${doc.name}</h1>
              <p><strong>Project:</strong> ${projectName}</p>
              <p><strong>Generated:</strong> ${new Date(doc.generatedAt).toLocaleDateString()}</p>
            </div>
            <div class="meta">
              <p><strong>Category:</strong> ${doc.category}</p>
              <p><strong>Framework:</strong> ${doc.framework.toUpperCase()}</p>
              <p><strong>Quality Score:</strong> ${doc.qualityScore}%</p>
              <p><strong>Word Count:</strong> ${doc.wordCount}</p>
            </div>
            <div class="content">${doc.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generated Documents</h2>
              <p className="text-gray-600 mt-1">Project: <span className="font-medium">{projectName}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkAssessment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm"
                title="Assess Quality for All Documents"
              >
                <Users className="w-4 h-4" />
                <span>Assess All Quality</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setShowDeletedDocuments(false);
                setSelectedDocument(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showDeletedDocuments
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Active Documents ({documents.length})
            </button>
            <button
              onClick={() => {
                setShowDeletedDocuments(true);
                setSelectedDocument(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showDeletedDocuments
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Deleted Documents ({deletedDocuments.length})
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar - Document List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2 mb-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as any);
                    setSortOrder(order as any);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="quality-desc">Quality High-Low</option>
                  <option value="quality-asc">Quality Low-High</option>
                </select>
              </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto">
              {filteredDocuments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No documents found</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredDocuments.map((document, index) => (
                    <div
                      key={`${document.id}-${index}`}
                      onClick={() => handleDocumentSelect(document)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedDocument?.id === document.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{document.category}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(document.status)}`}>
                              {document.status}
                            </span>
                            <span className={`text-xs font-medium ${getQualityColor(document.qualityScore)}`}>
                              {document.qualityScore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex items-center space-x-2">
                            {showDeletedDocuments ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent document selection
                                  handleRestoreDocument(document.id, document.name);
                                }}
                                className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                title="Restore Document"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent document selection
                                  handleDeleteDocument(document);
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {showDeletedDocuments && document.deletedAt 
                              ? `Deleted: ${new Date(document.deletedAt).toLocaleDateString()}`
                              : `Generated: ${new Date(document.generatedAt).toLocaleDateString()}`
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {document.wordCount} words
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Document Preview */}
          <div className="flex-1 flex flex-col">
            {selectedDocument ? (
              <>
                {/* Document Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{selectedDocument.name}</h1>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>Category: {selectedDocument.category}</span>
                        <span>Framework: {selectedDocument.framework.toUpperCase()}</span>
                        <span>Generated: {new Date(selectedDocument.generatedAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Quality Score:</span>
                          <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            selectedDocument.qualityScore >= 90 ? 'bg-green-100 text-green-800' :
                            selectedDocument.qualityScore >= 80 ? 'bg-blue-100 text-blue-800' :
                            selectedDocument.qualityScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            selectedDocument.qualityScore >= 60 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedDocument.qualityScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDocument(selectedDocument)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Document Status"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleQualityReport(selectedDocument)}
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Quality Report"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleFeedbackDocument(selectedDocument)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Review Feedback"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrint(selectedDocument)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Print Document"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(selectedDocument)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShareDocument(selectedDocument)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Share Document"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(selectedDocument)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    {/* Document Metadata */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Quality Score:</span>
                          <span className={`ml-2 font-medium ${getQualityColor(selectedDocument.qualityScore)}`}>
                            {selectedDocument.qualityScore}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Word Count:</span>
                          <span className="ml-2 font-medium">{selectedDocument.wordCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedDocument.status)}`}>
                            {selectedDocument.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Generated By:</span>
                          <span className="ml-2 font-medium">{selectedDocument.generatedBy}</span>
                        </div>
                      </div>
                      {selectedDocument.tags.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedDocument.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Content */}
                    <div className="prose max-w-none">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-600 text-sm">Loading document content...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                          {selectedDocument.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Document</h3>
                  <p className="text-gray-600">Choose a document from the list to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Status Modal */}
        <DocumentStatusModal
          isOpen={showStatusModal}
          onClose={handleCloseStatusModal}
          document={documentToEdit}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          document={documentToShare}
          projectName={projectName}
          projectId={projectId}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleCloseFeedbackModal}
          onSubmit={handleSubmitFeedback}
          projectId={projectId}
          documentType={documentToFeedback?.type || ''}
          documentPath={documentToFeedback?.id || ''}
          documentTitle={documentToFeedback?.name || ''}
        />

        {/* Quality Report Modal */}
        <QualityReportModal
          isOpen={showQualityReportModal}
          onClose={handleCloseQualityReportModal}
          documentId={documentForQualityReport?.id || ''}
          documentName={documentForQualityReport?.name || ''}
          documentType={documentForQualityReport?.type || ''}
        />

        {/* Bulk Quality Assessment Modal */}
        <BulkQualityAssessmentModal
          isOpen={showBulkAssessmentModal}
          onClose={handleCloseBulkAssessmentModal}
          projectId={projectId}
          projectName={projectName}
          onAssessmentComplete={handleAssessmentComplete}
        />
      </div>
    </div>
  );
};

export default DocumentViewer;
