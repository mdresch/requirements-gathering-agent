// Feedback Dashboard Component
// filepath: admin-interface/src/components/FeedbackDashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Star,
  Filter,
  Search,
  BarChart3,
  Users,
  FileText,
  Lightbulb
} from 'lucide-react';
import { apiClient } from '../lib/api';
import FeedbackDetailModal from './FeedbackDetailModal';

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

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  openFeedback: number;
  criticalFeedback: number;
  recentFeedback: FeedbackItem[];
}

interface FeedbackDashboardProps {
  projectId?: string;
}

export default function FeedbackDashboard({ projectId }: FeedbackDashboardProps) {
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    averageRating: 0,
    openFeedback: 0,
    criticalFeedback: 0,
    recentFeedback: []
  });
  
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    feedbackType: 'all',
    search: ''
  });

  // Load real feedback data
  useEffect(() => {
    const loadFeedbackData = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading feedback data for project:', projectId);
        
        // Load feedback data from API
        const response = await apiClient.getProjectFeedback(projectId);
        
        if (response.success && response.data) {
          const feedbackData = response.data.feedback || response.data;
          console.log('Raw feedback data from API:', feedbackData);
          
          // Calculate stats from real data
          const totalFeedback = feedbackData.length;
          const averageRating = totalFeedback > 0 
            ? feedbackData.reduce((sum: number, item: any) => sum + item.rating, 0) / totalFeedback
            : 0;
          const openFeedback = feedbackData.filter((item: any) => item.status === 'open').length;
          const criticalFeedback = feedbackData.filter((item: any) => item.priority === 'critical').length;
          
          // Get recent feedback (last 5 items)
          const recentFeedback = feedbackData
            .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
            .slice(0, 5)
            .map((item: any) => ({
              id: item._id || item.id,
              title: item.title,
              rating: item.rating,
              status: item.status,
              priority: item.priority,
              feedbackType: item.feedbackType,
              submittedAt: item.submittedAt,
              submittedByName: item.submittedByName,
            documentType: item.documentType,
            submittedBy: item.submittedBy,
            description: item.description,
            suggestedImprovement: item.suggestedImprovement,
            tags: item.tags || [],
            category: item.category,
            documentPath: item.documentPath
            }));

          const stats: FeedbackStats = {
            totalFeedback,
            averageRating: Math.round(averageRating * 10) / 10,
            openFeedback,
            criticalFeedback,
            recentFeedback
          };

          // Transform feedback data to match interface
          const transformedFeedback: FeedbackItem[] = feedbackData.map((item: any) => ({
            id: item._id || item.id,
            title: item.title,
            description: item.description,
            rating: item.rating,
            status: item.status,
            priority: item.priority,
            feedbackType: item.feedbackType,
            submittedAt: item.submittedAt,
            submittedByName: item.submittedByName,
            documentType: item.documentType,
            submittedBy: item.submittedBy,
            tags: item.tags || [],
            suggestedImprovement: item.suggestedImprovement,
            category: item.category,
            documentPath: item.documentPath
          }));

          setStats(stats);
          setFeedback(transformedFeedback);
          console.log('Loaded feedback data:', { stats, feedback: transformedFeedback });
          console.log('Feedback array length:', transformedFeedback.length);
        } else {
          console.warn('No feedback data found for project');
          setStats({
            totalFeedback: 0,
            averageRating: 0,
            openFeedback: 0,
            criticalFeedback: 0,
            recentFeedback: []
          });
          setFeedback([]);
        }
      } catch (error) {
        console.error('Failed to load feedback data:', error);
        setStats({
          totalFeedback: 0,
          averageRating: 0,
          openFeedback: 0,
          criticalFeedback: 0,
          recentFeedback: []
        });
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackData();
  }, [projectId]);

  // Fallback to mock data if no projectId (for testing)
  useEffect(() => {
    if (!projectId) {
      // Simulate API call
      setTimeout(() => {
      const mockStats: FeedbackStats = {
        totalFeedback: 47,
        averageRating: 3.8,
        openFeedback: 12,
        criticalFeedback: 3,
        recentFeedback: [
          {
            id: '1',
            title: 'Project Charter missing stakeholder analysis',
            documentType: 'project-charter',
            feedbackType: 'completeness',
            rating: 2,
            priority: 'high',
            status: 'open',
            submittedBy: 'pm1',
            submittedByName: 'Sarah Johnson',
            submittedAt: '2025-01-13T10:30:00Z',
            description: 'The project charter lacks a comprehensive stakeholder analysis section.',
            suggestedImprovement: 'Add a detailed stakeholder analysis with power/interest grid.'
          },
          {
            id: '2',
            title: 'Risk register needs more detailed mitigation strategies',
            documentType: 'risk-register',
            feedbackType: 'quality',
            rating: 3,
            priority: 'medium',
            status: 'in-review',
            submittedBy: 'pm2',
            submittedByName: 'Mike Chen',
            submittedAt: '2025-01-13T09:15:00Z',
            description: 'Risk mitigation strategies are too generic and need more specificity.',
            suggestedImprovement: 'Include specific actions, owners, and timelines for each risk.'
          }
        ]
      };

      const mockFeedback: FeedbackItem[] = [
        ...mockStats.recentFeedback,
        {
          id: '3',
          title: 'Excellent stakeholder engagement plan',
          documentType: 'stakeholder-engagement-plan',
          feedbackType: 'quality',
          rating: 5,
          priority: 'low',
          status: 'closed',
          submittedBy: 'pm3',
          submittedByName: 'Lisa Wang',
          submittedAt: '2025-01-12T16:45:00Z',
          description: 'The stakeholder engagement plan is comprehensive and well-structured.',
          suggestedImprovement: ''
        }
      ];

      setStats(mockStats);
      setFeedback(mockFeedback);
      setLoading(false);
    }, 1000);
    }
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-review': return 'bg-yellow-100 text-yellow-800';
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleFeedbackClick = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFeedback(null);
  };

  const handleStatusUpdate = async (feedbackId: string, status: string, reviewerComments: string) => {
    try {
      // TODO: Implement API call to update feedback status
      console.log('Updating feedback:', { feedbackId, status, reviewerComments });
      
      // For now, just update the local state
      setFeedback(prevFeedback => 
        prevFeedback.map(item => 
          item.id === feedbackId 
            ? { ...item, status: status as any }
            : item
        )
      );

      // Update stats if needed
      const updatedStats = {
        ...stats,
        openFeedback: status === 'open' ? stats.openFeedback + 1 : stats.openFeedback - 1
      };
      setStats(updatedStats);

      // Refresh the feedback data
      if (projectId) {
        const response = await apiClient.getProjectFeedback(projectId);
        if (response.success && response.data) {
          const feedbackData = response.data.feedback || response.data;
          const transformedFeedback: FeedbackItem[] = feedbackData.map((item: any) => ({
            id: item._id || item.id,
            title: item.title,
            description: item.description,
            rating: item.rating,
            status: item.status,
            priority: item.priority,
            feedbackType: item.feedbackType,
            submittedAt: item.submittedAt,
            submittedByName: item.submittedByName,
            documentType: item.documentType,
            submittedBy: item.submittedBy,
            tags: item.tags || [],
            suggestedImprovement: item.suggestedImprovement,
            category: item.category,
            documentPath: item.documentPath
          }));
          setFeedback(transformedFeedback);
        }
      }
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      throw error;
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;
    const matchesType = filters.feedbackType === 'all' || item.feedbackType === filters.feedbackType;
    const matchesSearch = filters.search === '' || 
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage document feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openFeedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.criticalFeedback}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-review">In Review</option>
            <option value="implemented">Implemented</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.feedbackType}
            onChange={(e) => setFilters(prev => ({ ...prev, feedbackType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="quality">Quality</option>
            <option value="accuracy">Accuracy</option>
            <option value="completeness">Completeness</option>
            <option value="clarity">Clarity</option>
            <option value="compliance">Compliance</option>
            <option value="suggestion">Suggestion</option>
          </select>

          <div className="flex items-center text-gray-600">
            <Filter className="w-5 h-5 mr-2" />
            <span>{filteredFeedback.length} items</span>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <button
                    onClick={() => handleFeedbackClick(item)}
                    className="text-left group"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                      {item.title}
                    </h3>
                  </button>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {item.documentType}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {item.submittedByName}
                    </span>
                    <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Rating */}
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Priority */}
                  <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority.toUpperCase()}
                  </span>
                  
                  {/* Status */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{item.description}</p>
              
              {item.suggestedImprovement && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Suggested Improvement</p>
                      <p className="text-sm text-blue-700">{item.suggestedImprovement}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredFeedback.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.feedbackType !== 'all'
                ? 'Try adjusting your filters'
                : 'No feedback has been submitted yet'}
            </p>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        feedback={selectedFeedback}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}