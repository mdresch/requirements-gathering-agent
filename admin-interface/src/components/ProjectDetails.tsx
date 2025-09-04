'use client';

import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import type { Project } from '../types/project';
import FeedbackModal from './FeedbackModal';
import FeedbackDashboard from './FeedbackDashboard';

interface ProjectDetailsProps {
  project: Project;
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

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'feedback'>('overview');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Mock documents data
  useEffect(() => {
    const mockDocuments: DocumentItem[] = [
      {
        id: '1',
        name: 'Project Charter',
        type: 'project-charter',
        path: '/generated-documents/project-charter/project-charter.md',
        category: 'pmbok',
        lastGenerated: '2025-01-13T10:00:00Z',
        qualityScore: 85,
        feedbackCount: 3,
        averageRating: 4.2
      },
      {
        id: '2',
        name: 'Stakeholder Register',
        type: 'stakeholder-register',
        path: '/generated-documents/stakeholder-management/stakeholder-register.md',
        category: 'pmbok',
        lastGenerated: '2025-01-13T09:30:00Z',
        qualityScore: 92,
        feedbackCount: 1,
        averageRating: 5.0
      },
      {
        id: '3',
        name: 'Risk Management Plan',
        type: 'risk-management-plan',
        path: '/generated-documents/planning/risk-management-plan.md',
        category: 'pmbok',
        lastGenerated: '2025-01-13T09:15:00Z',
        qualityScore: 78,
        feedbackCount: 5,
        averageRating: 3.4
      }
    ];
    setDocuments(mockDocuments);
  }, []);

  const handleSubmitFeedback = async (feedbackData: any) => {
    // TODO: Implement API call to submit feedback
    console.log('Submitting feedback:', feedbackData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleProvideFeedback = (document: DocumentItem) => {
    setSelectedDocument(document);
    setShowFeedbackModal(true);
  };

  if (!project) return <div>No project data available.</div>;

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
                  <span>Created: {project.createdAt}</span>
                  <span>Last Updated: {project.updatedAt}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Generate New Document
              </button>
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
    </div>
  );
};

export default ProjectDetails;
