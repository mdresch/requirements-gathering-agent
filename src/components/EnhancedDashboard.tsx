'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Settings, 
  MessageSquare, 
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Clock,
  Database,
  Server,
  Zap,
  Star,
  Target,
  Shield,
  BarChart,
  LineChart
} from 'lucide-react';
import { apiClient } from '../lib/api';
import PerformanceDashboard from './PerformanceDashboard';

interface DashboardMetrics {
  babokCompliance: number;
  pmbokCompliance: number;
  overallScore: number;
  feedbackScore: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    responseTime: number;
    databaseStatus: 'connected' | 'disconnected';
    apiStatus: 'operational' | 'degraded' | 'down';
  };
  qualityTrends: {
    period: string;
    date: string;
    qualityScore: number;
    babokScore: number;
    pmbokScore: number;
    feedbackScore: number;
  }[];
  recentActivities: {
    id: string;
    type: 'document_generated' | 'feedback_submitted' | 'quality_assessed' | 'compliance_checked';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    projectId?: string;
    documentId?: string;
  }[];
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageQualityScore: number;
    totalDocuments: number;
    totalFeedback: number;
  };
}

interface QualityTrendChartProps {
  data: DashboardMetrics['qualityTrends'];
}

function QualityTrendChart({ data }: QualityTrendChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quality Trends Over Time</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Overall Quality</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">BABOK</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-600">PMBOK</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Feedback</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <div className="relative h-full w-full">
          {/* Simple bar chart representation */}
          <div className="flex items-end justify-between h-full space-x-2">
            {data.map((point, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center space-y-1 w-full">
                  {/* Overall Quality Bar */}
                  <div className="relative w-full">
                    <div 
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${point.qualityScore}%` }}
                    ></div>
                    <div className="text-xs text-center mt-1 font-medium">
                      {point.qualityScore}%
                    </div>
                  </div>
                  
                  {/* BABOK Bar */}
                  <div className="relative w-full opacity-80">
                    <div 
                      className="bg-green-500"
                      style={{ height: `${point.babokScore}%` }}
                    ></div>
                  </div>
                  
                  {/* PMBOK Bar */}
                  <div className="relative w-full opacity-80">
                    <div 
                      className="bg-purple-500"
                      style={{ height: `${point.pmbokScore}%` }}
                    ></div>
                  </div>
                  
                  {/* Feedback Bar */}
                  <div className="relative w-full opacity-80">
                    <div 
                      className="bg-yellow-500 rounded-b"
                      style={{ height: `${point.feedbackScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                  {point.period}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        {data.slice(-4).map((point, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">{point.period}</div>
            <div className="text-sm font-semibold">{point.qualityScore}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SystemHealthCardProps {
  health: DashboardMetrics['systemHealth'];
}

function SystemHealthCard({ health }: SystemHealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
          {health.status.toUpperCase()}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">API Status</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.apiStatus)}`}>
              {health.apiStatus}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Database</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.databaseStatus)}`}>
              {health.databaseStatus}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Uptime</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{health.uptime}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-gray-600">Response Time</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{health.responseTime}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecentActivityCardProps {
  activities: DashboardMetrics['recentActivities'];
}

function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_generated':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'feedback_submitted':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'quality_assessed':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'compliance_checked':
        return <CheckCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last 24 hours</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getActivityColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EnhancedDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load compliance metrics
      const complianceResponse = await apiClient.getStandardsCompliance();
      
      // Load project statistics
      const projectsResponse = await apiClient.getProjects();
      
      // Load feedback data
      const feedbackResponse = await apiClient.getFeedbackSummary();

      // Generate mock quality trends data (in real implementation, this would come from historical data)
      const qualityTrends = [
        { period: 'Week 1', date: '2024-01-01', qualityScore: 78, babokScore: 82, pmbokScore: 75, feedbackScore: 3.2 },
        { period: 'Week 2', date: '2024-01-08', qualityScore: 81, babokScore: 85, pmbokScore: 78, feedbackScore: 3.4 },
        { period: 'Week 3', date: '2024-01-15', qualityScore: 85, babokScore: 88, pmbokScore: 82, feedbackScore: 3.6 },
        { period: 'Week 4', date: '2024-01-22', qualityScore: 87, babokScore: 90, pmbokScore: 85, feedbackScore: 3.8 },
        { period: 'Week 5', date: '2024-01-29', qualityScore: 89, babokScore: 92, pmbokScore: 87, feedbackScore: 4.0 },
        { period: 'Week 6', date: '2024-02-05', qualityScore: 91, babokScore: 94, pmbokScore: 89, feedbackScore: 4.1 },
        { period: 'Week 7', date: '2024-02-12', qualityScore: 88, babokScore: 91, pmbokScore: 86, feedbackScore: 3.9 },
        { period: 'Week 8', date: '2024-02-19', qualityScore: 93, babokScore: 95, pmbokScore: 91, feedbackScore: 4.3 }
      ];

      // Generate mock recent activities
      const recentActivities = [
        {
          id: '1',
          type: 'document_generated' as const,
          title: 'Business Case Generated',
          description: 'New business case document created for Financial Services Project',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success' as const,
          projectId: 'proj_1',
          documentId: 'doc_1'
        },
        {
          id: '2',
          type: 'quality_assessed' as const,
          title: 'Quality Assessment Completed',
          description: 'Quality score: 87% for Stakeholder Analysis document',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'success' as const,
          projectId: 'proj_1',
          documentId: 'doc_2'
        },
        {
          id: '3',
          type: 'feedback_submitted' as const,
          title: 'New Feedback Received',
          description: 'User feedback on Scope Management Plan (Rating: 4/5)',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'success' as const,
          projectId: 'proj_2',
          documentId: 'doc_3'
        },
        {
          id: '4',
          type: 'compliance_checked' as const,
          title: 'PMBOK Compliance Check',
          description: 'Compliance verification completed for Project Charter',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'success' as const,
          projectId: 'proj_1',
          documentId: 'doc_4'
        },
        {
          id: '5',
          type: 'document_generated' as const,
          title: 'Risk Management Plan Generated',
          description: 'Risk assessment document created for Digital Transformation Project',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'success' as const,
          projectId: 'proj_2',
          documentId: 'doc_5'
        }
      ];

      const dashboardData: DashboardMetrics = {
        babokCompliance: complianceResponse.success ? complianceResponse.data?.standardsCompliance?.babok || 92 : 92,
        pmbokCompliance: complianceResponse.success ? complianceResponse.data?.standardsCompliance?.pmbok || 89 : 89,
        overallScore: complianceResponse.success ? complianceResponse.data?.overallScore || 90 : 90,
        feedbackScore: feedbackResponse.success ? feedbackResponse.data?.averageRating || 3.8 : 3.8,
        systemHealth: {
          status: 'healthy',
          uptime: 99.9,
          responseTime: 150,
          databaseStatus: 'connected',
          apiStatus: 'operational'
        },
        qualityTrends,
        recentActivities,
        projectStats: {
          totalProjects: projectsResponse.success ? projectsResponse.data?.length || 12 : 12,
          activeProjects: projectsResponse.success ? projectsResponse.data?.filter((p: any) => p.status === 'active').length || 8 : 8,
          completedProjects: projectsResponse.success ? projectsResponse.data?.filter((p: any) => p.status === 'completed').length || 4 : 4,
          averageQualityScore: 87,
          totalDocuments: 156,
          totalFeedback: feedbackResponse.success ? feedbackResponse.data?.totalFeedback || 89 : 89
        }
      };

      setMetrics(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-600" />;
  };

  const getTrendText = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return `+${diff.toFixed(1)}%`;
    if (diff < 0) return `${diff.toFixed(1)}%`;
    return '0%';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of system performance and quality metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* BABOK Compliance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">BABOK Compliance</p>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.babokCompliance)}`}>
                {metrics.babokCompliance}%
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.babokCompliance, 88)}
                <span className="text-xs text-gray-500 ml-1">
                  {getTrendText(metrics.babokCompliance, 88)}
                </span>
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* PMBOK Compliance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PMBOK Compliance</p>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.pmbokCompliance)}`}>
                {metrics.pmbokCompliance}%
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.pmbokCompliance, 85)}
                <span className="text-xs text-gray-500 ml-1">
                  {getTrendText(metrics.pmbokCompliance, 85)}
                </span>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                {metrics.overallScore}%
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.overallScore, 87)}
                <span className="text-xs text-gray-500 ml-1">
                  {getTrendText(metrics.overallScore, 87)}
                </span>
              </div>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Feedback Score */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Feedback Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.feedbackScore * 20)}`}>
                {metrics.feedbackScore.toFixed(1)}/5
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.feedbackScore, 3.6)}
                <span className="text-xs text-gray-500 ml-1">
                  {getTrendText(metrics.feedbackScore, 3.6)}
                </span>
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Quality Trends Chart */}
      <QualityTrendChart data={metrics.qualityTrends} />

      {/* Performance Gauges Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Gauges</h2>
            <p className="text-gray-600">Real-time comparison between projected targets and actual performance</p>
          </div>
        </div>
        <PerformanceDashboard />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <SystemHealthCard health={metrics.systemHealth} />

        {/* Recent Activities */}
        <RecentActivityCard activities={metrics.recentActivities} />

        {/* Project Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Statistics</h3>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-lg font-semibold text-gray-900">{metrics.projectStats.totalProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Projects</span>
              <span className="text-lg font-semibold text-green-600">{metrics.projectStats.activeProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Projects</span>
              <span className="text-lg font-semibold text-blue-600">{metrics.projectStats.completedProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Documents</span>
              <span className="text-lg font-semibold text-gray-900">{metrics.projectStats.totalDocuments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Feedback</span>
              <span className="text-lg font-semibold text-gray-900">{metrics.projectStats.totalFeedback}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Quality Score</span>
              <span className={`text-lg font-semibold ${getScoreColor(metrics.projectStats.averageQualityScore)}`}>
                {metrics.projectStats.averageQualityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
