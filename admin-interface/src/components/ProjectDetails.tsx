'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  MessageSquare, 
  Plus, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import type { Project } from '../types/project';
import FeedbackModal from './FeedbackModal';
import FeedbackDashboard from './FeedbackDashboard';
import DocumentGenerationModal from './DocumentGenerationModal';
import DocumentViewer from './DocumentViewer';
import EditProjectModal from './EditProjectModal';
import { apiClient } from '../lib/api';

interface ProjectDetailsProps {
  project?: Project;
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  path: string;
  category: string;
  lastGenerated: string;
  qualityScore: number;
  feedbackCount: number;
  averageRating: number;
}

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
  status: 'draft' | 'review' | 'approved' | 'published';
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project: initialProject }) => {
  const [project, setProject] = useState<Project | null>(initialProject || null);
  
  // Debug logging
  console.log('ProjectDetails: Initial project received:', initialProject);
  console.log('ProjectDetails: Current project state:', project);
  
  // Ensure project state is updated when initialProject changes
  useEffect(() => {
    if (initialProject) {
      console.log('ProjectDetails: Updating project state with initialProject:', initialProject);
      setProject(initialProject);
    } else {
      console.log('ProjectDetails: No initialProject provided, attempting to fetch project data');
      // Fallback: if no initial project data, try to fetch it
      const fetchProject = async () => {
        try {
          // Get project ID from URL or props
          const projectId = (initialProject as Project | undefined)?.id || window.location.pathname.split('/').pop();
          if (projectId) {
            console.log('ProjectDetails: Fetching project data for ID:', projectId);
            const projectData = await apiClient.getProjectById(projectId);
            if (projectData) {
              console.log('ProjectDetails: Fetched project data:', projectData);
              setProject(projectData);
            }
          }
        } catch (error) {
          console.error('ProjectDetails: Failed to fetch project data:', error);
        }
      };
      fetchProject();
    }
  }, [initialProject]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'feedback'>('overview');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDocumentGenerationModal, setShowDocumentGenerationModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);

  // Load feedback data for the project
  const loadFeedbackData = useCallback(async () => {
    if (!project?.id) return;
    
    try {
      console.log('Loading feedback data for project:', project.id);
      const response = await apiClient.getProjectFeedback(project.id);
      
      console.log('Raw feedback response in loadFeedbackData:', response);
      
      if (response.success && response.data) {
        setFeedbackData(response.data);
        console.log('Loaded feedback data:', response.data);
      } else {
        console.warn('No feedback data found for project, response:', response);
        setFeedbackData([]);
      }
    } catch (error) {
      console.error('Failed to load feedback data:', error);
      setFeedbackData([]);
    }
  }, [project?.id]);

  // Calculate document ratings from feedback
  const calculateDocumentRatings = useCallback((documents: DocumentItem[], feedback: any[]) => {
    console.log('Calculating document ratings:', { documents, feedback });
    
    return documents.map(doc => {
      // More flexible matching logic
      const docFeedback = feedback.filter(f => {
        // Match by document type
        if (f.documentType === doc.type) return true;
        
        // Match by document path
        if (f.documentPath === doc.path) return true;
        
        // Match by document title/name (case insensitive)
        if (f.documentTitle && f.documentTitle.toLowerCase() === doc.name.toLowerCase()) return true;
        
        // Match by document name in path
        if (f.documentPath && f.documentPath.includes(doc.name.toLowerCase().replace(/\s+/g, '-'))) return true;
        
        return false;
      });
      
      console.log(`Document "${doc.name}" matched ${docFeedback.length} feedback items:`, docFeedback);
      
      const feedbackCount = docFeedback.length;
      const averageRating = feedbackCount > 0 
        ? docFeedback.reduce((sum, f) => sum + f.rating, 0) / feedbackCount
        : 0;
      
      return {
        ...doc,
        feedbackCount,
        averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
      };
    });
  }, []);

  // Load real documents from database
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        if (!project) return;
        console.log('Loading documents for project:', project.id);
        if (!project) return;
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
        console.log('Loaded project documents:', projectDocuments);
        
        // Convert ProjectDocument format to DocumentItem format
        const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category,
          lastGenerated: doc.lastModified,
          qualityScore: doc.qualityScore,
          feedbackCount: 0, // Will be calculated from feedback data
          averageRating: 0  // Will be calculated from feedback data
        }));
        
        // Calculate ratings from feedback data
        const documentsWithRatings = calculateDocumentRatings(documentItems, feedbackData);
        setDocuments(documentsWithRatings);
        console.log('Converted documents:', documentItems);
      } catch (error) {
        console.error('Failed to load project documents:', error);
        // Keep empty array on error
        setDocuments([]);
      }
    };
    
    if (project?.id) {
      loadDocuments();
    }
  }, [project?.id, calculateDocumentRatings]);

  // Load feedback data when project changes
  useEffect(() => {
    loadFeedbackData();
  }, [loadFeedbackData]);

  // Listen for document deletion/restoration events from DocumentViewer
  useEffect(() => {
    const handleDocumentDeleted = () => {
      console.log('Document deleted event received, refreshing documents...');
      // Reload documents from database
      const loadDocuments = async () => {
        try {
          if (!project) return;
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
          const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category,
            lastGenerated: doc.lastModified,
            qualityScore: doc.qualityScore,
            feedbackCount: 0,
            averageRating: 0
          }));
          setDocuments(documentItems);
        } catch (error) {
          console.error('Failed to reload documents after deletion:', error);
        }
      };
      loadDocuments();
    };

    const handleDocumentRestored = () => {
      console.log('Document restored event received, refreshing documents...');
      // Reload documents from database
      const loadDocuments = async () => {
        try {
          if (!project) return;
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
          const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category,
            lastGenerated: doc.lastModified,
            qualityScore: doc.qualityScore,
            feedbackCount: 0,
            averageRating: 0
          }));
          setDocuments(documentItems);
        } catch (error) {
          console.error('Failed to reload documents after restoration:', error);
        }
      };
      loadDocuments();
    };

    window.addEventListener('documentDeleted', handleDocumentDeleted);
    window.addEventListener('documentRestored', handleDocumentRestored);

    return () => {
      window.removeEventListener('documentDeleted', handleDocumentDeleted);
      window.removeEventListener('documentRestored', handleDocumentRestored);
    };
  }, [project?.id]);

  const handleSubmitFeedback = async (feedbackData: any) => {
    try {
      console.log('Submitting feedback:', feedbackData);
      
      const response = await apiClient.submitFeedback(feedbackData);
      
      if (response.success) {
        console.log('Feedback submitted successfully:', response.data);
        
        // Refresh feedback data first
        await loadFeedbackData();
        
        // Get updated feedback data for recalculation
        if (project?.id) {
          console.log('Refreshing documents and ratings after feedback submission...');
          
          const updatedFeedbackResponse = await apiClient.getProjectFeedback(project.id);
          console.log('Raw feedback response:', updatedFeedbackResponse);
          
          const updatedFeedback = updatedFeedbackResponse.success ? updatedFeedbackResponse.data : [];
          
          console.log('Updated feedback data:', updatedFeedback);
          
          // Refresh documents to show updated ratings
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
          const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category,
            lastGenerated: doc.lastModified,
            qualityScore: doc.qualityScore,
            feedbackCount: 0,
            averageRating: 0
          }));
          
          console.log('Document items before rating calculation:', documentItems);
          
          // Recalculate ratings with updated feedback data
          const documentsWithRatings = calculateDocumentRatings(documentItems, updatedFeedback);
          console.log('Documents with updated ratings:', documentsWithRatings);
          
          setDocuments(documentsWithRatings);
        }
        
        toast.success('Feedback submitted successfully!');
      } else {
        console.error('Failed to submit feedback:', response.error);
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleProvideFeedback = (document: DocumentItem) => {
    setSelectedDocument(document);
    setShowFeedbackModal(true);
  };

  const handleDeleteDocument = async (document: DocumentItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to move "${document.name}" to trash?\n\nYou can restore it later from the deleted documents section.`
    );
    
    if (!confirmed) return;
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Moving document to trash...');
      
      const response = await apiClient.deleteProjectDocument(document.id);
      
      if (response.success) {
        toast.dismiss(loadingToast);
        // Show success message with undo option
        const undoToast = toast.success(
          <div className="flex items-center justify-between">
            <span>"{document.name}" moved to trash!</span>
            <button
              onClick={() => {
                toast.dismiss(undoToast);
                handleRestoreDocument(document.id, document.name);
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
        
        // Reload documents from the database
        if (!project) return;
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
        const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category,
          lastGenerated: doc.lastModified,
          qualityScore: doc.qualityScore,
          feedbackCount: 0,
          averageRating: 0
        }));
        
        setDocuments(documentItems);
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
        
        // Reload documents from the database
        if (!project) return;
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
        const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category,
          lastGenerated: doc.lastModified,
          qualityScore: doc.qualityScore,
          feedbackCount: 0,
          averageRating: 0
        }));
        
        setDocuments(documentItems);
      } else {
        throw new Error(response.message || 'Failed to restore document');
      }
    } catch (error) {
      console.error('Error restoring document:', error);
      toast.dismiss();
      toast.error(`Failed to restore document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateDocuments = async (selectedTemplates: string[], newGeneratedDocuments?: GeneratedDocument[]) => {
    try {
      console.log('Generating documents for templates:', selectedTemplates);
      
      if (newGeneratedDocuments && newGeneratedDocuments.length > 0) {
        // Add new generated documents to the list
        setGeneratedDocuments(prev => [...prev, ...newGeneratedDocuments]);
        
        // Reload documents from database to get the latest state
        // This ensures we have the most up-to-date document list
        try {
          if (!project) return;
          const projectDocuments = await apiClient.getProjectDocuments(project.id);
          const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            path: `/generated-documents/${doc.category}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category,
            lastGenerated: doc.lastModified,
            qualityScore: doc.qualityScore,
            feedbackCount: 0,
            averageRating: 0
          }));
          
          setDocuments(documentItems);
        } catch (error) {
          console.error('Failed to reload documents after generation:', error);
        }
      }
      
      // Show success message
      toast.success(`Successfully generated ${selectedTemplates.length} document(s) for ${project?.name || 'the project'}`);
      
      // Switch to documents tab to show the new documents
      setActiveTab('documents');
      
    } catch (error) {
      console.error('Error generating documents:', error);
      toast.error('Failed to generate documents. Please try again.');
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProject(updatedProject);
    toast.success('Project updated successfully');
  };

  if (!project) return <div>No project data available.</div>;

  // Debug logging
  console.log('Documents state:', documents);
  console.log('Generated documents state:', generatedDocuments);
  console.log('Should show View Documents button:', (documents.length > 0 || generatedDocuments.length > 0));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                  <span>Owner: {project.owner || 'N/A'}</span>
                  <span>Status: {project.status}</span>
                  <span>Priority: {project.priority || 'Medium'}</span>
                  <span>Framework: {project.framework?.toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                  <span>Created: {new Date(project.createdAt || '').toLocaleDateString()}</span>
                  <span>Last Updated: {new Date(project.updatedAt || '').toLocaleDateString()}</span>
                  {project.budget && (
                    <span>Budget: {project.currency || 'USD'} {project.budget.toLocaleString()}</span>
                  )}
                  {project.startDate && project.endDate && (
                    <span>Duration: {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                  )}
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-sm text-gray-500">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowEditProjectModal(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Project</span>
                </button>
                {(documents.length > 0 || generatedDocuments.length > 0) && (
                  <button 
                    onClick={() => setShowDocumentViewer(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Documents
                  </button>
                )}
                <button 
                  onClick={() => setShowDocumentGenerationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Documents
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Export Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Quality</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.length > 0 
                        ? Math.round(documents.reduce((sum, doc) => sum + doc.qualityScore, 0) / documents.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.length > 0 
                        ? (documents.reduce((sum, doc) => sum + doc.averageRating, 0) / documents.length).toFixed(1)
                        : '0.0'}/5
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.reduce((sum, doc) => sum + doc.feedbackCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Project Charter generated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New feedback received on Risk Management Plan</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Project Documents</h2>
              <div className="flex space-x-3">
                {(documents.length > 0 || generatedDocuments.length > 0) && (
                  <button 
                    onClick={() => setShowDocumentViewer(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Documents
                  </button>
                )}
                <button 
                  onClick={() => setShowDocumentGenerationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate New Document
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {documents.map((document) => (
                <div key={document.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{document.name}</h3>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <span>Category: {document.category.toUpperCase()}</span>
                        <span>Last Generated: {new Date(document.lastGenerated).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Quality Score:</span>
                          <span className={`text-sm font-medium ${
                            document.qualityScore >= 90 ? 'text-green-600' :
                            document.qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {document.qualityScore}%
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= document.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm text-gray-600">
                              ({document.feedbackCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleProvideFeedback(document)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Feedback
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <FeedbackDashboard projectId={project.id} />
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedDocument && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedDocument(null);
          }}
          projectId={project.id}
          documentType={selectedDocument.type}
          documentPath={selectedDocument.path}
          documentTitle={selectedDocument.name}
          onSubmit={handleSubmitFeedback}
        />
      )}

      {/* Document Generation Modal */}
      {showDocumentGenerationModal && (
        <DocumentGenerationModal
          isOpen={showDocumentGenerationModal}
          onClose={() => setShowDocumentGenerationModal(false)}
          projectId={project.id}
          projectName={project.name}
          projectFramework={project.framework || 'general'}
          projectContext={project}
          existingDocuments={[
            // Convert existing documents to the format expected by the modal
            ...documents.map(doc => ({
              id: doc.id,
              name: doc.name,
              content: `# ${doc.name}\n\nThis document was previously generated and contains project information that can be used as context for new document generation.`
            })),
            ...generatedDocuments
          ]}
          onGenerate={handleGenerateDocuments}
        />
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && (
        <DocumentViewer
          isOpen={showDocumentViewer}
          onClose={() => setShowDocumentViewer(false)}
          projectId={project.id}
          projectName={project.name}
          documents={[
            // Convert mock documents to GeneratedDocument format (only if not already in generatedDocuments)
            ...documents
              .filter(doc => !generatedDocuments.some(genDoc => genDoc.id === doc.id))
              .map(doc => ({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                content: `# ${doc.name}\n\nThis is a sample document for ${doc.name}. In a real implementation, this would contain the full document content.\n\n## Overview\nThis document was generated as part of the ${project.name} project.\n\n## Details\n- Category: ${doc.category}\n- Quality Score: ${doc.qualityScore}%\n- Last Generated: ${doc.lastGenerated}\n\n---\n*This is a mock document for demonstration purposes.*`,
                category: doc.category,
                framework: project.framework || 'general',
                generatedAt: doc.lastGenerated,
                generatedBy: 'System',
                qualityScore: doc.qualityScore,
                wordCount: 50,
                tags: [doc.category, project.framework || 'general', 'sample'],
                status: 'draft' as const
              })),
            // Add generated documents
            ...generatedDocuments
          ]}
        />
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && (
        <>
          {console.log('ProjectDetails: Modal is open, passing project to EditProjectModal:', project)}
          {console.log('ProjectDetails: Project has name?', !!project?.name)}
          {console.log('ProjectDetails: Project has description?', !!project?.description)}
          {console.log('ProjectDetails: Project has owner?', !!project?.owner)}
          <EditProjectModal
            isOpen={showEditProjectModal}
            onClose={() => setShowEditProjectModal(false)}
            project={project}
            onUpdate={handleUpdateProject}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetails;
