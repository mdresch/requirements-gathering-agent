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
  Trash2,
  Award,
  Users,
  Cpu
} from 'lucide-react';
import type { Project } from '../types/project';
import FeedbackModal from './FeedbackModal';
import FeedbackDashboard from './FeedbackDashboard';
import DocumentGenerationModal from './DocumentGenerationModal';
import DocumentViewer from './DocumentViewer';
import EditProjectModal from './EditProjectModal';
import QualityReportModal from './QualityReportModal';
import StakeholderManagement from './StakeholderManagement';
import ContextUtilizationModal from './ContextUtilizationModal';
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
  content?: string;
  metadata?: {
    templateId?: string;
    contextMetrics?: {
      inputTokens: number;
      systemPromptTokens: number;
      userPromptTokens: number;
      projectContextTokens: number;
      templateTokens: number;
      outputTokens: number;
      responseTokens: number;
      totalTokensUsed: number;
      contextWindowSize: number;
      contextUtilizationPercentage: number;
      provider: string;
      model: string;
      generatedAt: Date;
      processingTimeMs: number;
    };
  };
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
  status: 'draft' | 'review' | 'approved' | 'published' | 'deleted';
  deletedAt?: string;
}

// Helper function to get time ago string
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
};

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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'stakeholders' | 'feedback'>('overview');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDocumentGenerationModal, setShowDocumentGenerationModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [selectedDocumentForViewing, setSelectedDocumentForViewing] = useState<GeneratedDocument | null>(null);
  const [showQualityScoreModal, setShowQualityScoreModal] = useState(false);
  const [selectedDocumentForQuality, setSelectedDocumentForQuality] = useState<DocumentItem | null>(null);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [showContextUtilization, setShowContextUtilization] = useState(false);
  const [selectedDocumentForContext, setSelectedDocumentForContext] = useState<DocumentItem | null>(null);
  
  // Document pagination state
  const [documentCurrentPage, setDocumentCurrentPage] = useState(1);
  const [documentsPerPage] = useState(6);

  // Load feedback data for the project
  const loadFeedbackData = useCallback(async () => {
    if (!project?.id) return;
    
    try {
      console.log('Loading feedback data for project:', project.id);
      const response = await apiClient.getProjectFeedback(project.id);
      
      console.log('Raw feedback response in loadFeedbackData:', response);
      
      if (response.success && response.data) {
        // The API returns feedback in response.data.feedback
        const feedbackArray = response.data.feedback || response.data;
        setFeedbackData(feedbackArray);
        console.log('Loaded feedback data:', feedbackArray);
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
    console.log('Documents count:', documents.length);
    console.log('Feedback count:', feedback.length);
    
    const result = documents.map(doc => {
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
      
      // Keep quality score separate from feedback rating
      // Quality score comes from database quality assessment
      // Average rating comes from user feedback
      return {
        ...doc,
        feedbackCount,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        // qualityScore remains as is from the database
      };
    });
    
    console.log('Calculated document ratings result:', result);
    return result;
  }, []);

  // Load documents and calculate ratings when both project and feedback data are available
  useEffect(() => {
    const loadDocumentsWithRatings = async () => {
      try {
        if (!project?.id) return;
        
        console.log('Loading documents and calculating ratings for project:', project.id);
        console.log('Feedback data available:', feedbackData.length, 'items');
        
        const projectDocuments = await apiClient.getProjectDocuments(project.id);
        console.log('Loaded project documents:', projectDocuments);
        
        // Convert ProjectDocument format to DocumentItem format
        const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
          id: doc.id || doc._id || 'unknown-id',
          name: doc.name || 'Unnamed Document',
          type: doc.type || 'unknown',
          path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category || 'General',
          lastGenerated: doc.lastModified || doc.generatedAt,
          qualityScore: doc.qualityScore || 0,
          feedbackCount: 0, // Will be calculated from feedback data
          averageRating: 0, // Will be calculated from feedback data
          content: doc.content || '', // Include the actual document content
          metadata: doc.metadata || {} // Preserve metadata for dependency validation
        }));
        
        // Calculate ratings from feedback data
        console.log('About to calculate ratings with', documentItems.length, 'documents and', feedbackData.length, 'feedback items');
        const documentsWithRatings = calculateDocumentRatings(documentItems, feedbackData);
        console.log('Calculated ratings result:', documentsWithRatings);
        setDocuments(documentsWithRatings);
        console.log('✅ Documents loaded and ratings calculated successfully');
      } catch (error) {
        console.error('Failed to load project documents:', error);
        setDocuments([]);
      }
    };
    
    if (project?.id) {
      loadDocumentsWithRatings();
    }
  }, [project?.id, calculateDocumentRatings, feedbackData]);

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
            id: doc.id || doc._id || 'unknown-id',
            name: doc.name || 'Unnamed Document',
            type: doc.type || 'unknown',
            path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category || 'General',
            lastGenerated: doc.lastModified || doc.generatedAt,
            qualityScore: doc.qualityScore || 0,
            feedbackCount: 0,
            averageRating: 0,
            content: doc.content || ''
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
            id: doc.id || doc._id || 'unknown-id',
            name: doc.name || 'Unnamed Document',
            type: doc.type || 'unknown',
            path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category || 'General',
            lastGenerated: doc.lastModified || doc.generatedAt,
            qualityScore: doc.qualityScore || 0,
            feedbackCount: 0,
            averageRating: 0,
            content: doc.content || ''
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
            id: doc.id || doc._id || 'unknown-id',
            name: doc.name || 'Unnamed Document',
            type: doc.type || 'unknown',
            path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category || 'General',
            lastGenerated: doc.lastModified || doc.generatedAt,
            qualityScore: doc.qualityScore || 0,
            feedbackCount: 0,
            averageRating: 0,
            content: doc.content || ''
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

  const handleShowQualityScore = (document: DocumentItem) => {
    setSelectedDocumentForQuality(document);
    setShowQualityScoreModal(true);
  };

  const handleShowContextUtilization = (document: DocumentItem) => {
    setSelectedDocumentForContext(document);
    setShowContextUtilization(true);
  };

  // Document pagination handlers
  const handleDocumentPageChange = (page: number) => {
    setDocumentCurrentPage(page);
  };

  const handleDocumentPreviousPage = () => {
    setDocumentCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleDocumentNextPage = () => {
    const totalPages = Math.ceil(documents.length / documentsPerPage);
    setDocumentCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Calculate paginated documents
  const getPaginatedDocuments = () => {
    const startIndex = (documentCurrentPage - 1) * documentsPerPage;
    const endIndex = startIndex + documentsPerPage;
    return documents.slice(startIndex, endIndex);
  };

  const totalDocumentPages = Math.ceil(documents.length / documentsPerPage);

  // Reset document pagination when documents change
  useEffect(() => {
    setDocumentCurrentPage(1);
  }, [documents.length]);

  const handleViewDocument = async (document: DocumentItem) => {
    try {
      // Show loading state
      const loadingToast = toast.loading('Loading document content...');
      
      // Fetch actual document content from database
      const response = await apiClient.getDocumentById(document.id);
      
      toast.dismiss(loadingToast);
      
      if (response.success && response.data) {
        // Convert DocumentItem to GeneratedDocument format for the DocumentViewer
        const generatedDoc: GeneratedDocument = {
          id: document.id,
          name: document.name,
          type: document.type,
          content: response.data.content || `# ${document.name}\n\nThis document was generated as part of the ${project?.name || 'Unknown'} project.\n\n## Details\n- Category: ${document.category}\n- Quality Score: ${document.qualityScore}%\n- Last Generated: ${document.lastGenerated}\n\n---\n*Document content not available.*`,
          category: document.category,
          framework: project?.framework || 'general',
          generatedAt: document.lastGenerated,
          generatedBy: response.data.generatedBy || 'System',
          qualityScore: document.qualityScore,
          wordCount: response.data.content ? response.data.content.split(' ').length : 0,
          tags: [document.category],
          status: response.data.status || 'published'
        };
        
        setSelectedDocumentForViewing(generatedDoc);
        setShowDocumentViewer(true);
        
        toast.success('Document loaded successfully');
      } else {
        toast.error('Failed to load document content');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document content');
    }
  };

  const handleDownloadDocument = async (doc: DocumentItem) => {
    try {
      // Show loading state
      const loadingToast = toast.loading('Preparing download...');
      
      // Fetch actual document content from database
      const response = await apiClient.getDocumentById(doc.id);
      
      toast.dismiss(loadingToast);
      
      let documentContent = doc.content;
      
      if (response.success && response.data && response.data.content) {
        documentContent = response.data.content;
      } else {
        documentContent = `# ${doc.name}\n\nThis document was generated as part of the ${project?.name || 'Unknown'} project.\n\n## Details\n- Category: ${doc.category}\n- Quality Score: ${doc.qualityScore}%\n- Last Generated: ${doc.lastGenerated}\n\n---\n*Document content not available.*`;
      }
      
      // Create and trigger download
      const element = document.createElement('a');
      const file = new Blob([documentContent || ''], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `${doc.name}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Show success toast
      toast.success(`Downloaded ${doc.name}`);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
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
          id: doc.id || doc._id || 'unknown-id',
          name: doc.name || 'Unnamed Document',
          type: doc.type || 'unknown',
          path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category || 'General',
          lastGenerated: doc.lastModified || doc.generatedAt,
          qualityScore: doc.qualityScore || 0,
          feedbackCount: 0,
          averageRating: 0,
          content: doc.content || ''
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
          id: doc.id || doc._id || 'unknown-id',
          name: doc.name || 'Unnamed Document',
          type: doc.type || 'unknown',
          path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category || 'General',
          lastGenerated: doc.lastModified || doc.generatedAt,
          qualityScore: doc.qualityScore || 0,
          feedbackCount: 0,
          averageRating: 0,
          content: doc.content || ''
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
            id: doc.id || doc._id || 'unknown-id',
            name: doc.name || 'Unnamed Document',
            type: doc.type || 'unknown',
            path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
            category: doc.category || 'General',
            lastGenerated: doc.lastModified || doc.generatedAt,
            qualityScore: doc.qualityScore || 0,
            feedbackCount: 0,
            averageRating: 0,
            content: doc.content || ''
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

  const handleSingleDocumentGenerated = async (generatedDocument: GeneratedDocument) => {
    try {
      console.log('Single document generated:', generatedDocument);
      
      // Add the generated document to the list
      setGeneratedDocuments(prev => [...prev, generatedDocument]);
      
      // Reload documents from database to get the latest state
      try {
        if (!project) return;
        console.log('🔄 Reloading documents for project:', project.id);
        const projectDocuments = await apiClient.getProjectDocuments(project.id);
        const documentItems: DocumentItem[] = projectDocuments.map((doc: any) => ({
          id: doc.id || doc._id || 'unknown-id',
          name: doc.name || 'Unnamed Document',
          type: doc.type || 'unknown',
          path: `/generated-documents/${doc.category || 'general'}/${(doc.name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.md`,
          category: doc.category || 'General',
          lastGenerated: doc.lastModified || doc.generatedAt,
          qualityScore: doc.qualityScore || 0,
          feedbackCount: 0,
          averageRating: 0,
          content: doc.content || ''
        }));
        
        setDocuments(documentItems);
        console.log('✅ Documents reloaded successfully after generation');
        toast.success('Document added to project successfully!');
      } catch (error: any) {
        console.error('❌ Error reloading documents from database:', error);
        
        // Show specific error message based on error type
        if (error.message?.includes('Database connection error')) {
          toast.error('Database connection error. Please refresh the page to see the new document.');
        } else if (error.message?.includes('Invalid request parameters')) {
          toast.error('Invalid project ID. Please refresh the page.');
        } else if (error.message?.includes('Internal server error')) {
          toast.error('Server error occurred. Please refresh the page to see the new document.');
        } else {
          toast.error('Document generated but failed to refresh document list. Please refresh the page.');
        }
      }
      
      // Switch to documents tab
      setActiveTab('documents');
      
      // Open the DocumentViewer with the specific document selected
      setSelectedDocumentForViewing(generatedDocument);
      setShowDocumentViewer(true);
      
    } catch (error: any) {
      console.error('Error handling single document generation:', error);
      toast.error('Failed to handle generated document: ' + (error.message || 'Unknown error'));
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
  console.log('Documents length:', documents.length);
  console.log('Generated documents length:', generatedDocuments.length);

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
              { id: 'stakeholders', label: 'Stakeholders', icon: Users },
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
                    <p className="text-sm font-medium text-gray-600">Avg User Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbackData.length > 0 
                        ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
                        : '0.0'}/5
                    </p>
                    <p className="text-xs text-gray-500">
                      {feedbackData.length} reviews across {documents.filter(doc => doc.feedbackCount > 0).length} documents
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
                    <p className="text-xs text-gray-500">
                      Across {documents.filter(doc => doc.feedbackCount > 0).length} documents
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Scores Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Quality Scores Breakdown
                </h2>
                <div className="space-y-4">
                  {documents.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.category}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${
                                  doc.qualityScore >= 90 ? 'text-green-600' :
                                  doc.qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {doc.qualityScore}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.qualityScore >= 90 ? 'Excellent' :
                                   doc.qualityScore >= 80 ? 'Good' :
                                   doc.qualityScore >= 70 ? 'Acceptable' :
                                   doc.qualityScore >= 60 ? 'Needs Work' : 'Poor'}
                                </p>
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    doc.qualityScore >= 90 ? 'bg-green-500' :
                                    doc.qualityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${doc.qualityScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {documents.filter(doc => doc.qualityScore >= 90).length}
                            </p>
                            <p className="text-xs text-gray-500">Excellent (90%+)</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-yellow-600">
                              {documents.filter(doc => doc.qualityScore >= 70 && doc.qualityScore < 90).length}
                            </p>
                            <p className="text-xs text-gray-500">Good (70-89%)</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-600">
                              {documents.filter(doc => doc.qualityScore < 70).length}
                            </p>
                            <p className="text-xs text-gray-500">Needs Work (&lt;70%)</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No documents available</p>
                  )}
                </div>
              </div>

              {/* User Reviews Dynamics */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  User Reviews Dynamics
                </h2>
                <div className="space-y-4">
                  {feedbackData.length > 0 ? (
                    <>
                      {/* Rating Distribution */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Rating Distribution</h3>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = feedbackData.filter(f => f.rating === rating).length;
                            const percentage = feedbackData.length > 0 ? (count / feedbackData.length) * 100 : 0;
                            return (
                              <div key={rating} className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1 w-8">
                                  <Star className={`w-3 h-3 ${rating <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                  <span className="text-xs text-gray-600">{rating}</span>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recent Reviews */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Reviews</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {feedbackData
                            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                            .slice(0, 5)
                            .map((feedback, index) => (
                              <div key={feedback._id || index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-3 h-3 ${
                                            star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600">{feedback.rating}/5</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(feedback.submittedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 font-medium truncate">{feedback.title}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {feedback.documentType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Feedback Summary */}
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {feedbackData.length}
                            </p>
                            <p className="text-xs text-gray-500">Total Reviews</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {(feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500">Average Rating</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No user reviews available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {(() => {
                  // Create activity items from documents and feedback
                  const activities: Array<{
                    id: string;
                    type: string;
                    title: string;
                    subtitle: string;
                    time: string;
                    rating?: number;
                    icon: any;
                    iconColor: string;
                    bgColor: string;
                  }> = [];
                  
                  // Add document generation activities
                  documents.forEach(doc => {
                    const lastGenerated = new Date(doc.lastGenerated);
                    const timeAgo = getTimeAgo(lastGenerated);
                    activities.push({
                      id: `doc-${doc.id}`,
                      type: 'document',
                      title: `${doc.name} generated`,
                      subtitle: `${doc.category} document`,
                      time: timeAgo,
                      icon: FileText,
                      iconColor: 'text-green-600',
                      bgColor: 'bg-green-100'
                    });
                  });
                  
                  // Add feedback activities
                  feedbackData.forEach(feedback => {
                    const submittedAt = new Date(feedback.submittedAt);
                    const timeAgo = getTimeAgo(submittedAt);
                    activities.push({
                      id: `feedback-${feedback._id}`,
                      type: 'feedback',
                      title: `New feedback received`,
                      subtitle: `${feedback.title} on ${feedback.documentType.replace('-', ' ')}`,
                      time: timeAgo,
                      rating: feedback.rating,
                      icon: MessageSquare,
                      iconColor: 'text-blue-600',
                      bgColor: 'bg-blue-100'
                    });
                  });
                  
                  // Sort by date (most recent first) and take first 6
                  const recentActivities = activities
                    .sort((a, b) => {
                      const dateA = a.type === 'document' 
                        ? new Date(documents.find(d => d.id === a.id.replace('doc-', ''))?.lastGenerated || 0)
                        : new Date(feedbackData.find(f => f._id === a.id.replace('feedback-', ''))?.submittedAt || 0);
                      const dateB = b.type === 'document'
                        ? new Date(documents.find(d => d.id === b.id.replace('doc-', ''))?.lastGenerated || 0)
                        : new Date(feedbackData.find(f => f._id === b.id.replace('feedback-', ''))?.submittedAt || 0);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 6);
                  
                  if (recentActivities.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    );
                  }
                  
                  return recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className={`p-2 ${activity.bgColor} rounded-full`}>
                          <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            {activity.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{activity.rating}/5</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{activity.subtitle}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
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
              {getPaginatedDocuments().map((document) => (
                <div key={document.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{document.name}</h3>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <span>Category: {document.category.toUpperCase()}</span>
                        <span>Last Generated: {new Date(document.lastGenerated).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Quality Score:</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            document.qualityScore >= 90 ? 'bg-green-100 text-green-800' :
                            document.qualityScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {document.qualityScore}%
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">User Rating:</span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= document.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className={`ml-2 text-sm font-medium ${
                              document.averageRating >= 4 ? 'text-green-600' :
                              document.averageRating >= 3 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {document.averageRating > 0 ? document.averageRating.toFixed(1) : 'No rating'}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">
                              ({document.feedbackCount} review{document.feedbackCount !== 1 ? 's' : ''})
                            </span>
                          </div>
                        </div>
                        
                        {document.feedbackCount > 0 && (
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              {document.feedbackCount} feedback{document.feedbackCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShowQualityScore(document)}
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Quality Score"
                      >
                        <Award className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShowContextUtilization(document)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Context Utilization"
                      >
                        <Cpu className="w-5 h-5" />
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

            {/* Document Pagination Controls */}
            {totalDocumentPages > 1 && (
              <div className="flex justify-center items-center space-x-4 py-6">
                <button
                  onClick={handleDocumentPreviousPage}
                  disabled={documentCurrentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalDocumentPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalDocumentPages - 4, documentCurrentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleDocumentPageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pageNum === documentCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleDocumentNextPage}
                  disabled={documentCurrentPage === totalDocumentPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                
                <div className="text-sm text-gray-600 ml-4">
                  Page {documentCurrentPage} of {totalDocumentPages} ({documents.length} total documents)
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stakeholders' && (
          <StakeholderManagement projectId={project.id} projectName={project.name} />
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
              id: doc.id || 'unknown-id',
              name: doc.name || 'Unnamed Document',
              templateId: doc.metadata?.templateId || doc.type, // Use templateId from metadata or type as fallback
              content: doc.content || `# ${doc.name}\n\nThis document was previously generated and contains project information that can be used as context for new document generation.`
            })),
            ...generatedDocuments
          ]}
          onGenerate={handleGenerateDocuments}
          onDocumentGenerated={handleSingleDocumentGenerated}
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
            // Convert documents to GeneratedDocument format (only if not already in generatedDocuments)
            ...documents
              .filter(doc => !generatedDocuments.some(genDoc => genDoc.id === doc.id))
              .map(doc => ({
                id: doc.id || 'unknown-id',
                name: doc.name || 'Unnamed Document',
                type: doc.type || 'unknown',
                content: doc.content || `# ${doc.name}\n\nThis document was generated as part of the ${project.name} project.\n\n## Details\n- Category: ${doc.category}\n- Quality Score: ${doc.qualityScore}%\n- Last Generated: ${doc.lastGenerated}\n\n---\n*Document content not available.*`,
                category: doc.category || 'General',
                framework: project.framework || 'general',
                generatedAt: doc.lastGenerated,
                generatedBy: 'System',
                qualityScore: doc.qualityScore || 0,
                wordCount: doc.content ? doc.content.split(' ').length : 50,
                tags: [doc.category, project.framework || 'general', 'sample'],
                status: 'draft' as const
              })),
            // Add generated documents
            ...generatedDocuments
          ]}
          onDocumentSelect={(document) => {
            setSelectedDocumentForViewing(document);
          }}
          selectedDocument={selectedDocumentForViewing}
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

      {/* Quality Score Modal */}
      {showQualityScoreModal && selectedDocumentForQuality && (
        <QualityReportModal
          isOpen={showQualityScoreModal}
          onClose={() => {
            setShowQualityScoreModal(false);
            setSelectedDocumentForQuality(null);
          }}
          documentId={selectedDocumentForQuality.id}
          documentName={selectedDocumentForQuality.name}
          documentType={selectedDocumentForQuality.type}
        />
      )}

      {/* Context Utilization Modal */}
      {showContextUtilization && selectedDocumentForContext && (
        <ContextUtilizationModal
          isOpen={showContextUtilization}
          onClose={() => {
            setShowContextUtilization(false);
            setSelectedDocumentForContext(null);
          }}
          document={selectedDocumentForContext}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
